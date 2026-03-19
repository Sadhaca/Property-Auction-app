import uuid
from typing import Optional

import structlog
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.security import hash_password, verify_password
from app.auth.jwt import create_access_token
from app.models.user import User
from app.schemas.user import UserCreate

logger = structlog.get_logger()


class UserService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_user(self, data: UserCreate) -> User:
        existing = await self.get_by_email(data.email)
        if existing:
            raise ValueError("Email already registered")

        user = User(
            email=data.email,
            password_hash=hash_password(data.password),
            full_name=data.full_name,
            phone=data.phone,
        )
        self.db.add(user)
        await self.db.flush()
        logger.info("user_created", user_id=str(user.id))
        return user

    async def authenticate(self, email: str, password: str) -> Optional[str]:
        """Authenticate a user and return a JWT token, or None on failure."""
        user = await self.get_by_email(email)
        if not user or not verify_password(password, user.password_hash):
            return None
        if not user.is_active:
            return None
        return create_access_token(str(user.id), user.role.value)

    async def get_by_id(self, user_id: uuid.UUID) -> Optional[User]:
        result = await self.db.execute(select(User).where(User.id == user_id))
        return result.scalar_one_or_none()

    async def get_by_email(self, email: str) -> Optional[User]:
        result = await self.db.execute(select(User).where(User.email == email))
        return result.scalar_one_or_none()

    async def update_profile(self, user: User, full_name: str = None, phone: str = None) -> User:
        if full_name is not None:
            user.full_name = full_name
        if phone is not None:
            user.phone = phone
        self.db.add(user)
        await self.db.flush()
        return user
