/**
 * T015.1 - AI Service API Client Tests
 *
 * Tests for the AI service HTTP client that:
 * - Extracts invoice data from PDF files
 * - Checks AI service health status
 * - Handles network errors with retry logic
 * - Parses responses to TypeScript types
 */

import { InvoiceExtraction, ServiceHealth } from '../../../src/renderer/types';

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Import after setting up mock
import { AIServiceClient, AIServiceError } from '../../../src/renderer/services/ai-service';

describe('T015.1 - AI Service API Client', () => {
  let client: AIServiceClient;

  beforeEach(() => {
    jest.clearAllMocks();
    client = new AIServiceClient('http://localhost:8000');
  });

  // ==========================================================================
  // T015.1.1 - Client Structure Tests
  // ==========================================================================

  describe('T015.1.1 - Client Structure', () => {
    it('should export AIServiceClient class', () => {
      expect(AIServiceClient).toBeDefined();
      expect(typeof AIServiceClient).toBe('function');
    });

    it('should export AIServiceError class', () => {
      expect(AIServiceError).toBeDefined();
    });

    it('should create instance with base URL', () => {
      const customClient = new AIServiceClient('http://custom:9000');
      expect(customClient).toBeDefined();
    });

    it('should use default URL if none provided', () => {
      const defaultClient = new AIServiceClient();
      expect(defaultClient).toBeDefined();
    });

    it('should have extractInvoice method', () => {
      expect(typeof client.extractInvoice).toBe('function');
    });

    it('should have checkHealth method', () => {
      expect(typeof client.checkHealth).toBe('function');
    });

    it('should have extractBatch method', () => {
      expect(typeof client.extractBatch).toBe('function');
    });
  });

  // ==========================================================================
  // T015.1.2 - extractInvoice Tests
  // ==========================================================================

  describe('T015.1.2 - extractInvoice Method', () => {
    const mockExtractionResponse = {
      source_file: 'test.pdf',
      source_type: 'text_based',
      vendor_rfc: {
        field_name: 'vendor_rfc',
        value: 'ABC123456789',
        confidence: 0.95,
        user_verified: false,
      },
      vendor_name: {
        field_name: 'vendor_name',
        value: 'Test Company',
        confidence: 0.90,
        user_verified: false,
      },
      invoice_number: {
        field_name: 'invoice_number',
        value: 'INV-001',
        confidence: 0.85,
        user_verified: false,
      },
      invoice_date: {
        field_name: 'invoice_date',
        value: '2024-01-15',
        confidence: 0.88,
        user_verified: false,
      },
      subtotal: {
        field_name: 'subtotal',
        value: '1000.00',
        confidence: 0.92,
        user_verified: false,
      },
      iva_amount: {
        field_name: 'iva_amount',
        value: '160.00',
        confidence: 0.91,
        user_verified: false,
      },
      total: {
        field_name: 'total',
        value: '1160.00',
        confidence: 0.93,
        user_verified: false,
      },
      line_items: [],
      processing_time_ms: 150,
    };

    it('should call POST /extract endpoint', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockExtractionResponse),
      });

      const file = new File(['%PDF-1.4 test'], 'test.pdf', { type: 'application/pdf' });
      await client.extractInvoice(file);

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8000/extract',
        expect.objectContaining({
          method: 'POST',
        })
      );
    });

    it('should send file as multipart form data', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockExtractionResponse),
      });

      const file = new File(['%PDF-1.4 test'], 'invoice.pdf', { type: 'application/pdf' });
      await client.extractInvoice(file);

      const callArgs = mockFetch.mock.calls[0];
      const body = callArgs[1].body;
      expect(body).toBeInstanceOf(FormData);
    });

    it('should parse response to InvoiceExtraction type', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockExtractionResponse),
      });

      const file = new File(['%PDF-1.4 test'], 'test.pdf', { type: 'application/pdf' });
      const result = await client.extractInvoice(file);

      // Check camelCase conversion
      expect(result.vendorRfc).toBeDefined();
      expect(result.vendorRfc.fieldName).toBe('vendor_rfc');
      expect(result.vendorRfc.value).toBe('ABC123456789');
      expect(result.vendorRfc.confidence).toBe(95); // Converted to percentage
      expect(result.processingTimeMs).toBe(150);
    });

    it('should convert confidence from decimal to percentage', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockExtractionResponse),
      });

      const file = new File(['%PDF-1.4 test'], 'test.pdf', { type: 'application/pdf' });
      const result = await client.extractInvoice(file);

      expect(result.vendorRfc.confidence).toBe(95); // 0.95 * 100
      expect(result.total.confidence).toBe(93); // 0.93 * 100
    });

    it('should handle extraction with line items', async () => {
      const responseWithItems = {
        ...mockExtractionResponse,
        line_items: [
          {
            description: 'Product A',
            quantity: 2,
            unit_price: 500.00,
            amount: 1000.00,
            confidence: 0.85,
          },
        ],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(responseWithItems),
      });

      const file = new File(['%PDF-1.4 test'], 'test.pdf', { type: 'application/pdf' });
      const result = await client.extractInvoice(file);

      expect(result.lineItems).toHaveLength(1);
      expect(result.lineItems[0].description).toBe('Product A');
      expect(result.lineItems[0].unitPrice).toBe(500.00);
      expect(result.lineItems[0].confidence).toBe(85);
    });

    it('should throw AIServiceError on 400 response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: () => Promise.resolve({ detail: 'El archivo no es un PDF válido' }),
      });

      const file = new File(['not a pdf'], 'test.txt', { type: 'text/plain' });

      await expect(client.extractInvoice(file)).rejects.toThrow(AIServiceError);
    });

    it('should include error detail in AIServiceError', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: () => Promise.resolve({ detail: 'El archivo no es un PDF válido' }),
      });

      const file = new File(['not a pdf'], 'test.txt', { type: 'text/plain' });

      await expect(client.extractInvoice(file)).rejects.toThrow(/PDF/);
    });

    it('should throw AIServiceError on 413 response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 413,
        json: () => Promise.resolve({ detail: 'El archivo excede el tamaño máximo' }),
      });

      const file = new File(['large content'], 'huge.pdf', { type: 'application/pdf' });

      await expect(client.extractInvoice(file)).rejects.toThrow(AIServiceError);
    });

    it('should throw AIServiceError on 500 response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ detail: 'Error interno del servidor' }),
      });

      const file = new File(['%PDF-1.4'], 'test.pdf', { type: 'application/pdf' });

      await expect(client.extractInvoice(file)).rejects.toThrow(AIServiceError);
    });
  });

  // ==========================================================================
  // T015.1.3 - checkHealth Tests
  // ==========================================================================

  describe('T015.1.3 - checkHealth Method', () => {
    const mockHealthResponse = {
      status: 'running',
      healthy: true,
      version: '1.0.0',
      timestamp: '2024-01-15T10:30:00Z',
    };

    it('should call GET /health endpoint', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockHealthResponse),
      });

      await client.checkHealth();

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8000/health',
        expect.objectContaining({
          method: 'GET',
        })
      );
    });

    it('should return ServiceHealth object', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockHealthResponse),
      });

      const result = await client.checkHealth();

      expect(result.status).toBe('running');
      expect(result.healthy).toBe(true);
      expect(result.version).toBe('1.0.0');
    });

    it('should return unhealthy status on error response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 503,
        json: () => Promise.resolve({ detail: 'Service unavailable' }),
      });

      const result = await client.checkHealth();

      expect(result.healthy).toBe(false);
      expect(result.status).toBe('error');
    });

    it('should return unhealthy status on network failure', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await client.checkHealth();

      expect(result.healthy).toBe(false);
      expect(result.status).toBe('stopped');
    });
  });

  // ==========================================================================
  // T015.1.4 - Network Error Handling
  // ==========================================================================

  describe('T015.1.4 - Network Error Handling', () => {
    it('should retry on network failure', async () => {
      // Fail twice, then succeed
      mockFetch
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            source_file: 'test.pdf',
            source_type: 'text_based',
            processing_time_ms: 100,
          }),
        });

      const file = new File(['%PDF-1.4'], 'test.pdf', { type: 'application/pdf' });
      const result = await client.extractInvoice(file);

      expect(mockFetch).toHaveBeenCalledTimes(3);
      expect(result).toBeDefined();
    });

    it('should throw after max retries exceeded', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      const file = new File(['%PDF-1.4'], 'test.pdf', { type: 'application/pdf' });

      await expect(client.extractInvoice(file)).rejects.toThrow(/Network error/);
      expect(mockFetch).toHaveBeenCalledTimes(3); // Default max retries
    });

    it('should not retry on 4xx errors', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 400,
        json: () => Promise.resolve({ detail: 'Bad request' }),
      });

      const file = new File(['not pdf'], 'test.txt', { type: 'text/plain' });

      await expect(client.extractInvoice(file)).rejects.toThrow(AIServiceError);
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('should retry on 5xx errors', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: false,
          status: 503,
          json: () => Promise.resolve({ detail: 'Service temporarily unavailable' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            source_file: 'test.pdf',
            source_type: 'text_based',
            processing_time_ms: 100,
          }),
        });

      const file = new File(['%PDF-1.4'], 'test.pdf', { type: 'application/pdf' });
      const result = await client.extractInvoice(file);

      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(result).toBeDefined();
    });
  });

  // ==========================================================================
  // T015.1.5 - Batch Extraction Tests
  // ==========================================================================

  describe('T015.1.5 - extractBatch Method', () => {
    const mockBatchResponse = {
      results: [
        {
          filename: 'invoice1.pdf',
          success: true,
          extraction: {
            source_file: 'invoice1.pdf',
            source_type: 'text_based',
            processing_time_ms: 100,
          },
        },
        {
          filename: 'invoice2.pdf',
          success: false,
          error: 'Invalid PDF format',
        },
      ],
      total_files: 2,
      successful: 1,
      failed: 1,
      total_processing_time_ms: 200,
    };

    it('should call POST /extract/batch endpoint', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockBatchResponse),
      });

      const files = [
        new File(['%PDF-1.4'], 'invoice1.pdf', { type: 'application/pdf' }),
        new File(['%PDF-1.4'], 'invoice2.pdf', { type: 'application/pdf' }),
      ];

      await client.extractBatch(files);

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8000/extract/batch',
        expect.objectContaining({
          method: 'POST',
        })
      );
    });

    it('should send multiple files as form data', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockBatchResponse),
      });

      const files = [
        new File(['%PDF-1.4'], 'invoice1.pdf', { type: 'application/pdf' }),
        new File(['%PDF-1.4'], 'invoice2.pdf', { type: 'application/pdf' }),
      ];

      await client.extractBatch(files);

      const callArgs = mockFetch.mock.calls[0];
      const body = callArgs[1].body;
      expect(body).toBeInstanceOf(FormData);
    });

    it('should parse batch response correctly', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockBatchResponse),
      });

      const files = [
        new File(['%PDF-1.4'], 'invoice1.pdf', { type: 'application/pdf' }),
        new File(['%PDF-1.4'], 'invoice2.pdf', { type: 'application/pdf' }),
      ];

      const result = await client.extractBatch(files);

      expect(result.totalFiles).toBe(2);
      expect(result.successful).toBe(1);
      expect(result.failed).toBe(1);
      expect(result.results).toHaveLength(2);
    });

    it('should handle successful and failed results', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockBatchResponse),
      });

      const files = [
        new File(['%PDF-1.4'], 'invoice1.pdf', { type: 'application/pdf' }),
        new File(['%PDF-1.4'], 'invoice2.pdf', { type: 'application/pdf' }),
      ];

      const result = await client.extractBatch(files);

      // First result is successful
      expect(result.results[0].success).toBe(true);
      expect(result.results[0].extraction).toBeDefined();

      // Second result failed
      expect(result.results[1].success).toBe(false);
      expect(result.results[1].error).toBe('Invalid PDF format');
    });

    it('should throw on batch size limit exceeded', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 422,
        json: () => Promise.resolve({ detail: 'Batch size exceeds maximum of 20 files' }),
      });

      const files = Array.from({ length: 25 }, (_, i) =>
        new File(['%PDF-1.4'], `invoice${i}.pdf`, { type: 'application/pdf' })
      );

      await expect(client.extractBatch(files)).rejects.toThrow(AIServiceError);
    });
  });

  // ==========================================================================
  // T015.1.6 - Response Type Conversion
  // ==========================================================================

  describe('T015.1.6 - Response Type Conversion', () => {
    it('should convert snake_case to camelCase in response', async () => {
      const snakeCaseResponse = {
        source_file: 'test.pdf',
        source_type: 'scanned',
        vendor_rfc: {
          field_name: 'vendor_rfc',
          value: 'TEST123',
          confidence: 0.9,
          user_verified: false,
        },
        processing_time_ms: 500,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(snakeCaseResponse),
      });

      const file = new File(['%PDF-1.4'], 'test.pdf', { type: 'application/pdf' });
      const result = await client.extractInvoice(file);

      expect(result.sourceType).toBe('scanned');
      expect(result.processingTimeMs).toBe(500);
      expect(result.vendorRfc.fieldName).toBe('vendor_rfc');
      expect(result.vendorRfc.userVerified).toBe(false);
    });

    it('should handle optional fields being null', async () => {
      const responseWithNulls = {
        source_file: 'test.pdf',
        source_type: 'text_based',
        vendor_rfc: null,
        vendor_name: null,
        invoice_number: null,
        invoice_date: null,
        subtotal: null,
        iva_amount: null,
        total: null,
        line_items: [],
        processing_time_ms: 100,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(responseWithNulls),
      });

      const file = new File(['%PDF-1.4'], 'test.pdf', { type: 'application/pdf' });
      const result = await client.extractInvoice(file);

      // Null fields should be converted to empty fields with confidence 0
      expect(result.vendorRfc.value).toBe('');
      expect(result.vendorRfc.confidence).toBe(0);
      expect(result.lineItems).toEqual([]);
    });

    it('should handle bounding box conversion', async () => {
      const responseWithBbox = {
        source_file: 'test.pdf',
        source_type: 'text_based',
        vendor_rfc: {
          field_name: 'vendor_rfc',
          value: 'TEST123',
          confidence: 0.95,
          user_verified: false,
          bbox: {
            x: 100,
            y: 200,
            width: 150,
            height: 20,
          },
        },
        processing_time_ms: 100,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(responseWithBbox),
      });

      const file = new File(['%PDF-1.4'], 'test.pdf', { type: 'application/pdf' });
      const result = await client.extractInvoice(file);

      expect(result.vendorRfc.bbox).toBeDefined();
      expect(result.vendorRfc.bbox?.x).toBe(100);
      expect(result.vendorRfc.bbox?.width).toBe(150);
    });

    it('should convert line item unit_price to unitPrice', async () => {
      const responseWithLineItems = {
        source_file: 'test.pdf',
        source_type: 'text_based',
        line_items: [
          {
            description: 'Item 1',
            quantity: 5,
            unit_price: 199.99,
            amount: 999.95,
            confidence: 0.88,
          },
        ],
        processing_time_ms: 100,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(responseWithLineItems),
      });

      const file = new File(['%PDF-1.4'], 'test.pdf', { type: 'application/pdf' });
      const result = await client.extractInvoice(file);

      expect(result.lineItems[0].unitPrice).toBe(199.99);
    });
  });

  // ==========================================================================
  // T015.1.7 - Timeout Tests
  // ==========================================================================

  describe('T015.1.7 - Request Timeout', () => {
    it('should support custom timeout', () => {
      const customClient = new AIServiceClient('http://localhost:8000', { timeout: 30000 });
      expect(customClient).toBeDefined();
    });

    it('should throw on timeout', async () => {
      // Mock AbortController behavior
      mockFetch.mockImplementationOnce(() => {
        return new Promise((_, reject) => {
          setTimeout(() => {
            reject(new DOMException('Aborted', 'AbortError'));
          }, 10);
        });
      });

      const clientWithTimeout = new AIServiceClient('http://localhost:8000', { timeout: 1 });
      const file = new File(['%PDF-1.4'], 'test.pdf', { type: 'application/pdf' });

      await expect(clientWithTimeout.extractInvoice(file)).rejects.toThrow();
    });
  });
});
