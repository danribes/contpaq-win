"""
ContPAQ-Win AI Service

AI-powered invoice processing service that extracts data from PDF invoices
using OCR and LayoutLMv3 for intelligent field detection.

This package provides:
- PDF text extraction (PyMuPDF)
- OCR for scanned documents (Tesseract)
- AI-based field extraction (LayoutLMv3)
- REST API endpoints (FastAPI)
"""

__version__ = "0.1.0"
__author__ = "ContPAQ-Win Team"
__all__ = ["__version__", "__author__"]
