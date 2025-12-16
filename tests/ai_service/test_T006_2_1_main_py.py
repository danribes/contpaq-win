"""
Tests for T006.2.1: FastAPI main.py application

Verifies that the main FastAPI application is properly configured
with the health check router and correct metadata.
"""

import os
import sys
import pytest

# Add ai-service/src to path for imports
AI_SERVICE_SRC = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
    "ai-service",
    "src"
)


class TestMainModuleExists:
    """Tests for main.py module existence."""

    def test_main_module_exists(self):
        """T006.2.1: main.py module should exist."""
        main_path = os.path.join(AI_SERVICE_SRC, "main.py")
        assert os.path.exists(main_path), \
            f"main.py should exist at {main_path}"

    def test_main_module_is_importable(self):
        """T006.2.1: main module should be importable."""
        if not os.path.exists(os.path.join(AI_SERVICE_SRC, "main.py")):
            pytest.skip("main.py not created yet")

        # Need to add path before import for proper resolution
        if AI_SERVICE_SRC not in sys.path:
            sys.path.insert(0, AI_SERVICE_SRC)
        try:
            # Clear any cached imports
            for mod in list(sys.modules.keys()):
                if mod in ("main", "api", "api.routes") or mod.startswith("api."):
                    del sys.modules[mod]
            import main
            assert main is not None
        finally:
            pass  # Keep path for other tests


class TestFastAPIApplication:
    """Tests for FastAPI app configuration."""

    @pytest.fixture(autouse=True)
    def setup_path(self):
        """Add ai-service/src to path and clear module cache."""
        if AI_SERVICE_SRC not in sys.path:
            sys.path.insert(0, AI_SERVICE_SRC)
        # Clear any cached imports
        for mod in list(sys.modules.keys()):
            if mod in ("main", "api", "api.routes") or mod.startswith("api."):
                del sys.modules[mod]
        yield

    def test_app_exists(self):
        """T006.2.1: main module should export 'app' FastAPI instance."""
        if not os.path.exists(os.path.join(AI_SERVICE_SRC, "main.py")):
            pytest.skip("main.py not created yet")

        from main import app
        from fastapi import FastAPI
        assert isinstance(app, FastAPI), \
            "app should be a FastAPI instance"

    def test_app_has_title(self):
        """T006.2.1: App should have a title."""
        if not os.path.exists(os.path.join(AI_SERVICE_SRC, "main.py")):
            pytest.skip("main.py not created yet")

        from main import app
        assert app.title is not None and app.title != "", \
            "App should have a title"

    def test_app_has_version(self):
        """T006.2.1: App should have a version."""
        if not os.path.exists(os.path.join(AI_SERVICE_SRC, "main.py")):
            pytest.skip("main.py not created yet")

        from main import app
        assert app.version is not None and app.version != "", \
            "App should have a version"

    def test_app_has_description(self):
        """T006.2.1: App should have a description."""
        if not os.path.exists(os.path.join(AI_SERVICE_SRC, "main.py")):
            pytest.skip("main.py not created yet")

        from main import app
        assert app.description is not None and app.description != "", \
            "App should have a description"


class TestRouterIntegration:
    """Tests for router integration with main app."""

    @pytest.fixture
    def client(self):
        """Create test client for API."""
        if not os.path.exists(os.path.join(AI_SERVICE_SRC, "main.py")):
            pytest.skip("main.py not created yet")

        if AI_SERVICE_SRC not in sys.path:
            sys.path.insert(0, AI_SERVICE_SRC)
        # Clear any cached imports
        for mod in list(sys.modules.keys()):
            if mod in ("main", "api", "api.routes") or mod.startswith("api."):
                del sys.modules[mod]

        from fastapi.testclient import TestClient
        from main import app
        return TestClient(app)

    def test_health_endpoint_accessible(self, client):
        """T006.2.1: /health endpoint should be accessible through main app."""
        response = client.get("/health")
        assert response.status_code == 200, \
            f"Expected 200, got {response.status_code}"

    def test_health_endpoint_returns_json(self, client):
        """T006.2.1: /health should return valid JSON."""
        response = client.get("/health")
        data = response.json()
        assert "status" in data, "Response should contain status field"

    def test_openapi_docs_accessible(self, client):
        """T006.2.1: OpenAPI docs should be accessible."""
        response = client.get("/docs")
        assert response.status_code == 200, \
            "OpenAPI docs should be accessible at /docs"

    def test_openapi_json_accessible(self, client):
        """T006.2.1: OpenAPI JSON schema should be accessible."""
        response = client.get("/openapi.json")
        assert response.status_code == 200, \
            "OpenAPI JSON should be accessible"
        data = response.json()
        assert "openapi" in data, "Should be valid OpenAPI schema"


class TestAppMetadata:
    """Tests for application metadata configuration."""

    @pytest.fixture(autouse=True)
    def setup_path(self):
        """Add ai-service/src to path and clear module cache."""
        if AI_SERVICE_SRC not in sys.path:
            sys.path.insert(0, AI_SERVICE_SRC)
        # Clear any cached imports
        for mod in list(sys.modules.keys()):
            if mod in ("main", "api", "api.routes") or mod.startswith("api."):
                del sys.modules[mod]
        yield

    def test_app_title_is_descriptive(self):
        """T006.2.1: App title should describe the service."""
        if not os.path.exists(os.path.join(AI_SERVICE_SRC, "main.py")):
            pytest.skip("main.py not created yet")

        from main import app
        # Should contain relevant keywords
        title_lower = app.title.lower()
        assert any(word in title_lower for word in ["ai", "invoice", "contpaq"]), \
            f"Title should be descriptive: {app.title}"

    def test_app_version_format(self):
        """T006.2.1: App version should be in semver format."""
        if not os.path.exists(os.path.join(AI_SERVICE_SRC, "main.py")):
            pytest.skip("main.py not created yet")

        from main import app
        # Should contain at least one dot for version
        assert "." in app.version, \
            f"Version should be in semver format: {app.version}"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
