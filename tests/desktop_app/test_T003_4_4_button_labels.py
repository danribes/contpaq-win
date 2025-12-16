"""
Tests for T003.4.4: Define all button labels in Spanish

Tests verify that all required button labels are defined in the
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


class TestButtonLabels:
    """Test suite for button labels in es.json."""

    @pytest.fixture
    def translations(self):
        """Load translations from es.json."""
        with open(ES_JSON_PATH, "r", encoding="utf-8") as f:
            return json.load(f)

    def test_buttons_section_exists(self, translations):
        """Test that buttons section exists."""
        assert "buttons" in translations, "es.json must have 'buttons' section"

    def test_save_button_defined(self, translations):
        """Test that save button label is defined."""
        buttons = translations["buttons"]
        assert "save" in buttons, "Must have save button"
        assert "guardar" in buttons["save"].lower(), "Save button should say 'Guardar'"

    def test_cancel_button_defined(self, translations):
        """Test that cancel button label is defined."""
        buttons = translations["buttons"]
        assert "cancel" in buttons, "Must have cancel button"
        assert "cancelar" in buttons["cancel"].lower(), "Cancel button should say 'Cancelar'"

    def test_validate_button_defined(self, translations):
        """Test that validate button label is defined."""
        buttons = translations["buttons"]
        assert "validate" in buttons, "Must have validate button"
        assert "validar" in buttons["validate"].lower(), "Validate button should say 'Validar'"

    def test_process_button_defined(self, translations):
        """Test that process button label is defined."""
        buttons = translations["buttons"]
        assert "process" in buttons, "Must have process button"
        assert "procesar" in buttons["process"].lower(), "Process button should say 'Procesar'"

    def test_send_button_defined(self, translations):
        """Test that send button label is defined."""
        buttons = translations["buttons"]
        assert "send" in buttons, "Must have send button"
        assert "enviar" in buttons["send"].lower(), "Send button should say 'Enviar'"

    def test_send_to_contpaqi_button_defined(self, translations):
        """Test that sendToContpaqi button label is defined."""
        buttons = translations["buttons"]
        assert "sendToContpaqi" in buttons, "Must have sendToContpaqi button"
        assert "contpaqi" in buttons["sendToContpaqi"].lower(), "Should mention ContPAQi"

    def test_edit_button_defined(self, translations):
        """Test that edit button label is defined."""
        buttons = translations["buttons"]
        assert "edit" in buttons, "Must have edit button"
        assert "editar" in buttons["edit"].lower(), "Edit button should say 'Editar'"

    def test_delete_button_defined(self, translations):
        """Test that delete button label is defined."""
        buttons = translations["buttons"]
        assert "delete" in buttons, "Must have delete button"
        assert "eliminar" in buttons["delete"].lower(), "Delete button should say 'Eliminar'"

    def test_confirm_button_defined(self, translations):
        """Test that confirm button label is defined."""
        buttons = translations["buttons"]
        assert "confirm" in buttons, "Must have confirm button"
        assert "confirmar" in buttons["confirm"].lower(), "Confirm button should say 'Confirmar'"

    def test_retry_button_defined(self, translations):
        """Test that retry button label is defined."""
        buttons = translations["buttons"]
        assert "retry" in buttons, "Must have retry button"
        assert "reintentar" in buttons["retry"].lower(), "Retry button should say 'Reintentar'"

    def test_close_button_defined(self, translations):
        """Test that close button label is defined."""
        buttons = translations["buttons"]
        assert "close" in buttons, "Must have close button"
        assert "cerrar" in buttons["close"].lower(), "Close button should say 'Cerrar'"

    def test_back_button_defined(self, translations):
        """Test that back button label is defined."""
        buttons = translations["buttons"]
        assert "back" in buttons, "Must have back button"
        assert "volver" in buttons["back"].lower(), "Back button should say 'Volver'"

    def test_navigation_buttons_defined(self, translations):
        """Test that next/previous navigation buttons are defined."""
        buttons = translations["buttons"]
        assert "next" in buttons, "Must have next button"
        assert "siguiente" in buttons["next"].lower(), "Next button should say 'Siguiente'"
        assert "previous" in buttons, "Must have previous button"
        assert "anterior" in buttons["previous"].lower(), "Previous button should say 'Anterior'"

    def test_select_file_button_defined(self, translations):
        """Test that selectFile button label is defined."""
        buttons = translations["buttons"]
        assert "selectFile" in buttons, "Must have selectFile button"
        assert "seleccionar" in buttons["selectFile"].lower(), "Should mention 'Seleccionar'"

    def test_upload_button_defined(self, translations):
        """Test that upload button label is defined."""
        buttons = translations["buttons"]
        assert "upload" in buttons, "Must have upload button"
        assert "cargar" in buttons["upload"].lower(), "Upload button should say 'Cargar'"

    def test_download_button_defined(self, translations):
        """Test that download button label is defined."""
        buttons = translations["buttons"]
        assert "download" in buttons, "Must have download button"
        assert "descargar" in buttons["download"].lower(), "Download button should say 'Descargar'"

    def test_export_button_defined(self, translations):
        """Test that export button label is defined."""
        buttons = translations["buttons"]
        assert "export" in buttons, "Must have export button"
        assert "exportar" in buttons["export"].lower(), "Export button should say 'Exportar'"

    def test_refresh_button_defined(self, translations):
        """Test that refresh button label is defined."""
        buttons = translations["buttons"]
        assert "refresh" in buttons, "Must have refresh button"
        assert "actualizar" in buttons["refresh"].lower(), "Refresh button should say 'Actualizar'"

    def test_all_buttons_are_spanish(self, translations):
        """Test that all button labels are in Spanish."""
        buttons = translations["buttons"]
        # Spanish indicators: common Spanish words and accented characters
        spanish_indicators = [
            "guardar", "cancelar", "validar", "procesar", "enviar",
            "editar", "eliminar", "confirmar", "reintentar", "cerrar",
            "volver", "siguiente", "anterior", "seleccionar", "cargar",
            "descargar", "exportar", "actualizar", "archivo",
            "á", "é", "í", "ó", "ú", "ñ",
        ]

        for key, label in buttons.items():
            has_spanish = any(ind in label.lower() for ind in spanish_indicators)
            assert has_spanish, f"Button '{key}' should be in Spanish: {label}"

    def test_minimum_button_count(self, translations):
        """Test that there are enough button labels defined."""
        buttons = translations["buttons"]
        assert len(buttons) >= 15, f"Should have at least 15 button labels, found {len(buttons)}"

    def test_buttons_are_concise(self, translations):
        """Test that button labels are appropriately short."""
        buttons = translations["buttons"]
        for key, label in buttons.items():
            # Button labels should generally be under 30 characters
            assert len(label) <= 30, f"Button '{key}' is too long ({len(label)} chars): {label}"
