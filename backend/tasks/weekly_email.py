# backend/tasks/weekly_email.py
from jinja2 import Environment, FileSystemLoader
from sqlalchemy.orm import Session
from db import SessionLocal
from models.models import User, AccessLog
from datetime import datetime, timedelta
from utils.email import send_email  # lo implementamos abajo

env = Environment(loader=FileSystemLoader("templates"))

def generate_user_summary(user: User, db: Session):
    start = datetime.utcnow() - timedelta(days=7)
    logs = db.query(AccessLog).filter(
        AccessLog.tenant_id == user.id,
        AccessLog.timestamp >= start
    ).all()

    stats = {
        "total": len(logs),
        "blocked": sum(1 for l in logs if l.outcome == "block"),
        "limited": sum(1 for l in logs if l.outcome == "limit"),
        "approaching_limit": False
    }

    if user.subscription and stats["total"] > user.subscription.traffic_limit * 0.8:
        stats["approaching_limit"] = True

    return stats

def send_weekly_summaries():
    db = SessionLocal()
    users = db.query(User).all()
    for user in users:
        if not user.email:
            continue
        stats = generate_user_summary(user, db)
        template = env.get_template("weekly_summary.html")
        html = template.render(user=user, stats=stats)
        send_email(
            to=user.email,
            subject="📊 Tu resumen semanal de actividad",
            html=html
        )
    db.close()
