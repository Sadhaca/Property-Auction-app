import enum
import uuid
from datetime import datetime
from sqlalchemy import String, Boolean, DateTime, Enum, func
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base


class SourceType(str, enum.Enum):
    website = "website"
    api = "api"
    pdf = "pdf"
    rss = "rss"
    manual = "manual"


class Source(Base):
    __tablename__ = "sources"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    source_type: Mapped[SourceType] = mapped_column(Enum(SourceType), nullable=False)
    base_url: Mapped[str | None] = mapped_column(String(1000), nullable=True)
    crawler_module: Mapped[str | None] = mapped_column(String(255), nullable=True)
    schedule_cron: Mapped[str | None] = mapped_column(String(100), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    config: Mapped[dict | None] = mapped_column(JSONB, default=dict)
    last_run_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    jobs = relationship("IngestionJob", back_populates="source", cascade="all, delete-orphan")
