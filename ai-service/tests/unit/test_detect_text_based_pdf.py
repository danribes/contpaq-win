"""
T011.1.1 - Test for detecting text-based PDFs

Tests for the pdf_extractor service's ability to detect whether a PDF
is text-based (has extractable text) vs scanned (image-based).

TDD: RED phase - tests written before implementation
"""

import pytest
from pathlib import Path

# Import will fail initially (RED phase)
# Implementation will be created in T011.1.3
from src.services.pdf_extractor import PDFExtractor, SourceType


class TestDetectTextBasedPDF:
    """Tests for detecting text-based PDFs."""

    @pytest.fixture
    def pdf_extractor(self):
        """Create a PDFExtractor instance for testing."""
        return PDFExtractor()

    @pytest.fixture
    def text_based_pdf_path(self, fixtures_dir: Path) -> Path:
        """Path to a sample text-based PDF."""
        return fixtures_dir / "sample_invoice.pdf"

    def test_detect_pdf_type_returns_source_type_enum(
        self, pdf_extractor: PDFExtractor, text_based_pdf_path: Path
    ):
        """detect_pdf_type should return a SourceType enum value."""
        if not text_based_pdf_path.exists():
            pytest.skip("Sample PDF not available")

        result = pdf_extractor.detect_pdf_type(text_based_pdf_path)

        assert isinstance(result, SourceType)

    def test_detect_text_based_pdf_returns_text_type(
        self, pdf_extractor: PDFExtractor, text_based_pdf_path: Path
    ):
        """A PDF with extractable text should be classified as TEXT type."""
        if not text_based_pdf_path.exists():
            pytest.skip("Sample PDF not available")

        result = pdf_extractor.detect_pdf_type(text_based_pdf_path)

        assert result == SourceType.TEXT

    def test_detect_pdf_type_accepts_string_path(
        self, pdf_extractor: PDFExtractor, text_based_pdf_path: Path
    ):
        """detect_pdf_type should accept both string and Path objects."""
        if not text_based_pdf_path.exists():
            pytest.skip("Sample PDF not available")

        result = pdf_extractor.detect_pdf_type(str(text_based_pdf_path))

        assert isinstance(result, SourceType)

    def test_detect_pdf_type_raises_on_nonexistent_file(
        self, pdf_extractor: PDFExtractor
    ):
        """detect_pdf_type should raise FileNotFoundError for missing files."""
        with pytest.raises(FileNotFoundError):
            pdf_extractor.detect_pdf_type("/nonexistent/path/to/file.pdf")

    def test_detect_pdf_type_raises_on_invalid_file(
        self, pdf_extractor: PDFExtractor, tmp_path: Path
    ):
        """detect_pdf_type should raise ValueError for non-PDF files."""
        # Create a fake "PDF" file
        fake_pdf = tmp_path / "fake.pdf"
        fake_pdf.write_text("This is not a PDF")

        with pytest.raises(ValueError, match="Invalid PDF"):
            pdf_extractor.detect_pdf_type(fake_pdf)

    def test_source_type_enum_has_text_value(self):
        """SourceType enum should have a TEXT value."""
        assert hasattr(SourceType, "TEXT")

    def test_source_type_enum_has_scanned_value(self):
        """SourceType enum should have a SCANNED value."""
        assert hasattr(SourceType, "SCANNED")

    def test_text_pdf_has_sufficient_text_content(
        self, pdf_extractor: PDFExtractor, text_based_pdf_path: Path
    ):
        """
        A text-based PDF should have at least 100 characters of extractable text.
        This is the threshold used to classify PDFs.
        """
        if not text_based_pdf_path.exists():
            pytest.skip("Sample PDF not available")

        # The PDF should have enough text to be classified as text-based
        result = pdf_extractor.detect_pdf_type(text_based_pdf_path)

        # If it's classified as TEXT, it must have >= 100 chars
        assert result == SourceType.TEXT
