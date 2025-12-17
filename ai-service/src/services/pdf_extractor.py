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
from typing import Dict, List, Union

import fitz  # PyMuPDF


# Type alias for text block with position information
TextBlock = Dict[str, Union[str, int, Dict[str, float]]]


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

    def extract_text(self, pdf_path: Union[str, Path]) -> List[TextBlock]:
        """
        Extract text from a PDF with bounding box coordinates.

        Extracts all text blocks from all pages of the PDF, along with
        their position information (bounding boxes) and page numbers.

        Args:
            pdf_path: Path to the PDF file (string or Path object)

        Returns:
            List of text blocks, each containing:
                - text: The extracted text content
                - page: Page number (0-indexed)
                - bbox: Bounding box with x0, y0, x1, y1 coordinates

        Raises:
            FileNotFoundError: If the PDF file does not exist
            ValueError: If the file is not a valid PDF
            PermissionError: If the PDF is password-protected

        Example:
            >>> extractor = PDFExtractor()
            >>> blocks = extractor.extract_text("invoice.pdf")
            >>> for block in blocks:
            ...     print(f"Page {block['page']}: {block['text'][:50]}...")
            ...     print(f"  Position: {block['bbox']}")
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
            # Check if PDF is encrypted/password-protected
            if doc.is_encrypted:
                raise PermissionError(
                    f"PDF is password-protected: {path}. "
                    "Please provide an unencrypted PDF."
                )

            text_blocks: List[TextBlock] = []

            # Process each page
            for page_num in range(len(doc)):
                page = doc[page_num]

                # Extract text blocks with positions using "dict" mode
                # This gives us detailed information about text blocks
                blocks = page.get_text("dict")["blocks"]

                for block in blocks:
                    # Only process text blocks (type 0), skip images (type 1)
                    if block.get("type") != 0:
                        continue

                    # Extract text from all lines in the block
                    text_lines = []
                    for line in block.get("lines", []):
                        for span in line.get("spans", []):
                            text_content = span.get("text", "")
                            if text_content:
                                text_lines.append(text_content)

                    # Join all text from the block
                    block_text = " ".join(text_lines)

                    # Skip empty blocks
                    if not block_text.strip():
                        continue

                    # Get bounding box coordinates
                    bbox = block.get("bbox", (0, 0, 0, 0))

                    text_blocks.append({
                        "text": block_text.strip(),
                        "page": page_num,
                        "bbox": {
                            "x0": float(bbox[0]),
                            "y0": float(bbox[1]),
                            "x1": float(bbox[2]),
                            "y1": float(bbox[3]),
                        }
                    })

            return text_blocks

        finally:
            # Always close the document
            doc.close()


__all__ = ["PDFExtractor", "SourceType", "TEXT_THRESHOLD", "TextBlock"]
