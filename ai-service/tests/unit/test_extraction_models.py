"""
T013.1 - Tests for extraction Pydantic models

Tests for BoundingBox, ExtractionField, LineItemExtraction, and
InvoiceExtraction models used in AI field extraction.
"""

import pytest
from decimal import Decimal
from pydantic import ValidationError

from src.models.extraction import (
    BoundingBox,
    ExtractionField,
    LineItemExtraction,
    InvoiceExtraction,
)


class TestBoundingBox:
    """Tests for BoundingBox model."""

    def test_create_valid_bbox(self):
        """Should create a valid BoundingBox."""
        bbox = BoundingBox(x0=10.0, y0=20.0, x1=100.0, y1=80.0)
        assert bbox.x0 == 10.0
        assert bbox.y0 == 20.0
        assert bbox.x1 == 100.0
        assert bbox.y1 == 80.0

    def test_bbox_with_page_number(self):
        """Should accept page number."""
        bbox = BoundingBox(x0=0, y0=0, x1=100, y1=100, page=2)
        assert bbox.page == 2

    def test_bbox_default_page_is_zero(self):
        """Default page should be 0."""
        bbox = BoundingBox(x0=0, y0=0, x1=100, y1=100)
        assert bbox.page == 0

    def test_bbox_width_property(self):
        """Should calculate width correctly."""
        bbox = BoundingBox(x0=10, y0=20, x1=110, y1=80)
        assert bbox.width == 100.0

    def test_bbox_height_property(self):
        """Should calculate height correctly."""
        bbox = BoundingBox(x0=10, y0=20, x1=110, y1=80)
        assert bbox.height == 60.0

    def test_bbox_area_property(self):
        """Should calculate area correctly."""
        bbox = BoundingBox(x0=0, y0=0, x1=100, y1=50)
        assert bbox.area == 5000.0

    def test_bbox_rejects_negative_coordinates(self):
        """Should reject negative coordinates."""
        with pytest.raises(ValidationError):
            BoundingBox(x0=-10, y0=0, x1=100, y1=100)

    def test_bbox_validates_x1_greater_than_x0(self):
        """x1 must be >= x0."""
        with pytest.raises(ValidationError):
            BoundingBox(x0=100, y0=0, x1=50, y1=100)

    def test_bbox_validates_y1_greater_than_y0(self):
        """y1 must be >= y0."""
        with pytest.raises(ValidationError):
            BoundingBox(x0=0, y0=100, x1=100, y1=50)

    def test_bbox_allows_zero_dimensions(self):
        """Should allow x0==x1 or y0==y1 (point/line)."""
        bbox = BoundingBox(x0=50, y0=50, x1=50, y1=50)
        assert bbox.width == 0
        assert bbox.height == 0

    def test_bbox_serializes_to_dict(self):
        """Should serialize to dictionary."""
        bbox = BoundingBox(x0=10, y0=20, x1=100, y1=80, page=1)
        data = bbox.model_dump()
        assert data == {
            "x0": 10.0,
            "y0": 20.0,
            "x1": 100.0,
            "y1": 80.0,
            "page": 1
        }


