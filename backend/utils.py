# backend/utils.py
from passlib.context import CryptContext
import jwt
from fastapi.responses import RedirectResponse, JSONResponse
from config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def set_auth_cookies(response: RedirectResponse | JSONResponse, user, id_token: str):
    user_data = {
        "id": user.id, "name": user.name, "email": user.email, "role": user.role.value,
        "created_at": user.created_at.isoformat(), "last_login": user.last_login.isoformat()
    }
    jwt_token = jwt.encode(user_data, settings.JWT_SECRET, algorithm="HS256")
    response.set_cookie("jwt_token", jwt_token, httponly=True, samesite="lax")