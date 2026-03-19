"""Celery Beat schedule configuration."""
from celery.schedules import crontab
from app.workers.celery_app import celery_app

celery_app.conf.beat_schedule = {
    "run-daily-ingestion": {
        "task": "run_daily_ingestion",
        "schedule": crontab(hour=2, minute=0),  # 2:00 AM IST daily
        "options": {"queue": "ingestion"},
    },
    "send-alerts": {
        "task": "send_alerts",
        "schedule": crontab(hour=8, minute=0),  # 8:00 AM IST daily
        "options": {"queue": "alerts"},
    },
    "generate-daily-summary": {
        "task": "generate_daily_summary",
        "schedule": crontab(hour=23, minute=30),  # 11:30 PM IST daily
        "options": {"queue": "default"},
    },
}
