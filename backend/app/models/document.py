import enum
import uuid
from datetime import datetime
from sqlalchemy import String, Text, DateTime, Enum, ForeignKey, func
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base


class OCRStatus(str, enum.Enum):
    pending = "pending"
    processing = "processing"
    completed = "completed"
    failed = "failed"


class PropertyDocument(Base):
    __tablename__ = "property_documents"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    property_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("auction_properties.id"), nullable=False
    )
    document_type: Mapped[str] = mapped_column(String(100), nullable=False)
    file_url: Mapped[str] = mapped_column(String(1000), nullable=False)
    ocr_text: Mapped[str | None] = mapped_column(Text, nullable=True)
    ocr_status: Mapped[OCRStatus] = mapped_column(
        Enum(OCRStatus), default=OCRStatus.pending, nullable=False
    )
    ai_extraction: Mapped[dict | None] = mapped_column(JSONB, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    property = relationship("AuctionProperty", back_populates="documents")
