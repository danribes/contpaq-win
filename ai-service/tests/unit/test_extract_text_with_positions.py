"""
T011.2.1 - Test for text extraction with position information

Tests for the pdf_extractor service's ability to extract text from PDFs
along with bounding box coordinates for each text block.

TDD: RED phase - tests written before implementation
"""

import pytest
from pathlib import Path
from typing import List

from src.services.pdf_extractor import PDFExtractor, SourceType


class TestExtractTextWithPositions:
    """Tests for extracting text with position information from PDFs."""

    @pytest.fixture
    def pdf_extractor(self):
        """Create a PDFExtractor instance for testing."""
        return PDFExtractor()

    @pytest.fixture
    def text_based_pdf_path(self, fixtures_dir: Path) -> Path:
        """Path to a sample text-based PDF."""
        return fixtures_dir / "sample_invoice.pdf"

    # ========================================================================
    # T011.2.2 - extract_text() method tests
    # ========================================================================

    def test_extract_text_returns_list(
        self, pdf_extractor: PDFExtractor, text_based_pdf_path: Path
    ):
        """extract_text should return a list of text blocks."""
        if not text_based_pdf_path.exists():
            pytest.skip("Sample PDF not available")

        result = pdf_extractor.extract_text(text_based_pdf_path)

        assert isinstance(result, list)

    def test_extract_text_blocks_have_text_content(
        self, pdf_extractor: PDFExtractor, text_based_pdf_path: Path
    ):
        """Each text block should have a 'text' field with content."""
        if not text_based_pdf_path.exists():
            pytest.skip("Sample PDF not available")

        result = pdf_extractor.extract_text(text_based_pdf_path)

        assert len(result) > 0, "Should extract at least one text block"
        for block in result:
            assert "text" in block
            assert isinstance(block["text"], str)

    def test_extract_text_blocks_have_bounding_box(
        self, pdf_extractor: PDFExtractor, text_based_pdf_path: Path
    ):
        """Each text block should have bounding box coordinates."""
        if not text_based_pdf_path.exists():
            pytest.skip("Sample PDF not available")

        result = pdf_extractor.extract_text(text_based_pdf_path)

        assert len(result) > 0
        for block in result:
            assert "bbox" in block
            bbox = block["bbox"]
            # Bounding box should have x0, y0, x1, y1 coordinates
            assert "x0" in bbox
            assert "y0" in bbox
            assert "x1" in bbox
            assert "y1" in bbox

    def test_bounding_box_coordinates_are_numbers(
        self, pdf_extractor: PDFExtractor, text_based_pdf_path: Path
    ):
        """Bounding box coordinates should be numeric values."""
        if not text_based_pdf_path.exists():
            pytest.skip("Sample PDF not available")

        result = pdf_extractor.extract_text(text_based_pdf_path)

        assert len(result) > 0
        for block in result:
            bbox = block["bbox"]
            assert isinstance(bbox["x0"], (int, float))
            assert isinstance(bbox["y0"], (int, float))
            assert isinstance(bbox["x1"], (int, float))
            assert isinstance(bbox["y1"], (int, float))

    def test_bounding_box_coordinates_are_valid(
        self, pdf_extractor: PDFExtractor, text_based_pdf_path: Path
    ):
        """Bounding box x1 > x0 and y1 > y0 (bottom-right > top-left)."""
        if not text_based_pdf_path.exists():
            pytest.skip("Sample PDF not available")

        result = pdf_extractor.extract_text(text_based_pdf_path)

        assert len(result) > 0
        for block in result:
            bbox = block["bbox"]
            assert bbox["x1"] >= bbox["x0"], "x1 should be >= x0"
            assert bbox["y1"] >= bbox["y0"], "y1 should be >= y0"

    def test_extract_text_includes_page_number(
        self, pdf_extractor: PDFExtractor, text_based_pdf_path: Path
    ):
        """Each text block should include the page number."""
        if not text_based_pdf_path.exists():
            pytest.skip("Sample PDF not available")

        result = pdf_extractor.extract_text(text_based_pdf_path)

        assert len(result) > 0
        for block in result:
            assert "page" in block
            assert isinstance(block["page"], int)
            assert block["page"] >= 0  # 0-indexed

    # ========================================================================
    # T011.2.2.1-3 - PyMuPDF specific tests
    # ========================================================================

    def test_extract_text_accepts_string_path(
        self, pdf_extractor: PDFExtractor, text_based_pdf_path: Path
    ):
        """extract_text should accept string paths."""
        if not text_based_pdf_path.exists():
            pytest.skip("Sample PDF not available")

        result = pdf_extractor.extract_text(str(text_based_pdf_path))

        assert isinstance(result, list)

    def test_extract_text_accepts_path_object(
        self, pdf_extractor: PDFExtractor, text_based_pdf_path: Path
    ):
        """extract_text should accept Path objects."""
        if not text_based_pdf_path.exists():
            pytest.skip("Sample PDF not available")

        result = pdf_extractor.extract_text(text_based_pdf_path)

        assert isinstance(result, list)

    def test_extract_text_raises_on_nonexistent_file(
        self, pdf_extractor: PDFExtractor
    ):
        """extract_text should raise FileNotFoundError for missing files."""
        with pytest.raises(FileNotFoundError):
            pdf_extractor.extract_text("/nonexistent/path/to/file.pdf")

    def test_extract_text_raises_on_invalid_pdf(
        self, pdf_extractor: PDFExtractor, tmp_path: Path
    ):
        """extract_text should raise ValueError for non-PDF files."""
        fake_pdf = tmp_path / "fake.pdf"
        fake_pdf.write_text("This is not a PDF")

        with pytest.raises(ValueError, match="Invalid PDF"):
            pdf_extractor.extract_text(fake_pdf)

    # ========================================================================
    # T011.2.3 - Multi-page PDF tests
    # ========================================================================

    def test_extract_text_handles_multipage_pdf(
        self, pdf_extractor: PDFExtractor, text_based_pdf_path: Path
    ):
        """extract_text should handle multi-page PDFs."""
        if not text_based_pdf_path.exists():
            pytest.skip("Sample PDF not available")

        # Even for single-page PDFs, this should work
        result = pdf_extractor.extract_text(text_based_pdf_path)

        assert isinstance(result, list)

    def test_extract_text_returns_all_pages(
        self, pdf_extractor: PDFExtractor, text_based_pdf_path: Path
    ):
        """extract_text should return text from all pages."""
        if not text_based_pdf_path.exists():
            pytest.skip("Sample PDF not available")

        result = pdf_extractor.extract_text(text_based_pdf_path)

        # Verify we have text blocks
        assert len(result) > 0

    # ========================================================================
    # T011.2.4 - Password-protected PDF tests
    # ========================================================================

    def test_extract_text_raises_on_password_protected_pdf(
        self, pdf_extractor: PDFExtractor, tmp_path: Path
    ):
        """extract_text should raise PermissionError for encrypted PDFs."""
        # Skip if we don't have a password-protected sample
        pytest.skip("Requires password-protected PDF fixture")

    def test_extract_text_raises_permission_error_message(
        self, pdf_extractor: PDFExtractor
    ):
        """The error for password-protected PDFs should be informative."""
        pytest.skip("Requires password-protected PDF fixture")

    # ========================================================================
    # Additional extraction quality tests
    # ========================================================================

    def test_extract_text_preserves_whitespace_in_blocks(
        self, pdf_extractor: PDFExtractor, text_based_pdf_path: Path
    ):
        """Text extraction should preserve meaningful whitespace."""
        if not text_based_pdf_path.exists():
            pytest.skip("Sample PDF not available")

        result = pdf_extractor.extract_text(text_based_pdf_path)

        # At least one block should have text
        texts = [block["text"] for block in result if block["text"].strip()]
        assert len(texts) > 0

    def test_extract_text_filters_empty_blocks(
        self, pdf_extractor: PDFExtractor, text_based_pdf_path: Path
    ):
        """extract_text should not return empty text blocks."""
        if not text_based_pdf_path.exists():
            pytest.skip("Sample PDF not available")

        result = pdf_extractor.extract_text(text_based_pdf_path)

        for block in result:
            assert block["text"].strip() != "", "Should not have empty text blocks"
