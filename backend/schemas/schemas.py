# backend/schemas.py
from pydantic import BaseModel, EmailStr
from datetime import datetime
from enum import Enum

class UserRole(str, Enum):
    admin = "admin"
    user = "user"

class PlanLevel(str, Enum):
    free = "free"
    pro = "pro"
    business = "business"
    enterprise = "enterprise"

class PlanUpdate(BaseModel):
    plan: str

class SubscriptionOut(BaseModel):
    plan: PlanLevel
    created_at: datetime
    renews_at: datetime
    traffic_limit: int
    domain_limit: int
    user_limit: int

    class Config:
        orm_mode = True

class UserInJWT(BaseModel):
    id: str
    name: str
    email: str
    picture: str | None
    role: UserRole
    created_at: datetime
    last_login: datetime
    subscription: SubscriptionOut | None = None  # ← OPCIONAL

class UserRegister(BaseModel):
    name: str
    email: EmailStr
    password: str
    plan: str = "free"  # ← plan opcional

class UserLogin(BaseModel):
    email: EmailStr
    password: str

