/**
 * T020.3 - Form Validation Hook
 *
 * Hook for validating invoice form data including:
 * - RFC validation on field blur
 * - Totals validation (subtotal + IVA = total)
 * - Inline error tracking
 * - Overall form validity for "Validar" button
 *
 * All error messages are in Spanish.
 */

import { useState, useCallback, useEffect, useMemo } from 'react';
import type { InvoiceExtraction } from '../types';
import type { InvoiceFieldKey } from '../components/InvoiceForm';

// =============================================================================
// Types
// =============================================================================

/**
 * Validation errors by field key
 */
export type ValidationErrors = Partial<Record<InvoiceFieldKey | 'ivaCalculation', string>>;

/**
 * Return type for useFormValidation hook
 */
export interface FormValidationState {
  /** Current validation errors */
  errors: ValidationErrors;
  /** Whether the form is valid (no errors) */
  isValid: boolean;
  /** Validate a specific field */
  validateField: (fieldKey: InvoiceFieldKey, value: string) => string | undefined;
  /** Validate totals (subtotal + IVA = total) */
  validateTotals: () => void;
  /** Validate all fields and totals */
  validateAll: () => boolean;
  /** Clear error for a specific field */
  clearError: (fieldKey: InvoiceFieldKey) => void;
  /** Clear all errors */
  clearAllErrors: () => void;
  /** Get error message for a specific field */
  getFieldError: (fieldKey: InvoiceFieldKey) => string | undefined;
}

// =============================================================================
// Constants
// =============================================================================

/** Default IVA rate in Mexico (16%) */
const DEFAULT_IVA_RATE = 0.16;

/** Tolerance for rounding differences in amounts */
const AMOUNT_TOLERANCE = 0.02;

// =============================================================================
// Validation Functions
// =============================================================================

/**
 * Parse amount string to number, removing formatting
 */
