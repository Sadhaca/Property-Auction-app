import pytest
import uuid
from datetime import date

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.property import AuctionProperty, AuctionStatus, PropertyType
from app.services.dedup_service import DedupService


@pytest.mark.asyncio
async def test_exact_source_reference_match(db_session: AsyncSession):
    source_id = uuid.uuid4()
    existing = AuctionProperty(
        bank_name="State Bank of India",
        title="Test Property",
        source_id=source_id,
        source_reference="REF-001",
        status=AuctionStatus.active,
    )
    db_session.add(existing)
    await db_session.commit()

    service = DedupService(db_session)
    result = await service.check_duplicate({
        "source_id": source_id,
        "source_reference": "REF-001",
        "bank_name": "State Bank of India",
    })

    assert result.is_duplicate is True
    assert result.match_score == 1.0
    assert result.action == "merge"
    assert "exact_source_reference" in result.signals


@pytest.mark.asyncio
async def test_composite_key_match(db_session: AsyncSession):
    existing = AuctionProperty(
        bank_name="HDFC Bank",
        title="Test Property",
        reserve_price=5000000,
        auction_date=date(2026, 5, 1),
        address="123 Main Street, Bandra, Mumbai",
        city="Mumbai",
        status=AuctionStatus.active,
    )
    db_session.add(existing)
    await db_session.commit()

    service = DedupService(db_session)
    result = await service.check_duplicate({
        "bank_name": "HDFC Bank",
        "reserve_price": 5000000,
        "auction_date": date(2026, 5, 1),
        "address": "123 Main St, Bandra, Mumbai",
        "city": "Mumbai",
    })

    assert result.is_duplicate is True
    assert result.match_score >= 0.6
    assert "composite_key_match" in result.signals


@pytest.mark.asyncio
async def test_no_match(db_session: AsyncSession):
    service = DedupService(db_session)
    result = await service.check_duplicate({
        "bank_name": "NonExistent Bank",
        "reserve_price": 99999999,
        "auction_date": date(2030, 12, 31),
        "address": "Completely different address",
        "city": "UnknownCity",
    })

    assert result.is_duplicate is False
    assert result.action == "new"


@pytest.mark.asyncio
async def test_fuzzy_address_match(db_session: AsyncSession):
    existing = AuctionProperty(
        bank_name="Bank of Baroda",
        title="Office Space",
        address="Flat No. 201, Sai Complex, MG Road, Pune",
        city="Pune",
        status=AuctionStatus.active,
    )
    db_session.add(existing)
    await db_session.commit()

    service = DedupService(db_session)
    result = await service.check_duplicate({
        "bank_name": "Bank of Baroda",
        "address": "Flat 201, Sai Complex, M.G. Road, Pune",
        "city": "Pune",
    })

    # Fuzzy match should detect similarity
    assert result.match_score > 0.5


@pytest.mark.asyncio
async def test_text_fingerprint():
    fingerprint1 = DedupService._text_fingerprint("Hello World Test")
    fingerprint2 = DedupService._text_fingerprint("hello   world   test")
    assert fingerprint1 == fingerprint2
