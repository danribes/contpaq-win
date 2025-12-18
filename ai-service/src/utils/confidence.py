"""
T018.2 - Confidence Utilities

Utilities for working with extraction confidence scores.
Provides threshold constants, level classification, and color mapping.

This module mirrors the TypeScript implementation in:
desktop-app/src/renderer/types/index.ts

Confidence Levels:
- HIGH (>=90%): Green - Can trust this value
- MEDIUM (70-89%): Orange - May need review
- LOW (<70%): Red - Requires verification

Usage:
    from src.utils.confidence import (
        get_confidence_level,
        get_confidence_color,
        ConfidenceLevel,
    )

    level = get_confidence_level(85)  # ConfidenceLevel.MEDIUM
    color = get_confidence_color(level)  # "orange"
"""

from enum import Enum
from typing import Dict

# =============================================================================
# Threshold Constants (Percentage Scale: 0-100)
# =============================================================================

CONFIDENCE_HIGH: int = 90
"""Minimum percentage for high confidence (green)."""

CONFIDENCE_MEDIUM: int = 70
"""Minimum percentage for medium confidence (orange)."""

# Decimal versions for 0-1 scale
CONFIDENCE_HIGH_DECIMAL: float = 0.90
"""Minimum decimal for high confidence (green)."""

CONFIDENCE_MEDIUM_DECIMAL: float = 0.70
"""Minimum decimal for medium confidence (orange)."""


# =============================================================================
# Confidence Level Enum
# =============================================================================

class ConfidenceLevel(str, Enum):
    """
    Classification of confidence scores into levels.

    Used for:
    - UI color coding
    - Filtering fields that need review
    - Prioritizing manual verification

    Attributes:
        HIGH: >=90% - Can trust this value
        MEDIUM: 70-89% - May need review
        LOW: <70% - Requires verification
    """
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


# =============================================================================
# Color Mapping
# =============================================================================

CONFIDENCE_COLORS: Dict[ConfidenceLevel, str] = {
    ConfidenceLevel.HIGH: "green",
    ConfidenceLevel.MEDIUM: "orange",
    ConfidenceLevel.LOW: "red",
}
"""Map confidence levels to UI colors."""


# =============================================================================
# Label Mapping (Spanish)
# =============================================================================

CONFIDENCE_LABELS: Dict[ConfidenceLevel, str] = {
    ConfidenceLevel.HIGH: "Alto",
    ConfidenceLevel.MEDIUM: "Medio",
    ConfidenceLevel.LOW: "Bajo",
}
"""Map confidence levels to Spanish labels."""


# =============================================================================
# Functions
# =============================================================================

def get_confidence_level(confidence: int | float) -> ConfidenceLevel:
    """
    Get the confidence level for a percentage score (0-100).

    Args:
        confidence: Confidence score as percentage (0-100)

    Returns:
        ConfidenceLevel enum value

    Examples:
        >>> get_confidence_level(95)
        ConfidenceLevel.HIGH
        >>> get_confidence_level(80)
        ConfidenceLevel.MEDIUM
        >>> get_confidence_level(50)
        ConfidenceLevel.LOW
    """
    if confidence >= CONFIDENCE_HIGH:
        return ConfidenceLevel.HIGH
    if confidence >= CONFIDENCE_MEDIUM:
        return ConfidenceLevel.MEDIUM
    return ConfidenceLevel.LOW


def get_confidence_level_decimal(confidence: float) -> ConfidenceLevel:
    """
    Get the confidence level for a decimal score (0.0-1.0).

    Args:
        confidence: Confidence score as decimal (0.0-1.0)

    Returns:
        ConfidenceLevel enum value

    Examples:
        >>> get_confidence_level_decimal(0.95)
        ConfidenceLevel.HIGH
        >>> get_confidence_level_decimal(0.80)
        ConfidenceLevel.MEDIUM
        >>> get_confidence_level_decimal(0.50)
        ConfidenceLevel.LOW
    """
    if confidence >= CONFIDENCE_HIGH_DECIMAL:
        return ConfidenceLevel.HIGH
    if confidence >= CONFIDENCE_MEDIUM_DECIMAL:
        return ConfidenceLevel.MEDIUM
    return ConfidenceLevel.LOW


def get_confidence_color(level: ConfidenceLevel) -> str:
    """
    Get the UI color for a confidence level.

    Args:
        level: ConfidenceLevel enum value

    Returns:
        Color name (green, orange, red)

    Examples:
        >>> get_confidence_color(ConfidenceLevel.HIGH)
        'green'
        >>> get_confidence_color(ConfidenceLevel.LOW)
        'red'
    """
    return CONFIDENCE_COLORS[level]


def get_confidence_label(level: ConfidenceLevel) -> str:
    """
    Get the Spanish label for a confidence level.

    Args:
        level: ConfidenceLevel enum value

    Returns:
        Spanish label (Alto, Medio, Bajo)

    Examples:
        >>> get_confidence_label(ConfidenceLevel.HIGH)
        'Alto'
        >>> get_confidence_label(ConfidenceLevel.LOW)
        'Bajo'
    """
    return CONFIDENCE_LABELS[level]


def normalize_confidence(confidence: int | float) -> int:
    """
    Normalize a confidence value to valid percentage range (0-100).

    - Clamps negative values to 0
    - Clamps values > 100 to 100
    - Rounds decimal values to nearest integer

    Args:
        confidence: Raw confidence value

    Returns:
        Normalized integer percentage (0-100)

    Examples:
        >>> normalize_confidence(-5)
        0
        >>> normalize_confidence(150)
        100
        >>> normalize_confidence(85.7)
        86
    """
    if confidence < 0:
        return 0
    if confidence > 100:
        return 100
    return round(confidence)


def decimal_to_percentage(decimal: float) -> int:
    """
    Convert decimal confidence (0-1) to percentage (0-100).

    Args:
        decimal: Confidence as decimal (0.0-1.0)

    Returns:
        Confidence as integer percentage

    Examples:
        >>> decimal_to_percentage(0.85)
        85
        >>> decimal_to_percentage(1.0)
        100
    """
    return round(decimal * 100)


def percentage_to_decimal(percentage: int | float) -> float:
    """
    Convert percentage confidence (0-100) to decimal (0-1).

    Args:
        percentage: Confidence as percentage (0-100)

    Returns:
        Confidence as decimal

    Examples:
        >>> percentage_to_decimal(85)
        0.85
        >>> percentage_to_decimal(100)
        1.0
    """
    return percentage / 100


# =============================================================================
# Module Exports
# =============================================================================

__all__ = [
    # Constants
    "CONFIDENCE_HIGH",
    "CONFIDENCE_MEDIUM",
    "CONFIDENCE_HIGH_DECIMAL",
    "CONFIDENCE_MEDIUM_DECIMAL",
    "CONFIDENCE_COLORS",
    "CONFIDENCE_LABELS",
    # Enum
    "ConfidenceLevel",
    # Functions
    "get_confidence_level",
    "get_confidence_level_decimal",
    "get_confidence_color",
    "get_confidence_label",
    "normalize_confidence",
    "decimal_to_percentage",
    "percentage_to_decimal",
]
