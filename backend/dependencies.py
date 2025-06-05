# backend/dependencies.py
from fastapi import Depends, HTTPException, status, Request
import json
from schemas import UserInJWT

def get_current_user(request: Request) -> UserInJWT:
    cookie = request.cookies.get("user_info")
    if not cookie:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="No autenticado")
    try:
        user_dict = json.loads(cookie)
        return UserInJWT(**user_dict)
    except Exception:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Cookie inválida")