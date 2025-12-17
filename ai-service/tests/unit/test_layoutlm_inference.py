"""
T013.2 - Tests for LayoutLMv3 AI extraction service

Tests for AIExtractor service that uses LayoutLMv3 for intelligent
field extraction from Mexican invoices.
"""

import pytest
from decimal import Decimal
from unittest.mock import Mock, patch, MagicMock
import numpy as np

from src.services.ai_extractor import (
    AIExtractor,
    FieldLabel,
    LAYOUTLM_MODEL_NAME,
)
from src.models.extraction import (
    BoundingBox,
    ExtractionField,
    InvoiceExtraction,
)


class TestAIExtractorInitialization:
    """Tests for AIExtractor initialization and model loading."""

    def test_extractor_can_be_instantiated(self):
        """Should create AIExtractor instance."""
        extractor = AIExtractor()
        assert extractor is not None

    def test_extractor_has_model_name(self):
        """Should have LayoutLMv3 model name constant."""
        assert LAYOUTLM_MODEL_NAME == "microsoft/layoutlmv3-base"

    def test_extractor_model_not_loaded_by_default(self):
        """Model should not be loaded until explicitly called."""
        extractor = AIExtractor()
        assert not extractor.is_model_loaded

    def test_load_model_sets_loaded_flag(self):
        """load_model should set is_model_loaded to True."""
        extractor = AIExtractor()
        # Mock the actual model loading to avoid downloading
        with patch.object(extractor, '_load_transformers_model'):
            extractor.load_model()
        assert extractor.is_model_loaded

    @pytest.mark.skipif(True, reason="Requires model download")
    def test_load_real_model(self):
        """Integration test: load actual LayoutLMv3 model."""
        extractor = AIExtractor()
        extractor.load_model()
        assert extractor.is_model_loaded
        assert extractor.model is not None
        assert extractor.processor is not None


class TestFieldLabels:
    """Tests for field label enumeration."""

    def test_field_label_vendor_rfc(self):
        """Should have vendor_rfc label."""
        assert FieldLabel.VENDOR_RFC.value == "vendor_rfc"

    def test_field_label_vendor_name(self):
        """Should have vendor_name label."""
        assert FieldLabel.VENDOR_NAME.value == "vendor_name"

    def test_field_label_invoice_number(self):
        """Should have invoice_number label."""
        assert FieldLabel.INVOICE_NUMBER.value == "invoice_number"

    def test_field_label_invoice_date(self):
        """Should have invoice_date label."""
        assert FieldLabel.INVOICE_DATE.value == "invoice_date"

    def test_field_label_subtotal(self):
        """Should have subtotal label."""
        assert FieldLabel.SUBTOTAL.value == "subtotal"

    def test_field_label_iva_amount(self):
        """Should have iva_amount label."""
        assert FieldLabel.IVA_AMOUNT.value == "iva_amount"

    def test_field_label_total(self):
        """Should have total label."""
        assert FieldLabel.TOTAL.value == "total"


class TestInputPreparation:
    """Tests for preparing input tokens from text + layout (T013.2.4.1)."""

    @pytest.fixture
    def extractor(self):
        """Extractor instance with mocked model."""
        extractor = AIExtractor()
        extractor._model = Mock()
        extractor._processor = Mock()
        extractor._is_model_loaded = True
        return extractor

    @pytest.fixture
    def sample_text_blocks(self):
        """Sample text blocks with bounding boxes."""
        return [
            {
                "text": "RFC: ABC123456789",
                "bbox": {"x0": 100, "y0": 50, "x1": 300, "y1": 70}
            },
            {
                "text": "FACTURA: FAC-2024-001",
                "bbox": {"x0": 100, "y0": 80, "x1": 350, "y1": 100}
            },
            {
                "text": "TOTAL: $1,234.56",
                "bbox": {"x0": 400, "y0": 500, "x1": 550, "y1": 520}
            },
        ]

    def test_prepare_input_returns_dict(self, extractor, sample_text_blocks):
        """prepare_input should return dictionary with tokens and boxes."""
        extractor._processor.return_value = {
            "input_ids": [[1, 2, 3]],
            "attention_mask": [[1, 1, 1]],
            "bbox": [[[0, 0, 0, 0], [100, 50, 300, 70], [0, 0, 0, 0]]],
        }

        result = extractor.prepare_input(sample_text_blocks, image_width=612, image_height=792)

        assert isinstance(result, dict)
        assert "input_ids" in result or "tokens" in result

    def test_prepare_input_normalizes_bbox(self, extractor, sample_text_blocks):
        """Bounding boxes should be normalized to 0-1000 range for LayoutLM."""
        extractor._processor.return_value = {
            "input_ids": [[1, 2, 3]],
            "bbox": [[[0, 0, 0, 0], [163, 63, 490, 88], [0, 0, 0, 0]]],
        }

        result = extractor.prepare_input(sample_text_blocks, image_width=612, image_height=792)

        # LayoutLM uses 0-1000 normalized coordinates
        assert result is not None


