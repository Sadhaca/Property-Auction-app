"""Normalize raw scraped data to a common AuctionProperty schema."""
import re
from datetime import datetime, date
from typing import Any, Optional

import structlog
from dateutil import parser as date_parser

logger = structlog.get_logger()

# Indian state name normalization
STATE_ALIASES = {
    "AP": "Andhra Pradesh", "AR": "Arunachal Pradesh", "AS": "Assam",
    "BR": "Bihar", "CG": "Chhattisgarh", "GA": "Goa", "GJ": "Gujarat",
    "HR": "Haryana", "HP": "Himachal Pradesh", "JK": "Jammu and Kashmir",
    "JH": "Jharkhand", "KA": "Karnataka", "KL": "Kerala", "MP": "Madhya Pradesh",
    "MH": "Maharashtra", "MN": "Manipur", "ML": "Meghalaya", "MZ": "Mizoram",
    "NL": "Nagaland", "OD": "Odisha", "OR": "Odisha", "PB": "Punjab",
    "RJ": "Rajasthan", "SK": "Sikkim", "TN": "Tamil Nadu", "TS": "Telangana",
    "TR": "Tripura", "UP": "Uttar Pradesh", "UK": "Uttarakhand",
    "WB": "West Bengal", "DL": "Delhi", "NCT": "Delhi",
}


def normalize_record(raw: dict) -> dict:
    """Normalize a raw scraped record to the common schema."""
    return {
        "source_reference": raw.get("source_reference") or raw.get("ref_no"),
        "bank_name": clean_bank_name(raw.get("bank_name", "")),
        "bank_branch": raw.get("bank_branch") or raw.get("branch"),
        "title": build_title(raw),
        "description": raw.get("description") or raw.get("details"),
        "property_type": normalize_property_type(raw.get("property_type", "")),
        "property_subtype": normalize_property_subtype(raw.get("property_subtype", "")),
        "address": clean_address(raw.get("address", "")),
        "locality": raw.get("locality") or raw.get("area"),
        "district": raw.get("district"),
        "city": clean_city(raw.get("city", "")),
        "state": normalize_state(raw.get("state", "")),
        "pin_code": extract_pincode(raw),
        "reserve_price": parse_price(raw.get("reserve_price")),
        "emd_amount": parse_price(raw.get("emd_amount") or raw.get("emd")),
        "bid_increment": parse_price(raw.get("bid_increment")),
        "auction_date": parse_date(raw.get("auction_date")),
        "auction_time": raw.get("auction_time"),
        "inspection_date": parse_date(raw.get("inspection_date")),
        "possession_status": raw.get("possession_status", "unknown"),
        "borrower_name": raw.get("borrower_name") or raw.get("borrower"),
        "contact_person": raw.get("contact_person"),
        "contact_phone": raw.get("contact_phone") or raw.get("phone"),
        "contact_email": raw.get("contact_email") or raw.get("email"),
        "area_sqft": parse_area(raw.get("area_sqft") or raw.get("area")),
        "raw_data": raw,
    }


def clean_bank_name(name: str) -> str:
    name = name.strip()
    # Standardize common bank abbreviations
    replacements = {
        "SBI": "State Bank of India",
        "PNB": "Punjab National Bank",
        "BOB": "Bank of Baroda",
        "BOI": "Bank of India",
        "UCO": "UCO Bank",
        "IOB": "Indian Overseas Bank",
    }
    upper = name.upper()
    return replacements.get(upper, name) if name else ""


def build_title(raw: dict) -> str:
    parts = []
    if raw.get("property_type"):
        parts.append(raw["property_type"].title())
    if raw.get("locality") or raw.get("area"):
        parts.append(f"in {raw.get('locality') or raw.get('area')}")
    if raw.get("city"):
        parts.append(f", {raw['city']}")
    if raw.get("bank_name"):
        parts.append(f"- {raw['bank_name']}")
    title = " ".join(parts)
    return title if title else raw.get("title", "Auction Property")


def clean_address(address: str) -> str:
    if not address:
        return ""
    address = re.sub(r"\s+", " ", address).strip()
    address = re.sub(r",\s*,", ",", address)
    return address


def clean_city(city: str) -> str:
    if not city:
        return ""
    return city.strip().title()


def normalize_state(state: str) -> str:
    if not state:
        return ""
    state = state.strip().upper()
    if state in STATE_ALIASES:
        return STATE_ALIASES[state]
    return state.title()


def normalize_property_type(pt: str) -> Optional[str]:
    if not pt:
        return None
    pt_lower = pt.lower().strip()
    mapping = {
        "residential": "residential", "flat": "residential", "house": "residential",
        "apartment": "residential", "villa": "residential",
        "commercial": "commercial", "shop": "commercial", "office": "commercial",
        "showroom": "commercial",
        "land": "land", "plot": "land", "agricultural": "agricultural",
        "farm": "agricultural", "industrial": "industrial", "factory": "industrial",
        "warehouse": "industrial",
    }
    return mapping.get(pt_lower, pt_lower)


def normalize_property_subtype(ps: str) -> Optional[str]:
    if not ps:
        return None
    ps_lower = ps.lower().strip()
    valid = {"flat", "house", "plot", "building", "office", "warehouse", "factory", "shop"}
    return ps_lower if ps_lower in valid else None


def extract_pincode(raw: dict) -> Optional[str]:
    pin = raw.get("pin_code") or raw.get("pincode")
    if pin:
        pin = str(pin).strip()
        if re.match(r"^\d{6}$", pin):
            return pin
    # Try to extract from address
    address = raw.get("address", "")
    match = re.search(r"\b(\d{6})\b", address)
    return match.group(1) if match else None


def parse_price(value: Any) -> Optional[float]:
    """Parse price from various formats (string with commas/lakhs/crores, int, float)."""
    if value is None:
        return None
    if isinstance(value, (int, float)):
        return float(value)
    s = str(value).strip().lower().replace(",", "").replace("₹", "").replace("rs.", "").replace("rs", "").strip()
    if not s:
        return None

    multiplier = 1.0
    if "crore" in s or "cr" in s:
        multiplier = 10_000_000
        s = re.sub(r"(crore|cr\.?)", "", s).strip()
    elif "lakh" in s or "lac" in s:
        multiplier = 100_000
        s = re.sub(r"(lakh|lac|lacs)", "", s).strip()

    try:
        return float(s) * multiplier
    except ValueError:
        return None


def parse_date(value: Any) -> Optional[date]:
    if value is None:
        return None
    if isinstance(value, date):
        return value
    if isinstance(value, datetime):
        return value.date()
    try:
        return date_parser.parse(str(value), dayfirst=True).date()
    except (ValueError, TypeError):
        return None


def parse_area(value: Any) -> Optional[float]:
    if value is None:
        return None
    if isinstance(value, (int, float)):
        return float(value)
    s = str(value).strip().lower()
    # Remove unit suffixes
    s = re.sub(r"(sq\.?\s*ft\.?|sqft|sft|square\s*feet)", "", s).strip()
    try:
        return float(s.replace(",", ""))
    except ValueError:
        return None
