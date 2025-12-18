/**
 * T019.1 - FieldInput Component
 *
 * Editable input field for invoice extraction data that:
 * - Displays field label, value, and confidence indicator
 * - Enables inline editing on click
 * - Marks field as "user_verified" after edit
 * - Validates input format (RFC, date, amounts)
 *
 * Uses Tailwind CSS for styling.
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ConfidenceIndicator } from './ConfidenceIndicator';

// =============================================================================
// Types
// =============================================================================

/**
 * Field types for validation
 */
export type FieldType = 'text' | 'rfc' | 'date' | 'amount';

/**
 * Props for FieldInput component
 */
export interface FieldInputProps {
  /** Field label (e.g., "RFC del Proveedor") */
  label: string;
  /** Current field value */
  value: string;
  /** Confidence score (0-100) */
  confidence: number;
  /** Field type for validation */
  fieldType?: FieldType;
  /** Whether the value has been verified by user */
  userVerified?: boolean;
  /** Whether the field is read-only */
  readOnly?: boolean;
  /** Whether the field is currently selected */
  isSelected?: boolean;
  /** Callback when value changes: (newValue, userVerified) */
  onChange: (value: string, userVerified: boolean) => void;
  /** Callback when field is selected */
  onSelect?: () => void;
}

// =============================================================================
// Validation Functions
// =============================================================================

/**
 * Validate RFC format (12 or 13 alphanumeric characters)
 */
function validateRfc(value: string): boolean {
  // RFC can be 12 (company) or 13 (individual) characters
  const rfcRegex = /^[A-Za-z0-9]{12,13}$/;
  return rfcRegex.test(value.trim());
}

/**
 * Validate date format (YYYY-MM-DD or DD/MM/YYYY)
 */
function validateDate(value: string): boolean {
  // ISO format: YYYY-MM-DD
  const isoRegex = /^\d{4}-\d{2}-\d{2}$/;
  // Mexican format: DD/MM/YYYY
  const mxRegex = /^\d{2}\/\d{2}\/\d{4}$/;

  if (isoRegex.test(value)) {
    const date = new Date(value);
    return !isNaN(date.getTime());
  }

  if (mxRegex.test(value)) {
    const parts = value.split('/').map(Number);
    const day = parts[0] ?? 0;
    const month = parts[1] ?? 0;
    const year = parts[2] ?? 0;
    const date = new Date(year, month - 1, day);
    return !isNaN(date.getTime()) && date.getDate() === day;
  }

  return false;
}

/**
 * Validate amount format (decimal number, optional comma separators)
 */
function validateAmount(value: string): boolean {
  // Remove commas for validation
  const cleanValue = value.replace(/,/g, '');
  // Allow negative numbers, decimals
  const amountRegex = /^-?\d+(\.\d{0,2})?$/;
  return amountRegex.test(cleanValue);
}

/**
 * Validate value based on field type
 */
function validateValue(value: string, fieldType: FieldType): string | null {
  if (!value.trim()) return null; // Empty values are allowed

  switch (fieldType) {
    case 'rfc':
      return validateRfc(value) ? null : 'RFC debe tener 12 o 13 caracteres alfanuméricos';
    case 'date':
      return validateDate(value) ? null : 'Formato de fecha inválido (use YYYY-MM-DD o DD/MM/YYYY)';
    case 'amount':
      return validateAmount(value) ? null : 'Monto inválido (use números con hasta 2 decimales)';
    case 'text':
    default:
      return null; // No validation for text
  }
}

// =============================================================================
// Component
// =============================================================================

/**
 * FieldInput component for editable invoice fields
 *
 * @example
 * ```tsx
 * <FieldInput
 *   label="RFC del Proveedor"
 *   value="ABC123456DEF"
 *   confidence={95}
 *   fieldType="rfc"
 *   onChange={(value, verified) => handleChange(value, verified)}
 * />
 * ```
 */
