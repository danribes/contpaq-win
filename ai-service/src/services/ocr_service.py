"""
OCR Service - T012.1

Provides OCR (Optical Character Recognition) capabilities for scanned PDFs
using Tesseract OCR with Spanish language support.

Features:
- Convert PDF pages to images at 300 DPI
- Extract text with bounding boxes
- Calculate confidence scores per text block
- Support for multi-page PDFs

Uses PyMuPDF for PDF to image conversion and pytesseract for OCR.
"""

from pathlib import Path
from typing import Dict, List, Optional, Union

import fitz  # PyMuPDF
from PIL import Image
import pytesseract

# Type alias for OCR result
OCRResult = Dict[str, Union[str, int, float, Dict[str, float]]]

# Default DPI for PDF to image conversion (300 DPI is optimal for OCR)
DEFAULT_DPI = 300

# Default language for OCR (Spanish)
DEFAULT_LANGUAGE = "spa"


class OCRService:
    """
    Service for extracting text from scanned PDFs using Tesseract OCR.

    This service converts PDF pages to images and runs Tesseract OCR
    to extract text with position and confidence information.

    Attributes:
        language: The OCR language code (default: "spa" for Spanish)
        languages: List of supported languages
        dpi: Resolution for PDF to image conversion (default: 300)

    Example:
        >>> ocr = OCRService()
        >>> results = ocr.extract_with_ocr("scanned_invoice.pdf")
        >>> for result in results:
        ...     print(f"Text: {result['text']}")
        ...     print(f"Confidence: {result['confidence']}%")
    """

    def __init__(
        self,
        language: str = DEFAULT_LANGUAGE,
        dpi: int = DEFAULT_DPI
    ):
        """
        Initialize the OCR service.

        Args:
            language: Tesseract language code (default: "spa" for Spanish)
            dpi: Resolution for PDF to image conversion (default: 300)
        """
        self.language = language
        self.languages = [language]
        self.dpi = dpi

    def convert_page_to_image(
        self,
        pdf_path: Union[str, Path],
        page_num: int = 0
    ) -> Image.Image:
        """
        Convert a PDF page to a PIL Image at the configured DPI.

        Args:
            pdf_path: Path to the PDF file
            page_num: Page number to convert (0-indexed)

        Returns:
            PIL Image object of the page

        Raises:
            FileNotFoundError: If the PDF file doesn't exist
            ValueError: If the file is not a valid PDF
            IndexError: If the page number is out of range
        """
        path = Path(pdf_path) if isinstance(pdf_path, str) else pdf_path

        if not path.exists():
            raise FileNotFoundError(f"PDF file not found: {path}")

        try:
            doc = fitz.open(str(path))
        except Exception as e:
            raise ValueError(f"Invalid PDF file: {path}. Error: {e}")

        try:
            if page_num < 0 or page_num >= len(doc):
                raise IndexError(
                    f"Page {page_num} out of range. "
                    f"PDF has {len(doc)} pages (0-{len(doc)-1})."
                )

            page = doc[page_num]

            # Calculate zoom factor for desired DPI
            # Default PDF resolution is 72 DPI
            zoom = self.dpi / 72.0
            matrix = fitz.Matrix(zoom, zoom)

            # Render page to pixmap
            pixmap = page.get_pixmap(matrix=matrix)

            # Convert to PIL Image
            img = Image.frombytes(
                "RGB",
                [pixmap.width, pixmap.height],
                pixmap.samples
            )

            return img

        finally:
            doc.close()

    def extract_with_ocr(
        self,
        pdf_path: Union[str, Path],
        pages: Optional[List[int]] = None
    ) -> List[OCRResult]:
        """
        Extract text from a scanned PDF using Tesseract OCR.

        Converts each page to an image and runs OCR to extract text
        with bounding boxes and confidence scores.

        Args:
            pdf_path: Path to the PDF file
            pages: Optional list of page numbers to process (0-indexed).
                   If None, processes all pages.

        Returns:
            List of OCR results, each containing:
                - text: The extracted text content
                - page: Page number (0-indexed)
                - bbox: Bounding box with x0, y0, x1, y1 coordinates
                - confidence: OCR confidence score (0-100)

        Raises:
            FileNotFoundError: If the PDF file doesn't exist
            ValueError: If the file is not a valid PDF
        """
        path = Path(pdf_path) if isinstance(pdf_path, str) else pdf_path

        if not path.exists():
            raise FileNotFoundError(f"PDF file not found: {path}")

        try:
            doc = fitz.open(str(path))
        except Exception as e:
            raise ValueError(f"Invalid PDF file: {path}. Error: {e}")

        try:
            total_pages = len(doc)
            pages_to_process = pages if pages is not None else list(range(total_pages))

            all_results: List[OCRResult] = []

            for page_num in pages_to_process:
                if page_num < 0 or page_num >= total_pages:
                    continue

                # Convert page to image
                image = self.convert_page_to_image(path, page_num)

                # Run Tesseract OCR with detailed output
                ocr_data = pytesseract.image_to_data(
                    image,
                    lang=self.language,
                    output_type=pytesseract.Output.DICT
                )

                # Process OCR results
                num_boxes = len(ocr_data["text"])

                for i in range(num_boxes):
                    text = ocr_data["text"][i].strip()
                    confidence = ocr_data["conf"][i]

                    # Skip empty text or low confidence (-1 means no text)
                    if not text or confidence == -1:
                        continue

                    # Get bounding box coordinates
                    x = ocr_data["left"][i]
                    y = ocr_data["top"][i]
                    w = ocr_data["width"][i]
                    h = ocr_data["height"][i]

                    all_results.append({
                        "text": text,
                        "page": page_num,
                        "bbox": {
                            "x0": float(x),
                            "y0": float(y),
                            "x1": float(x + w),
                            "y1": float(y + h),
                        },
                        "confidence": float(confidence)
                    })

            return all_results

        finally:
            doc.close()


__all__ = ["OCRService", "OCRResult", "DEFAULT_DPI", "DEFAULT_LANGUAGE"]
