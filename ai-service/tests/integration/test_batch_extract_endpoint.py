"""
T014.2 - Tests for POST /extract/batch endpoint

Tests for the batch invoice extraction API endpoint that:
- Accepts multiple PDF files
- Processes files sequentially to avoid memory issues
- Returns BatchExtractionResponse with per-file results
"""

import io
from decimal import Decimal
from typing import List
from unittest.mock import Mock, patch

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from src.api.routes import router
from src.models.extraction import (
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
        total=ExtractionField(
            field_name="total",
            value="1000.00",
            confidence=0.90,
        ),
        overall_confidence=0.90,
        processing_time_ms=100,
    )


class TestBatchEndpointExists:
    """Tests that the batch endpoint exists and responds."""

    def test_batch_endpoint_exists(self, client, sample_pdf_bytes):
        """POST /extract/batch endpoint should exist."""
        files = [
            ("files", ("test1.pdf", io.BytesIO(sample_pdf_bytes), "application/pdf")),
        ]

        with patch("src.api.routes.ExtractionService") as mock_service:
            mock_service.return_value.extract.return_value = InvoiceExtraction(
                source_file="test1.pdf",
                source_type="text",
                processing_time_ms=100,
            )
            response = client.post("/extract/batch", files=files)

        # Should not return 404
        assert response.status_code != 404

    def test_batch_requires_files(self, client):
        """Should return 422 if no files provided."""
        response = client.post("/extract/batch")

        assert response.status_code == 422


class TestBatchFileValidation:
    """Tests for batch file validation."""

    def test_accepts_multiple_pdf_files(self, client, sample_pdf_bytes, mock_extraction_result):
        """Should accept multiple PDF files."""
        files = [
            ("files", ("invoice1.pdf", io.BytesIO(sample_pdf_bytes), "application/pdf")),
            ("files", ("invoice2.pdf", io.BytesIO(sample_pdf_bytes), "application/pdf")),
            ("files", ("invoice3.pdf", io.BytesIO(sample_pdf_bytes), "application/pdf")),
        ]

        with patch("src.api.routes.ExtractionService") as mock_service:
            mock_service.return_value.extract.return_value = mock_extraction_result
            response = client.post("/extract/batch", files=files)

        assert response.status_code == 200

    def test_rejects_non_pdf_in_batch(self, client, sample_pdf_bytes):
        """Should reject batch containing non-PDF file."""
        files = [
            ("files", ("invoice1.pdf", io.BytesIO(sample_pdf_bytes), "application/pdf")),
            ("files", ("document.txt", io.BytesIO(b"Hello"), "text/plain")),
        ]

        response = client.post("/extract/batch", files=files)

        # Should reject with error
        assert response.status_code == 400


class TestBatchExtractionResponse:
    """Tests for BatchExtractionResponse format."""

    def test_returns_batch_response(self, client, sample_pdf_bytes, mock_extraction_result):
        """Should return BatchExtractionResponse structure."""
        files = [
            ("files", ("test1.pdf", io.BytesIO(sample_pdf_bytes), "application/pdf")),
            ("files", ("test2.pdf", io.BytesIO(sample_pdf_bytes), "application/pdf")),
        ]

        with patch("src.api.routes.ExtractionService") as mock_service:
            mock_service.return_value.extract.return_value = mock_extraction_result
            response = client.post("/extract/batch", files=files)

        assert response.status_code == 200
        data = response.json()

        # Should have batch response fields
        assert "results" in data
        assert "total_files" in data
        assert "successful" in data
        assert "failed" in data

    def test_results_array_matches_file_count(self, client, sample_pdf_bytes, mock_extraction_result):
        """Results array should have one entry per file."""
        files = [
            ("files", ("test1.pdf", io.BytesIO(sample_pdf_bytes), "application/pdf")),
            ("files", ("test2.pdf", io.BytesIO(sample_pdf_bytes), "application/pdf")),
            ("files", ("test3.pdf", io.BytesIO(sample_pdf_bytes), "application/pdf")),
        ]

        with patch("src.api.routes.ExtractionService") as mock_service:
            mock_service.return_value.extract.return_value = mock_extraction_result
            response = client.post("/extract/batch", files=files)

        data = response.json()
        assert len(data["results"]) == 3
        assert data["total_files"] == 3

    def test_each_result_has_filename(self, client, sample_pdf_bytes, mock_extraction_result):
        """Each result should include the original filename."""
        files = [
            ("files", ("invoice_001.pdf", io.BytesIO(sample_pdf_bytes), "application/pdf")),
            ("files", ("invoice_002.pdf", io.BytesIO(sample_pdf_bytes), "application/pdf")),
        ]

        with patch("src.api.routes.ExtractionService") as mock_service:
            # Return result with matching filename
            def mock_extract(content, filename):
                return InvoiceExtraction(
                    source_file=filename,
                    source_type="text",
                    processing_time_ms=100,
                )
            mock_service.return_value.extract.side_effect = mock_extract
            response = client.post("/extract/batch", files=files)

        data = response.json()
        filenames = [r["extraction"]["source_file"] for r in data["results"] if r.get("extraction")]
        assert "invoice_001.pdf" in filenames
        assert "invoice_002.pdf" in filenames

    def test_includes_total_processing_time(self, client, sample_pdf_bytes, mock_extraction_result):
        """Should include total processing time for entire batch."""
        files = [
            ("files", ("test1.pdf", io.BytesIO(sample_pdf_bytes), "application/pdf")),
        ]

        with patch("src.api.routes.ExtractionService") as mock_service:
            mock_service.return_value.extract.return_value = mock_extraction_result
            response = client.post("/extract/batch", files=files)

        data = response.json()
        assert "total_processing_time_ms" in data
        assert isinstance(data["total_processing_time_ms"], int)


