# backend/dependencies.py
# backend/dependencies.py
from requests import Session
from fastapi import Depends, HTTPException, status, Request
from schemas.schemas import UserInJWT
from config import settings
from fastapi import Depends, HTTPException, status
from models.models import User
from db import get_db
from schemas.schemas import UserInJWT

import jwt


def get_current_user(request: Request) -> UserInJWT:
    token = request.cookies.get("jwt_token")
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
                            detail="No autenticado")
    try:
        payload = jwt.decode(token,
                             settings.CLIENT_SECRET,
                             algorithms=["HS256"])
        return UserInJWT(**payload)
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
                            detail="Token expirado")
    except jwt.PyJWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
                            detail="Token inválido")


def get_current_admin_user(current_user: UserInJWT = Depends(get_current_user),
                           db: Session = Depends(get_db)) -> User:
    # Verificar si el usuario es administrador
    db_user = db.query(User).filter(User.id == current_user.id).first()
    if not db_user or db_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permiso para acceder a este recurso")
    return db_user
