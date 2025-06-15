# backend/utils.py
from passlib.context import CryptContext
import jwt
import json
from fastapi.responses import RedirectResponse, JSONResponse
from config import settings
from datetime import datetime, timedelta

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")



def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_refresh_token(user_id: str):
    payload = {
        "sub": user_id,
        "exp": datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS),
        "iat": datetime.utcnow(),
    }
    return jwt.encode(payload, settings.REFRESH_SECRET, algorithm="HS256")

def set_auth_cookies(response: RedirectResponse | JSONResponse, user, id_token: str):
    # Genera avatar robusto con ui-avatars.com si no hay picture
    avatar_url = user.picture or f"https://ui-avatars.com/api/?name={'+'.join(user.name.split())}&size=96&background=random&format=png"
    user_data = {
        "id": user.id, 
        "name": user.name, 
        "email": user.email, 
        "role": user.role.value,
        "picture": avatar_url,
        "created_at": user.created_at.isoformat(), 
        "last_login": user.last_login.isoformat()
    }
    
    jwt_token = jwt.encode(user_data, settings.CLIENT_SECRET, algorithm="HS256")
    refresh_token = create_refresh_token(user.id)

    response.set_cookie("jwt_token", jwt_token, httponly=True, samesite="lax", secure=False)
    response.set_cookie("refresh_token", refresh_token, httponly=True, samesite="lax", secure=False)
    
    
