"""
Line Item Extractor - T013.3

Extracts structured line items from invoice tables by detecting
table regions, identifying columns, and parsing row data.

This service:
- Detects table regions in document text blocks
- Identifies column headers (description, quantity, unit_price, amount)
- Groups text blocks into rows
- Extracts and validates line item data

Usage:
    extractor = LineItemExtractor()
    items = extractor.extract_from_document(text_blocks)
"""

from dataclasses import dataclass
from decimal import Decimal, InvalidOperation
from typing import Any, Dict, List, Optional, Tuple
import logging
import re

from ..models.extraction import BoundingBox, LineItemExtraction

logger = logging.getLogger(__name__)

# Column header patterns for detection (Spanish and English)
DESCRIPTION_PATTERNS = [
    r"descripci[oó]n", r"concepto", r"producto", r"servicio",
    r"description", r"item", r"product",
]
QUANTITY_PATTERNS = [
    r"cantidad", r"cant\.?", r"qty", r"quantity", r"unidades",
]
UNIT_PRICE_PATTERNS = [
    r"p\.?\s*unitario", r"precio\s*unit", r"unit\s*price",
    r"precio", r"p\.u\.", r"price",
]
AMOUNT_PATTERNS = [
    r"importe", r"total", r"amount", r"monto", r"subtotal",
]

# Default row tolerance for grouping (pixels)
DEFAULT_ROW_TOLERANCE = 15


@dataclass
class TextBlock:
    """A text block with content and position."""
    text: str
    bbox: BoundingBox
    page: int = 0

    @property
    def center_y(self) -> float:
        """Calculate vertical center of the block."""
        return (self.bbox.y0 + self.bbox.y1) / 2

    @property
    def center_x(self) -> float:
        """Calculate horizontal center of the block."""
        return (self.bbox.x0 + self.bbox.x1) / 2


@dataclass
class TableRegion:
    """Detected table region in a document."""
    bbox: BoundingBox
    header_row: int
    data_rows: List[int]


