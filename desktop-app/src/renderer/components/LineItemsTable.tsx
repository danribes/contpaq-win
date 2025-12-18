/**
 * T019.3 - LineItemsTable Component
 *
 * Editable table for invoice line items that:
 * - Displays line items with description, quantity, unit price, amount
 * - Supports row editing with inline inputs
 * - Auto-calculates row amounts (quantity * unit price)
 * - Validates totals match expected subtotal
 *
 * Uses Tailwind CSS for styling.
 */

import React, { useState, useCallback, useMemo } from 'react';
import { ConfidenceIndicator } from './ConfidenceIndicator';
import type { LineItemExtraction } from '../types';

// =============================================================================
// Types
// =============================================================================

/**
 * Props for LineItemsTable component
 */
export interface LineItemsTableProps {
  /** Line items to display */
  items: LineItemExtraction[];
  /** Callback when items change: (updatedItems) */
  onChange: (items: LineItemExtraction[]) => void;
  /** Expected subtotal from header for validation */
  expectedSubtotal?: number;
  /** Whether the table is read-only */
  readOnly?: boolean;
}

/**
 * Editable line item state
 */
interface EditingItem {
  description: string;
  quantity: string;
  unitPrice: string;
  amount: string;
}

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Format number as currency (Mexican Peso style)
 */
