"""
Tests for T003.4.1: Create desktop-app/src/renderer/i18n/es.json

Tests verify that the Spanish language file exists and contains
all required UI strings for the application.
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


class TestI18nEsJson:
    """Test suite for desktop-app/src/renderer/i18n/es.json."""

    def test_es_json_exists(self):
        """Test that es.json exists in src/renderer/i18n directory."""
        assert os.path.isfile(ES_JSON_PATH), (
            f"es.json not found at {ES_JSON_PATH}"
        )

    def test_es_json_is_valid_json(self):
        """Test that es.json is valid JSON."""
        with open(ES_JSON_PATH, "r", encoding="utf-8") as f:
            content = f.read()
        try:
            data = json.loads(content)
            assert isinstance(data, dict), "es.json must be a JSON object"
        except json.JSONDecodeError as e:
            pytest.fail(f"es.json is not valid JSON: {e}")

    def test_es_json_has_app_section(self):
        """Test that es.json has app section with basic strings."""
        with open(ES_JSON_PATH, "r", encoding="utf-8") as f:
            data = json.load(f)
        assert "app" in data, "es.json must have 'app' section"
        assert "name" in data["app"], "app section must have 'name'"
        assert "ContPAQ" in data["app"]["name"], "app name should contain ContPAQ"

    def test_es_json_has_navigation_section(self):
        """Test that es.json has navigation strings."""
        with open(ES_JSON_PATH, "r", encoding="utf-8") as f:
            data = json.load(f)
        assert "navigation" in data or "nav" in data, (
            "es.json must have navigation section"
        )

    def test_es_json_has_buttons_section(self):
        """Test that es.json has button labels."""
        with open(ES_JSON_PATH, "r", encoding="utf-8") as f:
            data = json.load(f)
        assert "buttons" in data, "es.json must have 'buttons' section"
        buttons = data["buttons"]
        required_buttons = ["save", "cancel", "validate", "process"]
        for btn in required_buttons:
            assert btn in buttons, f"buttons section must have '{btn}'"

    def test_es_json_has_status_section(self):
        """Test that es.json has status messages."""
        with open(ES_JSON_PATH, "r", encoding="utf-8") as f:
            data = json.load(f)
        assert "status" in data, "es.json must have 'status' section"

    def test_es_json_has_errors_section(self):
        """Test that es.json has error messages."""
        with open(ES_JSON_PATH, "r", encoding="utf-8") as f:
            data = json.load(f)
        assert "errors" in data, "es.json must have 'errors' section"

    def test_es_json_has_invoice_section(self):
        """Test that es.json has invoice-related strings."""
        with open(ES_JSON_PATH, "r", encoding="utf-8") as f:
            data = json.load(f)
        assert "invoice" in data, "es.json must have 'invoice' section"
        invoice = data["invoice"]
        required_fields = ["number", "date", "subtotal", "total"]
        for field in required_fields:
            assert field in invoice or any(field in str(v).lower() for v in invoice.values()), (
                f"invoice section should reference '{field}'"
            )

    def test_es_json_has_vendor_section(self):
        """Test that es.json has vendor-related strings."""
        with open(ES_JSON_PATH, "r", encoding="utf-8") as f:
            data = json.load(f)
        assert "vendor" in data, "es.json must have 'vendor' section"

    def test_es_json_has_services_section(self):
        """Test that es.json has service status strings."""
        with open(ES_JSON_PATH, "r", encoding="utf-8") as f:
            data = json.load(f)
        assert "services" in data, "es.json must have 'services' section"

    def test_es_json_has_validation_section(self):
        """Test that es.json has validation messages."""
        with open(ES_JSON_PATH, "r", encoding="utf-8") as f:
            data = json.load(f)
        assert "validation" in data, "es.json must have 'validation' section"

    def test_es_json_strings_are_spanish(self):
        """Test that strings contain Spanish words."""
        with open(ES_JSON_PATH, "r", encoding="utf-8") as f:
            content = f.read()
        spanish_indicators = [
            "Factura", "Proveedor", "Guardar", "Cancelar",
            "Procesar", "Validar", "Error", "Éxito",
        ]
        found_spanish = any(word in content for word in spanish_indicators)
        assert found_spanish, (
            "es.json should contain Spanish words"
        )

    def test_es_json_has_states_section(self):
        """Test that es.json has invoice state translations."""
        with open(ES_JSON_PATH, "r", encoding="utf-8") as f:
            data = json.load(f)
        assert "states" in data, "es.json must have 'states' section"

    def test_es_json_has_pages_section(self):
        """Test that es.json has page titles."""
        with open(ES_JSON_PATH, "r", encoding="utf-8") as f:
            data = json.load(f)
        assert "pages" in data, "es.json must have 'pages' section"
