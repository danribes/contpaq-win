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

__all__ = []
