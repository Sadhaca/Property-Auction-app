import uuid
from datetime import datetime, date
from typing import Optional, List, Any
from pydantic import BaseModel, Field


class PropertyCreate(BaseModel):
    source_id: Optional[uuid.UUID] = None
    source_reference: Optional[str] = None
    bank_name: str
    bank_branch: Optional[str] = None
    title: str
    description: Optional[str] = None
    property_type: Optional[str] = None
    property_subtype: Optional[str] = None
    address: Optional[str] = None
    locality: Optional[str] = None
    district: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    pin_code: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    reserve_price: Optional[float] = None
    emd_amount: Optional[float] = None
    bid_increment: Optional[float] = None
    auction_date: Optional[date] = None
    auction_time: Optional[str] = None
    inspection_date: Optional[date] = None
    possession_status: Optional[str] = None
    encumbrance_notes: Optional[str] = None
    borrower_name: Optional[str] = None
    contact_person: Optional[str] = None
    contact_phone: Optional[str] = None
    contact_email: Optional[str] = None
    document_links: Optional[List[Any]] = None
    image_urls: Optional[List[Any]] = None
    area_sqft: Optional[float] = None
    raw_data: Optional[dict] = None


class PropertyUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    reserve_price: Optional[float] = None
    auction_date: Optional[date] = None
    ai_summary: Optional[str] = None
    ai_risk_score: Optional[float] = None
    data_completeness_score: Optional[float] = None


class PropertyResponse(BaseModel):
    id: uuid.UUID
    source_id: Optional[uuid.UUID] = None
    source_reference: Optional[str] = None
    bank_name: str
    bank_branch: Optional[str] = None
    title: str
    description: Optional[str] = None
    property_type: Optional[str] = None
    property_subtype: Optional[str] = None
    address: Optional[str] = None
    locality: Optional[str] = None
    district: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    pin_code: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    reserve_price: Optional[float] = None
    emd_amount: Optional[float] = None
    bid_increment: Optional[float] = None
    auction_date: Optional[date] = None
    auction_time: Optional[str] = None
    inspection_date: Optional[date] = None
    possession_status: Optional[str] = None
    encumbrance_notes: Optional[str] = None
    borrower_name: Optional[str] = None
    contact_person: Optional[str] = None
    contact_phone: Optional[str] = None
    contact_email: Optional[str] = None
    document_links: Optional[List[Any]] = None
    image_urls: Optional[List[Any]] = None
    status: str
    first_seen_at: Optional[datetime] = None
    last_seen_at: Optional[datetime] = None
    ai_summary: Optional[str] = None
    ai_risk_score: Optional[float] = None
    data_completeness_score: Optional[float] = None
    area_sqft: Optional[float] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class PropertyListResponse(BaseModel):
    items: List[PropertyResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


class PropertyFilters(BaseModel):
    state: Optional[str] = None
    city: Optional[str] = None
    district: Optional[str] = None
    pin_code: Optional[str] = None
    bank_name: Optional[str] = None
    property_type: Optional[str] = None
    property_subtype: Optional[str] = None
    min_price: Optional[float] = None
    max_price: Optional[float] = None
    min_emd: Optional[float] = None
    max_emd: Optional[float] = None
    auction_date_from: Optional[date] = None
    auction_date_to: Optional[date] = None
    min_area: Optional[float] = None
    max_area: Optional[float] = None
    possession_status: Optional[str] = None
    status: Optional[str] = Field(default="active")
    source_id: Optional[uuid.UUID] = None
    sort_by: Optional[str] = Field(default="auction_date")
    sort_order: Optional[str] = Field(default="asc")
    page: int = Field(default=1, ge=1)
    page_size: int = Field(default=20, ge=1, le=100)
