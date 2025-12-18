"""
ContPAQ-Win AI Service - API Routes

This module defines all FastAPI routes for the AI invoice processing service.
"""

from datetime import datetime, timezone
from typing import List, Optional
import os
import logging

from fastapi import APIRouter, File, UploadFile, HTTPException
from pydantic import BaseModel

from ..services.extraction_service import (
    ExtractionService,
    ExtractionError,
    InvalidPDFError,
    FileTooLargeError,
    MAX_FILE_SIZE,
)
from ..models.extraction import InvoiceExtraction

logger = logging.getLogger(__name__)


router = APIRouter()


class HealthResponse(BaseModel):
    """Health check response model."""

    status: str
    timestamp: str
    version: str
    models_loaded: bool
    ocr_available: bool


# Default model path - relative to ai-service directory
DEFAULT_MODEL_PATH = "./models/layoutlm"


def get_model_path() -> str:
    """
    Get the configured model directory path.

    Returns:
        str: Path to the model directory
    """
    # Check environment variable first, then use default
    return os.environ.get("MODEL_PATH", DEFAULT_MODEL_PATH)


def check_model_files() -> bool:
    """
    Check if required model files exist in the model directory.

    Required files for a HuggingFace transformer model:
    - config.json: Model configuration
    - pytorch_model.bin or model.safetensors: Model weights

    Returns:
        bool: True if all required files are present
    """
    model_path = get_model_path()

    # Check if directory exists
    if not os.path.exists(model_path) or not os.path.isdir(model_path):
        return False

    # Required files
    config_path = os.path.join(model_path, "config.json")
    if not os.path.exists(config_path):
        return False

    # Model weights can be in different formats
    weights_files = [
        os.path.join(model_path, "pytorch_model.bin"),
        os.path.join(model_path, "model.safetensors"),
    ]
    has_weights = any(os.path.exists(f) for f in weights_files)

    return has_weights


def get_model_status() -> dict:
    """
    Get detailed model status information.

    Returns:
        dict: Model status with keys:
            - path: str - Path to model directory
            - exists: bool - Whether directory exists
            - has_config: bool - Whether config.json exists
            - has_weights: bool - Whether model weights exist
            - ready: bool - Whether model is ready for inference
    """
    model_path = get_model_path()

    exists = os.path.exists(model_path) and os.path.isdir(model_path)

    has_config = False
    has_weights = False

    if exists:
        config_path = os.path.join(model_path, "config.json")
        has_config = os.path.exists(config_path)

        weights_files = [
            os.path.join(model_path, "pytorch_model.bin"),
            os.path.join(model_path, "model.safetensors"),
        ]
        has_weights = any(os.path.exists(f) for f in weights_files)

    return {
        "path": model_path,
        "exists": exists,
        "has_config": has_config,
        "has_weights": has_weights,
        "ready": exists and has_config and has_weights,
    }


def check_models_loaded() -> bool:
    """
    Check if AI models are loaded and available.

    Returns:
        bool: True if models are ready for inference
    """
    return check_model_files()


def _get_tesseract_path() -> Optional[str]:
    """
    Find the Tesseract executable path.

    Returns:
        Optional[str]: Path to tesseract executable or None if not found
    """
    import shutil

    # Check if tesseract is in PATH (cross-platform)
    tesseract_in_path = shutil.which("tesseract")
    if tesseract_in_path is not None:
        return tesseract_in_path

    # Check common Windows paths
    windows_paths = [
        "C:\\Program Files\\Tesseract-OCR\\tesseract.exe",
        "C:\\Program Files (x86)\\Tesseract-OCR\\tesseract.exe",
    ]
    for path in windows_paths:
        if os.path.exists(path):
            return path

    return None


def check_ocr_available() -> bool:
    """
    Check if Tesseract OCR is available.

    Returns:
        bool: True if Tesseract is installed and accessible
    """
    return _get_tesseract_path() is not None