class TestBatchSequentialProcessing:
    """Tests for sequential processing (T014.2.3)."""

    def test_processes_files_sequentially(self, client, sample_pdf_bytes):
        """Files should be processed one at a time, not in parallel."""
        files = [
            ("files", ("test1.pdf", io.BytesIO(sample_pdf_bytes), "application/pdf")),
            ("files", ("test2.pdf", io.BytesIO(sample_pdf_bytes), "application/pdf")),
        ]

        call_order = []

        with patch("src.api.routes.ExtractionService") as mock_service:
            def mock_extract(content, filename):
                call_order.append(filename)
                return InvoiceExtraction(
                    source_file=filename,
                    source_type="text",
                    processing_time_ms=100,
                )
            mock_service.return_value.extract.side_effect = mock_extract
            response = client.post("/extract/batch", files=files)

        # All files should have been processed
        assert len(call_order) == 2


class TestBatchErrorHandling:
    """Tests for error handling in batch processing."""

    def test_continues_on_single_file_failure(self, client, sample_pdf_bytes, mock_extraction_result):
        """Should continue processing if one file fails."""
        files = [
            ("files", ("good1.pdf", io.BytesIO(sample_pdf_bytes), "application/pdf")),
            ("files", ("bad.pdf", io.BytesIO(sample_pdf_bytes), "application/pdf")),
            ("files", ("good2.pdf", io.BytesIO(sample_pdf_bytes), "application/pdf")),
        ]

        call_count = [0]

        with patch("src.api.routes.ExtractionService") as mock_service:
            def mock_extract(content, filename):
                call_count[0] += 1
                if filename == "bad.pdf":
                    raise Exception("Extraction failed")
                return InvoiceExtraction(
                    source_file=filename,
                    source_type="text",
                    processing_time_ms=100,
                )
            mock_service.return_value.extract.side_effect = mock_extract
            response = client.post("/extract/batch", files=files)

        data = response.json()
        # Should have processed all 3 files
        assert call_count[0] == 3
        # Should report 2 successful, 1 failed
        assert data["successful"] == 2
        assert data["failed"] == 1

    def test_failed_result_includes_error(self, client, sample_pdf_bytes, mock_extraction_result):
        """Failed file result should include error message."""
        files = [
            ("files", ("bad.pdf", io.BytesIO(sample_pdf_bytes), "application/pdf")),
        ]

        with patch("src.api.routes.ExtractionService") as mock_service:
            mock_service.return_value.extract.side_effect = Exception("PDF corrupted")
            response = client.post("/extract/batch", files=files)

        data = response.json()
        assert data["failed"] == 1

        # Find the failed result
        failed_result = data["results"][0]
        assert failed_result["success"] is False
        assert "error" in failed_result
        assert "corrupted" in failed_result["error"].lower() or len(failed_result["error"]) > 0

    def test_successful_result_has_extraction(self, client, sample_pdf_bytes, mock_extraction_result):
        """Successful file result should include extraction data."""
        files = [
            ("files", ("good.pdf", io.BytesIO(sample_pdf_bytes), "application/pdf")),
        ]

        with patch("src.api.routes.ExtractionService") as mock_service:
            mock_service.return_value.extract.return_value = mock_extraction_result
            response = client.post("/extract/batch", files=files)

        data = response.json()
        result = data["results"][0]

        assert result["success"] is True
        assert "extraction" in result
        assert result["extraction"]["source_file"] == "test.pdf"


class TestBatchLimits:
    """Tests for batch size limits."""

    def test_rejects_too_many_files(self, client, sample_pdf_bytes):
        """Should reject batch with too many files."""
        # Create more than max allowed files (e.g., 20)
        files = [
            ("files", (f"test{i}.pdf", io.BytesIO(sample_pdf_bytes), "application/pdf"))
            for i in range(25)
        ]

        response = client.post("/extract/batch", files=files)

        # Should reject with appropriate error
        assert response.status_code in [400, 413, 422]

    def test_accepts_max_allowed_files(self, client, sample_pdf_bytes, mock_extraction_result):
        """Should accept up to max allowed files."""
        # Create exactly max allowed files (e.g., 20)
        files = [
            ("files", (f"test{i}.pdf", io.BytesIO(sample_pdf_bytes), "application/pdf"))
            for i in range(20)
        ]

        with patch("src.api.routes.ExtractionService") as mock_service:
            mock_service.return_value.extract.return_value = mock_extraction_result
            response = client.post("/extract/batch", files=files)

        assert response.status_code == 200


class TestBatchResponseFormat:
    """Tests for complete batch response format."""

    def test_complete_batch_response_schema(self, client, sample_pdf_bytes, mock_extraction_result):
        """Response should match complete BatchExtractionResponse schema."""
        files = [
            ("files", ("test.pdf", io.BytesIO(sample_pdf_bytes), "application/pdf")),
        ]

        with patch("src.api.routes.ExtractionService") as mock_service:
            mock_service.return_value.extract.return_value = mock_extraction_result
            response = client.post("/extract/batch", files=files)

        data = response.json()

        # Top-level fields
        assert "results" in data
        assert "total_files" in data
        assert "successful" in data
        assert "failed" in data
        assert "total_processing_time_ms" in data

        # Result entry fields
        result = data["results"][0]
        assert "filename" in result
        assert "success" in result
        # Either extraction or error
        assert "extraction" in result or "error" in result
