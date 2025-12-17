"""
T012.1.1 - Test for OCR extraction from scanned PDFs

Tests for the ocr_service's ability to extract text from scanned PDFs
using Tesseract OCR with Spanish language support.

TDD: RED phase - tests written before implementation
"""

import pytest
from pathlib import Path
from typing import List, Dict

# Import will fail initially (RED phase)
# Implementation will be created in T012.1.2
from src.services.ocr_service import OCRService, OCRResult


class TestOCRExtraction:
    """Tests for OCR text extraction from scanned PDFs."""

    @pytest.fixture
    def ocr_service(self):
        """Create an OCRService instance for testing."""
        return OCRService()

    @pytest.fixture
    def scanned_pdf_path(self, fixtures_dir: Path) -> Path:
        """Path to a sample scanned PDF."""
        return fixtures_dir / "sample_scanned_invoice.pdf"

    # ========================================================================
    # T012.1.3.1 - Convert PDF page to image (300 DPI)
    # ========================================================================

    def test_convert_page_to_image_returns_image(
        self, ocr_service: OCRService, scanned_pdf_path: Path
    ):
        """convert_page_to_image should return a PIL Image object."""
        if not scanned_pdf_path.exists():
            pytest.skip("Sample scanned PDF not available")

        image = ocr_service.convert_page_to_image(scanned_pdf_path, page_num=0)

        # Should return a PIL Image
        from PIL import Image
        assert isinstance(image, Image.Image)

    def test_convert_page_to_image_uses_300_dpi(
        self, ocr_service: OCRService, scanned_pdf_path: Path
    ):
        """Image should be rendered at 300 DPI for optimal OCR quality."""
        if not scanned_pdf_path.exists():
            pytest.skip("Sample scanned PDF not available")

        image = ocr_service.convert_page_to_image(scanned_pdf_path, page_num=0)

        # At 300 DPI, a letter-size page (8.5x11 inches) would be ~2550x3300 pixels
        # We just verify the image has reasonable dimensions (> 1000 pixels)
        assert image.width >= 1000 or image.height >= 1000

    def test_convert_page_to_image_accepts_page_number(
        self, ocr_service: OCRService, scanned_pdf_path: Path
    ):
        """Should be able to convert any page number."""
        if not scanned_pdf_path.exists():
            pytest.skip("Sample scanned PDF not available")

        # Page 0 should work
        image = ocr_service.convert_page_to_image(scanned_pdf_path, page_num=0)
        assert image is not None

    def test_convert_page_raises_on_invalid_page(
        self, ocr_service: OCRService, scanned_pdf_path: Path
    ):
        """Should raise IndexError for invalid page numbers."""
        if not scanned_pdf_path.exists():
            pytest.skip("Sample scanned PDF not available")

        with pytest.raises(IndexError):
            ocr_service.convert_page_to_image(scanned_pdf_path, page_num=999)

    # ========================================================================
    # T012.1.3.2 - Run Tesseract with Spanish language
    # ========================================================================

    def test_extract_with_ocr_returns_list(
        self, ocr_service: OCRService, scanned_pdf_path: Path
    ):
        """extract_with_ocr should return a list of OCR results."""
        if not scanned_pdf_path.exists():
            pytest.skip("Sample scanned PDF not available")

        result = ocr_service.extract_with_ocr(scanned_pdf_path)

        assert isinstance(result, list)

    def test_extract_with_ocr_uses_spanish_language(
        self, ocr_service: OCRService
    ):
        """OCR service should be configured for Spanish language."""
        # The service should have Spanish as default or configurable language
        assert ocr_service.language == "spa" or "spa" in ocr_service.languages

    def test_ocr_result_has_text_content(
        self, ocr_service: OCRService, scanned_pdf_path: Path
    ):
        """Each OCR result should have text content."""
        if not scanned_pdf_path.exists():
            pytest.skip("Sample scanned PDF not available")

        results = ocr_service.extract_with_ocr(scanned_pdf_path)

        # Should have at least some results (even if scanned PDF has minimal text)
        for result in results:
            assert "text" in result
            assert isinstance(result["text"], str)

    # ========================================================================
    # T012.1.3.3 - Extract text with bounding boxes
    # ========================================================================

    def test_ocr_result_has_bounding_box(
        self, ocr_service: OCRService, scanned_pdf_path: Path
    ):
        """Each OCR result should have bounding box coordinates."""
        if not scanned_pdf_path.exists():
            pytest.skip("Sample scanned PDF not available")

        results = ocr_service.extract_with_ocr(scanned_pdf_path)

        for result in results:
            assert "bbox" in result
            bbox = result["bbox"]
            assert "x0" in bbox
            assert "y0" in bbox
            assert "x1" in bbox
            assert "y1" in bbox

    def test_ocr_result_bbox_has_valid_coordinates(
        self, ocr_service: OCRService, scanned_pdf_path: Path
    ):
        """Bounding box coordinates should be valid (x1 >= x0, y1 >= y0)."""
        if not scanned_pdf_path.exists():
            pytest.skip("Sample scanned PDF not available")

        results = ocr_service.extract_with_ocr(scanned_pdf_path)

        for result in results:
            bbox = result["bbox"]
            assert bbox["x1"] >= bbox["x0"]
            assert bbox["y1"] >= bbox["y0"]

    def test_ocr_result_includes_page_number(
        self, ocr_service: OCRService, scanned_pdf_path: Path
    ):
        """Each OCR result should include the page number."""
        if not scanned_pdf_path.exists():
            pytest.skip("Sample scanned PDF not available")

        results = ocr_service.extract_with_ocr(scanned_pdf_path)

        for result in results:
            assert "page" in result
            assert isinstance(result["page"], int)
            assert result["page"] >= 0

    # ========================================================================
    # T012.1.3.4 - Calculate confidence per text block
    # ========================================================================

    def test_ocr_result_has_confidence_score(
        self, ocr_service: OCRService, scanned_pdf_path: Path
    ):
        """Each OCR result should have a confidence score."""
        if not scanned_pdf_path.exists():
            pytest.skip("Sample scanned PDF not available")

        results = ocr_service.extract_with_ocr(scanned_pdf_path)

        for result in results:
            assert "confidence" in result
            assert isinstance(result["confidence"], (int, float))

    def test_ocr_confidence_is_percentage(
        self, ocr_service: OCRService, scanned_pdf_path: Path
    ):
        """Confidence score should be between 0 and 100."""
        if not scanned_pdf_path.exists():
            pytest.skip("Sample scanned PDF not available")

        results = ocr_service.extract_with_ocr(scanned_pdf_path)

        for result in results:
            assert 0 <= result["confidence"] <= 100

    # ========================================================================
    # Error handling tests
    # ========================================================================

    def test_extract_with_ocr_raises_on_nonexistent_file(
        self, ocr_service: OCRService
    ):
        """extract_with_ocr should raise FileNotFoundError for missing files."""
        with pytest.raises(FileNotFoundError):
            ocr_service.extract_with_ocr("/nonexistent/path/to/file.pdf")

    def test_extract_with_ocr_raises_on_invalid_pdf(
        self, ocr_service: OCRService, tmp_path: Path
    ):
        """extract_with_ocr should raise ValueError for non-PDF files."""
        fake_pdf = tmp_path / "fake.pdf"
        fake_pdf.write_text("This is not a PDF")

        with pytest.raises(ValueError, match="Invalid PDF"):
            ocr_service.extract_with_ocr(fake_pdf)

    def test_extract_with_ocr_accepts_string_path(
        self, ocr_service: OCRService, scanned_pdf_path: Path
    ):
        """extract_with_ocr should accept string paths."""
        if not scanned_pdf_path.exists():
            pytest.skip("Sample scanned PDF not available")

        result = ocr_service.extract_with_ocr(str(scanned_pdf_path))
        assert isinstance(result, list)

    def test_extract_with_ocr_accepts_path_object(
        self, ocr_service: OCRService, scanned_pdf_path: Path
    ):
        """extract_with_ocr should accept Path objects."""
        if not scanned_pdf_path.exists():
            pytest.skip("Sample scanned PDF not available")

        result = ocr_service.extract_with_ocr(scanned_pdf_path)
        assert isinstance(result, list)

    # ========================================================================
    # Multi-page support tests
    # ========================================================================

    def test_extract_with_ocr_handles_all_pages(
        self, ocr_service: OCRService, scanned_pdf_path: Path
    ):
        """extract_with_ocr should process all pages in a PDF."""
        if not scanned_pdf_path.exists():
            pytest.skip("Sample scanned PDF not available")

        results = ocr_service.extract_with_ocr(scanned_pdf_path)

        # Results should be a list (even if empty for minimal text PDFs)
        assert isinstance(results, list)

    def test_extract_single_page_option(
        self, ocr_service: OCRService, scanned_pdf_path: Path
    ):
        """Should be able to extract from a specific page only."""
        if not scanned_pdf_path.exists():
            pytest.skip("Sample scanned PDF not available")

        results = ocr_service.extract_with_ocr(scanned_pdf_path, pages=[0])

        # All results should be from page 0
        for result in results:
            assert result["page"] == 0
