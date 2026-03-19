import enum
import uuid
from datetime import datetime, date
from sqlalchemy import (
    String, Text, Boolean, Integer, Numeric, Date, Time, DateTime,
    Enum, Index, func, Float,
)
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base


class PropertyType(str, enum.Enum):
    residential = "residential"
    commercial = "commercial"
    land = "land"
    industrial = "industrial"
    agricultural = "agricultural"


class PropertySubtype(str, enum.Enum):
    flat = "flat"
    house = "house"
    plot = "plot"
    building = "building"
    office = "office"
    warehouse = "warehouse"
    factory = "factory"
    shop = "shop"


class PossessionStatus(str, enum.Enum):
    physical = "physical"
    symbolic = "symbolic"
    unknown = "unknown"


class AuctionStatus(str, enum.Enum):
    active = "active"
    updated = "updated"
    sold = "sold"
    withdrawn = "withdrawn"
    expired = "expired"


class AuctionProperty(Base):
    __tablename__ = "auction_properties"
    __table_args__ = (
        Index("ix_property_city", "city"),
        Index("ix_property_state", "state"),
        Index("ix_property_status", "status"),
        Index("ix_property_auction_date", "auction_date"),
        Index("ix_property_reserve_price", "reserve_price"),
        Index("ix_property_bank_name", "bank_name"),
        Index("ix_property_type", "property_type"),
        Index("ix_property_city_state_status", "city", "state", "status"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    source_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), nullable=True, index=True
    )
    source_reference: Mapped[str | None] = mapped_column(String(255), nullable=True)
    bank_name: Mapped[str] = mapped_column(String(255), nullable=False)
    bank_branch: Mapped[str | None] = mapped_column(String(255), nullable=True)
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    property_type: Mapped[PropertyType | None] = mapped_column(Enum(PropertyType), nullable=True)
    property_subtype: Mapped[PropertySubtype | None] = mapped_column(
        Enum(PropertySubtype), nullable=True
    )
    address: Mapped[str | None] = mapped_column(Text, nullable=True)
    locality: Mapped[str | None] = mapped_column(String(255), nullable=True)
    district: Mapped[str | None] = mapped_column(String(255), nullable=True)
    city: Mapped[str | None] = mapped_column(String(255), nullable=True)
    state: Mapped[str | None] = mapped_column(String(100), nullable=True)
    pin_code: Mapped[str | None] = mapped_column(String(10), nullable=True)
    latitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    longitude: Mapped[float | None] = mapped_column(Float, nullable=True)

    reserve_price: Mapped[float | None] = mapped_column(Numeric(15, 2), nullable=True)
    emd_amount: Mapped[float | None] = mapped_column(Numeric(15, 2), nullable=True)
    bid_increment: Mapped[float | None] = mapped_column(Numeric(15, 2), nullable=True)

    auction_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    auction_time: Mapped[str | None] = mapped_column(String(50), nullable=True)
    inspection_date: Mapped[date | None] = mapped_column(Date, nullable=True)

    possession_status: Mapped[PossessionStatus | None] = mapped_column(
        Enum(PossessionStatus), default=PossessionStatus.unknown, nullable=True
    )
    encumbrance_notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    borrower_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    contact_person: Mapped[str | None] = mapped_column(String(255), nullable=True)
    contact_phone: Mapped[str | None] = mapped_column(String(20), nullable=True)
    contact_email: Mapped[str | None] = mapped_column(String(255), nullable=True)

    document_links: Mapped[dict | None] = mapped_column(JSONB, default=list)
    image_urls: Mapped[dict | None] = mapped_column(JSONB, default=list)

    status: Mapped[AuctionStatus] = mapped_column(
        Enum(AuctionStatus), default=AuctionStatus.active, nullable=False
    )

    first_seen_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    last_seen_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    ai_summary: Mapped[str | None] = mapped_column(Text, nullable=True)
    ai_risk_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    data_completeness_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    area_sqft: Mapped[float | None] = mapped_column(Float, nullable=True)
    raw_data: Mapped[dict | None] = mapped_column(JSONB, default=dict)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    documents = relationship("PropertyDocument", back_populates="property", cascade="all, delete-orphan")
    favorites = relationship("Favorite", back_populates="property", cascade="all, delete-orphan")
    enquiries = relationship("Enquiry", back_populates="property", cascade="all, delete-orphan")
    change_history = relationship(
        "PropertyChangeHistory", back_populates="property", cascade="all, delete-orphan"
    )
