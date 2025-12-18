"""
ContPAQ-Win AI Service - Utilities Package

This package contains shared utility functions and helper modules used
across the AI service for common operations.

Modules:
    confidence: Confidence score utilities for extraction results
        - Threshold constants (HIGH=90%, MEDIUM=70%)
        - get_confidence_level() - Maps score to level (high/medium/low)
        - Color mapping for UI indicators

    validation: RFC and CFDI validation utilities
        - validate_rfc() - Validates Mexican RFC format
        - validate_cfdi() - Validates CFDI amounts and required fields
        - Support for persona física (13 chars) and persona moral (12 chars)

    logging_config: JSON structured logging configuration
        - JSONFormatter - Formats logs as JSON
        - setup_logging() - Configure logging system
        - get_logger() - Get configured logger instance
        - Log rotation and file logging support

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
from .validation import (
    validate_rfc,
    validate_cfdi,
)
from .logging_config import (
    JSONFormatter,
    get_log_directory,
    setup_logging,
    get_logger,
    log_with_context,
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
    # Validation utilities
    "validate_rfc",
    "validate_cfdi",
    # Logging utilities
    "JSONFormatter",
    "get_log_directory",
    "setup_logging",
    "get_logger",
    "log_with_context",
]