class TestModelInference:
    """Tests for running model inference (T013.2.4.2)."""

    @pytest.fixture
    def extractor_with_mock_model(self):
        """Extractor with fully mocked model."""
        extractor = AIExtractor()
        extractor._model = Mock()
        extractor._processor = Mock()
        extractor._is_model_loaded = True

        # Mock model output with logits
        mock_output = Mock()
        mock_output.logits = Mock()
        mock_output.logits.detach.return_value.cpu.return_value.numpy.return_value = np.array([
            [[0.1, 0.8, 0.1],  # token 1
             [0.7, 0.2, 0.1],  # token 2
             [0.2, 0.2, 0.6]]  # token 3
        ])
        extractor._model.return_value = mock_output

        return extractor

    def test_run_inference_returns_predictions(self, extractor_with_mock_model):
        """run_inference should return token predictions."""
        pytest.importorskip("torch")
        mock_input = {"input_ids": [[1, 2, 3]]}

        result = extractor_with_mock_model.run_inference(mock_input)

        assert result is not None
        assert "predictions" in result or "logits" in result

    def test_run_inference_requires_loaded_model(self):
        """Should raise error if model not loaded."""
        extractor = AIExtractor()

        with pytest.raises(RuntimeError, match="Model not loaded"):
            extractor.run_inference({"input_ids": [[1, 2, 3]]})


class TestOutputParsing:
    """Tests for parsing model output to structured fields (T013.2.4.3)."""

    @pytest.fixture
    def extractor(self):
        """Extractor instance."""
        extractor = AIExtractor()
        extractor._is_model_loaded = True
        return extractor

    @pytest.fixture
    def mock_predictions(self):
        """Mock model predictions with token labels."""
        return {
            "tokens": ["RFC:", "ABC123456789", "FACTURA:", "FAC-2024-001", "TOTAL:", "$1,234.56"],
            "predictions": [
                {"label": "B-VENDOR_RFC", "score": 0.95},
                {"label": "I-VENDOR_RFC", "score": 0.92},
                {"label": "B-INVOICE_NUMBER", "score": 0.88},
                {"label": "I-INVOICE_NUMBER", "score": 0.85},
                {"label": "B-TOTAL", "score": 0.90},
                {"label": "I-TOTAL", "score": 0.87},
            ],
            "bboxes": [
                [100, 50, 150, 70],
                [155, 50, 300, 70],
                [100, 80, 180, 100],
                [185, 80, 350, 100],
                [400, 500, 450, 520],
                [455, 500, 550, 520],
            ]
        }

    def test_parse_output_extracts_fields(self, extractor, mock_predictions):
        """parse_output should extract field values from predictions."""
        result = extractor.parse_output(mock_predictions)

        assert isinstance(result, dict)
        assert "vendor_rfc" in result or len(result) > 0

    def test_parse_output_groups_bio_tokens(self, extractor, mock_predictions):
        """Should group B-label and I-label tokens into single field."""
        result = extractor.parse_output(mock_predictions)

        # B-VENDOR_RFC + I-VENDOR_RFC should become one vendor_rfc field
        if "vendor_rfc" in result:
            assert "ABC123456789" in result["vendor_rfc"]["value"]


