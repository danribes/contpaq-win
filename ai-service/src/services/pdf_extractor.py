"""
PDF Extractor Service - T011.1

Provides PDF processing capabilities including:
- PDF type detection (text-based vs scanned)
- Text extraction with position information
- Multi-page PDF handling

Uses PyMuPDF (fitz) for PDF processing.
"""

from enum import Enum
from pathlib import Path
from typing import Union

import fitz  # PyMuPDF


class SourceType(Enum):
    """
    Enum indicating the source type of a PDF document.

    Attributes:
        TEXT: PDF contains extractable text (text-based PDF)
        SCANNED: PDF is image-based with minimal text (requires OCR)
    """
    TEXT = "text"
    SCANNED = "scanned"


# Threshold for classifying PDFs
# PDFs with less than this many characters are considered scanned
TEXT_THRESHOLD = 100


class PDFExtractor:
    """
    Service for extracting text and information from PDF documents.

    This service handles both text-based and scanned PDFs, automatically
    detecting the type and using appropriate extraction methods.

    Example:
        extractor = PDFExtractor()
        pdf_type = extractor.detect_pdf_type("/path/to/invoice.pdf")

        if pdf_type == SourceType.TEXT:
            text_data = extractor.extract_text("/path/to/invoice.pdf")
        else:
            # Use OCR service instead
            pass
    """

    def detect_pdf_type(self, pdf_path: Union[str, Path]) -> SourceType:
        """
        Detect whether a PDF is text-based or scanned (image-based).

        The detection is based on the amount of extractable text from the
        first page of the PDF. If the text content is less than 100 characters,
        the PDF is classified as scanned.

        Args:
            pdf_path: Path to the PDF file (string or Path object)

        Returns:
            SourceType.TEXT if the PDF has extractable text
            SourceType.SCANNED if the PDF appears to be image-based

        Raises:
            FileNotFoundError: If the PDF file does not exist
            ValueError: If the file is not a valid PDF
        """
        # Convert to Path object if string
        path = Path(pdf_path) if isinstance(pdf_path, str) else pdf_path

        # Check if file exists
        if not path.exists():
            raise FileNotFoundError(f"PDF file not found: {path}")

        try:
            # Open PDF with PyMuPDF
            doc = fitz.open(str(path))
        except Exception as e:
            raise ValueError(f"Invalid PDF file: {path}. Error: {e}")

        try:
            # Extract text from the first page
            if len(doc) == 0:
                # Empty PDF - treat as scanned
                return SourceType.SCANNED

            first_page = doc[0]
            text = first_page.get_text()

            # Count non-whitespace characters
            text_length = len(text.strip())

            # Classify based on threshold
            if text_length < TEXT_THRESHOLD:
                return SourceType.SCANNED
            else:
                return SourceType.TEXT

        finally:
            # Always close the document
            doc.close()


__all__ = ["PDFExtractor", "SourceType", "TEXT_THRESHOLD"]
