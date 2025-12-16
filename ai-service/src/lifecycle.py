"""
Lifecycle management for ContPAQ-Win AI Service.

This module provides startup and shutdown handlers for graceful
application lifecycle management. It ensures proper resource
cleanup when the service is stopped.
"""

import logging
from contextlib import asynccontextmanager
from typing import AsyncGenerator

# Configure logger
logger = logging.getLogger("contpaq.ai.lifecycle")


async def startup_handler() -> None:
    """
    Handle application startup.

    Called when the application starts. Use this to:
    - Initialize connections
    - Load AI models
    - Set up resources
    """
    logger.info("ContPAQ-Win AI Service starting up...")
    logger.info("Startup complete - service ready")


async def shutdown_handler() -> None:
    """
    Handle application shutdown.

    Called when the application is stopping. Use this to:
    - Close connections
    - Release resources
    - Clean up temporary files
    """
    logger.info("ContPAQ-Win AI Service shutting down...")
    await cleanup_resources()
    logger.info("Shutdown complete - goodbye!")


async def cleanup_resources() -> None:
    """
    Clean up application resources.

    Called during shutdown to release:
    - Database connections
    - File handles
    - Model memory
    - Temporary files
    """
    logger.info("Cleaning up resources...")

    # Future: Add cleanup for:
    # - AI model unloading
    # - Temp file cleanup
    # - Connection pool closing

    logger.info("Resource cleanup complete")


@asynccontextmanager
async def lifespan(app) -> AsyncGenerator[None, None]:
    """
    Lifespan context manager for FastAPI application.

    This is the modern way to handle startup/shutdown events in FastAPI.
    It replaces the deprecated @app.on_event decorators.

    Usage:
        app = FastAPI(lifespan=lifespan)

    Args:
        app: The FastAPI application instance

    Yields:
        None: Control is yielded to the application
    """
    # Startup
    await startup_handler()

    yield  # Application runs here

    # Shutdown
    await shutdown_handler()
