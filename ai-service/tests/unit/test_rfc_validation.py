"""
T020.1 - RFC Validation Tests

Tests for the RFC validation endpoint that:
- Validates RFC format (12 or 13 characters)
- Distinguishes persona física (13 chars) from persona moral (12 chars)
- Returns validation result with RFC type

Mexican RFC format:
- Persona Física (individual): XXXX######XXX (13 chars)
  - 4 letters from name
  - 6 digits for birthdate (YYMMDD)
  - 3 alphanumeric homoclave
- Persona Moral (company): XXX######XXX (12 chars)
  - 3 letters from company name
  - 6 digits for constitution date (YYMMDD)
  - 3 alphanumeric homoclave
"""

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from src.api.routes import router


# =============================================================================
# Test RFC Validation Model
# =============================================================================

class TestRfcValidationRequest:
    """Test RFC validation request model."""

    def test_request_model_exists(self):
        """RfcValidationRequest model should exist."""
        from src.models.validation import RfcValidationRequest
        assert RfcValidationRequest is not None

    def test_request_has_rfc_field(self):
        """Request should have rfc field."""
        from src.models.validation import RfcValidationRequest
        request = RfcValidationRequest(rfc="XAXX010101000")
        assert request.rfc == "XAXX010101000"


class TestRfcValidationResponse:
    """Test RFC validation response model."""

    def test_response_model_exists(self):
        """RfcValidationResponse model should exist."""
        from src.models.validation import RfcValidationResponse
        assert RfcValidationResponse is not None

    def test_response_has_valid_field(self):
        """Response should have valid field."""
        from src.models.validation import RfcValidationResponse
        response = RfcValidationResponse(valid=True, rfc_type="persona_fisica")
        assert response.valid is True

    def test_response_has_rfc_type_field(self):
        """Response should have rfc_type field."""
        from src.models.validation import RfcValidationResponse
        response = RfcValidationResponse(valid=True, rfc_type="persona_fisica")
        assert response.rfc_type == "persona_fisica"

    def test_response_has_optional_error_field(self):
        """Response should have optional error field."""
        from src.models.validation import RfcValidationResponse
        response = RfcValidationResponse(valid=False, error="RFC inválido")
        assert response.error == "RFC inválido"

    def test_response_has_optional_normalized_rfc(self):
        """Response should have optional normalized_rfc field."""
        from src.models.validation import RfcValidationResponse
        response = RfcValidationResponse(
            valid=True,
            rfc_type="persona_fisica",
            normalized_rfc="XAXX010101000"
        )
        assert response.normalized_rfc == "XAXX010101000"


# =============================================================================
# Test RFC Validation Function
# =============================================================================

