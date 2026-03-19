import asyncio
import uuid
from datetime import date

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.db.base import Base
from app.db.session import get_db
from app.main import app
from app.auth.security import hash_password
from app.auth.jwt import create_access_token
from app.models.user import User, UserRole
from app.models.property import AuctionProperty, AuctionStatus, PropertyType

TEST_DATABASE_URL = "sqlite+aiosqlite:///./test.db"

engine = create_async_engine(TEST_DATABASE_URL, echo=False)
TestSessionFactory = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


@pytest.fixture(scope="session")
def event_loop():
    loop = asyncio.new_event_loop()
    yield loop
    loop.close()


@pytest_asyncio.fixture(autouse=True)
async def setup_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest_asyncio.fixture
async def db_session():
    async with TestSessionFactory() as session:
        yield session


@pytest_asyncio.fixture
async def client(db_session):
    async def _override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = _override_get_db
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac
    app.dependency_overrides.clear()


@pytest_asyncio.fixture
async def test_user(db_session: AsyncSession) -> User:
    user = User(
        email="testuser@example.com",
        password_hash=hash_password("TestPass123"),
        full_name="Test User",
        role=UserRole.user,
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)
    return user


@pytest_asyncio.fixture
async def test_admin(db_session: AsyncSession) -> User:
    admin = User(
        email="admin@example.com",
        password_hash=hash_password("AdminPass123"),
        full_name="Admin User",
        role=UserRole.admin,
    )
    db_session.add(admin)
    await db_session.commit()
    await db_session.refresh(admin)
    return admin


@pytest_asyncio.fixture
def user_token(test_user: User) -> str:
    return create_access_token(str(test_user.id), test_user.role.value)


@pytest_asyncio.fixture
def admin_token(test_admin: User) -> str:
    return create_access_token(str(test_admin.id), test_admin.role.value)


@pytest_asyncio.fixture
async def sample_property(db_session: AsyncSession) -> AuctionProperty:
    prop = AuctionProperty(
        bank_name="State Bank of India",
        title="2BHK Flat in Andheri West, Mumbai",
        property_type=PropertyType.residential,
        address="Flat No 302, Sunshine Towers, Andheri West",
        city="Mumbai",
        state="Maharashtra",
        pin_code="400058",
        reserve_price=8500000.00,
        emd_amount=850000.00,
        auction_date=date(2026, 4, 15),
        status=AuctionStatus.active,
        area_sqft=950.0,
    )
    db_session.add(prop)
    await db_session.commit()
    await db_session.refresh(prop)
    return prop
