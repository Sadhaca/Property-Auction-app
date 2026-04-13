import asyncio
import structlog
from app.workers.celery_app import celery_app
from app.db.session import async_session_factory
from app.ingestion.manager import IngestionManager

logger = structlog.get_logger()


def _run_ingestion(method: str, source_id: str | None = None):
    """Run an IngestionManager method in a fresh event loop."""
    async def _execute():
        async with async_session_factory() as db:
            manager = IngestionManager(db)
            fn = getattr(manager, method)
            result = await (fn(source_id) if source_id else fn())
            logger.info("ingestion_complete", method=method, source_id=source_id)
            return result

    loop = asyncio.new_event_loop()
    try:
        return loop.run_until_complete(_execute())
    finally:
        loop.close()


@celery_app.task(name="app.workers.tasks.run_source_ingestion")
def run_source_ingestion(source_id: str):
    """Run ingestion for a single source."""
    return _run_ingestion("run_source", source_id)


@celery_app.task(name="app.workers.tasks.run_all_ingestion")
def run_all_ingestion():
    """Run ingestion for all active sources."""
    return _run_ingestion("run_all_sources")
