"""
T020 - Validation Models

Pydantic models for validation endpoints including:
- RFC validation request/response
- CFDI validation request/response (future)
"""

from typing import Optional
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
