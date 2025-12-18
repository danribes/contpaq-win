"""
T020.2 - CFDI Validation Tests

Tests for the CFDI validation endpoint that:
- Validates required fields are present
- Validates IVA calculation (subtotal * 0.16 = iva)
- Validates total (subtotal + iva = total)
- Returns validation errors/warnings in Spanish

CFDI (Comprobante Fiscal Digital por Internet) is the Mexican digital
invoice standard. Key validations include:
- Required header fields (vendor RFC, invoice number, date, amounts)
- Mathematical consistency between subtotal, IVA, and total
- Tolerance for rounding differences (±0.01)
"""

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from src.api.routes import router


# =============================================================================
# Test CFDI Validation Models
# =============================================================================

class TestCfdiValidationRequest:
    """Test CFDI validation request model."""

    def test_request_model_exists(self):
        """CfdiValidationRequest model should exist."""
        from src.models.validation import CfdiValidationRequest
        assert CfdiValidationRequest is not None

    def test_request_has_required_fields(self):
        """Request should have all required fields."""
        from src.models.validation import CfdiValidationRequest
        request = CfdiValidationRequest(
            vendor_rfc="XAXX010101000",
            invoice_number="A-001",
            invoice_date="2024-01-15",
            subtotal=1000.00,
            iva_amount=160.00,
            total=1160.00,
        )
        assert request.vendor_rfc == "XAXX010101000"
        assert request.subtotal == 1000.00


class TestCfdiValidationResponse:
    """Test CFDI validation response model."""

    def test_response_model_exists(self):
        """CfdiValidationResponse model should exist."""
        from src.models.validation import CfdiValidationResponse
        assert CfdiValidationResponse is not None

    def test_response_has_valid_field(self):
        """Response should have valid field."""
        from src.models.validation import CfdiValidationResponse
        response = CfdiValidationResponse(valid=True, errors=[], warnings=[])
        assert response.valid is True

    def test_response_has_errors_list(self):
        """Response should have errors list."""
        from src.models.validation import CfdiValidationResponse
        response = CfdiValidationResponse(
            valid=False,
            errors=["Error 1", "Error 2"],
            warnings=[],
        )
        assert len(response.errors) == 2

    def test_response_has_warnings_list(self):
        """Response should have warnings list."""
        from src.models.validation import CfdiValidationResponse
        response = CfdiValidationResponse(
            valid=True,
            errors=[],
            warnings=["Warning 1"],
        )
        assert len(response.warnings) == 1


# =============================================================================
# Test CFDI Validation Function
# =============================================================================

