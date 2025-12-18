"""
Extraction Service - T014.1

Orchestrates the complete invoice extraction pipeline:
1. Detect PDF type (text-based or scanned)
2. Extract text (PyMuPDF for text-based, OCR for scanned)
3. Run AI field extraction
4. Return structured InvoiceExtraction result

This service coordinates all the extraction components into a single,
easy-to-use interface for the API endpoint.
"""

import io
import logging
import time
from pathlib import Path
from typing import Any, Dict, List, Optional, Union

from ..models.extraction import InvoiceExtraction, LineItemExtraction
from .pdf_extractor import PDFExtractor, SourceType
from .ocr_service import OCRService
from .image_preprocessor import ImagePreprocessor
from .ai_extractor import AIExtractor
from .line_item_extractor import LineItemExtractor

logger = logging.getLogger(__name__)

# Maximum file size (50MB)
MAX_FILE_SIZE = 50 * 1024 * 1024


class ExtractionError(Exception):
    """Base exception for extraction errors."""
    pass


class InvalidPDFError(ExtractionError):
    """Raised when the file is not a valid PDF."""
    pass


class FileTooLargeError(ExtractionError):
    """Raised when the file exceeds the maximum size."""
    pass


class ExtractionService:
    """
    Orchestrates the complete invoice extraction pipeline.

    Coordinates PDF extraction, OCR, and AI field extraction
    to produce structured invoice data.
    """

    def __init__(self):
        """Initialize the extraction service with all required components."""
        self.pdf_extractor = PDFExtractor()
        self.ocr_service = OCRService()
        self.image_preprocessor = ImagePreprocessor()
        self.ai_extractor = AIExtractor()
        self.line_item_extractor = LineItemExtractor()

    def validate_pdf(self, content: bytes, filename: str) -> None:
        """
        Validate that the content is a valid PDF.

        Args:
            content: File content bytes
            filename: Original filename

        Raises:
            InvalidPDFError: If the file is not a valid PDF
            FileTooLargeError: If the file exceeds maximum size
        """
        # Check file size
        if len(content) > MAX_FILE_SIZE:
            raise FileTooLargeError(
                f"El archivo excede el tamaño máximo de {MAX_FILE_SIZE // (1024 * 1024)}MB"
            )

        # Check for empty file
        if len(content) == 0:
            raise InvalidPDFError("El archivo está vacío")

        # Check PDF magic bytes
        if not content.startswith(b"%PDF"):
            raise InvalidPDFError(
                "El archivo no es un PDF válido. "
                "Por favor, suba un archivo PDF."
            )

        # Try to open with PyMuPDF to validate structure
        try:
            import fitz
            doc = fitz.open(stream=content, filetype="pdf")
            if doc.page_count == 0:
                doc.close()
                raise InvalidPDFError("El PDF no contiene páginas")
            doc.close()
        except Exception as e:
            if isinstance(e, InvalidPDFError):
                raise
            raise InvalidPDFError(
                f"El archivo PDF es inválido o está corrupto: {str(e)}"
            )

    def extract(
        self,
        content: bytes,
        filename: str = "document.pdf",
    ) -> InvoiceExtraction:
        """
        Extract invoice data from PDF content.

        Main entry point for the extraction pipeline. Handles the complete
        flow from PDF to structured invoice data.

        Args:
            content: PDF file content as bytes
            filename: Original filename for tracking

        Returns:
            InvoiceExtraction with all extracted fields

        Raises:
            InvalidPDFError: If the file is not a valid PDF
            FileTooLargeError: If the file exceeds maximum size
            ExtractionError: For other extraction failures
        """
        start_time = time.time()

        # Validate PDF
        self.validate_pdf(content, filename)

        try:
            # Step 1: Detect PDF type
            source_type = self.pdf_extractor.detect_pdf_type(content)
            logger.info(f"Detected PDF type: {source_type.value}")

            # Step 2: Extract text with positions
            if source_type == SourceType.TEXT:
                text_blocks = self._extract_text_based(content)
            else:
                text_blocks = self._extract_scanned(content)

            # Step 3: Extract line items from tables
            line_items = self.line_item_extractor.extract_from_document(text_blocks)

            # Step 4: Run AI field extraction (if model is available)
            extraction = self._run_ai_extraction(text_blocks, filename, source_type)

            # Add line items to extraction
            extraction.line_items = line_items

            # Calculate processing time
            processing_time_ms = int((time.time() - start_time) * 1000)
            extraction.processing_time_ms = processing_time_ms

            # Recalculate overall confidence with line items
            extraction.overall_confidence = extraction.calculate_overall_confidence()

            logger.info(
                f"Extraction complete for {filename}: "
                f"{len(line_items)} line items, "
                f"confidence={extraction.overall_confidence:.2f}, "
                f"time={processing_time_ms}ms"
            )

            return extraction

        except (InvalidPDFError, FileTooLargeError):
            raise
        except Exception as e:
            logger.error(f"Extraction failed for {filename}: {e}")
            raise ExtractionError(
                f"Error durante la extracción: {str(e)}"
            ) from e

    def _extract_text_based(self, content: bytes) -> List[Dict[str, Any]]:
        """
        Extract text from a text-based PDF.

        Args:
            content: PDF content bytes

        Returns:
            List of text blocks with bounding boxes
        """
        text_data = self.pdf_extractor.extract_text(content)

        # Convert to common format
        text_blocks = []
        for item in text_data:
            block = {
                "text": item.get("text", ""),
                "bbox": {
                    "x0": item.get("x0", 0),
                    "y0": item.get("y0", 0),
                    "x1": item.get("x1", 0),
                    "y1": item.get("y1", 0),
                },
                "page": item.get("page", 0),
            }
            text_blocks.append(block)

        return text_blocks

    def _extract_scanned(self, content: bytes) -> List[Dict[str, Any]]:
        """
        Extract text from a scanned PDF using OCR.

        Args:
            content: PDF content bytes

        Returns:
            List of text blocks with bounding boxes
        """
        import tempfile
        import os

        # Write to temp file for OCR processing
        with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as f:
            f.write(content)
            temp_path = f.name

        try:
            ocr_results = self.ocr_service.extract_with_ocr(temp_path)

            # Convert to common format
            text_blocks = []
            for result in ocr_results:
                block = {
                    "text": result.text,
                    "bbox": {
                        "x0": result.bbox.x0,
                        "y0": result.bbox.y0,
                        "x1": result.bbox.x1,
                        "y1": result.bbox.y1,
                    },
                    "page": result.page,
                    "confidence": result.confidence,
                }
                text_blocks.append(block)

            return text_blocks
        finally:
            os.unlink(temp_path)

    def _run_ai_extraction(
        self,
        text_blocks: List[Dict[str, Any]],
        filename: str,
        source_type: SourceType,
    ) -> InvoiceExtraction:
        """
        Run AI field extraction on text blocks.

        Args:
            text_blocks: Extracted text blocks
            filename: Original filename
            source_type: PDF type (text or scanned)

        Returns:
            InvoiceExtraction with AI-extracted fields
        """
        # Check if AI model is loaded
        if not self.ai_extractor.is_model_loaded:
            # Try to load the model
            try:
                self.ai_extractor.load_model()
            except Exception as e:
                logger.warning(f"AI model not available: {e}")
                # Return basic extraction without AI
                return InvoiceExtraction(
                    source_file=filename,
                    source_type=source_type.value,
                )

        # Prepare document data for AI extraction
        document_data = {
            "text_blocks": text_blocks,
            "image_width": 612,  # Default US Letter width
            "image_height": 792,  # Default US Letter height
            "source_file": filename,
            "source_type": source_type.value,
        }

        try:
            return self.ai_extractor.extract_fields(document_data)
        except Exception as e:
            logger.warning(f"AI extraction failed, using fallback: {e}")
            return InvoiceExtraction(
                source_file=filename,
                source_type=source_type.value,
            )


__all__ = [
    "ExtractionService",
    "ExtractionError",
    "InvalidPDFError",
    "FileTooLargeError",
    "MAX_FILE_SIZE",
]
