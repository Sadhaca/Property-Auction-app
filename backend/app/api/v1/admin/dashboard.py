from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends
from sqlalchemy import select, func, case, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.jwt import get_admin_user
from app.db.session import get_db
from app.models.property import AuctionProperty, AuctionStatus
from app.models.user import User
from app.models.source import Source
from app.models.ingestion import IngestionJob

router = APIRouter()


@router.get("/stats")
async def dashboard_stats(
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """Overall platform statistics."""
    total_props = await db.execute(select(func.count(AuctionProperty.id)))
    active_props = await db.execute(
        select(func.count(AuctionProperty.id)).where(
            AuctionProperty.status == AuctionStatus.active
        )
    )
    total_users = await db.execute(select(func.count(User.id)))
    total_sources = await db.execute(select(func.count(Source.id)))

    # Daily ingestion in last 7 days
    week_ago = datetime.now(timezone.utc) - timedelta(days=7)
    daily_query = (
        select(
            func.date_trunc("day", IngestionJob.created_at).label("day"),
            func.coalesce(func.sum(IngestionJob.records_new), 0).label("new_records"),
        )
        .where(IngestionJob.created_at >= week_ago)
        .group_by("day")
        .order_by("day")
    )
    daily_result = await db.execute(daily_query)
    daily_ingestion = [
        {"date": str(row[0].date()) if row[0] else None, "new_records": int(row[1])}
        for row in daily_result.all()
    ]

    return {
        "total_properties": total_props.scalar(),
        "active_properties": active_props.scalar(),
        "total_users": total_users.scalar(),
        "total_sources": total_sources.scalar(),
        "daily_ingestion": daily_ingestion,
    }


@router.get("/data-quality")
async def data_quality(
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """Data quality and completeness metrics."""
    total = await db.execute(select(func.count(AuctionProperty.id)))
    total_count = total.scalar() or 1

    # Count nulls for key fields
    missing_city = await db.execute(
        select(func.count(AuctionProperty.id)).where(AuctionProperty.city.is_(None))
    )
    missing_price = await db.execute(
        select(func.count(AuctionProperty.id)).where(AuctionProperty.reserve_price.is_(None))
    )
    missing_date = await db.execute(
        select(func.count(AuctionProperty.id)).where(AuctionProperty.auction_date.is_(None))
    )
    missing_type = await db.execute(
        select(func.count(AuctionProperty.id)).where(AuctionProperty.property_type.is_(None))
    )

    avg_completeness = await db.execute(
        select(func.avg(AuctionProperty.data_completeness_score))
    )

    return {
        "total_properties": total_count,
        "missing_city": missing_city.scalar(),
        "missing_reserve_price": missing_price.scalar(),
        "missing_auction_date": missing_date.scalar(),
        "missing_property_type": missing_type.scalar(),
        "average_completeness_score": round(float(avg_completeness.scalar() or 0), 2),
    }
