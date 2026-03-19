from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.jwt import get_admin_user
from app.db.session import get_db
from app.models.audit_log import AuditLog
from app.models.user import User

router = APIRouter()


@router.get("/logs")
async def list_audit_logs(
    admin: User = Depends(get_admin_user),
    entity_type: Optional[str] = Query(None),
    action: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=200),
    db: AsyncSession = Depends(get_db),
):
    """List audit log entries with optional filters."""
    query = select(AuditLog).order_by(AuditLog.created_at.desc())

    if entity_type:
        query = query.where(AuditLog.entity_type == entity_type)
    if action:
        query = query.where(AuditLog.action == action)

    offset = (page - 1) * page_size
    query = query.offset(offset).limit(page_size)

    result = await db.execute(query)
    logs = result.scalars().all()

    return [
        {
            "id": str(log.id),
            "user_id": str(log.user_id) if log.user_id else None,
            "action": log.action,
            "entity_type": log.entity_type,
            "entity_id": log.entity_id,
            "details": log.details,
            "ip_address": log.ip_address,
            "created_at": log.created_at,
        }
        for log in logs
    ]