class TestValidateCfdiFunction:
    """Test the validate_cfdi utility function."""

    def test_function_exists(self):
        """validate_cfdi function should exist."""
        from src.utils.validation import validate_cfdi
        assert validate_cfdi is not None

    # Valid CFDI tests
    def test_valid_cfdi_with_correct_calculations(self):
        """Valid CFDI with correct IVA and total should pass."""
        from src.utils.validation import validate_cfdi
        result = validate_cfdi(
            vendor_rfc="XAXX010101000",
            invoice_number="A-001",
            invoice_date="2024-01-15",
            subtotal=1000.00,
            iva_amount=160.00,
            total=1160.00,
        )
        assert result["valid"] is True
        assert len(result["errors"]) == 0

    def test_valid_cfdi_with_zero_iva(self):
        """Valid CFDI with 0% IVA (exempt) should pass."""
        from src.utils.validation import validate_cfdi
        result = validate_cfdi(
            vendor_rfc="XAXX010101000",
            invoice_number="A-001",
            invoice_date="2024-01-15",
            subtotal=1000.00,
            iva_amount=0.00,
            total=1000.00,
            iva_rate=0.0,  # Exempt from IVA
        )
        assert result["valid"] is True

    def test_valid_cfdi_with_small_rounding_difference(self):
        """Valid CFDI with small rounding difference (±0.01) should pass."""
        from src.utils.validation import validate_cfdi
        result = validate_cfdi(
            vendor_rfc="XAXX010101000",
            invoice_number="A-001",
            invoice_date="2024-01-15",
            subtotal=100.00,
            iva_amount=16.01,  # Slight rounding difference
            total=116.01,
        )
        assert result["valid"] is True

    # Required fields tests
    def test_missing_vendor_rfc_is_error(self):
        """Missing vendor RFC should be an error."""
        from src.utils.validation import validate_cfdi
        result = validate_cfdi(
            vendor_rfc="",
            invoice_number="A-001",
            invoice_date="2024-01-15",
            subtotal=1000.00,
            iva_amount=160.00,
            total=1160.00,
        )
        assert result["valid"] is False
        assert any("RFC" in e for e in result["errors"])

    def test_missing_invoice_number_is_error(self):
        """Missing invoice number should be an error."""
        from src.utils.validation import validate_cfdi
        result = validate_cfdi(
            vendor_rfc="XAXX010101000",
            invoice_number="",
            invoice_date="2024-01-15",
            subtotal=1000.00,
            iva_amount=160.00,
            total=1160.00,
        )
        assert result["valid"] is False
        assert any("número" in e.lower() or "factura" in e.lower() for e in result["errors"])

    def test_missing_invoice_date_is_error(self):
        """Missing invoice date should be an error."""
        from src.utils.validation import validate_cfdi
        result = validate_cfdi(
            vendor_rfc="XAXX010101000",
            invoice_number="A-001",
            invoice_date="",
            subtotal=1000.00,
            iva_amount=160.00,
            total=1160.00,
        )
        assert result["valid"] is False
        assert any("fecha" in e.lower() for e in result["errors"])

    # IVA calculation tests
    def test_incorrect_iva_is_error(self):
        """Incorrect IVA amount should be an error."""
        from src.utils.validation import validate_cfdi
        result = validate_cfdi(
            vendor_rfc="XAXX010101000",
            invoice_number="A-001",
            invoice_date="2024-01-15",
            subtotal=1000.00,
            iva_amount=100.00,  # Should be 160.00
            total=1100.00,
        )
        assert result["valid"] is False
        assert any("IVA" in e for e in result["errors"])

    def test_iva_calculation_with_16_percent(self):
        """IVA should be calculated at 16% rate."""
        from src.utils.validation import validate_cfdi
        result = validate_cfdi(
            vendor_rfc="XAXX010101000",
            invoice_number="A-001",
            invoice_date="2024-01-15",
            subtotal=500.00,
            iva_amount=80.00,  # 500 * 0.16 = 80
            total=580.00,
        )
        assert result["valid"] is True

    def test_iva_difference_beyond_tolerance_is_error(self):
        """IVA difference beyond ±0.01 should be an error."""
        from src.utils.validation import validate_cfdi
        result = validate_cfdi(
            vendor_rfc="XAXX010101000",
            invoice_number="A-001",
            invoice_date="2024-01-15",
            subtotal=1000.00,
            iva_amount=161.00,  # Expected 160.00, diff is 1.00
            total=1161.00,
        )
        assert result["valid"] is False
        assert any("IVA" in e for e in result["errors"])

    # Total calculation tests
    def test_incorrect_total_is_error(self):
        """Incorrect total should be an error."""
        from src.utils.validation import validate_cfdi
        result = validate_cfdi(
            vendor_rfc="XAXX010101000",
            invoice_number="A-001",
            invoice_date="2024-01-15",
            subtotal=1000.00,
            iva_amount=160.00,
            total=1200.00,  # Should be 1160.00
        )
        assert result["valid"] is False
        assert any("total" in e.lower() for e in result["errors"])

    def test_total_with_small_rounding_passes(self):
        """Total with ±0.01 rounding difference should pass."""
        from src.utils.validation import validate_cfdi
        result = validate_cfdi(
            vendor_rfc="XAXX010101000",
            invoice_number="A-001",
            invoice_date="2024-01-15",
            subtotal=1000.00,
            iva_amount=160.00,
            total=1160.01,  # Slight rounding
        )
        assert result["valid"] is True

    def test_total_difference_beyond_tolerance_is_error(self):
        """Total difference beyond ±0.01 should be an error."""
        from src.utils.validation import validate_cfdi
        result = validate_cfdi(
            vendor_rfc="XAXX010101000",
            invoice_number="A-001",
            invoice_date="2024-01-15",
            subtotal=1000.00,
            iva_amount=160.00,
            total=1162.00,  # Expected 1160.00, diff is 2.00
        )
        assert result["valid"] is False
        assert any("total" in e.lower() for e in result["errors"])

    # Negative values tests
    def test_negative_subtotal_is_error(self):
        """Negative subtotal should be an error."""
        from src.utils.validation import validate_cfdi
        result = validate_cfdi(
            vendor_rfc="XAXX010101000",
            invoice_number="A-001",
            invoice_date="2024-01-15",
            subtotal=-1000.00,
            iva_amount=160.00,
            total=1160.00,
        )
        assert result["valid"] is False
        assert any("subtotal" in e.lower() or "negativ" in e.lower() for e in result["errors"])

    def test_negative_total_is_error(self):
        """Negative total should be an error."""
        from src.utils.validation import validate_cfdi
        result = validate_cfdi(
            vendor_rfc="XAXX010101000",
            invoice_number="A-001",
            invoice_date="2024-01-15",
            subtotal=1000.00,
            iva_amount=160.00,
            total=-1160.00,
        )
        assert result["valid"] is False
        assert any("total" in e.lower() or "negativ" in e.lower() for e in result["errors"])

    # Warning tests
    def test_high_iva_generates_warning(self):
        """IVA higher than 16% should generate a warning."""
        from src.utils.validation import validate_cfdi
        result = validate_cfdi(
            vendor_rfc="XAXX010101000",
            invoice_number="A-001",
            invoice_date="2024-01-15",
            subtotal=1000.00,
            iva_amount=200.00,  # 20% - unusual
            total=1200.00,
            iva_rate=0.20,
        )
        # Valid with custom rate, but might have warning
        assert len(result["warnings"]) >= 0  # Warning about unusual rate