function formatCurrency(value: number): string {
  return '$' + value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Parse currency/number string to number
 */
function parseNumber(value: string): number {
  const cleaned = value.replace(/[,$]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Calculate amount from quantity and unit price
 */
function calculateAmount(quantity: number, unitPrice: number): number {
  return Math.round(quantity * unitPrice * 100) / 100;
}

// =============================================================================
// Component
// =============================================================================

/**
 * LineItemsTable component for editing invoice line items
 *
 * @example
 * ```tsx
 * <LineItemsTable
 *   items={extraction.lineItems}
 *   onChange={(updatedItems) => setLineItems(updatedItems)}
 *   expectedSubtotal={parseFloat(extraction.subtotal.value)}
 * />
 * ```
 */
export function LineItemsTable({
  items,
  onChange,
  expectedSubtotal,
  readOnly = false,
}: LineItemsTableProps): JSX.Element {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingItem, setEditingItem] = useState<EditingItem | null>(null);

  /**
   * Calculate total of all line items
   */
  const calculatedTotal = useMemo(() => {
    return items.reduce((sum, item) => sum + item.amount, 0);
  }, [items]);

  /**
   * Check if totals match
   */
  const totalsMatch = useMemo(() => {
    if (expectedSubtotal === undefined) return null;
    return Math.abs(calculatedTotal - expectedSubtotal) < 0.01;
  }, [calculatedTotal, expectedSubtotal]);

  /**
   * Calculate difference between totals
   */
  const totalsDifference = useMemo(() => {
    if (expectedSubtotal === undefined) return 0;
    return Math.abs(calculatedTotal - expectedSubtotal);
  }, [calculatedTotal, expectedSubtotal]);

  /**
   * Start editing a row
   */
  const startEditing = useCallback(
    (index: number) => {
      if (readOnly) return;

      const item = items[index];
      setEditingIndex(index);
      setEditingItem({
        description: item.description,
        quantity: item.quantity.toString(),
        unitPrice: item.unitPrice.toString(),
        amount: item.amount.toString(),
      });
    },
    [items, readOnly]
  );

  /**
   * Cancel editing
   */
  const cancelEditing = useCallback(() => {
    setEditingIndex(null);
    setEditingItem(null);
  }, []);

  /**
   * Save edited row
   */
  const saveEditing = useCallback(() => {
    if (editingIndex === null || editingItem === null) return;

    const updatedItems = [...items];
    updatedItems[editingIndex] = {
      ...updatedItems[editingIndex],
      description: editingItem.description,
      quantity: parseNumber(editingItem.quantity),
      unitPrice: parseNumber(editingItem.unitPrice),
      amount: parseNumber(editingItem.amount),
    };

    onChange(updatedItems);
    setEditingIndex(null);
    setEditingItem(null);
  }, [editingIndex, editingItem, items, onChange]);

  /**
   * Handle input change with auto-calculation
   */
  const handleInputChange = useCallback(
    (field: keyof EditingItem, value: string) => {
      if (!editingItem) return;

      const newItem = { ...editingItem, [field]: value };

      // Auto-calculate amount when quantity or unitPrice changes
      if (field === 'quantity' || field === 'unitPrice') {
        const qty = parseNumber(newItem.quantity);
        const price = parseNumber(newItem.unitPrice);
        newItem.amount = calculateAmount(qty, price).toString();
      }

      setEditingItem(newItem);
    },
    [editingItem]
  );

  /**
   * Handle key press in edit mode
   */
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        saveEditing();
      } else if (e.key === 'Escape') {
        cancelEditing();
      }
    },
    [saveEditing, cancelEditing]
  );

  /**
   * Render a display row
   */
  const renderDisplayRow = (item: LineItemExtraction, index: number) => (
    <tr
      key={index}
      data-testid={`line-item-row-${index}`}
      className={`
        ${index % 2 === 1 ? 'bg-gray-50' : 'bg-white'}
        hover:bg-blue-50 cursor-pointer transition-colors
      `}
      onClick={() => startEditing(index)}
    >
      <td className="px-3 py-2 text-sm text-gray-900">{item.description}</td>
      <td className="px-3 py-2 text-sm text-gray-900 text-right">{item.quantity}</td>
      <td className="px-3 py-2 text-sm text-gray-900 text-right">
        {formatCurrency(item.unitPrice)}
      </td>
      <td className="px-3 py-2 text-sm text-gray-900 text-right font-medium">
        {formatCurrency(item.amount)}
      </td>
      <td className="px-3 py-2 text-center">
        <ConfidenceIndicator confidence={item.confidence} size="sm" />
      </td>
    </tr>
  );

  /**
   * Render an editing row
   */
  const renderEditRow = (index: number) => {
    if (!editingItem) return null;

    return (
      <tr
        key={index}
        data-testid={`edit-row-${index}`}
        className="bg-blue-50"
      >
        <td className="px-2 py-1">
          <input
            type="text"
            value={editingItem.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </td>
        <td className="px-2 py-1">
          <input
            type="text"
            value={editingItem.quantity}
            onChange={(e) => handleInputChange('quantity', e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-20 px-2 py-1 text-sm text-right border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </td>
        <td className="px-2 py-1">
          <input
            type="text"
            value={editingItem.unitPrice}
            onChange={(e) => handleInputChange('unitPrice', e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-24 px-2 py-1 text-sm text-right border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </td>
        <td className="px-2 py-1">
          <input
            type="text"
            value={editingItem.amount}
            readOnly
            className="w-24 px-2 py-1 text-sm text-right border rounded bg-gray-100"
          />
        </td>
        <td className="px-2 py-1 text-center">
          <div className="flex gap-1 justify-center">
            <button
              data-testid="save-button"
              onClick={saveEditing}
              className="px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600"
            >
              ✓
            </button>
            <button
              data-testid="cancel-button"
              onClick={cancelEditing}
              className="px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              ✕
            </button>
          </div>
        </td>
      </tr>
    );
  };

  return (
    <div data-testid="line-items-table" className="mt-4">
      {/* Section Title */}
      <h3 className="text-sm font-medium text-gray-700 mb-3">Conceptos</h3>

      {items.length === 0 ? (
        <p className="text-gray-500 text-sm italic">No hay conceptos</p>
      ) : (
        <>
          {/* Table */}
          <div className="overflow-x-auto border rounded-lg">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase">
                    Descripción
                  </th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-gray-600 uppercase">
                    Cantidad
                  </th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-gray-600 uppercase">
                    Precio Unitario
                  </th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-gray-600 uppercase">
                    Importe
                  </th>
                  <th className="px-3 py-2 text-center text-xs font-medium text-gray-600 uppercase">
                    Conf.
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) =>
                  editingIndex === index
                    ? renderEditRow(index)
                    : renderDisplayRow(item, index)
                )}
              </tbody>
            </table>
          </div>

          {/* Totals Section */}
          <div className="mt-3 flex justify-end">
            <div className="text-sm space-y-1">
              {/* Calculated Total */}
              <div className="flex justify-between gap-8">
                <span className="text-gray-600">Total Calculado:</span>
                <span
                  data-testid="calculated-total"
                  className="font-medium text-gray-900"
                >
                  {formatCurrency(calculatedTotal)}
                </span>
              </div>

              {/* Expected Total (if provided) */}
              {expectedSubtotal !== undefined && (
                <>
                  <div className="flex justify-between gap-8">
                    <span className="text-gray-600">Subtotal Esperado:</span>
                    <span
                      data-testid="expected-total"
                      className="font-medium text-gray-900"
                    >
                      {formatCurrency(expectedSubtotal)}
                    </span>
                  </div>

                  {/* Match/Mismatch Indicator */}
                  {totalsMatch ? (
                    <div
                      data-testid="totals-match"
                      className="flex items-center justify-end gap-2 text-green-600"
                    >
                      <span>✓</span>
                      <span>Los totales coinciden</span>
                    </div>
                  ) : (
                    <div className="text-red-600">
                      <div
                        data-testid="totals-mismatch"
                        className="flex items-center justify-end gap-2"
                      >
                        <span>✕</span>
                        <span>Los totales no coinciden</span>
                      </div>
                      <div className="flex justify-between gap-8 mt-1">
                        <span>Diferencia:</span>
                        <span data-testid="totals-difference">
                          {formatCurrency(totalsDifference)}
                        </span>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default LineItemsTable;
