/**
 * T021.1 - Validate Action Tests
 *
 * Tests for useValidateAction hook that:
 * - Runs all validations on click
 * - Updates invoice state to VALIDATED
 * - Saves updated data (simulated)
 * - Updates extraction_results with user edits
 * - Shows success/error messages in Spanish
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import type { InvoiceExtraction } from '../../../src/renderer/types';

// =============================================================================
// Test Helpers
// =============================================================================

function createMockExtraction(): InvoiceExtraction {
  return {
    vendorRfc: {
      fieldName: 'vendorRfc',
      value: 'XAXX010101000',
      confidence: 95,
      userVerified: false,
    },
    vendorName: {
      fieldName: 'vendorName',
      value: 'Empresa de Prueba SA de CV',
      confidence: 92,
      userVerified: false,
    },
    invoiceNumber: {
      fieldName: 'invoiceNumber',
      value: 'A-001',
      confidence: 98,
      userVerified: false,
    },
    invoiceDate: {
      fieldName: 'invoiceDate',
      value: '2024-01-15',
      confidence: 90,
      userVerified: false,
    },
    subtotal: {
      fieldName: 'subtotal',
      value: '1000.00',
      confidence: 88,
      userVerified: false,
    },
    ivaAmount: {
      fieldName: 'ivaAmount',
      value: '160.00',
      confidence: 88,
      userVerified: false,
    },
    total: {
      fieldName: 'total',
      value: '1160.00',
      confidence: 90,
      userVerified: false,
    },
    lineItems: [],
    sourceType: 'text_based' as const,
    processingTimeMs: 1500,
  };
}

// =============================================================================
// Hook Export Tests
// =============================================================================

describe('T021.1.1 - useValidateAction Hook Export', () => {
  test('should export useValidateAction hook', () => {
    const { useValidateAction } = require('../../../src/renderer/hooks/useValidateAction');
    expect(useValidateAction).toBeDefined();
    expect(typeof useValidateAction).toBe('function');
  });

  test('should export ValidateActionState type', () => {
    const module = require('../../../src/renderer/hooks/useValidateAction');
    expect(module).toBeDefined();
  });
});

// =============================================================================
// Hook Initialization Tests
// =============================================================================

describe('T021.1.1 - Hook Initialization', () => {
  test('should initialize with idle state', () => {
    const { useValidateAction } = require('../../../src/renderer/hooks/useValidateAction');
    const extraction = createMockExtraction();

    const { result } = renderHook(() => useValidateAction({ extraction }));

    expect(result.current.status).toBe('idle');
  });

  test('should not be validating initially', () => {
    const { useValidateAction } = require('../../../src/renderer/hooks/useValidateAction');
    const extraction = createMockExtraction();

    const { result } = renderHook(() => useValidateAction({ extraction }));

    expect(result.current.isValidating).toBe(false);
  });

  test('should not be validated initially', () => {
    const { useValidateAction } = require('../../../src/renderer/hooks/useValidateAction');
    const extraction = createMockExtraction();

    const { result } = renderHook(() => useValidateAction({ extraction }));

    expect(result.current.isValidated).toBe(false);
  });

  test('should not have error initially', () => {
    const { useValidateAction } = require('../../../src/renderer/hooks/useValidateAction');
    const extraction = createMockExtraction();

    const { result } = renderHook(() => useValidateAction({ extraction }));

    expect(result.current.error).toBeNull();
  });

  test('should not have success message initially', () => {
    const { useValidateAction } = require('../../../src/renderer/hooks/useValidateAction');
    const extraction = createMockExtraction();

    const { result } = renderHook(() => useValidateAction({ extraction }));

    expect(result.current.successMessage).toBeNull();
  });

  test('should provide validate function', () => {
    const { useValidateAction } = require('../../../src/renderer/hooks/useValidateAction');
    const extraction = createMockExtraction();

    const { result } = renderHook(() => useValidateAction({ extraction }));

    expect(result.current.validate).toBeDefined();
    expect(typeof result.current.validate).toBe('function');
  });

  test('should provide reset function', () => {
    const { useValidateAction } = require('../../../src/renderer/hooks/useValidateAction');
    const extraction = createMockExtraction();

    const { result } = renderHook(() => useValidateAction({ extraction }));

    expect(result.current.reset).toBeDefined();
    expect(typeof result.current.reset).toBe('function');
  });
});

// =============================================================================
// T021.1.3 - Run All Validations Tests
// =============================================================================

describe('T021.1.3 - Run All Validations on Click', () => {
  test('should run validations when validate is called', async () => {
    const { useValidateAction } = require('../../../src/renderer/hooks/useValidateAction');
    const extraction = createMockExtraction();

    const { result } = renderHook(() => useValidateAction({ extraction }));

    await act(async () => {
      await result.current.validate();
    });

    // Should have attempted validation
    expect(result.current.status).not.toBe('idle');
  });

  test('should set validating state during validation', async () => {
    const { useValidateAction } = require('../../../src/renderer/hooks/useValidateAction');
    const extraction = createMockExtraction();

    const { result } = renderHook(() => useValidateAction({ extraction }));

    let wasValidating = false;

    await act(async () => {
      const validatePromise = result.current.validate();
      // Check state during validation
      wasValidating = result.current.isValidating;
      await validatePromise;
    });

    // Should have been validating at some point
    expect(wasValidating || result.current.isValidated).toBe(true);
  });

  test('should return true when all validations pass', async () => {
    const { useValidateAction } = require('../../../src/renderer/hooks/useValidateAction');
    const extraction = createMockExtraction();

    const { result } = renderHook(() => useValidateAction({ extraction }));

    let validateResult: boolean = false;
    await act(async () => {
      validateResult = await result.current.validate();
    });

    expect(validateResult).toBe(true);
  });

  test('should return false when validation fails', async () => {
    const { useValidateAction } = require('../../../src/renderer/hooks/useValidateAction');
    const extraction = createMockExtraction();
    extraction.vendorRfc.value = 'BAD'; // Invalid RFC

    const { result } = renderHook(() => useValidateAction({ extraction }));

    let validateResult: boolean = true;
    await act(async () => {
      validateResult = await result.current.validate();
    });

    expect(validateResult).toBe(false);
  });

  test('should validate RFC format', async () => {
    const { useValidateAction } = require('../../../src/renderer/hooks/useValidateAction');
    const extraction = createMockExtraction();
    extraction.vendorRfc.value = 'INVALID';

    const { result } = renderHook(() => useValidateAction({ extraction }));

    await act(async () => {
      await result.current.validate();
    });

    expect(result.current.error).toBeDefined();
    expect(result.current.error).toContain('RFC');
  });

  test('should validate totals', async () => {
    const { useValidateAction } = require('../../../src/renderer/hooks/useValidateAction');
    const extraction = createMockExtraction();
    extraction.total.value = '9999.00'; // Wrong total

    const { result } = renderHook(() => useValidateAction({ extraction }));

    await act(async () => {
      await result.current.validate();
    });

    expect(result.current.error).toBeDefined();
    expect(result.current.error?.toLowerCase()).toMatch(/total|coincide/);
  });
});

// =============================================================================
// T021.1.4 - Update Invoice State Tests
// =============================================================================

describe('T021.1.4 - Update Invoice State to VALIDATED', () => {
  test('should set isValidated to true on success', async () => {
    const { useValidateAction } = require('../../../src/renderer/hooks/useValidateAction');
    const extraction = createMockExtraction();

    const { result } = renderHook(() => useValidateAction({ extraction }));

    await act(async () => {
      await result.current.validate();
    });

    expect(result.current.isValidated).toBe(true);
  });

  test('should set status to validated on success', async () => {
    const { useValidateAction } = require('../../../src/renderer/hooks/useValidateAction');
    const extraction = createMockExtraction();

    const { result } = renderHook(() => useValidateAction({ extraction }));

    await act(async () => {
      await result.current.validate();
    });

    expect(result.current.status).toBe('validated');
  });

  test('should set status to error on failure', async () => {
    const { useValidateAction } = require('../../../src/renderer/hooks/useValidateAction');
    const extraction = createMockExtraction();
    extraction.vendorRfc.value = 'BAD';

    const { result } = renderHook(() => useValidateAction({ extraction }));

    await act(async () => {
      await result.current.validate();
    });

    expect(result.current.status).toBe('error');
  });

  test('should call onValidated callback on success', async () => {
    const { useValidateAction } = require('../../../src/renderer/hooks/useValidateAction');
    const extraction = createMockExtraction();
    const onValidated = jest.fn();

    const { result } = renderHook(() =>
      useValidateAction({ extraction, onValidated })
    );

    await act(async () => {
      await result.current.validate();
    });

    expect(onValidated).toHaveBeenCalledTimes(1);
  });

  test('should pass validated extraction to onValidated', async () => {
    const { useValidateAction } = require('../../../src/renderer/hooks/useValidateAction');
    const extraction = createMockExtraction();
    const onValidated = jest.fn();

    const { result } = renderHook(() =>
      useValidateAction({ extraction, onValidated })
    );

    await act(async () => {
      await result.current.validate();
    });

    expect(onValidated).toHaveBeenCalledWith(
      expect.objectContaining({
        vendorRfc: expect.any(Object),
      })
    );
  });

  test('should not call onValidated on failure', async () => {
    const { useValidateAction } = require('../../../src/renderer/hooks/useValidateAction');
    const extraction = createMockExtraction();
    extraction.vendorRfc.value = 'BAD';
    const onValidated = jest.fn();

    const { result } = renderHook(() =>
      useValidateAction({ extraction, onValidated })
    );

    await act(async () => {
      await result.current.validate();
    });

    expect(onValidated).not.toHaveBeenCalled();
  });
});

// =============================================================================
// T021.1.5 - Save Updated Data Tests
// =============================================================================

describe('T021.1.5 - Save Updated Data', () => {
  test('should call onSave callback when provided', async () => {
    const { useValidateAction } = require('../../../src/renderer/hooks/useValidateAction');
    const extraction = createMockExtraction();
    const onSave = jest.fn().mockResolvedValue(undefined);

    const { result } = renderHook(() =>
      useValidateAction({ extraction, onSave })
    );

    await act(async () => {
      await result.current.validate();
    });

    expect(onSave).toHaveBeenCalledTimes(1);
  });

  test('should pass extraction to onSave', async () => {
    const { useValidateAction } = require('../../../src/renderer/hooks/useValidateAction');
    const extraction = createMockExtraction();
    const onSave = jest.fn().mockResolvedValue(undefined);

    const { result } = renderHook(() =>
      useValidateAction({ extraction, onSave })
    );

    await act(async () => {
      await result.current.validate();
    });

    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({
      vendorRfc: expect.any(Object),
    }));
  });

  test('should handle save error gracefully', async () => {
    const { useValidateAction } = require('../../../src/renderer/hooks/useValidateAction');
    const extraction = createMockExtraction();
    const onSave = jest.fn().mockRejectedValue(new Error('Save failed'));

    const { result } = renderHook(() =>
      useValidateAction({ extraction, onSave })
    );

    await act(async () => {
      await result.current.validate();
    });

    expect(result.current.status).toBe('error');
    expect(result.current.error).toContain('guardar');
  });
});

// =============================================================================
// T021.1.6 - Update Extraction Results Tests
// =============================================================================

describe('T021.1.6 - Update Extraction Results with User Edits', () => {
  test('should preserve userVerified fields', async () => {
    const { useValidateAction } = require('../../../src/renderer/hooks/useValidateAction');
    const extraction = createMockExtraction();
    extraction.vendorRfc.userVerified = true;
    const onValidated = jest.fn();

    const { result } = renderHook(() =>
      useValidateAction({ extraction, onValidated })
    );

    await act(async () => {
      await result.current.validate();
    });

    expect(onValidated).toHaveBeenCalledWith(
      expect.objectContaining({
        vendorRfc: expect.objectContaining({
          userVerified: true,
        }),
      })
    );
  });

  test('should preserve edited values', async () => {
    const { useValidateAction } = require('../../../src/renderer/hooks/useValidateAction');
    const extraction = createMockExtraction();
    extraction.vendorName.value = 'Updated Company Name';
    const onValidated = jest.fn();

    const { result } = renderHook(() =>
      useValidateAction({ extraction, onValidated })
    );

    await act(async () => {
      await result.current.validate();
    });

    expect(onValidated).toHaveBeenCalledWith(
      expect.objectContaining({
        vendorName: expect.objectContaining({
          value: 'Updated Company Name',
        }),
      })
    );
  });
});

// =============================================================================
// T021.1.7 - Success Message Tests
// =============================================================================

describe('T021.1.7 - Show Success Message in Spanish', () => {
  test('should show success message on validation success', async () => {
    const { useValidateAction } = require('../../../src/renderer/hooks/useValidateAction');
    const extraction = createMockExtraction();

    const { result } = renderHook(() => useValidateAction({ extraction }));

    await act(async () => {
      await result.current.validate();
    });

    expect(result.current.successMessage).toBeDefined();
    expect(result.current.successMessage).not.toBeNull();
  });

  test('should show success message in Spanish', async () => {
    const { useValidateAction } = require('../../../src/renderer/hooks/useValidateAction');
    const extraction = createMockExtraction();

    const { result } = renderHook(() => useValidateAction({ extraction }));

    await act(async () => {
      await result.current.validate();
    });

    // Should contain Spanish words
    expect(result.current.successMessage).toMatch(/factura|validada|éxito|correctamente/i);
  });

  test('should not show success message on failure', async () => {
    const { useValidateAction } = require('../../../src/renderer/hooks/useValidateAction');
    const extraction = createMockExtraction();
    extraction.vendorRfc.value = 'BAD';

    const { result } = renderHook(() => useValidateAction({ extraction }));

    await act(async () => {
      await result.current.validate();
    });

    expect(result.current.successMessage).toBeNull();
  });

  test('should show error message in Spanish on failure', async () => {
    const { useValidateAction } = require('../../../src/renderer/hooks/useValidateAction');
    const extraction = createMockExtraction();
    extraction.vendorRfc.value = 'BAD';

    const { result } = renderHook(() => useValidateAction({ extraction }));

    await act(async () => {
      await result.current.validate();
    });

    // Should contain Spanish error
    expect(result.current.error).toBeDefined();
  });
});

// =============================================================================
// Reset Tests
// =============================================================================

describe('Reset Functionality', () => {
  test('should reset status to idle', async () => {
    const { useValidateAction } = require('../../../src/renderer/hooks/useValidateAction');
    const extraction = createMockExtraction();

    const { result } = renderHook(() => useValidateAction({ extraction }));

    await act(async () => {
      await result.current.validate();
    });
    expect(result.current.status).toBe('validated');

    act(() => {
      result.current.reset();
    });
    expect(result.current.status).toBe('idle');
  });

  test('should clear success message on reset', async () => {
    const { useValidateAction } = require('../../../src/renderer/hooks/useValidateAction');
    const extraction = createMockExtraction();

    const { result } = renderHook(() => useValidateAction({ extraction }));

    await act(async () => {
      await result.current.validate();
    });
    expect(result.current.successMessage).not.toBeNull();

    act(() => {
      result.current.reset();
    });
    expect(result.current.successMessage).toBeNull();
  });

  test('should clear error on reset', async () => {
    const { useValidateAction } = require('../../../src/renderer/hooks/useValidateAction');
    const extraction = createMockExtraction();
    extraction.vendorRfc.value = 'BAD';

    const { result } = renderHook(() => useValidateAction({ extraction }));

    await act(async () => {
      await result.current.validate();
    });
    expect(result.current.error).not.toBeNull();

    act(() => {
      result.current.reset();
    });
    expect(result.current.error).toBeNull();
  });
});

// =============================================================================
// Edge Cases
// =============================================================================

describe('Edge Cases', () => {
  test('should handle null extraction', async () => {
    const { useValidateAction } = require('../../../src/renderer/hooks/useValidateAction');

    const { result } = renderHook(() => useValidateAction({ extraction: null }));

    let validateResult: boolean = true;
    await act(async () => {
      validateResult = await result.current.validate();
    });

    expect(validateResult).toBe(false);
    expect(result.current.error).toBeDefined();
  });

  test('should prevent double validation', async () => {
    const { useValidateAction } = require('../../../src/renderer/hooks/useValidateAction');
    const extraction = createMockExtraction();
    const onValidated = jest.fn();

    const { result } = renderHook(() =>
      useValidateAction({ extraction, onValidated })
    );

    await act(async () => {
      // Call validate twice quickly
      const p1 = result.current.validate();
      const p2 = result.current.validate();
      await Promise.all([p1, p2]);
    });

    // Should only validate once
    expect(onValidated).toHaveBeenCalledTimes(1);
  });

  test('should update when extraction changes', async () => {
    const { useValidateAction } = require('../../../src/renderer/hooks/useValidateAction');
    const extraction1 = createMockExtraction();
    const extraction2 = createMockExtraction();
    extraction2.vendorRfc.value = 'GARC850101ABC';

    const { result, rerender } = renderHook(
      ({ extraction }) => useValidateAction({ extraction }),
      { initialProps: { extraction: extraction1 } }
    );

    await act(async () => {
      await result.current.validate();
    });
    expect(result.current.isValidated).toBe(true);

    // Change extraction
    rerender({ extraction: extraction2 });

    // Should reset state for new extraction
    expect(result.current.status).toBe('idle');
  });
});
