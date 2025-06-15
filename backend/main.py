# main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import auth, user, admin
from db import engine, Base, SessionLocal
from models.models import User, UserRole
from utils import hash_password
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
import uuid

app = FastAPI()

origins = ["http://localhost:3000"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(user.router)
app.include_router(admin.router)

@app.on_event("startup")
def startup_event():
    """Crea las tablas y usuarios iniciales al iniciar la aplicación."""
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()
    try:
        if not db.query(User).filter_by(email="user@example.com").first():
            db.add(User(
                id=str(uuid.uuid4()),
                email="user@example.com",
                name="Ejemplo User",
                password_hash=hash_password("123456"),
                auth_method="local",
                role=UserRole.user,
                picture=None #f"https://ui-avatars.com/api/?name=Ejemplo+User&size=40"
            ))
        if not db.query(User).filter_by(email="admin@example.com").first():
            db.add(User(
                id=str(uuid.uuid4()),
                email="admin@example.com",
                name="Ejemplo Admin",
                password_hash=hash_password("123456"),
                auth_method="local",
                role=UserRole.admin,
                picture=None #f"https://ui-avatars.com/api/?name=Ejemplo+Admin&size=40"
            ))
        db.commit()
    except IntegrityError:
        db.rollback()
    finally:
        db.close()