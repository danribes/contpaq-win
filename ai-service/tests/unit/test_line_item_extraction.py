"""
T013.3 - Tests for line item extraction from invoice tables

Tests for LineItemExtractor service that detects table regions
and extracts structured line items from Mexican invoices.
"""

import pytest
from decimal import Decimal
from typing import List, Dict, Any

from src.services.line_item_extractor import (
    LineItemExtractor,
    TableRegion,
    TextBlock,
)
from src.models.extraction import (
    BoundingBox,
    LineItemExtraction,
)


class TestLineItemExtractorInitialization:
    """Tests for LineItemExtractor initialization."""

    def test_extractor_can_be_instantiated(self):
        """Should create LineItemExtractor instance."""
        extractor = LineItemExtractor()
        assert extractor is not None


class TestTableRegion:
    """Tests for TableRegion data class."""

    def test_create_table_region(self):
        """Should create a TableRegion with bbox."""
        region = TableRegion(
            bbox=BoundingBox(x0=50, y0=200, x1=550, y1=400),
            header_row=0,
            data_rows=[1, 2, 3]
        )
        assert region.bbox.x0 == 50
        assert region.header_row == 0
        assert len(region.data_rows) == 3

    def test_table_region_height(self):
        """Should calculate table height."""
        region = TableRegion(
            bbox=BoundingBox(x0=50, y0=200, x1=550, y1=400),
            header_row=0,
            data_rows=[]
        )
        assert region.bbox.height == 200


class TestTextBlock:
    """Tests for TextBlock data class."""

    def test_create_text_block(self):
        """Should create a TextBlock with text and bbox."""
        block = TextBlock(
            text="Widget A",
            bbox=BoundingBox(x0=50, y0=220, x1=200, y1=240),
            page=0
        )
        assert block.text == "Widget A"
        assert block.bbox.x0 == 50
        assert block.page == 0

    def test_text_block_center_y(self):
        """Should calculate vertical center."""
        block = TextBlock(
            text="Test",
            bbox=BoundingBox(x0=0, y0=100, x1=100, y1=120),
            page=0
        )
        # Center Y = (100 + 120) / 2 = 110
        assert block.center_y == 110


