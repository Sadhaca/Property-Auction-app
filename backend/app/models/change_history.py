import uuid
from datetime import datetime
from sqlalchemy import String, Text, DateTime, ForeignKey, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base


class PropertyChangeHistory(Base):
    __tablename__ = "property_change_history"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    property_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("auction_properties.id"), nullable=False
    )
    field_name: Mapped[str] = mapped_column(String(100), nullable=False)
    old_value: Mapped[str | None] = mapped_column(Text, nullable=True)
    new_value: Mapped[str | None] = mapped_column(Text, nullable=True)
    changed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    source_job_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), nullable=True)

    property = relationship("AuctionProperty", back_populates="change_history")
