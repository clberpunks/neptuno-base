# backend/routes/admin.py
# backend/routes/admin.py (actualizado)
from datetime import datetime, timedelta
from typing import List, Optional
import uuid
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, distinct, case
from dependencies import get_current_admin_user, get_current_user
from db import get_db
from models.models import PlanLevel, SubscriptionPlan, User, Subscription, LoginHistory
from schemas.schemas import SubscriptionPlanOut, SubscriptionPlanUpdate, UserInJWT, UserOut
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


@router.get("/users")
def get_all_users(db: Session = Depends(get_db)):
    users = db.query(User).all()
    
    user_list = []
    for user in users:
        subscription = db.query(Subscription).filter(Subscription.user_id == user.id).first()
        user_data = {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role,
            "status": user.status.value if user.status else "active",  # Usar el valor del enum
            "created_at": user.created_at.isoformat() if user.created_at else None,
            "last_login": user.last_login.isoformat() if user.last_login else None,
            "plan": subscription.plan if subscription else PlanLevel.free
        }
        user_list.append(user_data)
    
    return user_list


@router.put("/users/{user_id}/role")
def update_user_role(
    user_id: str,
    role: str,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin_user)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    # Validar el rol
    if role not in ["admin", "user"]:
        raise HTTPException(status_code=400, detail="Rol no válido")
    
    user.role = role
    db.commit()
    return {"message": "Rol actualizado correctamente"}

@router.put("/users/{user_id}/status")
def update_user_status(
    user_id: str,
    status: str,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin_user)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    # Validar el estado
    if status not in ["active", "suspended"]:
        raise HTTPException(status_code=400, detail="Estado no válido")
    
    user.status = status
    db.commit()
    return {"message": "Estado actualizado correctamente"}

@router.put("/users/{user_id}/plan")
def update_user_plan(
    user_id: str,
    plan: str,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin_user)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    # Validar el plan
    if plan not in ["free", "pro", "business", "enterprise"]:
        raise HTTPException(status_code=400, detail="Plan no válido")
    
    # Actualizar la suscripción asociada si existe
    subscription = db.query(Subscription).filter(Subscription.user_id == user_id).first()
    if subscription:
        subscription.plan = plan
        db.commit()
    else:
        # Crear una nueva suscripción si no existe
        new_subscription = Subscription(
            id=str(uuid.uuid4()),
            user_id=user_id,
            plan=plan,
            created_at=datetime.utcnow(),
            # ... otros campos necesarios ...
        )
        db.add(new_subscription)
        db.commit()
    
    return {"message": "Plan actualizado correctamente"}

@router.delete("/users/{user_id}")
def delete_user(
    user_id: str,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin_user)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    # Eliminar dependencias primero
    db.query(Subscription).filter(Subscription.user_id == user_id).delete()
    db.query(LoginHistory).filter(LoginHistory.user_id == user_id).delete()
    db.query(AccessLog).filter(AccessLog.tenant_id == user_id).delete()
    
    # Finalmente eliminar el usuario
    db.delete(user)
    db.commit()
    return {"message": "Usuario eliminado correctamente"}