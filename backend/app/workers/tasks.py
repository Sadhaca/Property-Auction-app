import asyncio
import structlog
from app.workers.celery_app import celery_app
from app.db.session import async_session_factory
from app.ingestion.manager import IngestionManager

logger = structlog.get_logger()


def run_async(coro):
    """Helper to run async code inside Celery sync tasks."""
    loop = asyncio.new_event_loop()
    try:
        return loop.run_until_complete(coro)
    finally:
        loop.close()


@celery_app.task(name="app.workers.tasks.run_source_ingestion")
def run_source_ingestion(source_id: str):
    """Run ingestion for a single source."""
    async def _run():
        async with async_session_factory() as db:
            manager = IngestionManager(db)
            result = await manager.run_source(source_id)
            logger.info("ingestion_complete", source_id=source_id, result=result)
            return result

    return run_async(_run())


@celery_app.task(name="app.workers.tasks.run_all_ingestion")
def run_all_ingestion():
    """Run ingestion for all active sources."""
    async def _run():
        async with async_session_factory() as db:
            manager = IngestionManager(db)
            results = await manager.run_all_sources()
            logger.info("all_ingestion_complete", results=results)
            return results

    return run_async(_run())
