import uuid
from datetime import datetime
from sqlalchemy import String, Boolean, Integer, Numeric, DateTime, func
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base


class SubscriptionPlan(Base):
    __tablename__ = "subscription_plans"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    price: Mapped[float] = mapped_column(Numeric(10, 2), default=0, nullable=False)
    duration_days: Mapped[int] = mapped_column(Integer, default=30, nullable=False)
    features: Mapped[dict | None] = mapped_column(JSONB, default=dict)
    max_saved_searches: Mapped[int] = mapped_column(Integer, default=5, nullable=False)
    max_alerts: Mapped[int] = mapped_column(Integer, default=3, nullable=False)
    can_export: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    api_access: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    users = relationship("User", back_populates="subscription_plan")