class TestExtractionField:
    """Tests for ExtractionField model."""

    def test_create_valid_field(self):
        """Should create a valid ExtractionField."""
        field = ExtractionField(
            field_name="vendor_rfc",
            value="ABC123456789",
            confidence=0.95
        )
        assert field.field_name == "vendor_rfc"
        assert field.value == "ABC123456789"
        assert field.confidence == 0.95

    def test_field_with_bbox(self):
        """Should accept optional bounding box."""
        bbox = BoundingBox(x0=10, y0=20, x1=100, y1=40)
        field = ExtractionField(
            field_name="total",
            value="$1,234.56",
            confidence=0.88,
            bbox=bbox
        )
        assert field.bbox is not None
        assert field.bbox.x0 == 10

    def test_field_with_raw_text(self):
        """Should accept optional raw_text."""
        field = ExtractionField(
            field_name="date",
            value="2024-01-15",
            confidence=0.92,
            raw_text="15 de Enero de 2024"
        )
        assert field.raw_text == "15 de Enero de 2024"

    def test_field_confidence_percentage(self):
        """Should calculate confidence percentage."""
        field = ExtractionField(
            field_name="test",
            value="value",
            confidence=0.875
        )
        assert field.confidence_percentage == 87.5

    def test_field_rejects_empty_name(self):
        """Should reject empty field name."""
        with pytest.raises(ValidationError):
            ExtractionField(field_name="", value="test", confidence=0.5)

    def test_field_rejects_confidence_above_1(self):
        """Confidence must be <= 1.0."""
        with pytest.raises(ValidationError):
            ExtractionField(
                field_name="test",
                value="value",
                confidence=1.5
            )

    def test_field_rejects_negative_confidence(self):
        """Confidence must be >= 0.0."""
        with pytest.raises(ValidationError):
            ExtractionField(
                field_name="test",
                value="value",
                confidence=-0.1
            )

    def test_field_allows_empty_value(self):
        """Should allow empty string value."""
        field = ExtractionField(
            field_name="optional_field",
            value="",
            confidence=0.1
        )
        assert field.value == ""


class TestLineItemExtraction:
    """Tests for LineItemExtraction model."""

    def test_create_valid_line_item(self):
        """Should create a valid line item."""
        item = LineItemExtraction(
            line_number=1,
            description="Widget A",
            quantity=Decimal("10"),
            unit_price=Decimal("25.50"),
            amount=Decimal("255.00"),
            confidence=0.9
        )
        assert item.line_number == 1
        assert item.description == "Widget A"
        assert item.quantity == Decimal("10")

    def test_line_item_converts_floats_to_decimal(self):
        """Should convert float inputs to Decimal."""
        item = LineItemExtraction(
            line_number=1,
            description="Test",
            quantity=5.0,
            unit_price=10.50,
            amount=52.50,
            confidence=0.8
        )
        assert isinstance(item.quantity, Decimal)
        assert isinstance(item.unit_price, Decimal)
        assert isinstance(item.amount, Decimal)

    def test_line_item_converts_strings_to_decimal(self):
        """Should convert string inputs to Decimal."""
        item = LineItemExtraction(
            line_number=1,
            description="Test",
            quantity="3",
            unit_price="15.99",
            amount="47.97",
            confidence=0.85
        )
        assert item.quantity == Decimal("3")

    def test_line_item_validate_amount_correct(self):
        """validate_amount should return True for correct amounts."""
        item = LineItemExtraction(
            line_number=1,
            description="Test",
            quantity=Decimal("2"),
            unit_price=Decimal("10.00"),
            amount=Decimal("20.00"),
            confidence=0.9
        )
        assert item.validate_amount() is True

    def test_line_item_validate_amount_incorrect(self):
        """validate_amount should return False for incorrect amounts."""
        item = LineItemExtraction(
            line_number=1,
            description="Test",
            quantity=Decimal("2"),
            unit_price=Decimal("10.00"),
            amount=Decimal("25.00"),  # Wrong!
            confidence=0.9
        )
        assert item.validate_amount() is False

    def test_line_item_rejects_zero_line_number(self):
        """Line number must be >= 1."""
        with pytest.raises(ValidationError):
            LineItemExtraction(
                line_number=0,
                description="Test",
                quantity=1,
                unit_price=10,
                amount=10,
                confidence=0.5
            )

    def test_line_item_rejects_negative_quantity(self):
        """Quantity must be >= 0."""
        with pytest.raises(ValidationError):
            LineItemExtraction(
                line_number=1,
                description="Test",
                quantity=-1,
                unit_price=10,
                amount=10,
                confidence=0.5
            )

    def test_line_item_with_bbox(self):
        """Should accept optional bounding box."""
        bbox = BoundingBox(x0=0, y0=100, x1=500, y1=120)
        item = LineItemExtraction(
            line_number=1,
            description="Test",
            quantity=1,
            unit_price=100,
            amount=100,
            confidence=0.9,
            bbox=bbox
        )
        assert item.bbox is not None