class LineItemExtractor:
    """
    Extracts line items from invoice tables.

    Uses layout-based heuristics to detect table regions,
    identify columns, and parse structured line item data.
    """

    def __init__(self, row_tolerance: int = DEFAULT_ROW_TOLERANCE):
        """
        Initialize the extractor.

        Args:
            row_tolerance: Y-coordinate tolerance for grouping rows (pixels)
        """
        self.row_tolerance = row_tolerance

    def detect_table_region(
        self,
        text_blocks: List[Dict[str, Any]]
    ) -> Optional[TableRegion]:
        """
        Detect a table region in the document.

        Looks for characteristic table header patterns to identify
        the start of a line item table.

        Args:
            text_blocks: List of text blocks with "text" and "bbox" keys

        Returns:
            TableRegion if found, None otherwise
        """
        if not text_blocks:
            return None

        # Find header row by looking for table header keywords
        header_y = None
        header_blocks = []

        for block in text_blocks:
            text = block.get("text", "").lower()
            bbox_data = block.get("bbox", {})

            # Check if this block matches a column header pattern
            is_header = any(
                re.search(pattern, text, re.IGNORECASE)
                for patterns in [
                    DESCRIPTION_PATTERNS,
                    QUANTITY_PATTERNS,
                    UNIT_PRICE_PATTERNS,
                    AMOUNT_PATTERNS,
                ]
                for pattern in patterns
            )

            if is_header:
                y = bbox_data.get("y0", 0)
                if header_y is None or abs(y - header_y) < self.row_tolerance:
                    header_y = y if header_y is None else header_y
                    header_blocks.append(block)

        # Need at least 2 header columns to identify a table
        if len(header_blocks) < 2:
            return None

        # Find table boundaries
        min_x = min(b["bbox"]["x0"] for b in header_blocks)
        max_x = max(b["bbox"]["x1"] for b in header_blocks)
        min_y = min(b["bbox"]["y0"] for b in header_blocks)

        # Find end of table (large gap or totals section)
        max_y = min_y
        for block in text_blocks:
            bbox_data = block.get("bbox", {})
            y = bbox_data.get("y0", 0)
            x0 = bbox_data.get("x0", 0)

            # Skip blocks that are above or too far left/right of table
            if y < min_y or x0 < min_x - 50 or x0 > max_x + 50:
                continue

            # Stop at subtotal/total markers
            text = block.get("text", "").lower()
            if re.search(r"^(sub)?total\s*:?$", text):
                break

            max_y = max(max_y, bbox_data.get("y1", y))

        # Create bounding box for table region
        table_bbox = BoundingBox(
            x0=min_x,
            y0=min_y,
            x1=max_x,
            y1=max_y
        )

        return TableRegion(
            bbox=table_bbox,
            header_row=0,
            data_rows=[]  # Will be populated by row grouping
        )

    def detect_columns(
        self,
        header_blocks: List[Dict[str, Any]]
    ) -> Dict[str, Dict[str, float]]:
        """
        Detect column positions from header blocks.

        Maps column types to their x-coordinate ranges.

        Args:
            header_blocks: Text blocks from the header row

        Returns:
            Dictionary mapping column names to x-ranges
        """
        columns = {}

        for block in header_blocks:
            text = block.get("text", "").lower()
            bbox = block.get("bbox", {})

            col_type = None

            # Check each column type pattern
            for pattern in DESCRIPTION_PATTERNS:
                if re.search(pattern, text, re.IGNORECASE):
                    col_type = "description"
                    break

            if not col_type:
                for pattern in QUANTITY_PATTERNS:
                    if re.search(pattern, text, re.IGNORECASE):
                        col_type = "quantity"
                        break

            if not col_type:
                for pattern in UNIT_PRICE_PATTERNS:
                    if re.search(pattern, text, re.IGNORECASE):
                        col_type = "unit_price"
                        break

            if not col_type:
                for pattern in AMOUNT_PATTERNS:
                    if re.search(pattern, text, re.IGNORECASE):
                        col_type = "amount"
                        break

            if col_type and col_type not in columns:
                columns[col_type] = {
                    "x0": bbox.get("x0", 0),
                    "x1": bbox.get("x1", 0),
                    "center": (bbox.get("x0", 0) + bbox.get("x1", 0)) / 2,
                }

        return columns

    def group_blocks_by_row(
        self,
        text_blocks: List[Dict[str, Any]],
        tolerance: Optional[int] = None
    ) -> List[List[Dict[str, Any]]]:
        """
        Group text blocks into rows based on y-coordinates.

        Args:
            text_blocks: Text blocks to group
            tolerance: Y-coordinate tolerance (uses instance default if None)

        Returns:
            List of rows, each containing blocks with similar y-coordinates
        """
        if not text_blocks:
            return []

        tol = tolerance if tolerance is not None else self.row_tolerance

        # Sort blocks by y-coordinate
        sorted_blocks = sorted(
            text_blocks,
            key=lambda b: b.get("bbox", {}).get("y0", 0)
        )

        rows = []
        current_row = []
        current_y = None

        for block in sorted_blocks:
            y = block.get("bbox", {}).get("y0", 0)

            if current_y is None:
                current_y = y
                current_row = [block]
            elif abs(y - current_y) <= tol:
                # Same row
                current_row.append(block)
            else:
                # New row
                if current_row:
                    # Sort row by x-coordinate
                    current_row.sort(key=lambda b: b.get("bbox", {}).get("x0", 0))
                    rows.append(current_row)
                current_row = [block]
                current_y = y

        # Don't forget the last row
        if current_row:
            current_row.sort(key=lambda b: b.get("bbox", {}).get("x0", 0))
            rows.append(current_row)

        return rows

    def _assign_block_to_column(
        self,
        block: Dict[str, Any],
        columns: Dict[str, Dict[str, float]]
    ) -> Optional[str]:
        """
        Determine which column a block belongs to.

        Args:
            block: Text block to classify
            columns: Column definitions with x-ranges

        Returns:
            Column name or None if not in any column
        """
        bbox = block.get("bbox", {})
        block_center = (bbox.get("x0", 0) + bbox.get("x1", 0)) / 2

        best_match = None
        best_distance = float("inf")

        for col_name, col_info in columns.items():
            col_center = col_info["center"]
            distance = abs(block_center - col_center)

            # Check if block is within column range (with tolerance)
            x0 = col_info["x0"] - 50
            x1 = col_info["x1"] + 50

            if x0 <= block_center <= x1 and distance < best_distance:
                best_distance = distance
                best_match = col_name

        return best_match

    def _parse_decimal(self, text: str) -> Optional[Decimal]:
        """
        Parse a decimal value from text.

        Handles currency symbols, commas, and various formats.

        Args:
            text: Text to parse

        Returns:
            Decimal value or None if parsing fails
        """
        if not text:
            return None

        # Remove currency symbols and whitespace
        cleaned = re.sub(r"[$€£¥₱\s]", "", text.strip())

        # Handle comma as thousand separator or decimal separator
        if "," in cleaned and "." in cleaned:
            # Both present: comma is thousand separator
            cleaned = cleaned.replace(",", "")
        elif "," in cleaned:
            # Only comma: check if it's decimal separator
            parts = cleaned.split(",")
            if len(parts) == 2 and len(parts[1]) <= 2:
                # Likely decimal separator
                cleaned = cleaned.replace(",", ".")
            else:
                # Thousand separator
                cleaned = cleaned.replace(",", "")

        try:
            return Decimal(cleaned)
        except (InvalidOperation, ValueError):
            return None

    def extract_line_items(
        self,
        text_blocks: List[Dict[str, Any]]
    ) -> List[LineItemExtraction]:
        """
        Extract line items from table text blocks.

        Args:
            text_blocks: Text blocks from the table region

        Returns:
            List of extracted line items
        """
        if not text_blocks:
            return []

        # Group into rows
        rows = self.group_blocks_by_row(text_blocks)

        if len(rows) < 2:
            return []

        # First row should be headers
        header_row = rows[0]
        columns = self.detect_columns(header_row)

        if not columns or "description" not in columns:
            return []

        # Extract data from remaining rows
        items = []
        line_number = 1

        for row in rows[1:]:
            # Assign each block to a column
            row_data = {}
            for block in row:
                col = self._assign_block_to_column(block, columns)
                if col:
                    row_data[col] = block.get("text", "")

            # Need at least description to be a valid line item
            if "description" not in row_data or not row_data["description"].strip():
                continue

            # Parse values
            description = row_data.get("description", "")
            quantity = self._parse_decimal(row_data.get("quantity", "1")) or Decimal("1")
            unit_price = self._parse_decimal(row_data.get("unit_price", "0")) or Decimal("0")
            amount = self._parse_decimal(row_data.get("amount", "0")) or Decimal("0")

            # Calculate confidence based on what was found
            found_fields = sum(1 for k in ["description", "quantity", "unit_price", "amount"] if k in row_data)
            confidence = found_fields / 4.0

            # Create line item
            item = LineItemExtraction(
                line_number=line_number,
                description=description,
                quantity=quantity,
                unit_price=unit_price,
                amount=amount,
                confidence=confidence
            )

            items.append(item)
            line_number += 1

        return items

    def validate_line_item(self, item: LineItemExtraction) -> bool:
        """
        Validate a single line item's calculations.

        Checks if amount equals quantity * unit_price within tolerance.

        Args:
            item: Line item to validate

        Returns:
            True if valid, False otherwise
        """
        return item.validate_amount()

    def validate_all_items(self, items: List[LineItemExtraction]) -> bool:
        """
        Validate all line items in a list.

        Args:
            items: List of line items to validate

        Returns:
            True if all items are valid, False otherwise
        """
        if not items:
            return True

        return all(self.validate_line_item(item) for item in items)

    def extract_from_document(
        self,
        text_blocks: List[Dict[str, Any]]
    ) -> List[LineItemExtraction]:
        """
        Extract all line items from a document.

        Main entry point that combines table detection and item extraction.

        Args:
            text_blocks: All text blocks from the document

        Returns:
            List of extracted line items
        """
        # Detect table region
        table_region = self.detect_table_region(text_blocks)

        if table_region is None:
            return []

        # Filter blocks within table region
        table_blocks = []
        for block in text_blocks:
            bbox = block.get("bbox", {})
            y = bbox.get("y0", 0)

            # Include blocks within table y-range
            if table_region.bbox.y0 <= y <= table_region.bbox.y1:
                table_blocks.append(block)

        # Extract line items from table blocks
        items = self.extract_line_items(table_blocks)

        return items


__all__ = [
    "LineItemExtractor",
    "TableRegion",
    "TextBlock",
]
