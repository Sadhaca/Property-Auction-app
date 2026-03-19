import enum
import uuid
from datetime import datetime
from sqlalchemy import String, Text, DateTime, Enum, ForeignKey, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base


class EnquiryStatus(str, enum.Enum):
    pending = "pending"
    responded = "responded"
    closed = "closed"


class Enquiry(Base):
    __tablename__ = "enquiries"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=False
    )
    property_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("auction_properties.id"), nullable=False
    )
    message: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[EnquiryStatus] = mapped_column(
        Enum(EnquiryStatus), default=EnquiryStatus.pending, nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="enquiries")
    property = relationship("AuctionProperty", back_populates="enquiries")
