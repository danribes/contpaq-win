"""
Uvicorn configuration for ContPAQ-Win AI Service.

This module provides production-ready uvicorn settings for
running the FastAPI application.

Usage:
    uvicorn main:app --config uvicorn_config.py

    Or programmatically:
    import uvicorn
    from uvicorn_config import UVICORN_CONFIG
    uvicorn.run(**UVICORN_CONFIG)
"""

import os

# Environment detection
IS_PRODUCTION = os.getenv("ENV", "development").lower() == "production"

# Production uvicorn configuration
UVICORN_CONFIG = {
    # Application reference
    "app": "main:app",

    # Host configuration - localhost only for security
    # The Windows Bridge will proxy requests
    "host": "127.0.0.1",
    "port": 8000,

    # Worker configuration
    # Using 1 worker because AI models share memory
    # Multiple workers would load multiple copies of the model
    "workers": 1,

    # Logging configuration
    "log_level": "info" if IS_PRODUCTION else "debug",
    "access_log": True,

    # Timeout configuration
    # AI operations can take time (OCR, model inference)
    "timeout_keep_alive": 120,  # 2 minutes for long operations

    # Performance settings
    "limit_concurrency": 10,  # Limit concurrent connections
    "limit_max_requests": 1000,  # Restart worker after N requests

    # Development settings (disabled in production)
    "reload": not IS_PRODUCTION,
}


def get_config():
    """Get uvicorn configuration dictionary."""
    return UVICORN_CONFIG.copy()


def run():
    """Run uvicorn with production configuration."""
    import uvicorn
    uvicorn.run(**UVICORN_CONFIG)


if __name__ == "__main__":
    run()
