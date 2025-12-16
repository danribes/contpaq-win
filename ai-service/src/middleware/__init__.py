"""
Middleware package for ContPAQ-Win AI Service.

Contains custom middleware for request logging, timing, and other
cross-cutting concerns.
"""

from middleware.logging import RequestLoggingMiddleware

__all__ = ["RequestLoggingMiddleware"]
