import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.jwt import get_current_user
from app.db.session import get_db
from app.models.favorite import Favorite
from app.models.property import AuctionProperty
from app.models.user import User
from app.schemas.property import PropertyResponse

router = APIRouter()


@router.get("", response_model=list[PropertyResponse])
async def list_favorites(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get all favorited properties for the current user."""
    result = await db.execute(
        select(AuctionProperty)
        .join(Favorite, Favorite.property_id == AuctionProperty.id)
        .where(Favorite.user_id == current_user.id)
        .order_by(Favorite.created_at.desc())
    )
    return result.scalars().all()


@router.post("/{property_id}", status_code=status.HTTP_201_CREATED)
async def add_favorite(
    property_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Add a property to favorites."""
    # Check property exists
    prop_result = await db.execute(
        select(AuctionProperty).where(AuctionProperty.id == property_id)
    )
    if not prop_result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Property not found")

    # Check not already favorited
    existing = await db.execute(
        select(Favorite).where(
            Favorite.user_id == current_user.id, Favorite.property_id == property_id
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Already in favorites")

    fav = Favorite(user_id=current_user.id, property_id=property_id)
    db.add(fav)
    await db.flush()
    return {"detail": "Added to favorites"}


@router.delete("/{property_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_favorite(
    property_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Remove a property from favorites."""
    result = await db.execute(
        select(Favorite).where(
            Favorite.user_id == current_user.id, Favorite.property_id == property_id
        )
    )
    fav = result.scalar_one_or_none()
    if not fav:
        raise HTTPException(status_code=404, detail="Favorite not found")
    await db.delete(fav)
