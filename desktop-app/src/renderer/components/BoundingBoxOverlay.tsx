/**
 * BoundingBoxOverlay Component
 *
 * Renders colored bounding boxes over a PDF to highlight extracted fields.
 * Box colors indicate confidence levels:
 * - Green (≥90%): High confidence
 * - Orange (70-89%): Medium confidence
 * - Red (<70%): Low confidence
 *
 * Uses Tailwind CSS for styling.
 */

import { useState, useCallback } from 'react';
import type { ExtractionField } from '../types';

/**
 * Confidence thresholds for color coding
 */
const CONFIDENCE_HIGH = 90;
const CONFIDENCE_MEDIUM = 70;

/**
 * Props for the BoundingBoxOverlay component
 */
export interface BoundingBoxOverlayProps {
  /** Array of extraction fields with bounding boxes */
  fields: ExtractionField[];
  /** Current zoom scale (1 = 100%) */
  scale: number;
  /** Currently selected field name */
  selectedField?: string;
  /** Callback when a field box is clicked */
  onFieldClick?: (fieldName: string) => void;
  /** Callback when hovering over a field box */
  onFieldHover?: (fieldName: string | null) => void;
  /** Whether to show tooltips on hover */
  showTooltip?: boolean;
}

/**
 * Get Tailwind classes for border color based on confidence
 */
function getBorderColorClass(confidence: number): string {
  if (confidence >= CONFIDENCE_HIGH) {
    return 'border-green-500';
  }
  if (confidence >= CONFIDENCE_MEDIUM) {
    return 'border-orange-500';
  }
  return 'border-red-500';
}

/**
 * Get Tailwind classes for background color based on confidence
 */
function getBackgroundColorClass(confidence: number): string {
  if (confidence >= CONFIDENCE_HIGH) {
    return 'bg-green-500/20';
  }
  if (confidence >= CONFIDENCE_MEDIUM) {
    return 'bg-orange-500/20';
  }
  return 'bg-red-500/20';
}

/**
 * Props for individual bounding box
 */
interface BoxProps {
  field: ExtractionField;
  scale: number;
  isSelected: boolean;
  isHovered: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  showTooltip: boolean;
}

/**
 * Individual bounding box component
 */
function Box({
  field,
  scale,
  isSelected,
  isHovered,
  onClick,
  onMouseEnter,
  onMouseLeave,
  showTooltip,
}: BoxProps): JSX.Element | null {
  if (!field.bbox) {
    return null;
  }

  const { x, y, width, height } = field.bbox;

  // Scale the position and dimensions
  const scaledX = x * scale;
  const scaledY = y * scale;
  const scaledWidth = width * scale;
  const scaledHeight = height * scale;

  const borderColor = getBorderColorClass(field.confidence);
  const backgroundColor = getBackgroundColorClass(field.confidence);

  // Determine ring styling for selection/hover
  const ringClasses = isSelected
    ? 'ring-2 ring-blue-500'
    : isHovered
    ? 'ring-2 ring-gray-400'
    : '';

  return (
    <div
      data-testid={`bbox-${field.fieldName}`}
      className={`
        absolute
        border-2
        ${borderColor}
        ${backgroundColor}
        ${ringClasses}
        cursor-pointer
        transition-all
        duration-150
      `}
      style={{
        left: `${scaledX}px`,
        top: `${scaledY}px`,
        width: `${scaledWidth}px`,
        height: `${scaledHeight}px`,
      }}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* Tooltip */}
      {showTooltip && isHovered && (
        <div
          data-testid="bbox-tooltip"
          className="absolute bottom-full left-0 mb-1 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap z-10"
        >
          {field.fieldName}
        </div>
      )}
    </div>
  );
}

/**
 * BoundingBoxOverlay component for displaying extraction field highlights
 *
 * @example
 * ```tsx
 * <BoundingBoxOverlay
 *   fields={extractionFields}
 *   scale={1.5}
 *   selectedField="vendor_rfc"
 *   onFieldClick={(name) => setSelectedField(name)}
 * />
 * ```
 */
export function BoundingBoxOverlay({
  fields,
  scale,
  selectedField,
  onFieldClick,
  onFieldHover,
  showTooltip = false,
}: BoundingBoxOverlayProps): JSX.Element {
  const [hoveredField, setHoveredField] = useState<string | null>(null);

  /**
   * Handle box click
   */
  const handleClick = useCallback(
    (fieldName: string) => {
      onFieldClick?.(fieldName);
    },
    [onFieldClick]
  );

  /**
   * Handle mouse enter
   */
  const handleMouseEnter = useCallback(
    (fieldName: string) => {
      setHoveredField(fieldName);
      onFieldHover?.(fieldName);
    },
    [onFieldHover]
  );

  /**
   * Handle mouse leave
   */
  const handleMouseLeave = useCallback(() => {
    setHoveredField(null);
    onFieldHover?.(null);
  }, [onFieldHover]);

  return (
    <div
      data-testid="bbox-overlay"
      className="absolute inset-0 pointer-events-none"
    >
      {fields.map((field) => {
        if (!field.bbox) return null;

        return (
          <div key={field.fieldName} className="pointer-events-auto">
            <Box
              field={field}
              scale={scale}
              isSelected={selectedField === field.fieldName}
              isHovered={hoveredField === field.fieldName}
              onClick={() => handleClick(field.fieldName)}
              onMouseEnter={() => handleMouseEnter(field.fieldName)}
              onMouseLeave={handleMouseLeave}
              showTooltip={showTooltip}
            />
          </div>
        );
      })}
    </div>
  );
}

export default BoundingBoxOverlay;
