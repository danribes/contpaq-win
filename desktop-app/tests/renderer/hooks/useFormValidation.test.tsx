/**
 * T020.3 - Form Validation Hook Tests
 *
 * Tests for useFormValidation hook that:
 * - Validates RFC on field blur
 * - Validates totals on amount changes
 * - Shows inline validation errors in Spanish
 * - Tracks form validity for "Validar" button
 *
 * Uses Tailwind CSS for styling.
 */

import { renderHook, act } from '@testing-library/react';

// =============================================================================
// Test Helpers
// =============================================================================

function createMockExtraction() {
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

describe('T020.3.1 - useFormValidation Hook Export', () => {
  test('should export useFormValidation hook', () => {
    const { useFormValidation } = require('../../../src/renderer/hooks/useFormValidation');
    expect(useFormValidation).toBeDefined();
    expect(typeof useFormValidation).toBe('function');
  });

  test('should export FormValidationState type', () => {
    const module = require('../../../src/renderer/hooks/useFormValidation');
    // Type exports are verified by TypeScript compilation
    expect(module).toBeDefined();
  });
});

// =============================================================================
// Hook Initialization Tests
// =============================================================================

describe('T020.3.1 - Hook Initialization', () => {
  test('should initialize with empty errors', () => {
    const { useFormValidation } = require('../../../src/renderer/hooks/useFormValidation');
    const extraction = createMockExtraction();

    const { result } = renderHook(() => useFormValidation(extraction));

    expect(result.current.errors).toEqual({});
  });

  test('should initialize as valid when extraction is correct', () => {
    const { useFormValidation } = require('../../../src/renderer/hooks/useFormValidation');
    const extraction = createMockExtraction();

    const { result } = renderHook(() => useFormValidation(extraction));

    expect(result.current.isValid).toBe(true);
  });

  test('should provide validateField function', () => {
    const { useFormValidation } = require('../../../src/renderer/hooks/useFormValidation');
    const extraction = createMockExtraction();

    const { result } = renderHook(() => useFormValidation(extraction));

    expect(result.current.validateField).toBeDefined();
    expect(typeof result.current.validateField).toBe('function');
  });

  test('should provide validateTotals function', () => {
    const { useFormValidation } = require('../../../src/renderer/hooks/useFormValidation');
    const extraction = createMockExtraction();

    const { result } = renderHook(() => useFormValidation(extraction));

    expect(result.current.validateTotals).toBeDefined();
    expect(typeof result.current.validateTotals).toBe('function');
  });

  test('should provide validateAll function', () => {
    const { useFormValidation } = require('../../../src/renderer/hooks/useFormValidation');
    const extraction = createMockExtraction();

    const { result } = renderHook(() => useFormValidation(extraction));

    expect(result.current.validateAll).toBeDefined();
    expect(typeof result.current.validateAll).toBe('function');
  });

  test('should provide clearError function', () => {
    const { useFormValidation } = require('../../../src/renderer/hooks/useFormValidation');
    const extraction = createMockExtraction();

    const { result } = renderHook(() => useFormValidation(extraction));

    expect(result.current.clearError).toBeDefined();
    expect(typeof result.current.clearError).toBe('function');
  });
});

// =============================================================================
// T020.3.2 - RFC Validation Tests
// =============================================================================

describe('T020.3.2 - RFC Validation on Blur', () => {
  test('should validate valid 13-char RFC (persona física)', () => {
    const { useFormValidation } = require('../../../src/renderer/hooks/useFormValidation');
    const extraction = createMockExtraction();
    extraction.vendorRfc.value = 'XAXX010101000';

    const { result } = renderHook(() => useFormValidation(extraction));

    act(() => {
      result.current.validateField('vendorRfc', 'XAXX010101000');
    });

    expect(result.current.errors.vendorRfc).toBeUndefined();
  });

  test('should validate valid 12-char RFC (persona moral)', () => {
    const { useFormValidation } = require('../../../src/renderer/hooks/useFormValidation');
    const extraction = createMockExtraction();

    const { result } = renderHook(() => useFormValidation(extraction));

    act(() => {
      result.current.validateField('vendorRfc', 'XAX010101000');
    });

    expect(result.current.errors.vendorRfc).toBeUndefined();
  });

  test('should set error for invalid RFC length', () => {
    const { useFormValidation } = require('../../../src/renderer/hooks/useFormValidation');
    const extraction = createMockExtraction();

    const { result } = renderHook(() => useFormValidation(extraction));

    act(() => {
      result.current.validateField('vendorRfc', 'INVALID');
    });

    expect(result.current.errors.vendorRfc).toBeDefined();
    expect(result.current.errors.vendorRfc).toContain('RFC');
  });

  test('should set error for RFC with special characters', () => {
    const { useFormValidation } = require('../../../src/renderer/hooks/useFormValidation');
    const extraction = createMockExtraction();

    const { result } = renderHook(() => useFormValidation(extraction));

    act(() => {
      result.current.validateField('vendorRfc', 'XAXX-010101-000');
    });

    expect(result.current.errors.vendorRfc).toBeDefined();
  });

  test('should accept lowercase RFC and consider it valid', () => {
    const { useFormValidation } = require('../../../src/renderer/hooks/useFormValidation');
    const extraction = createMockExtraction();

    const { result } = renderHook(() => useFormValidation(extraction));

    act(() => {
      result.current.validateField('vendorRfc', 'xaxx010101000');
    });

    expect(result.current.errors.vendorRfc).toBeUndefined();
  });

  test('should allow empty RFC (optional field)', () => {
    const { useFormValidation } = require('../../../src/renderer/hooks/useFormValidation');
    const extraction = createMockExtraction();

    const { result } = renderHook(() => useFormValidation(extraction));

    act(() => {
      result.current.validateField('vendorRfc', '');
    });

    // Empty is allowed (required validation is separate)
    expect(result.current.errors.vendorRfc).toBeUndefined();
  });

  test('should return error message in Spanish', () => {
    const { useFormValidation } = require('../../../src/renderer/hooks/useFormValidation');
    const extraction = createMockExtraction();

    const { result } = renderHook(() => useFormValidation(extraction));

    act(() => {
      result.current.validateField('vendorRfc', 'INVALID');
    });

    // Should be in Spanish
    expect(result.current.errors.vendorRfc).toMatch(/caracteres|inválido|RFC/i);
  });
});

// =============================================================================
// T020.3.3 - Totals Validation Tests
// =============================================================================

describe('T020.3.3 - Validate Totals on Amount Changes', () => {
  test('should validate correct totals (subtotal + IVA = total)', () => {
    const { useFormValidation } = require('../../../src/renderer/hooks/useFormValidation');
    const extraction = createMockExtraction();
    extraction.subtotal.value = '1000.00';
    extraction.ivaAmount.value = '160.00';
    extraction.total.value = '1160.00';

    const { result } = renderHook(() => useFormValidation(extraction));

    act(() => {
      result.current.validateTotals();
    });

    expect(result.current.errors.total).toBeUndefined();
    expect(result.current.errors.ivaAmount).toBeUndefined();
  });

  test('should set error when total does not match', () => {
    const { useFormValidation } = require('../../../src/renderer/hooks/useFormValidation');
    const extraction = createMockExtraction();
    extraction.subtotal.value = '1000.00';
    extraction.ivaAmount.value = '160.00';
    extraction.total.value = '1200.00'; // Should be 1160.00

    const { result } = renderHook(() => useFormValidation(extraction));

    act(() => {
      result.current.validateTotals();
    });

    expect(result.current.errors.total).toBeDefined();
    expect(result.current.errors.total).toContain('total');
  });

  test('should set error when IVA calculation is wrong', () => {
    const { useFormValidation } = require('../../../src/renderer/hooks/useFormValidation');
    const extraction = createMockExtraction();
    extraction.subtotal.value = '1000.00';
    extraction.ivaAmount.value = '100.00'; // Should be 160.00 (16%)
    extraction.total.value = '1100.00';

    const { result } = renderHook(() => useFormValidation(extraction));

    act(() => {
      result.current.validateTotals();
    });

    expect(result.current.errors.ivaAmount).toBeDefined();
    expect(result.current.errors.ivaAmount).toContain('IVA');
  });

  test('should allow small rounding differences (±0.02)', () => {
    const { useFormValidation } = require('../../../src/renderer/hooks/useFormValidation');
    const extraction = createMockExtraction();
    extraction.subtotal.value = '100.00';
    extraction.ivaAmount.value = '16.01'; // Slight rounding
    extraction.total.value = '116.01';

    const { result } = renderHook(() => useFormValidation(extraction));

    act(() => {
      result.current.validateTotals();
    });

    // Should allow small rounding difference
    expect(result.current.errors.ivaAmount).toBeUndefined();
  });

  test('should handle amounts with comma separators', () => {
    const { useFormValidation } = require('../../../src/renderer/hooks/useFormValidation');
    const extraction = createMockExtraction();
    extraction.subtotal.value = '1,000.00';
    extraction.ivaAmount.value = '160.00';
    extraction.total.value = '1,160.00';

    const { result } = renderHook(() => useFormValidation(extraction));

    act(() => {
      result.current.validateTotals();
    });

    expect(result.current.errors.total).toBeUndefined();
  });

  test('should handle amounts with $ prefix', () => {
    const { useFormValidation } = require('../../../src/renderer/hooks/useFormValidation');
    const extraction = createMockExtraction();
    extraction.subtotal.value = '$1000.00';
    extraction.ivaAmount.value = '$160.00';
    extraction.total.value = '$1160.00';

    const { result } = renderHook(() => useFormValidation(extraction));

    act(() => {
      result.current.validateTotals();
    });

    expect(result.current.errors.total).toBeUndefined();
  });

  test('should return error messages in Spanish', () => {
    const { useFormValidation } = require('../../../src/renderer/hooks/useFormValidation');
    const extraction = createMockExtraction();
    extraction.subtotal.value = '1000.00';
    extraction.ivaAmount.value = '160.00';
    extraction.total.value = '2000.00'; // Wrong

    const { result } = renderHook(() => useFormValidation(extraction));

    act(() => {
      result.current.validateTotals();
    });

    // Should be in Spanish
    expect(result.current.errors.total).toMatch(/total|coincide|calculado/i);
  });
});

// =============================================================================
// T020.3.4 - Inline Validation Errors Tests
// =============================================================================

describe('T020.3.4 - Show Inline Validation Errors in Spanish', () => {
  test('should provide error for specific field', () => {
    const { useFormValidation } = require('../../../src/renderer/hooks/useFormValidation');
    const extraction = createMockExtraction();

    const { result } = renderHook(() => useFormValidation(extraction));

    act(() => {
      result.current.validateField('vendorRfc', 'BAD');
    });

    expect(result.current.errors.vendorRfc).toBeDefined();
  });

  test('should provide getFieldError helper', () => {
    const { useFormValidation } = require('../../../src/renderer/hooks/useFormValidation');
    const extraction = createMockExtraction();

    const { result } = renderHook(() => useFormValidation(extraction));

    act(() => {
      result.current.validateField('vendorRfc', 'BAD');
    });

    const error = result.current.getFieldError('vendorRfc');
    expect(error).toBeDefined();
  });

  test('should return undefined for field without error', () => {
    const { useFormValidation } = require('../../../src/renderer/hooks/useFormValidation');
    const extraction = createMockExtraction();

    const { result } = renderHook(() => useFormValidation(extraction));

    const error = result.current.getFieldError('vendorName');
    expect(error).toBeUndefined();
  });

  test('should clear error when clearError is called', () => {
    const { useFormValidation } = require('../../../src/renderer/hooks/useFormValidation');
    const extraction = createMockExtraction();

    const { result } = renderHook(() => useFormValidation(extraction));

    act(() => {
      result.current.validateField('vendorRfc', 'BAD');
    });
    expect(result.current.errors.vendorRfc).toBeDefined();

    act(() => {
      result.current.clearError('vendorRfc');
    });
    expect(result.current.errors.vendorRfc).toBeUndefined();
  });

  test('should clear all errors when clearAllErrors is called', () => {
    const { useFormValidation } = require('../../../src/renderer/hooks/useFormValidation');
    const extraction = createMockExtraction();
    extraction.total.value = '9999.00'; // Wrong

    const { result } = renderHook(() => useFormValidation(extraction));

    act(() => {
      result.current.validateField('vendorRfc', 'BAD');
      result.current.validateTotals();
    });
    expect(Object.keys(result.current.errors).length).toBeGreaterThan(0);

    act(() => {
      result.current.clearAllErrors();
    });
    expect(result.current.errors).toEqual({});
  });
});

// =============================================================================
// T020.3.5 - Form Validity Tests
// =============================================================================

describe('T020.3.5 - Enable Validar Button Only When No Errors', () => {
  test('should be valid when no errors', () => {
    const { useFormValidation } = require('../../../src/renderer/hooks/useFormValidation');
    const extraction = createMockExtraction();

    const { result } = renderHook(() => useFormValidation(extraction));

    expect(result.current.isValid).toBe(true);
  });

  test('should be invalid when there are errors', () => {
    const { useFormValidation } = require('../../../src/renderer/hooks/useFormValidation');
    const extraction = createMockExtraction();

    const { result } = renderHook(() => useFormValidation(extraction));

    act(() => {
      result.current.validateField('vendorRfc', 'BAD');
    });

    expect(result.current.isValid).toBe(false);
  });

  test('should become valid again after clearing errors', () => {
    const { useFormValidation } = require('../../../src/renderer/hooks/useFormValidation');
    const extraction = createMockExtraction();

    const { result } = renderHook(() => useFormValidation(extraction));

    act(() => {
      result.current.validateField('vendorRfc', 'BAD');
    });
    expect(result.current.isValid).toBe(false);

    act(() => {
      result.current.clearError('vendorRfc');
    });
    expect(result.current.isValid).toBe(true);
  });

  test('validateAll should return true when all valid', () => {
    const { useFormValidation } = require('../../../src/renderer/hooks/useFormValidation');
    const extraction = createMockExtraction();

    const { result } = renderHook(() => useFormValidation(extraction));

    let isValid: boolean = false;
    act(() => {
      isValid = result.current.validateAll();
    });

    expect(isValid).toBe(true);
  });

  test('validateAll should return false when any invalid', () => {
    const { useFormValidation } = require('../../../src/renderer/hooks/useFormValidation');
    const extraction = createMockExtraction();
    extraction.vendorRfc.value = 'BAD'; // Invalid

    const { result } = renderHook(() => useFormValidation(extraction));

    let isValid: boolean = true;
    act(() => {
      isValid = result.current.validateAll();
    });

    expect(isValid).toBe(false);
  });

  test('validateAll should check totals', () => {
    const { useFormValidation } = require('../../../src/renderer/hooks/useFormValidation');
    const extraction = createMockExtraction();
    extraction.total.value = '9999.00'; // Wrong total

    const { result } = renderHook(() => useFormValidation(extraction));

    let isValid: boolean = true;
    act(() => {
      isValid = result.current.validateAll();
    });

    expect(isValid).toBe(false);
    expect(result.current.errors.total).toBeDefined();
  });
});

// =============================================================================
// Edge Cases
// =============================================================================

describe('Edge Cases', () => {
  test('should handle null extraction gracefully', () => {
    const { useFormValidation } = require('../../../src/renderer/hooks/useFormValidation');

    // Should not throw
    expect(() => {
      renderHook(() => useFormValidation(null as any));
    }).not.toThrow();
  });

  test('should update when extraction changes', () => {
    const { useFormValidation } = require('../../../src/renderer/hooks/useFormValidation');
    const extraction1 = createMockExtraction();
    extraction1.vendorRfc.value = 'BAD';

    const extraction2 = createMockExtraction();
    extraction2.vendorRfc.value = 'XAXX010101000';

    const { result, rerender } = renderHook(
      ({ extraction }) => useFormValidation(extraction),
      { initialProps: { extraction: extraction1 } }
    );

    act(() => {
      result.current.validateAll();
    });
    expect(result.current.isValid).toBe(false);

    // Rerender with new extraction
    rerender({ extraction: extraction2 });

    // Errors should be cleared on new extraction
    expect(result.current.errors).toEqual({});
    expect(result.current.isValid).toBe(true);
  });

  test('should handle zero amounts', () => {
    const { useFormValidation } = require('../../../src/renderer/hooks/useFormValidation');
    const extraction = createMockExtraction();
    extraction.subtotal.value = '0.00';
    extraction.ivaAmount.value = '0.00';
    extraction.total.value = '0.00';

    const { result } = renderHook(() => useFormValidation(extraction));

    act(() => {
      result.current.validateTotals();
    });

    // Zero invoice should be valid
    expect(result.current.errors.total).toBeUndefined();
  });

  test('should handle very large amounts', () => {
    const { useFormValidation } = require('../../../src/renderer/hooks/useFormValidation');
    const extraction = createMockExtraction();
    extraction.subtotal.value = '1000000.00';
    extraction.ivaAmount.value = '160000.00';
    extraction.total.value = '1160000.00';

    const { result } = renderHook(() => useFormValidation(extraction));

    act(() => {
      result.current.validateTotals();
    });

    expect(result.current.errors.total).toBeUndefined();
  });
});