class TestValidateRfcFunction:
    """Test the validate_rfc utility function."""

    def test_function_exists(self):
        """validate_rfc function should exist."""
        from src.utils.validation import validate_rfc
        assert validate_rfc is not None

    # Valid RFC tests - Persona Física (13 chars)
    def test_valid_persona_fisica_rfc(self):
        """Valid 13-char RFC should be persona_fisica."""
        from src.utils.validation import validate_rfc
        result = validate_rfc("XAXX010101000")
        assert result["valid"] is True
        assert result["rfc_type"] == "persona_fisica"

    def test_valid_persona_fisica_with_letters_in_homoclave(self):
        """Valid RFC with letters in homoclave."""
        from src.utils.validation import validate_rfc
        result = validate_rfc("GODE561231GR8")
        assert result["valid"] is True
        assert result["rfc_type"] == "persona_fisica"

    def test_valid_persona_fisica_uppercase(self):
        """Valid RFC should work with uppercase."""
        from src.utils.validation import validate_rfc
        result = validate_rfc("GARC850101ABC")
        assert result["valid"] is True
        assert result["rfc_type"] == "persona_fisica"

    # Valid RFC tests - Persona Moral (12 chars)
    def test_valid_persona_moral_rfc(self):
        """Valid 12-char RFC should be persona_moral."""
        from src.utils.validation import validate_rfc
        result = validate_rfc("XAX010101000")
        assert result["valid"] is True
        assert result["rfc_type"] == "persona_moral"

    def test_valid_persona_moral_with_letters(self):
        """Valid persona moral RFC with letters."""
        from src.utils.validation import validate_rfc
        result = validate_rfc("ABC980101XYZ")
        assert result["valid"] is True
        assert result["rfc_type"] == "persona_moral"

    # Case insensitivity
    def test_accepts_lowercase(self):
        """Should accept lowercase and normalize to uppercase."""
        from src.utils.validation import validate_rfc
        result = validate_rfc("xaxx010101000")
        assert result["valid"] is True
        assert result["normalized_rfc"] == "XAXX010101000"

    def test_accepts_mixed_case(self):
        """Should accept mixed case and normalize to uppercase."""
        from src.utils.validation import validate_rfc
        result = validate_rfc("XaXx010101ABC")
        assert result["valid"] is True
        assert result["normalized_rfc"] == "XAXX010101ABC"

    # Invalid RFC tests - Length
    def test_invalid_too_short(self):
        """RFC shorter than 12 chars should be invalid."""
        from src.utils.validation import validate_rfc
        result = validate_rfc("XAXX01010")
        assert result["valid"] is False
        assert "longitud" in result["error"].lower()

    def test_invalid_too_long(self):
        """RFC longer than 13 chars should be invalid."""
        from src.utils.validation import validate_rfc
        result = validate_rfc("XAXX0101010000")
        assert result["valid"] is False
        assert "longitud" in result["error"].lower()

    def test_invalid_empty(self):
        """Empty RFC should be invalid."""
        from src.utils.validation import validate_rfc
        result = validate_rfc("")
        assert result["valid"] is False

    # Invalid RFC tests - Pattern
    def test_invalid_starts_with_number(self):
        """RFC starting with number should be invalid."""
        from src.utils.validation import validate_rfc
        result = validate_rfc("1AXX010101000")
        assert result["valid"] is False
        assert "formato" in result["error"].lower()

    def test_invalid_letters_in_date_section(self):
        """RFC with letters in date section should be invalid."""
        from src.utils.validation import validate_rfc
        result = validate_rfc("XAXXABCDEF000")
        assert result["valid"] is False
        assert "fecha" in result["error"].lower() or "formato" in result["error"].lower()

    def test_invalid_special_characters(self):
        """RFC with special characters should be invalid."""
        from src.utils.validation import validate_rfc
        result = validate_rfc("XAXX-01-01-00")
        assert result["valid"] is False

    def test_invalid_spaces(self):
        """RFC with spaces should be invalid (after trim)."""
        from src.utils.validation import validate_rfc
        result = validate_rfc("XAXX 010101 000")
        assert result["valid"] is False

    # Whitespace handling
    def test_trims_leading_whitespace(self):
        """Should trim leading whitespace."""
        from src.utils.validation import validate_rfc
        result = validate_rfc("  XAXX010101000")
        assert result["valid"] is True

    def test_trims_trailing_whitespace(self):
        """Should trim trailing whitespace."""
        from src.utils.validation import validate_rfc
        result = validate_rfc("XAXX010101000  ")
        assert result["valid"] is True

    # Date validation
    def test_invalid_month_13(self):
        """RFC with invalid month (13) should be invalid."""
        from src.utils.validation import validate_rfc
        result = validate_rfc("XAXX011301000")
        assert result["valid"] is False
        assert "fecha" in result["error"].lower()

    def test_invalid_month_00(self):
        """RFC with invalid month (00) should be invalid."""
        from src.utils.validation import validate_rfc
        result = validate_rfc("XAXX010001000")
        assert result["valid"] is False
        assert "fecha" in result["error"].lower()

    def test_invalid_day_32(self):
        """RFC with invalid day (32) should be invalid."""
        from src.utils.validation import validate_rfc
        result = validate_rfc("XAXX010132000")
        assert result["valid"] is False
        assert "fecha" in result["error"].lower()

    def test_invalid_day_00(self):
        """RFC with invalid day (00) should be invalid."""
        from src.utils.validation import validate_rfc
        result = validate_rfc("XAXX010100000")
        assert result["valid"] is False
        assert "fecha" in result["error"].lower()

    def test_valid_december_31(self):
        """RFC with December 31 should be valid."""
        from src.utils.validation import validate_rfc
        result = validate_rfc("XAXX011231000")
        assert result["valid"] is True

    def test_valid_february_28(self):
        """RFC with February 28 should be valid."""
        from src.utils.validation import validate_rfc
        result = validate_rfc("XAXX010228000")
        assert result["valid"] is True


