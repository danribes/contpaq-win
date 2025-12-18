"""
T014.1 - Tests for POST /extract endpoint

Tests for the invoice extraction API endpoint that:
- Accepts PDF file uploads
- Validates file type
- Orchestrates extraction pipeline
- Returns structured extraction results
"""

import io
import time
from decimal import Decimal
from pathlib import Path
from unittest.mock import Mock, patch, MagicMock

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from src.api.routes import router
from src.models.extraction import (
    BoundingBox,
    ExtractionField,
    InvoiceExtraction,
    LineItemExtraction,
)


@pytest.fixture
def app():
    """Create FastAPI app with routes."""
    app = FastAPI()
    app.include_router(router)
    return app


@pytest.fixture
def client(app):
    """Create test client."""
    return TestClient(app)


@pytest.fixture
def sample_pdf_bytes():
    """Create a minimal valid PDF for testing."""
    # Minimal PDF structure
    pdf_content = b"""%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R >>
endobj
4 0 obj
<< /Length 44 >>
stream
BT
/F1 12 Tf
100 700 Td
(Test Invoice) Tj
ET
endstream
endobj
xref
0 5
0000000000 65535 f
0000000009 00000 n
0000000058 00000 n
0000000115 00000 n
0000000206 00000 n
trailer
<< /Size 5 /Root 1 0 R >>
startxref
300
%%EOF"""
    return pdf_content


@pytest.fixture
def mock_extraction_result():
    """Mock InvoiceExtraction result."""
    return InvoiceExtraction(
        source_file="test.pdf",
        source_type="text",
        vendor_rfc=ExtractionField(
            field_name="vendor_rfc",
            value="ABC123456789",
            confidence=0.95,
        ),
        vendor_name=ExtractionField(
            field_name="vendor_name",
            value="EMPRESA TEST SA DE CV",
            confidence=0.88,
        ),
        invoice_number=ExtractionField(
            field_name="invoice_number",
            value="FAC-2024-001",
            confidence=0.92,
        ),
        total=ExtractionField(
            field_name="total",
            value="1160.00",
            confidence=0.90,
        ),
        line_items=[
            LineItemExtraction(
                line_number=1,
                description="Widget A",
                quantity=Decimal("10"),
                unit_price=Decimal("100.00"),
                amount=Decimal("1000.00"),
                confidence=0.85,
            ),
        ],
        overall_confidence=0.90,
        processing_time_ms=150,
    )


class TestExtractEndpointExists:
    """Tests that the endpoint exists and responds."""

    def test_extract_endpoint_exists(self, client, sample_pdf_bytes):
        """POST /extract endpoint should exist."""
        files = {"file": ("test.pdf", io.BytesIO(sample_pdf_bytes), "application/pdf")}

        with patch("src.api.routes.ExtractionService") as mock_service:
            mock_service.return_value.extract.return_value = InvoiceExtraction(
                source_file="test.pdf",
                source_type="text",
            )
            response = client.post("/extract", files=files)

        # Should not return 404
        assert response.status_code != 404

    def test_extract_requires_file(self, client):
        """Should return 422 if no file provided."""
        response = client.post("/extract")

        assert response.status_code == 422


class TestFileValidation:
    """Tests for file upload validation (T014.1.3, T014.1.4)."""

    def test_accepts_pdf_file(self, client, sample_pdf_bytes):
        """Should accept PDF files."""
        files = {"file": ("invoice.pdf", io.BytesIO(sample_pdf_bytes), "application/pdf")}

        with patch("src.api.routes.ExtractionService") as mock_service:
            mock_service.return_value.extract.return_value = InvoiceExtraction(
                source_file="invoice.pdf",
                source_type="text",
            )
            response = client.post("/extract", files=files)

        assert response.status_code in [200, 201]

    def test_rejects_non_pdf_file(self, client):
        """Should reject non-PDF files with appropriate error."""
        files = {"file": ("document.txt", io.BytesIO(b"Hello World"), "text/plain")}

        response = client.post("/extract", files=files)

        assert response.status_code == 400
        data = response.json()
        assert "detail" in data
        # Error message should mention PDF requirement

    def test_rejects_empty_file(self, client):
        """Should reject empty files."""
        files = {"file": ("empty.pdf", io.BytesIO(b""), "application/pdf")}

        response = client.post("/extract", files=files)

        assert response.status_code == 400

    def test_validates_pdf_magic_bytes(self, client):
        """Should validate PDF by magic bytes, not just extension."""
        # File with .pdf extension but not PDF content
        fake_pdf = b"This is not a PDF file"
        files = {"file": ("fake.pdf", io.BytesIO(fake_pdf), "application/pdf")}

        response = client.post("/extract", files=files)

        assert response.status_code == 400


