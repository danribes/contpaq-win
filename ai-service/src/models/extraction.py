"""
Extraction Models - T013.1

Pydantic models for AI-extracted invoice data, including:
- BoundingBox: Position coordinates for extracted text
- ExtractionField: Single extracted field with confidence
- LineItemExtraction: Invoice line item data
- InvoiceExtraction: Complete invoice extraction response

These models are used for:
- Structuring AI model output
- API response serialization
- Data validation
"""

from datetime import date
from decimal import Decimal
from typing import List, Optional

from pydantic import BaseModel, Field, field_validator


class BoundingBox(BaseModel):
    """
    Bounding box coordinates for an extracted text region.

    Coordinates are in pixels relative to the source image/page.
    Origin (0,0) is at top-left corner.

    Attributes:
        x0: Left edge x-coordinate
        y0: Top edge y-coordinate
        x1: Right edge x-coordinate
        y1: Bottom edge y-coordinate
        page: Page number (0-indexed) for multi-page documents
    """
    x0: float = Field(..., ge=0, description="Left edge x-coordinate")
    y0: float = Field(..., ge=0, description="Top edge y-coordinate")
    x1: float = Field(..., ge=0, description="Right edge x-coordinate")
    y1: float = Field(..., ge=0, description="Bottom edge y-coordinate")
    page: int = Field(default=0, ge=0, description="Page number (0-indexed)")

    @field_validator('x1')
    @classmethod
    def x1_greater_than_x0(cls, v: float, info) -> float:
        """Validate that x1 >= x0."""
        if 'x0' in info.data and v < info.data['x0']:
            raise ValueError('x1 must be >= x0')
        return v

    @field_validator('y1')
    @classmethod
    def y1_greater_than_y0(cls, v: float, info) -> float:
        """Validate that y1 >= y0."""
        if 'y0' in info.data and v < info.data['y0']:
            raise ValueError('y1 must be >= y0')
        return v

    @property
    def width(self) -> float:
        """Calculate bounding box width."""
        return self.x1 - self.x0

    @property
    def height(self) -> float:
        """Calculate bounding box height."""
        return self.y1 - self.y0

    @property
    def area(self) -> float:
        """Calculate bounding box area."""
        return self.width * self.height


class ExtractionField(BaseModel):
    """
    A single extracted field with its value, location, and confidence.

    Used for header-level invoice fields like vendor name, RFC, dates, etc.

    Attributes:
        field_name: Name/type of the extracted field
        value: Extracted string value
        confidence: AI confidence score (0.0 to 1.0)
        bbox: Optional bounding box location in source document
        raw_text: Original text before normalization (if different)
    """
    field_name: str = Field(..., min_length=1, description="Field identifier")
    value: str = Field(..., description="Extracted value")
    confidence: float = Field(
        ...,
        ge=0.0,
        le=1.0,
        description="Confidence score (0.0-1.0)"
    )
    bbox: Optional[BoundingBox] = Field(
        default=None,
        description="Location in source document"
    )
    raw_text: Optional[str] = Field(
        default=None,
        description="Original text before normalization"
    )

    @property
    def confidence_percentage(self) -> float:
        """Return confidence as percentage (0-100)."""
        return self.confidence * 100


class LineItemExtraction(BaseModel):
    """
    An extracted invoice line item.

    Represents a single row from an invoice's item table.

    Attributes:
        line_number: Position in the invoice (1-indexed)
        description: Product/service description
        quantity: Number of units
        unit_price: Price per unit
        amount: Total for this line (quantity * unit_price)
        confidence: Overall confidence for this line item
        bbox: Bounding box covering the entire line
    """
    line_number: int = Field(..., ge=1, description="Line position (1-indexed)")
    description: str = Field(..., description="Product/service description")
    quantity: Decimal = Field(
        ...,
        ge=0,
        description="Number of units"
    )
    unit_price: Decimal = Field(
        ...,
        ge=0,
        description="Price per unit"
    )
    amount: Decimal = Field(
        ...,
        ge=0,
        description="Line total (quantity * unit_price)"
    )
    confidence: float = Field(
        ...,
        ge=0.0,
        le=1.0,
        description="Confidence score (0.0-1.0)"
    )
    bbox: Optional[BoundingBox] = Field(
        default=None,
        description="Location in source document"
    )

    @field_validator('quantity', 'unit_price', 'amount', mode='before')
    @classmethod
    def convert_to_decimal(cls, v):
        """Convert numeric values to Decimal."""
        if isinstance(v, (int, float, str)):
            return Decimal(str(v))
        return v

    def validate_amount(self) -> bool:
        """Check if amount equals quantity * unit_price."""
        expected = self.quantity * self.unit_price
        # Allow small rounding difference
        return abs(self.amount - expected) < Decimal('0.01')


