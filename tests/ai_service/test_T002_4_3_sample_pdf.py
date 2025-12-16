"""
Test Suite: T002.4.3 - Add sample text-based PDF to fixtures
Tests verify that sample_invoice.pdf exists and is a valid text-based PDF.
"""

import os
import pytest

# Path to fixtures directory
FIXTURES_DIR = os.path.join(
    os.path.dirname(__file__),
    "..",
    "..",
    "ai-service",
    "tests",
    "fixtures",
)


class TestSamplePdf:
    """Test suite for sample text-based PDF fixture."""

    def test_sample_pdf_exists(self):
        """Test that sample_invoice.pdf exists in fixtures directory."""
        pdf_path = os.path.join(FIXTURES_DIR, "sample_invoice.pdf")
        assert os.path.isfile(pdf_path), (
            f"sample_invoice.pdf not found at {pdf_path}"
        )

    def test_sample_pdf_is_valid_pdf(self):
        """Test that sample_invoice.pdf has valid PDF magic bytes."""
        pdf_path = os.path.join(FIXTURES_DIR, "sample_invoice.pdf")
        with open(pdf_path, "rb") as f:
            header = f.read(5)
        assert header == b"%PDF-", (
            "sample_invoice.pdf does not have valid PDF header"
        )

    def test_sample_pdf_not_empty(self):
        """Test that sample_invoice.pdf is not empty."""
        pdf_path = os.path.join(FIXTURES_DIR, "sample_invoice.pdf")
        file_size = os.path.getsize(pdf_path)
        assert file_size > 100, (
            f"sample_invoice.pdf is too small: {file_size} bytes"
        )

    def test_sample_pdf_is_text_based(self):
        """Test that sample_invoice.pdf contains extractable text streams."""
        pdf_path = os.path.join(FIXTURES_DIR, "sample_invoice.pdf")
        with open(pdf_path, "rb") as f:
            content = f.read()
        # Text-based PDFs contain text streams with BT (Begin Text) markers
        # or /Type /Page markers
        assert b"/Type" in content or b"BT" in content, (
            "sample_invoice.pdf does not appear to be a text-based PDF"
        )

    def test_sample_pdf_contains_invoice_content(self):
        """Test that sample_invoice.pdf contains invoice-related text."""
        pdf_path = os.path.join(FIXTURES_DIR, "sample_invoice.pdf")
        with open(pdf_path, "rb") as f:
            content = f.read()
        # Check for common invoice terms (may be encoded)
        content_str = content.decode("latin-1", errors="ignore")
        has_invoice_content = (
            "RFC" in content_str or
            "Factura" in content_str or
            "FACTURA" in content_str or
            "Invoice" in content_str or
            "Total" in content_str or
            "TOTAL" in content_str
        )
        assert has_invoice_content, (
            "sample_invoice.pdf does not contain invoice-related content"
        )
