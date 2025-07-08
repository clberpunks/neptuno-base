# backend/routes/admin.py
# backend/routes/admin.py (actualizado)
from datetime import datetime, timedelta
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, distinct, case
from dependencies import get_current_user
from db import get_db
from models.models import SubscriptionPlan, User, Subscription, LoginHistory
from schemas.schemas import SubscriptionPlanOut, SubscriptionPlanUpdate, UserInJWT
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from datetime import datetime, timedelta
from dependencies import get_current_user
from db import get_db
from models.models import User, AccessLog, Subscription

router = APIRouter(tags=["admin"])

@router.get("/top-users")
def get_top_users(db: Session = Depends(get_db)):
    # Obtener los 10 usuarios con más actividad (global)
    top_users = (
        db.query(
            User.id,
            User.name,
            User.email,
            func.count(AccessLog.id).label('request_count'),
            func.max(AccessLog.timestamp).label('last_activity'),
            Subscription.plan
        )
        .join(AccessLog, User.id == AccessLog.tenant_id)
        .join(Subscription, User.id == Subscription.user_id)
        .group_by(User.id, Subscription.plan)
        .order_by(desc('request_count'))
        .limit(10)
        .all()
    )
    
    return [{
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "request_count": user.request_count,
        "last_activity": user.last_activity.isoformat(),
        "plan": user.plan
    } for user in top_users]

@router.get("/bot-activities")
def get_bot_activities(db: Session = Depends(get_db)):
    # Obtener los 10 user agents de bots más activos (globales)
    bot_activities = (
        db.query(
            AccessLog.user_agent,
            func.count(AccessLog.id).label('request_count'),
            func.max(AccessLog.timestamp).label('last_seen'),
            func.avg(
                case(
                    (AccessLog.outcome == 'block', 100),
                    else_=0
                )
            ).label('block_rate')
        )
        .filter(AccessLog.user_agent.ilike('%bot%') | 
               AccessLog.user_agent.ilike('%crawler%') |
               AccessLog.user_agent.ilike('%spider%'))
        .group_by(AccessLog.user_agent)
        .order_by(desc('request_count'))
        .limit(10)
        .all()
    )
    
    return [{
        "user_agent": activity.user_agent,
        "request_count": activity.request_count,
        "last_seen": activity.last_seen.isoformat(),
        "block_rate": round(float(activity.block_rate), 2)
    } for activity in bot_activities]

@router.get("/overview")
def admin_overview(current_user: UserInJWT = Depends(get_current_user), 
                  db: Session = Depends(get_db)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Acceso denegado")
    
    # 1. Nuevos usuarios último mes
    one_month_ago = datetime.utcnow() - timedelta(days=30)
    new_users = (
        db.query(func.count(User.id))
        .filter(User.created_at >= one_month_ago)
        .scalar()
    )
    
    # 2. Usuarios activos último mes (al menos un login)
    active_users = (
        db.query(func.count(distinct(LoginHistory.user_id)))
        .filter(LoginHistory.timestamp >= one_month_ago)
        .scalar()
    )
    
    # 3. Distribución de planes
    plan_distribution = (
        db.query(
            Subscription.plan,
            func.count(Subscription.id)
        )
        .group_by(Subscription.plan)
        .all()
    )
    
    # 4. Churn rate (usuarios sin login en 60 días)
    churn_date = datetime.utcnow() - timedelta(days=60)
    churn_users = (
        db.query(func.count(User.id))
        .filter(
            User.last_login < churn_date,
            User.role == "user"  # Solo usuarios normales
        )
        .scalar()
    )
    
    # 5. Ingresos estimados (ejemplo con precios hipotéticos)
    estimated_revenue = (
        db.query(func.sum(Subscription.price)).scalar() or 0
    )
    
    return {
        "new_users": new_users,
        "active_users": active_users,
        "plan_distribution": dict(plan_distribution),
        "churned_users": churn_users,
        "estimated_revenue": estimated_revenue
    }
    


@router.get("/subscription-plans", response_model=List[SubscriptionPlanOut])
def get_available_plans(db: Session = Depends(get_db)):
    return db.query(SubscriptionPlan).filter_by(active=True).all()


@router.patch("/subscription-plans/{plan_id}/toggle")
def toggle_plan_status(plan_id: str, db: Session = Depends(get_db)):
    plan = db.query(SubscriptionPlan).filter_by(id=plan_id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan no encontrado")
    plan.active = not plan.active  # Asumiendo que has añadido campo `active`
    db.commit()
    return {"message": "Estado actualizado"}

@router.get("/subscription-plans/all", response_model=List[SubscriptionPlanOut])
def get_all_plans(db: Session = Depends(get_db)):
    print(">> Cargando todos los planes de suscripción")
    return db.query(SubscriptionPlan).order_by(SubscriptionPlan.price).all()


@router.put("/subscription-plans/{plan_id}")
def update_plan(plan_id: str, data: SubscriptionPlanUpdate, db: Session = Depends(get_db)):
    plan = db.query(SubscriptionPlan).filter_by(id=plan_id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan no encontrado")

    for key, value in data.dict(exclude_unset=True).items():
        setattr(plan, key, value)

    db.commit()
    return {"message": "Plan actualizado"}

@router.delete("/subscription-plans/{plan_id}")
def delete_plan(plan_id: str, db: Session = Depends(get_db)):
    plan = db.query(SubscriptionPlan).filter_by(id=plan_id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan no encontrado")
    db.delete(plan)
    db.commit()
    return {"message": "Plan eliminado"}

