"""
T018.2 - Confidence Utilities Tests

Tests for the confidence module that:
- Defines threshold constants (90, 70)
- Implements get_confidence_level() function
- Provides color mapping for UI indicators

These utilities mirror the TypeScript implementation in desktop-app.
"""

import pytest


class TestConfidenceThresholds:
    """Test confidence threshold constants."""

    def test_high_threshold_is_90(self):
        """High confidence threshold should be 90%."""
        from src.utils.confidence import CONFIDENCE_HIGH
        assert CONFIDENCE_HIGH == 90

    def test_medium_threshold_is_70(self):
        """Medium confidence threshold should be 70%."""
        from src.utils.confidence import CONFIDENCE_MEDIUM
        assert CONFIDENCE_MEDIUM == 70

    def test_thresholds_as_decimals_exported(self):
        """Should export decimal versions for 0-1 scale."""
        from src.utils.confidence import CONFIDENCE_HIGH_DECIMAL, CONFIDENCE_MEDIUM_DECIMAL
        assert CONFIDENCE_HIGH_DECIMAL == 0.90
        assert CONFIDENCE_MEDIUM_DECIMAL == 0.70


class TestConfidenceLevel:
    """Test ConfidenceLevel enum."""

    def test_level_enum_exists(self):
        """ConfidenceLevel enum should be exported."""
        from src.utils.confidence import ConfidenceLevel
        assert ConfidenceLevel is not None

    def test_has_high_level(self):
        """Should have HIGH level."""
        from src.utils.confidence import ConfidenceLevel
        assert ConfidenceLevel.HIGH is not None
        assert ConfidenceLevel.HIGH.value == "high"

    def test_has_medium_level(self):
        """Should have MEDIUM level."""
        from src.utils.confidence import ConfidenceLevel
        assert ConfidenceLevel.MEDIUM is not None
        assert ConfidenceLevel.MEDIUM.value == "medium"

    def test_has_low_level(self):
        """Should have LOW level."""
        from src.utils.confidence import ConfidenceLevel
        assert ConfidenceLevel.LOW is not None
        assert ConfidenceLevel.LOW.value == "low"


class TestGetConfidenceLevel:
    """Test get_confidence_level() function."""

    # High confidence tests (>= 90%)
    def test_100_is_high(self):
        """100% confidence should be high."""
        from src.utils.confidence import get_confidence_level, ConfidenceLevel
        assert get_confidence_level(100) == ConfidenceLevel.HIGH

    def test_95_is_high(self):
        """95% confidence should be high."""
        from src.utils.confidence import get_confidence_level, ConfidenceLevel
        assert get_confidence_level(95) == ConfidenceLevel.HIGH

    def test_90_is_high(self):
        """Exactly 90% confidence should be high."""
        from src.utils.confidence import get_confidence_level, ConfidenceLevel
        assert get_confidence_level(90) == ConfidenceLevel.HIGH

    # Medium confidence tests (70-89%)
    def test_89_is_medium(self):
        """89% confidence should be medium."""
        from src.utils.confidence import get_confidence_level, ConfidenceLevel
        assert get_confidence_level(89) == ConfidenceLevel.MEDIUM

    def test_80_is_medium(self):
        """80% confidence should be medium."""
        from src.utils.confidence import get_confidence_level, ConfidenceLevel
        assert get_confidence_level(80) == ConfidenceLevel.MEDIUM

    def test_70_is_medium(self):
        """Exactly 70% confidence should be medium."""
        from src.utils.confidence import get_confidence_level, ConfidenceLevel
        assert get_confidence_level(70) == ConfidenceLevel.MEDIUM

    # Low confidence tests (< 70%)
    def test_69_is_low(self):
        """69% confidence should be low."""
        from src.utils.confidence import get_confidence_level, ConfidenceLevel
        assert get_confidence_level(69) == ConfidenceLevel.LOW

    def test_50_is_low(self):
        """50% confidence should be low."""
        from src.utils.confidence import get_confidence_level, ConfidenceLevel
        assert get_confidence_level(50) == ConfidenceLevel.LOW

    def test_0_is_low(self):
        """0% confidence should be low."""
        from src.utils.confidence import get_confidence_level, ConfidenceLevel
        assert get_confidence_level(0) == ConfidenceLevel.LOW


class TestGetConfidenceLevelDecimal:
    """Test get_confidence_level_decimal() for 0-1 scale."""

    def test_1_0_is_high(self):
        """1.0 confidence should be high."""
        from src.utils.confidence import get_confidence_level_decimal, ConfidenceLevel
        assert get_confidence_level_decimal(1.0) == ConfidenceLevel.HIGH

    def test_0_95_is_high(self):
        """0.95 confidence should be high."""
        from src.utils.confidence import get_confidence_level_decimal, ConfidenceLevel
        assert get_confidence_level_decimal(0.95) == ConfidenceLevel.HIGH

    def test_0_90_is_high(self):
        """Exactly 0.90 confidence should be high."""
        from src.utils.confidence import get_confidence_level_decimal, ConfidenceLevel
        assert get_confidence_level_decimal(0.90) == ConfidenceLevel.HIGH

    def test_0_89_is_medium(self):
        """0.89 confidence should be medium."""
        from src.utils.confidence import get_confidence_level_decimal, ConfidenceLevel
        assert get_confidence_level_decimal(0.89) == ConfidenceLevel.MEDIUM

    def test_0_70_is_medium(self):
        """Exactly 0.70 confidence should be medium."""
        from src.utils.confidence import get_confidence_level_decimal, ConfidenceLevel
        assert get_confidence_level_decimal(0.70) == ConfidenceLevel.MEDIUM

    def test_0_69_is_low(self):
        """0.69 confidence should be low."""
        from src.utils.confidence import get_confidence_level_decimal, ConfidenceLevel
        assert get_confidence_level_decimal(0.69) == ConfidenceLevel.LOW

    def test_0_0_is_low(self):
        """0.0 confidence should be low."""
        from src.utils.confidence import get_confidence_level_decimal, ConfidenceLevel
        assert get_confidence_level_decimal(0.0) == ConfidenceLevel.LOW