class TestInvoiceExtraction:
    """Tests for InvoiceExtraction model."""

    def test_create_minimal_extraction(self):
        """Should create with minimal required fields."""
        extraction = InvoiceExtraction(
            source_file="invoice.pdf",
            source_type="text"
        )
        assert extraction.source_file == "invoice.pdf"
        assert extraction.source_type == "text"

    def test_extraction_with_header_fields(self):
        """Should accept header extraction fields."""
        vendor_rfc = ExtractionField(
            field_name="vendor_rfc",
            value="ABC123456789",
            confidence=0.95
        )
        extraction = InvoiceExtraction(
            source_file="invoice.pdf",
            source_type="scanned",
            vendor_rfc=vendor_rfc
        )
        assert extraction.vendor_rfc.value == "ABC123456789"

    def test_extraction_with_line_items(self):
        """Should accept list of line items."""
        items = [
            LineItemExtraction(
                line_number=1,
                description="Item 1",
                quantity=2,
                unit_price=50,
                amount=100,
                confidence=0.9
            ),
            LineItemExtraction(
                line_number=2,
                description="Item 2",
                quantity=1,
                unit_price=75,
                amount=75,
                confidence=0.85
            )
        ]
        extraction = InvoiceExtraction(
            source_file="invoice.pdf",
            source_type="text",
            line_items=items
        )
        assert len(extraction.line_items) == 2

    def test_extraction_rejects_invalid_source_type(self):
        """source_type must be 'text' or 'scanned'."""
        with pytest.raises(ValidationError):
            InvoiceExtraction(
                source_file="invoice.pdf",
                source_type="invalid"
            )

    def test_calculate_overall_confidence(self):
        """Should calculate average confidence."""
        extraction = InvoiceExtraction(
            source_file="invoice.pdf",
            source_type="text",
            vendor_rfc=ExtractionField(
                field_name="vendor_rfc",
                value="ABC123",
                confidence=0.9
            ),
            total=ExtractionField(
                field_name="total",
                value="100.00",
                confidence=0.8
            )
        )
        avg = extraction.calculate_overall_confidence()
        assert avg == pytest.approx(0.85)  # (0.9 + 0.8) / 2

    def test_has_required_fields_true(self):
        """has_required_fields should return True when all present."""
        extraction = InvoiceExtraction(
            source_file="invoice.pdf",
            source_type="text",
            vendor_rfc=ExtractionField(
                field_name="vendor_rfc", value="ABC123", confidence=0.9
            ),
            invoice_number=ExtractionField(
                field_name="invoice_number", value="INV-001", confidence=0.95
            ),
            total=ExtractionField(
                field_name="total", value="1000.00", confidence=0.88
            )
        )
        assert extraction.has_required_fields is True

    def test_has_required_fields_false(self):
        """has_required_fields should return False when missing fields."""
        extraction = InvoiceExtraction(
            source_file="invoice.pdf",
            source_type="text",
            vendor_rfc=ExtractionField(
                field_name="vendor_rfc", value="ABC123", confidence=0.9
            )
            # Missing invoice_number and total
        )
        assert extraction.has_required_fields is False

    def test_get_field_by_name(self):
        """Should find field by name in fields list."""
        field = ExtractionField(
            field_name="custom_field",
            value="custom_value",
            confidence=0.7
        )
        extraction = InvoiceExtraction(
            source_file="invoice.pdf",
            source_type="text",
            fields=[field]
        )
        found = extraction.get_field_by_name("custom_field")
        assert found is not None
        assert found.value == "custom_value"

    def test_get_field_by_name_not_found(self):
        """Should return None for non-existent field."""
        extraction = InvoiceExtraction(
            source_file="invoice.pdf",
            source_type="text"
        )
        assert extraction.get_field_by_name("nonexistent") is None

    def test_extraction_serializes_to_json(self):
        """Should serialize to JSON-compatible dict."""
        extraction = InvoiceExtraction(
            source_file="test.pdf",
            source_type="text",
            overall_confidence=0.9,
            processing_time_ms=150
        )
        data = extraction.model_dump()
        assert data["source_file"] == "test.pdf"
        assert data["processing_time_ms"] == 150
