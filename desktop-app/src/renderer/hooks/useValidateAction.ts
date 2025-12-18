/**
 * T021.1 - Validate Action Hook
 *
 * Hook for handling the invoice validation workflow:
 * - Runs all validations
 * - Updates invoice state to VALIDATED
 * - Saves updated data via callback
 * - Shows success/error messages in Spanish
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import type { InvoiceExtraction } from '../types';

// =============================================================================
// Types
// =============================================================================

/**
 * Status of the validation action
 */
export type ValidateStatus = 'idle' | 'validating' | 'validated' | 'error';

/**
 * Options for useValidateAction hook
 */
export interface UseValidateActionOptions {
  /** Invoice extraction data to validate */
  extraction: InvoiceExtraction | null;
  /** Callback when validation succeeds */
  onValidated?: (extraction: InvoiceExtraction) => void;
  /** Callback to save data (async) */
  onSave?: (extraction: InvoiceExtraction) => Promise<void>;
}

/**
 * Return type for useValidateAction hook
 */
export interface ValidateActionState {
  /** Current validation status */
  status: ValidateStatus;
  /** Whether validation is in progress */
  isValidating: boolean;
  /** Whether validation succeeded */
  isValidated: boolean;
  /** Error message (Spanish) if validation failed */
  error: string | null;
  /** Success message (Spanish) if validation succeeded */
  successMessage: string | null;
  /** Validate the extraction */
  validate: () => Promise<boolean>;
  /** Reset state to idle */
  reset: () => void;
}

// =============================================================================
// Validation Functions
// =============================================================================

/**
 * Validate RFC format
 */
function validateRfc(rfc: string): string | null {
  if (!rfc || !rfc.trim()) {
    return null; // Empty is allowed
  }

  const normalized = rfc.trim().toUpperCase();

  if (normalized.length < 12 || normalized.length > 13) {
    return 'El RFC debe tener 12 o 13 caracteres';
  }

  const rfcPattern = /^[A-ZÑ&0-9]+$/;
  if (!rfcPattern.test(normalized)) {
    return 'El RFC solo puede contener letras y números';
  }

  return null;
}

/**
 * Parse amount string to number
 */
function parseAmount(value: string): number {
  if (!value) return 0;
  const cleaned = value.replace(/[$,\s]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Validate totals calculation
 */
function validateTotals(
  subtotal: string,
  ivaAmount: string,
  total: string
): string | null {
  const subtotalNum = parseAmount(subtotal);
  const ivaNum = parseAmount(ivaAmount);
  const totalNum = parseAmount(total);

  const TOLERANCE = 0.02;
  const IVA_RATE = 0.16;

  // Validate IVA calculation
  const expectedIva = subtotalNum * IVA_RATE;
  const ivaDiff = Math.abs(ivaNum - expectedIva);

  if (ivaDiff > TOLERANCE && subtotalNum > 0 && ivaNum !== 0) {
    return `El IVA calculado ($${expectedIva.toFixed(2)}) no coincide con el IVA ingresado ($${ivaNum.toFixed(2)})`;
  }

  // Validate total calculation
  const expectedTotal = subtotalNum + ivaNum;
  const totalDiff = Math.abs(totalNum - expectedTotal);

  if (totalDiff > TOLERANCE) {
    return `El total calculado ($${expectedTotal.toFixed(2)}) no coincide con el total ingresado ($${totalNum.toFixed(2)})`;
  }

  return null;
}

/**
 * Validate all extraction fields
 */
function validateExtraction(extraction: InvoiceExtraction): string | null {
  // Validate RFC
  const rfcError = validateRfc(extraction.vendorRfc.value);
  if (rfcError) {
    return rfcError;
  }

  // Validate totals
  const totalsError = validateTotals(
    extraction.subtotal.value,
    extraction.ivaAmount.value,
    extraction.total.value
  );
  if (totalsError) {
    return totalsError;
  }

  return null;
}

// =============================================================================
// Hook Implementation
// =============================================================================

/**
 * Hook for managing invoice validation workflow.
 *
 * @example
 * ```tsx
 * function ValidateButton({ extraction, onSuccess }) {
 *   const {
 *     isValidating,
 *     isValidated,
 *     error,
 *     successMessage,
 *     validate
 *   } = useValidateAction({
 *     extraction,
 *     onValidated: onSuccess,
 *     onSave: async (data) => saveToDatabase(data)
 *   });
 *
 *   return (
 *     <div>
 *       <button onClick={validate} disabled={isValidating}>
 *         {isValidating ? 'Validando...' : 'Validar'}
 *       </button>
 *       {error && <p className="text-red-500">{error}</p>}
 *       {successMessage && <p className="text-green-500">{successMessage}</p>}
 *     </div>
 *   );
 * }
 * ```
 */
export function useValidateAction({
  extraction,
  onValidated,
  onSave,
}: UseValidateActionOptions): ValidateActionState {
  const [status, setStatus] = useState<ValidateStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Track if we're currently validating to prevent double-clicks
  const isValidatingRef = useRef(false);

  // Track previous extraction to reset on change
  const prevExtractionRef = useRef<InvoiceExtraction | null>(null);

  // Reset state when extraction changes
  useEffect(() => {
    if (extraction !== prevExtractionRef.current) {
      prevExtractionRef.current = extraction;
      if (status !== 'idle') {
        setStatus('idle');
        setError(null);
        setSuccessMessage(null);
      }
    }
  }, [extraction, status]);

  /**
   * Validate the extraction
   */
  const validate = useCallback(async (): Promise<boolean> => {
    // Prevent double validation - check and set IMMEDIATELY
    // Must be atomic (check + set) before any other code
    if (isValidatingRef.current) {
      return false;
    }
    isValidatingRef.current = true;

    // Check for null extraction
    if (!extraction) {
      isValidatingRef.current = false;
      setError('No hay datos de factura para validar');
      setStatus('error');
      return false;
    }

    setStatus('validating');
    setError(null);
    setSuccessMessage(null);

    try {
      // Run validations
      const validationError = validateExtraction(extraction);

      if (validationError) {
        setError(validationError);
        setStatus('error');
        isValidatingRef.current = false;
        return false;
      }

      // Call onSave if provided
      if (onSave) {
        try {
          await onSave(extraction);
        } catch (saveError) {
          const errorMessage = saveError instanceof Error
            ? saveError.message
            : 'Error desconocido';
          setError(`Error al guardar los datos: ${errorMessage}`);
          setStatus('error');
          isValidatingRef.current = false;
          return false;
        }
      }

      // Success!
      setSuccessMessage('La factura ha sido validada correctamente');
      setStatus('validated');

      // Call onValidated callback
      if (onValidated) {
        onValidated(extraction);
      }

      // Reset validating flag in microtask to prevent double-clicks
      // in the same synchronous execution block
      queueMicrotask(() => {
        isValidatingRef.current = false;
      });
      return true;

    } catch (err) {
      const errorMessage = err instanceof Error
        ? err.message
        : 'Error desconocido durante la validación';
      setError(errorMessage);
      setStatus('error');
      isValidatingRef.current = false;
      return false;
    }
  }, [extraction, onValidated, onSave]);

  /**
   * Reset state to idle
   */
  const reset = useCallback(() => {
    setStatus('idle');
    setError(null);
    setSuccessMessage(null);
    isValidatingRef.current = false;
  }, []);

  return {
    status,
    isValidating: status === 'validating',
    isValidated: status === 'validated',
    error,
    successMessage,
    validate,
    reset,
  };
}

export default useValidateAction;
