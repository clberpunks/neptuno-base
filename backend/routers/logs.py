# File: backend/routers/logs.py
from schemas.schemas import AdvancedInsightsOut
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, case, or_
from datetime import datetime, timedelta
from dependencies import get_current_user
from db import get_db
from models.models import AccessLog

router = APIRouter(tags=["logs"])

def get_cutoff_from_range(range_str: str) -> datetime:
    now = datetime.utcnow()
    if range_str == "24h":
        return now - timedelta(hours=24)
    elif range_str == "7d":
        return now - timedelta(days=7)
    elif range_str == "15d":
        return now - timedelta(days=15)
    elif range_str == "1m":
        return now - timedelta(days=30)
    elif range_str == "6m":
        return now - timedelta(days=180)
    elif range_str == "1y":
        return now - timedelta(days=365)
    else:
        return now - timedelta(hours=24)  # default to 24h


@router.get("/")
def list_logs(
    range: str = Query("24h", description="Time range for logs"),
    page: int = 1,
    limit: int = 1000,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    cutoff = get_cutoff_from_range(range)
    
    # Build query with cutoff
    query = db.query(AccessLog).filter(
        AccessLog.tenant_id == current_user.id,
        AccessLog.timestamp >= cutoff
    ).order_by(AccessLog.timestamp.desc())
    
    offset = (page - 1) * limit
    total = query.count()
    raw = query.offset(offset).limit(limit).all()
    
    # Return only the logs within the cutoff
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


@router.get("/stats")
def get_firewall_stats(
    range: str = Query(None, description="Time range for stats"),
    db: Session = Depends(get_db)
):
    cutoff = get_cutoff_from_range(range) if range else datetime.utcnow() - timedelta(hours=24)
    
    query = db.query(AccessLog).filter(AccessLog.timestamp >= cutoff)
    
    total = query.count()
    stats = {}
    for outcome in ["allow", "block", "limit", "ratelimit", "redirect", "flagged"]:
        count = query.filter(AccessLog.outcome == outcome).count()
        stats[outcome] = count
    stats["other"] = total - sum(stats.values())
    stats["total"] = total
    return stats

@router.get("/stats/user")
def get_user_firewall_stats(
    range: str = Query(None, description="Time range for stats"),
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    cutoff = get_cutoff_from_range(range) if range else datetime.utcnow() - timedelta(hours=24)
    
    query = db.query(AccessLog).filter(
        AccessLog.tenant_id == current_user.id,
        AccessLog.timestamp >= cutoff
    )
    
    total = query.count()
    stats = {}
    for outcome in ["allow", "block", "limit", "ratelimit", "redirect", "flagged"]:
        count = query.filter(AccessLog.outcome == outcome).count()
        stats[outcome] = count
    stats["other"] = total - sum(stats.values())
    stats["total"] = total
    return stats

# backend/routers/logs.py
# backend/routers/logs.py
@router.get("/insights")
def risk_insights(
    range: str = Query("24h", description="Time range for insights"),
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    cutoff = get_cutoff_from_range(range)
    
    # Detections in selected range
    detections = db.query(func.count(AccessLog.id)).filter(
        AccessLog.tenant_id == current_user.id, 
        AccessLog.timestamp >= cutoff,
        AccessLog.outcome.in_(["block", "limit", "ratelimit", "redirect", "flagged"])
    ).scalar() or 0

    # Risk level based on detections
    risk_level = "low"
    if detections > 50:
        risk_level = "high"
    elif detections > 20:
        risk_level = "medium"

    # Stats for selected range
    stats = db.query(
        func.count(AccessLog.id).label("total"),
        func.sum(case((AccessLog.outcome == "block", 1), else_=0)).label("blocked"),
        func.sum(case((AccessLog.outcome == "limit", 1), else_=0)).label("limited"),
        func.sum(case((AccessLog.outcome == "allow", 1), else_=0)).label("allowed")
    ).filter(
        AccessLog.tenant_id == current_user.id,
        AccessLog.timestamp >= cutoff
    ).first()

    # Procesar resultados
    stats_data = {
        "total": stats.total or 0,
        "blocked": stats.blocked or 0,
        "limited": stats.limited or 0,
        "allowed": stats.allowed or 0
    }

    # Get logs for bot types
    logs = db.query(AccessLog.user_agent).filter(
        AccessLog.tenant_id == current_user.id, 
        AccessLog.timestamp >= cutoff,
        AccessLog.outcome.in_(["block", "limit", "ratelimit", "redirect", "flagged"])
    ).all()

    # Process bot types
    bot_counts = {}
    for log in logs:
        if log.user_agent:
            bot_type = log.user_agent.split('/')[0].split(' ')[0] or "Unknown"
            bot_counts[bot_type] = bot_counts.get(bot_type, 0) + 1

    sorted_bots = sorted(bot_counts.items(), key=lambda x: x[1], reverse=True)[:10]
    by_bot_type = [{"botType": bot[0], "count": bot[1]} for bot in sorted_bots]

    # Simulated protection level
    protection_level = "low"

    return {
        "detections": detections,
        "riskLevel": risk_level,
        "stats": stats_data,
        "byBotType": by_bot_type,
        "protectionLevel": protection_level,
    }

@router.get("/advanced-insights", response_model=AdvancedInsightsOut)
def advanced_insights(
    range: str = Query("24h", description="Time range for insights"),
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    cutoff = get_cutoff_from_range(range)
    tenant = current_user.id

    # 1. Traffic by Agent Type
    agent_buckets = {
        "AI Agent": ["AgentGPT", "OpenAI"],
        "AI Assistant": ["Siri", "Alexa"],
        "AI Data Scraper": ["Scrapy", "Octoparse"],
        "Uncategorized": []
    }
    
    # Filtrar por rango temporal
    base_query = db.query(AccessLog).filter(
        AccessLog.tenant_id == tenant,
        AccessLog.timestamp >= cutoff
    )
    
    traffic_by_agent = []
    for label, patterns in agent_buckets.items():
        if patterns:
            count = base_query.filter(
                or_(*[AccessLog.user_agent.ilike(f"%{pat}%") for pat in patterns])
            ).count()
        else:
            count = 0
        traffic_by_agent.append({"key": label, "count": count})

    total_hits = base_query.count()
    known = sum(item["count"] for item in traffic_by_agent)
    traffic_by_agent.append({
        "key": "Uncategorized",
        "count": total_hits - known
    })

    # 2. Top referred pages (con filtro de rango)
    top_referrals = base_query.filter(
        AccessLog.referrer != None
    ).group_by(AccessLog.referrer).order_by(
        func.count(AccessLog.id).desc()
    ).limit(10).values(
        AccessLog.referrer.label("key"),
        func.count(AccessLog.id).label("count")
    )
    
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
        "topReferredPages": [{"key": r[0], "count": r[1]} for r in top_referrals],
        "trafficByLLMReferrer": traffic_by_llm,
        "timeSpentByAgent": by_time,
    }