"""Ingestion manager that orchestrates source crawling jobs."""
import importlib
from datetime import datetime, timezone

import structlog
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.source import Source
from app.models.ingestion import IngestionJob, JobStatus

logger = structlog.get_logger()


class IngestionManager:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def run_source(self, source: Source) -> IngestionJob:
        """Run ingestion for a single source, creating and tracking a job record."""
        job = IngestionJob(source_id=source.id, status=JobStatus.running)
        job.started_at = datetime.now(timezone.utc)
        self.db.add(job)
        await self.db.flush()

        try:
            crawler = self._load_crawler(source)
            stats = await crawler.run()

            job.status = JobStatus.completed
            job.records_found = stats.get("records_found", 0)
            job.records_new = stats.get("records_new", 0)
            job.records_updated = stats.get("records_updated", 0)
            job.records_failed = stats.get("records_failed", 0)

            source.last_run_at = datetime.now(timezone.utc)
            self.db.add(source)

            logger.info(
                "ingestion_completed",
                source=source.name,
                job_id=str(job.id),
                new=job.records_new,
                updated=job.records_updated,
            )
        except Exception as e:
            job.status = JobStatus.failed
            job.error_log = str(e)[:5000]
            logger.error("ingestion_failed", source=source.name, error=str(e))

        job.completed_at = datetime.now(timezone.utc)
        self.db.add(job)
        await self.db.flush()
        return job

    async def run_all_sources(self) -> list[IngestionJob]:
        """Run ingestion for all active sources."""
        result = await self.db.execute(select(Source).where(Source.is_active.is_(True)))
        sources = result.scalars().all()

        jobs = []
        for source in sources:
            try:
                job = await self.run_source(source)
                jobs.append(job)
            except Exception as e:
                logger.error("source_run_error", source=source.name, error=str(e))
        return jobs

    def _load_crawler(self, source: Source):
        """Dynamically load a crawler module for a source."""
        module_path = source.crawler_module
        if not module_path:
            raise ValueError(f"No crawler_module configured for source: {source.name}")

        try:
            module_name, class_name = module_path.rsplit(".", 1)
            module = importlib.import_module(module_name)
            crawler_class = getattr(module, class_name)
            return crawler_class(source_config=source.config or {})
        except (ImportError, AttributeError) as e:
            raise ValueError(f"Cannot load crawler '{module_path}': {e}")
