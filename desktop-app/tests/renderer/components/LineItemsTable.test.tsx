/**
 * T019.3 - LineItemsTable Component Tests
 *
 * Tests for the line items table component that:
 * - Displays editable table rows
 * - Supports row editing
 * - Auto-calculates row amounts
 * - Validates totals match
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import type { LineItemExtraction } from '../../../src/renderer/types';

// Will be created in T019.3.2
let LineItemsTable: typeof import('../../../src/renderer/components/LineItemsTable').LineItemsTable;

// Mock ConfidenceIndicator
jest.mock('../../../src/renderer/components/ConfidenceIndicator', () => ({
  ConfidenceIndicator: ({ confidence }: { confidence: number }) => (
    <span data-testid="confidence-indicator" data-confidence={confidence}>
      {confidence}%
    </span>
  ),
}));

/**
 * Create mock line items
 */
function createMockLineItems(): LineItemExtraction[] {
  return [
    {
      description: 'Producto A',
      quantity: 2,
      unitPrice: 100.0,
      amount: 200.0,
      confidence: 95,
    },
    {
      description: 'Servicio B',
      quantity: 1,
      unitPrice: 500.0,
      amount: 500.0,
      confidence: 88,
    },
    {
      description: 'Material C',
      quantity: 5,
      unitPrice: 60.0,
      amount: 300.0,
      confidence: 92,
    },
  ];
}

