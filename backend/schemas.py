# backend/schemas.py
from pydantic import BaseModel, EmailStr
from datetime import datetime
from enum import Enum

class UserRole(str, Enum):
    admin = "admin"
    user = "user"

class UserInJWT(BaseModel):
    id: str
    name: str
    email: str
    picture: str | None
    role: UserRole
    created_at: datetime
    last_login: datetime


class UserRegister(BaseModel):
    name: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str


