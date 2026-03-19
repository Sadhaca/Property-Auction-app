import structlog
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.jwt import create_access_token, get_current_user
from app.auth.security import hash_password, verify_password
from app.db.session import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserLogin, UserResponse, UserUpdate, Token

logger = structlog.get_logger()
router = APIRouter()


@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
async def register(payload: UserCreate, db: AsyncSession = Depends(get_db)):
    """Register a new user account."""
    result = await db.execute(select(User).where(User.email == payload.email))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(
        email=payload.email,
        password_hash=hash_password(payload.password),
        full_name=payload.full_name,
        phone=payload.phone,
    )
    db.add(user)
    await db.flush()

    token = create_access_token(str(user.id), user.role.value)
    logger.info("user_registered", user_id=str(user.id), email=user.email)
    return Token(access_token=token)


@router.post("/login", response_model=Token)
async def login(payload: UserLogin, db: AsyncSession = Depends(get_db)):
    """Authenticate and receive a JWT token."""
    result = await db.execute(select(User).where(User.email == payload.email))
    user = result.scalar_one_or_none()

    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account is deactivated")

    token = create_access_token(str(user.id), user.role.value)
    logger.info("user_login", user_id=str(user.id))
    return Token(access_token=token)


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    """Get current user profile."""
    return current_user


@router.put("/me", response_model=UserResponse)
async def update_me(
    payload: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update current user profile."""
    if payload.full_name is not None:
        current_user.full_name = payload.full_name
    if payload.phone is not None:
        current_user.phone = payload.phone
    db.add(current_user)
    await db.flush()
    return current_user
