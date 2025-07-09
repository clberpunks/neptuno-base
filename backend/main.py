# main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import auth, user, admin, embed, detect, logs, firewall
from db import engine, Base, SessionLocal
from models.models import User, UserRole
from utils import hash_password
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
import uuid

app = FastAPI(
    docs_url="/rest/docs",  # Swagger UI docs
    redoc_url=None,  # 
    openapi_url="/rest/openapi.json",  # 
)

origins = [
    "play.google.com", "accounts.google.com", "http://localhost:3000",
    "https://lh3.googleusercontent.com", "http://localhost:8001",
    "https://ialert.ciberpunk.es", "http://172.80.0.200",
    "http://172.80.0.200:8001"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/rest/auth")
app.include_router(user.router, prefix="/rest/user")
app.include_router(admin.router, prefix="/rest/admin")

app.include_router(embed.router, prefix="/rest")
app.include_router(detect.router, prefix="/rest")

app.include_router(logs.router, prefix="/rest/logs")

app.include_router(firewall.router, prefix="/rest/firewall")


@app.on_event("startup")
def startup_event():
    """Crea las tablas y usuarios iniciales al iniciar la aplicación."""
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()
    try:
        if not db.query(User).filter_by(email="user@example.com").first():
            db.add(
                User(
                    id=str(uuid.uuid4()),
                    email="user@example.com",
                    name="Ejemplo User",
                    password_hash=hash_password("123456"),
                    auth_method="local",
                    role=UserRole.user,
                    picture=
                    None  #f"https://ui-avatars.com/api/?name=Ejemplo+User&size=40"
                ))
        if not db.query(User).filter_by(email="admin@example.com").first():
            db.add(
                User(
                    id=str(uuid.uuid4()),
                    email="admin@example.com",
                    name="Ejemplo Admin",
                    password_hash=hash_password("123456"),
                    auth_method="local",
                    role=UserRole.admin,
                    picture=
                    None  #f"https://ui-avatars.com/api/?name=Ejemplo+Admin&size=40"
                ))
        db.commit()
    except IntegrityError:
        db.rollback()
    finally:
        db.close()
