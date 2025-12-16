"""
ContPAQ-Win AI Service - Integration Tests Package

This package contains integration tests for testing component interactions.
Integration tests verify that multiple components work correctly together
and may use real dependencies (files, network, APIs).

Test Organization:
    integration/
    ├── __init__.py              # This file
    ├── test_api.py              # FastAPI endpoint tests
    ├── test_extraction_pipeline.py  # Full extraction workflow
    └── test_health_check.py     # Service health verification

Running Integration Tests:
    pytest ai-service/tests/integration/ -v

Characteristics:
    - Slower execution (uses real I/O)
    - Tests real component interactions
    - May require service startup
    - Uses test fixtures (sample PDFs)

Fixtures Available:
    - sample_invoice.pdf: Text-based invoice for extraction
    - sample_scanned_invoice.pdf: Image-based invoice for OCR

Note:
    Some integration tests may be marked with:
    - @pytest.mark.slow: Takes >5 seconds
    - @pytest.mark.requires_tesseract: Needs Tesseract installed
    - @pytest.mark.requires_model: Needs AI model loaded
"""

__all__ = []
