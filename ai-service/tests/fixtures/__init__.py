"""
ContPAQ-Win AI Service - Test Fixtures Package

This package contains test fixture files for the AI service test suite:
- Sample PDF files (text-based and scanned invoices)
- Sample image files for OCR testing
- Mock model files for AI testing
- Expected output data for validation

Fixtures Directory Structure:
    fixtures/
    ├── __init__.py          # This file
    ├── sample_invoice.pdf   # Text-based invoice PDF
    ├── sample_scanned_invoice.pdf  # Scanned invoice image PDF
    └── models/              # Mock model files (if needed)

Usage:
    from ai_service.tests.conftest import FIXTURES_DIR

    sample_pdf = FIXTURES_DIR / "sample_invoice.pdf"
"""

__all__ = []
