/**
 * API Service Mocks
 *
 * Provides mock implementations for API services
 * (AI service, Bridge service) for testing.
 */

import type { Invoice, Vendor, ExtractionField } from '@renderer/types';

/**
 * Mock AI Service responses
 */
export const mockAIService = {
  /**
   * Mock health check response
   */
  healthCheck: jest.fn().mockResolvedValue({
    status: 'healthy',
    version: '1.0.0',
    modelsLoaded: true,
    ocrAvailable: true,
    timestamp: new Date().toISOString(),
  }),

  /**
   * Mock extraction response
   */
  extractInvoice: jest.fn().mockResolvedValue({
    success: true,
    data: {
      vendorRfc: {
        value: 'XAXX010101000',
        confidence: 0.95,
        boundingBox: { x: 100, y: 100, width: 150, height: 20 },
      } as ExtractionField,
      vendorName: {
        value: 'Proveedor de Prueba S.A. de C.V.',
        confidence: 0.92,
        boundingBox: { x: 100, y: 130, width: 250, height: 20 },
      } as ExtractionField,
      invoiceNumber: {
        value: 'F-001',
        confidence: 0.98,
        boundingBox: { x: 400, y: 100, width: 80, height: 20 },
      } as ExtractionField,
      invoiceDate: {
        value: '2024-01-15',
        confidence: 0.96,
        boundingBox: { x: 400, y: 130, width: 100, height: 20 },
      } as ExtractionField,
      subtotal: {
        value: '10000.00',
        confidence: 0.94,
        boundingBox: { x: 400, y: 500, width: 100, height: 20 },
      } as ExtractionField,
      ivaAmount: {
        value: '1600.00',
        confidence: 0.94,
        boundingBox: { x: 400, y: 530, width: 100, height: 20 },
      } as ExtractionField,
      total: {
        value: '11600.00',
        confidence: 0.97,
        boundingBox: { x: 400, y: 560, width: 100, height: 20 },
      } as ExtractionField,
      lineItems: [],
    },
    sourceType: 'TEXT_BASED',
    processingTimeMs: 1500,
  }),

  /**
   * Reset all AI service mocks
   */
  reset: () => {
    mockAIService.healthCheck.mockClear();
    mockAIService.extractInvoice.mockClear();
  },
};

/**
 * Mock Bridge Service responses
 */
export const mockBridgeService = {
  /**
   * Mock health check response
   */
  healthCheck: jest.fn().mockResolvedValue({
    status: 'healthy',
    sdkVersion: '13.0.0',
    connected: true,
    company: 'Empresa de Prueba',
  }),

  /**
   * Mock vendor lookup
   */
  getVendorByRfc: jest.fn().mockResolvedValue(null),

  /**
   * Mock vendor list
   */
  getVendors: jest.fn().mockResolvedValue([]),

  /**
   * Mock vendor creation
   */
  createVendor: jest.fn().mockResolvedValue({
    id: '1',
    rfc: 'XAXX010101000',
    businessName: 'Proveedor de Prueba S.A. de C.V.',
    createdAt: new Date().toISOString(),
  } as Vendor),

  /**
   * Mock duplicate check
   */
  checkDuplicate: jest.fn().mockResolvedValue({
    isDuplicate: false,
    existingEntry: null,
  }),

  /**
   * Mock entry creation
   */
  createEntry: jest.fn().mockResolvedValue({
    success: true,
    folio: 'POL-001',
    entryDate: new Date().toISOString(),
  }),

  /**
   * Reset all Bridge service mocks
   */
  reset: () => {
    mockBridgeService.healthCheck.mockClear();
    mockBridgeService.getVendorByRfc.mockClear();
    mockBridgeService.getVendors.mockClear();
    mockBridgeService.createVendor.mockClear();
    mockBridgeService.checkDuplicate.mockClear();
    mockBridgeService.createEntry.mockClear();
  },
};

/**
 * Mock Database Service responses
 */
export const mockDatabaseService = {
  /**
   * Mock get invoices
   */
  getInvoices: jest.fn().mockResolvedValue([]),

  /**
   * Mock get invoice by ID
   */
  getInvoiceById: jest.fn().mockResolvedValue(null),

  /**
   * Mock save invoice
   */
  saveInvoice: jest.fn().mockResolvedValue({ id: '1' }),

  /**
   * Mock update invoice
   */
  updateInvoice: jest.fn().mockResolvedValue({ success: true }),

  /**
   * Mock delete invoice
   */
  deleteInvoice: jest.fn().mockResolvedValue({ success: true }),

  /**
   * Reset all Database service mocks
   */
  reset: () => {
    mockDatabaseService.getInvoices.mockClear();
    mockDatabaseService.getInvoiceById.mockClear();
    mockDatabaseService.saveInvoice.mockClear();
    mockDatabaseService.updateInvoice.mockClear();
    mockDatabaseService.deleteInvoice.mockClear();
  },
};

/**
 * Reset all API mocks
 */
export function resetAllMocks(): void {
  mockAIService.reset();
  mockBridgeService.reset();
  mockDatabaseService.reset();
}

export default {
  mockAIService,
  mockBridgeService,
  mockDatabaseService,
  resetAllMocks,
};
