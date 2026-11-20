import os
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "WarpDrive Intelligent Service Desk"
    ORGANIZATION_NAME: str = "WarpDrive Tech Works"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"

    # Environment
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")

    # Database: Supports Neon PostgreSQL or local SQLite for testing/dev
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./warpdrive.db")

    # JWT Authentication
    JWT_SECRET: str = os.getenv("JWT_SECRET", "warpdrive-super-secure-enterprise-secret-key-2026-jwt")
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours

    # AI Chat / Gemini API
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")

    # CORS
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:5173")
    
    @property
    def cors_origins(self) -> List[str]:
        origins = [
            "http://localhost:5173",
            "http://localhost:3000",
            "http://127.0.0.1:5173",
            "http://127.0.0.1:3000"
        ]
        if self.FRONTEND_URL and self.FRONTEND_URL not in origins:
            origins.append(self.FRONTEND_URL)
        return origins

    @property
    def normalized_database_url(self) -> str:
        url = self.DATABASE_URL
        if url.startswith("postgres://"):
            url = url.replace("postgres://", "postgresql://", 1)
        return url

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()
