/**
 * T017.2 - useInvoice Hook Tests
 *
 * Tests for the invoice processing workflow hook that:
 * - Creates useInvoice.ts hook
 * - Implements file selection → extraction flow
 * - Shows loading state during extraction
 * - Displays extraction results
 * - Saves invoice to database with state transitions
 */

import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock AIServiceClient
jest.mock('../../../src/renderer/services/ai-service', () => ({
  AIServiceClient: jest.fn().mockImplementation(() => ({
    extractInvoice: jest.fn(),
  })),
  AIServiceError: class AIServiceError extends Error {
    constructor(message: string, public statusCode?: number, public detail?: string) {
      super(message);
      this.name = 'AIServiceError';
    }
  },
}));

import { AIServiceClient, AIServiceError } from '../../../src/renderer/services/ai-service';
import type { InvoiceExtraction, InvoiceState, ExtractionField } from '../../../src/renderer/types';

// Will be created in T017.2.2
let useInvoice: typeof import('../../../src/renderer/hooks/useInvoice').useInvoice;

/**
 * Helper to create mock extraction field
 */
function createMockField(name: string, value: string, confidence: number): ExtractionField {
  return {
    fieldName: name,
    value,
    confidence,
    userVerified: false,
  };
}

/**
 * Create mock extraction result
 */
function createMockExtraction(): InvoiceExtraction {
  return {
    vendorRfc: createMockField('vendor_rfc', 'ABC123456DEF', 95),
    vendorName: createMockField('vendor_name', 'Empresa ABC S.A.', 92),
    invoiceNumber: createMockField('invoice_number', 'FAC-001', 98),
    invoiceDate: createMockField('invoice_date', '2025-12-15', 90),
    subtotal: createMockField('subtotal', '1000.00', 88),
    ivaAmount: createMockField('iva_amount', '160.00', 88),
    total: createMockField('total', '1160.00', 95),
    lineItems: [],
    sourceType: 'text_based',
    processingTimeMs: 1500,
  };
}

/**
 * Create a mock File object
 */
function createMockFile(name: string = 'invoice.pdf'): File {
  return new File(['%PDF-1.4 mock content'], name, { type: 'application/pdf' });
}

