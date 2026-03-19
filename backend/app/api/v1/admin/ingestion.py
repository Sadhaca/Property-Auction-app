import uuid

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.jwt import get_admin_user
from app.db.session import get_db
from app.models.ingestion import IngestionJob, IngestionLog, JobStatus
from app.models.user import User

router = APIRouter()


@router.get("/jobs")
async def list_jobs(
    admin: User = Depends(get_admin_user),
    status_filter: str | None = Query(None, alias="status"),
    limit: int = Query(50, ge=1, le=200),
    db: AsyncSession = Depends(get_db),
):
    """List ingestion jobs with optional status filter."""
    query = select(IngestionJob).order_by(IngestionJob.created_at.desc()).limit(limit)
    if status_filter:
        query = query.where(IngestionJob.status == status_filter)
    result = await db.execute(query)
    jobs = result.scalars().all()
    return [
        {
            "id": str(j.id),
            "source_id": str(j.source_id),
            "status": j.status.value,
            "started_at": j.started_at,
            "completed_at": j.completed_at,
            "records_found": j.records_found,
            "records_new": j.records_new,
            "records_updated": j.records_updated,
            "records_failed": j.records_failed,
            "error_log": j.error_log,
            "created_at": j.created_at,
        }
        for j in jobs
    ]


@router.get("/summary")
async def ingestion_summary(
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """Aggregate ingestion statistics."""
    total_result = await db.execute(select(func.count(IngestionJob.id)))
    total_jobs = total_result.scalar()

    completed_result = await db.execute(
        select(func.count(IngestionJob.id)).where(IngestionJob.status == JobStatus.completed)
    )
    completed = completed_result.scalar()

    failed_result = await db.execute(
        select(func.count(IngestionJob.id)).where(IngestionJob.status == JobStatus.failed)
    )
    failed = failed_result.scalar()

    records_result = await db.execute(
        select(
            func.coalesce(func.sum(IngestionJob.records_new), 0),
            func.coalesce(func.sum(IngestionJob.records_updated), 0),
        )
    )
    row = records_result.one()

    return {
        "total_jobs": total_jobs,
        "completed": completed,
        "failed": failed,
        "total_records_new": int(row[0]),
        "total_records_updated": int(row[1]),
    }


@router.get("/jobs/{job_id}/logs")
async def get_job_logs(
    job_id: uuid.UUID,
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """Get logs for a specific ingestion job."""
    job_result = await db.execute(select(IngestionJob).where(IngestionJob.id == job_id))
    if not job_result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Job not found")

    result = await db.execute(
        select(IngestionLog)
        .where(IngestionLog.job_id == job_id)
        .order_by(IngestionLog.created_at.desc())
    )
    logs = result.scalars().all()
    return [
        {
            "id": str(log.id),
            "property_id": str(log.property_id) if log.property_id else None,
            "action": log.action.value,
            "details": log.details,
            "created_at": log.created_at,
        }
        for log in logs
    ]
