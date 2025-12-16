"""
ContPAQ-Win AI Service - API Routes

This module defines all FastAPI routes for the AI invoice processing service.
"""

from datetime import datetime, timezone
from typing import Optional
import os

from fastapi import APIRouter
from pydantic import BaseModel


router = APIRouter()


class HealthResponse(BaseModel):
    """Health check response model."""

    status: str
    timestamp: str
    version: str
    models_loaded: bool
    ocr_available: bool


def check_models_loaded() -> bool:
    """
    Check if AI models are loaded and available.

    Returns:
        bool: True if models are ready for inference
    """
    # Stub implementation - will be enhanced in T006.1.5
    # For now, return False as models are not implemented yet
    return False


def check_ocr_available() -> bool:
    """
    Check if Tesseract OCR is available.

    Returns:
        bool: True if Tesseract is installed and accessible
    """
    # Stub implementation - will be enhanced in T006.1.4
    import shutil

    # Check if tesseract is in PATH (cross-platform)
    if shutil.which("tesseract") is not None:
        return True

    # Check common Windows paths
    windows_paths = [
        "C:\\Program Files\\Tesseract-OCR\\tesseract.exe",
        "C:\\Program Files (x86)\\Tesseract-OCR\\tesseract.exe",
    ]
    for path in windows_paths:
        if os.path.exists(path):
            return True

    return False


def get_version() -> str:
    """
    Get the service version.

    Returns:
        str: Version string from package __init__.py
    """
    try:
        from . import __version__
        return __version__
    except (ImportError, AttributeError):
        # Fallback if version not defined in package
        try:
            # Try parent package
            import sys
            if "src" in sys.modules:
                return getattr(sys.modules["src"], "__version__", "0.1.0")
        except Exception:
            pass
        return "0.1.0"


@router.get("/health", response_model=HealthResponse)
async def health_check() -> HealthResponse:
    """
    Health check endpoint.

    Returns service status including:
    - Overall health status
    - Current timestamp (ISO format)
    - Service version
    - Whether AI models are loaded
    - Whether OCR (Tesseract) is available

    Returns:
        HealthResponse: Service health information
    """
    return HealthResponse(
        status="healthy",
        timestamp=datetime.now(timezone.utc).isoformat(),
        version=get_version(),
        models_loaded=check_models_loaded(),
        ocr_available=check_ocr_available(),
    )
