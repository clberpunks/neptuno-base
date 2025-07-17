# backend/config.py
import os
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    APP_NAME: str = "Ciberpunk"
    GOOGLE_CLIENT_ID: str
    GOOGLE_CLIENT_SECRET: str
    GOOGLE_REDIRECT_URI: str = "http://localhost:8001/rest/auth/callback"
    DATABASE_URL: str = "sqlite:///../data/app.db"
    CLIENT_SECRET: str = "your_client_secret_here"

    NODE_ENV: str = "development"

    BACKEND_URL: str = "http://localhost:8001"
    FRONTEND_URL: str = "https://ialert.ciberpunk.es"

    # Nuevas variables para Refresh Token
    REFRESH_SECRET: str = "super_refresh_secret"
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30

    # Stripe
    STRIPE_SECRET_KEY: str = "your_stripe_secret_key"
    STRIPE_WEBHOOK_SECRET: str = "your_stripe_webhook_secret"
    # PayPal
    PAYPAL_CLIENT_ID: str = "your_paypal_client_id"
    PAYPAL_SECRET: str = "your_paypal_secret"

    MAIL_SERVER: str = "smtp.example.com"
    MAIL_PORT: int = 587
    MAIL_USERNAME: str
    MAIL_PASSWORD: str
    MAIL_FROM: str

    class Config:
        env_file = ".env"
        extra = "allow"


settings = Settings()
