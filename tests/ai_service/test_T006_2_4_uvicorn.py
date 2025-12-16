"""
Tests for T006.2.4: Configure uvicorn for production

Verifies that uvicorn configuration is properly set up for
production deployment with appropriate settings.
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


class TestUvicornConfigExists:
    """Tests for uvicorn configuration module."""

    @pytest.fixture(autouse=True)
    def setup_path(self):
        """Add ai-service/src to path and clear module cache."""
        if AI_SERVICE_SRC not in sys.path:
            sys.path.insert(0, AI_SERVICE_SRC)
        # Clear any cached imports
        for mod in list(sys.modules.keys()):
            if "config" in mod or "uvicorn_config" in mod:
                del sys.modules[mod]
        yield

    def test_config_module_exists(self):
        """T006.2.4: uvicorn_config module should exist."""
        import uvicorn_config
        assert uvicorn_config is not None

    def test_config_has_settings(self):
        """T006.2.4: Config should have settings dictionary or class."""
        import uvicorn_config
        # Should have either a dict or callable to get config
        has_config = (
            hasattr(uvicorn_config, "config") or
            hasattr(uvicorn_config, "get_config") or
            hasattr(uvicorn_config, "UVICORN_CONFIG")
        )
        assert has_config, \
            "Config module should have config, get_config, or UVICORN_CONFIG"


class TestHostConfiguration:
    """Tests for host binding configuration."""

    @pytest.fixture(autouse=True)
    def setup_path(self):
        """Add ai-service/src to path and clear module cache."""
        if AI_SERVICE_SRC not in sys.path:
            sys.path.insert(0, AI_SERVICE_SRC)
        for mod in list(sys.modules.keys()):
            if "config" in mod or "uvicorn_config" in mod:
                del sys.modules[mod]
        yield

    def test_host_is_localhost(self):
        """T006.2.4: Host should be localhost for security."""
        import uvicorn_config

        config = getattr(uvicorn_config, "UVICORN_CONFIG", {})
        host = config.get("host", "")

        assert host in ("127.0.0.1", "localhost"), \
            f"Host should be localhost, got: {host}"

    def test_port_is_defined(self):
        """T006.2.4: Port should be defined."""
        import uvicorn_config

        config = getattr(uvicorn_config, "UVICORN_CONFIG", {})
        port = config.get("port")

        assert port is not None, "Port should be defined"
        assert isinstance(port, int), "Port should be an integer"

    def test_port_is_valid(self):
        """T006.2.4: Port should be in valid range."""
        import uvicorn_config

        config = getattr(uvicorn_config, "UVICORN_CONFIG", {})
        port = config.get("port", 0)

        assert 1024 <= port <= 65535, \
            f"Port should be in valid range (1024-65535), got: {port}"


class TestWorkerConfiguration:
    """Tests for worker configuration."""

    @pytest.fixture(autouse=True)
    def setup_path(self):
        """Add ai-service/src to path and clear module cache."""
        if AI_SERVICE_SRC not in sys.path:
            sys.path.insert(0, AI_SERVICE_SRC)
        for mod in list(sys.modules.keys()):
            if "config" in mod or "uvicorn_config" in mod:
                del sys.modules[mod]
        yield

    def test_workers_defined(self):
        """T006.2.4: Workers count should be defined."""
        import uvicorn_config

        config = getattr(uvicorn_config, "UVICORN_CONFIG", {})
        workers = config.get("workers")

        assert workers is not None, "Workers should be defined"
        assert isinstance(workers, int), "Workers should be an integer"

    def test_workers_is_one_for_ai(self):
        """T006.2.4: Workers should be 1 for AI model (shared memory)."""
        import uvicorn_config

        config = getattr(uvicorn_config, "UVICORN_CONFIG", {})
        workers = config.get("workers", 0)

        # For AI models, we typically want 1 worker to share model memory
        assert workers == 1, \
            f"Workers should be 1 for AI service, got: {workers}"


class TestLoggingConfiguration:
    """Tests for logging configuration."""

    @pytest.fixture(autouse=True)
    def setup_path(self):
        """Add ai-service/src to path and clear module cache."""
        if AI_SERVICE_SRC not in sys.path:
            sys.path.insert(0, AI_SERVICE_SRC)
        for mod in list(sys.modules.keys()):
            if "config" in mod or "uvicorn_config" in mod:
                del sys.modules[mod]
        yield

    def test_log_level_defined(self):
        """T006.2.4: Log level should be defined."""
        import uvicorn_config

        config = getattr(uvicorn_config, "UVICORN_CONFIG", {})
        log_level = config.get("log_level")

        assert log_level is not None, "Log level should be defined"

    def test_log_level_is_valid(self):
        """T006.2.4: Log level should be valid."""
        import uvicorn_config

        config = getattr(uvicorn_config, "UVICORN_CONFIG", {})
        log_level = config.get("log_level", "")

        valid_levels = ["critical", "error", "warning", "info", "debug", "trace"]
        assert log_level.lower() in valid_levels, \
            f"Log level should be valid, got: {log_level}"


class TestTimeoutConfiguration:
    """Tests for timeout configuration."""

    @pytest.fixture(autouse=True)
    def setup_path(self):
        """Add ai-service/src to path and clear module cache."""
        if AI_SERVICE_SRC not in sys.path:
            sys.path.insert(0, AI_SERVICE_SRC)
        for mod in list(sys.modules.keys()):
            if "config" in mod or "uvicorn_config" in mod:
                del sys.modules[mod]
        yield

    def test_timeout_defined(self):
        """T006.2.4: Timeout should be defined for long AI operations."""
        import uvicorn_config

        config = getattr(uvicorn_config, "UVICORN_CONFIG", {})
        timeout = config.get("timeout_keep_alive")

        assert timeout is not None, \
            "timeout_keep_alive should be defined for AI operations"

    def test_timeout_is_adequate(self):
        """T006.2.4: Timeout should be adequate for AI processing."""
        import uvicorn_config

        config = getattr(uvicorn_config, "UVICORN_CONFIG", {})
        timeout = config.get("timeout_keep_alive", 0)

        # AI operations can take time, so timeout should be generous
        assert timeout >= 30, \
            f"Timeout should be >= 30s for AI operations, got: {timeout}"


class TestAppReference:
    """Tests for app reference in configuration."""

    @pytest.fixture(autouse=True)
    def setup_path(self):
        """Add ai-service/src to path and clear module cache."""
        if AI_SERVICE_SRC not in sys.path:
            sys.path.insert(0, AI_SERVICE_SRC)
        for mod in list(sys.modules.keys()):
            if "config" in mod or "uvicorn_config" in mod:
                del sys.modules[mod]
        yield

    def test_app_reference_defined(self):
        """T006.2.4: App reference should be defined."""
        import uvicorn_config

        config = getattr(uvicorn_config, "UVICORN_CONFIG", {})
        app = config.get("app")

        assert app is not None, "App reference should be defined"
        assert "main:app" in app, \
            f"App should reference main:app, got: {app}"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