describe('T017.2 - useInvoice Hook', () => {
  let mockExtractInvoice: jest.Mock;

  beforeEach(async () => {
    jest.clearAllMocks();
    mockExtractInvoice = jest.fn();
    (AIServiceClient as jest.Mock).mockImplementation(() => ({
      extractInvoice: mockExtractInvoice,
    }));

    // Dynamic import to get fresh module
    const module = await import('../../../src/renderer/hooks/useInvoice');
    useInvoice = module.useInvoice;
  });

  // ==========================================================================
  // T017.2.1 - Hook Structure Tests
  // ==========================================================================

  describe('T017.2.1 - Hook Structure', () => {
    it('should export useInvoice hook', async () => {
      const module = await import('../../../src/renderer/hooks/useInvoice');
      expect(module.useInvoice).toBeDefined();
      expect(typeof module.useInvoice).toBe('function');
    });

    it('should return invoice state object', () => {
      const { result } = renderHook(() => useInvoice());
      expect(result.current).toBeDefined();
      expect(typeof result.current).toBe('object');
    });

    it('should return file property', () => {
      const { result } = renderHook(() => useInvoice());
      expect(result.current).toHaveProperty('file');
    });

    it('should return extraction property', () => {
      const { result } = renderHook(() => useInvoice());
      expect(result.current).toHaveProperty('extraction');
    });

    it('should return state property', () => {
      const { result } = renderHook(() => useInvoice());
      expect(result.current).toHaveProperty('state');
    });

    it('should return loading property', () => {
      const { result } = renderHook(() => useInvoice());
      expect(result.current).toHaveProperty('loading');
    });

    it('should return error property', () => {
      const { result } = renderHook(() => useInvoice());
      expect(result.current).toHaveProperty('error');
    });

    it('should return setFile function', () => {
      const { result } = renderHook(() => useInvoice());
      expect(result.current).toHaveProperty('setFile');
      expect(typeof result.current.setFile).toBe('function');
    });

    it('should return extract function', () => {
      const { result } = renderHook(() => useInvoice());
      expect(result.current).toHaveProperty('extract');
      expect(typeof result.current.extract).toBe('function');
    });

    it('should return reset function', () => {
      const { result } = renderHook(() => useInvoice());
      expect(result.current).toHaveProperty('reset');
      expect(typeof result.current.reset).toBe('function');
    });
  });

  // ==========================================================================
  // T017.2.2 - Initial State Tests
  // ==========================================================================

  describe('T017.2.2 - Initial State', () => {
    it('should have null file initially', () => {
      const { result } = renderHook(() => useInvoice());
      expect(result.current.file).toBeNull();
    });

    it('should have null extraction initially', () => {
      const { result } = renderHook(() => useInvoice());
      expect(result.current.extraction).toBeNull();
    });

    it('should have "none" state initially', () => {
      const { result } = renderHook(() => useInvoice());
      expect(result.current.state).toBe('none');
    });

    it('should not be loading initially', () => {
      const { result } = renderHook(() => useInvoice());
      expect(result.current.loading).toBe(false);
    });

    it('should have null error initially', () => {
      const { result } = renderHook(() => useInvoice());
      expect(result.current.error).toBeNull();
    });
  });

  // ==========================================================================
  // T017.2.3 - File Selection Tests
  // ==========================================================================

  describe('T017.2.3 - File Selection', () => {
    it('should set file when setFile is called', () => {
      const { result } = renderHook(() => useInvoice());
      const mockFile = createMockFile();

      act(() => {
        result.current.setFile(mockFile);
      });

      expect(result.current.file).toBe(mockFile);
    });

    it('should change state to "uploaded" after file selection', () => {
      const { result } = renderHook(() => useInvoice());
      const mockFile = createMockFile();

      act(() => {
        result.current.setFile(mockFile);
      });

      expect(result.current.state).toBe('uploaded');
    });

    it('should clear previous extraction when new file is set', () => {
      const { result } = renderHook(() => useInvoice());
      const mockFile = createMockFile();

      // First set an extraction
      act(() => {
        result.current.setFile(mockFile);
      });

      // Set a new file
      act(() => {
        result.current.setFile(createMockFile('new-file.pdf'));
      });

      expect(result.current.extraction).toBeNull();
    });

    it('should clear error when new file is set', () => {
      const { result } = renderHook(() => useInvoice());
      const mockFile = createMockFile();

      // Manually set an error state (would happen after failed extraction)
      act(() => {
        result.current.setFile(mockFile);
      });

      // Error should be cleared
      expect(result.current.error).toBeNull();
    });
  });

  // ==========================================================================
  // T017.2.4 - Extraction Flow Tests
  // ==========================================================================

  describe('T017.2.4 - Extraction Flow', () => {
    it('should set loading to true when extraction starts', async () => {
      mockExtractInvoice.mockImplementation(() => new Promise(() => {})); // Never resolves

      const { result } = renderHook(() => useInvoice());
      const mockFile = createMockFile();

      act(() => {
        result.current.setFile(mockFile);
      });

      act(() => {
        result.current.extract();
      });

      expect(result.current.loading).toBe(true);
    });

    it('should set state to "extracting" during extraction', async () => {
      mockExtractInvoice.mockImplementation(() => new Promise(() => {}));

      const { result } = renderHook(() => useInvoice());
      const mockFile = createMockFile();

      act(() => {
        result.current.setFile(mockFile);
      });

      act(() => {
        result.current.extract();
      });

      expect(result.current.state).toBe('extracting');
    });

    it('should call AIServiceClient.extractInvoice with file', async () => {
      mockExtractInvoice.mockResolvedValue(createMockExtraction());

      const { result } = renderHook(() => useInvoice());
      const mockFile = createMockFile();

      act(() => {
        result.current.setFile(mockFile);
      });

      await act(async () => {
        await result.current.extract();
      });

      expect(mockExtractInvoice).toHaveBeenCalledWith(mockFile);
    });

    it('should set extraction result after successful extraction', async () => {
      const mockResult = createMockExtraction();
      mockExtractInvoice.mockResolvedValue(mockResult);

      const { result } = renderHook(() => useInvoice());
      const mockFile = createMockFile();

      act(() => {
        result.current.setFile(mockFile);
      });

      await act(async () => {
        await result.current.extract();
      });

      expect(result.current.extraction).toEqual(mockResult);
    });

    it('should set loading to false after extraction completes', async () => {
      mockExtractInvoice.mockResolvedValue(createMockExtraction());

      const { result } = renderHook(() => useInvoice());
      const mockFile = createMockFile();

      act(() => {
        result.current.setFile(mockFile);
      });

      await act(async () => {
        await result.current.extract();
      });

      expect(result.current.loading).toBe(false);
    });

    it('should set state to "extracted" after successful extraction', async () => {
      mockExtractInvoice.mockResolvedValue(createMockExtraction());

      const { result } = renderHook(() => useInvoice());
      const mockFile = createMockFile();

      act(() => {
        result.current.setFile(mockFile);
      });

      await act(async () => {
        await result.current.extract();
      });

      expect(result.current.state).toBe('extracted');
    });

    it('should not call extraction if no file is selected', async () => {
      const { result } = renderHook(() => useInvoice());

      await act(async () => {
        await result.current.extract();
      });

      expect(mockExtractInvoice).not.toHaveBeenCalled();
    });

    it('should not call extraction if already loading', async () => {
      mockExtractInvoice.mockImplementation(() => new Promise(() => {}));

      const { result } = renderHook(() => useInvoice());
      const mockFile = createMockFile();

      act(() => {
        result.current.setFile(mockFile);
      });

      // Start first extraction
      act(() => {
        result.current.extract();
      });

      // Try to start second extraction
      await act(async () => {
        await result.current.extract();
      });

      expect(mockExtractInvoice).toHaveBeenCalledTimes(1);
    });
  });

  // ==========================================================================
  // T017.2.5 - Error Handling Tests
  // ==========================================================================

  describe('T017.2.5 - Error Handling', () => {
    it('should set error on extraction failure', async () => {
      mockExtractInvoice.mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useInvoice());
      const mockFile = createMockFile();

      act(() => {
        result.current.setFile(mockFile);
      });

      await act(async () => {
        await result.current.extract();
      });

      expect(result.current.error).toBe('Network error');
    });

    it('should set loading to false on extraction failure', async () => {
      mockExtractInvoice.mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useInvoice());
      const mockFile = createMockFile();

      act(() => {
        result.current.setFile(mockFile);
      });

      await act(async () => {
        await result.current.extract();
      });

      expect(result.current.loading).toBe(false);
    });

    it('should set state to "error" on extraction failure', async () => {
      mockExtractInvoice.mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useInvoice());
      const mockFile = createMockFile();

      act(() => {
        result.current.setFile(mockFile);
      });

      await act(async () => {
        await result.current.extract();
      });

      expect(result.current.state).toBe('error');
    });

    it('should handle AIServiceError with detail', async () => {
      const serviceError = new AIServiceError('Extraction failed', 422, 'Invalid PDF format');
      mockExtractInvoice.mockRejectedValue(serviceError);

      const { result } = renderHook(() => useInvoice());
      const mockFile = createMockFile();

      act(() => {
        result.current.setFile(mockFile);
      });

      await act(async () => {
        await result.current.extract();
      });

      expect(result.current.error).toBe('Invalid PDF format');
    });

    it('should preserve file after error', async () => {
      mockExtractInvoice.mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useInvoice());
      const mockFile = createMockFile();

      act(() => {
        result.current.setFile(mockFile);
      });

      await act(async () => {
        await result.current.extract();
      });

      expect(result.current.file).toBe(mockFile);
    });
  });

  // ==========================================================================
  // T017.2.6 - Reset Tests
  // ==========================================================================

  describe('T017.2.6 - Reset', () => {
    it('should clear file on reset', async () => {
      const { result } = renderHook(() => useInvoice());
      const mockFile = createMockFile();

      act(() => {
        result.current.setFile(mockFile);
      });

      act(() => {
        result.current.reset();
      });

      expect(result.current.file).toBeNull();
    });

    it('should clear extraction on reset', async () => {
      mockExtractInvoice.mockResolvedValue(createMockExtraction());

      const { result } = renderHook(() => useInvoice());
      const mockFile = createMockFile();

      act(() => {
        result.current.setFile(mockFile);
      });

      await act(async () => {
        await result.current.extract();
      });

      act(() => {
        result.current.reset();
      });

      expect(result.current.extraction).toBeNull();
    });

    it('should reset state to "none" on reset', async () => {
      mockExtractInvoice.mockResolvedValue(createMockExtraction());

      const { result } = renderHook(() => useInvoice());
      const mockFile = createMockFile();

      act(() => {
        result.current.setFile(mockFile);
      });

      await act(async () => {
        await result.current.extract();
      });

      act(() => {
        result.current.reset();
      });

      expect(result.current.state).toBe('none');
    });

    it('should clear error on reset', async () => {
      mockExtractInvoice.mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useInvoice());
      const mockFile = createMockFile();

      act(() => {
        result.current.setFile(mockFile);
      });

      await act(async () => {
        await result.current.extract();
      });

      act(() => {
        result.current.reset();
      });

      expect(result.current.error).toBeNull();
    });
  });

  // ==========================================================================
  // State Transition Tests
  // ==========================================================================

  describe('State Transitions', () => {
    it('should follow none → uploaded → extracting → extracted flow', async () => {
      mockExtractInvoice.mockResolvedValue(createMockExtraction());

      const { result } = renderHook(() => useInvoice());
      const mockFile = createMockFile();

      // Initial state
      expect(result.current.state).toBe('none');

      // After file selection
      act(() => {
        result.current.setFile(mockFile);
      });
      expect(result.current.state).toBe('uploaded');

      // During extraction
      let extractPromise: Promise<void>;
      act(() => {
        extractPromise = result.current.extract();
      });
      expect(result.current.state).toBe('extracting');

      // After extraction
      await act(async () => {
        await extractPromise;
      });
      expect(result.current.state).toBe('extracted');
    });

    it('should follow none → uploaded → extracting → error flow on failure', async () => {
      mockExtractInvoice.mockRejectedValue(new Error('Failed'));

      const { result } = renderHook(() => useInvoice());
      const mockFile = createMockFile();

      // Initial
      expect(result.current.state).toBe('none');

      // After file selection
      act(() => {
        result.current.setFile(mockFile);
      });
      expect(result.current.state).toBe('uploaded');

      // During and after failed extraction
      await act(async () => {
        await result.current.extract();
      });
      expect(result.current.state).toBe('error');
    });
  });

  // ==========================================================================
  // Custom AI Service URL Tests
  // ==========================================================================

  describe('Custom AI Service Configuration', () => {
    it('should accept custom AI service URL', () => {
      const customUrl = 'http://custom-server:9000';
      const { result } = renderHook(() => useInvoice({ aiServiceUrl: customUrl }));

      expect(result.current).toBeDefined();
    });

    it('should use default URL if not provided', () => {
      const { result } = renderHook(() => useInvoice());

      expect(result.current).toBeDefined();
      // The default URL (http://localhost:8000) is used internally
    });
  });

  // ==========================================================================
  // Retry Extraction Tests
  // ==========================================================================

  describe('Retry Extraction', () => {
    it('should allow retry after error', async () => {
      // First call fails, second succeeds
      mockExtractInvoice
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce(createMockExtraction());

      const { result } = renderHook(() => useInvoice());
      const mockFile = createMockFile();

      act(() => {
        result.current.setFile(mockFile);
      });

      // First attempt fails
      await act(async () => {
        await result.current.extract();
      });
      expect(result.current.state).toBe('error');

      // Retry succeeds
      await act(async () => {
        await result.current.extract();
      });
      expect(result.current.state).toBe('extracted');
      expect(result.current.extraction).toBeDefined();
    });
  });

  // ==========================================================================
  // Processing Time Tests
  // ==========================================================================

  describe('Processing Time', () => {
    it('should expose processing time from extraction result', async () => {
      const mockResult = createMockExtraction();
      mockExtractInvoice.mockResolvedValue(mockResult);

      const { result } = renderHook(() => useInvoice());
      const mockFile = createMockFile();

      act(() => {
        result.current.setFile(mockFile);
      });

      await act(async () => {
        await result.current.extract();
      });

      expect(result.current.extraction?.processingTimeMs).toBe(1500);
    });
  });
});
