import os
from functools import lru_cache
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # App
    app_name: str = "Realtime Whiteboard"
    environment: str = "development"
    backend_cors_origins: str = "http://localhost:5173,http://localhost:5174,http://127.0.0.1:5173,http://127.0.0.1:5174"

    # Security
    jwt_secret_key: str = "CHANGE_ME_SUPER_SECRET_KEY"
    jwt_algorithm: str = "HS256"
    jwt_access_token_expires_minutes: int = 60 * 24 * 7  # 7 days

    # Database - Production uses DATABASE_URL from Neon
    database_url: str | None = None
    
    # Legacy PostgreSQL settings (for Docker)
    postgres_host: str = "db"
    postgres_port: int = 5432
    postgres_db: str = "whiteboard"
    postgres_user: str = "whiteboard"
    postgres_password: str = "whiteboard"

    @property
    def sqlalchemy_database_uri(self) -> str:
        # Priority 1: DATABASE_URL environment variable (for Render + Neon)
        if self.database_url:
            # Neon uses postgresql:// but SQLAlchemy needs postgresql+psycopg2://
            db_url = self.database_url
            if db_url.startswith("postgres://"):
                db_url = db_url.replace("postgres://", "postgresql+psycopg2://", 1)
            elif db_url.startswith("postgresql://"):
                db_url = db_url.replace("postgresql://", "postgresql+psycopg2://", 1)
            return db_url
        
        # Priority 2: Use SQLite for local development
        return "sqlite:///./whiteboard.db"


    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache
def get_settings() -> Settings:
    return Settings()

