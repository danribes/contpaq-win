"""
Tests for T006.2.5: Add graceful shutdown handler

Verifies that the FastAPI application has proper lifecycle
event handlers for graceful startup and shutdown.
"""

import os
import sys
import pytest
from unittest.mock import patch, MagicMock, AsyncMock

# Configure pytest-asyncio
pytest_plugins = ('pytest_asyncio',)

# Add ai-service/src to path for imports
AI_SERVICE_SRC = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
    "ai-service",
    "src"
)


class TestLifecycleEventsExist:
    """Tests for lifecycle event handlers presence."""

    @pytest.fixture(autouse=True)
    def setup_path(self):
        """Add ai-service/src to path and clear module cache."""
        if AI_SERVICE_SRC not in sys.path:
            sys.path.insert(0, AI_SERVICE_SRC)
        # Clear any cached imports
        for mod in list(sys.modules.keys()):
            if mod in ("main", "api", "api.routes", "lifecycle") \
               or mod.startswith("api.") or mod.startswith("lifecycle"):
                del sys.modules[mod]
        yield

    def test_lifecycle_module_exists(self):
        """T006.2.5: lifecycle module should exist."""
        import lifecycle
        assert lifecycle is not None

    def test_startup_handler_exists(self):
        """T006.2.5: startup handler function should exist."""
        from lifecycle import startup_handler
        assert callable(startup_handler)

    def test_shutdown_handler_exists(self):
        """T006.2.5: shutdown handler function should exist."""
        from lifecycle import shutdown_handler
        assert callable(shutdown_handler)


class TestStartupHandler:
    """Tests for startup handler behavior."""

    @pytest.fixture(autouse=True)
    def setup_path(self):
        """Add ai-service/src to path and clear module cache."""
        if AI_SERVICE_SRC not in sys.path:
            sys.path.insert(0, AI_SERVICE_SRC)
        for mod in list(sys.modules.keys()):
            if mod in ("main", "api", "api.routes", "lifecycle") \
               or mod.startswith("api.") or mod.startswith("lifecycle"):
                del sys.modules[mod]
        yield

    @pytest.mark.asyncio
    async def test_startup_handler_is_async(self):
        """T006.2.5: startup handler should be async."""
        import asyncio
        from lifecycle import startup_handler

        # If it's a coroutine function, calling it returns a coroutine
        result = startup_handler()
        assert asyncio.iscoroutine(result), \
            "startup_handler should be async"
        # Clean up the coroutine
        await result

    @pytest.mark.asyncio
    async def test_startup_handler_completes(self):
        """T006.2.5: startup handler should complete without error."""
        from lifecycle import startup_handler

        # Should not raise any exceptions
        await startup_handler()


class TestShutdownHandler:
    """Tests for shutdown handler behavior."""

    @pytest.fixture(autouse=True)
    def setup_path(self):
        """Add ai-service/src to path and clear module cache."""
        if AI_SERVICE_SRC not in sys.path:
            sys.path.insert(0, AI_SERVICE_SRC)
        for mod in list(sys.modules.keys()):
            if mod in ("main", "api", "api.routes", "lifecycle") \
               or mod.startswith("api.") or mod.startswith("lifecycle"):
                del sys.modules[mod]
        yield

    @pytest.mark.asyncio
    async def test_shutdown_handler_is_async(self):
        """T006.2.5: shutdown handler should be async."""
        import asyncio
        from lifecycle import shutdown_handler

        result = shutdown_handler()
        assert asyncio.iscoroutine(result), \
            "shutdown_handler should be async"
        await result

    @pytest.mark.asyncio
    async def test_shutdown_handler_completes(self):
        """T006.2.5: shutdown handler should complete without error."""
        from lifecycle import shutdown_handler

        # Should not raise any exceptions
        await shutdown_handler()


class TestLifespanContext:
    """Tests for lifespan context manager."""

    @pytest.fixture(autouse=True)
    def setup_path(self):
        """Add ai-service/src to path and clear module cache."""
        if AI_SERVICE_SRC not in sys.path:
            sys.path.insert(0, AI_SERVICE_SRC)
        for mod in list(sys.modules.keys()):
            if mod in ("main", "api", "api.routes", "lifecycle") \
               or mod.startswith("api.") or mod.startswith("lifecycle"):
                del sys.modules[mod]
        yield

    def test_lifespan_context_exists(self):
        """T006.2.5: lifespan context manager should exist."""
        from lifecycle import lifespan
        assert lifespan is not None

    def test_lifespan_is_async_context_manager(self):
        """T006.2.5: lifespan should be an async context manager."""
        from lifecycle import lifespan
        from unittest.mock import MagicMock

        # Create a mock app to test the context manager
        mock_app = MagicMock()

        # Call lifespan with mock app - should return something with __aenter__
        ctx = lifespan(mock_app)
        assert hasattr(ctx, '__aenter__') and hasattr(ctx, '__aexit__'), \
            "lifespan(app) should return an async context manager"


class TestAppUsesLifespan:
    """Tests for app using lifespan events."""

    @pytest.fixture(autouse=True)
    def setup_path(self):
        """Add ai-service/src to path and clear module cache."""
        if AI_SERVICE_SRC not in sys.path:
            sys.path.insert(0, AI_SERVICE_SRC)
        for mod in list(sys.modules.keys()):
            if mod in ("main", "api", "api.routes", "lifecycle", "middleware") \
               or mod.startswith("api.") or mod.startswith("lifecycle") \
               or mod.startswith("middleware"):
                del sys.modules[mod]
        yield

    def test_app_has_lifespan(self):
        """T006.2.5: FastAPI app should have lifespan configured."""
        from main import app

        # FastAPI 0.93+ uses router.lifespan_context
        # Earlier versions use on_event decorators
        has_lifespan = (
            app.router.lifespan_context is not None or
            len(app.router.on_startup) > 0 or
            len(app.router.on_shutdown) > 0
        )

        assert has_lifespan, \
            "App should have lifespan events configured"


class TestGracefulCleanup:
    """Tests for graceful cleanup functionality."""

    @pytest.fixture(autouse=True)
    def setup_path(self):
        """Add ai-service/src to path and clear module cache."""
        if AI_SERVICE_SRC not in sys.path:
            sys.path.insert(0, AI_SERVICE_SRC)
        for mod in list(sys.modules.keys()):
            if mod in ("main", "api", "api.routes", "lifecycle") \
               or mod.startswith("api.") or mod.startswith("lifecycle"):
                del sys.modules[mod]
        yield

    def test_cleanup_resources_function_exists(self):
        """T006.2.5: cleanup_resources function should exist."""
        from lifecycle import cleanup_resources
        assert callable(cleanup_resources)

    @pytest.mark.asyncio
    async def test_cleanup_resources_is_async(self):
        """T006.2.5: cleanup_resources should be async."""
        import asyncio
        from lifecycle import cleanup_resources

        result = cleanup_resources()
        assert asyncio.iscoroutine(result), \
            "cleanup_resources should be async"
        await result


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
