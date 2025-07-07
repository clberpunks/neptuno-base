# backend/routes/user.py
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from dependencies import get_current_user
from db import get_db
from pydantic import BaseModel
from models.models import LoginHistory, User
from fastapi import Body
from schemas.schemas import PlanUpdate
from models.models import Subscription
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from db import get_db
from models.models import User, AccessLog
from datetime import datetime, timedelta
from utils import send_email
from jinja2 import Environment, FileSystemLoader


# Initialize Jinja2 environment for email templates
env = Environment(loader=FileSystemLoader("templates"))

router = APIRouter(tags=["user"])  #prefix="/user",


@router.post("/subscription")
def update_subscription(data: PlanUpdate,
                        db: Session = Depends(get_db),
                        current_user: User = Depends(get_current_user)):
    plan = data.plan
    allowed = {"free", "pro", "business", "enterprise"}
    if plan not in allowed:
        raise HTTPException(status_code=400, detail="Plan no válido")

    limits = {
        "free": (10_000, 1, 1),
        "pro": (100_000, 5, 5),
        "business": (1_000_000, 10, 10),
        "enterprise": (10_000_000, 9999, 9999)
    }

    t, d, u = limits[plan]
    plan_prices = {
        "free": 0,
        "pro": 10,
        "business": 50,
        "enterprise": 200
    }
    price = plan_prices[plan]
    # Buscar suscripción existente en la base de datos
    sub = db.query(Subscription).filter_by(user_id=current_user.id).first()
    if sub is None:
        sub = Subscription(user_id=current_user.id,
                        plan=plan,
                        traffic_limit=t,
                        domain_limit=d,
                        user_limit=u,
                        created_at=datetime.utcnow(),
                        renews_at=datetime.utcnow() + timedelta(days=365),
                        price=price)
        db.add(sub)
    else:
        sub.plan = plan
        sub.traffic_limit = t
        sub.domain_limit = d
        sub.user_limit = u
        sub.price = price

    db.commit()
    return {"message": "Plan actualizado correctamente"}


@router.get("/access-history")
def get_access_history(current_user: User = Depends(get_current_user),
                       db: Session = Depends(get_db)):
    """Obtiene el historial de accesos del usuario autenticado."""
    history = (db.query(LoginHistory).filter(
        LoginHistory.user_id == current_user.id).order_by(
            LoginHistory.timestamp.desc()).all())
    return [{
        "id": str(entry.id),
        "timestamp": entry.timestamp.isoformat(),
        "ip_address": entry.ip_address,
        "login_method": entry.login_method,
    } for entry in history]

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from db import get_db
from dependencies import get_current_user
from models.models import Notification, User
from schemas.schemas import NotificationOut


@router.get("/notifications", response_model=list[NotificationOut])
def get_notifications(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Notification).filter_by(user_id=current_user.id).order_by(Notification.created_at.desc()).all()

@router.post("/notifications/{notification_id}/read")
def mark_as_read(notification_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    notif = db.query(Notification).filter_by(id=notification_id, user_id=current_user.id).first()
    if not notif:
        raise HTTPException(status_code=404, detail="Notificación no encontrada")
    notif.read = True
    db.commit()
    return {"message": "Marcada como leída"}

@router.delete("/notifications/{notification_id}")
def delete_notification(notification_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    notif = db.query(Notification).filter_by(id=notification_id, user_id=current_user.id).first()
    if not notif:
        raise HTTPException(status_code=404, detail="No existe")
    db.delete(notif)
    db.commit()
    return {"message": "Eliminada"}


@router.post("/send-weekly-report")
def send_weekly_report(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not current_user.email or "@example.com" in current_user.email:
        raise HTTPException(status_code=400, detail="Email no válido para envío")

    # Calcula actividad semanal
    one_week_ago = datetime.utcnow() - timedelta(days=7)
    logs = db.query(AccessLog).filter(
        AccessLog.tenant_id == current_user.id,
        AccessLog.timestamp >= one_week_ago
    ).all()

    stats = {
        "total": len(logs),
        "blocked": sum(1 for l in logs if l.outcome == "block"),
        "limited": sum(1 for l in logs if l.outcome == "limit"),
        "approaching_limit": (
            current_user.subscription and len(logs) > current_user.subscription.traffic_limit * 0.8
        )
    }

    template = env.get_template("weekly_summary.html")
    html = template.render(user=current_user, stats=stats)

    send_email(
        to=current_user.email,
        subject="📊 Tu resumen semanal de actividad",
        html=html
    )

    notification = Notification(
    user_id=current_user.id,
    title="📊 Resumen semanal enviado",
    body=f"Tu informe semanal incluye {stats['total']} eventos, con {stats['blocked']} bloqueos y {stats['limited']} limitaciones detectadas."
)
    db.add(notification)
    db.commit()

    return {"message": "Boletín enviado correctamente"}

@router.get("/notifications/unseen-count")
def unseen_notifications_count(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    count = db.query(Notification).filter_by(user_id=current_user.id, read=False).count()
    return {"unseen": count}
