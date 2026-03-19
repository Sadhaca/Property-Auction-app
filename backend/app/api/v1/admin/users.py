import uuid

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.jwt import get_admin_user
from app.db.session import get_db
from app.models.user import User, UserRole
from app.schemas.user import UserResponse

router = APIRouter()


class RoleUpdate(BaseModel):
    role: str


class StatusUpdate(BaseModel):
    is_active: bool


@router.get("", response_model=list[UserResponse])
async def list_users(
    admin: User = Depends(get_admin_user),
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=200),
    db: AsyncSession = Depends(get_db),
):
    """List all users (admin only)."""
    offset = (page - 1) * page_size
    result = await db.execute(
        select(User).order_by(User.created_at.desc()).offset(offset).limit(page_size)
    )
    return result.scalars().all()


@router.put("/{user_id}/role", response_model=UserResponse)
async def update_user_role(
    user_id: uuid.UUID,
    payload: RoleUpdate,
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """Update a user's role."""
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    try:
        user.role = UserRole(payload.role)
    except ValueError:
        raise HTTPException(status_code=400, detail=f"Invalid role: {payload.role}")

    db.add(user)
    await db.flush()
    return user


@router.put("/{user_id}/status", response_model=UserResponse)
async def update_user_status(
    user_id: uuid.UUID,
    payload: StatusUpdate,
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """Activate or deactivate a user account."""
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.is_active = payload.is_active
    db.add(user)
    await db.flush()
    return user
