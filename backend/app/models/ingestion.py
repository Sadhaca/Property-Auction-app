import enum
import uuid
from datetime import datetime
from sqlalchemy import String, Integer, Text, DateTime, Enum, ForeignKey, func
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base


class JobStatus(str, enum.Enum):
    pending = "pending"
    running = "running"
    completed = "completed"
    failed = "failed"


class LogAction(str, enum.Enum):
    created = "created"
    updated = "updated"
    skipped = "skipped"
    failed = "failed"
    deduplicated = "deduplicated"


class IngestionJob(Base):
    __tablename__ = "ingestion_jobs"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    source_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("sources.id"), nullable=False
    )
    status: Mapped[JobStatus] = mapped_column(
        Enum(JobStatus), default=JobStatus.pending, nullable=False
    )
    started_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    records_found: Mapped[int] = mapped_column(Integer, default=0)
    records_new: Mapped[int] = mapped_column(Integer, default=0)
    records_updated: Mapped[int] = mapped_column(Integer, default=0)
    records_failed: Mapped[int] = mapped_column(Integer, default=0)
    error_log: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    source = relationship("Source", back_populates="jobs")
    logs = relationship("IngestionLog", back_populates="job", cascade="all, delete-orphan")


class IngestionLog(Base):
    __tablename__ = "ingestion_logs"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    job_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("ingestion_jobs.id"), nullable=False
    )
    property_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), nullable=True)
    action: Mapped[LogAction] = mapped_column(Enum(LogAction), nullable=False)
    details: Mapped[dict | None] = mapped_column(JSONB, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    job = relationship("IngestionJob", back_populates="logs")
