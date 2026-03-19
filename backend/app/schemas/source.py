import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class SourceCreate(BaseModel):
    name: str
    source_type: str
    base_url: Optional[str] = None
    crawler_module: Optional[str] = None
    schedule_cron: Optional[str] = None
    is_active: bool = True
    config: Optional[dict] = None


class SourceUpdate(BaseModel):
    name: Optional[str] = None
    base_url: Optional[str] = None
    crawler_module: Optional[str] = None
    schedule_cron: Optional[str] = None
    is_active: Optional[bool] = None
    config: Optional[dict] = None


class SourceResponse(BaseModel):
    id: uuid.UUID
    name: str
    source_type: str
    base_url: Optional[str] = None
    crawler_module: Optional[str] = None
    schedule_cron: Optional[str] = None
    is_active: bool
    config: Optional[dict] = None
    last_run_at: Optional[datetime] = None
    created_at: datetime

    model_config = {"from_attributes": True}
