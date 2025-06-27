# File: backend/models.py
from sqlalchemy import Column, String, DateTime, Integer, Boolean, Enum, ForeignKey
from sqlalchemy.orm import relationship
from db import Base
from datetime import datetime
import enum, uuid

class FirewallRule(Base):
    __tablename__ = "firewall_rules"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    tenant_id = Column(String, index=True)
    llm_name = Column(String)
    pattern = Column(String)
    policy = Column(String)  # "allow" | "block" | "restricted" | "redirect"
    limit = Column(Integer, nullable=True)
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
    outcome = Column(String, index=True)   # "allow" | "block" | "limit" | "redirect" | "ratelimit" | "flagged"
    rule = Column(String)
    redirect_url = Column(String, nullable=True)
    js_executed = Column(Boolean, default=False)

class UserRole(str, enum.Enum):
    admin = "admin"
    user = "user"

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True)
    name = Column(String)
    email = Column(String, unique=True, index=True)
    password_hash = Column(String, nullable=True) 
    picture = Column(String)
    role = Column(Enum(UserRole), default=UserRole.user)
    auth_method = Column(String, default="google")  # "google" o "local"
    created_at = Column(DateTime, default=datetime.utcnow)
    last_login = Column(DateTime, default=datetime.utcnow)

    login_history = relationship("LoginHistory", back_populates="user")

class LoginHistory(Base):
    __tablename__ = "login_history"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"))
    timestamp = Column(DateTime, default=datetime.utcnow)
    ip_address = Column(String)
    login_method = Column(String)

    user = relationship("User", back_populates="login_history")
