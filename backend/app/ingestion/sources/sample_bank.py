"""Sample bank website crawler demonstrating the ingestion pattern.

This crawler shows how to implement BaseSourceCrawler for a hypothetical
bank auction listing page. Replace fetch/parse logic for real sources.
"""
from typing import Any

import structlog
from bs4 import BeautifulSoup

from app.ingestion.base import BaseSourceCrawler
from app.ingestion.normalizer import normalize_record

logger = structlog.get_logger()


class SampleBankCrawler(BaseSourceCrawler):
    """Crawler for a sample bank auction listing website."""

    async def fetch(self) -> list[Any]:
        """Fetch auction listing pages from the bank website."""
        base_url = self.source_config.get("base_url", "https://example-bank.com/auctions")
        pages = []
        max_pages = self.source_config.get("max_pages", 5)

        for page_num in range(1, max_pages + 1):
            url = f"{base_url}?page={page_num}"
            try:
                html = await self.fetch_url(url)
                pages.append(html)
                logger.info("page_fetched", url=url)
            except Exception as e:
                logger.warning("page_fetch_failed", url=url, error=str(e))
                break

        return pages

    def parse(self, raw_data: list[Any]) -> list[dict]:
        """Parse HTML pages into raw property dictionaries."""
        records = []
        for html in raw_data:
            soup = BeautifulSoup(html, "html.parser")
            # Example: each property is in a div.auction-item
            for item in soup.select(".auction-item"):
                try:
                    record = {
                        "source_reference": item.get("data-id", ""),
                        "bank_name": self.source_config.get("bank_name", "Sample Bank"),
                        "title": self._text(item, ".title"),
                        "property_type": self._text(item, ".property-type"),
                        "address": self._text(item, ".address"),
                        "city": self._text(item, ".city"),
                        "state": self._text(item, ".state"),
                        "reserve_price": self._text(item, ".reserve-price"),
                        "emd_amount": self._text(item, ".emd"),
                        "auction_date": self._text(item, ".auction-date"),
                        "area_sqft": self._text(item, ".area"),
                        "borrower_name": self._text(item, ".borrower"),
                        "contact_phone": self._text(item, ".contact"),
                        "description": self._text(item, ".description"),
                    }
                    records.append(record)
                except Exception as e:
                    logger.warning("parse_item_failed", error=str(e))
        return records

    def normalize(self, parsed_records: list[dict]) -> list[dict]:
        """Normalize parsed records using the common normalizer."""
        normalized = []
        for record in parsed_records:
            try:
                normalized.append(normalize_record(record))
            except Exception as e:
                logger.warning("normalize_failed", error=str(e))
        return normalized

    async def save(self, normalized_records: list[dict]) -> dict:
        """Save normalized records. In production, write to DB with dedup checks."""
        # This is a placeholder; real implementation would use DedupService and DB session
        stats = {
            "records_found": len(normalized_records),
            "records_new": len(normalized_records),
            "records_updated": 0,
            "records_failed": 0,
        }
        logger.info("sample_save", stats=stats)
        return stats

    @staticmethod
    def _text(element, selector: str) -> str:
        tag = element.select_one(selector)
        return tag.get_text(strip=True) if tag else ""
