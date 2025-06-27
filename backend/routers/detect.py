# File: backend/routers/detect.py
from datetime import datetime, timezone
import re, time, io
from collections import defaultdict, deque
from fastapi import APIRouter, Request, Response
from fastapi.responses import RedirectResponse, StreamingResponse
from db import SessionLocal
from models.models import AccessLog, FirewallRule

router = APIRouter()

# 1x1 transparent PNG
EMPTY_PNG = (
    b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01'
    b'\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15\xc4'
    b'\x89\x00\x00\x00\nIDATx\x9cc`\x00\x00\x00\x02\x00'
    b'\x01\xe2!\xbc#\x00\x00\x00\x00IEND\xaeB`\x82'
)

# Rate limit settings (per minute)
IP_RATE_LIMIT = 60        # max requests per IP per minute
TENANT_RATE_LIMIT = 100000  # max requests per tenant per minute
WINDOW_SIZE = 60          # seconds

# In-memory stores for rate limiting
ip_counters = defaultdict(lambda: deque())
tenant_counters = defaultdict(lambda: deque())

# Caching firewall rules
tenant_rules_cache = {}
tenant_rules_last = defaultdict(lambda: 0)
TTL = 60  # seconds

def load_rules_from_db(tenant_id: str):
    db = SessionLocal()
    rows = db.query(FirewallRule).filter(FirewallRule.tenant_id == tenant_id).all()
    db.close()
    cfg = {"blockedAgents": [], "limitedAgents": {}, "redirectAgents": []}
    for r in rows:
        if r.policy == "block":
            cfg["blockedAgents"].append(r.pattern)
        elif r.policy == "restricted":
            cfg["limitedAgents"][r.pattern] = {"maxPerHour": r.limit}
        elif r.policy == "redirect":
            cfg["redirectAgents"].append({"pattern": r.pattern, "url": r.redirect_url})
    return cfg

def get_rules(tenant_id: str):
    now = time.time()
    if now - tenant_rules_last[tenant_id] > TTL:
        fetched = load_rules_from_db(tenant_id)
        if not any(fetched.values()):
            fetched = tenant_rules_cache.get("default", fetched)
        tenant_rules_cache[tenant_id] = fetched
        tenant_rules_last[tenant_id] = now
    return tenant_rules_cache[tenant_id]

# Default rules
tenant_rules_cache["default"] = {
    "blockedAgents": [r"GPTBot", r"Perplexity"],
    "limitedAgents": {r"ClaudeAI": {"maxPerHour": 5}},
    "redirectAgents": [{"pattern": r"PaywallLLM", "url": "https://example.com/paywall"}]
}

@router.get("/detect/{tenant}.png")
def detect_png(tenant: str,
               request: Request,
               noscript: str = None,
               fp: str = None,
               js: str = None):
    # Real IP detection behind proxy
    xff = request.headers.get("x-forwarded-for")
    ip = xff.split(",")[0].strip() if xff else request.client.host
    ua = request.query_params.get("ua") or request.headers.get("user-agent", "")
    
    referer = request.headers.get("referer", "")
    utm_source = (
        request.query_params.get("utm")
        or request.query_params.get("utm_source")
        or ""
    )

    # Intenta extraer utm_source del Referer si no vino directamente
    if not utm_source and "utm_source=" in referer:
        import urllib.parse as urlparse
        parsed = urlparse.urlparse(referer)
        qs = urlparse.parse_qs(parsed.query)
        utm_source = qs.get("utm_source", [""])[0]

    # Detección simple de IA en utm
    suspicious_keywords = ["gpt", "openai", "claude", "perplexity", "ai", "llm", "copilot"]
    if any(bot in utm_source.lower() for bot in suspicious_keywords):
        outcome = "flagged"
        rule_applied = f"suspicious_utm:{utm_source}"


    path = request.query_params.get("src") or request.url.path

    # Rate limiting
    now = time.time()
    # IP
    ip_deque = ip_counters[ip]
    while ip_deque and now - ip_deque[0] > WINDOW_SIZE:
        ip_deque.popleft()
    ip_deque.append(now)
    if len(ip_deque) > IP_RATE_LIMIT:
        outcome, rule_applied = "ratelimit", f"ip_rate_limit ({len(ip_deque)}/{IP_RATE_LIMIT})"
    else:
        # Tenant
        t_deque = tenant_counters[tenant]
        while t_deque and now - t_deque[0] > WINDOW_SIZE:
            t_deque.popleft()
        t_deque.append(now)
        if len(t_deque) > TENANT_RATE_LIMIT:
            outcome, rule_applied = "ratelimit", f"tenant_rate_limit ({len(t_deque)}/{TENANT_RATE_LIMIT})"
        else:
            outcome, rule_applied = "allow", None

    # Load firewall rules
    rules = get_rules(tenant)

    # Check block
    if outcome == "allow":
        for pat in rules["blockedAgents"]:
            if re.search(pat, ua):
                outcome, rule_applied = "block", f"blocked:{pat}"
                break

    # Check redirect
    if outcome == "allow":
        for r in rules["redirectAgents"]:
            if re.search(r["pattern"], ua):
                outcome, rule_applied = "redirect", f"redirect:{r['pattern']}"
                redirect_url = r["url"]
                break
    else:
        redirect_url = None

    # Check limited per hour
    if outcome == "allow" and rules["limitedAgents"]:
        for pat, cfg in rules["limitedAgents"].items():
            if re.search(pat, ua):
                db = SessionLocal()
                today = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
                used = db.query(AccessLog).filter(
                    AccessLog.tenant_id == tenant,
                    AccessLog.rule.like(f"limit:{pat}%"),
                    AccessLog.timestamp >= today
                ).count()
                db.close()
                if used >= cfg["maxPerHour"]:
                    outcome, rule_applied = "block", f"limit_exceeded:{pat} ({used}/{cfg['maxPerHour']})"
                else:
                    outcome, rule_applied = "limit", f"limit:{pat} ({used+1}/{cfg['maxPerHour']})"
                break

    # Detect JS execution
    js_executed = js == "1"

    # Save log
    db = SessionLocal()
    db.add(AccessLog(
        tenant_id=tenant,
        ip_address=ip,
        user_agent=ua,
        fingerprint=(fp or noscript or ""),
        path=path,
        outcome=outcome,
        rule=rule_applied or "none",
        redirect_url=locals().get('redirect_url'),
        js_executed=js_executed
    ))
    db.commit()
    db.close()

    # Responses
    if outcome == "block":
        return Response(status_code=401)
    if outcome == "redirect":
        return RedirectResponse(redirect_url)
    return StreamingResponse(io.BytesIO(EMPTY_PNG), media_type="image/png")