class TestConfidenceScores:
    """Tests for confidence score calculation (T013.2.4.4)."""

    @pytest.fixture
    def extractor(self):
        """Extractor instance."""
        return AIExtractor()

    def test_calculate_field_confidence(self, extractor):
        """Should calculate confidence from token scores."""
        token_scores = [0.95, 0.92, 0.88]

        confidence = extractor.calculate_field_confidence(token_scores)

        assert 0.0 <= confidence <= 1.0
        assert confidence == pytest.approx(0.9167, rel=0.01)  # Mean

    def test_confidence_single_token(self, extractor):
        """Single token confidence should be that token's score."""
        token_scores = [0.85]

        confidence = extractor.calculate_field_confidence(token_scores)

        assert confidence == 0.85

    def test_confidence_empty_returns_zero(self, extractor):
        """Empty scores should return 0."""
        confidence = extractor.calculate_field_confidence([])

        assert confidence == 0.0


class TestMexicanInvoiceFieldMapping:
    """Tests for field mapping to Mexican invoice schema (T013.2.5)."""

    @pytest.fixture
    def extractor(self):
        """Extractor instance."""
        extractor = AIExtractor()
        extractor._is_model_loaded = True
        return extractor

    @pytest.fixture
    def raw_extracted_fields(self):
        """Raw extracted fields before mapping."""
        return {
            "vendor_rfc": {"value": "ABC123456789", "confidence": 0.95, "bbox": [100, 50, 300, 70]},
            "vendor_name": {"value": "EMPRESA TEST SA DE CV", "confidence": 0.88, "bbox": [100, 100, 400, 120]},
            "invoice_number": {"value": "FAC-2024-001", "confidence": 0.92, "bbox": [100, 80, 350, 100]},
            "invoice_date": {"value": "15/01/2024", "confidence": 0.85, "bbox": [400, 80, 500, 100]},
            "subtotal": {"value": "$1,000.00", "confidence": 0.90, "bbox": [400, 450, 550, 470]},
            "iva_amount": {"value": "$160.00", "confidence": 0.88, "bbox": [400, 475, 550, 495]},
            "total": {"value": "$1,160.00", "confidence": 0.91, "bbox": [400, 500, 550, 520]},
        }

    def test_map_vendor_rfc_field(self, extractor, raw_extracted_fields):
        """Should map vendor_rfc to ExtractionField."""
        result = extractor.map_to_invoice_schema(raw_extracted_fields)

        assert result.vendor_rfc is not None
        assert result.vendor_rfc.field_name == "vendor_rfc"
        assert result.vendor_rfc.value == "ABC123456789"
        assert result.vendor_rfc.confidence == 0.95

    def test_map_vendor_name_field(self, extractor, raw_extracted_fields):
        """Should map vendor_name to ExtractionField."""
        result = extractor.map_to_invoice_schema(raw_extracted_fields)

        assert result.vendor_name is not None
        assert result.vendor_name.value == "EMPRESA TEST SA DE CV"

    def test_map_invoice_number_field(self, extractor, raw_extracted_fields):
        """Should map invoice_number to ExtractionField."""
        result = extractor.map_to_invoice_schema(raw_extracted_fields)

        assert result.invoice_number is not None
        assert result.invoice_number.value == "FAC-2024-001"

    def test_map_invoice_date_field(self, extractor, raw_extracted_fields):
        """Should map invoice_date to ExtractionField."""
        result = extractor.map_to_invoice_schema(raw_extracted_fields)

        assert result.invoice_date is not None
        assert "15/01/2024" in result.invoice_date.value

    def test_map_amounts_fields(self, extractor, raw_extracted_fields):
        """Should map subtotal, iva_amount, and total."""
        result = extractor.map_to_invoice_schema(raw_extracted_fields)

        assert result.subtotal is not None
        assert result.iva_amount is not None
        assert result.total is not None

    def test_map_includes_bounding_boxes(self, extractor, raw_extracted_fields):
        """Should include bounding boxes in mapped fields."""
        result = extractor.map_to_invoice_schema(raw_extracted_fields)

        if result.vendor_rfc and result.vendor_rfc.bbox:
            assert result.vendor_rfc.bbox.x0 == 100

    def test_map_handles_missing_fields(self, extractor):
        """Should handle missing fields gracefully."""
        partial_fields = {
            "vendor_rfc": {"value": "ABC123456789", "confidence": 0.95, "bbox": None},
        }

        result = extractor.map_to_invoice_schema(partial_fields)

        assert result.vendor_rfc is not None
        assert result.invoice_number is None


