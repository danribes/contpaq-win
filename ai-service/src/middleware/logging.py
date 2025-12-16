"""
Request logging middleware for ContPAQ-Win AI Service.

This module provides middleware that logs all incoming HTTP requests
with method, path, status code, and timing information.
"""

import logging
import time
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

# Configure logger for request logging
logger = logging.getLogger("contpaq.ai.request")
logger.setLevel(logging.INFO)

# Add handler if not already configured
if not logger.handlers:
    handler = logging.StreamHandler()
    handler.setFormatter(
        logging.Formatter(
            "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
        )
    )
    logger.addHandler(handler)


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """
    Middleware that logs HTTP requests with timing information.

    Logs:
    - HTTP method (GET, POST, etc.)
    - Request path
    - Response status code
    - Request duration in milliseconds
    """

    async def dispatch(self, request: Request, call_next) -> Response:
        """Process request and log details."""
        start_time = time.time()

        # Get request details
        method = request.method
        path = request.url.path

        # Process the request
        response = await call_next(request)

        # Calculate duration
        duration_ms = (time.time() - start_time) * 1000

        # Log the request
        logger.info(
            f"{method} {path} - {response.status_code} - {duration_ms:.2f}ms"
        )

        return response
