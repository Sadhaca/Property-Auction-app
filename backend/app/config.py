from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    APP_NAME: str = "India Property Auction Discovery"
    DEBUG: bool = False
    ENVIRONMENT: str = "development"

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://auctionprop:auctionprop@localhost:5432/auctionprop"

    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"

    # Elasticsearch
    ELASTICSEARCH_URL: str = "http://localhost:9200"

    # JWT
    JWT_SECRET: str = "change-me-in-production-use-a-long-random-string"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours

    # AWS S3-compatible storage
    AWS_S3_BUCKET: str = "auction-documents"
    AWS_REGION: str = "ap-south-1"
    AWS_ACCESS_KEY_ID: Optional[str] = None
    AWS_SECRET_ACCESS_KEY: Optional[str] = None
    AWS_ENDPOINT_URL: Optional[str] = None

    # OpenAI
    OPENAI_API_KEY: Optional[str] = None

    # Initial admin
    ADMIN_EMAIL: str = "admin@auctionplatform.in"
    ADMIN_PASSWORD: str = "Admin@123456"

    # Sentry
    SENTRY_DSN: Optional[str] = None

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8", "case_sensitive": True}


settings = Settings()