class TestExtractionPipeline:
    """Tests for extraction pipeline orchestration (T014.1.5)."""

    def test_returns_extraction_response(self, client, sample_pdf_bytes, mock_extraction_result):
        """Should return structured extraction response."""
        files = {"file": ("test.pdf", io.BytesIO(sample_pdf_bytes), "application/pdf")}

        with patch("src.api.routes.ExtractionService") as mock_service:
            mock_service.return_value.extract.return_value = mock_extraction_result
            response = client.post("/extract", files=files)

        assert response.status_code == 200
        data = response.json()

        assert "source_file" in data
        assert "source_type" in data
        assert data["source_type"] in ["text", "scanned"]

    def test_includes_vendor_rfc(self, client, sample_pdf_bytes, mock_extraction_result):
        """Should include vendor_rfc in response."""
        files = {"file": ("test.pdf", io.BytesIO(sample_pdf_bytes), "application/pdf")}

        with patch("src.api.routes.ExtractionService") as mock_service:
            mock_service.return_value.extract.return_value = mock_extraction_result
            response = client.post("/extract", files=files)

        data = response.json()
        assert "vendor_rfc" in data
        if data["vendor_rfc"]:
            assert "value" in data["vendor_rfc"]
            assert "confidence" in data["vendor_rfc"]

    def test_includes_line_items(self, client, sample_pdf_bytes, mock_extraction_result):
        """Should include line_items in response."""
        files = {"file": ("test.pdf", io.BytesIO(sample_pdf_bytes), "application/pdf")}

        with patch("src.api.routes.ExtractionService") as mock_service:
            mock_service.return_value.extract.return_value = mock_extraction_result
            response = client.post("/extract", files=files)

        data = response.json()
        assert "line_items" in data
        assert isinstance(data["line_items"], list)

    def test_includes_overall_confidence(self, client, sample_pdf_bytes, mock_extraction_result):
        """Should include overall_confidence in response."""
        files = {"file": ("test.pdf", io.BytesIO(sample_pdf_bytes), "application/pdf")}

        with patch("src.api.routes.ExtractionService") as mock_service:
            mock_service.return_value.extract.return_value = mock_extraction_result
            response = client.post("/extract", files=files)

        data = response.json()
        assert "overall_confidence" in data
        assert 0.0 <= data["overall_confidence"] <= 1.0


class TestProcessingTime:
    """Tests for processing time tracking (T014.1.6)."""

    def test_includes_processing_time_ms(self, client, sample_pdf_bytes, mock_extraction_result):
        """Should include processing_time_ms in response."""
        files = {"file": ("test.pdf", io.BytesIO(sample_pdf_bytes), "application/pdf")}

        with patch("src.api.routes.ExtractionService") as mock_service:
            mock_service.return_value.extract.return_value = mock_extraction_result
            response = client.post("/extract", files=files)

        data = response.json()
        assert "processing_time_ms" in data
        assert isinstance(data["processing_time_ms"], int)
        assert data["processing_time_ms"] >= 0


