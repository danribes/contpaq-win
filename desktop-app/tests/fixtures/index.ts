/**
 * Test Fixtures
 *
 * Sample data for testing the desktop application.
 */

import type { Invoice, Vendor, LineItem, ExtractionField, ContPAQiEntry } from '@renderer/types';

/**
 * Sample extraction field with high confidence
 */
export function createExtractionField(
  value: string,
  confidence: number = 0.95
): ExtractionField {
  return {
    value,
    confidence,
    boundingBox: {
      x: Math.random() * 500,
      y: Math.random() * 700,
      width: 100,
      height: 20,
    },
  };
}

/**
 * Sample vendor for testing
 */
export const sampleVendor: Vendor = {
  id: '1',
  rfc: 'XAXX010101000',
  businessName: 'Proveedor de Prueba S.A. de C.V.',
  address: 'Av. Principal 123, Col. Centro, Ciudad de México, CDMX, 06000',
  contactInfo: 'contacto@proveedor.com',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

/**
 * Sample line item for testing
 */
export const sampleLineItem: LineItem = {
  id: '1',
  description: 'Servicio de consultoría',
  quantity: 1,
  unitPrice: 10000.0,
  amount: 10000.0,
  confidence: 0.92,
};

/**
 * Sample line items array
 */
export const sampleLineItems: LineItem[] = [
  {
    id: '1',
    description: 'Servicio de consultoría',
    quantity: 1,
    unitPrice: 5000.0,
    amount: 5000.0,
    confidence: 0.95,
  },
  {
    id: '2',
    description: 'Desarrollo de software',
    quantity: 2,
    unitPrice: 2500.0,
    amount: 5000.0,
    confidence: 0.93,
  },
];

/**
 * Sample invoice for testing
 */
export const sampleInvoice: Invoice = {
  id: '1',
  vendorRfc: 'XAXX010101000',
  vendorName: 'Proveedor de Prueba S.A. de C.V.',
  invoiceNumber: 'F-001',
  invoiceDate: '2024-01-15',
  subtotal: 10000.0,
  ivaAmount: 1600.0,
  total: 11600.0,
  state: 'EXTRACTED',
  sourceType: 'TEXT_BASED',
  pdfPath: '/path/to/invoice.pdf',
  lineItems: sampleLineItems,
  createdAt: '2024-01-15T10:00:00.000Z',
  updatedAt: '2024-01-15T10:00:00.000Z',
};

/**
 * Sample invoices in different states
 */
export const sampleInvoices: Invoice[] = [
  {
    ...sampleInvoice,
    id: '1',
    state: 'UPLOADED',
    invoiceNumber: 'F-001',
  },
  {
    ...sampleInvoice,
    id: '2',
    state: 'EXTRACTED',
    invoiceNumber: 'F-002',
  },
  {
    ...sampleInvoice,
    id: '3',
    state: 'VALIDATED',
    invoiceNumber: 'F-003',
  },
  {
    ...sampleInvoice,
    id: '4',
    state: 'POSTED',
    invoiceNumber: 'F-004',
  },
];

/**
 * Sample ContPAQi entry for testing
 */
export const sampleContPAQiEntry: ContPAQiEntry = {
  id: '1',
  invoiceId: '1',
  folio: 'POL-001',
  entryDate: '2024-01-15T12:00:00.000Z',
  status: 'POSTED',
  createdAt: '2024-01-15T12:00:00.000Z',
};

/**
 * Sample extraction result for testing
 */
export const sampleExtractionResult = {
  vendorRfc: createExtractionField('XAXX010101000', 0.95),
  vendorName: createExtractionField('Proveedor de Prueba S.A. de C.V.', 0.92),
  invoiceNumber: createExtractionField('F-001', 0.98),
  invoiceDate: createExtractionField('2024-01-15', 0.96),
  subtotal: createExtractionField('10000.00', 0.94),
  ivaAmount: createExtractionField('1600.00', 0.94),
  total: createExtractionField('11600.00', 0.97),
  lineItems: sampleLineItems,
  sourceType: 'TEXT_BASED' as const,
  processingTimeMs: 1500,
};

/**
 * Sample validation errors for testing
 */
export const sampleValidationErrors = {
  rfcInvalid: {
    field: 'vendorRfc',
    message: 'RFC inválido',
    code: 'INVALID_RFC',
  },
  totalMismatch: {
    field: 'total',
    message: 'El total no coincide con subtotal + IVA',
    code: 'TOTAL_MISMATCH',
  },
  ivaMismatch: {
    field: 'ivaAmount',
    message: 'El IVA no corresponde al 16% del subtotal',
    code: 'IVA_MISMATCH',
  },
};

/**
 * Sample vendors list for testing
 */
export const sampleVendors: Vendor[] = [
  sampleVendor,
  {
    id: '2',
    rfc: 'ABC123456XYZ',
    businessName: 'Segundo Proveedor S.A.',
    createdAt: '2024-01-02T00:00:00.000Z',
    updatedAt: '2024-01-02T00:00:00.000Z',
  },
  {
    id: '3',
    rfc: 'DEF789012ABC',
    businessName: 'Tercer Proveedor S.A. de C.V.',
    createdAt: '2024-01-03T00:00:00.000Z',
    updatedAt: '2024-01-03T00:00:00.000Z',
  },
];

export default {
  sampleVendor,
  sampleLineItem,
  sampleLineItems,
  sampleInvoice,
  sampleInvoices,
  sampleContPAQiEntry,
  sampleExtractionResult,
  sampleValidationErrors,
  sampleVendors,
  createExtractionField,
};
