"""PDF ingestion: download PDF, extract text, OCR fallback, AI extraction."""
import io
import tempfile
from typing import Any, Optional

import structlog
import httpx

logger = structlog.get_logger()


class PDFParserCrawler:
    """Processes auction notice PDFs.

    Pipeline: download -> extract text (pdfplumber) -> OCR fallback -> AI extraction.
    """

    def __init__(self, source_config: dict | None = None):
        self.source_config = source_config or {}

    async def process_pdf(self, pdf_url: str) -> dict:
        """Download and process a single PDF, returning extracted property data."""
        pdf_bytes = await self._download(pdf_url)
        text = self._extract_text(pdf_bytes)

        if not text or len(text.strip()) < 50:
            logger.info("pdf_text_extraction_poor_fallback_to_ocr", url=pdf_url)
            text = self._ocr_fallback(pdf_bytes)

        if not text:
            logger.warning("pdf_no_text_extracted", url=pdf_url)
            return {"raw_text": "", "source_url": pdf_url}

        # AI extraction if available
        extracted = await self._ai_extract(text)
        extracted["raw_text"] = text
        extracted["source_url"] = pdf_url
        return extracted

    async def _download(self, url: str) -> bytes:
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.get(url)
            response.raise_for_status()
            return response.content

    def _extract_text(self, pdf_bytes: bytes) -> str:
        """Extract text from PDF using pdfplumber."""
        try:
            import pdfplumber

            text_parts = []
            with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
                for page in pdf.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text_parts.append(page_text)
            return "\n".join(text_parts)
        except Exception as e:
            logger.warning("pdfplumber_extraction_failed", error=str(e))
            return ""

    def _ocr_fallback(self, pdf_bytes: bytes) -> str:
        """Convert PDF pages to images and OCR them."""
        try:
            from app.ingestion.ocr import ocr_pdf_bytes
            return ocr_pdf_bytes(pdf_bytes)
        except Exception as e:
            logger.warning("ocr_fallback_failed", error=str(e))
            return ""

    async def _ai_extract(self, text: str) -> dict:
        """Use AI service to extract structured fields from text."""
        try:
            from app.services.ai_service import ai_service
            return await ai_service.extract_structured_fields(text)
        except Exception as e:
            logger.warning("ai_extraction_failed", error=str(e))
            return {}
