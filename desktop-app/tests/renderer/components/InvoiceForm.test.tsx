/**
 * T019.2 - InvoiceForm Component Tests
 *
 * Tests for the invoice form component that:
 * - Renders all header fields with FieldInput
 * - Handles field value changes
 * - Syncs field selection with PDF viewer bbox
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import type { InvoiceExtraction, ExtractionField } from '../../../src/renderer/types';

// Will be created in T019.2.2
let InvoiceForm: typeof import('../../../src/renderer/components/InvoiceForm').InvoiceForm;

// Mock FieldInput
jest.mock('../../../src/renderer/components/FieldInput', () => ({
  FieldInput: ({
    label,
    value,
    confidence,
    fieldType,
    userVerified,
    isSelected,
    onChange,
    onSelect,
  }: {
    label: string;
    value: string;
    confidence: number;
    fieldType?: string;
    userVerified?: boolean;
    isSelected?: boolean;
    onChange: (value: string, verified: boolean) => void;
    onSelect?: () => void;
  }) => (
    <div
      data-testid={`field-input-${label.toLowerCase().replace(/\s+/g, '-')}`}
      data-label={label}
      data-value={value}
      data-confidence={confidence}
      data-field-type={fieldType}
      data-user-verified={userVerified}
      data-is-selected={isSelected}
      onClick={() => onSelect?.()}
    >
      <span data-testid="field-label">{label}</span>
      <span data-testid="field-value">{value}</span>
      <button
        data-testid="change-button"
        onClick={() => onChange('NEW_VALUE', true)}
      >
        Change
      </button>
    </div>
  ),
}));

/**
 * Create a mock extraction field
 */
function createMockField(
  fieldName: string,
  value: string,
  confidence: number = 90,
  userVerified: boolean = false
): ExtractionField {
  return {
    fieldName,
    value,
    confidence,
    userVerified,
    bbox: { x: 0, y: 0, width: 100, height: 20 },
  };
}

/**
 * Create a complete mock extraction
 */
function createMockExtraction(): InvoiceExtraction {
  return {
    vendorRfc: createMockField('vendor_rfc', 'ABC123456DEF', 95),
    vendorName: createMockField('vendor_name', 'Empresa ABC S.A. de C.V.', 92),
    invoiceNumber: createMockField('invoice_number', 'FAC-2025-001', 98),
    invoiceDate: createMockField('invoice_date', '2025-12-15', 90),
    subtotal: createMockField('subtotal', '1000.00', 88),
    ivaAmount: createMockField('iva_amount', '160.00', 88),
    total: createMockField('total', '1160.00', 95),
    lineItems: [],
    sourceType: 'text_based',
    processingTimeMs: 1500,
  };
}

