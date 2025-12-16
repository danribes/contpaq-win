"""
Tests for T006.1.1: Health endpoint returns 200

Verifies that the AI service health check endpoint:
- Returns HTTP 200 status code
- Returns valid JSON response
- Contains required health status fields
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


class TestHealthEndpointExists:
    """Tests for health endpoint existence and basic configuration."""

    def test_routes_module_exists(self):
        """T006.1.1: routes.py module should exist in api package."""
        routes_path = os.path.join(AI_SERVICE_SRC, "api", "routes.py")
        assert os.path.exists(routes_path), \
            f"routes.py should exist at {routes_path}"

    def test_routes_module_is_importable(self):
        """T006.1.1: routes module should be importable."""
        if not os.path.exists(os.path.join(AI_SERVICE_SRC, "api", "routes.py")):
            pytest.skip("routes.py not created yet")

        sys.path.insert(0, AI_SERVICE_SRC)
        try:
            from api import routes
            assert routes is not None
        finally:
            sys.path.remove(AI_SERVICE_SRC)

    def test_routes_has_router(self):
        """T006.1.1: routes module should export an APIRouter."""
        if not os.path.exists(os.path.join(AI_SERVICE_SRC, "api", "routes.py")):
            pytest.skip("routes.py not created yet")

        sys.path.insert(0, AI_SERVICE_SRC)
        try:
            from api.routes import router
            from fastapi import APIRouter
            assert isinstance(router, APIRouter), \
                "routes should export an APIRouter instance"
        finally:
            sys.path.remove(AI_SERVICE_SRC)


class TestHealthEndpointResponse:
    """Tests for health endpoint HTTP response."""

    @pytest.fixture
    def client(self):
        """Create test client for API."""
        if not os.path.exists(os.path.join(AI_SERVICE_SRC, "api", "routes.py")):
            pytest.skip("routes.py not created yet")

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

    def test_health_endpoint_returns_200(self, client):
        """T006.1.1: GET /health should return 200 OK."""
        response = client.get("/health")
        assert response.status_code == 200, \
            f"Expected 200, got {response.status_code}"

    def test_health_endpoint_returns_json(self, client):
        """T006.1.1: GET /health should return valid JSON."""
        response = client.get("/health")
        assert response.headers.get("content-type") == "application/json", \
            "Response should have application/json content type"

        # Should not raise JSONDecodeError
        data = response.json()
        assert isinstance(data, dict), "Response should be a JSON object"

    def test_health_response_has_status_field(self, client):
        """T006.1.1: Health response should contain status field."""
        response = client.get("/health")
        data = response.json()
        assert "status" in data, "Response should contain 'status' field"
        assert data["status"] == "healthy", \
            f"Status should be 'healthy', got '{data['status']}'"

    def test_health_response_has_timestamp(self, client):
        """T006.1.1: Health response should contain timestamp field."""
        response = client.get("/health")
        data = response.json()
        assert "timestamp" in data, "Response should contain 'timestamp' field"
        # Timestamp should be ISO format string
        assert isinstance(data["timestamp"], str), "Timestamp should be a string"

    def test_health_response_has_version(self, client):
        """T006.1.1: Health response should contain version field."""
        response = client.get("/health")
        data = response.json()
        assert "version" in data, "Response should contain 'version' field"
        assert isinstance(data["version"], str), "Version should be a string"


class TestHealthEndpointStructure:
    """Tests for health response structure completeness."""

    @pytest.fixture
    def client(self):
        """Create test client for API."""
        if not os.path.exists(os.path.join(AI_SERVICE_SRC, "api", "routes.py")):
            pytest.skip("routes.py not created yet")

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

    def test_health_has_models_loaded_field(self, client):
        """T006.1.1: Health response should indicate if models are loaded."""
        response = client.get("/health")
        data = response.json()
        assert "models_loaded" in data, \
            "Response should contain 'models_loaded' field"
        assert isinstance(data["models_loaded"], bool), \
            "models_loaded should be a boolean"

    def test_health_has_ocr_available_field(self, client):
        """T006.1.1: Health response should indicate OCR availability."""
        response = client.get("/health")
        data = response.json()
        assert "ocr_available" in data, \
            "Response should contain 'ocr_available' field"
        assert isinstance(data["ocr_available"], bool), \
            "ocr_available should be a boolean"

    def test_health_response_complete_structure(self, client):
        """T006.1.1: Health response should have all required fields."""
        response = client.get("/health")
        data = response.json()

        required_fields = ["status", "timestamp", "version", "models_loaded", "ocr_available"]
        for field in required_fields:
            assert field in data, f"Missing required field: {field}"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
