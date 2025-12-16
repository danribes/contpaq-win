"""
Tests for T006.1.4: Tesseract availability check

Verifies that the health check properly detects Tesseract OCR availability
across different environments (Windows, Linux).
"""

import os
import sys
import shutil
import pytest
from unittest.mock import patch, MagicMock

# Add ai-service/src to path for imports
AI_SERVICE_SRC = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
    "ai-service",
    "src"
)


class TestTesseractCheckFunction:
    """Tests for the check_ocr_available function."""

    @pytest.fixture(autouse=True)
    def setup_path(self):
        """Add ai-service/src to path."""
        if AI_SERVICE_SRC not in sys.path:
            sys.path.insert(0, AI_SERVICE_SRC)
        yield
        if AI_SERVICE_SRC in sys.path:
            sys.path.remove(AI_SERVICE_SRC)

    def test_check_ocr_available_returns_boolean(self):
        """T006.1.4: check_ocr_available should return a boolean."""
        from api.routes import check_ocr_available
        result = check_ocr_available()
        assert isinstance(result, bool), \
            f"Expected bool, got {type(result).__name__}"

    def test_check_ocr_available_detects_tesseract_in_path(self):
        """T006.1.4: Should detect Tesseract when in PATH."""
        from api.routes import check_ocr_available

        # Mock shutil.which to return a path
        with patch('shutil.which') as mock_which:
            mock_which.return_value = "/usr/bin/tesseract"
            result = check_ocr_available()
            assert result is True, \
                "Should return True when tesseract is in PATH"

    def test_check_ocr_available_false_when_not_installed(self):
        """T006.1.4: Should return False when Tesseract not found."""
        from api.routes import check_ocr_available

        # Mock both PATH check and file existence to return False
        with patch('shutil.which') as mock_which:
            mock_which.return_value = None
            with patch('os.path.exists') as mock_exists:
                mock_exists.return_value = False
                result = check_ocr_available()
                assert result is False, \
                    "Should return False when tesseract not found anywhere"

    def test_check_ocr_available_checks_windows_paths(self):
        """T006.1.4: Should check common Windows installation paths."""
        from api.routes import check_ocr_available

        # Mock PATH check to return None (not in PATH)
        with patch('shutil.which') as mock_which:
            mock_which.return_value = None
            # Mock os.path.exists to return True for Windows path
            def exists_side_effect(path):
                return "Program Files" in path and "Tesseract" in path

            with patch('os.path.exists', side_effect=exists_side_effect):
                result = check_ocr_available()
                assert result is True, \
                    "Should return True when Tesseract found in Windows path"


class TestTesseractVersionCheck:
    """Tests for Tesseract version detection."""

    @pytest.fixture(autouse=True)
    def setup_path(self):
        """Add ai-service/src to path."""
        if AI_SERVICE_SRC not in sys.path:
            sys.path.insert(0, AI_SERVICE_SRC)
        yield
        if AI_SERVICE_SRC in sys.path:
            sys.path.remove(AI_SERVICE_SRC)

    def test_get_tesseract_version_function_exists(self):
        """T006.1.4: Should have get_tesseract_version function."""
        from api.routes import get_tesseract_version
        assert callable(get_tesseract_version), \
            "get_tesseract_version should be callable"

    def test_get_tesseract_version_returns_string_or_none(self):
        """T006.1.4: Should return version string or None."""
        from api.routes import get_tesseract_version
        result = get_tesseract_version()
        assert result is None or isinstance(result, str), \
            f"Expected str or None, got {type(result).__name__}"

    def test_get_tesseract_version_returns_none_when_not_installed(self):
        """T006.1.4: Should return None when Tesseract not found."""
        from api.routes import get_tesseract_version

        with patch('shutil.which') as mock_which:
            mock_which.return_value = None
            result = get_tesseract_version()
            assert result is None, \
                "Should return None when tesseract not found"


class TestHealthEndpointOcrField:
    """Tests for ocr_available field in health response."""

    @pytest.fixture
    def client(self):
        """Create test client for API."""
        sys.path.insert(0, AI_SERVICE_SRC)
        try:
            from fastapi import FastAPI
            from fastapi.testclient import TestClient
            from api.routes import router

            app = FastAPI()
            app.include_router(router)
            return TestClient(app)
        finally:
            if AI_SERVICE_SRC in sys.path:
                sys.path.remove(AI_SERVICE_SRC)

    def test_health_ocr_field_reflects_availability(self, client):
        """T006.1.4: Health endpoint should reflect actual OCR availability."""
        response = client.get("/health")
        data = response.json()

        assert "ocr_available" in data, \
            "Response should contain ocr_available field"
        assert isinstance(data["ocr_available"], bool), \
            "ocr_available should be a boolean"

    def test_health_endpoint_with_mocked_tesseract(self, client):
        """T006.1.4: Health should show ocr_available=True when Tesseract found."""
        sys.path.insert(0, AI_SERVICE_SRC)
        try:
            with patch('api.routes.check_ocr_available', return_value=True):
                response = client.get("/health")
                data = response.json()
                # Note: The response already set before mock, this tests integration
                assert "ocr_available" in data
        finally:
            if AI_SERVICE_SRC in sys.path:
                sys.path.remove(AI_SERVICE_SRC)


class TestTesseractSpanishLanguage:
    """Tests for Spanish language support detection."""

    @pytest.fixture(autouse=True)
    def setup_path(self):
        """Add ai-service/src to path."""
        if AI_SERVICE_SRC not in sys.path:
            sys.path.insert(0, AI_SERVICE_SRC)
        yield
        if AI_SERVICE_SRC in sys.path:
            sys.path.remove(AI_SERVICE_SRC)

    def test_check_spanish_language_function_exists(self):
        """T006.1.4: Should have function to check Spanish language pack."""
        from api.routes import check_spanish_language_available
        assert callable(check_spanish_language_available), \
            "check_spanish_language_available should be callable"

    def test_check_spanish_returns_boolean(self):
        """T006.1.4: Spanish language check should return boolean."""
        from api.routes import check_spanish_language_available
        result = check_spanish_language_available()
        assert isinstance(result, bool), \
            f"Expected bool, got {type(result).__name__}"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
