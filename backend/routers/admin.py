# backend/routes/admin.py
# backend/routes/admin.py (actualizado)

from datetime import datetime, timedelta
from typing import List, Optional
import uuid
from utils import hash_password
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, distinct, case
from dependencies import get_current_admin_user, get_current_user
from db import get_db
from models.models import PlanLevel, SubscriptionPlan, User, Subscription, LoginHistory
from schemas.schemas import SubscriptionPlanOut, SubscriptionPlanUpdate, UserInJWT, UserOut, UserPlanUpdate, UserRegister, UserRoleUpdate, UserStatusUpdate, UserUpdateRequest
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from datetime import datetime, timedelta
from dependencies import get_current_user
from db import get_db
from models.models import User, AccessLog, Subscription
from pydantic import BaseModel

router = APIRouter(tags=["admin"])


class RoleUpdate(BaseModel):
    role: str


class StatusUpdate(BaseModel):
    status: str


class PlanUpdate(BaseModel):
    plan: str


@router.get("/top-users")
def get_top_users(db: Session = Depends(get_db)):
    # Obtener los 10 usuarios con más actividad (global)
    top_users = (db.query(
        User.id, User.name, User.email,
        func.count(AccessLog.id).label('request_count'),
        func.max(AccessLog.timestamp).label('last_activity'),
        Subscription.plan).join(
            AccessLog, User.id == AccessLog.tenant_id).join(
                Subscription, User.id == Subscription.user_id).group_by(
                    User.id, Subscription.plan).order_by(
                        desc('request_count')).limit(10).all())

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
    bot_activities = (db.query(
        AccessLog.user_agent,
        func.count(AccessLog.id).label('request_count'),
        func.max(AccessLog.timestamp).label('last_seen'),
        func.avg(case((AccessLog.outcome == 'block', 100),
                      else_=0)).label('block_rate')).filter(
                          AccessLog.user_agent.ilike('%bot%')
                          | AccessLog.user_agent.ilike('%crawler%')
                          | AccessLog.user_agent.ilike('%spider%')).group_by(
                              AccessLog.user_agent).order_by(
                                  desc('request_count')).limit(10).all())

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
    new_users = (db.query(func.count(
        User.id)).filter(User.created_at >= one_month_ago).scalar())

    # 2. Usuarios activos último mes (al menos un login)
    active_users = (db.query(func.count(distinct(
        LoginHistory.user_id))).filter(
            LoginHistory.timestamp >= one_month_ago).scalar())

    # 3. Distribución de planes
    plan_distribution = (db.query(Subscription.plan, func.count(
        Subscription.id)).group_by(Subscription.plan).all())

    # 4. Churn rate (usuarios sin login en 60 días)
    churn_date = datetime.utcnow() - timedelta(days=60)
    churn_users = (
        db.query(func.count(User.id)).filter(
            User.last_login < churn_date,
            User.role == "user"  # Solo usuarios normales
        ).scalar())

    # 5. Ingresos estimados (ejemplo con precios hipotéticos)
    estimated_revenue = (db.query(func.sum(Subscription.price)).scalar() or 0)

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


@router.get("/subscription-plans/all",
            response_model=List[SubscriptionPlanOut])
def get_all_plans(db: Session = Depends(get_db)):
    print(">> Cargando todos los planes de suscripción")
    return db.query(SubscriptionPlan).order_by(SubscriptionPlan.price).all()


@router.put("/subscription-plans/{plan_id}")
def update_plan(plan_id: str,
                data: SubscriptionPlanUpdate,
                db: Session = Depends(get_db)):
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
        subscription = db.query(Subscription).filter(
            Subscription.user_id == user.id).first()
        user_data = {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role,
            "status": user.status.value
            if user.status else "active",  # Usar el valor del enum
            "created_at":
            user.created_at.isoformat() if user.created_at else None,
            "last_login":
            user.last_login.isoformat() if user.last_login else None,
            "plan": subscription.plan if subscription else PlanLevel.free
        }
        user_list.append(user_data)

    return user_list


