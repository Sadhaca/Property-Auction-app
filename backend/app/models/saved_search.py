import uuid
from datetime import datetime
from sqlalchemy import String, Boolean, DateTime, ForeignKey, func
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base


class SavedSearch(Base):
    __tablename__ = "saved_searches"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=False
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    filters: Mapped[dict] = mapped_column(JSONB, default=dict, nullable=False)
    alert_enabled: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    alert_frequency: Mapped[str | None] = mapped_column(String(50), nullable=True)
    last_alerted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="saved_searches")
