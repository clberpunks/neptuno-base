# File: backend/routers/logs.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, case
from datetime import datetime, timedelta
from dependencies import get_current_user
from db import get_db
from models.models import AccessLog

router = APIRouter(tags=["logs"])

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

# backend/routers/logs.py (parte modificada)
@router.get("/insights")
def risk_insights(current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    now = datetime.utcnow()
    
    # Detecciones en las últimas 24 horas
    last_24h = now - timedelta(hours=24)
    detections_24h = (
        db.query(func.count(AccessLog.id))
        .filter(
            AccessLog.tenant_id == current_user.id,
            AccessLog.timestamp >= last_24h,
            AccessLog.outcome.in_(["block", "limit", "ratelimit", "redirect", "flagged"])
        )
        .scalar()
    )
    
    # Determinar nivel de riesgo basado en detecciones
    risk_level = "low"
    if detections_24h > 50:
        risk_level = "high"
    elif detections_24h > 20:
        risk_level = "medium"
    
    # Estadísticas de los últimos 7 días
    last_7d = now - timedelta(days=7)
    last_7d_stats = (
        db.query(
            func.count(AccessLog.id).label("total"),
            func.sum(case((AccessLog.outcome == "block", 1), else_=0)).label("blocked"),
            func.sum(case((AccessLog.outcome == "limit", 1), else_=0)).label("limited"),
            func.sum(case((AccessLog.outcome == "allow", 1), else_=0)).label("allowed")
        )
        .filter(AccessLog.tenant_id == current_user.id, AccessLog.timestamp >= last_7d)
        .first()
    )
    
    # Obtener todos los logs para procesar los tipos de bots en Python
    logs = (
        db.query(AccessLog.user_agent)
        .filter(
            AccessLog.tenant_id == current_user.id,
            AccessLog.timestamp >= last_7d,
            AccessLog.outcome.in_(["block", "limit", "ratelimit", "redirect", "flagged"])
        )
        .all()
    )
    
    # Procesar tipos de bots en Python
    bot_counts = {}
    for log in logs:
        # Extraer la primera parte del user_agent (normalmente el nombre del navegador/bot)
        bot_type = log.user_agent.split('/')[0].split(' ')[0] if log.user_agent else "Unknown"
        bot_counts[bot_type] = bot_counts.get(bot_type, 0) + 1
    
    # Ordenar y limitar a los 10 más comunes
    sorted_bots = sorted(bot_counts.items(), key=lambda x: x[1], reverse=True)[:10]
    by_bot_type = [{"botType": bot[0], "count": bot[1]} for bot in sorted_bots]
    
    # Nivel de protección según el plan del usuario (simulado)
    protection_level = "low"  # En producción esto vendría del perfil del usuario
    
    return {
        "last24h": {
            "detections": detections_24h,
            "riskLevel": risk_level
        },
        "last7days": {
            "totalDetected": last_7d_stats.total,
            "blocked": last_7d_stats.blocked or 0,
            "limited": last_7d_stats.limited or 0,
            "allowed": last_7d_stats.allowed or 0
        },
        "byBotType": by_bot_type,
        "protectionLevel": protection_level
    }
    now = datetime.utcnow()
    
    # Detecciones en las últimas 24 horas
    last_24h = now - timedelta(hours=24)
    detections_24h = (
        db.query(func.count(AccessLog.id))
        .filter(
            AccessLog.tenant_id == current_user.id,
            AccessLog.timestamp >= last_24h,
            AccessLog.outcome.in_(["block", "limit", "ratelimit", "redirect", "flagged"])
        )
        .scalar()
    )
    
    # Determinar nivel de riesgo basado en detecciones
    risk_level = "low"
    if detections_24h > 50:
        risk_level = "high"
    elif detections_24h > 20:
        risk_level = "medium"
    
    # Estadísticas de los últimos 7 días
    last_7d = now - timedelta(days=7)
    last_7d_stats = (
        db.query(
            func.count(AccessLog.id).label("total"),
            func.sum(case((AccessLog.outcome == "block", 1), else_=0)).label("blocked"),
            func.sum(case((AccessLog.outcome == "limit", 1), else_=0)).label("limited"),
            func.sum(case((AccessLog.outcome == "allow", 1), else_=0)).label("allowed")
        )
        .filter(AccessLog.tenant_id == current_user.id, AccessLog.timestamp >= last_7d)
        .first()
    )
    
    # Detecciones por tipo de bot (extraído de user_agent)
    bot_types = (
        db.query(
            func.substring(AccessLog.user_agent, 1, 50).label("bot_type"),
            func.count(AccessLog.id).label("count")
        )
        .filter(
            AccessLog.tenant_id == current_user.id,
            AccessLog.timestamp >= last_7d,
            AccessLog.outcome.in_(["block", "limit", "ratelimit", "redirect", "flagged"])
        )
        .group_by("bot_type")
        .order_by(func.count(AccessLog.id).desc())
        .limit(10)
        .all()
    )
    
    # Nivel de protección según el plan del usuario (simulado)
    protection_level = "low"  # En producción esto vendría del perfil del usuario
    
    return {
        "last24h": {
            "detections": detections_24h,
            "riskLevel": risk_level
        },
        "last7days": {
            "totalDetected": last_7d_stats.total,
            "blocked": last_7d_stats.blocked or 0,
            "limited": last_7d_stats.limited or 0,
            "allowed": last_7d_stats.allowed or 0
        },
        "byBotType": [{"botType": b.bot_type, "count": b.count} for b in bot_types],
        "protectionLevel": protection_level
    }