@router.delete("/users/{user_id}")
def delete_user(user_id: str,
                db: Session = Depends(get_db),
                admin: User = Depends(get_current_admin_user)):
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


# Eliminar endpoints duplicados y crear un endpoint unificado
@router.put("/users/{user_id}")
def update_user(user_id: str,
                data: UserUpdateRequest,
                db: Session = Depends(get_db),
                admin: User = Depends(get_current_admin_user)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    # Actualizar campos básicos
    if data.name:
        user.name = data.name
    if data.email:
        user.email = data.email

    # Actualizar rol
    if data.role:
        if data.role not in ["admin", "user"]:
            raise HTTPException(status_code=400, detail="Rol no válido")
        user.role = data.role

    # Actualizar estado
    if data.status:
        if data.status not in ["active", "suspended"]:
            raise HTTPException(status_code=400, detail="Estado no válido")
        user.status = data.status

    # Actualizar plan
    if data.plan:
        if data.plan not in ["free", "pro", "business", "enterprise"]:
            raise HTTPException(status_code=400, detail="Plan no válido")

        subscription = db.query(Subscription).filter(
            Subscription.user_id == user_id).first()
        if subscription:
            subscription.plan = data.plan
        else:
            new_subscription = Subscription(
                id=str(uuid.uuid4()),
                user_id=user_id,
                plan=data.plan,
                created_at=datetime.utcnow(),
                # Valores por defecto
                traffic_limit=10000,
                domain_limit=1,
                user_limit=1,
                price=0)
            db.add(new_subscription)

    db.commit()

    # Devolver usuario actualizado
    subscription = db.query(Subscription).filter(
        Subscription.user_id == user_id).first()
    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "role": user.role,
        "status": user.status,
        "plan": subscription.plan if subscription else "free",
        "created_at": user.created_at.isoformat() if user.created_at else None,
        "last_login": user.last_login.isoformat() if user.last_login else None,
        "status": user.status  # Asegurar que este campo está incluido
    }


# Eliminar endpoints obsoletos (los duplicados y el que causaba error)
# - @router.put("/users/{user_id}/role") (ambas versiones)
# - @router.put("/users/{user_id}/status")
# - @router.put("/users/{user_id}/plan")
# - @router.put("/users/{user_id}/update")



@router.post("/users")
def create_user(
    user_data: UserRegister,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin_user)
):
    # Verificar si el usuario ya existe
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email ya registrado")
    
    # Crear nuevo usuario con todos los campos requeridos
    new_user = User(
        id=str(uuid.uuid4()),
        name=user_data.name,
        email=user_data.email,
        password_hash=hash_password(user_data.password),
        role=user_data.role if hasattr(user_data, 'role') else "user",
        status="active",
        picture=f"https://ui-avatars.com/api/?name={user_data.name.replace(' ', '+')}",  # Campo requerido
        auth_method="local",  # Campo requerido
        created_at=datetime.utcnow(),
        last_login=datetime.utcnow()  # Campo requerido
    )
    
    db.add(new_user)
    db.commit()
    
    # Crear suscripción con todos los campos requeridos
    new_subscription = Subscription(
        id=str(uuid.uuid4()),
        user_id=new_user.id,
        plan=user_data.plan,
        created_at=datetime.utcnow(),
        traffic_limit=10000,
        domain_limit=1,
        user_limit=1,
        price=0,
        renews_at=datetime.utcnow() + timedelta(days=365)  # Campo requerido
    )
    db.add(new_subscription)
    db.commit()
    
    return {
        "id": new_user.id,
        "name": new_user.name,
        "email": new_user.email,
        "role": new_user.role,
        "status": new_user.status,
        "plan": user_data.plan,
        "created_at": new_user.created_at.isoformat(),
        "last_login": new_user.last_login.isoformat()
    }