class TestConfidenceColors:
    """Test color mapping for confidence levels."""

    def test_get_confidence_color_high(self):
        """High confidence should return green color."""
        from src.utils.confidence import get_confidence_color, ConfidenceLevel
        color = get_confidence_color(ConfidenceLevel.HIGH)
        assert color == "green"

    def test_get_confidence_color_medium(self):
        """Medium confidence should return orange color."""
        from src.utils.confidence import get_confidence_color, ConfidenceLevel
        color = get_confidence_color(ConfidenceLevel.MEDIUM)
        assert color == "orange"

    def test_get_confidence_color_low(self):
        """Low confidence should return red color."""
        from src.utils.confidence import get_confidence_color, ConfidenceLevel
        color = get_confidence_color(ConfidenceLevel.LOW)
        assert color == "red"

    def test_confidence_colors_dict_exported(self):
        """CONFIDENCE_COLORS dict should be exported."""
        from src.utils.confidence import CONFIDENCE_COLORS, ConfidenceLevel
        assert CONFIDENCE_COLORS[ConfidenceLevel.HIGH] == "green"
        assert CONFIDENCE_COLORS[ConfidenceLevel.MEDIUM] == "orange"
        assert CONFIDENCE_COLORS[ConfidenceLevel.LOW] == "red"


class TestConfidenceLabels:
    """Test label mapping for confidence levels (Spanish)."""

    def test_get_confidence_label_high(self):
        """High confidence should return 'Alto'."""
        from src.utils.confidence import get_confidence_label, ConfidenceLevel
        assert get_confidence_label(ConfidenceLevel.HIGH) == "Alto"

    def test_get_confidence_label_medium(self):
        """Medium confidence should return 'Medio'."""
        from src.utils.confidence import get_confidence_label, ConfidenceLevel
        assert get_confidence_label(ConfidenceLevel.MEDIUM) == "Medio"

    def test_get_confidence_label_low(self):
        """Low confidence should return 'Bajo'."""
        from src.utils.confidence import get_confidence_label, ConfidenceLevel
        assert get_confidence_label(ConfidenceLevel.LOW) == "Bajo"


class TestNormalizeConfidence:
    """Test confidence normalization functions."""

    def test_normalize_clamps_negative_to_zero(self):
        """Negative values should be clamped to 0."""
        from src.utils.confidence import normalize_confidence
        assert normalize_confidence(-10) == 0

    def test_normalize_clamps_above_100_to_100(self):
        """Values above 100 should be clamped to 100."""
        from src.utils.confidence import normalize_confidence
        assert normalize_confidence(150) == 100

    def test_normalize_preserves_valid_values(self):
        """Valid values should be preserved."""
        from src.utils.confidence import normalize_confidence
        assert normalize_confidence(85) == 85

    def test_normalize_rounds_decimals(self):
        """Decimal values should be rounded."""
        from src.utils.confidence import normalize_confidence
        assert normalize_confidence(85.7) == 86

    def test_decimal_to_percentage(self):
        """Should convert 0-1 scale to 0-100."""
        from src.utils.confidence import decimal_to_percentage
        assert decimal_to_percentage(0.85) == 85
        assert decimal_to_percentage(1.0) == 100
        assert decimal_to_percentage(0.0) == 0

    def test_percentage_to_decimal(self):
        """Should convert 0-100 scale to 0-1."""
        from src.utils.confidence import percentage_to_decimal
        assert percentage_to_decimal(85) == 0.85
        assert percentage_to_decimal(100) == 1.0
        assert percentage_to_decimal(0) == 0.0


class TestEdgeCases:
    """Test edge cases and boundary conditions."""

    def test_boundary_89_point_9_rounds_to_90(self):
        """89.9 should round to 90 and be high."""
        from src.utils.confidence import get_confidence_level, ConfidenceLevel, normalize_confidence
        normalized = normalize_confidence(89.9)
        assert normalized == 90
        assert get_confidence_level(normalized) == ConfidenceLevel.HIGH

    def test_boundary_69_point_9_rounds_to_70(self):
        """69.9 should round to 70 and be medium."""
        from src.utils.confidence import get_confidence_level, ConfidenceLevel, normalize_confidence
        normalized = normalize_confidence(69.9)
        assert normalized == 70
        assert get_confidence_level(normalized) == ConfidenceLevel.MEDIUM

    def test_boundary_69_point_4_rounds_to_69(self):
        """69.4 should round to 69 and be low."""
        from src.utils.confidence import get_confidence_level, ConfidenceLevel, normalize_confidence
        normalized = normalize_confidence(69.4)
        assert normalized == 69
        assert get_confidence_level(normalized) == ConfidenceLevel.LOW
