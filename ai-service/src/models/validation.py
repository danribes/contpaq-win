"""
T020 - Validation Models

Pydantic models for validation endpoints including:
- RFC validation request/response
- CFDI validation request/response
"""

from typing import Optional, List
from pydantic import BaseModel, Field


class RfcValidationRequest(BaseModel):
    """Request model for RFC validation."""

    rfc: str = Field(
        ...,
        description="RFC to validate (12 or 13 characters)",
        min_length=1,
        max_length=20,
    )


class RfcValidationResponse(BaseModel):
    """Response model for RFC validation."""

    valid: bool = Field(
        ...,
        description="Whether the RFC is valid",
    )

    rfc_type: Optional[str] = Field(
        default=None,
        description="Type of RFC: 'persona_fisica' (13 chars) or 'persona_moral' (12 chars)",
    )

    normalized_rfc: Optional[str] = Field(
        default=None,
        description="Normalized (uppercase, trimmed) RFC",
    )

    error: Optional[str] = Field(
        default=None,
        description="Error message in Spanish if validation fails",
    )


class CfdiValidationRequest(BaseModel):
    """Request model for CFDI validation."""

    vendor_rfc: str = Field(
        ...,
        description="Vendor RFC (12 or 13 characters)",
    )

    invoice_number: str = Field(
        ...,
        description="Invoice number/folio",
    )

    invoice_date: str = Field(
        ...,
        description="Invoice date (ISO format preferred)",
    )

    subtotal: float = Field(
        ...,
        description="Subtotal amount before IVA",
        ge=0,
    )

    iva_amount: float = Field(
        ...,
        description="IVA (VAT) amount",
        ge=0,
    )

    total: float = Field(
        ...,
        description="Total amount (subtotal + IVA)",
    )

    iva_rate: Optional[float] = Field(
        default=0.16,
        description="IVA rate (default 16% = 0.16). Use 0.0 for exempt invoices.",
        ge=0,
        le=1,
    )


class CfdiValidationResponse(BaseModel):
    """Response model for CFDI validation."""

    valid: bool = Field(
        ...,
        description="Whether the CFDI is valid",
    )

    errors: List[str] = Field(
        default_factory=list,
        description="List of validation errors in Spanish",
    )

    warnings: List[str] = Field(
        default_factory=list,
        description="List of validation warnings in Spanish",
    )
