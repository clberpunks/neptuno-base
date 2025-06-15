# backend/dependencies.py
# backend/dependencies.py
from fastapi import Depends, HTTPException, status, Request
from schemas.schemas import UserInJWT
from config import settings
import jwt

def get_current_user(request: Request) -> UserInJWT:
    token = request.cookies.get("jwt_token")
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="No autenticado")
    try:
        payload = jwt.decode(token, settings.CLIENT_SECRET, algorithms=["HS256"])
        return UserInJWT(**payload)
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token expirado")
    except jwt.PyJWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token inválido")
