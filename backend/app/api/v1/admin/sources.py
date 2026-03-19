import uuid
from datetime import datetime, timezone

import structlog
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.jwt import get_admin_user
from app.db.session import get_db
from app.models.source import Source, SourceType
from app.models.ingestion import IngestionJob, JobStatus
from app.models.user import User
from app.schemas.source import SourceCreate, SourceResponse, SourceUpdate

logger = structlog.get_logger()
router = APIRouter()


@router.get("", response_model=list[SourceResponse])
async def list_sources(
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Source).order_by(Source.created_at.desc()))
    return result.scalars().all()


@router.post("", response_model=SourceResponse, status_code=status.HTTP_201_CREATED)
async def create_source(
    payload: SourceCreate,
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    source = Source(
        name=payload.name,
        source_type=SourceType(payload.source_type),
        base_url=payload.base_url,
        crawler_module=payload.crawler_module,
        schedule_cron=payload.schedule_cron,
        is_active=payload.is_active,
        config=payload.config or {},
    )
    db.add(source)
    await db.flush()
    logger.info("source_created", source_id=str(source.id), name=source.name)
    return source


@router.get("/{source_id}", response_model=SourceResponse)
async def get_source(
    source_id: uuid.UUID,
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Source).where(Source.id == source_id))
    source = result.scalar_one_or_none()
    if not source:
        raise HTTPException(status_code=404, detail="Source not found")
    return source


@router.put("/{source_id}", response_model=SourceResponse)
async def update_source(
    source_id: uuid.UUID,
    payload: SourceUpdate,
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Source).where(Source.id == source_id))
    source = result.scalar_one_or_none()
    if not source:
        raise HTTPException(status_code=404, detail="Source not found")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(source, field, value)
    db.add(source)
    await db.flush()
    return source


@router.delete("/{source_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_source(
    source_id: uuid.UUID,
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Source).where(Source.id == source_id))
    source = result.scalar_one_or_none()
    if not source:
        raise HTTPException(status_code=404, detail="Source not found")
    await db.delete(source)


@router.post("/{source_id}/trigger")
async def trigger_source(
    source_id: uuid.UUID,
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """Manually trigger an ingestion job for a source."""
    result = await db.execute(select(Source).where(Source.id == source_id))
    source = result.scalar_one_or_none()
    if not source:
        raise HTTPException(status_code=404, detail="Source not found")

    job = IngestionJob(source_id=source.id, status=JobStatus.pending)
    db.add(job)
    await db.flush()

    logger.info("ingestion_triggered", source_id=str(source_id), job_id=str(job.id))
    return {"job_id": str(job.id), "status": "pending"}


@router.get("/{source_id}/jobs")
async def list_source_jobs(
    source_id: uuid.UUID,
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(IngestionJob)
        .where(IngestionJob.source_id == source_id)
        .order_by(IngestionJob.created_at.desc())
        .limit(50)
    )
    jobs = result.scalars().all()
    return [
        {
            "id": str(j.id),
            "status": j.status.value,
            "started_at": j.started_at,
            "completed_at": j.completed_at,
            "records_found": j.records_found,
            "records_new": j.records_new,
            "records_updated": j.records_updated,
            "records_failed": j.records_failed,
            "created_at": j.created_at,
        }
        for j in jobs
    ]
