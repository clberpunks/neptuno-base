# File: backend/routers/logs.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from dependencies import get_current_user
from db import get_db
from models.models import AccessLog

router = APIRouter(prefix="/logs", tags=["logs"])

@router.get("/")
def list_logs(current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    raw = (
        db.query(AccessLog)
          .filter(AccessLog.tenant_id == current_user.id)
          .order_by(AccessLog.timestamp.desc())
          .limit(100)
          .all()
    )
    return [
        {
            "id": r.id,
            "timestamp": r.timestamp,
            "ip_address": r.ip_address,
            "user_agent": r.user_agent,
            "referrer": r.referrer,
            "accept_language": r.accept_language,
            "sec_ch_ua": r.sec_ch_ua,
            "sec_ch_ua_mobile": r.sec_ch_ua_mobile,
            "sec_ch_ua_platform": r.sec_ch_ua_platform,
            "utm_source": r.utm_source,
            "fingerprint": r.fingerprint,
            "path": r.path,
            "outcome": r.outcome,
            "rule": r.rule,
            "redirect_url": r.redirect_url,
            "js_executed": r.js_executed,
        }
        for r in raw
    ]

@router.get("/stats")
def stats(current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    total = db.query(AccessLog).filter(AccessLog.tenant_id == current_user.id).count()
    stats = {}
    for outcome in ["allow", "block", "limit", "ratelimit", "redirect", "flagged"]:
        count = (
            db.query(AccessLog)
              .filter(AccessLog.tenant_id == current_user.id, AccessLog.outcome == outcome)
              .count()
        )
        stats[outcome] = count
    stats["other"] = total - sum(stats.values())
    stats["total"] = total
    return stats