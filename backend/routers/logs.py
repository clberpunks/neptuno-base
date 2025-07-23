# File: backend/routers/logs.py
from schemas.schemas import AdvancedInsightsOut
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, case
from datetime import datetime, timedelta
from dependencies import get_current_user
from db import get_db
from models.models import AccessLog

router = APIRouter(tags=["logs"])


@router.get("/")
def list_logs(  range: str = None, 
                page: int = 1,
                limit: int = 1000,
                current_user=Depends(get_current_user),
                db: Session = Depends(get_db)):
    # Calculate time cutoff
    cutoff = datetime.utcnow()
    if range == "24h":
        cutoff -= timedelta(hours=24)
    elif range == "7d":
        cutoff -= timedelta(days=7)
    elif range == "15d":
        cutoff -= timedelta(days=15)
    elif range == "1m":
        cutoff -= timedelta(days=30)
    elif range == "6m":
        cutoff -= timedelta(days=180)
    elif range == "1y":
        cutoff -= timedelta(days=365)
    
    query = db.query(AccessLog).filter(
        AccessLog.tenant_id == current_user.id,
        AccessLog.timestamp >= cutoff
    )
    offset = (page - 1) * limit
    total = db.query(AccessLog).filter(
        AccessLog.tenant_id == current_user.id).count()

    raw = (db.query(AccessLog).filter(
        AccessLog.tenant_id == current_user.id).order_by(
            AccessLog.timestamp.desc()).offset(offset).limit(limit).all())
    return [{
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
    } for r in raw]


@router.post("/mark-seen")
def mark_logs_as_seen(db: Session = Depends(get_db),
                      user=Depends(get_current_user)):
    db.query(AccessLog).filter_by(tenant_id=user.id,
                                  seen=False).update({"seen": True})
    db.commit()
    return {"status": "ok"}


@router.get("/unseen")
def unseen_logs_count(db: Session = Depends(get_db),
                      user=Depends(get_current_user)):
    count = db.query(AccessLog).filter_by(tenant_id=user.id,
                                          seen=False).count()
    return {"unseen": count}


# backend/routers/logs.py (modificado)
@router.get("/stats")
def get_firewall_stats(range: str = None,
    db: Session = Depends(get_db)
    ):
    cutoff = datetime.utcnow()
    query = db.query(AccessLog)
    if range == "24h":
        cutoff -= timedelta(hours=24)
    elif range == "7d":
        cutoff -= timedelta(days=7)
    elif range == "15d":
        cutoff -= timedelta(days=15)
    elif range == "1m":
        cutoff -= timedelta(days=30)
    elif range == "6m":
        cutoff -= timedelta(days=180)
    elif range == "1y":
        cutoff -= timedelta(days=365)
    
    # Obtener estadísticas globales (sin filtrar por tenant_id)
    total = db.query(AccessLog).count()
    stats = {}
    for outcome in [
            "allow", "block", "limit", "ratelimit", "redirect", "flagged"
    ]:
        count = (db.query(AccessLog).filter(
            AccessLog.outcome == outcome).count())
        stats[outcome] = count
    stats["other"] = total - sum(stats.values())
    stats["total"] = total
    return stats


@router.get("/stats/user")
def get_user_firewall_stats(current_user=Depends(get_current_user),
                            db: Session = Depends(get_db)):
    # Mantenemos el endpoint anterior para estadísticas por usuario
    total = db.query(AccessLog).filter(
        AccessLog.tenant_id == current_user.id).count()
    stats = {}
    for outcome in [
            "allow", "block", "limit", "ratelimit", "redirect", "flagged"
    ]:
        count = (db.query(AccessLog).filter(
            AccessLog.tenant_id == current_user.id,
            AccessLog.outcome == outcome).count())
        stats[outcome] = count
    stats["other"] = total - sum(stats.values())
    stats["total"] = total
    return stats


# backend/routers/logs.py (parte modificada)
@router.get("/insights")
def risk_insights(current_user=Depends(get_current_user),
                  db: Session = Depends(get_db)):
    now = datetime.utcnow()

    # Detecciones en las últimas 24 horas
    last_24h = now - timedelta(hours=24)
    detections_24h = (db.query(func.count(AccessLog.id)).filter(
        AccessLog.tenant_id == current_user.id, AccessLog.timestamp
        >= last_24h,
        AccessLog.outcome.in_(
            ["block", "limit", "ratelimit", "redirect", "flagged"])).scalar())

    # Determinar nivel de riesgo basado en detecciones
    risk_level = "low"
    if detections_24h > 50:
        risk_level = "high"
    elif detections_24h > 20:
        risk_level = "medium"

    # Estadísticas de los últimos 7 días
    last_7d = now - timedelta(days=7)
    last_7d_stats = (db.query(
        func.count(AccessLog.id).label("total"),
        func.sum(case((AccessLog.outcome == "block", 1),
                      else_=0)).label("blocked"),
        func.sum(case((AccessLog.outcome == "limit", 1),
                      else_=0)).label("limited"),
        func.sum(case((AccessLog.outcome == "allow", 1),
                      else_=0)).label("allowed")).filter(
                          AccessLog.tenant_id == current_user.id,
                          AccessLog.timestamp >= last_7d).first())

    # Obtener todos los logs para procesar los tipos de bots en Python
    logs = (db.query(AccessLog.user_agent).filter(
        AccessLog.tenant_id == current_user.id, AccessLog.timestamp >= last_7d,
        AccessLog.outcome.in_(
            ["block", "limit", "ratelimit", "redirect", "flagged"])).all())

    # Procesar tipos de bots en Python
    bot_counts = {}
    for log in logs:
        # Extraer la primera parte del user_agent (normalmente el nombre del navegador/bot)
        bot_type = log.user_agent.split('/')[0].split(
            ' ')[0] if log.user_agent else "Unknown"
        bot_counts[bot_type] = bot_counts.get(bot_type, 0) + 1

    # Ordenar y limitar a los 10 más comunes
    sorted_bots = sorted(bot_counts.items(), key=lambda x: x[1],
                         reverse=True)[:10]
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


