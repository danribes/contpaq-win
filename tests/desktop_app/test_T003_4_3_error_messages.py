"""
Tests for T003.4.3: Define all error messages in Spanish

Tests verify that all required error messages are defined in the
Spanish translations file with proper Spanish text.
"""

import json
import os

import pytest


# Path to the es.json file
ES_JSON_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
    "desktop-app",
    "src",
    "renderer",
    "i18n",
    "es.json",
)


class TestErrorMessages:
    """Test suite for error messages in es.json."""

    @pytest.fixture
    def translations(self):
        """Load translations from es.json."""
        with open(ES_JSON_PATH, "r", encoding="utf-8") as f:
            return json.load(f)

    def test_errors_section_exists(self, translations):
        """Test that errors section exists."""
        assert "errors" in translations, "es.json must have 'errors' section"

    def test_generic_error_defined(self, translations):
        """Test that generic error message is defined."""
        errors = translations["errors"]
        assert "generic" in errors, "Must have generic error"
        assert "error" in errors["generic"].lower(), "Generic error should mention 'error'"

    def test_network_error_defined(self, translations):
        """Test that network error message is defined."""
        errors = translations["errors"]
        assert "networkError" in errors, "Must have networkError"
        assert "conexión" in errors["networkError"].lower(), "Network error should mention connection"

    def test_server_error_defined(self, translations):
        """Test that server error message is defined."""
        errors = translations["errors"]
        assert "serverError" in errors, "Must have serverError"

    def test_file_not_found_error_defined(self, translations):
        """Test that file not found error is defined."""
        errors = translations["errors"]
        assert "fileNotFound" in errors, "Must have fileNotFound error"
        assert "archivo" in errors["fileNotFound"].lower(), "Should mention 'archivo'"

    def test_invalid_file_error_defined(self, translations):
        """Test that invalid file error is defined."""
        errors = translations["errors"]
        assert "invalidFile" in errors, "Must have invalidFile error"

    def test_invalid_pdf_error_defined(self, translations):
        """Test that invalid PDF error is defined."""
        errors = translations["errors"]
        assert "invalidPdf" in errors, "Must have invalidPdf error"
        assert "pdf" in errors["invalidPdf"].lower(), "Should mention 'PDF'"

    def test_extraction_failed_error_defined(self, translations):
        """Test that extraction failed error is defined."""
        errors = translations["errors"]
        assert "extractionFailed" in errors, "Must have extractionFailed error"
        assert "extraer" in errors["extractionFailed"].lower(), "Should mention extraction"

    def test_validation_failed_error_defined(self, translations):
        """Test that validation failed error is defined."""
        errors = translations["errors"]
        assert "validationFailed" in errors, "Must have validationFailed error"

    def test_save_failed_error_defined(self, translations):
        """Test that save failed error is defined."""
        errors = translations["errors"]
        assert "saveFailed" in errors, "Must have saveFailed error"
        assert "guardar" in errors["saveFailed"].lower(), "Should mention 'guardar'"

    def test_posting_failed_error_defined(self, translations):
        """Test that posting failed error is defined."""
        errors = translations["errors"]
        assert "postingFailed" in errors, "Must have postingFailed error"
        assert "contpaqi" in errors["postingFailed"].lower(), "Should mention ContPAQi"

    def test_service_unavailable_error_defined(self, translations):
        """Test that service unavailable error is defined."""
        errors = translations["errors"]
        assert "serviceUnavailable" in errors, "Must have serviceUnavailable error"
        assert "servicio" in errors["serviceUnavailable"].lower(), "Should mention service"

    def test_ai_service_down_error_defined(self, translations):
        """Test that AI service down error is defined."""
        errors = translations["errors"]
        assert "aiServiceDown" in errors, "Must have aiServiceDown error"
        assert "ia" in errors["aiServiceDown"].lower() or "ai" in errors["aiServiceDown"].lower(), \
            "Should mention AI/IA"

    def test_bridge_service_down_error_defined(self, translations):
        """Test that bridge service down error is defined."""
        errors = translations["errors"]
        assert "bridgeServiceDown" in errors, "Must have bridgeServiceDown error"

    def test_duplicate_invoice_error_defined(self, translations):
        """Test that duplicate invoice error is defined."""
        errors = translations["errors"]
        assert "duplicateInvoice" in errors, "Must have duplicateInvoice error"
        assert "factura" in errors["duplicateInvoice"].lower(), "Should mention invoice"

    def test_vendor_not_found_error_defined(self, translations):
        """Test that vendor not found error is defined."""
        errors = translations["errors"]
        assert "vendorNotFound" in errors, "Must have vendorNotFound error"
        assert "proveedor" in errors["vendorNotFound"].lower(), "Should mention vendor"

    def test_all_errors_are_spanish(self, translations):
        """Test that all error messages are in Spanish."""
        errors = translations["errors"]
        # Common Spanish words and patterns
        spanish_indicators = [
            "error", "no", "de", "el", "la", "un", "una", "es", "está",
            "archivo", "inválido", "válido", "conexión", "servicio",
            "á", "é", "í", "ó", "ú", "ñ",  # Spanish accented chars
        ]

        for key, message in errors.items():
            has_spanish = any(ind in message.lower() for ind in spanish_indicators)
            assert has_spanish, f"Error '{key}' should be in Spanish: {message}"

    def test_minimum_error_count(self, translations):
        """Test that there are enough error messages defined."""
        errors = translations["errors"]
        assert len(errors) >= 10, f"Should have at least 10 error messages, found {len(errors)}"