# =============================================================================
# Test RFC Validation Endpoint
# =============================================================================

class TestRfcValidationEndpoint:
    """Test POST /validate/rfc endpoint."""

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
        """POST /validate/rfc endpoint should exist."""
        response = client.post("/validate/rfc", json={"rfc": "XAXX010101000"})
        assert response.status_code != 404

    def test_valid_rfc_returns_200(self, client):
        """Valid RFC should return 200."""
        response = client.post("/validate/rfc", json={"rfc": "XAXX010101000"})
        assert response.status_code == 200

    def test_valid_rfc_returns_valid_true(self, client):
        """Valid RFC should return valid=true."""
        response = client.post("/validate/rfc", json={"rfc": "XAXX010101000"})
        data = response.json()
        assert data["valid"] is True

    def test_valid_persona_fisica_returns_type(self, client):
        """Valid 13-char RFC should return rfc_type=persona_fisica."""
        response = client.post("/validate/rfc", json={"rfc": "XAXX010101000"})
        data = response.json()
        assert data["rfc_type"] == "persona_fisica"

    def test_valid_persona_moral_returns_type(self, client):
        """Valid 12-char RFC should return rfc_type=persona_moral."""
        response = client.post("/validate/rfc", json={"rfc": "XAX010101000"})
        data = response.json()
        assert data["rfc_type"] == "persona_moral"

    def test_invalid_rfc_returns_200(self, client):
        """Invalid RFC should still return 200 (validation result)."""
        response = client.post("/validate/rfc", json={"rfc": "INVALID"})
        assert response.status_code == 200

    def test_invalid_rfc_returns_valid_false(self, client):
        """Invalid RFC should return valid=false."""
        response = client.post("/validate/rfc", json={"rfc": "INVALID"})
        data = response.json()
        assert data["valid"] is False

    def test_invalid_rfc_returns_error_message(self, client):
        """Invalid RFC should return error message."""
        response = client.post("/validate/rfc", json={"rfc": "INVALID"})
        data = response.json()
        assert "error" in data
        assert data["error"] is not None

    def test_missing_rfc_returns_422(self, client):
        """Missing RFC field should return 422."""
        response = client.post("/validate/rfc", json={})
        assert response.status_code == 422

    def test_returns_normalized_rfc(self, client):
        """Should return normalized (uppercase) RFC."""
        response = client.post("/validate/rfc", json={"rfc": "xaxx010101000"})
        data = response.json()
        assert data["normalized_rfc"] == "XAXX010101000"


# =============================================================================
# Test Common Mexican RFCs
# =============================================================================

class TestCommonMexicanRfcs:
    """Test with common Mexican RFC patterns."""

    def test_generic_rfc_xaxx(self):
        """Generic RFC XAXX010101000 should be valid."""
        from src.utils.validation import validate_rfc
        result = validate_rfc("XAXX010101000")
        assert result["valid"] is True

    def test_generic_rfc_xexx(self):
        """Generic RFC for foreigners XEXX010101000 should be valid."""
        from src.utils.validation import validate_rfc
        result = validate_rfc("XEXX010101000")
        assert result["valid"] is True

    def test_rfc_with_ampersand_company(self):
        """Company names with & become Ñ in RFC."""
        from src.utils.validation import validate_rfc
        # &=Ñ in RFC encoding
        result = validate_rfc("AÑB010101AB1")
        assert result["valid"] is True

    def test_sat_rfc(self):
        """SAT's own RFC should be valid."""
        from src.utils.validation import validate_rfc
        result = validate_rfc("SAT970701NN3")
        assert result["valid"] is True
        assert result["rfc_type"] == "persona_moral"
