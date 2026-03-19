import uuid
from datetime import datetime
from sqlalchemy import DateTime, ForeignKey, UniqueConstraint, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base


class Favorite(Base):
    __tablename__ = "favorites"
    __table_args__ = (
        UniqueConstraint("user_id", "property_id", name="uq_user_property_favorite"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=False
    )
    property_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("auction_properties.id"), nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="favorites")
    property = relationship("AuctionProperty", back_populates="favorites")