export function FieldInput({
  label,
  value,
  confidence,
  fieldType = 'text',
  userVerified = false,
  readOnly = false,
  isSelected = false,
  onChange,
  onSelect,
}: FieldInputProps): JSX.Element {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Update edit value when prop value changes
  useEffect(() => {
    if (!isEditing) {
      setEditValue(value);
    }
  }, [value, isEditing]);

  // Focus input when entering edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  /**
   * Enter edit mode
   */
  const startEditing = useCallback(() => {
    if (readOnly) return;
    setIsEditing(true);
    setEditValue(value);
    setValidationError(null);
  }, [readOnly, value]);

  /**
   * Save the edited value
   */
  const saveValue = useCallback(() => {
    const trimmedValue = editValue.trim();

    // Validate
    const error = validateValue(trimmedValue, fieldType);
    if (error) {
      setValidationError(error);
      return;
    }

    // Only call onChange if value actually changed
    if (trimmedValue !== value) {
      onChange(trimmedValue, true);
    }

    setIsEditing(false);
    setValidationError(null);
  }, [editValue, fieldType, value, onChange]);

  /**
   * Cancel editing and restore original value
   */
  const cancelEdit = useCallback(() => {
    setIsEditing(false);
    setEditValue(value);
    setValidationError(null);
  }, [value]);

  /**
   * Handle key press in input
   */
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        saveValue();
      } else if (e.key === 'Escape') {
        cancelEdit();
      }
    },
    [saveValue, cancelEdit]
  );

  /**
   * Handle input blur
   */
  const handleBlur = useCallback(() => {
    // Small delay to allow button clicks to register
    setTimeout(() => {
      if (isEditing) {
        saveValue();
      }
    }, 100);
  }, [isEditing, saveValue]);

  /**
   * Handle container click
   */
  const handleContainerClick = useCallback(() => {
    if (onSelect) {
      onSelect();
    }
  }, [onSelect]);

  // Determine container classes
  const containerClasses = [
    'border rounded p-2 transition-all duration-150',
    'hover:bg-gray-50 hover:border-gray-300',
    isSelected ? 'ring-2 ring-blue-500 border-blue-500' : 'border-gray-200',
    readOnly ? 'cursor-default' : 'cursor-pointer',
  ].join(' ');

  return (
    <div
      data-testid="field-input"
      className={containerClasses}
      onClick={handleContainerClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header: Label + Confidence + Verified Badge */}
      <div className="flex items-center justify-between mb-1">
        <label className="text-xs text-gray-500 font-medium">{label}</label>
        <div className="flex items-center gap-2">
          <ConfidenceIndicator confidence={confidence} size="sm" />
          {userVerified && (
            <span
              data-testid="verified-badge"
              className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded"
            >
              ✓ Verificado
            </span>
          )}
        </div>
      </div>

      {/* Value Display / Edit Mode */}
      {isEditing ? (
        <div data-testid="field-input-edit" className="relative">
          <input
            ref={inputRef}
            type="text"
            value={editValue}
            onChange={(e) => {
              setEditValue(e.target.value);
              setValidationError(null);
            }}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            className={`w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 ${
              validationError
                ? 'border-red-500 focus:ring-red-500'
                : 'border-blue-500 focus:ring-blue-500'
            }`}
          />
          {validationError && (
            <div
              data-testid="validation-error"
              className="text-xs text-red-600 mt-1"
            >
              {validationError}
            </div>
          )}
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <div
            data-testid="field-value"
            onClick={(e) => {
              e.stopPropagation();
              startEditing();
            }}
            className="text-sm font-medium text-gray-900 flex-1"
          >
            {value || (
              <span className="text-gray-400 italic">Sin valor</span>
            )}
          </div>
          {isHovered && !readOnly && (
            <button
              data-testid="edit-button"
              onClick={(e) => {
                e.stopPropagation();
                startEditing();
              }}
              className="text-xs text-blue-600 hover:text-blue-800 ml-2"
            >
              Editar
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default FieldInput;