def get_tesseract_version() -> Optional[str]:
    """
    Get the installed Tesseract version.

    Returns:
        Optional[str]: Version string (e.g., "5.3.0") or None if not installed
    """
    import subprocess

    tesseract_path = _get_tesseract_path()
    if tesseract_path is None:
        return None

    try:
        result = subprocess.run(
            [tesseract_path, "--version"],
            capture_output=True,
            text=True,
            timeout=5,
        )
        # Parse version from output like "tesseract 5.3.0"
        output = result.stdout or result.stderr
        for line in output.split("\n"):
            if "tesseract" in line.lower():
                parts = line.split()
                for part in parts:
                    # Look for version-like string (contains digits and dots)
                    if any(c.isdigit() for c in part) and "." in part:
                        return part.strip()
        return None
    except (subprocess.TimeoutExpired, subprocess.SubprocessError, OSError):
        return None


def check_spanish_language_available() -> bool:
    """
    Check if Spanish language pack is available for Tesseract.

    Returns:
        bool: True if Spanish (spa) language data is installed
    """
    import subprocess

    tesseract_path = _get_tesseract_path()
    if tesseract_path is None:
        return False

    try:
        result = subprocess.run(
            [tesseract_path, "--list-langs"],
            capture_output=True,
            text=True,
            timeout=5,
        )
        output = result.stdout or result.stderr
        # Check if "spa" is in the list of languages
        languages = output.lower().split()
        return "spa" in languages
    except (subprocess.TimeoutExpired, subprocess.SubprocessError, OSError):
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


@router.post("/extract", response_model=InvoiceExtraction)
async def extract_invoice(
    file: UploadFile = File(..., description="PDF file to extract invoice data from")
) -> InvoiceExtraction:
    """
    Extract invoice data from an uploaded PDF file.

    This endpoint accepts a PDF file (text-based or scanned) and extracts
    structured invoice data including:
    - Vendor RFC and name
    - Invoice number and date
    - Subtotal, IVA, and total amounts
    - Line items with description, quantity, unit price, and amount

    The extraction pipeline automatically detects the PDF type and uses
    the appropriate extraction method (PyMuPDF for text-based, OCR for scanned).

    Args:
        file: PDF file upload (multipart/form-data)

    Returns:
        InvoiceExtraction: Structured invoice data with confidence scores

    Raises:
        HTTPException 400: If the file is not a valid PDF
        HTTPException 413: If the file exceeds maximum size
        HTTPException 500: If extraction fails
    """
    # Validate content type
    content_type = file.content_type or ""
    if not content_type.startswith("application/pdf") and not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=400,
            detail="El archivo debe ser un PDF. Por favor, suba un archivo con extensión .pdf",
        )

    # Read file content
    try:
        content = await file.read()
    except Exception as e:
        logger.error(f"Failed to read uploaded file: {e}")
        raise HTTPException(
            status_code=400,
            detail="Error al leer el archivo subido",
        )

    # Check file size
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=413,
            detail=f"El archivo excede el tamaño máximo de {MAX_FILE_SIZE // (1024 * 1024)}MB",
        )

    # Create extraction service and process
    service = ExtractionService()

    try:
        result = service.extract(content, filename=file.filename or "document.pdf")
        return result

    except InvalidPDFError as e:
        logger.warning(f"Invalid PDF uploaded: {e}")
        raise HTTPException(
            status_code=400,
            detail=str(e),
        )

    except FileTooLargeError as e:
        logger.warning(f"File too large: {e}")
        raise HTTPException(
            status_code=413,
            detail=str(e),
        )

    except ExtractionError as e:
        logger.error(f"Extraction failed: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Error en la extracción: {str(e)}",
        )

    except Exception as e:
        logger.exception(f"Unexpected error during extraction: {e}")
        raise HTTPException(
            status_code=500,
            detail="Error interno del servidor durante la extracción",
        )
