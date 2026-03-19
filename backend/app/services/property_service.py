import math
import uuid
from typing import Optional

import structlog
from sqlalchemy import select, func, desc, asc
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.property import AuctionProperty, AuctionStatus
from app.schemas.property import PropertyCreate, PropertyUpdate, PropertyFilters, PropertyListResponse, PropertyResponse

logger = structlog.get_logger()


class PropertyService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, data: PropertyCreate) -> AuctionProperty:
        prop = AuctionProperty(**data.model_dump(exclude_unset=True))
        prop.data_completeness_score = self._calculate_completeness(prop)
        self.db.add(prop)
        await self.db.flush()
        logger.info("property_created", property_id=str(prop.id))
        return prop

    async def get_by_id(self, property_id: uuid.UUID) -> Optional[AuctionProperty]:
        result = await self.db.execute(
            select(AuctionProperty).where(AuctionProperty.id == property_id)
        )
        return result.scalar_one_or_none()

    async def update(self, property_id: uuid.UUID, data: PropertyUpdate) -> Optional[AuctionProperty]:
        prop = await self.get_by_id(property_id)
        if not prop:
            return None
        for field, value in data.model_dump(exclude_unset=True).items():
            setattr(prop, field, value)
        prop.data_completeness_score = self._calculate_completeness(prop)
        self.db.add(prop)
        await self.db.flush()
        return prop

    async def search(self, filters: PropertyFilters) -> PropertyListResponse:
        """Search properties with filters, returning paginated results."""
        query = select(AuctionProperty)
        count_query = select(func.count(AuctionProperty.id))

        conditions = self._build_filters(filters)
        for cond in conditions:
            query = query.where(cond)
            count_query = count_query.where(cond)

        sort_col = getattr(AuctionProperty, filters.sort_by, AuctionProperty.auction_date)
        order_fn = asc if filters.sort_order == "asc" else desc
        query = query.order_by(order_fn(sort_col))

        offset = (filters.page - 1) * filters.page_size
        query = query.offset(offset).limit(filters.page_size)

        result = await self.db.execute(query)
        properties = result.scalars().all()

        count_result = await self.db.execute(count_query)
        total = count_result.scalar()

        return PropertyListResponse(
            items=[PropertyResponse.model_validate(p) for p in properties],
            total=total,
            page=filters.page,
            page_size=filters.page_size,
            total_pages=math.ceil(total / filters.page_size) if total else 0,
        )

    async def get_trending(self) -> dict:
        city_q = (
            select(AuctionProperty.city, func.count(AuctionProperty.id).label("cnt"))
            .where(AuctionProperty.status == AuctionStatus.active, AuctionProperty.city.isnot(None))
            .group_by(AuctionProperty.city)
            .order_by(desc("cnt"))
            .limit(10)
        )
        cities = await self.db.execute(city_q)

        bank_q = (
            select(AuctionProperty.bank_name, func.count(AuctionProperty.id).label("cnt"))
            .where(AuctionProperty.status == AuctionStatus.active)
            .group_by(AuctionProperty.bank_name)
            .order_by(desc("cnt"))
            .limit(10)
        )
        banks = await self.db.execute(bank_q)

        return {
            "top_cities": [{"city": r[0], "count": r[1]} for r in cities.all()],
            "top_banks": [{"bank": r[0], "count": r[1]} for r in banks.all()],
        }

    async def get_recent(self, limit: int = 10) -> list[AuctionProperty]:
        result = await self.db.execute(
            select(AuctionProperty)
            .where(AuctionProperty.status == AuctionStatus.active)
            .order_by(desc(AuctionProperty.created_at))
            .limit(limit)
        )
        return list(result.scalars().all())

    def _build_filters(self, f: PropertyFilters) -> list:
        conditions = []
        if f.state:
            conditions.append(AuctionProperty.state.ilike(f"%{f.state}%"))
        if f.city:
            conditions.append(AuctionProperty.city.ilike(f"%{f.city}%"))
        if f.district:
            conditions.append(AuctionProperty.district.ilike(f"%{f.district}%"))
        if f.pin_code:
            conditions.append(AuctionProperty.pin_code == f.pin_code)
        if f.bank_name:
            conditions.append(AuctionProperty.bank_name.ilike(f"%{f.bank_name}%"))
        if f.property_type:
            conditions.append(AuctionProperty.property_type == f.property_type)
        if f.property_subtype:
            conditions.append(AuctionProperty.property_subtype == f.property_subtype)
        if f.min_price is not None:
            conditions.append(AuctionProperty.reserve_price >= f.min_price)
        if f.max_price is not None:
            conditions.append(AuctionProperty.reserve_price <= f.max_price)
        if f.min_emd is not None:
            conditions.append(AuctionProperty.emd_amount >= f.min_emd)
        if f.max_emd is not None:
            conditions.append(AuctionProperty.emd_amount <= f.max_emd)
        if f.auction_date_from:
            conditions.append(AuctionProperty.auction_date >= f.auction_date_from)
        if f.auction_date_to:
            conditions.append(AuctionProperty.auction_date <= f.auction_date_to)
        if f.min_area is not None:
            conditions.append(AuctionProperty.area_sqft >= f.min_area)
        if f.max_area is not None:
            conditions.append(AuctionProperty.area_sqft <= f.max_area)
        if f.possession_status:
            conditions.append(AuctionProperty.possession_status == f.possession_status)
        if f.status:
            conditions.append(AuctionProperty.status == f.status)
        if f.source_id:
            conditions.append(AuctionProperty.source_id == f.source_id)
        return conditions

    @staticmethod
    def _calculate_completeness(prop: AuctionProperty) -> float:
        """Calculate data completeness score (0-100) based on key fields."""
        fields = [
            prop.bank_name, prop.title, prop.property_type, prop.address,
            prop.city, prop.state, prop.reserve_price, prop.auction_date,
            prop.emd_amount, prop.contact_person, prop.contact_phone,
            prop.area_sqft, prop.description, prop.pin_code, prop.possession_status,
        ]
        filled = sum(1 for f in fields if f is not None)
        return round((filled / len(fields)) * 100, 1)
