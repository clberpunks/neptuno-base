# backend/routes/user.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from dependencies import get_current_user
from db import get_db
from models.models import LoginHistory, User

router = APIRouter( tags=["user"]) #prefix="/user",

@router.get("/access-history")
def get_access_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Obtiene el historial de accesos del usuario autenticado."""
    history = (
        db.query(LoginHistory)
        .filter(LoginHistory.user_id == current_user.id)
        .order_by(LoginHistory.timestamp.desc())
        .all()
    )
    return [
        {
            "id": str(entry.id),
            "timestamp": entry.timestamp.isoformat(),
            "ip_address": entry.ip_address,
            "login_method": entry.login_method,
        }
        for entry in history
    ]