@router.get("/advanced-insights", response_model=AdvancedInsightsOut)
def advanced_insights(current_user=Depends(get_current_user),
                      db: Session = Depends(get_db)):
    tenant = current_user.id

    # 1. Traffic by Agent Type
    agent_buckets = {
        "AI Agent": ["AgentGPT", "OpenAI"],
        "AI Assistant": ["Siri", "Alexa"],
        "AI Data Scraper": ["Scrapy", "Octoparse"],
        "Uncategorized": []
    }
    traffic_by_agent = []
    for label, patterns in agent_buckets.items():
        if patterns:
            count = db.query(func.count(AccessLog.id)).filter(
                AccessLog.tenant_id == tenant,
                *[AccessLog.user_agent.ilike(f"%{pat}%")
                  for pat in patterns]).scalar()
        else:
            count = 0
        traffic_by_agent.append({"key": label, "count": count})

    total_hits = db.query(func.count(
        AccessLog.id)).filter(AccessLog.tenant_id == tenant).scalar()
    known = sum(item["count"] for item in traffic_by_agent)
    traffic_by_agent.append({
        "key": "Uncategorized",
        "count": total_hits - known
    })

    # 2. Top referred pages
    top_referrals = db.query(
        AccessLog.referrer.label("key"),
        func.count(AccessLog.id).label("count")).filter(
            AccessLog.tenant_id == tenant, AccessLog.referrer
            != None).group_by(AccessLog.referrer).order_by(
                func.count(AccessLog.id).desc()).limit(10).all()
    top_referrals = [{"key": r.key, "count": r.count} for r in top_referrals]

    # 3. Traffic by LLM referrer
    traffic_by_llm = db.query(
        AccessLog.referrer.label("key"),
        func.count(AccessLog.id).label("count")).filter(
            AccessLog.tenant_id == tenant,
            AccessLog.referrer.ilike("%llm=%")).group_by(
                AccessLog.referrer).order_by(func.count(
                    AccessLog.id).desc()).limit(10).all()
    traffic_by_llm = [{"key": r.key, "count": r.count} for r in traffic_by_llm]

    # 4. Time spent browsing por agente
    times = db.query(
        AccessLog.user_agent.label("key"),
        func.avg(
            func.extract(
                "epoch", AccessLog.exit_timestamp -
                AccessLog.timestamp)).label("count")).filter(
                    AccessLog.tenant_id == tenant, AccessLog.exit_timestamp
                    != None).group_by(AccessLog.user_agent).order_by(
                        func.avg(
                            func.extract(
                                "epoch", AccessLog.exit_timestamp -
                                AccessLog.timestamp)).desc()).limit(10).all()
    by_time = [{"key": t.key, "count": round(t.count or 0)} for t in times]

    # 5. Most Active Agents (compatibilidad con varios dialectos)
    ua_coalesce = func.coalesce(AccessLog.user_agent, "")
    ua_with_slash = ua_coalesce + "/"

    # Detectamos el dialecto
    dialect_name = db.bind.dialect.name  # 'postgresql', 'sqlite', 'mysql', etc.

    if dialect_name == "postgresql":
        # en Postgres: strpos(column, substr) devuelve la posición (1-based)
        pos_fn = func.strpos(ua_with_slash, "/")
    else:
        # SQLite y MySQL disponen de instr()
        pos_fn = func.instr(ua_with_slash, "/")

    # substr(col, start, length)
    agent_expr = func.substr(ua_coalesce, 1, pos_fn - 1).label("agent")

    most_active = (db.query(
        agent_expr,
        func.count(AccessLog.id).label("count")).filter(
            AccessLog.tenant_id == tenant).group_by("agent").order_by(
                func.count(AccessLog.id).desc()).limit(10).all())

    most_active_agents = [{
        "key": row.agent or "Unknown",
        "count": row.count
    } for row in most_active]
    if not most_active_agents:
        most_active_agents = [{"key": "Unknown", "count": 0}]

    # 6. Top Originating Countries
    top_countries = db.query(
        AccessLog.country_code,
        func.count(AccessLog.id).label("count")).filter(
            AccessLog.tenant_id == tenant).group_by(
                AccessLog.country_code).order_by(
                    func.count(AccessLog.id).desc()).limit(10).all()
    top_countries_list = [{
        "key": c.country_code or "??",
        "count": c.count
    } for c in top_countries]

    # 7. Referral Click Rate
    total_impressions = total_hits or 0
    total_clicks = db.query(func.count(AccessLog.id)).filter(
        AccessLog.tenant_id == tenant, AccessLog.referral
        == True).scalar() or 0
    ctr = (total_clicks / total_impressions *
           100) if total_impressions else 0.0

    return {
        "trafficByAgentType": traffic_by_agent,
        "mostActiveAgents": most_active_agents,
        "topOriginatingCountries": top_countries_list,
        "referralClickRate": {
            "clicks": total_clicks,
            "impressions": total_impressions,
            "rate": round(ctr, 2)
        },
        "topReferredPages": top_referrals,
        "trafficByLLMReferrer": traffic_by_llm,
        "timeSpentByAgent": by_time,
    }
