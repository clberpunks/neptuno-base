# backend/dependencies.py
from fastapi import Depends, HTTPException, status, Request
from schemas.schemas import UserInJWT
from config import settings
import json

def get_current_user(request: Request) -> UserInJWT:
    user_info = request.cookies.get("user_info")
    if not user_info:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="No autenticado")
    try:
        data = json.loads(user_info)
        return UserInJWT(**data)
    except Exception:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Cookie de usuario inválida")