describe('T019.3 - LineItemsTable Component', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await import('../../../src/renderer/components/LineItemsTable');
    LineItemsTable = module.LineItemsTable;
  });

  // ==========================================================================
  // T019.3.1 - Component Structure Tests
  // ==========================================================================

  describe('T019.3.1 - Component Structure', () => {
    it('should export LineItemsTable component', async () => {
      const module = await import('../../../src/renderer/components/LineItemsTable');
      expect(module.LineItemsTable).toBeDefined();
      expect(typeof module.LineItemsTable).toBe('function');
    });

    it('should render without crashing', () => {
      expect(() => {
        render(
          <LineItemsTable
            items={createMockLineItems()}
            onChange={() => {}}
          />
        );
      }).not.toThrow();
    });

    it('should render table container', () => {
      render(
        <LineItemsTable
          items={createMockLineItems()}
          onChange={() => {}}
        />
      );
      expect(screen.getByTestId('line-items-table')).toBeInTheDocument();
    });

    it('should render table element', () => {
      render(
        <LineItemsTable
          items={createMockLineItems()}
          onChange={() => {}}
        />
      );
      expect(screen.getByRole('table')).toBeInTheDocument();
    });

    it('should render section title', () => {
      render(
        <LineItemsTable
          items={createMockLineItems()}
          onChange={() => {}}
        />
      );
      expect(screen.getByText('Conceptos')).toBeInTheDocument();
    });
  });

  // ==========================================================================
  // T019.3.2 - Table Headers Tests
  // ==========================================================================

  describe('T019.3.2 - Table Headers', () => {
    it('should render description header', () => {
      render(
        <LineItemsTable
          items={createMockLineItems()}
          onChange={() => {}}
        />
      );
      expect(screen.getByText('Descripción')).toBeInTheDocument();
    });

    it('should render quantity header', () => {
      render(
        <LineItemsTable
          items={createMockLineItems()}
          onChange={() => {}}
        />
      );
      expect(screen.getByText('Cantidad')).toBeInTheDocument();
    });

    it('should render unit price header', () => {
      render(
        <LineItemsTable
          items={createMockLineItems()}
          onChange={() => {}}
        />
      );
      expect(screen.getByText('Precio Unitario')).toBeInTheDocument();
    });

    it('should render amount header', () => {
      render(
        <LineItemsTable
          items={createMockLineItems()}
          onChange={() => {}}
        />
      );
      expect(screen.getByText('Importe')).toBeInTheDocument();
    });

    it('should render confidence header', () => {
      render(
        <LineItemsTable
          items={createMockLineItems()}
          onChange={() => {}}
        />
      );
      expect(screen.getByText('Conf.')).toBeInTheDocument();
    });
  });

  // ==========================================================================
  // T019.3.3 - Display Line Items Tests
  // ==========================================================================

  describe('T019.3.3 - Display Line Items', () => {
    it('should render correct number of rows', () => {
      render(
        <LineItemsTable
          items={createMockLineItems()}
          onChange={() => {}}
        />
      );
      const rows = screen.getAllByTestId(/^line-item-row-/);
      expect(rows).toHaveLength(3);
    });

    it('should display item descriptions', () => {
      render(
        <LineItemsTable
          items={createMockLineItems()}
          onChange={() => {}}
        />
      );
      expect(screen.getByText('Producto A')).toBeInTheDocument();
      expect(screen.getByText('Servicio B')).toBeInTheDocument();
      expect(screen.getByText('Material C')).toBeInTheDocument();
    });

    it('should display item quantities', () => {
      render(
        <LineItemsTable
          items={createMockLineItems()}
          onChange={() => {}}
        />
      );
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
    });

    it('should display unit prices formatted', () => {
      render(
        <LineItemsTable
          items={createMockLineItems()}
          onChange={() => {}}
        />
      );
      expect(screen.getByText('$100.00')).toBeInTheDocument();
      // $500.00 appears twice (unit price and amount for item 2)
      expect(screen.getAllByText('$500.00').length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText('$60.00')).toBeInTheDocument();
    });

    it('should display amounts formatted', () => {
      render(
        <LineItemsTable
          items={createMockLineItems()}
          onChange={() => {}}
        />
      );
      expect(screen.getByText('$200.00')).toBeInTheDocument();
      // $500.00 appears twice (unit price and amount for item 2)
      expect(screen.getAllByText('$500.00').length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText('$300.00')).toBeInTheDocument();
    });

    it('should display confidence indicators', () => {
      render(
        <LineItemsTable
          items={createMockLineItems()}
          onChange={() => {}}
        />
      );
      const indicators = screen.getAllByTestId('confidence-indicator');
      expect(indicators).toHaveLength(3);
    });

    it('should handle empty items array', () => {
      render(
        <LineItemsTable
          items={[]}
          onChange={() => {}}
        />
      );
      expect(screen.getByText('No hay conceptos')).toBeInTheDocument();
    });
  });

  // ==========================================================================
  // T019.3.4 - Row Editing Tests
  // ==========================================================================

  describe('T019.3.4 - Row Editing', () => {
    it('should enter edit mode when row is clicked', async () => {
      render(
        <LineItemsTable
          items={createMockLineItems()}
          onChange={() => {}}
        />
      );

      const row = screen.getByTestId('line-item-row-0');
      fireEvent.click(row);

      await waitFor(() => {
        expect(screen.getByTestId('edit-row-0')).toBeInTheDocument();
      });
    });

    it('should show input fields in edit mode', async () => {
      render(
        <LineItemsTable
          items={createMockLineItems()}
          onChange={() => {}}
        />
      );

      const row = screen.getByTestId('line-item-row-0');
      fireEvent.click(row);

      await waitFor(() => {
        const editRow = screen.getByTestId('edit-row-0');
        expect(within(editRow).getByDisplayValue('Producto A')).toBeInTheDocument();
        expect(within(editRow).getByDisplayValue('2')).toBeInTheDocument();
        expect(within(editRow).getByDisplayValue('100')).toBeInTheDocument();
      });
    });

    it('should save changes on Enter key', async () => {
      const handleChange = jest.fn();
      render(
        <LineItemsTable
          items={createMockLineItems()}
          onChange={handleChange}
        />
      );

      const row = screen.getByTestId('line-item-row-0');
      fireEvent.click(row);

      await waitFor(() => {
        const descInput = screen.getByDisplayValue('Producto A');
        fireEvent.change(descInput, { target: { value: 'Producto Modificado' } });
        fireEvent.keyDown(descInput, { key: 'Enter' });
      });

      expect(handleChange).toHaveBeenCalled();
    });

    it('should cancel edit on Escape key', async () => {
      const handleChange = jest.fn();
      render(
        <LineItemsTable
          items={createMockLineItems()}
          onChange={handleChange}
        />
      );

      const row = screen.getByTestId('line-item-row-0');
      fireEvent.click(row);

      await waitFor(() => {
        const descInput = screen.getByDisplayValue('Producto A');
        fireEvent.change(descInput, { target: { value: 'Producto Modificado' } });
        fireEvent.keyDown(descInput, { key: 'Escape' });
      });

      expect(handleChange).not.toHaveBeenCalled();
      expect(screen.getByText('Producto A')).toBeInTheDocument();
    });

    it('should have save and cancel buttons in edit mode', async () => {
      render(
        <LineItemsTable
          items={createMockLineItems()}
          onChange={() => {}}
        />
      );

      const row = screen.getByTestId('line-item-row-0');
      fireEvent.click(row);

      await waitFor(() => {
        expect(screen.getByTestId('save-button')).toBeInTheDocument();
        expect(screen.getByTestId('cancel-button')).toBeInTheDocument();
      });
    });
  });

  // ==========================================================================
  // T019.3.5 - Auto-calculate Row Amounts Tests
  // ==========================================================================

  describe('T019.3.5 - Auto-calculate Row Amounts', () => {
    it('should auto-calculate amount when quantity changes', async () => {
      const handleChange = jest.fn();
      render(
        <LineItemsTable
          items={createMockLineItems()}
          onChange={handleChange}
        />
      );

      const row = screen.getByTestId('line-item-row-0');
      fireEvent.click(row);

      await waitFor(() => {
        const qtyInput = screen.getByDisplayValue('2');
        fireEvent.change(qtyInput, { target: { value: '3' } });
      });

      // Amount should update to 3 * 100 = 300
      await waitFor(() => {
        expect(screen.getByDisplayValue('300')).toBeInTheDocument();
      });
    });

    it('should auto-calculate amount when unit price changes', async () => {
      const handleChange = jest.fn();
      render(
        <LineItemsTable
          items={createMockLineItems()}
          onChange={handleChange}
        />
      );

      const row = screen.getByTestId('line-item-row-0');
      fireEvent.click(row);

      await waitFor(() => {
        const priceInput = screen.getByDisplayValue('100');
        fireEvent.change(priceInput, { target: { value: '150' } });
      });

      // Amount should update to 2 * 150 = 300
      await waitFor(() => {
        expect(screen.getByDisplayValue('300')).toBeInTheDocument();
      });
    });

    it('should handle decimal quantities', async () => {
      render(
        <LineItemsTable
          items={[{
            description: 'Item',
            quantity: 1.5,
            unitPrice: 100,
            amount: 150,
            confidence: 90,
          }]}
          onChange={() => {}}
        />
      );

      const row = screen.getByTestId('line-item-row-0');
      fireEvent.click(row);

      await waitFor(() => {
        expect(screen.getByDisplayValue('1.5')).toBeInTheDocument();
      });
    });
  });

  // ==========================================================================
  // T019.3.6 - Totals Validation Tests
  // ==========================================================================

  describe('T019.3.6 - Totals Validation', () => {
    it('should display calculated total', () => {
      render(
        <LineItemsTable
          items={createMockLineItems()}
          onChange={() => {}}
        />
      );
      // Total: 200 + 500 + 300 = 1000
      expect(screen.getByTestId('calculated-total')).toHaveTextContent('$1,000.00');
    });

    it('should show expected total when provided', () => {
      render(
        <LineItemsTable
          items={createMockLineItems()}
          onChange={() => {}}
          expectedSubtotal={1000}
        />
      );
      expect(screen.getByTestId('expected-total')).toHaveTextContent('$1,000.00');
    });

    it('should show match indicator when totals match', () => {
      render(
        <LineItemsTable
          items={createMockLineItems()}
          onChange={() => {}}
          expectedSubtotal={1000}
        />
      );
      expect(screen.getByTestId('totals-match')).toBeInTheDocument();
    });

    it('should show mismatch indicator when totals differ', () => {
      render(
        <LineItemsTable
          items={createMockLineItems()}
          onChange={() => {}}
          expectedSubtotal={999}
        />
      );
      expect(screen.getByTestId('totals-mismatch')).toBeInTheDocument();
    });

    it('should show difference amount when totals mismatch', () => {
      render(
        <LineItemsTable
          items={createMockLineItems()}
          onChange={() => {}}
          expectedSubtotal={950}
        />
      );
      expect(screen.getByTestId('totals-difference')).toHaveTextContent('$50.00');
    });
  });

  // ==========================================================================
  // Tailwind Styling Tests
  // ==========================================================================

  describe('Tailwind Styling', () => {
    it('should have table with full width', () => {
      render(
        <LineItemsTable
          items={createMockLineItems()}
          onChange={() => {}}
        />
      );
      const table = screen.getByRole('table');
      expect(table).toHaveClass('w-full');
    });

    it('should have striped rows', () => {
      render(
        <LineItemsTable
          items={createMockLineItems()}
          onChange={() => {}}
        />
      );
      const rows = screen.getAllByTestId(/^line-item-row-/);
      // Check that odd rows have different background
      expect(rows[1].className).toMatch(/bg-gray-50/);
    });

    it('should have hover state on rows', () => {
      render(
        <LineItemsTable
          items={createMockLineItems()}
          onChange={() => {}}
        />
      );
      const rows = screen.getAllByTestId(/^line-item-row-/);
      expect(rows[0].className).toMatch(/hover:/);
    });

    it('should align numbers to right', () => {
      render(
        <LineItemsTable
          items={createMockLineItems()}
          onChange={() => {}}
        />
      );
      const amountCell = screen.getByText('$200.00').closest('td');
      expect(amountCell).toHaveClass('text-right');
    });
  });

  // ==========================================================================
  // Read-only Mode Tests
  // ==========================================================================

  describe('Read-only Mode', () => {
    it('should not enter edit mode when readOnly', () => {
      render(
        <LineItemsTable
          items={createMockLineItems()}
          onChange={() => {}}
          readOnly
        />
      );

      const row = screen.getByTestId('line-item-row-0');
      fireEvent.click(row);

      expect(screen.queryByTestId('edit-row-0')).not.toBeInTheDocument();
    });
  });

  // ==========================================================================
  // Currency Formatting Tests
  // ==========================================================================

  describe('Currency Formatting', () => {
    it('should format large amounts with thousand separators', () => {
      render(
        <LineItemsTable
          items={[{
            description: 'Item grande',
            quantity: 1,
            unitPrice: 10000,
            amount: 10000,
            confidence: 90,
          }]}
          onChange={() => {}}
        />
      );
      // Both unit price and amount show $10,000.00
      const formatted = screen.getAllByText('$10,000.00');
      expect(formatted.length).toBeGreaterThanOrEqual(1);
    });

    it('should format amounts with two decimal places', () => {
      render(
        <LineItemsTable
          items={[{
            description: 'Item',
            quantity: 1,
            unitPrice: 99.9,
            amount: 99.9,
            confidence: 90,
          }]}
          onChange={() => {}}
        />
      );
      // Both unit price and amount show $99.90
      const formatted = screen.getAllByText('$99.90');
      expect(formatted.length).toBeGreaterThanOrEqual(1);
    });
  });
});
