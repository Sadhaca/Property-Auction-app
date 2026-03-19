"""OCR pipeline for extracting text from images and scanned PDFs."""
import io
import tempfile
from typing import Optional

import structlog

logger = structlog.get_logger()


def ocr_image(image_bytes: bytes) -> dict:
    """Run OCR on an image, returning text and confidence score.

    Returns:
        dict with "text" (str) and "confidence" (float 0-100).
    """
    try:
        from PIL import Image, ImageFilter, ImageEnhance
        import pytesseract

        img = Image.open(io.BytesIO(image_bytes))
        img = preprocess_image(img)

        # Extract text with confidence data
        data = pytesseract.image_to_data(img, output_type=pytesseract.Output.DICT, lang="eng+hin")

        texts = []
        confidences = []
        for i, conf in enumerate(data["conf"]):
            if int(conf) > 0:
                texts.append(data["text"][i])
                confidences.append(int(conf))

        text = " ".join(texts)
        avg_confidence = sum(confidences) / len(confidences) if confidences else 0.0

        return {"text": text, "confidence": round(avg_confidence, 1)}
    except Exception as e:
        logger.error("ocr_image_failed", error=str(e))
        return {"text": "", "confidence": 0.0}


def preprocess_image(img) -> "Image.Image":
    """Preprocess an image to improve OCR accuracy."""
    from PIL import ImageFilter, ImageEnhance

    # Convert to grayscale
    img = img.convert("L")
    # Increase contrast
    enhancer = ImageEnhance.Contrast(img)
    img = enhancer.enhance(2.0)
    # Sharpen
    img = img.filter(ImageFilter.SHARPEN)
    # Resize for better OCR (if small)
    width, height = img.size
    if width < 1000:
        scale = 1000 / width
        img = img.resize((int(width * scale), int(height * scale)))
    return img


def ocr_pdf_bytes(pdf_bytes: bytes) -> str:
    """Convert PDF pages to images and run OCR on each page."""
    try:
        import pdfplumber
        from PIL import Image
        import pytesseract

        all_text = []
        with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
            for i, page in enumerate(pdf.pages):
                # Convert page to image
                pil_image = page.to_image(resolution=300).original
                processed = preprocess_image(pil_image)
                page_text = pytesseract.image_to_string(processed, lang="eng+hin")
                if page_text.strip():
                    all_text.append(page_text)
                logger.debug("ocr_page_processed", page=i + 1)

        return "\n".join(all_text)
    except Exception as e:
        logger.error("ocr_pdf_failed", error=str(e))
        return ""


def calculate_confidence_score(ocr_result: dict) -> str:
    """Categorize OCR quality based on confidence score."""
    conf = ocr_result.get("confidence", 0)
    if conf >= 80:
        return "high"
    elif conf >= 50:
        return "medium"
    else:
        return "low"
