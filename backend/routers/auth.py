# /backend/auth.py
import uuid
import json
from datetime import datetime, timedelta

import httpx
import jwt
from fastapi import APIRouter, Depends, HTTPException, Request, Response
from fastapi.responses import RedirectResponse, JSONResponse
from sqlalchemy.orm import Session

from config import settings
from db import get_db
from models.models import Subscription, User, UserRole, LoginHistory
from schemas.schemas import UserLogin, UserRegister
from utils import generate_tokens, hash_password, set_auth_cookies, verify_password

router = APIRouter( tags=["auth"]) # prefix="/auth", 



@router.get("/login")
def login():
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
    code = request.query_params.get("code")
    if not code:
        raise HTTPException(status_code=400, detail="Missing code")

    token_data = await get_google_token(code)
    access_token_google = token_data.get("access_token")
    google_user = await get_google_userinfo(access_token_google)

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
        db.flush()
    
    ensure_subscription(user, db) 
    db.commit()

    login_record = LoginHistory(user_id=user.id, ip_address=request.client.host, login_method="google")
    db.add(login_record)
    db.commit()

    access_token, refresh_token = generate_tokens(user)

    response = RedirectResponse(url=f"{settings.FRONTEND_URL}/dashboard") # ialert
    set_auth_cookies(response, user)
    return response


async def get_google_token(code: str) -> dict:
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
    async with httpx.AsyncClient() as client:
        response = await client.get(
            "https://www.googleapis.com/oauth2/v3/userinfo",
            headers={"Authorization": f"Bearer {access_token}"},
            timeout=10,
        )
        if response.status_code != 200:
            raise HTTPException(status_code=500, detail="Error obteniendo userinfo")
        return response.json()


@router.get("/user")
def get_user_info(request: Request, db: Session = Depends(get_db)):
    jwt_token = request.cookies.get("jwt_token")
    if not jwt_token:
        return Response(status_code=401)
    try:
        payload = jwt.decode(jwt_token, settings.CLIENT_SECRET, algorithms=["HS256"])
    except jwt.ExpiredSignatureError:
        return Response(status_code=401)
    except jwt.PyJWTError:
        return Response(status_code=401)

    user = db.query(User).filter_by(id=payload["id"]).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    ensure_subscription(user, db)

    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "picture": user.picture,
        "role": user.role,
        "created_at": user.created_at,
        "last_login": user.last_login,
        "subscription": {
            "plan": user.subscription.plan,
            "created_at": user.subscription.created_at,
            "renews_at": user.subscription.renews_at,
            "traffic_limit": user.subscription.traffic_limit,
            "domain_limit": user.subscription.domain_limit,
            "user_limit": user.subscription.user_limit,
            "price": user.subscription.price,
        } if user.subscription else None,
    }



@router.post("/refresh")
def refresh_token(request: Request, db: Session = Depends(get_db)):
    print("Refresh token solicitado")
    token = request.cookies.get("refresh_token")
    if not token:
        return JSONResponse({"detail": "Refresh token missing"}, status_code=401)

    try:
        payload = jwt.decode(token, settings.REFRESH_SECRET, algorithms=["HS256"])
    except jwt.ExpiredSignatureError:
        return JSONResponse({"detail": "Refresh token expired"}, status_code=401)
    except jwt.PyJWTError:
        return JSONResponse({"detail": "Invalid refresh token"}, status_code=401)

    user_id = payload["sub"]
    user = db.query(User).filter_by(id=user_id).first()
    if not user:
        return JSONResponse({"detail": "User not found"}, status_code=401)

    access_token, refresh_token = generate_tokens(user)

    response = JSONResponse({"message": "Tokens refreshed"})
    set_auth_cookies(response, user)
    return response

@router.post("/register")
def register_user(data: UserRegister, request: Request, db: Session = Depends(get_db)):
    if db.query(User).filter_by(email=data.email).first():
        raise HTTPException(status_code=400, detail="Email ya registrado")

    user = User(
        id=str(uuid.uuid4()),
        email=data.email,
        name=data.name,
        picture=None,
        password_hash=hash_password(data.password),
        auth_method="local",
        created_at=datetime.utcnow(),
        last_login=datetime.utcnow(),
        role=UserRole.user
    )
    db.add(user)
    db.flush()

    # Suscripción básica según plan elegido
    plan = getattr(data, "plan", "free")
    limits = {
        "free":      (10_000, 1, 1),
        "pro":       (100_000, 5, 5),
        "business":  (1_000_000, 10, 10),
        "enterprise": (10_000_000, 9999, 9999),
    }
    plan_prices = {
        "free": 0,
        "pro": 10,
        "business": 50,
        "enterprise": 200
    }
    if plan not in limits:
        plan = "free"
    subscription = Subscription(
        user_id=user.id,
        plan=plan,
        traffic_limit=limits[plan][0],
        domain_limit=limits[plan][1],
        user_limit=limits[plan][2],
        price=plan_prices[plan],
        renews_at=datetime.utcnow() + timedelta(days=365)
    )
    db.add(subscription)
    db.commit()

    access_token, refresh_token = generate_tokens(user)
    response = JSONResponse(content={"message": "Registro exitoso"})
    set_auth_cookies(response, user)
    return response



@router.post("/login")
def login_user(data: UserLogin, request: Request, db: Session = Depends(get_db)):
    user = db.query(User).filter_by(email=data.email, auth_method="local").first()
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Credenciales incorrectas")

    ensure_subscription(user, db)

    user.last_login = datetime.utcnow()
    db.commit()

    login_record = LoginHistory(user_id=user.id, ip_address=request.client.host, login_method="local")
    db.add(login_record)
    db.commit()

    access_token, refresh_token = generate_tokens(user)


    response = JSONResponse(content={"message": "Login exitoso"})
    set_auth_cookies(response, user)
    return response

def ensure_subscription(user: User, db: Session):
    allowed_plans = {"free", "pro", "business", "enterprise"}
    if user.subscription and user.subscription.plan in allowed_plans:
        return

    default_plan = "free"
    limits = {
        "free":      (10_000, 1, 1),
        "pro":       (100_000, 5, 5),
        "business":  (1_000_000, 10, 10),
        "enterprise": (10_000_000, 9999, 9999),
    }
    plan_prices = {
        "free": 0,
        "pro": 10,
        "business": 50,
        "enterprise": 200
    }

    sub = Subscription(
        user_id=user.id,
        plan=default_plan,
        traffic_limit=limits[default_plan][0],
        domain_limit=limits[default_plan][1],
        user_limit=limits[default_plan][2],
        price=plan_prices[default_plan],
        created_at=datetime.utcnow(),
        renews_at=datetime.utcnow() + timedelta(days=365),
    )
    db.add(sub)
    db.commit()
