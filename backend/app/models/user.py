import enum
import uuid
from datetime import datetime
from sqlalchemy import String, Boolean, DateTime, Enum, ForeignKey, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base


class UserRole(str, enum.Enum):
    user = "user"
    admin = "admin"
    superadmin = "superadmin"


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    phone: Mapped[str | None] = mapped_column(String(20), nullable=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[UserRole] = mapped_column(Enum(UserRole), default=UserRole.user, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    subscription_plan_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("subscription_plans.id"), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    subscription_plan = relationship("SubscriptionPlan", back_populates="users")
    saved_searches = relationship("SavedSearch", back_populates="user", cascade="all, delete-orphan")
    favorites = relationship("Favorite", back_populates="user", cascade="all, delete-orphan")
    enquiries = relationship("Enquiry", back_populates="user", cascade="all, delete-orphan")