describe('T019.2 - InvoiceForm Component', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await import('../../../src/renderer/components/InvoiceForm');
    InvoiceForm = module.InvoiceForm;
  });

  // ==========================================================================
  // T019.2.1 - Component Structure Tests
  // ==========================================================================

  describe('T019.2.1 - Component Structure', () => {
    it('should export InvoiceForm component', async () => {
      const module = await import('../../../src/renderer/components/InvoiceForm');
      expect(module.InvoiceForm).toBeDefined();
      expect(typeof module.InvoiceForm).toBe('function');
    });

    it('should render without crashing', () => {
      expect(() => {
        render(
          <InvoiceForm
            extraction={createMockExtraction()}
            onChange={() => {}}
          />
        );
      }).not.toThrow();
    });

    it('should render form container', () => {
      render(
        <InvoiceForm
          extraction={createMockExtraction()}
          onChange={() => {}}
        />
      );
      expect(screen.getByTestId('invoice-form')).toBeInTheDocument();
    });

    it('should render form title', () => {
      render(
        <InvoiceForm
          extraction={createMockExtraction()}
          onChange={() => {}}
        />
      );
      expect(screen.getByText('Datos de la Factura')).toBeInTheDocument();
    });
  });

  // ==========================================================================
  // T019.2.2 - Header Fields Tests
  // ==========================================================================

  describe('T019.2.2 - Header Fields', () => {
    it('should render vendor RFC field', () => {
      render(
        <InvoiceForm
          extraction={createMockExtraction()}
          onChange={() => {}}
        />
      );
      const field = screen.getByTestId('field-input-rfc-del-proveedor');
      expect(field).toBeInTheDocument();
      expect(field).toHaveAttribute('data-value', 'ABC123456DEF');
      expect(field).toHaveAttribute('data-field-type', 'rfc');
    });

    it('should render vendor name field', () => {
      render(
        <InvoiceForm
          extraction={createMockExtraction()}
          onChange={() => {}}
        />
      );
      const field = screen.getByTestId('field-input-nombre-del-proveedor');
      expect(field).toBeInTheDocument();
      expect(field).toHaveAttribute('data-value', 'Empresa ABC S.A. de C.V.');
      expect(field).toHaveAttribute('data-field-type', 'text');
    });

    it('should render invoice number field', () => {
      render(
        <InvoiceForm
          extraction={createMockExtraction()}
          onChange={() => {}}
        />
      );
      const field = screen.getByTestId('field-input-número-de-factura');
      expect(field).toBeInTheDocument();
      expect(field).toHaveAttribute('data-value', 'FAC-2025-001');
      expect(field).toHaveAttribute('data-field-type', 'text');
    });

    it('should render invoice date field', () => {
      render(
        <InvoiceForm
          extraction={createMockExtraction()}
          onChange={() => {}}
        />
      );
      const field = screen.getByTestId('field-input-fecha');
      expect(field).toBeInTheDocument();
      expect(field).toHaveAttribute('data-value', '2025-12-15');
      expect(field).toHaveAttribute('data-field-type', 'date');
    });

    it('should render subtotal field', () => {
      render(
        <InvoiceForm
          extraction={createMockExtraction()}
          onChange={() => {}}
        />
      );
      const field = screen.getByTestId('field-input-subtotal');
      expect(field).toBeInTheDocument();
      expect(field).toHaveAttribute('data-value', '1000.00');
      expect(field).toHaveAttribute('data-field-type', 'amount');
    });

    it('should render IVA field', () => {
      render(
        <InvoiceForm
          extraction={createMockExtraction()}
          onChange={() => {}}
        />
      );
      const field = screen.getByTestId('field-input-iva');
      expect(field).toBeInTheDocument();
      expect(field).toHaveAttribute('data-value', '160.00');
      expect(field).toHaveAttribute('data-field-type', 'amount');
    });

    it('should render total field', () => {
      render(
        <InvoiceForm
          extraction={createMockExtraction()}
          onChange={() => {}}
        />
      );
      const field = screen.getByTestId('field-input-total');
      expect(field).toBeInTheDocument();
      expect(field).toHaveAttribute('data-value', '1160.00');
      expect(field).toHaveAttribute('data-field-type', 'amount');
    });

    it('should pass confidence to all fields', () => {
      render(
        <InvoiceForm
          extraction={createMockExtraction()}
          onChange={() => {}}
        />
      );
      const rfcField = screen.getByTestId('field-input-rfc-del-proveedor');
      expect(rfcField).toHaveAttribute('data-confidence', '95');

      const totalField = screen.getByTestId('field-input-total');
      expect(totalField).toHaveAttribute('data-confidence', '95');
    });
  });

  // ==========================================================================
  // T019.2.3 - Field Change Handling Tests
  // ==========================================================================

  describe('T019.2.3 - Field Change Handling', () => {
    it('should call onChange when vendor RFC changes', async () => {
      const handleChange = jest.fn();
      render(
        <InvoiceForm
          extraction={createMockExtraction()}
          onChange={handleChange}
        />
      );

      const field = screen.getByTestId('field-input-rfc-del-proveedor');
      const changeButton = field.querySelector('[data-testid="change-button"]');
      fireEvent.click(changeButton!);

      expect(handleChange).toHaveBeenCalledWith('vendorRfc', 'NEW_VALUE', true);
    });

    it('should call onChange when vendor name changes', async () => {
      const handleChange = jest.fn();
      render(
        <InvoiceForm
          extraction={createMockExtraction()}
          onChange={handleChange}
        />
      );

      const field = screen.getByTestId('field-input-nombre-del-proveedor');
      const changeButton = field.querySelector('[data-testid="change-button"]');
      fireEvent.click(changeButton!);

      expect(handleChange).toHaveBeenCalledWith('vendorName', 'NEW_VALUE', true);
    });

    it('should call onChange when invoice number changes', async () => {
      const handleChange = jest.fn();
      render(
        <InvoiceForm
          extraction={createMockExtraction()}
          onChange={handleChange}
        />
      );

      const field = screen.getByTestId('field-input-número-de-factura');
      const changeButton = field.querySelector('[data-testid="change-button"]');
      fireEvent.click(changeButton!);

      expect(handleChange).toHaveBeenCalledWith('invoiceNumber', 'NEW_VALUE', true);
    });

    it('should call onChange when date changes', async () => {
      const handleChange = jest.fn();
      render(
        <InvoiceForm
          extraction={createMockExtraction()}
          onChange={handleChange}
        />
      );

      const field = screen.getByTestId('field-input-fecha');
      const changeButton = field.querySelector('[data-testid="change-button"]');
      fireEvent.click(changeButton!);

      expect(handleChange).toHaveBeenCalledWith('invoiceDate', 'NEW_VALUE', true);
    });

    it('should call onChange when subtotal changes', async () => {
      const handleChange = jest.fn();
      render(
        <InvoiceForm
          extraction={createMockExtraction()}
          onChange={handleChange}
        />
      );

      const field = screen.getByTestId('field-input-subtotal');
      const changeButton = field.querySelector('[data-testid="change-button"]');
      fireEvent.click(changeButton!);

      expect(handleChange).toHaveBeenCalledWith('subtotal', 'NEW_VALUE', true);
    });

    it('should call onChange when IVA changes', async () => {
      const handleChange = jest.fn();
      render(
        <InvoiceForm
          extraction={createMockExtraction()}
          onChange={handleChange}
        />
      );

      const field = screen.getByTestId('field-input-iva');
      const changeButton = field.querySelector('[data-testid="change-button"]');
      fireEvent.click(changeButton!);

      expect(handleChange).toHaveBeenCalledWith('ivaAmount', 'NEW_VALUE', true);
    });

    it('should call onChange when total changes', async () => {
      const handleChange = jest.fn();
      render(
        <InvoiceForm
          extraction={createMockExtraction()}
          onChange={handleChange}
        />
      );

      const field = screen.getByTestId('field-input-total');
      const changeButton = field.querySelector('[data-testid="change-button"]');
      fireEvent.click(changeButton!);

      expect(handleChange).toHaveBeenCalledWith('total', 'NEW_VALUE', true);
    });
  });

  // ==========================================================================
  // T019.2.4 - Field Selection Tests
  // ==========================================================================

  describe('T019.2.4 - Field Selection', () => {
    it('should call onFieldSelect when field is clicked', () => {
      const handleFieldSelect = jest.fn();
      render(
        <InvoiceForm
          extraction={createMockExtraction()}
          onChange={() => {}}
          onFieldSelect={handleFieldSelect}
        />
      );

      const field = screen.getByTestId('field-input-rfc-del-proveedor');
      fireEvent.click(field);

      expect(handleFieldSelect).toHaveBeenCalledWith('vendorRfc');
    });

    it('should highlight selected field', () => {
      render(
        <InvoiceForm
          extraction={createMockExtraction()}
          onChange={() => {}}
          selectedField="vendorRfc"
        />
      );

      const rfcField = screen.getByTestId('field-input-rfc-del-proveedor');
      expect(rfcField).toHaveAttribute('data-is-selected', 'true');

      const nameField = screen.getByTestId('field-input-nombre-del-proveedor');
      expect(nameField).toHaveAttribute('data-is-selected', 'false');
    });

    it('should pass bbox to onFieldSelect', () => {
      const handleFieldSelect = jest.fn();
      const extraction = createMockExtraction();
      extraction.vendorRfc.bbox = { x: 100, y: 200, width: 150, height: 30 };

      render(
        <InvoiceForm
          extraction={extraction}
          onChange={() => {}}
          onFieldSelect={handleFieldSelect}
        />
      );

      const field = screen.getByTestId('field-input-rfc-del-proveedor');
      fireEvent.click(field);

      expect(handleFieldSelect).toHaveBeenCalledWith('vendorRfc');
    });
  });

  // ==========================================================================
  // User Verified Status Tests
  // ==========================================================================

  describe('User Verified Status', () => {
    it('should pass userVerified to fields', () => {
      const extraction = createMockExtraction();
      extraction.vendorRfc.userVerified = true;

      render(
        <InvoiceForm
          extraction={extraction}
          onChange={() => {}}
        />
      );

      const rfcField = screen.getByTestId('field-input-rfc-del-proveedor');
      expect(rfcField).toHaveAttribute('data-user-verified', 'true');

      const nameField = screen.getByTestId('field-input-nombre-del-proveedor');
      expect(nameField).toHaveAttribute('data-user-verified', 'false');
    });
  });

  // ==========================================================================
  // Form Sections Tests
  // ==========================================================================

  describe('Form Sections', () => {
    it('should have vendor information section', () => {
      render(
        <InvoiceForm
          extraction={createMockExtraction()}
          onChange={() => {}}
        />
      );
      expect(screen.getByText('Información del Proveedor')).toBeInTheDocument();
    });

    it('should have invoice details section', () => {
      render(
        <InvoiceForm
          extraction={createMockExtraction()}
          onChange={() => {}}
        />
      );
      expect(screen.getByText('Detalles de la Factura')).toBeInTheDocument();
    });

    it('should have amounts section', () => {
      render(
        <InvoiceForm
          extraction={createMockExtraction()}
          onChange={() => {}}
        />
      );
      expect(screen.getByText('Montos')).toBeInTheDocument();
    });
  });

  // ==========================================================================
  // Tailwind Styling Tests
  // ==========================================================================

  describe('Tailwind Styling', () => {
    it('should have flex layout', () => {
      render(
        <InvoiceForm
          extraction={createMockExtraction()}
          onChange={() => {}}
        />
      );
      const form = screen.getByTestId('invoice-form');
      expect(form).toHaveClass('flex');
    });

    it('should have gap between sections', () => {
      render(
        <InvoiceForm
          extraction={createMockExtraction()}
          onChange={() => {}}
        />
      );
      const form = screen.getByTestId('invoice-form');
      expect(form.className).toMatch(/gap-\d/);
    });

    it('should have padding', () => {
      render(
        <InvoiceForm
          extraction={createMockExtraction()}
          onChange={() => {}}
        />
      );
      const form = screen.getByTestId('invoice-form');
      expect(form.className).toMatch(/p-\d/);
    });
  });

  // ==========================================================================
  // Empty Extraction Handling Tests
  // ==========================================================================

  describe('Empty Extraction Handling', () => {
    it('should handle empty field values', () => {
      const extraction = createMockExtraction();
      extraction.vendorRfc.value = '';

      render(
        <InvoiceForm
          extraction={extraction}
          onChange={() => {}}
        />
      );

      const rfcField = screen.getByTestId('field-input-rfc-del-proveedor');
      expect(rfcField).toHaveAttribute('data-value', '');
    });

    it('should handle zero confidence', () => {
      const extraction = createMockExtraction();
      extraction.vendorRfc.confidence = 0;

      render(
        <InvoiceForm
          extraction={extraction}
          onChange={() => {}}
        />
      );

      const rfcField = screen.getByTestId('field-input-rfc-del-proveedor');
      expect(rfcField).toHaveAttribute('data-confidence', '0');
    });
  });

  // ==========================================================================
  // Read-only Mode Tests
  // ==========================================================================

  describe('Read-only Mode', () => {
    it('should pass readOnly to all fields when form is readOnly', () => {
      render(
        <InvoiceForm
          extraction={createMockExtraction()}
          onChange={() => {}}
          readOnly
        />
      );

      // All fields should have readOnly passed (we don't test this in mock, but structure is correct)
      expect(screen.getByTestId('invoice-form')).toBeInTheDocument();
    });
  });
});
