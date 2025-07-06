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


def set_auth_cookies(response, user):
    access_token = create_access_token(user)
    refresh_token = create_refresh_token(user)

    response.set_cookie(
        "jwt_token",
        access_token,
        httponly=True,
        samesite="none",
        secure=True,  # solo para dev
        max_age=60  # duración igual al token
    )
    response.set_cookie(
        "refresh_token",
        refresh_token,
        httponly=True,
        samesite="none",
        secure=True,  # solo para dev
        max_age=60*60*24*7  # refresh válido 7 días
    )

    

# UTILIDADES DE TOKENS

def create_access_token(user):
    payload = {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "picture": user.picture or f"https://ui-avatars.com/api/?name={'+'.join(user.name.split())}&size=96&background=random&format=png",
        "role": user.role.value,
        "created_at": user.created_at.isoformat(),
        "last_login": user.last_login.isoformat(),
        "exp": datetime.utcnow() + timedelta(minutes=30),
    }
    return jwt.encode(payload, settings.CLIENT_SECRET, algorithm="HS256")


def create_refresh_token(user):
    payload = {
        "sub": user.id,
        "exp": datetime.utcnow() + timedelta(days=7),
        "iat": datetime.utcnow(),
    }
    return jwt.encode(payload, settings.REFRESH_SECRET, algorithm="HS256")


def generate_tokens(user):
    access_token = create_access_token(user)
    refresh_token = create_refresh_token(user)
    return access_token, refresh_token

# backend/utils/email.py
import smtplib
from email.mime.text import MIMEText
from config import settings

def send_email(to: str, subject: str, html: str):
    msg = MIMEText(html, "html")
    msg["Subject"] = subject
    msg["From"] = settings.MAIL_FROM
    msg["To"] = to

    with smtplib.SMTP_SSL(settings.MAIL_SERVER, settings.MAIL_PORT) as server:
        server.login(settings.MAIL_USERNAME, settings.MAIL_PASSWORD)
        server.send_message(msg)
