# backend/routers/detect.py
from datetime import datetime, timezone
import re, time, io
from fastapi import APIRouter, Request, Response
from fastapi.responses import RedirectResponse, StreamingResponse
from db import SessionLocal
from models.models import AccessLog, FirewallRule
from collections import defaultdict

router = APIRouter()

EMPTY_PNG = (
    b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01'
    b'\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15\xc4'
    b'\x89\x00\x00\x00\nIDATx\x9cc`\x00\x00\x00\x02\x00'
    b'\x01\xe2!\xbc\x33\x00\x00\x00\x00IEND\xaeB`\x82'
)



# Caché de reglas en memoria
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
        if not fetched["blockedAgents"] and not fetched["limitedAgents"] and not fetched["redirectAgents"]:
            fetched = tenant_rules_cache.get("default")
        tenant_rules_cache[tenant_id] = fetched
        tenant_rules_last[tenant_id] = now
    return tenant_rules_cache[tenant_id]


# Always keep a default entry to avoid KeyError
tenant_rules_cache["default"] = {
  "blockedAgents": [r"GPTBot", r"Perplexity"],
  "limitedAgents": {
    r"ClaudeAI": {"maxPerHour": 5}
  },
  "redirectAgents": [
    {"pattern": r"PaywallLLM", "url": "https://example.com/paywall"}
  ]
}


@router.get("/detect/{tenant}.png")
def detect_png(tenant: str, request: Request, noscript: str = None, fp: str = None):
    ua = request.query_params.get("ua") or request.headers.get("user-agent","")
    ip = request.client.host
    # path = request.url.path + ("?"+request.url.query if request.url.query else "")
    path = request.query_params.get("src") or request.url.path
    rules = get_rules(tenant)

    outcome, rule_applied, redirect_url = "allow", None, None

    # BLOCK
    for pat in rules["blockedAgents"]:
        if re.search(pat, ua):
            outcome, rule_applied = "block", f"blocked:{pat}"
            break

    # REDIRECT
    if outcome == "allow":
        for r in rules["redirectAgents"]:
            if re.search(r["pattern"], ua):
                outcome, rule_applied, redirect_url = "redirect", f"redirect:{r['pattern']}", r["url"]
                break

    # LIMIT
    if outcome == "allow":
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
                    outcome, rule_applied = "block", f"limit_exceeded:{pat} ({used}/{cfg['maxPerHour']})"
                else:
                    outcome, rule_applied = "limit", f"limit:{pat} ({used+1}/{cfg['maxPerHour']})"
                break

    # SAVE LOG
    db = SessionLocal()
    db.add(AccessLog(
        tenant_id=tenant,
        ip_address=ip,
        user_agent=ua,
        fingerprint=(fp or noscript or ""),
        path=path,
        outcome=outcome,
        rule=rule_applied or "none",
        redirect_url=redirect_url
    ))
    db.commit()
    db.close()

    # RESPONSES
    if outcome == "block":
        return Response(status_code=401)
    if outcome == "redirect":
        return RedirectResponse(redirect_url)
    return StreamingResponse(io.BytesIO(EMPTY_PNG), media_type="image/png")