class TestTableDetection:
    """Tests for table region detection (T013.3.2)."""

    @pytest.fixture
    def extractor(self):
        """LineItemExtractor instance."""
        return LineItemExtractor()

    @pytest.fixture
    def invoice_text_blocks(self) -> List[Dict[str, Any]]:
        """Sample text blocks from an invoice with a table."""
        return [
            # Header info
            {"text": "FACTURA", "bbox": {"x0": 250, "y0": 50, "x1": 350, "y1": 80}},
            {"text": "RFC: ABC123456789", "bbox": {"x0": 50, "y0": 100, "x1": 200, "y1": 120}},
            # Table header
            {"text": "Descripción", "bbox": {"x0": 50, "y0": 200, "x1": 200, "y1": 220}},
            {"text": "Cantidad", "bbox": {"x0": 250, "y0": 200, "x1": 320, "y1": 220}},
            {"text": "P. Unitario", "bbox": {"x0": 350, "y0": 200, "x1": 430, "y1": 220}},
            {"text": "Importe", "bbox": {"x0": 480, "y0": 200, "x1": 550, "y1": 220}},
            # Row 1
            {"text": "Widget A", "bbox": {"x0": 50, "y0": 230, "x1": 200, "y1": 250}},
            {"text": "10", "bbox": {"x0": 270, "y0": 230, "x1": 300, "y1": 250}},
            {"text": "25.00", "bbox": {"x0": 360, "y0": 230, "x1": 420, "y1": 250}},
            {"text": "250.00", "bbox": {"x0": 490, "y0": 230, "x1": 550, "y1": 250}},
            # Row 2
            {"text": "Service B", "bbox": {"x0": 50, "y0": 260, "x1": 200, "y1": 280}},
            {"text": "5", "bbox": {"x0": 270, "y0": 260, "x1": 300, "y1": 280}},
            {"text": "100.00", "bbox": {"x0": 360, "y0": 260, "x1": 420, "y1": 280}},
            {"text": "500.00", "bbox": {"x0": 490, "y0": 260, "x1": 550, "y1": 280}},
            # Totals
            {"text": "Subtotal:", "bbox": {"x0": 380, "y0": 320, "x1": 450, "y1": 340}},
            {"text": "750.00", "bbox": {"x0": 490, "y0": 320, "x1": 550, "y1": 340}},
        ]

    def test_detect_table_region_returns_table(self, extractor, invoice_text_blocks):
        """detect_table_region should find the table area."""
        region = extractor.detect_table_region(invoice_text_blocks)

        assert region is not None
        assert isinstance(region, TableRegion)

    def test_detect_table_finds_header_keywords(self, extractor, invoice_text_blocks):
        """Should detect table by header keywords like Descripción, Cantidad."""
        region = extractor.detect_table_region(invoice_text_blocks)

        # Table should be detected
        assert region is not None
        # Header row should be at y ~200
        assert region.bbox.y0 <= 220

    def test_detect_table_excludes_header_info(self, extractor, invoice_text_blocks):
        """Should not include invoice header in table region."""
        region = extractor.detect_table_region(invoice_text_blocks)

        # Table should not start at document top
        assert region.bbox.y0 > 100

    def test_detect_table_returns_none_for_no_table(self, extractor):
        """Should return None if no table found."""
        text_blocks = [
            {"text": "FACTURA", "bbox": {"x0": 250, "y0": 50, "x1": 350, "y1": 80}},
            {"text": "RFC: ABC123456789", "bbox": {"x0": 50, "y0": 100, "x1": 200, "y1": 120}},
            {"text": "TOTAL: $1,000.00", "bbox": {"x0": 400, "y0": 500, "x1": 550, "y1": 520}},
        ]

        region = extractor.detect_table_region(text_blocks)

        assert region is None


