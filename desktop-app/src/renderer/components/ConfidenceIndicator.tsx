/**
 * T018.1 - ConfidenceIndicator Component
 *
 * Displays a colored dot indicating confidence level:
 * - Green (≥90%): High confidence - can trust this value
 * - Orange (70-89%): Medium confidence - may need review
 * - Red (<70%): Low confidence - requires verification
 *
 * Uses Tailwind CSS for styling.
 */

import React, { useState, useCallback } from 'react';
import { CONFIDENCE_THRESHOLDS, getConfidenceLevel, type ConfidenceLevel } from '../types';

// =============================================================================
// Types
// =============================================================================

/**
 * Size variants for the confidence dot
 */
export type ConfidenceIndicatorSize = 'sm' | 'md' | 'lg';

/**
 * Props for the ConfidenceIndicator component
 */
export interface ConfidenceIndicatorProps {
  /** Confidence value (0-100) */
  confidence: number;
  /** Whether to show percentage next to the dot */
  showPercentage?: boolean;
  /** Whether to show the level label (Alto/Medio/Bajo) */
  showLabel?: boolean;
  /** Size of the indicator dot */
  size?: ConfidenceIndicatorSize;
}

// =============================================================================
// Configuration
// =============================================================================

/**
 * Spanish labels for confidence levels
 */
const LEVEL_LABELS: Record<ConfidenceLevel, string> = {
  high: 'Alto',
  medium: 'Medio',
  low: 'Bajo',
};

/**
 * Tooltip explanations for each confidence level (Spanish)
 */
const TOOLTIP_EXPLANATIONS: Record<ConfidenceLevel, string> = {
  high: 'Confianza alta - Este valor es confiable',
  medium: 'Confianza media - Puede necesitar verificar este valor',
  low: 'Confianza baja - Requiere verificación manual',
};

/**
 * Color classes for each confidence level
 */
const DOT_COLORS: Record<ConfidenceLevel, string> = {
  high: 'bg-green-500',
  medium: 'bg-orange-500',
  low: 'bg-red-500',
};

/**
 * Size classes for the dot
 */
const SIZE_CLASSES: Record<ConfidenceIndicatorSize, string> = {
  sm: 'w-2 h-2',
  md: 'w-3 h-3',
  lg: 'w-4 h-4',
};

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Normalize confidence value to 0-100 range
 */
function normalizeConfidence(confidence: number): number {
  if (confidence < 0) return 0;
  if (confidence > 100) return 100;
  return Math.round(confidence);
}

// =============================================================================
// Component
// =============================================================================

/**
 * ConfidenceIndicator component for displaying extraction confidence levels
 *
 * @example
 * ```tsx
 * // Basic usage
 * <ConfidenceIndicator confidence={85} />
 *
 * // With percentage
 * <ConfidenceIndicator confidence={92} showPercentage />
 *
 * // With label
 * <ConfidenceIndicator confidence={75} showLabel />
 *
 * // Larger size
 * <ConfidenceIndicator confidence={50} size="lg" />
 * ```
 */
export function ConfidenceIndicator({
  confidence,
  showPercentage = false,
  showLabel = false,
  size = 'sm',
}: ConfidenceIndicatorProps): JSX.Element {
  const [showTooltip, setShowTooltip] = useState(false);

  // Normalize and get level
  const normalizedConfidence = normalizeConfidence(confidence);
  const level = getConfidenceLevel(normalizedConfidence);

  // Get styling based on level
  const dotColor = DOT_COLORS[level];
  const sizeClass = SIZE_CLASSES[size];
  const label = LEVEL_LABELS[level];
  const explanation = TOOLTIP_EXPLANATIONS[level];

  /**
   * Handle mouse enter
   */
  const handleMouseEnter = useCallback(() => {
    setShowTooltip(true);
  }, []);

  /**
   * Handle mouse leave
   */
  const handleMouseLeave = useCallback(() => {
    setShowTooltip(false);
  }, []);

  return (
    <div
      data-testid="confidence-indicator"
      className="inline-flex items-center gap-1 cursor-pointer relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      aria-label={`Confianza: ${normalizedConfidence}% - ${label}`}
    >
      {/* Colored Dot */}
      <span
        data-testid="confidence-dot"
        className={`${dotColor} ${sizeClass} rounded-full`}
      />

      {/* Percentage Text */}
      {showPercentage && (
        <span className="text-sm text-gray-600">
          {normalizedConfidence}%
        </span>
      )}

      {/* Level Label */}
      {showLabel && (
        <span className="text-sm text-gray-600">
          {label}
        </span>
      )}

      {/* Tooltip */}
      {showTooltip && (
        <div
          data-testid="confidence-tooltip"
          className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded shadow-lg whitespace-nowrap z-50"
        >
          <div className="font-medium">{normalizedConfidence}% - {label}</div>
          <div className="text-gray-300 mt-1">{explanation}</div>
          {/* Tooltip arrow */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800" />
        </div>
      )}
    </div>
  );
}

export default ConfidenceIndicator;
