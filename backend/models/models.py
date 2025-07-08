# File: backend/models.py
from sqlalchemy import Column, String, DateTime, Integer, Boolean, Enum, ForeignKey, Float
from sqlalchemy.orm import relationship
from db import Base
from datetime import datetime
import enum, uuid
from sqlalchemy import Enum as PgEnum
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Enum as SqlEnum
from sqlalchemy.orm import relationship
from datetime import datetime
from db import Base
import enum
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Enum as PgEnum
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
import enum
from db import Base


class UserRole(str, enum.Enum):
    admin = "admin"
    user = "user"


class Notification(Base):
    __tablename__ = "notifications"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    body = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    read = Column(Boolean, default=False)

    user = relationship("User", back_populates="notifications")


# User
class User(Base):
    __tablename__ = "users"
    id = Column(String, primary_key=True)
    name = Column(String)
    email = Column(String, unique=True, index=True)
    password_hash = Column(String, nullable=True)
    picture = Column(String)
    role = Column(SqlEnum(UserRole), default=UserRole.user)
    auth_method = Column(String, default="google")
    created_at = Column(DateTime, default=datetime.utcnow)
    last_login = Column(DateTime, default=datetime.utcnow)

    subscription = relationship("Subscription", uselist=False, back_populates="user")

    login_history = relationship("LoginHistory", back_populates="user")

    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")



class PlanLevel(str, enum.Enum):
    free = "free"
    pro = "pro"
    business = "business"
    enterprise = "enterprise"

# models/models.py
class SubscriptionPlan(Base):
    __tablename__ = "subscription_plans"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    plan = Column(SqlEnum(PlanLevel), unique=True, nullable=False)
    traffic_limit = Column(Integer, nullable=False)
    domain_limit = Column(Integer, nullable=False)
    user_limit = Column(Integer, nullable=False)
    price = Column(Integer, default=0)
    active = Column(Boolean, default=True)


class Subscription(Base):
    __tablename__ = "subscriptions"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False, unique=True)
    plan = Column(SqlEnum(PlanLevel), default=PlanLevel.free)
    traffic_limit = Column(Integer)
    domain_limit = Column(Integer)
    user_limit = Column(Integer)
    created_at = Column(DateTime, default=datetime.utcnow)
    renews_at = Column(DateTime)
    remaining_tokens = Column(Integer)
    price = Column(Integer, default=0)
    
    user = relationship("User", back_populates="subscription")

class FirewallRule(Base):
    __tablename__ = "firewall_rules"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    tenant_id = Column(String, index=True)
    llm_name = Column(String)
    pattern = Column(String)
    policy = Column(
        String)  # "allow" | "block" | "restricted" | "tariff" | "redirect"
    limit = Column(Integer, nullable=True)
    fee = Column(Float, nullable=True)  # <-- CORREGIDO
    redirect_url = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class AccessLog(Base):
    __tablename__ = "access_log"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    tenant_id = Column(String, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    ip_address = Column(String)
    user_agent = Column(String)
    referrer = Column(String, nullable=True)
    accept_language = Column(String, nullable=True)
    sec_ch_ua = Column(String, nullable=True)
    sec_ch_ua_mobile = Column(String, nullable=True)
    sec_ch_ua_platform = Column(String, nullable=True)
    utm_source = Column(String, nullable=True)
    fingerprint = Column(String)
    path = Column(String)
    outcome = Column(
        String, index=True
    )  # "allow" | "block" | "limit" | "redirect" | "ratelimit" | "flagged" | "tariff"
    rule = Column(String)
    redirect_url = Column(String, nullable=True)
    js_executed = Column(Boolean, default=False)

    seen = Column(Boolean, default=False) 



class LoginHistory(Base):
    __tablename__ = "login_history"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"))
    timestamp = Column(DateTime, default=datetime.utcnow)
    ip_address = Column(String)
    login_method = Column(String)

    user = relationship("User", back_populates="login_history")
