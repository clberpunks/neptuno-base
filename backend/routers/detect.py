from datetime import datetime, timezone
import re, time, io, json
from urllib.parse import urlparse, parse_qs
from collections import defaultdict, deque
from fastapi import APIRouter, Request, Response
from fastapi.responses import RedirectResponse, StreamingResponse
from db import SessionLocal
from models.models import AccessLog, FirewallRule

router = APIRouter()

# 1×1 transparent PNG
EMPTY_PNG = (
    b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01'
    b'\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15\xc4'
    b'\x89\x00\x00\x00\nIDATx\x9cc`\x00\x00\x00\x02\x00'
    b'\x01\xe2!\xbc#\x00\x00\x00\x00IEND\xaeB`\x82'
)

# Rate limit settings
IP_RATE_LIMIT = 60
TENANT_RATE_LIMIT = 100000
WINDOW_SIZE = 60

ip_counters = defaultdict(lambda: deque())
tenant_counters = defaultdict(lambda: deque())

tenant_rules_cache = {}
tenant_rules_last = defaultdict(lambda: 0)
TTL = 60

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

# Default fallback rules
tenant_rules_cache["default"] = {
    "blockedAgents": [r"GPTBot", r"Perplexity"],
    "limitedAgents": {r"ClaudeAI": {"maxPerHour": 5}},
    "redirectAgents": [{"pattern": r"PaywallLLM", "url": "https://example.com/paywall"}]
}

def normalize_headers(headers):
    return {k.lower(): v for k, v in headers.items()}

def sanitize_domain(url: str) -> str:
    p = urlparse(url)
    host = p.netloc or p.path
    return host.lower().removeprefix("www.")

LLM_DOMAINS = {
    "chatgpt.com","claude.ai","copilot.microsoft.com",
    "chat.deepseek.com","gemini.google.com","meta.ai",
    "chat.mistral.ai","perplexity.ai"
}

def is_referral_from_llm(utm: str, referer: str) -> bool:
    if referer:
        return any(d in sanitize_domain(referer) for d in LLM_DOMAINS)
    if utm:
        return any(d in utm.lower() for d in LLM_DOMAINS)
    return False

def is_client_bot(js: str, fp: str, ua: str) -> bool:
    # No JS
    if js == "1":
        return True
    try:
        data = json.loads(fp)
    except:
        return True
    if data.get("webdriver"):
        return True
    ua_l = ua.lower()
    if "headless" in ua_l or "headless" in data.get("ua","").lower():
        return True
    brands = data.get("brands", [])
    if any("chromium" in b.lower() for b in brands) and any("not" in b.lower() and "brand" in b.lower() for b in brands):
        return True
    return False

@router.get("/detect/{tenant}.png")
def detect_png(tenant: str,
               request: Request,
               noscript: str = None,
               fp: str = None,
               js: str = None):
    headers = normalize_headers(request.headers)

    # 1) IP
    xff = headers.get("x-forwarded-for")
    ip = xff.split(",")[0].strip() if xff else request.client.host

    # 2) UA
    ua = request.query_params.get("ua") or headers.get("user-agent","")

    # 3) Referrer & UTM
    referer = headers.get("referer","")
    utm = (request.query_params.get("utm") or request.query_params.get("utm_source") or "")
    if not utm and "utm_source=" in referer:
        utm = parse_qs(urlparse(referer).query).get("utm_source",[""])[0]

    outcome = None; rule_applied = None

    # 4) Detect no-JS
    if noscript == "1":
        outcome, rule_applied = "block", "noscript"

    # 5) Referral from LLM UI
    if not outcome and is_referral_from_llm(utm, referer):
        outcome, rule_applied = "flagged", f"suspicious_referral:{utm or referer}"

    # 6) Client-side bot fingerprint
    if not outcome and is_client_bot(js or "", fp or "", ua):
        outcome, rule_applied = "block", "client_fingerprint_bot"

    path = request.query_params.get("src") or request.url.path

    # 7) Rate limiting
    now = time.time()
    dq = ip_counters[ip]
    while dq and now - dq[0] > WINDOW_SIZE:
        dq.popleft()
    dq.append(now)
    if len(dq) > IP_RATE_LIMIT:
        outcome, rule_applied = "ratelimit", f"ip_rate_limit ({len(dq)})"
    else:
        tdq = tenant_counters[tenant]
        while tdq and now - tdq[0] > WINDOW_SIZE:
            tdq.popleft()
        tdq.append(now)
        if len(tdq) > TENANT_RATE_LIMIT:
            outcome, rule_applied = "ratelimit", f"tenant_rate_limit ({len(tdq)})"
        elif outcome is None:
            outcome, rule_applied = "allow", None

    # 8) Apply firewall rules
    rules = get_rules(tenant)
    if outcome == "allow":
        for pat in rules["blockedAgents"]:
            if re.search(pat, ua):
                outcome, rule_applied = "block", f"blocked:{pat}"
                break
    if outcome == "allow":
        redirect_url = None
        for r in rules["redirectAgents"]:
            if re.search(r["pattern"], ua):
                outcome, rule_applied, redirect_url = "redirect", f"redirect:{r['pattern']}", r["url"]
                break 
    if outcome == "allow" and rules["limitedAgents"]:
        for pat, cfg in rules["limitedAgents"].items():
            if re.search(pat, ua):
                db = SessionLocal()
                today = datetime.now(timezone.utc).replace(hour=0,minute=0,second=0,microsecond=0)
                used = db.query(AccessLog).filter(
                    AccessLog.tenant_id==tenant,
                    AccessLog.rule.like(f"limit:{pat}%"),
                    AccessLog.timestamp>=today
                ).count()
                db.close()
                if used >= cfg["maxPerHour"]:
                    outcome, rule_applied = "block", f"limit_exceeded:{pat}"
                else:
                    outcome, rule_applied = "limit", f"limit:{pat}"
                break

    # 9) Log to DB
    js_executed = js == "1"
    db = SessionLocal()
    db.add(AccessLog(
        tenant_id=tenant,
        ip_address=ip,
        user_agent=ua,
        fingerprint=(fp or ""),
        path=path,
        outcome=outcome,
        rule=rule_applied or "none",
        redirect_url=locals().get('redirect_url'),
        js_executed=js_executed
    ))
    db.commit(); db.close()

    # 10) Response
    if outcome == "block":
        return Response(status_code=401)
    if outcome == "redirect":
        return RedirectResponse(redirect_url)
    return StreamingResponse(io.BytesIO(EMPTY_PNG), media_type="image/png")
