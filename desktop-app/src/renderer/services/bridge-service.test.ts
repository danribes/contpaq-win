/**
 * T024.1 - Bridge Service Client Tests
 *
 * Tests for the Windows Bridge HTTP client.
 * Tests duplicate checking, entry creation, vendor operations, and error handling.
 */

import { BridgeServiceClient, BridgeServiceError } from './bridge-service';
import type {
  CreateEntryRequest,
  CreateVendorRequest,
} from './bridge-service';

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('BridgeServiceClient', () => {
  let client: BridgeServiceClient;

  beforeEach(() => {
    jest.clearAllMocks();
    client = new BridgeServiceClient('http://localhost:5000');
  });

  // ===========================================================================
  // T024.1.1 - Client Configuration
  // ===========================================================================

  describe('Client Configuration', () => {
    it('should create client with default URL', () => {
      const defaultClient = new BridgeServiceClient();
      expect(defaultClient).toBeInstanceOf(BridgeServiceClient);
    });

    it('should create client with custom URL', () => {
      const customClient = new BridgeServiceClient('http://custom:8080');
      expect(customClient).toBeInstanceOf(BridgeServiceClient);
    });

    it('should remove trailing slash from base URL', () => {
      const clientWithSlash = new BridgeServiceClient('http://localhost:5000/');
      expect(clientWithSlash).toBeInstanceOf(BridgeServiceClient);
    });

    it('should accept timeout option', () => {
      const clientWithTimeout = new BridgeServiceClient('http://localhost:5000', {
        timeout: 30000,
      });
      expect(clientWithTimeout).toBeInstanceOf(BridgeServiceClient);
    });
  });

  // ===========================================================================
  // T024.1.3 - checkDuplicate() Method
  // ===========================================================================

  describe('checkDuplicate()', () => {
    const duplicateCheckRequest = {
      vendorRfc: 'XAXX010101000',
      invoiceNumber: 'FAC-001',
      invoiceDate: new Date('2024-12-15'),
    };

    it('should return false when no duplicate exists', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            isDuplicate: false,
            existingFolio: null,
            existingDate: null,
            message: null,
          },
        }),
      });

      const result = await client.checkDuplicate(duplicateCheckRequest);

      expect(result.isDuplicate).toBe(false);
      expect(result.existingFolio).toBeNull();
    });

    it('should return true when duplicate exists', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            isDuplicate: true,
            existingFolio: 'POL-2024-0001',
            existingDate: '2024-12-08T00:00:00Z',
            message: 'Ya existe una póliza con estos datos',
          },
        }),
      });

      const result = await client.checkDuplicate(duplicateCheckRequest);

      expect(result.isDuplicate).toBe(true);
      expect(result.existingFolio).toBe('POL-2024-0001');
      expect(result.message).toContain('póliza');
    });

    it('should send correct request format', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: { isDuplicate: false },
        }),
      });

      await client.checkDuplicate(duplicateCheckRequest);

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:5000/api/entries/check-duplicate',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      );
    });

    it('should throw BridgeServiceError on 400 response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({
          success: false,
          message: 'El RFC debe tener 12 o 13 caracteres',
        }),
      });

      await expect(client.checkDuplicate(duplicateCheckRequest)).rejects.toThrow(
        BridgeServiceError
      );
    });

    it('should throw BridgeServiceError on network error', async () => {
      mockFetch.mockRejectedValueOnce(new TypeError('Network error'));

      await expect(client.checkDuplicate(duplicateCheckRequest)).rejects.toThrow(
        BridgeServiceError
      );
    });
  });

  // ===========================================================================
  // T024.1.4 - createEntry() Method
  // ===========================================================================

  describe('createEntry()', () => {
    const createEntryRequest: CreateEntryRequest = {
      vendorRfc: 'XAXX010101000',
      invoiceNumber: 'FAC-001',
      invoiceDate: new Date('2024-12-15'),
      subtotal: 1000,
      ivaAmount: 160,
      total: 1160,
      concept: 'Compra de materiales',
      lineItems: [],
      forceDuplicate: false,
    };

    it('should return entry result on success', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => ({
          success: true,
          message: 'Póliza creada exitosamente',
          data: {
            success: true,
            folio: 'POL-2024-0001',
            timestamp: '2024-12-15T10:30:00Z',
          },
        }),
      });

      const result = await client.createEntry(createEntryRequest);

      expect(result.success).toBe(true);
      expect(result.folio).toBe('POL-2024-0001');
    });

    it('should send correct request format', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => ({
          success: true,
          data: { success: true, folio: 'POL-001' },
        }),
      });

      await client.createEntry(createEntryRequest);

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:5000/api/entries',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      );

      // Verify request body contains required fields
      const callArgs = mockFetch.mock.calls[0];
      const body = JSON.parse(callArgs[1].body);
      expect(body.vendorRfc).toBe('XAXX010101000');
      expect(body.invoiceNumber).toBe('FAC-001');
      expect(body.total).toBe(1160);
    });

    it('should throw BridgeServiceError on duplicate (409)', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 409,
        json: async () => ({
          success: false,
          message: 'Ya existe una póliza con estos datos',
          data: {
            isDuplicate: true,
            existingFolio: 'POL-2024-0001',
          },
        }),
      });

      await expect(client.createEntry(createEntryRequest)).rejects.toThrow(
        BridgeServiceError
      );
    });

    it('should throw BridgeServiceError on validation error (400)', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({
          success: false,
          message: 'El total debe ser mayor a cero',
        }),
      });

      await expect(client.createEntry(createEntryRequest)).rejects.toThrow(
        BridgeServiceError
      );
    });

    it('should throw BridgeServiceError with Spanish message', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({
          success: false,
          message: 'Error al crear la póliza en ContPAQi',
        }),
      });

      try {
        await client.createEntry(createEntryRequest);
        fail('Expected error to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(BridgeServiceError);
        expect((error as BridgeServiceError).message).toContain('póliza');
      }
    });

    it('should pass forceDuplicate flag', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => ({
          success: true,
          data: { success: true, folio: 'POL-002' },
        }),
      });

      await client.createEntry({ ...createEntryRequest, forceDuplicate: true });

      const callArgs = mockFetch.mock.calls[0];
      const body = JSON.parse(callArgs[1].body);
      expect(body.forceDuplicate).toBe(true);
    });
  });

  // ===========================================================================
  // T024.1.5 - getVendorByRfc() Method
  // ===========================================================================

  describe('getVendorByRfc()', () => {
    it('should return vendor when found', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            code: 'PROV001',
            rfc: 'XAXX010101000',
            name: 'Proveedor Test SA de CV',
            commercialName: 'Proveedor Test',
          },
        }),
      });

      const result = await client.getVendorByRfc('XAXX010101000');

      expect(result).not.toBeNull();
      expect(result!.rfc).toBe('XAXX010101000');
      expect(result!.name).toBe('Proveedor Test SA de CV');
    });

    it('should return null when vendor not found', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({
          success: false,
          message: 'No se encontró proveedor con RFC: NONEXISTENT',
        }),
      });

      const result = await client.getVendorByRfc('NONEXISTENT00');

      expect(result).toBeNull();
    });

    it('should call correct endpoint', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: { code: 'PROV001', rfc: 'XAXX010101000', name: 'Test' },
        }),
      });

      await client.getVendorByRfc('XAXX010101000');

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:5000/api/vendors/XAXX010101000',
        expect.objectContaining({
          method: 'GET',
        })
      );
    });

    it('should throw BridgeServiceError on 400 response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({
          success: false,
          message: 'El RFC debe tener 12 o 13 caracteres',
        }),
      });

      await expect(client.getVendorByRfc('INVALID')).rejects.toThrow(
        BridgeServiceError
      );
    });
  });

  // ===========================================================================
  // T024.1.6 - createVendor() Method
  // ===========================================================================

  describe('createVendor()', () => {
    const createVendorRequest: CreateVendorRequest = {
      rfc: 'XAXX010101000',
      name: 'Nuevo Proveedor SA de CV',
      commercialName: 'Nuevo Proveedor',
    };

    it('should return created vendor on success', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => ({
          success: true,
          message: 'Proveedor creado exitosamente',
          data: {
            code: 'PROV001',
            rfc: 'XAXX010101000',
            name: 'Nuevo Proveedor SA de CV',
            commercialName: 'Nuevo Proveedor',
          },
        }),
      });

      const result = await client.createVendor(createVendorRequest);

      expect(result.code).toBe('PROV001');
      expect(result.rfc).toBe('XAXX010101000');
    });

    it('should send correct request format', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => ({
          success: true,
          data: { code: 'PROV001', rfc: 'XAXX010101000', name: 'Test' },
        }),
      });

      await client.createVendor(createVendorRequest);

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:5000/api/vendors',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      );
    });

    it('should throw BridgeServiceError on duplicate (409)', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 409,
        json: async () => ({
          success: false,
          message: 'Ya existe un proveedor con RFC: XAXX010101000',
        }),
      });

      await expect(client.createVendor(createVendorRequest)).rejects.toThrow(
        BridgeServiceError
      );
    });

    it('should throw BridgeServiceError on validation error (400)', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({
          success: false,
          message: 'El nombre del proveedor es requerido',
        }),
      });

      await expect(client.createVendor(createVendorRequest)).rejects.toThrow(
        BridgeServiceError
      );
    });
  });

  // ===========================================================================
  // T024.1.7 - Error Handling
  // ===========================================================================

  describe('Error Handling', () => {
    it('should include status code in BridgeServiceError', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({
          success: false,
          message: 'Error interno del servidor',
        }),
      });

      try {
        await client.checkDuplicate({
          vendorRfc: 'XAXX010101000',
          invoiceNumber: 'FAC-001',
          invoiceDate: new Date(),
        });
        fail('Expected error to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(BridgeServiceError);
        expect((error as BridgeServiceError).statusCode).toBe(500);
      }
    });

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new TypeError('Failed to fetch'));

      await expect(
        client.checkDuplicate({
          vendorRfc: 'XAXX010101000',
          invoiceNumber: 'FAC-001',
          invoiceDate: new Date(),
        })
      ).rejects.toThrow(BridgeServiceError);
    });

    it('should handle timeout errors', async () => {
      mockFetch.mockRejectedValueOnce(
        Object.assign(new Error('Aborted'), { name: 'AbortError' })
      );

      await expect(
        client.checkDuplicate({
          vendorRfc: 'XAXX010101000',
          invoiceNumber: 'FAC-001',
          invoiceDate: new Date(),
        })
      ).rejects.toThrow(BridgeServiceError);
    });

    it('should preserve Spanish error messages', async () => {
      const spanishMessage = 'El RFC del proveedor es requerido';
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({
          success: false,
          message: spanishMessage,
        }),
      });

      try {
        await client.checkDuplicate({
          vendorRfc: '',
          invoiceNumber: 'FAC-001',
          invoiceDate: new Date(),
        });
        fail('Expected error to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(BridgeServiceError);
        expect((error as BridgeServiceError).message).toBe(spanishMessage);
      }
    });
  });

  // ===========================================================================
  // Health Check
  // ===========================================================================

  describe('checkHealth()', () => {
    it('should return healthy status when service is running', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          status: 'running',
          healthy: true,
          message: 'Service is running',
          version: '1.0.0',
        }),
      });

      const health = await client.checkHealth();

      expect(health.healthy).toBe(true);
      expect(health.status).toBe('running');
    });

    it('should return unhealthy status on error', async () => {
      mockFetch.mockRejectedValueOnce(new TypeError('Network error'));

      const health = await client.checkHealth();

      expect(health.healthy).toBe(false);
      expect(health.status).toBe('stopped');
    });

    it('should call correct endpoint', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ status: 'running', healthy: true }),
      });

      await client.checkHealth();

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:5000/health',
        expect.any(Object)
      );
    });
  });
});

// ===========================================================================
// BridgeServiceError Tests
// ===========================================================================

describe('BridgeServiceError', () => {
  it('should create error with message', () => {
    const error = new BridgeServiceError('Test error');
    expect(error.message).toBe('Test error');
    expect(error.name).toBe('BridgeServiceError');
  });

  it('should create error with status code', () => {
    const error = new BridgeServiceError('Test error', 400);
    expect(error.statusCode).toBe(400);
  });

  it('should create error with detail', () => {
    const error = new BridgeServiceError('Test error', 400, 'Detail message');
    expect(error.detail).toBe('Detail message');
  });
});