class InvoiceExtraction(BaseModel):
    """
    Complete invoice extraction result.

    Contains all extracted fields, line items, and metadata
    from processing an invoice document.

    Attributes:
        source_file: Original filename/path
        source_type: "text" or "scanned"
        vendor_rfc: Vendor's RFC (tax ID)
        vendor_name: Vendor's business name
        invoice_number: Invoice/folio number
        invoice_date: Invoice date
        subtotal: Sum before taxes
        iva_amount: IVA (VAT) amount
        total: Final total amount
        line_items: List of extracted line items
        fields: All extracted fields with metadata
        overall_confidence: Average confidence across all fields
        processing_time_ms: Time taken to process (milliseconds)
    """
    # Source information
    source_file: str = Field(..., description="Original filename")
    source_type: str = Field(
        ...,
        pattern="^(text|scanned)$",
        description="PDF type: 'text' or 'scanned'"
    )

    # Header fields
    vendor_rfc: Optional[ExtractionField] = Field(
        default=None,
        description="Vendor RFC (tax ID)"
    )
    vendor_name: Optional[ExtractionField] = Field(
        default=None,
        description="Vendor business name"
    )
    invoice_number: Optional[ExtractionField] = Field(
        default=None,
        description="Invoice/folio number"
    )
    invoice_date: Optional[ExtractionField] = Field(
        default=None,
        description="Invoice date"
    )

    # Amounts
    subtotal: Optional[ExtractionField] = Field(
        default=None,
        description="Subtotal before taxes"
    )
    iva_amount: Optional[ExtractionField] = Field(
        default=None,
        description="IVA (VAT) amount"
    )
    total: Optional[ExtractionField] = Field(
        default=None,
        description="Total amount"
    )

    # Line items
    line_items: List[LineItemExtraction] = Field(
        default_factory=list,
        description="Extracted line items"
    )

    # All fields (for iteration)
    fields: List[ExtractionField] = Field(
        default_factory=list,
        description="All extracted fields"
    )

    # Metadata
    overall_confidence: float = Field(
        default=0.0,
        ge=0.0,
        le=1.0,
        description="Average confidence"
    )
    processing_time_ms: Optional[int] = Field(
        default=None,
        ge=0,
        description="Processing time in milliseconds"
    )

    def calculate_overall_confidence(self) -> float:
        """Calculate average confidence from all fields."""
        all_confidences = []

        # Header fields
        for field in [
            self.vendor_rfc, self.vendor_name, self.invoice_number,
            self.invoice_date, self.subtotal, self.iva_amount, self.total
        ]:
            if field is not None:
                all_confidences.append(field.confidence)

        # Line items
        for item in self.line_items:
            all_confidences.append(item.confidence)

        if all_confidences:
            return sum(all_confidences) / len(all_confidences)
        return 0.0

    def get_field_by_name(self, name: str) -> Optional[ExtractionField]:
        """Get a specific field by name."""
        for field in self.fields:
            if field.field_name == name:
                return field
        return None

    @property
    def has_required_fields(self) -> bool:
        """Check if minimum required fields are present."""
        return all([
            self.vendor_rfc is not None,
            self.invoice_number is not None,
            self.total is not None
        ])


__all__ = [
    "BoundingBox",
    "ExtractionField",
    "LineItemExtraction",
    "InvoiceExtraction",
]
