/**
 * T019.2 - InvoiceForm Component
 *
 * Form component for displaying and editing invoice extraction data.
 * Renders all header fields using FieldInput components with proper
 * validation types and syncs field selection with PDF viewer.
 *
 * Uses Tailwind CSS for styling.
 */

import { useCallback } from 'react';
import { FieldInput } from './FieldInput';
import type { InvoiceExtraction, ExtractionField } from '../types';

// =============================================================================
// Types
// =============================================================================

/**
 * Field keys that can be edited in the form
 */
export type InvoiceFieldKey =
  | 'vendorRfc'
  | 'vendorName'
  | 'invoiceNumber'
  | 'invoiceDate'
  | 'subtotal'
  | 'ivaAmount'
  | 'total';

/**
 * Props for InvoiceForm component
 */
export interface InvoiceFormProps {
  /** Extraction data to display */
  extraction: InvoiceExtraction;
  /** Callback when a field value changes: (fieldKey, newValue, userVerified) */
  onChange: (fieldKey: InvoiceFieldKey, value: string, userVerified: boolean) => void;
  /** Callback when a field is selected (for PDF bbox sync) */
  onFieldSelect?: (fieldKey: InvoiceFieldKey) => void;
  /** Currently selected field key */
  selectedField?: InvoiceFieldKey;
  /** Whether the form is read-only */
  readOnly?: boolean;
}

// =============================================================================
// Field Configuration
// =============================================================================

interface FieldConfig {
  key: InvoiceFieldKey;
  label: string;
  fieldType: 'text' | 'rfc' | 'date' | 'amount';
  section: 'vendor' | 'invoice' | 'amounts';
}

const FIELD_CONFIGS: FieldConfig[] = [
  { key: 'vendorRfc', label: 'RFC del Proveedor', fieldType: 'rfc', section: 'vendor' },
  { key: 'vendorName', label: 'Nombre del Proveedor', fieldType: 'text', section: 'vendor' },
  { key: 'invoiceNumber', label: 'Número de Factura', fieldType: 'text', section: 'invoice' },
  { key: 'invoiceDate', label: 'Fecha', fieldType: 'date', section: 'invoice' },
  { key: 'subtotal', label: 'Subtotal', fieldType: 'amount', section: 'amounts' },
  { key: 'ivaAmount', label: 'IVA', fieldType: 'amount', section: 'amounts' },
  { key: 'total', label: 'Total', fieldType: 'amount', section: 'amounts' },
];

// =============================================================================
// Component
// =============================================================================

/**
 * InvoiceForm component for editing extracted invoice data
 *
 * @example
 * ```tsx
 * <InvoiceForm
 *   extraction={invoiceExtraction}
 *   onChange={(fieldKey, value, verified) => {
 *     updateField(fieldKey, value, verified);
 *   }}
 *   onFieldSelect={(fieldKey) => {
 *     highlightBboxInPdf(extraction[fieldKey].bbox);
 *   }}
 *   selectedField="vendorRfc"
 * />
 * ```
 */
export function InvoiceForm({
  extraction,
  onChange,
  onFieldSelect,
  selectedField,
  readOnly = false,
}: InvoiceFormProps): JSX.Element {
  /**
   * Get extraction field data for a given key
   */
  const getField = useCallback(
    (key: InvoiceFieldKey): ExtractionField => {
      return extraction[key];
    },
    [extraction]
  );

  /**
   * Handle field value change
   */
  const handleFieldChange = useCallback(
    (fieldKey: InvoiceFieldKey) => (value: string, userVerified: boolean) => {
      onChange(fieldKey, value, userVerified);
    },
    [onChange]
  );

  /**
   * Handle field selection
   */
  const handleFieldSelect = useCallback(
    (fieldKey: InvoiceFieldKey) => () => {
      onFieldSelect?.(fieldKey);
    },
    [onFieldSelect]
  );

  /**
   * Render a single field input
   */
  const renderField = (config: FieldConfig) => {
    const field = getField(config.key);
    return (
      <FieldInput
        key={config.key}
        label={config.label}
        value={field.value}
        confidence={field.confidence}
        fieldType={config.fieldType}
        userVerified={field.userVerified}
        isSelected={selectedField === config.key}
        readOnly={readOnly}
        onChange={handleFieldChange(config.key)}
        onSelect={handleFieldSelect(config.key)}
      />
    );
  };

  /**
   * Get fields for a specific section
   */
  const getFieldsForSection = (section: FieldConfig['section']) => {
    return FIELD_CONFIGS.filter((config) => config.section === section);
  };

  return (
    <div
      data-testid="invoice-form"
      className="flex flex-col gap-6 p-4 bg-white rounded-lg"
    >
      {/* Form Title */}
      <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">
        Datos de la Factura
      </h2>

      {/* Vendor Information Section */}
      <section>
        <h3 className="text-sm font-medium text-gray-700 mb-3">
          Información del Proveedor
        </h3>
        <div className="flex flex-col gap-3">
          {getFieldsForSection('vendor').map(renderField)}
        </div>
      </section>

      {/* Invoice Details Section */}
      <section>
        <h3 className="text-sm font-medium text-gray-700 mb-3">
          Detalles de la Factura
        </h3>
        <div className="flex flex-col gap-3">
          {getFieldsForSection('invoice').map(renderField)}
        </div>
      </section>

      {/* Amounts Section */}
      <section>
        <h3 className="text-sm font-medium text-gray-700 mb-3">
          Montos
        </h3>
        <div className="flex flex-col gap-3">
          {getFieldsForSection('amounts').map(renderField)}
        </div>
      </section>
    </div>
  );
}

export default InvoiceForm;