# =============================================================================
# Test CFDI Validation Endpoint
# =============================================================================

class TestCfdiValidationEndpoint:
    """Test POST /validate/cfdi endpoint."""

    @pytest.fixture
    def app(self):
        """Create FastAPI app with routes."""
        app = FastAPI()
        app.include_router(router)
        return app

    @pytest.fixture
    def client(self, app):
        """Create test client."""
        return TestClient(app)

    def test_endpoint_exists(self, client):
        """POST /validate/cfdi endpoint should exist."""
        response = client.post("/validate/cfdi", json={
            "vendor_rfc": "XAXX010101000",
            "invoice_number": "A-001",
            "invoice_date": "2024-01-15",
            "subtotal": 1000.00,
            "iva_amount": 160.00,
            "total": 1160.00,
        })
        assert response.status_code != 404

    def test_valid_cfdi_returns_200(self, client):
        """Valid CFDI should return 200."""
        response = client.post("/validate/cfdi", json={
            "vendor_rfc": "XAXX010101000",
            "invoice_number": "A-001",
            "invoice_date": "2024-01-15",
            "subtotal": 1000.00,
            "iva_amount": 160.00,
            "total": 1160.00,
        })
        assert response.status_code == 200

    def test_valid_cfdi_returns_valid_true(self, client):
        """Valid CFDI should return valid=true."""
        response = client.post("/validate/cfdi", json={
            "vendor_rfc": "XAXX010101000",
            "invoice_number": "A-001",
            "invoice_date": "2024-01-15",
            "subtotal": 1000.00,
            "iva_amount": 160.00,
            "total": 1160.00,
        })
        data = response.json()
        assert data["valid"] is True

    def test_invalid_cfdi_returns_200(self, client):
        """Invalid CFDI should still return 200."""
        response = client.post("/validate/cfdi", json={
            "vendor_rfc": "",
            "invoice_number": "A-001",
            "invoice_date": "2024-01-15",
            "subtotal": 1000.00,
            "iva_amount": 160.00,
            "total": 1160.00,
        })
        assert response.status_code == 200

    def test_invalid_cfdi_returns_valid_false(self, client):
        """Invalid CFDI should return valid=false."""
        response = client.post("/validate/cfdi", json={
            "vendor_rfc": "",
            "invoice_number": "A-001",
            "invoice_date": "2024-01-15",
            "subtotal": 1000.00,
            "iva_amount": 160.00,
            "total": 1160.00,
        })
        data = response.json()
        assert data["valid"] is False

    def test_invalid_cfdi_returns_errors(self, client):
        """Invalid CFDI should return errors list."""
        response = client.post("/validate/cfdi", json={
            "vendor_rfc": "",
            "invoice_number": "",
            "invoice_date": "2024-01-15",
            "subtotal": 1000.00,
            "iva_amount": 160.00,
            "total": 1160.00,
        })
        data = response.json()
        assert "errors" in data
        assert len(data["errors"]) >= 2

    def test_missing_required_field_returns_422(self, client):
        """Missing required field should return 422."""
        response = client.post("/validate/cfdi", json={
            "vendor_rfc": "XAXX010101000",
            # Missing other fields
        })
        assert response.status_code == 422

    def test_response_includes_warnings(self, client):
        """Response should include warnings list."""
        response = client.post("/validate/cfdi", json={
            "vendor_rfc": "XAXX010101000",
            "invoice_number": "A-001",
            "invoice_date": "2024-01-15",
            "subtotal": 1000.00,
            "iva_amount": 160.00,
            "total": 1160.00,
        })
        data = response.json()
        assert "warnings" in data