function parseAmount(value: string): number {
  if (!value) return 0;
  // Remove $, commas, and whitespace
  const cleaned = value.replace(/[$,\s]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Validate RFC format
 * @param rfc - RFC string to validate
 * @returns Error message or undefined if valid
 */
function validateRfc(rfc: string): string | undefined {
  // Empty is allowed (required validation is separate)
  if (!rfc || !rfc.trim()) {
    return undefined;
  }

  const normalized = rfc.trim().toUpperCase();

  // Check length
  if (normalized.length < 12 || normalized.length > 13) {
    return 'El RFC debe tener 12 o 13 caracteres';
  }

  // Check pattern: only letters and numbers
  const rfcPattern = /^[A-ZÑ&0-9]+$/;
  if (!rfcPattern.test(normalized)) {
    return 'El RFC solo puede contener letras y números';
  }

  return undefined;
}

/**
 * Validate date format
 * @param date - Date string to validate
 * @returns Error message or undefined if valid
 */
function validateDate(date: string): string | undefined {
  if (!date || !date.trim()) {
    return undefined;
  }

  // ISO format: YYYY-MM-DD
  const isoRegex = /^\d{4}-\d{2}-\d{2}$/;
  // Mexican format: DD/MM/YYYY
  const mxRegex = /^\d{2}\/\d{2}\/\d{4}$/;

  if (!isoRegex.test(date) && !mxRegex.test(date)) {
    return 'Formato de fecha inválido (use YYYY-MM-DD o DD/MM/YYYY)';
  }

  return undefined;
}

/**
 * Validate amount format
 * @param amount - Amount string to validate
 * @returns Error message or undefined if valid
 */
function validateAmount(amount: string): string | undefined {
  if (!amount || !amount.trim()) {
    return undefined;
  }

  const parsed = parseAmount(amount);
  if (isNaN(parsed)) {
    return 'Monto inválido';
  }

  return undefined;
}

// =============================================================================
// Hook Implementation
// =============================================================================

/**
 * Hook for form validation
 *
 * @param extraction - Invoice extraction data
 * @returns Form validation state and functions
 *
 * @example
 * ```tsx
 * const { errors, isValid, validateField, validateAll } = useFormValidation(extraction);
 *
 * // Validate on blur
 * <input onBlur={() => validateField('vendorRfc', value)} />
 *
 * // Check validity for button
 * <button disabled={!isValid}>Validar</button>
 * ```
 */
export function useFormValidation(
  extraction: InvoiceExtraction | null
): FormValidationState {
  const [errors, setErrors] = useState<ValidationErrors>({});

  // Clear errors when extraction changes
  useEffect(() => {
    setErrors({});
  }, [extraction]);

  /**
   * Calculate isValid from errors
   */
  const isValid = useMemo(() => {
    return Object.keys(errors).length === 0;
  }, [errors]);

  /**
   * Validate a specific field
   */
  const validateField = useCallback(
    (fieldKey: InvoiceFieldKey, value: string): string | undefined => {
      let error: string | undefined;

      switch (fieldKey) {
        case 'vendorRfc':
          error = validateRfc(value);
          break;
        case 'invoiceDate':
          error = validateDate(value);
          break;
        case 'subtotal':
        case 'ivaAmount':
        case 'total':
          error = validateAmount(value);
          break;
        default:
          // No validation for other fields
          error = undefined;
      }

      setErrors((prev) => {
        if (error) {
          return { ...prev, [fieldKey]: error };
        } else {
          const { [fieldKey]: _, ...rest } = prev;
          return rest;
        }
      });

      return error;
    },
    []
  );

  /**
   * Validate totals (IVA and total calculations)
   */
  const validateTotals = useCallback(() => {
    if (!extraction) return;

    const subtotal = parseAmount(extraction.subtotal.value);
    const ivaAmount = parseAmount(extraction.ivaAmount.value);
    const total = parseAmount(extraction.total.value);

    const newErrors: ValidationErrors = {};

    // Validate IVA calculation (subtotal * 16% = IVA)
    const expectedIva = subtotal * DEFAULT_IVA_RATE;
    const ivaDifference = Math.abs(ivaAmount - expectedIva);

    if (ivaDifference > AMOUNT_TOLERANCE && subtotal > 0) {
      // Check if it might be exempt (IVA = 0)
      if (ivaAmount !== 0) {
        newErrors.ivaAmount = `El IVA calculado ($${expectedIva.toFixed(2)}) no coincide con el IVA ingresado ($${ivaAmount.toFixed(2)})`;
      }
    }

    // Validate total calculation (subtotal + IVA = total)
    const expectedTotal = subtotal + ivaAmount;
    const totalDifference = Math.abs(total - expectedTotal);

    if (totalDifference > AMOUNT_TOLERANCE) {
      newErrors.total = `El total calculado ($${expectedTotal.toFixed(2)}) no coincide con el total ingresado ($${total.toFixed(2)})`;
    }

    setErrors((prev) => {
      // Remove old total/iva errors and add new ones
      const { total: _, ivaAmount: __, ...rest } = prev;
      return { ...rest, ...newErrors };
    });
  }, [extraction]);

  /**
   * Validate all fields and return overall validity
   */
  const validateAll = useCallback((): boolean => {
    if (!extraction) return true;

    const allErrors: ValidationErrors = {};

    // Validate RFC
    const rfcError = validateRfc(extraction.vendorRfc.value);
    if (rfcError) allErrors.vendorRfc = rfcError;

    // Validate date
    const dateError = validateDate(extraction.invoiceDate.value);
    if (dateError) allErrors.invoiceDate = dateError;

    // Validate amounts
    const subtotalError = validateAmount(extraction.subtotal.value);
    if (subtotalError) allErrors.subtotal = subtotalError;

    const ivaError = validateAmount(extraction.ivaAmount.value);
    if (ivaError) allErrors.ivaAmount = ivaError;

    const totalError = validateAmount(extraction.total.value);
    if (totalError) allErrors.total = totalError;

    // Validate totals calculations
    const subtotal = parseAmount(extraction.subtotal.value);
    const ivaAmount = parseAmount(extraction.ivaAmount.value);
    const total = parseAmount(extraction.total.value);

    // IVA calculation
    const expectedIva = subtotal * DEFAULT_IVA_RATE;
    const ivaDifference = Math.abs(ivaAmount - expectedIva);

    if (ivaDifference > AMOUNT_TOLERANCE && subtotal > 0 && ivaAmount !== 0) {
      allErrors.ivaAmount = `El IVA calculado ($${expectedIva.toFixed(2)}) no coincide con el IVA ingresado ($${ivaAmount.toFixed(2)})`;
    }

    // Total calculation
    const expectedTotal = subtotal + ivaAmount;
    const totalDifference = Math.abs(total - expectedTotal);

    if (totalDifference > AMOUNT_TOLERANCE) {
      allErrors.total = `El total calculado ($${expectedTotal.toFixed(2)}) no coincide con el total ingresado ($${total.toFixed(2)})`;
    }

    setErrors(allErrors);

    return Object.keys(allErrors).length === 0;
  }, [extraction]);

  /**
   * Clear error for a specific field
   */
  const clearError = useCallback((fieldKey: InvoiceFieldKey) => {
    setErrors((prev) => {
      const { [fieldKey]: _, ...rest } = prev;
      return rest;
    });
  }, []);

  /**
   * Clear all errors
   */
  const clearAllErrors = useCallback(() => {
    setErrors({});
  }, []);

  /**
   * Get error message for a specific field
   */
  const getFieldError = useCallback(
    (fieldKey: InvoiceFieldKey): string | undefined => {
      return errors[fieldKey];
    },
    [errors]
  );

  return {
    errors,
    isValid,
    validateField,
    validateTotals,
    validateAll,
    clearError,
    clearAllErrors,
    getFieldError,
  };
}

export default useFormValidation;
