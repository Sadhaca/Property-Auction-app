import uuid

import structlog
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.jwt import get_current_user
from app.db.session import get_db
from app.models.saved_search import SavedSearch
from app.models.user import User
from app.schemas.search import SavedSearchCreate, SavedSearchResponse, AlertCreate

logger = structlog.get_logger()
router = APIRouter()


@router.get("", response_model=list[SavedSearchResponse])
async def list_saved_searches(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List all saved searches for the current user."""
    result = await db.execute(
        select(SavedSearch).where(SavedSearch.user_id == current_user.id)
    )
    return result.scalars().all()


@router.post("", response_model=SavedSearchResponse, status_code=status.HTTP_201_CREATED)
async def create_saved_search(
    payload: SavedSearchCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new saved search."""
    search = SavedSearch(
        user_id=current_user.id,
        name=payload.name,
        filters=payload.filters,
        alert_enabled=payload.alert_enabled,
        alert_frequency=payload.alert_frequency,
    )
    db.add(search)
    await db.flush()
    return search


@router.get("/{search_id}", response_model=SavedSearchResponse)
async def get_saved_search(
    search_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(SavedSearch).where(
            SavedSearch.id == search_id, SavedSearch.user_id == current_user.id
        )
    )
    search = result.scalar_one_or_none()
    if not search:
        raise HTTPException(status_code=404, detail="Saved search not found")
    return search


@router.delete("/{search_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_saved_search(
    search_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(SavedSearch).where(
            SavedSearch.id == search_id, SavedSearch.user_id == current_user.id
        )
    )
    search = result.scalar_one_or_none()
    if not search:
        raise HTTPException(status_code=404, detail="Saved search not found")
    await db.delete(search)


@router.post("/{search_id}/alert", response_model=SavedSearchResponse)
async def toggle_alert(
    search_id: uuid.UUID,
    payload: AlertCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Enable or disable alert on a saved search."""
    result = await db.execute(
        select(SavedSearch).where(
            SavedSearch.id == search_id, SavedSearch.user_id == current_user.id
        )
    )
    search = result.scalar_one_or_none()
    if not search:
        raise HTTPException(status_code=404, detail="Saved search not found")

    search.alert_enabled = payload.alert_enabled
    search.alert_frequency = payload.alert_frequency
    db.add(search)
    await db.flush()
    return search
