"""Abstract base class for all source crawlers."""
import abc
from typing import Any

import structlog
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type
import httpx

logger = structlog.get_logger()


class BaseSourceCrawler(abc.ABC):
    """Base class that all source crawlers must implement.

    The pipeline is: fetch() -> parse() -> normalize() -> save()
    """

    def __init__(self, source_config: dict | None = None):
        self.source_config = source_config or {}
        self.http_client = httpx.AsyncClient(
            timeout=30.0,
            follow_redirects=True,
            headers={"User-Agent": "AuctionPropertyBot/1.0"},
        )

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=30),
        retry=retry_if_exception_type((httpx.HTTPError, ConnectionError)),
    )
    async def fetch_url(self, url: str) -> str:
        """Fetch a URL with retry logic."""
        response = await self.http_client.get(url)
        response.raise_for_status()
        return response.text

    @abc.abstractmethod
    async def fetch(self) -> list[Any]:
        """Fetch raw data from the source. Returns list of raw records."""
        ...

    @abc.abstractmethod
    def parse(self, raw_data: Any) -> list[dict]:
        """Parse raw data into a list of dictionaries."""
        ...

    @abc.abstractmethod
    def normalize(self, parsed_records: list[dict]) -> list[dict]:
        """Normalize parsed records to the common AuctionProperty schema."""
        ...

    @abc.abstractmethod
    async def save(self, normalized_records: list[dict]) -> dict:
        """Save normalized records to the database. Returns summary stats."""
        ...

    async def run(self) -> dict:
        """Execute the full pipeline: fetch -> parse -> normalize -> save."""
        logger.info("crawler_started", crawler=self.__class__.__name__)
        try:
            raw_data = await self.fetch()
            parsed = self.parse(raw_data)
            normalized = self.normalize(parsed)
            stats = await self.save(normalized)
            logger.info(
                "crawler_completed",
                crawler=self.__class__.__name__,
                records=len(normalized),
                stats=stats,
            )
            return stats
        except Exception as e:
            logger.error("crawler_failed", crawler=self.__class__.__name__, error=str(e))
            raise
        finally:
            await self.http_client.aclose()