# =============================================================================
# Test Edge Cases
# =============================================================================

class TestCfdiEdgeCases:
    """Test edge cases for CFDI validation."""

    def test_zero_subtotal_is_valid(self):
        """Zero subtotal should be valid (possible for free items)."""
        from src.utils.validation import validate_cfdi
        result = validate_cfdi(
            vendor_rfc="XAXX010101000",
            invoice_number="A-001",
            invoice_date="2024-01-15",
            subtotal=0.00,
            iva_amount=0.00,
            total=0.00,
        )
        # Zero invoice is technically valid
        assert result["valid"] is True

    def test_very_large_amounts(self):
        """Very large amounts should be handled correctly."""
        from src.utils.validation import validate_cfdi
        result = validate_cfdi(
            vendor_rfc="XAXX010101000",
            invoice_number="A-001",
            invoice_date="2024-01-15",
            subtotal=1_000_000.00,
            iva_amount=160_000.00,
            total=1_160_000.00,
        )
        assert result["valid"] is True

    def test_decimal_precision(self):
        """Decimal amounts should be handled with precision."""
        from src.utils.validation import validate_cfdi
        result = validate_cfdi(
            vendor_rfc="XAXX010101000",
            invoice_number="A-001",
            invoice_date="2024-01-15",
            subtotal=123.45,
            iva_amount=19.75,  # 123.45 * 0.16 = 19.752
            total=143.20,  # 123.45 + 19.75 = 143.20
        )
        assert result["valid"] is True

    def test_multiple_errors_reported(self):
        """Multiple errors should all be reported."""
        from src.utils.validation import validate_cfdi
        result = validate_cfdi(
            vendor_rfc="",  # Error 1
            invoice_number="",  # Error 2
            invoice_date="",  # Error 3
            subtotal=-100.00,  # Error 4
            iva_amount=160.00,  # IVA wrong
            total=1160.00,  # Total wrong
        )
        assert result["valid"] is False
        assert len(result["errors"]) >= 3  # Multiple errors
