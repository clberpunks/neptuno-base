# backend/schemas.py
from typing import Optional
from models.models import PaymentProvider
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
    price: int  # Nuevo campo

    class Config:
        orm_mode = True


class SubscriptionPlanOut(BaseModel):
    id: str
    plan: PlanLevel
    traffic_limit: int
    domain_limit: int
    user_limit: int
    price: int
    active: bool
    description: Optional[str]  # nuevo campo

    class Config:
        orm_mode = True


class SubscriptionPlanUpdate(BaseModel):
    traffic_limit: Optional[int]
    domain_limit: Optional[int]
    user_limit: Optional[int]
    price: Optional[int]
    active: Optional[bool]
    description: Optional[str]  # nuevo campo

    active: Optional[bool]


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


class NotificationOut(BaseModel):
    id: str
    title: str
    body: str | None
    created_at: datetime
    read: bool

    class Config:
        orm_mode = True


class PaymentRecordOut(BaseModel):
    id: str
    provider: PaymentProvider
    provider_charge_id: str
    amount: int
    currency: str
    status: str
    created_at: datetime
    subscription_plan: str  # nombre del plan al que pertenece este pago

    class Config:
        orm_mode = True


from pydantic import BaseModel
from typing import List


class BucketItem(BaseModel):
    key: str
    count: int


class CTRItem(BaseModel):
    clicks: int
    impressions: int
    rate: float  # clicks/impressions*100


class AdvancedInsightsOut(BaseModel):
    trafficByAgentType: List[BucketItem]
    mostActiveAgents: List[BucketItem]
    topOriginatingCountries: List[BucketItem]
    referralClickRate: CTRItem
    topReferredPages: List[BucketItem]
    trafficByLLMReferrer: List[BucketItem]
    timeSpentByAgent: List[BucketItem]


class BucketItem(BaseModel):
    key: str
    count: int
