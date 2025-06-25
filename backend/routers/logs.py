# backend/routers/logs.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from dependencies import get_current_user
from db import get_db
from models.models import AccessLog

router = APIRouter(prefix="/logs", tags=["logs"])

@router.get("/")
def list_logs(current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    raw = db.query(AccessLog).filter(AccessLog.tenant_id==current_user.id)\
        .order_by(AccessLog.timestamp.desc()).limit(100).all()
    return [{
        "id": r.id,
        "timestamp": r.timestamp,
        "ip_address": r.ip_address,
        "user_agent": r.user_agent,
        "path": r.path,
        "outcome": r.outcome,
        "rule": r.rule
    } for r in raw]

@router.get("/stats")
def stats(current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    total = db.query(AccessLog).filter(AccessLog.tenant_id==current_user.id).count()
    block = db.query(AccessLog).filter(AccessLog.tenant_id==current_user.id, AccessLog.outcome=="block").count()
    limit = db.query(AccessLog).filter(AccessLog.tenant_id==current_user.id, AccessLog.outcome=="limit").count()
    allow = total - block - limit
    return {"allow": allow, "block": block, "limit": limit}
