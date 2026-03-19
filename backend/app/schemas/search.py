import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class SavedSearchCreate(BaseModel):
    name: str
    filters: dict
    alert_enabled: bool = False
    alert_frequency: Optional[str] = None


class SavedSearchResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    name: str
    filters: dict
    alert_enabled: bool
    alert_frequency: Optional[str] = None
    last_alerted_at: Optional[datetime] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class AlertCreate(BaseModel):
    alert_enabled: bool
    alert_frequency: Optional[str] = "daily"
