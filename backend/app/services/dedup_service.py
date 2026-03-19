"""Deduplication service for auction property records.

Uses multiple signals to detect duplicates:
  1. Exact source_id + source_reference match
  2. Fuzzy address matching
  3. Composite key: auction_date + bank_name + reserve_price
  4. Document fingerprinting via normalized text hash
"""
import hashlib
from dataclasses import dataclass
from typing import Optional

import structlog
from fuzzywuzzy import fuzz
from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.property import AuctionProperty

logger = structlog.get_logger()

FUZZY_THRESHOLD = 85  # minimum fuzz ratio for address match


@dataclass
class DedupResult:
    is_duplicate: bool
    match_score: float
    matched_property_id: Optional[str]
    action: str  # "merge", "skip", "review", "new"
    signals: list[str]


class DedupService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def check_duplicate(self, candidate: dict) -> DedupResult:
        """Check if a candidate property record is a duplicate of an existing one."""
        signals: list[str] = []
        best_score = 0.0
        best_match_id: Optional[str] = None

        # Signal 1: Exact source reference match
        if candidate.get("source_id") and candidate.get("source_reference"):
            result = await self.db.execute(
                select(AuctionProperty).where(
                    and_(
                        AuctionProperty.source_id == candidate["source_id"],
                        AuctionProperty.source_reference == candidate["source_reference"],
                    )
                )
            )
            match = result.scalar_one_or_none()
            if match:
                signals.append("exact_source_reference")
                return DedupResult(
                    is_duplicate=True,
                    match_score=1.0,
                    matched_property_id=str(match.id),
                    action="merge",
                    signals=signals,
                )

        # Signal 2: Composite key - auction_date + bank_name + reserve_price
        if candidate.get("auction_date") and candidate.get("bank_name") and candidate.get("reserve_price"):
            result = await self.db.execute(
                select(AuctionProperty).where(
                    and_(
                        AuctionProperty.auction_date == candidate["auction_date"],
                        AuctionProperty.bank_name == candidate["bank_name"],
                        AuctionProperty.reserve_price == candidate["reserve_price"],
                    )
                )
            )
            matches = result.scalars().all()
            for match in matches:
                score = 0.6
                # Boost if address also similar
                if candidate.get("address") and match.address:
                    addr_score = fuzz.token_sort_ratio(
                        candidate["address"].lower(), match.address.lower()
                    )
                    if addr_score >= FUZZY_THRESHOLD:
                        score += 0.3
                        signals.append(f"address_fuzzy_match({addr_score})")
                signals.append("composite_key_match")
                if score > best_score:
                    best_score = score
                    best_match_id = str(match.id)

        # Signal 3: Fuzzy address match within same city and bank
        if candidate.get("address") and candidate.get("city") and candidate.get("bank_name"):
            result = await self.db.execute(
                select(AuctionProperty).where(
                    and_(
                        AuctionProperty.city == candidate["city"],
                        AuctionProperty.bank_name == candidate["bank_name"],
                    )
                ).limit(100)
            )
            existing = result.scalars().all()
            for prop in existing:
                if not prop.address:
                    continue
                ratio = fuzz.token_sort_ratio(
                    candidate["address"].lower(), prop.address.lower()
                )
                if ratio >= FUZZY_THRESHOLD:
                    addr_score = ratio / 100.0
                    if addr_score > best_score:
                        best_score = addr_score
                        best_match_id = str(prop.id)
                        if "address_fuzzy_match" not in str(signals):
                            signals.append(f"address_fuzzy_match({ratio})")

        # Signal 4: Document text fingerprint
        raw_text = candidate.get("raw_text", "")
        if raw_text:
            fingerprint = self._text_fingerprint(raw_text)
            result = await self.db.execute(
                select(AuctionProperty).where(
                    AuctionProperty.raw_data["fingerprint"].as_string() == fingerprint
                ).limit(1)
            )
            fp_match = result.scalar_one_or_none()
            if fp_match:
                signals.append("document_fingerprint")
                best_score = max(best_score, 0.95)
                best_match_id = str(fp_match.id)

        # Decision
        if best_score >= 0.9:
            action = "merge"
        elif best_score >= 0.7:
            action = "review"
        elif best_score >= 0.5:
            action = "review"
        else:
            action = "new"

        return DedupResult(
            is_duplicate=best_score >= 0.7,
            match_score=round(best_score, 3),
            matched_property_id=best_match_id,
            action=action,
            signals=signals,
        )

    @staticmethod
    def _text_fingerprint(text: str) -> str:
        """Generate a normalized hash of text for fingerprint comparison."""
        normalized = " ".join(text.lower().split())
        return hashlib.sha256(normalized.encode()).hexdigest()[:32]
