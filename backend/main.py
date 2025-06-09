# backend/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from auth import router as auth_router
from utils import hash_password
from user import router as user_router
from admin import router as admin_router

from db import engine, Base, SessionLocal
from models import User, UserRole
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
import uuid

app = FastAPI()

origins = ["http://localhost:3000" ]



app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(user_router)
app.include_router(admin_router)


# Evento de inicio que crea tablas y usuarios de ejemplo
@app.on_event("startup")
def startup_event():
    Base.metadata.create_all(bind=engine)

    db: Session = SessionLocal()
    try:
        if not db.query(User).filter_by(email="user@example.com").first():
            user = User(
                id=str(uuid.uuid4()),
                email="user@example.com",
                name="Ejemplo User",
                password_hash=hash_password("123456"),
                auth_method="local",
                role=UserRole.user,
                picture=None,
            )
            db.add(user)

        if not db.query(User).filter_by(email="admin@example.com").first():
            admin = User(
                id=str(uuid.uuid4()),
                email="admin@example.com",
                name="Ejemplo Admin",
                password_hash=hash_password("123456"),
                auth_method="local",
                role=UserRole.admin,
                picture=None,
            )
            db.add(admin)

        db.commit()
    except IntegrityError:
        db.rollback()
    finally:
        db.close()
