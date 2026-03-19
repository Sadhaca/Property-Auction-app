import uuid
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.jwt import get_current_user, get_admin_user
from app.db.session import get_db
from app.models.enquiry import Enquiry
from app.models.property import AuctionProperty
from app.models.user import User

router = APIRouter()


class EnquiryCreate(BaseModel):
    property_id: uuid.UUID
    message: str


class EnquiryResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    property_id: uuid.UUID
    message: str
    status: str
    created_at: object

    model_config = {"from_attributes": True}


@router.post("", response_model=EnquiryResponse, status_code=status.HTTP_201_CREATED)
async def create_enquiry(
    payload: EnquiryCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Submit an enquiry for a property."""
    prop_result = await db.execute(
        select(AuctionProperty).where(AuctionProperty.id == payload.property_id)
    )
    if not prop_result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Property not found")

    enquiry = Enquiry(
        user_id=current_user.id,
        property_id=payload.property_id,
        message=payload.message,
    )
    db.add(enquiry)
    await db.flush()
    return enquiry


@router.get("", response_model=list[EnquiryResponse])
async def list_enquiries(
    admin: User = Depends(get_admin_user),
    status_filter: Optional[str] = Query(None, alias="status"),
    db: AsyncSession = Depends(get_db),
):
    """List all enquiries (admin only)."""
    query = select(Enquiry).order_by(Enquiry.created_at.desc())
    if status_filter:
        query = query.where(Enquiry.status == status_filter)
    result = await db.execute(query)
    return result.scalars().all()
