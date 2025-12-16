"""
ContPAQ-Win AI Service - Data Models Package

This package contains Pydantic models and data structures used throughout
the AI service for invoice processing.

Modules:
    extraction: Models for AI-extracted invoice data (BoundingBox, ExtractionField,
                LineItemExtraction, InvoiceExtraction)
    validation: Request/response models for validation endpoints

All models use Pydantic for:
    - Data validation and parsing
    - JSON serialization/deserialization
    - OpenAPI schema generation for FastAPI
"""

__all__ = []