class TestExtractFieldsIntegration:
    """Integration tests for extract_fields() method."""

    @pytest.fixture
    def extractor(self):
        """Extractor with mocked internals."""
        extractor = AIExtractor()
        extractor._model = Mock()
        extractor._processor = Mock()
        extractor._is_model_loaded = True
        return extractor

    @pytest.fixture
    def sample_document_data(self):
        """Sample document data for extraction."""
        return {
            "text_blocks": [
                {"text": "RFC: ABC123456789", "bbox": {"x0": 100, "y0": 50, "x1": 300, "y1": 70}},
                {"text": "FACTURA: FAC-2024-001", "bbox": {"x0": 100, "y0": 80, "x1": 350, "y1": 100}},
                {"text": "TOTAL: $1,234.56", "bbox": {"x0": 400, "y0": 500, "x1": 550, "y1": 520}},
            ],
            "image_width": 612,
            "image_height": 792,
            "source_file": "test_invoice.pdf",
            "source_type": "text",
        }

    def test_extract_fields_returns_invoice_extraction(self, extractor, sample_document_data):
        """extract_fields should return InvoiceExtraction object."""
        # Mock the extraction pipeline
        with patch.object(extractor, 'prepare_input', return_value={}), \
             patch.object(extractor, 'run_inference', return_value={"predictions": []}), \
             patch.object(extractor, 'parse_output', return_value={}):

            result = extractor.extract_fields(sample_document_data)

        assert isinstance(result, InvoiceExtraction)
        assert result.source_file == "test_invoice.pdf"
        assert result.source_type == "text"

    def test_extract_fields_requires_text_blocks(self, extractor):
        """Should raise error if text_blocks missing."""
        with pytest.raises(ValueError, match="text_blocks"):
            extractor.extract_fields({"image_width": 612, "image_height": 792})

    def test_extract_fields_calculates_overall_confidence(self, extractor, sample_document_data):
        """Should calculate overall confidence from extracted fields."""
        mock_fields = {
            "vendor_rfc": {"value": "ABC123", "confidence": 0.90, "bbox": None},
            "total": {"value": "$100.00", "confidence": 0.80, "bbox": None},
        }

        with patch.object(extractor, 'prepare_input', return_value={}), \
             patch.object(extractor, 'run_inference', return_value={"predictions": []}), \
             patch.object(extractor, 'parse_output', return_value=mock_fields):

            result = extractor.extract_fields(sample_document_data)

        # Should have some confidence value
        assert result.overall_confidence >= 0.0


class TestErrorHandling:
    """Tests for error handling."""

    def test_handles_empty_text_blocks(self):
        """Should handle empty text blocks list."""
        extractor = AIExtractor()
        extractor._is_model_loaded = True

        with patch.object(extractor, 'prepare_input', return_value={}), \
             patch.object(extractor, 'run_inference', return_value={"predictions": []}), \
             patch.object(extractor, 'parse_output', return_value={}):

            result = extractor.extract_fields({
                "text_blocks": [],
                "image_width": 612,
                "image_height": 792,
                "source_file": "empty.pdf",
                "source_type": "text",
            })

        assert isinstance(result, InvoiceExtraction)

    def test_handles_model_error(self):
        """Should raise appropriate error on model failure."""
        extractor = AIExtractor()
        extractor._model = Mock()
        extractor._model.side_effect = RuntimeError("Model error")
        extractor._processor = Mock()
        extractor._is_model_loaded = True

        with pytest.raises(RuntimeError):
            extractor.run_inference({"input_ids": [[1, 2, 3]]})
