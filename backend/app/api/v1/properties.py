import uuid
import math
from datetime import date
from typing import Optional

import structlog
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, func, desc, asc
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.models.property import AuctionProperty, AuctionStatus
from app.schemas.property import PropertyResponse, PropertyListResponse

logger = structlog.get_logger()
router = APIRouter()


@router.get("", response_model=PropertyListResponse)
async def list_properties(
    db: AsyncSession = Depends(get_db),
    state: Optional[str] = Query(None),
    city: Optional[str] = Query(None),
    district: Optional[str] = Query(None),
    pin_code: Optional[str] = Query(None),
    bank_name: Optional[str] = Query(None),
    property_type: Optional[str] = Query(None),
    property_subtype: Optional[str] = Query(None),
    min_price: Optional[float] = Query(None),
    max_price: Optional[float] = Query(None),
    min_emd: Optional[float] = Query(None),
    max_emd: Optional[float] = Query(None),
    auction_date_from: Optional[date] = Query(None),
    auction_date_to: Optional[date] = Query(None),
    min_area: Optional[float] = Query(None),
    max_area: Optional[float] = Query(None),
    possession_status: Optional[str] = Query(None),
    status: Optional[str] = Query("active"),
    source_id: Optional[uuid.UUID] = Query(None),
    sort_by: str = Query("auction_date"),
    sort_order: str = Query("asc"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
):
    """List auction properties with comprehensive filters."""
    query = select(AuctionProperty)
    count_query = select(func.count(AuctionProperty.id))

    # Apply filters
    filters = []
    if state:
        filters.append(AuctionProperty.state.ilike(f"%{state}%"))
    if city:
        filters.append(AuctionProperty.city.ilike(f"%{city}%"))
    if district:
        filters.append(AuctionProperty.district.ilike(f"%{district}%"))
    if pin_code:
        filters.append(AuctionProperty.pin_code == pin_code)
    if bank_name:
        filters.append(AuctionProperty.bank_name.ilike(f"%{bank_name}%"))
    if property_type:
        filters.append(AuctionProperty.property_type == property_type)
    if property_subtype:
        filters.append(AuctionProperty.property_subtype == property_subtype)
    if min_price is not None:
        filters.append(AuctionProperty.reserve_price >= min_price)
    if max_price is not None:
        filters.append(AuctionProperty.reserve_price <= max_price)
    if min_emd is not None:
        filters.append(AuctionProperty.emd_amount >= min_emd)
    if max_emd is not None:
        filters.append(AuctionProperty.emd_amount <= max_emd)
    if auction_date_from:
        filters.append(AuctionProperty.auction_date >= auction_date_from)
    if auction_date_to:
        filters.append(AuctionProperty.auction_date <= auction_date_to)
    if min_area is not None:
        filters.append(AuctionProperty.area_sqft >= min_area)
    if max_area is not None:
        filters.append(AuctionProperty.area_sqft <= max_area)
    if possession_status:
        filters.append(AuctionProperty.possession_status == possession_status)
    if status:
        filters.append(AuctionProperty.status == status)
    if source_id:
        filters.append(AuctionProperty.source_id == source_id)

    for f in filters:
        query = query.where(f)
        count_query = count_query.where(f)

    # Sorting
    sort_column = getattr(AuctionProperty, sort_by, AuctionProperty.auction_date)
    order_fn = asc if sort_order == "asc" else desc
    query = query.order_by(order_fn(sort_column))

    # Pagination
    offset = (page - 1) * page_size
    query = query.offset(offset).limit(page_size)

    result = await db.execute(query)
    properties = result.scalars().all()

    count_result = await db.execute(count_query)
    total = count_result.scalar()

    return PropertyListResponse(
        items=[PropertyResponse.model_validate(p) for p in properties],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=math.ceil(total / page_size) if total else 0,
    )


@router.get("/trending")
async def trending_properties(db: AsyncSession = Depends(get_db)):
    """Get trending cities, banks, and auction volumes."""
    # Top cities by active listing count
    city_query = (
        select(AuctionProperty.city, func.count(AuctionProperty.id).label("count"))
        .where(AuctionProperty.status == AuctionStatus.active)
        .where(AuctionProperty.city.isnot(None))
        .group_by(AuctionProperty.city)
        .order_by(desc("count"))
        .limit(10)
    )
    city_result = await db.execute(city_query)
    top_cities = [{"city": row[0], "count": row[1]} for row in city_result.all()]

    # Top banks
    bank_query = (
        select(AuctionProperty.bank_name, func.count(AuctionProperty.id).label("count"))
        .where(AuctionProperty.status == AuctionStatus.active)
        .group_by(AuctionProperty.bank_name)
        .order_by(desc("count"))
        .limit(10)
    )
    bank_result = await db.execute(bank_query)
    top_banks = [{"bank": row[0], "count": row[1]} for row in bank_result.all()]

    # Total active volume
    vol_result = await db.execute(
        select(func.count(AuctionProperty.id)).where(
            AuctionProperty.status == AuctionStatus.active
        )
    )
    total_active = vol_result.scalar()

    return {"top_cities": top_cities, "top_banks": top_banks, "total_active": total_active}


@router.get("/recent", response_model=list[PropertyResponse])
async def recent_properties(
    limit: int = Query(10, ge=1, le=50),
    db: AsyncSession = Depends(get_db),
):
    """Get most recently added auction properties."""
    query = (
        select(AuctionProperty)
        .where(AuctionProperty.status == AuctionStatus.active)
        .order_by(desc(AuctionProperty.created_at))
        .limit(limit)
    )
    result = await db.execute(query)
    return result.scalars().all()


@router.get("/{property_id}", response_model=PropertyResponse)
async def get_property(property_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    """Get a single auction property by ID."""
    result = await db.execute(
        select(AuctionProperty).where(AuctionProperty.id == property_id)
    )
    prop = result.scalar_one_or_none()
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found")
    return prop
