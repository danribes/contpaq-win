"""
Test Suite: T002.4.4 - Add sample scanned PDF to fixtures
Tests verify that sample_scanned_invoice.pdf exists and is an image-based PDF.
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


class TestScannedPdf:
    """Test suite for sample scanned (image-based) PDF fixture."""

    def test_scanned_pdf_exists(self):
        """Test that sample_scanned_invoice.pdf exists in fixtures directory."""
        pdf_path = os.path.join(FIXTURES_DIR, "sample_scanned_invoice.pdf")
        assert os.path.isfile(pdf_path), (
            f"sample_scanned_invoice.pdf not found at {pdf_path}"
        )

    def test_scanned_pdf_is_valid_pdf(self):
        """Test that sample_scanned_invoice.pdf has valid PDF magic bytes."""
        pdf_path = os.path.join(FIXTURES_DIR, "sample_scanned_invoice.pdf")
        with open(pdf_path, "rb") as f:
            header = f.read(5)
        assert header == b"%PDF-", (
            "sample_scanned_invoice.pdf does not have valid PDF header"
        )

    def test_scanned_pdf_not_empty(self):
        """Test that sample_scanned_invoice.pdf is not empty."""
        pdf_path = os.path.join(FIXTURES_DIR, "sample_scanned_invoice.pdf")
        file_size = os.path.getsize(pdf_path)
        assert file_size > 100, (
            f"sample_scanned_invoice.pdf is too small: {file_size} bytes"
        )

    def test_scanned_pdf_contains_image(self):
        """Test that sample_scanned_invoice.pdf contains image XObject."""
        pdf_path = os.path.join(FIXTURES_DIR, "sample_scanned_invoice.pdf")
        with open(pdf_path, "rb") as f:
            content = f.read()
        # Scanned PDFs contain image XObjects
        has_image = (
            b"/Subtype /Image" in content or
            b"/XObject" in content
        )
        assert has_image, (
            "sample_scanned_invoice.pdf does not appear to contain images"
        )

    def test_scanned_pdf_different_from_text_pdf(self):
        """Test that scanned PDF is different from text-based PDF."""
        text_pdf_path = os.path.join(FIXTURES_DIR, "sample_invoice.pdf")
        scanned_pdf_path = os.path.join(FIXTURES_DIR, "sample_scanned_invoice.pdf")

        with open(text_pdf_path, "rb") as f:
            text_content = f.read()
        with open(scanned_pdf_path, "rb") as f:
            scanned_content = f.read()

        # Files should be different
        assert text_content != scanned_content, (
            "Scanned PDF should be different from text-based PDF"
        )
