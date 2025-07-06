# backend/routes/user.py
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from dependencies import get_current_user
from db import get_db
from pydantic import BaseModel
from models.models import LoginHistory, User
from fastapi import Body
from schemas.schemas import PlanUpdate
from models.models import Subscription

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

    # Crea suscripción si no existe


    # Buscar suscripción existente en la base de datos
    sub = db.query(Subscription).filter_by(user_id=current_user.id).first()
    if sub is None:
        sub = Subscription(user_id=current_user.id,
                        plan=plan,
                        traffic_limit=t,
                        domain_limit=d,
                        user_limit=u,
                        created_at=datetime.utcnow(),
                        renews_at=datetime.utcnow() + timedelta(days=365))
        db.add(sub)
    else:
        sub.plan = plan
        sub.traffic_limit = t
        sub.domain_limit = d
        sub.user_limit = u

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
