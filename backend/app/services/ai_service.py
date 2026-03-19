"""AI-powered services using OpenAI for property data enrichment."""
import json
from typing import Optional

import structlog
from openai import AsyncOpenAI
from tenacity import retry, stop_after_attempt, wait_exponential

from app.config import settings

logger = structlog.get_logger()


class AIService:
    def __init__(self):
        self._client: Optional[AsyncOpenAI] = None

    @property
    def client(self) -> AsyncOpenAI:
        if self._client is None:
            self._client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
        return self._client

    @retry(stop=stop_after_attempt(3), wait=wait_exponential(min=1, max=10))
    async def _chat(self, system_prompt: str, user_prompt: str, model: str = "gpt-4o-mini") -> str:
        response = await self.client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            temperature=0.2,
            max_tokens=2000,
        )
        return response.choices[0].message.content or ""

    async def extract_structured_fields(self, raw_text: str) -> dict:
        """Extract structured property fields from raw unstructured text."""
        system = (
            "You are an expert at extracting structured data from Indian property auction notices. "
            "Return valid JSON with these fields: bank_name, bank_branch, borrower_name, "
            "property_type, address, city, state, pin_code, reserve_price, emd_amount, "
            "auction_date, area_sqft, possession_status, contact_person, contact_phone. "
            "Use null for missing fields. Prices should be numeric (in INR). Dates as YYYY-MM-DD."
        )
        result = await self._chat(system, f"Extract fields from:\n\n{raw_text[:4000]}")
        try:
            # Strip markdown code fences if present
            cleaned = result.strip()
            if cleaned.startswith("```"):
                cleaned = cleaned.split("\n", 1)[1].rsplit("```", 1)[0]
            return json.loads(cleaned)
        except json.JSONDecodeError:
            logger.warning("ai_extraction_json_parse_failed", raw_response=result[:200])
            return {}

    async def summarize_property(self, property_data: dict) -> str:
        """Generate a concise human-readable summary of an auction property."""
        system = (
            "Summarize this Indian bank auction property in 2-3 sentences. "
            "Highlight key details: location, property type, price, auction date, and any risks."
        )
        user_text = json.dumps(
            {k: v for k, v in property_data.items() if v is not None}, default=str
        )
        return await self._chat(system, user_text)

    async def generate_risk_score(self, property_data: dict) -> float:
        """Generate a risk score (0-100) for an auction property. Higher = riskier."""
        system = (
            "Analyze this Indian auction property and assign a risk score from 0-100. "
            "Consider: possession status (symbolic=high risk), encumbrances, data completeness, "
            "price vs area ratio, location tier. Return ONLY a number."
        )
        user_text = json.dumps(
            {k: v for k, v in property_data.items() if v is not None}, default=str
        )
        result = await self._chat(system, user_text)
        try:
            score = float(result.strip())
            return max(0.0, min(100.0, score))
        except ValueError:
            return 50.0

    async def generate_completeness_score(self, property_data: dict) -> float:
        """Score data completeness and quality (0-100)."""
        key_fields = [
            "bank_name", "title", "property_type", "address", "city", "state",
            "reserve_price", "auction_date", "emd_amount", "contact_person",
            "contact_phone", "area_sqft", "description", "pin_code",
        ]
        filled = sum(1 for f in key_fields if property_data.get(f) is not None)
        return round((filled / len(key_fields)) * 100, 1)

    async def tag_property_type(self, description: str) -> dict:
        """Identify property_type and property_subtype from description text."""
        system = (
            "Given a property description from an Indian bank auction, "
            "identify the property_type (residential/commercial/land/industrial/agricultural) "
            "and property_subtype (flat/house/plot/building/office/warehouse/factory/shop). "
            'Return JSON: {"property_type": "...", "property_subtype": "..."}'
        )
        result = await self._chat(system, description[:2000])
        try:
            cleaned = result.strip()
            if cleaned.startswith("```"):
                cleaned = cleaned.split("\n", 1)[1].rsplit("```", 1)[0]
            return json.loads(cleaned)
        except json.JSONDecodeError:
            return {}

    async def identify_location(self, text: str) -> dict:
        """Extract location components from unstructured text."""
        system = (
            "Extract location information from this Indian property text. "
            'Return JSON: {"address": "...", "locality": "...", "city": "...", '
            '"district": "...", "state": "...", "pin_code": "..."}. Use null for missing.'
        )
        result = await self._chat(system, text[:2000])
        try:
            cleaned = result.strip()
            if cleaned.startswith("```"):
                cleaned = cleaned.split("\n", 1)[1].rsplit("```", 1)[0]
            return json.loads(cleaned)
        except json.JSONDecodeError:
            return {}


ai_service = AIService()
