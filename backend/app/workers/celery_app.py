from celery import Celery
from app.config import settings

celery_app = Celery(
    "auction_workers",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL,
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="Asia/Kolkata",
    enable_utc=True,
    task_track_started=True,
    task_time_limit=3600,
    task_soft_time_limit=3300,
    worker_prefetch_multiplier=1,
    worker_max_tasks_per_child=100,
)

celery_app.conf.beat_schedule = {
    "run-all-sources-daily": {
        "task": "app.workers.tasks.run_all_ingestion",
        "schedule": 86400.0,
    },
}
