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

    # Database
    postgres_host: str = "db"
    postgres_port: int = 5432
    postgres_db: str = "whiteboard"
    postgres_user: str = "whiteboard"
    postgres_password: str = "whiteboard"

    @property
    def sqlalchemy_database_uri(self) -> str:
        # Use SQLite for local development
        return "sqlite:///./whiteboard.db"
        # PostgreSQL for Docker:
        # return (
        #     f"postgresql+psycopg2://{self.postgres_user}:"
        #     f"{self.postgres_password}@{self.postgres_host}:"
        #     f"{self.postgres_port}/{self.postgres_db}"
        # )


    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache
def get_settings() -> Settings:
    return Settings()

