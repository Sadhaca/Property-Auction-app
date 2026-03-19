"""Celery tasks for background processing."""
import asyncio
from datetime import datetime, timezone

import structlog

from app.workers.celery_app import celery_app

logger = structlog.get_logger()


def _run_async(coro):
    """Helper to run async code in Celery sync workers."""
    loop = asyncio.new_event_loop()
    try:
        return loop.run_until_complete(coro)
    finally:
        loop.close()


@celery_app.task(name="run_daily_ingestion", bind=True, max_retries=2)
def run_daily_ingestion(self):
    """Run ingestion for all active sources (daily scheduled task)."""
    logger.info("daily_ingestion_started")
    try:
        _run_async(_run_all_sources())
        logger.info("daily_ingestion_completed")
    except Exception as exc:
        logger.error("daily_ingestion_failed", error=str(exc))
        raise self.retry(exc=exc, countdown=300)


@celery_app.task(name="run_source_ingestion", bind=True, max_retries=2)
def run_source_ingestion(self, source_id: str):
    """Run ingestion for a specific source."""
    logger.info("source_ingestion_started", source_id=source_id)
    try:
        _run_async(_run_single_source(source_id))
    except Exception as exc:
        logger.error("source_ingestion_failed", source_id=source_id, error=str(exc))
        raise self.retry(exc=exc, countdown=60)


@celery_app.task(name="process_document_ocr")
def process_document_ocr(document_id: str):
    """Process OCR for a property document."""
    logger.info("document_ocr_started", document_id=document_id)
    _run_async(_process_ocr(document_id))


@celery_app.task(name="send_alerts")
def send_alerts():
    """Check saved searches and send alerts for new matching properties."""
    logger.info("alert_check_started")
    _run_async(_send_alert_notifications())


@celery_app.task(name="generate_daily_summary")
def generate_daily_summary():
    """Generate daily summary report of ingestion activity."""
    logger.info("daily_summary_started")
    _run_async(_generate_summary())


# Async implementations

async def _run_all_sources():
    from app.db.session import async_session_factory
    from app.ingestion.manager import IngestionManager

    async with async_session_factory() as db:
        manager = IngestionManager(db)
        await manager.run_all_sources()
        await db.commit()


async def _run_single_source(source_id: str):
    import uuid
    from sqlalchemy import select
    from app.db.session import async_session_factory
    from app.models.source import Source
    from app.ingestion.manager import IngestionManager

    async with async_session_factory() as db:
        result = await db.execute(select(Source).where(Source.id == uuid.UUID(source_id)))
        source = result.scalar_one_or_none()
        if source:
            manager = IngestionManager(db)
            await manager.run_source(source)
            await db.commit()


async def _process_ocr(document_id: str):
    import uuid
    from sqlalchemy import select
    from app.db.session import async_session_factory
    from app.models.document import PropertyDocument, OCRStatus
    from app.ingestion.sources.pdf_parser import PDFParserCrawler

    async with async_session_factory() as db:
        result = await db.execute(
            select(PropertyDocument).where(PropertyDocument.id == uuid.UUID(document_id))
        )
        doc = result.scalar_one_or_none()
        if not doc:
            return

        doc.ocr_status = OCRStatus.processing
        db.add(doc)
        await db.flush()

        try:
            parser = PDFParserCrawler()
            extracted = await parser.process_pdf(doc.file_url)
            doc.ocr_text = extracted.get("raw_text", "")
            doc.ai_extraction = {k: v for k, v in extracted.items() if k != "raw_text"}
            doc.ocr_status = OCRStatus.completed
        except Exception as e:
            doc.ocr_status = OCRStatus.failed
            logger.error("ocr_processing_failed", document_id=document_id, error=str(e))

        db.add(doc)
        await db.commit()


async def _send_alert_notifications():
    from sqlalchemy import select
    from app.db.session import async_session_factory
    from app.models.saved_search import SavedSearch

    async with async_session_factory() as db:
        result = await db.execute(
            select(SavedSearch).where(SavedSearch.alert_enabled.is_(True))
        )
        searches = result.scalars().all()
        for search in searches:
            # In production: run the search filters, compare with last_alerted_at,
            # and send email/push notification for new matches
            search.last_alerted_at = datetime.now(timezone.utc)
            db.add(search)

        await db.commit()
        logger.info("alerts_processed", count=len(searches))


async def _generate_summary():
    from sqlalchemy import select, func
    from datetime import timedelta
    from app.db.session import async_session_factory
    from app.models.ingestion import IngestionJob

    async with async_session_factory() as db:
        yesterday = datetime.now(timezone.utc) - timedelta(days=1)
        result = await db.execute(
            select(
                func.count(IngestionJob.id),
                func.coalesce(func.sum(IngestionJob.records_new), 0),
                func.coalesce(func.sum(IngestionJob.records_updated), 0),
            ).where(IngestionJob.created_at >= yesterday)
        )
        row = result.one()
        logger.info(
            "daily_summary",
            jobs=row[0],
            new_records=int(row[1]),
            updated_records=int(row[2]),
        )
