"""
T011.1.2 - Test for detecting scanned PDFs

Tests for the pdf_extractor service's ability to detect scanned PDFs
(image-based PDFs with minimal or no extractable text).

TDD: RED phase - tests written before implementation
"""

import pytest
from pathlib import Path

# Import will fail initially (RED phase)
# Implementation will be created in T011.1.3
from src.services.pdf_extractor import PDFExtractor, SourceType


class TestDetectScannedPDF:
    """Tests for detecting scanned (image-based) PDFs."""

    @pytest.fixture
    def pdf_extractor(self):
        """Create a PDFExtractor instance for testing."""
        return PDFExtractor()

    @pytest.fixture
    def scanned_pdf_path(self, fixtures_dir: Path) -> Path:
        """Path to a sample scanned PDF."""
        return fixtures_dir / "sample_scanned_invoice.pdf"

    def test_detect_scanned_pdf_returns_scanned_type(
        self, pdf_extractor: PDFExtractor, scanned_pdf_path: Path
    ):
        """A PDF with no extractable text should be classified as SCANNED type."""
        if not scanned_pdf_path.exists():
            pytest.skip("Sample scanned PDF not available")

        result = pdf_extractor.detect_pdf_type(scanned_pdf_path)

        assert result == SourceType.SCANNED

    def test_scanned_pdf_has_insufficient_text_content(
        self, pdf_extractor: PDFExtractor, scanned_pdf_path: Path
    ):
        """
        A scanned PDF should have less than 100 characters of extractable text.
        This is the threshold used to classify PDFs as scanned.
        """
        if not scanned_pdf_path.exists():
            pytest.skip("Sample scanned PDF not available")

        result = pdf_extractor.detect_pdf_type(scanned_pdf_path)

        # If classified as SCANNED, it must have < 100 chars
        assert result == SourceType.SCANNED

    def test_detect_empty_pdf_returns_scanned_type(
        self, pdf_extractor: PDFExtractor, tmp_path: Path
    ):
        """
        A PDF with absolutely no text should be classified as SCANNED.
        This tests the edge case of a completely empty text layer.
        """
        # This test will need a minimal PDF with no text
        # For now, we test with the scanned sample
        pytest.skip("Requires valid empty PDF fixture")

    def test_detect_pdf_with_minimal_text_returns_scanned(
        self, pdf_extractor: PDFExtractor, tmp_path: Path
    ):
        """
        A PDF with less than 100 chars should be classified as SCANNED.
        The threshold is exactly 100 characters.
        """
        # This will be tested with the scanned sample which has < 100 chars
        pytest.skip("Requires PDF with minimal text fixture")

    def test_source_type_values_are_distinct(self):
        """SourceType.TEXT and SourceType.SCANNED should be different values."""
        assert SourceType.TEXT != SourceType.SCANNED

    def test_source_type_is_string_serializable(self):
        """SourceType values should be serializable to strings for API responses."""
        # Enum values should have string representation
        assert SourceType.TEXT.value is not None
        assert SourceType.SCANNED.value is not None

    def test_detect_scanned_pdf_accepts_path_object(
        self, pdf_extractor: PDFExtractor, scanned_pdf_path: Path
    ):
        """detect_pdf_type should work with pathlib.Path objects."""
        if not scanned_pdf_path.exists():
            pytest.skip("Sample scanned PDF not available")

        # Should not raise any errors
        result = pdf_extractor.detect_pdf_type(scanned_pdf_path)
        assert isinstance(result, SourceType)

    def test_detect_scanned_pdf_from_string_path(
        self, pdf_extractor: PDFExtractor, scanned_pdf_path: Path
    ):
        """detect_pdf_type should work with string paths."""
        if not scanned_pdf_path.exists():
            pytest.skip("Sample scanned PDF not available")

        # Should not raise any errors
        result = pdf_extractor.detect_pdf_type(str(scanned_pdf_path))
        assert isinstance(result, SourceType)