class TestLineItemParsing:
    """Tests for extracting line items from table (T013.3.3)."""

    @pytest.fixture
    def extractor(self):
        """LineItemExtractor instance."""
        return LineItemExtractor()

    @pytest.fixture
    def table_text_blocks(self) -> List[Dict[str, Any]]:
        """Text blocks from a table region."""
        return [
            # Header row
            {"text": "Descripción", "bbox": {"x0": 50, "y0": 200, "x1": 200, "y1": 220}},
            {"text": "Cantidad", "bbox": {"x0": 250, "y0": 200, "x1": 320, "y1": 220}},
            {"text": "P. Unitario", "bbox": {"x0": 350, "y0": 200, "x1": 430, "y1": 220}},
            {"text": "Importe", "bbox": {"x0": 480, "y0": 200, "x1": 550, "y1": 220}},
            # Row 1
            {"text": "Widget A", "bbox": {"x0": 50, "y0": 230, "x1": 200, "y1": 250}},
            {"text": "10", "bbox": {"x0": 270, "y0": 230, "x1": 300, "y1": 250}},
            {"text": "25.00", "bbox": {"x0": 360, "y0": 230, "x1": 420, "y1": 250}},
            {"text": "250.00", "bbox": {"x0": 490, "y0": 230, "x1": 550, "y1": 250}},
            # Row 2
            {"text": "Service B", "bbox": {"x0": 50, "y0": 260, "x1": 200, "y1": 280}},
            {"text": "5", "bbox": {"x0": 270, "y0": 260, "x1": 300, "y1": 280}},
            {"text": "100.00", "bbox": {"x0": 360, "y0": 260, "x1": 420, "y1": 280}},
            {"text": "500.00", "bbox": {"x0": 490, "y0": 260, "x1": 550, "y1": 280}},
        ]

    def test_extract_line_items_returns_list(self, extractor, table_text_blocks):
        """extract_line_items should return list of LineItemExtraction."""
        items = extractor.extract_line_items(table_text_blocks)

        assert isinstance(items, list)
        assert len(items) >= 2

    def test_line_item_has_description(self, extractor, table_text_blocks):
        """Each line item should have description."""
        items = extractor.extract_line_items(table_text_blocks)

        assert items[0].description == "Widget A"
        assert items[1].description == "Service B"

    def test_line_item_has_quantity(self, extractor, table_text_blocks):
        """Each line item should have quantity."""
        items = extractor.extract_line_items(table_text_blocks)

        assert items[0].quantity == Decimal("10")
        assert items[1].quantity == Decimal("5")

    def test_line_item_has_unit_price(self, extractor, table_text_blocks):
        """Each line item should have unit_price."""
        items = extractor.extract_line_items(table_text_blocks)

        assert items[0].unit_price == Decimal("25.00")
        assert items[1].unit_price == Decimal("100.00")

    def test_line_item_has_amount(self, extractor, table_text_blocks):
        """Each line item should have amount."""
        items = extractor.extract_line_items(table_text_blocks)

        assert items[0].amount == Decimal("250.00")
        assert items[1].amount == Decimal("500.00")

    def test_line_item_has_line_number(self, extractor, table_text_blocks):
        """Line items should have sequential line numbers."""
        items = extractor.extract_line_items(table_text_blocks)

        assert items[0].line_number == 1
        assert items[1].line_number == 2

    def test_line_item_has_confidence(self, extractor, table_text_blocks):
        """Line items should have confidence scores."""
        items = extractor.extract_line_items(table_text_blocks)

        assert 0.0 <= items[0].confidence <= 1.0
        assert 0.0 <= items[1].confidence <= 1.0

    def test_extract_handles_empty_table(self, extractor):
        """Should handle empty table blocks."""
        items = extractor.extract_line_items([])

        assert items == []


class TestColumnDetection:
    """Tests for column detection in tables."""

    @pytest.fixture
    def extractor(self):
        """LineItemExtractor instance."""
        return LineItemExtractor()

    @pytest.fixture
    def header_blocks(self) -> List[Dict[str, Any]]:
        """Table header text blocks."""
        return [
            {"text": "Descripción", "bbox": {"x0": 50, "y0": 200, "x1": 200, "y1": 220}},
            {"text": "Cantidad", "bbox": {"x0": 250, "y0": 200, "x1": 320, "y1": 220}},
            {"text": "P. Unitario", "bbox": {"x0": 350, "y0": 200, "x1": 430, "y1": 220}},
            {"text": "Importe", "bbox": {"x0": 480, "y0": 200, "x1": 550, "y1": 220}},
        ]

    def test_detect_columns_returns_dict(self, extractor, header_blocks):
        """detect_columns should return column mapping."""
        columns = extractor.detect_columns(header_blocks)

        assert isinstance(columns, dict)
        assert "description" in columns
        assert "quantity" in columns
        assert "unit_price" in columns
        assert "amount" in columns

    def test_detect_columns_has_x_ranges(self, extractor, header_blocks):
        """Column mapping should include x-coordinate ranges."""
        columns = extractor.detect_columns(header_blocks)

        # Description column should start at x=50
        assert columns["description"]["x0"] == 50
        # Amount column should end at x=550
        assert columns["amount"]["x1"] == 550

    def test_detect_columns_handles_spanish_headers(self, extractor):
        """Should detect Spanish column headers."""
        spanish_headers = [
            {"text": "CONCEPTO", "bbox": {"x0": 50, "y0": 200, "x1": 200, "y1": 220}},
            {"text": "CANT.", "bbox": {"x0": 250, "y0": 200, "x1": 320, "y1": 220}},
            {"text": "PRECIO UNIT.", "bbox": {"x0": 350, "y0": 200, "x1": 430, "y1": 220}},
            {"text": "TOTAL", "bbox": {"x0": 480, "y0": 200, "x1": 550, "y1": 220}},
        ]

        columns = extractor.detect_columns(spanish_headers)

        assert "description" in columns
        assert "quantity" in columns


