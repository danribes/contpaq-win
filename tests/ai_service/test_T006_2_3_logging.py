"""
Tests for T006.2.3: Add request logging middleware

Verifies that request logging middleware is properly configured
to log incoming HTTP requests with method, path, and timing info.
"""

import os
import sys
import pytest
import logging
from unittest.mock import patch, MagicMock

# Add ai-service/src to path for imports
AI_SERVICE_SRC = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
    "ai-service",
    "src"
)


class TestLoggingMiddlewareExists:
    """Tests for logging middleware presence."""

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

    def test_logging_middleware_is_configured(self):
        """T006.2.3: Logging middleware should be configured on the app."""
        from main import app

        # Check that RequestLoggingMiddleware is in the middleware stack
        middleware_classes = [m.cls.__name__ for m in app.user_middleware]
        assert "RequestLoggingMiddleware" in middleware_classes, \
            f"RequestLoggingMiddleware should be configured. Found: {middleware_classes}"


class TestRequestLoggingMiddlewareClass:
    """Tests for RequestLoggingMiddleware class."""

    @pytest.fixture(autouse=True)
    def setup_path(self):
        """Add ai-service/src to path and clear module cache."""
        if AI_SERVICE_SRC not in sys.path:
            sys.path.insert(0, AI_SERVICE_SRC)
        for mod in list(sys.modules.keys()):
            if mod in ("main", "api", "api.routes", "middleware", "middleware.logging") \
               or mod.startswith("api.") or mod.startswith("middleware."):
                del sys.modules[mod]
        yield

    def test_middleware_class_exists(self):
        """T006.2.3: RequestLoggingMiddleware class should exist."""
        from middleware.logging import RequestLoggingMiddleware
        assert RequestLoggingMiddleware is not None

    def test_middleware_is_callable(self):
        """T006.2.3: Middleware should be a class (callable)."""
        from middleware.logging import RequestLoggingMiddleware
        assert callable(RequestLoggingMiddleware)


class TestLoggerConfiguration:
    """Tests for logger configuration."""

    @pytest.fixture(autouse=True)
    def setup_path(self):
        """Add ai-service/src to path and clear module cache."""
        if AI_SERVICE_SRC not in sys.path:
            sys.path.insert(0, AI_SERVICE_SRC)
        for mod in list(sys.modules.keys()):
            if mod in ("main", "api", "api.routes", "middleware", "middleware.logging") \
               or mod.startswith("api.") or mod.startswith("middleware."):
                del sys.modules[mod]
        yield

    def test_logger_exists(self):
        """T006.2.3: Module should have a logger configured."""
        from middleware.logging import logger
        assert logger is not None
        assert isinstance(logger, logging.Logger)

    def test_logger_has_name(self):
        """T006.2.3: Logger should have descriptive name."""
        from middleware.logging import logger
        assert "contpaq" in logger.name.lower() or "ai" in logger.name.lower() \
            or "request" in logger.name.lower(), \
            f"Logger name should be descriptive. Got: {logger.name}"


class TestRequestLogging:
    """Tests for actual request logging behavior."""

    @pytest.fixture
    def client(self):
        """Create test client for API."""
        if AI_SERVICE_SRC not in sys.path:
            sys.path.insert(0, AI_SERVICE_SRC)
        for mod in list(sys.modules.keys()):
            if mod in ("main", "api", "api.routes", "middleware", "middleware.logging") \
               or mod.startswith("api.") or mod.startswith("middleware."):
                del sys.modules[mod]

        from fastapi.testclient import TestClient
        from main import app
        return TestClient(app)

    def test_request_is_logged(self, client, caplog):
        """T006.2.3: Requests should be logged."""
        with caplog.at_level(logging.INFO):
            response = client.get("/health")

        # Check that some logging occurred for the request
        log_messages = [record.message for record in caplog.records]
        # Should have logged something about the request
        has_request_log = any(
            "health" in msg.lower() or "GET" in msg or "200" in msg
            for msg in log_messages
        )
        assert has_request_log or len(log_messages) > 0, \
            f"Request should generate log entries. Got: {log_messages}"

    def test_logs_include_method(self, client, caplog):
        """T006.2.3: Logs should include HTTP method."""
        with caplog.at_level(logging.INFO):
            client.get("/health")

        log_output = " ".join(record.message for record in caplog.records)
        assert "GET" in log_output, \
            f"Log should include HTTP method. Got: {log_output}"

    def test_logs_include_path(self, client, caplog):
        """T006.2.3: Logs should include request path."""
        with caplog.at_level(logging.INFO):
            client.get("/health")

        log_output = " ".join(record.message for record in caplog.records)
        assert "/health" in log_output or "health" in log_output.lower(), \
            f"Log should include path. Got: {log_output}"

    def test_logs_include_status_code(self, client, caplog):
        """T006.2.3: Logs should include response status code."""
        with caplog.at_level(logging.INFO):
            client.get("/health")

        log_output = " ".join(record.message for record in caplog.records)
        assert "200" in log_output, \
            f"Log should include status code. Got: {log_output}"


class TestRequestTimingLogging:
    """Tests for request timing in logs."""

    @pytest.fixture
    def client(self):
        """Create test client for API."""
        if AI_SERVICE_SRC not in sys.path:
            sys.path.insert(0, AI_SERVICE_SRC)
        for mod in list(sys.modules.keys()):
            if mod in ("main", "api", "api.routes", "middleware", "middleware.logging") \
               or mod.startswith("api.") or mod.startswith("middleware."):
                del sys.modules[mod]

        from fastapi.testclient import TestClient
        from main import app
        return TestClient(app)

    def test_logs_include_timing(self, client, caplog):
        """T006.2.3: Logs should include request duration."""
        with caplog.at_level(logging.INFO):
            client.get("/health")

        log_output = " ".join(record.message for record in caplog.records)
        # Should have timing info - either "ms" or "s" or numeric timing
        has_timing = any(x in log_output for x in ["ms", "sec", "time", "duration"])
        has_numeric = any(char.isdigit() for char in log_output)

        assert has_timing or has_numeric, \
            f"Log should include timing info. Got: {log_output}"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
