"""
ContPAQ-Win AI Service - Business Logic Services Package

This package contains the core business logic services for invoice processing,
including PDF extraction, OCR, and AI-based field extraction.

Modules:
    pdf_extractor: PDF text extraction using PyMuPDF, handles both text-based
                   and scanned PDFs with automatic type detection
    ocr_service: Tesseract OCR wrapper for scanned document processing,
                 includes image preprocessing (deskew, contrast, noise reduction)
    ai_extractor: LayoutLMv3-based intelligent field extraction service,
                  maps extracted data to Mexican invoice schema

All services are designed to be:
    - Stateless for easy testing and scaling
    - Async-compatible for FastAPI integration
    - Configurable via environment variables
"""

from .pdf_extractor import PDFExtractor, SourceType, TEXT_THRESHOLD
from .ocr_service import OCRService, OCRResult, DEFAULT_DPI, DEFAULT_LANGUAGE
from .image_preprocessor import ImagePreprocessor
from .ai_extractor import AIExtractor, FieldLabel, LAYOUTLM_MODEL_NAME, BIO_LABELS
from .line_item_extractor import LineItemExtractor, TableRegion, TextBlock
from .extraction_service import (
    ExtractionService,
    ExtractionError,
    InvalidPDFError,
    FileTooLargeError,
    MAX_FILE_SIZE,
)

__all__ = [
    "PDFExtractor",
    "SourceType",
    "TEXT_THRESHOLD",
    "OCRService",
    "OCRResult",
    "DEFAULT_DPI",
    "DEFAULT_LANGUAGE",
    "ImagePreprocessor",
    "AIExtractor",
    "FieldLabel",
    "LAYOUTLM_MODEL_NAME",
    "BIO_LABELS",
    "LineItemExtractor",
    "TableRegion",
    "TextBlock",
    "ExtractionService",
    "ExtractionError",
    "InvalidPDFError",
    "FileTooLargeError",
    "MAX_FILE_SIZE",
]