class TestRowGrouping:
    """Tests for grouping text blocks into rows."""

    @pytest.fixture
    def extractor(self):
        """LineItemExtractor instance."""
        return LineItemExtractor()

    @pytest.fixture
    def table_blocks(self) -> List[Dict[str, Any]]:
        """Mixed text blocks from table."""
        return [
            {"text": "Widget A", "bbox": {"x0": 50, "y0": 230, "x1": 200, "y1": 250}},
            {"text": "10", "bbox": {"x0": 270, "y0": 232, "x1": 300, "y1": 252}},
            {"text": "Service B", "bbox": {"x0": 50, "y0": 260, "x1": 200, "y1": 280}},
            {"text": "25.00", "bbox": {"x0": 360, "y0": 231, "x1": 420, "y1": 251}},
            {"text": "5", "bbox": {"x0": 270, "y0": 261, "x1": 300, "y1": 281}},
            {"text": "250.00", "bbox": {"x0": 490, "y0": 233, "x1": 550, "y1": 253}},
        ]

    def test_group_blocks_by_row_returns_list(self, extractor, table_blocks):
        """group_blocks_by_row should return list of rows."""
        rows = extractor.group_blocks_by_row(table_blocks)

        assert isinstance(rows, list)
        assert len(rows) >= 2

    def test_group_blocks_clusters_similar_y(self, extractor, table_blocks):
        """Should group blocks with similar y-coordinates."""
        rows = extractor.group_blocks_by_row(table_blocks)

        # First row should have 4 items (around y=230-250)
        # Widget A, 10, 25.00, 250.00
        first_row_texts = [block["text"] for block in rows[0]]
        assert "Widget A" in first_row_texts

    def test_group_blocks_tolerates_slight_misalignment(self, extractor):
        """Should group blocks with slight y-offset (within tolerance)."""
        misaligned_blocks = [
            {"text": "Item 1", "bbox": {"x0": 50, "y0": 230, "x1": 150, "y1": 250}},
            {"text": "100", "bbox": {"x0": 200, "y0": 235, "x1": 250, "y1": 255}},  # 5px offset
        ]

        rows = extractor.group_blocks_by_row(misaligned_blocks, tolerance=10)

        # Should still be grouped into one row
        assert len(rows) == 1


class TestLineItemValidation:
    """Tests for line item total validation (T013.3.4)."""

    @pytest.fixture
    def extractor(self):
        """LineItemExtractor instance."""
        return LineItemExtractor()

    def test_validate_correct_amount(self, extractor):
        """Should validate correct line item amount."""
        item = LineItemExtraction(
            line_number=1,
            description="Widget A",
            quantity=Decimal("10"),
            unit_price=Decimal("25.00"),
            amount=Decimal("250.00"),  # 10 * 25 = 250
            confidence=0.9
        )

        is_valid = extractor.validate_line_item(item)

        assert is_valid is True

    def test_validate_incorrect_amount(self, extractor):
        """Should reject incorrect line item amount."""
        item = LineItemExtraction(
            line_number=1,
            description="Widget A",
            quantity=Decimal("10"),
            unit_price=Decimal("25.00"),
            amount=Decimal("300.00"),  # Wrong! Should be 250
            confidence=0.9
        )

        is_valid = extractor.validate_line_item(item)

        assert is_valid is False

    def test_validate_allows_small_rounding_difference(self, extractor):
        """Should allow small rounding differences (< 0.01)."""
        item = LineItemExtraction(
            line_number=1,
            description="Widget A",
            quantity=Decimal("3"),
            unit_price=Decimal("33.333"),
            amount=Decimal("100.00"),  # 3 * 33.333 = 99.999, rounds to 100.00
            confidence=0.9
        )

        is_valid = extractor.validate_line_item(item)

        assert is_valid is True

    def test_validate_all_items(self, extractor):
        """Should validate list of line items."""
        items = [
            LineItemExtraction(
                line_number=1,
                description="Widget A",
                quantity=Decimal("10"),
                unit_price=Decimal("25.00"),
                amount=Decimal("250.00"),
                confidence=0.9
            ),
            LineItemExtraction(
                line_number=2,
                description="Service B",
                quantity=Decimal("5"),
                unit_price=Decimal("100.00"),
                amount=Decimal("500.00"),
                confidence=0.9
            ),
        ]

        all_valid = extractor.validate_all_items(items)

        assert all_valid is True


