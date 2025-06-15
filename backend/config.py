# backend/config.py
import os
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    APP_NAME: str = "Ciberpunk"
    GOOGLE_CLIENT_ID: str
    GOOGLE_CLIENT_SECRET: str
    GOOGLE_REDIRECT_URI: str = "http://localhost:8000/auth/callback"
    DATABASE_URL: str = "sqlite:///./app.db"
    CLIENT_SECRET: str = "your_client_secret_here"
    JWT_SECRET_KEY: str = "your_jwt_secret_key_here"
    
    class Config:
        env_file = ".env"

settings = Settings()
