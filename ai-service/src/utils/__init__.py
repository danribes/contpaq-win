"""
ContPAQ-Win AI Service - Utilities Package

This package contains shared utility functions and helper modules used
across the AI service for common operations.

Modules:
    confidence: Confidence score utilities for extraction results
        - Threshold constants (HIGH=90%, MEDIUM=70%)
        - get_confidence_level() - Maps score to level (high/medium/low)
        - Color mapping for UI indicators

Planned utilities:
    - File handling helpers
    - Date/time formatting for Mexican locale
    - Number formatting for currency amounts
    - Logging configuration helpers

All utilities are designed to be:
    - Pure functions where possible (no side effects)
    - Well-documented with type hints
    - Thoroughly tested
"""

from .confidence import (
    CONFIDENCE_HIGH,
    CONFIDENCE_MEDIUM,
    CONFIDENCE_HIGH_DECIMAL,
    CONFIDENCE_MEDIUM_DECIMAL,
    CONFIDENCE_COLORS,
    CONFIDENCE_LABELS,
    ConfidenceLevel,
    get_confidence_level,
    get_confidence_level_decimal,
    get_confidence_color,
    get_confidence_label,
    normalize_confidence,
    decimal_to_percentage,
    percentage_to_decimal,
)

__all__ = [
    # Confidence utilities
    "CONFIDENCE_HIGH",
    "CONFIDENCE_MEDIUM",
    "CONFIDENCE_HIGH_DECIMAL",
    "CONFIDENCE_MEDIUM_DECIMAL",
    "CONFIDENCE_COLORS",
    "CONFIDENCE_LABELS",
    "ConfidenceLevel",
    "get_confidence_level",
    "get_confidence_level_decimal",
    "get_confidence_color",
    "get_confidence_label",
    "normalize_confidence",
    "decimal_to_percentage",
    "percentage_to_decimal",
]