class TestIntegrationExtraction:
    """Integration tests for full line item extraction."""

    @pytest.fixture
    def extractor(self):
        """LineItemExtractor instance."""
        return LineItemExtractor()

    @pytest.fixture
    def full_invoice_blocks(self) -> List[Dict[str, Any]]:
        """Complete invoice text blocks."""
        return [
            {"text": "FACTURA", "bbox": {"x0": 250, "y0": 50, "x1": 350, "y1": 80}},
            {"text": "RFC: ABC123456789", "bbox": {"x0": 50, "y0": 100, "x1": 200, "y1": 120}},
            {"text": "Descripción", "bbox": {"x0": 50, "y0": 200, "x1": 200, "y1": 220}},
            {"text": "Cantidad", "bbox": {"x0": 250, "y0": 200, "x1": 320, "y1": 220}},
            {"text": "P. Unitario", "bbox": {"x0": 350, "y0": 200, "x1": 430, "y1": 220}},
            {"text": "Importe", "bbox": {"x0": 480, "y0": 200, "x1": 550, "y1": 220}},
            {"text": "Widget A", "bbox": {"x0": 50, "y0": 230, "x1": 200, "y1": 250}},
            {"text": "10", "bbox": {"x0": 270, "y0": 230, "x1": 300, "y1": 250}},
            {"text": "25.00", "bbox": {"x0": 360, "y0": 230, "x1": 420, "y1": 250}},
            {"text": "250.00", "bbox": {"x0": 490, "y0": 230, "x1": 550, "y1": 250}},
            {"text": "Service B", "bbox": {"x0": 50, "y0": 260, "x1": 200, "y1": 280}},
            {"text": "5", "bbox": {"x0": 270, "y0": 260, "x1": 300, "y1": 280}},
            {"text": "100.00", "bbox": {"x0": 360, "y0": 260, "x1": 420, "y1": 280}},
            {"text": "500.00", "bbox": {"x0": 490, "y0": 260, "x1": 550, "y1": 280}},
            {"text": "Subtotal:", "bbox": {"x0": 380, "y0": 320, "x1": 450, "y1": 340}},
            {"text": "750.00", "bbox": {"x0": 490, "y0": 320, "x1": 550, "y1": 340}},
        ]

    def test_extract_from_document(self, extractor, full_invoice_blocks):
        """Should extract line items from full invoice."""
        items = extractor.extract_from_document(full_invoice_blocks)

        assert len(items) == 2
        assert items[0].description == "Widget A"
        assert items[1].description == "Service B"

    def test_extract_calculates_confidence(self, extractor, full_invoice_blocks):
        """Should calculate confidence for extracted items."""
        items = extractor.extract_from_document(full_invoice_blocks)

        assert all(item.confidence > 0 for item in items)

    def test_extract_handles_no_table(self, extractor):
        """Should return empty list if no table found."""
        no_table_blocks = [
            {"text": "FACTURA", "bbox": {"x0": 250, "y0": 50, "x1": 350, "y1": 80}},
            {"text": "RFC: ABC123456789", "bbox": {"x0": 50, "y0": 100, "x1": 200, "y1": 120}},
        ]

        items = extractor.extract_from_document(no_table_blocks)

        assert items == []
