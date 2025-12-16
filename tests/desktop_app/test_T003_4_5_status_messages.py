"""
Tests for T003.4.5: Define all status messages in Spanish

Tests verify that all required status messages are defined in the
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


class TestStatusMessages:
    """Test suite for status messages in es.json."""

    @pytest.fixture
    def translations(self):
        """Load translations from es.json."""
        with open(ES_JSON_PATH, "r", encoding="utf-8") as f:
            return json.load(f)

    def test_status_section_exists(self, translations):
        """Test that status section exists."""
        assert "status" in translations, "es.json must have 'status' section"

    def test_loading_status_defined(self, translations):
        """Test that loading status message is defined."""
        status = translations["status"]
        assert "loading" in status, "Must have loading status"
        assert "cargando" in status["loading"].lower(), "Loading should say 'Cargando'"

    def test_saving_status_defined(self, translations):
        """Test that saving status message is defined."""
        status = translations["status"]
        assert "saving" in status, "Must have saving status"
        assert "guardando" in status["saving"].lower(), "Saving should say 'Guardando'"

    def test_processing_status_defined(self, translations):
        """Test that processing status message is defined."""
        status = translations["status"]
        assert "processing" in status, "Must have processing status"
        assert "procesando" in status["processing"].lower(), "Processing should say 'Procesando'"

    def test_success_status_defined(self, translations):
        """Test that success status message is defined."""
        status = translations["status"]
        assert "success" in status, "Must have success status"
        assert "éxito" in status["success"].lower(), "Success should say 'Éxito'"

    def test_error_status_defined(self, translations):
        """Test that error status message is defined."""
        status = translations["status"]
        assert "error" in status, "Must have error status"
        assert "error" in status["error"].lower(), "Error should say 'Error'"

    def test_warning_status_defined(self, translations):
        """Test that warning status message is defined."""
        status = translations["status"]
        assert "warning" in status, "Must have warning status"
        assert "advertencia" in status["warning"].lower(), "Warning should say 'Advertencia'"

    def test_info_status_defined(self, translations):
        """Test that info status message is defined."""
        status = translations["status"]
        assert "info" in status, "Must have info status"
        assert "información" in status["info"].lower(), "Info should say 'Información'"

    def test_ready_status_defined(self, translations):
        """Test that ready status message is defined."""
        status = translations["status"]
        assert "ready" in status, "Must have ready status"
        assert "listo" in status["ready"].lower(), "Ready should say 'Listo'"

    def test_connecting_status_defined(self, translations):
        """Test that connecting status message is defined."""
        status = translations["status"]
        assert "connecting" in status, "Must have connecting status"
        assert "conectando" in status["connecting"].lower(), "Connecting should say 'Conectando'"

    def test_connected_status_defined(self, translations):
        """Test that connected status message is defined."""
        status = translations["status"]
        assert "connected" in status, "Must have connected status"
        assert "conectado" in status["connected"].lower(), "Connected should say 'Conectado'"

    def test_disconnected_status_defined(self, translations):
        """Test that disconnected status message is defined."""
        status = translations["status"]
        assert "disconnected" in status, "Must have disconnected status"
        assert "desconectado" in status["disconnected"].lower(), "Disconnected should say 'Desconectado'"

    def test_states_section_exists(self, translations):
        """Test that states section exists for invoice states."""
        assert "states" in translations, "es.json must have 'states' section"

    def test_uploaded_state_defined(self, translations):
        """Test that uploaded state is defined."""
        states = translations["states"]
        assert "uploaded" in states, "Must have uploaded state"
        assert "cargada" in states["uploaded"].lower(), "Uploaded should say 'Cargada'"

    def test_extracted_state_defined(self, translations):
        """Test that extracted state is defined."""
        states = translations["states"]
        assert "extracted" in states, "Must have extracted state"
        assert "extraída" in states["extracted"].lower(), "Extracted should say 'Extraída'"

    def test_validated_state_defined(self, translations):
        """Test that validated state is defined."""
        states = translations["states"]
        assert "validated" in states, "Must have validated state"
        assert "validada" in states["validated"].lower(), "Validated should say 'Validada'"

    def test_posted_state_defined(self, translations):
        """Test that posted state is defined."""
        states = translations["states"]
        assert "posted" in states, "Must have posted state"
        assert "registrada" in states["posted"].lower(), "Posted should say 'Registrada'"

    def test_services_status_messages_exist(self, translations):
        """Test that services section has status-related messages."""
        assert "services" in translations, "es.json must have 'services' section"
        services = translations["services"]
        assert "starting" in services, "Must have starting status"
        assert "running" in services, "Must have running status"
        assert "stopped" in services, "Must have stopped status"
        assert "error" in services, "Must have error status"

    def test_services_starting_status(self, translations):
        """Test that services starting status is defined."""
        services = translations["services"]
        assert "iniciando" in services["starting"].lower(), "Starting should say 'Iniciando'"

    def test_services_running_status(self, translations):
        """Test that services running status is defined."""
        services = translations["services"]
        assert "ejecución" in services["running"].lower(), "Running should mention 'ejecución'"

    def test_services_stopped_status(self, translations):
        """Test that services stopped status is defined."""
        services = translations["services"]
        assert "detenido" in services["stopped"].lower(), "Stopped should say 'Detenido'"

    def test_all_status_messages_are_spanish(self, translations):
        """Test that all status messages are in Spanish."""
        status = translations["status"]
        states = translations["states"]

        # Spanish indicators
        spanish_indicators = [
            "cargando", "guardando", "procesando", "éxito", "error",
            "advertencia", "información", "listo", "conectando",
            "conectado", "desconectado", "cargada", "extraída",
            "validada", "registrada", "iniciando", "ejecución", "detenido",
            "á", "é", "í", "ó", "ú", "ñ",
        ]

        # Check status messages
        for key, message in status.items():
            has_spanish = any(ind in message.lower() for ind in spanish_indicators)
            assert has_spanish, f"Status '{key}' should be in Spanish: {message}"

        # Check state messages
        for key, message in states.items():
            has_spanish = any(ind in message.lower() for ind in spanish_indicators)
            assert has_spanish, f"State '{key}' should be in Spanish: {message}"

    def test_minimum_status_count(self, translations):
        """Test that there are enough status messages defined."""
        status = translations["status"]
        assert len(status) >= 8, f"Should have at least 8 status messages, found {len(status)}"

    def test_minimum_states_count(self, translations):
        """Test that there are enough state messages defined."""
        states = translations["states"]
        assert len(states) >= 4, f"Should have at least 4 state messages, found {len(states)}"

    def test_loading_states_have_ellipsis(self, translations):
        """Test that in-progress status messages have ellipsis for consistency."""
        status = translations["status"]
        in_progress_keys = ["loading", "saving", "processing", "connecting"]

        for key in in_progress_keys:
            if key in status:
                assert "..." in status[key], f"Status '{key}' should end with '...' for in-progress indication"