class TestErrorHandling:
    """Tests for error handling with Spanish messages (T014.1.7)."""

    def test_invalid_pdf_error_in_spanish(self, client):
        """Should return error message in Spanish for invalid PDF."""
        fake_pdf = b"Not a PDF"
        files = {"file": ("fake.pdf", io.BytesIO(fake_pdf), "application/pdf")}

        response = client.post("/extract", files=files)

        assert response.status_code == 400
        data = response.json()
        # Check for Spanish error message
        detail = data.get("detail", "")
        # Should contain Spanish keywords
        assert any(word in detail.lower() for word in ["archivo", "inválido", "pdf", "válido"])

    def test_extraction_failure_error(self, client, sample_pdf_bytes):
        """Should handle extraction service failures gracefully."""
        files = {"file": ("test.pdf", io.BytesIO(sample_pdf_bytes), "application/pdf")}

        with patch("src.api.routes.ExtractionService") as mock_service:
            mock_service.return_value.extract.side_effect = Exception("Model error")
            response = client.post("/extract", files=files)

        assert response.status_code == 500
        data = response.json()
        assert "detail" in data

    def test_file_too_large_error(self, client):
        """Should reject files that are too large."""
        # Create a large fake PDF (> 50MB)
        large_content = b"%PDF-1.4\n" + (b"x" * (51 * 1024 * 1024))
        files = {"file": ("large.pdf", io.BytesIO(large_content), "application/pdf")}

        response = client.post("/extract", files=files)

        # Should reject or handle appropriately
        assert response.status_code in [400, 413, 422]


class TestExtractionServiceIntegration:
    """Integration tests for ExtractionService usage."""

    def test_calls_extraction_service(self, client, sample_pdf_bytes):
        """Should call ExtractionService with file content."""
        files = {"file": ("test.pdf", io.BytesIO(sample_pdf_bytes), "application/pdf")}

        with patch("src.api.routes.ExtractionService") as mock_service_class:
            mock_instance = Mock()
            mock_instance.extract.return_value = InvoiceExtraction(
                source_file="test.pdf",
                source_type="text",
            )
            mock_service_class.return_value = mock_instance

            response = client.post("/extract", files=files)

        # Verify extract was called
        mock_instance.extract.assert_called_once()

    def test_passes_filename_to_service(self, client, sample_pdf_bytes, mock_extraction_result):
        """Should pass original filename to extraction service."""
        files = {"file": ("my_invoice.pdf", io.BytesIO(sample_pdf_bytes), "application/pdf")}

        with patch("src.api.routes.ExtractionService") as mock_service_class:
            mock_instance = Mock()
            mock_instance.extract.return_value = mock_extraction_result
            mock_service_class.return_value = mock_instance

            response = client.post("/extract", files=files)

        # Filename should be passed to the service
        call_args = mock_instance.extract.call_args
        # The filename should be somewhere in the call
        assert "my_invoice.pdf" in str(call_args) or response.json().get("source_file") == "my_invoice.pdf"


class TestResponseFormat:
    """Tests for response format consistency."""

    def test_response_matches_invoice_extraction_schema(self, client, sample_pdf_bytes, mock_extraction_result):
        """Response should match InvoiceExtraction model schema."""
        files = {"file": ("test.pdf", io.BytesIO(sample_pdf_bytes), "application/pdf")}

        with patch("src.api.routes.ExtractionService") as mock_service:
            mock_service.return_value.extract.return_value = mock_extraction_result
            response = client.post("/extract", files=files)

        data = response.json()

        # Required fields
        assert "source_file" in data
        assert "source_type" in data

        # Optional header fields
        optional_fields = [
            "vendor_rfc", "vendor_name", "invoice_number",
            "invoice_date", "subtotal", "iva_amount", "total"
        ]
        for field in optional_fields:
            assert field in data

        # Lists
        assert "line_items" in data
        assert "fields" in data

        # Metadata
        assert "overall_confidence" in data
        assert "processing_time_ms" in data

    def test_line_item_format(self, client, sample_pdf_bytes, mock_extraction_result):
        """Line items should have correct format."""
        files = {"file": ("test.pdf", io.BytesIO(sample_pdf_bytes), "application/pdf")}

        with patch("src.api.routes.ExtractionService") as mock_service:
            mock_service.return_value.extract.return_value = mock_extraction_result
            response = client.post("/extract", files=files)

        data = response.json()
        line_items = data.get("line_items", [])

        if line_items:
            item = line_items[0]
            assert "line_number" in item
            assert "description" in item
            assert "quantity" in item
            assert "unit_price" in item
            assert "amount" in item
            assert "confidence" in item
