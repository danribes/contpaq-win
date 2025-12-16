"""
ContPAQ-Win AI Service - Unit Tests Package

This package contains unit tests for isolated component testing.
Unit tests focus on individual functions, classes, and modules
without external dependencies.

Test Organization:
    unit/
    ├── __init__.py          # This file
    ├── test_config.py       # Configuration module tests
    ├── test_pdf_extractor.py    # PDF extraction tests
    ├── test_ocr_service.py  # OCR service tests
    └── test_ai_extractor.py # AI field extraction tests

Running Unit Tests:
    pytest ai-service/tests/unit/ -v

Characteristics:
    - Fast execution (no I/O, network, or database)
    - Isolated (mocked dependencies)
    - Focused (one assertion per test when possible)
    - Repeatable (same result every run)
"""

__all__ = []
