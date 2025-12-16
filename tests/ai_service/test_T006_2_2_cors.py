"""
Tests for T006.2.2: Configure CORS for localhost only

Verifies that CORS is properly configured to allow requests
only from localhost origins (127.0.0.1 and localhost).
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


class TestCORSMiddlewareExists:
    """Tests for CORS middleware presence."""

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

    def test_cors_middleware_is_configured(self):
        """T006.2.2: CORS middleware should be configured on the app."""
        from main import app

        # Check that CORSMiddleware is in the middleware stack
        middleware_classes = [m.cls.__name__ for m in app.user_middleware]
        assert "CORSMiddleware" in middleware_classes, \
            "CORSMiddleware should be configured on the app"


class TestCORSAllowedOrigins:
    """Tests for CORS allowed origins configuration."""

    @pytest.fixture(autouse=True)
    def setup_path(self):
        """Add ai-service/src to path and clear module cache."""
        if AI_SERVICE_SRC not in sys.path:
            sys.path.insert(0, AI_SERVICE_SRC)
        for mod in list(sys.modules.keys()):
            if mod in ("main", "api", "api.routes") or mod.startswith("api."):
                del sys.modules[mod]
        yield

    def test_allowed_origins_defined(self):
        """T006.2.2: ALLOWED_ORIGINS should be defined."""
        from main import ALLOWED_ORIGINS
        assert isinstance(ALLOWED_ORIGINS, (list, tuple)), \
            "ALLOWED_ORIGINS should be a list or tuple"

    def test_allowed_origins_includes_localhost(self):
        """T006.2.2: ALLOWED_ORIGINS should include localhost variants."""
        from main import ALLOWED_ORIGINS

        # Should include http://localhost and http://127.0.0.1
        localhost_variants = [
            "http://localhost",
            "http://127.0.0.1",
        ]

        for origin in localhost_variants:
            # Check if any allowed origin starts with this base
            has_variant = any(
                allowed.startswith(origin)
                for allowed in ALLOWED_ORIGINS
            )
            assert has_variant, \
                f"ALLOWED_ORIGINS should include {origin} variant"

    def test_allowed_origins_no_wildcard(self):
        """T006.2.2: ALLOWED_ORIGINS should not include wildcard (*)."""
        from main import ALLOWED_ORIGINS

        assert "*" not in ALLOWED_ORIGINS, \
            "ALLOWED_ORIGINS should not include wildcard (*)"


class TestCORSHeaders:
    """Tests for CORS headers in responses."""

    @pytest.fixture
    def client(self):
        """Create test client for API."""
        if AI_SERVICE_SRC not in sys.path:
            sys.path.insert(0, AI_SERVICE_SRC)
        for mod in list(sys.modules.keys()):
            if mod in ("main", "api", "api.routes") or mod.startswith("api."):
                del sys.modules[mod]

        from fastapi.testclient import TestClient
        from main import app
        return TestClient(app)

    def test_cors_headers_for_localhost_origin(self, client):
        """T006.2.2: Should return CORS headers for localhost origin."""
        response = client.get(
            "/health",
            headers={"Origin": "http://localhost:3000"}
        )

        assert response.status_code == 200
        assert "access-control-allow-origin" in response.headers, \
            "Should include Access-Control-Allow-Origin header"

    def test_cors_headers_for_127_origin(self, client):
        """T006.2.2: Should return CORS headers for 127.0.0.1 origin."""
        response = client.get(
            "/health",
            headers={"Origin": "http://127.0.0.1:8080"}
        )

        assert response.status_code == 200
        assert "access-control-allow-origin" in response.headers, \
            "Should include Access-Control-Allow-Origin header"

    def test_cors_preflight_request(self, client):
        """T006.2.2: Should handle CORS preflight OPTIONS request."""
        response = client.options(
            "/health",
            headers={
                "Origin": "http://localhost:3000",
                "Access-Control-Request-Method": "GET",
            }
        )

        # OPTIONS should return 200 for preflight
        assert response.status_code == 200, \
            "Preflight OPTIONS request should return 200"


class TestCORSAllowedMethods:
    """Tests for CORS allowed methods."""

    @pytest.fixture
    def client(self):
        """Create test client for API."""
        if AI_SERVICE_SRC not in sys.path:
            sys.path.insert(0, AI_SERVICE_SRC)
        for mod in list(sys.modules.keys()):
            if mod in ("main", "api", "api.routes") or mod.startswith("api."):
                del sys.modules[mod]

        from fastapi.testclient import TestClient
        from main import app
        return TestClient(app)

    def test_cors_allows_get_method(self, client):
        """T006.2.2: CORS should allow GET method."""
        response = client.options(
            "/health",
            headers={
                "Origin": "http://localhost:3000",
                "Access-Control-Request-Method": "GET",
            }
        )

        allowed_methods = response.headers.get(
            "access-control-allow-methods", ""
        )
        assert "GET" in allowed_methods, \
            "Should allow GET method"

    def test_cors_allows_post_method(self, client):
        """T006.2.2: CORS should allow POST method (for future endpoints)."""
        response = client.options(
            "/health",
            headers={
                "Origin": "http://localhost:3000",
                "Access-Control-Request-Method": "POST",
            }
        )

        allowed_methods = response.headers.get(
            "access-control-allow-methods", ""
        )
        assert "POST" in allowed_methods, \
            "Should allow POST method"


class TestCORSAllowedHeaders:
    """Tests for CORS allowed headers."""

    @pytest.fixture
    def client(self):
        """Create test client for API."""
        if AI_SERVICE_SRC not in sys.path:
            sys.path.insert(0, AI_SERVICE_SRC)
        for mod in list(sys.modules.keys()):
            if mod in ("main", "api", "api.routes") or mod.startswith("api."):
                del sys.modules[mod]

        from fastapi.testclient import TestClient
        from main import app
        return TestClient(app)

    def test_cors_allows_content_type_header(self, client):
        """T006.2.2: CORS should allow Content-Type header."""
        response = client.options(
            "/health",
            headers={
                "Origin": "http://localhost:3000",
                "Access-Control-Request-Method": "POST",
                "Access-Control-Request-Headers": "Content-Type",
            }
        )

        allowed_headers = response.headers.get(
            "access-control-allow-headers", ""
        ).lower()
        assert "content-type" in allowed_headers, \
            "Should allow Content-Type header"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
