# /backend/auth.py
import uuid
from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import RedirectResponse, JSONResponse
import httpx
from datetime import datetime
import json
from sqlalchemy.orm import Session
from schemas.schemas import UserLogin, UserRegister
from utils import hash_password, verify_password, set_auth_cookies
from models.models import User, UserRole, LoginHistory
from config import settings
from db import get_db

# /backend/auth.py
router = APIRouter(prefix="/auth", tags=["auth"])

@router.get("/user")
def get_user_info(request: Request):
    user_info = request.cookies.get("user_info")
    return user_info

async def get_google_token(code: str) -> dict:
    """Obtiene el token de acceso de Google OAuth2."""
    async with httpx.AsyncClient() as client:
        response = await client.post(
            "https://oauth2.googleapis.com/token",
            data={
                "code": code,
                "client_id": settings.GOOGLE_CLIENT_ID,
                "client_secret": settings.GOOGLE_CLIENT_SECRET,
                "redirect_uri": settings.GOOGLE_REDIRECT_URI,
                "grant_type": "authorization_code",
            },
            headers={"Content-Type": "application/x-www-form-urlencoded"},
            timeout=10,
        )
        if response.status_code != 200:
            raise HTTPException(status_code=500, detail="Error obteniendo token")
        return response.json()

async def get_google_userinfo(access_token: str) -> dict:
    """Obtiene la información del usuario desde Google."""
    async with httpx.AsyncClient() as client:
        response = await client.get(
            "https://www.googleapis.com/oauth2/v3/userinfo",
            headers={"Authorization": f"Bearer {access_token}"},
            timeout=10,
        )
        if response.status_code != 200:
            raise HTTPException(status_code=500, detail="Error obteniendo userinfo")
        return response.json()

@router.get("/login")
def login():
    """Inicia el flujo de autenticación con Google."""
    url = (
        "https://accounts.google.com/o/oauth2/v2/auth"
        f"?client_id={settings.GOOGLE_CLIENT_ID}"
        f"&redirect_uri={settings.GOOGLE_REDIRECT_URI}"
        "&response_type=code"
        "&scope=openid%20email%20profile"
    )
    return RedirectResponse(url)

@router.get("/callback")
async def callback(request: Request, db: Session = Depends(get_db)):
    """Maneja el callback de Google OAuth2 y autentica al usuario."""
    code = request.query_params.get("code")
    if not code:
        raise HTTPException(status_code=400, detail="Missing code")

    token_data = await get_google_token(code)
    access_token = token_data.get("access_token")
    id_token = token_data.get("id_token")
    google_user = await get_google_userinfo(access_token)

    now = datetime.utcnow()
    user = db.query(User).filter(User.id == google_user["sub"]).first()
    if user:
        user.last_login = now
    else:
        user = User(
            id=google_user["sub"],
            name=google_user["name"],
            email=google_user["email"],
            picture=google_user.get("picture", f"https://ui-avatars.com/api/?name={google_user['name']}"),
            role=UserRole.user,
            created_at=now,
            last_login=now,
        )
        db.add(user)
    db.commit()

    login_record = LoginHistory(
        user_id=user.id,
        ip_address=request.client.host,
        login_method="google",
    )
    db.add(login_record)
    db.commit()

    response = RedirectResponse(url="http://localhost:3000/dashboard")
    response.set_cookie("id_token", id_token, httponly=True, samesite="lax")
    response.set_cookie(
        "user_info",
        json.dumps({
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "picture": user.picture,
            "role": user.role.value,
            "created_at": user.created_at.isoformat(),
            "last_login": user.last_login.isoformat(),
        }),
        httponly=True,
        samesite="lax",
    )
    return response

@router.post("/register")
def register_user(data: UserRegister, db: Session = Depends(get_db)):
    """Registra un nuevo usuario con autenticación local."""
    if db.query(User).filter_by(email=data.email).first():
        raise HTTPException(status_code=400, detail="Email ya registrado")
    new_user = User(
        id=str(uuid.uuid4()),
        email=data.email,
        name=data.name,
        picture=f"https://ui-avatars.com/api/?name={data.name}",
        password_hash=hash_password(data.password),
        auth_method="local",
    )
    db.add(new_user)
    db.commit()
    return {"message": "Usuario creado correctamente"}

@router.post("/login")
def login_user(data: UserLogin, request: Request, db: Session = Depends(get_db)):
    """Autentica a un usuario con credenciales locales."""
    user = db.query(User).filter_by(email=data.email, auth_method="local").first()
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Credenciales incorrectas")

    now = datetime.utcnow()
    user.last_login = now
    db.commit()

    login_record = LoginHistory(
        user_id=user.id,
        ip_address=request.client.host,
        login_method="local",
    )
    db.add(login_record)
    db.commit()

    response = JSONResponse(content={"message": "Login exitoso"})
    set_auth_cookies(response, user, "")
    return response