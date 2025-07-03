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
    
    BACKEND_URL: str ="http://localhost:8001/rest/"
    FRONTEND_URL: str ="https://ialert.ciberpunk.es"
    
    # Nuevas variables para Refresh Token
    REFRESH_SECRET: str = "super_refresh_secret"
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30
    
    class Config:
        env_file = ".env"

settings = Settings()
