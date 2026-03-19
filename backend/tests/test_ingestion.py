import pytest
from datetime import date

from app.ingestion.normalizer import (
    normalize_record,
    parse_price,
    parse_date,
    parse_area,
    clean_bank_name,
    normalize_state,
    extract_pincode,
)


class TestNormalizer:
    def test_parse_price_numeric(self):
        assert parse_price(5000000) == 5000000.0
        assert parse_price(5000000.50) == 5000000.50

    def test_parse_price_string_with_commas(self):
        assert parse_price("50,00,000") == 5000000.0

    def test_parse_price_crore(self):
        result = parse_price("1.5 Crore")
        assert result == 15000000.0

    def test_parse_price_lakh(self):
        result = parse_price("85 Lakh")
        assert result == 8500000.0

    def test_parse_price_with_rupee_symbol(self):
        result = parse_price("₹50,00,000")
        assert result == 5000000.0

    def test_parse_price_none(self):
        assert parse_price(None) is None
        assert parse_price("") is None

    def test_parse_date_string(self):
        result = parse_date("15/04/2026")
        assert result == date(2026, 4, 15)

    def test_parse_date_iso(self):
        result = parse_date("2026-04-15")
        assert result == date(2026, 4, 15)

    def test_parse_date_none(self):
        assert parse_date(None) is None

    def test_parse_area_with_unit(self):
        assert parse_area("1200 sq ft") == 1200.0
        assert parse_area("1,500 sqft") == 1500.0

    def test_parse_area_numeric(self):
        assert parse_area(950) == 950.0

    def test_clean_bank_name_abbreviation(self):
        assert clean_bank_name("SBI") == "State Bank of India"
        assert clean_bank_name("PNB") == "Punjab National Bank"

    def test_clean_bank_name_full(self):
        assert clean_bank_name("HDFC Bank") == "HDFC Bank"

    def test_normalize_state(self):
        assert normalize_state("MH") == "Maharashtra"
        assert normalize_state("KA") == "Karnataka"
        assert normalize_state("DL") == "Delhi"
        assert normalize_state("Tamil Nadu") == "Tamil Nadu"

    def test_extract_pincode_from_field(self):
        assert extract_pincode({"pin_code": "400058"}) == "400058"

    def test_extract_pincode_from_address(self):
        result = extract_pincode({
            "address": "Flat 302, MG Road, Pune 411001"
        })
        assert result == "411001"

    def test_normalize_full_record(self):
        raw = {
            "bank_name": "SBI",
            "property_type": "Flat",
            "address": "Flat 201, Sunrise Towers, Andheri",
            "city": "mumbai",
            "state": "MH",
            "reserve_price": "85 Lakh",
            "emd_amount": "8,50,000",
            "auction_date": "15/04/2026",
            "area_sqft": "950 sq ft",
        }
        result = normalize_record(raw)

        assert result["bank_name"] == "State Bank of India"
        assert result["city"] == "Mumbai"
        assert result["state"] == "Maharashtra"
        assert result["reserve_price"] == 8500000.0
        assert result["emd_amount"] == 850000.0
        assert result["auction_date"] == date(2026, 4, 15)
        assert result["area_sqft"] == 950.0
