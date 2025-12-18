/**
 * T030.1 HomePage Component Tests
 *
 * Tests for the HomePage component that displays:
 * - Recent invoices list
 * - Filter by state (tabs or dropdown)
 * - "Nueva Factura" button
 * - Empty state with instructions
 */

import React from 'react';
import { render, screen, waitFor, fireEvent, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import { HomePage } from '../../../src/renderer/pages/HomePage';

// Get reference to the global mock (set up in tests/setup.ts)
const mockInvoke = window.electronAPI.invoke as jest.Mock;

// Helper to render with router
const renderWithRouter = (component: React.ReactElement, route = '/') => {
  return render(
    <MemoryRouter initialEntries={[route]}>
      {component}
    </MemoryRouter>
  );
};

// Sample invoice data for tests
const sampleInvoices = [
  {
    id: '1',
    invoiceNumber: 'FAC-001',
    invoiceDate: '2025-12-15',
    vendorId: 'vendor-1',
    vendor: { id: 'vendor-1', rfc: 'ABC123456789', businessName: 'Proveedor A' },
    subtotal: 1000.0,
    ivaAmount: 160.0,
    total: 1160.0,
    state: 'UPLOADED' as const,
    sourceType: 'text_based' as const,
    pdfPath: '/path/to/fac-001.pdf',
    createdAt: '2025-12-15T10:00:00Z',
    updatedAt: '2025-12-15T10:00:00Z',
  },
  {
    id: '2',
    invoiceNumber: 'FAC-002',
    invoiceDate: '2025-12-14',
    vendorId: 'vendor-2',
    vendor: { id: 'vendor-2', rfc: 'XYZ987654321', businessName: 'Proveedor B' },
    subtotal: 2500.0,
    ivaAmount: 400.0,
    total: 2900.0,
    state: 'EXTRACTED' as const,
    sourceType: 'scanned' as const,
    pdfPath: '/path/to/fac-002.pdf',
    createdAt: '2025-12-14T14:30:00Z',
    updatedAt: '2025-12-14T14:35:00Z',
  },
  {
    id: '3',
    invoiceNumber: 'FAC-003',
    invoiceDate: '2025-12-13',
    vendorId: 'vendor-1',
    vendor: { id: 'vendor-1', rfc: 'ABC123456789', businessName: 'Proveedor A' },
    subtotal: 5000.0,
    ivaAmount: 800.0,
    total: 5800.0,
    state: 'VALIDATED' as const,
    sourceType: 'text_based' as const,
    pdfPath: '/path/to/fac-003.pdf',
    createdAt: '2025-12-13T09:00:00Z',
    updatedAt: '2025-12-13T16:00:00Z',
  },
  {
    id: '4',
    invoiceNumber: 'FAC-004',
    invoiceDate: '2025-12-12',
    vendorId: 'vendor-3',
    vendor: { id: 'vendor-3', rfc: 'DEF456789012', businessName: 'Proveedor C' },
    subtotal: 7500.0,
    ivaAmount: 1200.0,
    total: 8700.0,
    state: 'POSTED' as const,
    sourceType: 'text_based' as const,
    pdfPath: '/path/to/fac-004.pdf',
    createdAt: '2025-12-12T11:00:00Z',
    updatedAt: '2025-12-12T17:00:00Z',
  },
];

describe('T030.1 - HomePage Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockInvoke.mockResolvedValue({
      success: true,
      invoices: [],
    });
  });

  // ==========================================================================
  // T030.1.1 - Component Structure Tests
  // ==========================================================================

  describe('T030.1.1 - Component Structure', () => {
    it('should export HomePage component', async () => {
      const module = await import('../../../src/renderer/pages/HomePage');
      expect(module.HomePage).toBeDefined();
      expect(typeof module.HomePage).toBe('function');
    });

    it('should render without crashing', () => {
      expect(() => {
        renderWithRouter(<HomePage />);
      }).not.toThrow();
    });

    it('should have proper page layout with Tailwind classes', () => {
      renderWithRouter(<HomePage />);

      const pageContainer = screen.getByTestId('home-page');
      expect(pageContainer).toBeInTheDocument();
      expect(pageContainer).toHaveClass('bg-gray-50');
    });

    it('should display page title "Facturas"', () => {
      renderWithRouter(<HomePage />);

      expect(screen.getByRole('heading', { name: /facturas/i })).toBeInTheDocument();
    });
  });

  // ==========================================================================
  // T030.1.2 - Recent Invoices List
  // ==========================================================================

  describe('T030.1.2 - Recent Invoices List', () => {
    it('should fetch invoices on mount', async () => {
      mockInvoke.mockResolvedValue({
        success: true,
        invoices: sampleInvoices,
      });

      renderWithRouter(<HomePage />);

      await waitFor(() => {
        expect(mockInvoke).toHaveBeenCalledWith('db:get-invoices', expect.any(Object));
      });
    });

    it('should display invoices in a table or list', async () => {
      mockInvoke.mockResolvedValue({
        success: true,
        invoices: sampleInvoices,
      });

      renderWithRouter(<HomePage />);

      await waitFor(() => {
        expect(screen.getByTestId('invoices-list')).toBeInTheDocument();
      });
    });

    it('should display invoice number for each invoice', async () => {
      mockInvoke.mockResolvedValue({
        success: true,
        invoices: sampleInvoices,
      });

      renderWithRouter(<HomePage />);

      await waitFor(() => {
        expect(screen.getByText('FAC-001')).toBeInTheDocument();
        expect(screen.getByText('FAC-002')).toBeInTheDocument();
      });
    });

    it('should display vendor name for each invoice', async () => {
      mockInvoke.mockResolvedValue({
        success: true,
        invoices: sampleInvoices,
      });

      renderWithRouter(<HomePage />);

      await waitFor(() => {
        // Using getAllByText since "Proveedor A" appears twice in test data
        const proveedorAElements = screen.getAllByText('Proveedor A');
        expect(proveedorAElements.length).toBeGreaterThanOrEqual(1);
        expect(screen.getByText('Proveedor B')).toBeInTheDocument();
      });
    });

    it('should display total amount for each invoice', async () => {
      mockInvoke.mockResolvedValue({
        success: true,
        invoices: sampleInvoices,
      });

      renderWithRouter(<HomePage />);

      await waitFor(() => {
        // Format may include $ and comma separators
        expect(screen.getByText(/1,160\.00/)).toBeInTheDocument();
        expect(screen.getByText(/2,900\.00/)).toBeInTheDocument();
      });
    });

    it('should display invoice date formatted in Spanish locale', async () => {
      mockInvoke.mockResolvedValue({
        success: true,
        invoices: [sampleInvoices[0]],
      });

      renderWithRouter(<HomePage />);

      await waitFor(() => {
        // Date should be formatted (e.g., "15/12/2025" or "15 dic 2025")
        expect(screen.getByText(/15.*12.*2025|15.*dic/i)).toBeInTheDocument();
      });
    });

    it('should display status badge for each invoice', async () => {
      mockInvoke.mockResolvedValue({
        success: true,
        invoices: sampleInvoices,
      });

      renderWithRouter(<HomePage />);

      await waitFor(() => {
        const statusBadges = screen.getAllByTestId(/invoice-status-badge/);
        expect(statusBadges.length).toBeGreaterThanOrEqual(1);
      });
    });

    it('should order invoices by date descending (most recent first)', async () => {
      mockInvoke.mockResolvedValue({
        success: true,
        invoices: sampleInvoices,
      });

      renderWithRouter(<HomePage />);

      await waitFor(() => {
        const rows = screen.getAllByTestId(/invoice-row/);
        expect(rows.length).toBe(4);

        // First row should be most recent (FAC-001 from Dec 15)
        expect(within(rows[0]).getByText('FAC-001')).toBeInTheDocument();
      });
    });

    it('should show loading state while fetching', () => {
      // Don't resolve the promise yet
      mockInvoke.mockImplementation(() => new Promise(() => {}));

      renderWithRouter(<HomePage />);

      expect(screen.getByTestId('loading-indicator')).toBeInTheDocument();
    });

    it('should handle fetch error gracefully', async () => {
      mockInvoke.mockResolvedValue({
        success: false,
        error: 'Error al cargar facturas',
      });

      renderWithRouter(<HomePage />);

      await waitFor(() => {
        expect(screen.getByText(/error/i)).toBeInTheDocument();
      });
    });
  });

  // ==========================================================================
  // T030.1.3 - Filter by State
  // ==========================================================================

  describe('T030.1.3 - Filter by State', () => {
    it('should display filter tabs or dropdown', async () => {
      mockInvoke.mockResolvedValue({
        success: true,
        invoices: sampleInvoices,
      });

      renderWithRouter(<HomePage />);

      await waitFor(() => {
        expect(screen.getByTestId('state-filter')).toBeInTheDocument();
      });
    });

    it('should have "Todas" option as default filter', async () => {
      mockInvoke.mockResolvedValue({
        success: true,
        invoices: sampleInvoices,
      });

      renderWithRouter(<HomePage />);

      await waitFor(() => {
        const allTab = screen.getByRole('tab', { name: /todas/i }) ||
                       screen.getByText(/todas/i);
        expect(allTab).toBeInTheDocument();
      });
    });

    it('should have filter options for each state', async () => {
      mockInvoke.mockResolvedValue({
        success: true,
        invoices: sampleInvoices,
      });

      renderWithRouter(<HomePage />);

      await waitFor(() => {
        expect(screen.getByText(/cargadas/i)).toBeInTheDocument();
        expect(screen.getByText(/extraídas/i)).toBeInTheDocument();
        expect(screen.getByText(/validadas/i)).toBeInTheDocument();
        expect(screen.getByText(/enviadas/i)).toBeInTheDocument();
      });
    });

    it('should filter invoices when a state is selected', async () => {
      const user = userEvent.setup();
      mockInvoke.mockResolvedValue({
        success: true,
        invoices: sampleInvoices,
      });

      renderWithRouter(<HomePage />);

      await waitFor(() => {
        expect(screen.getByText('FAC-001')).toBeInTheDocument();
      });

      // Click on "Validadas" filter
      const validatedFilter = screen.getByText(/validadas/i);
      await user.click(validatedFilter);

      await waitFor(() => {
        // Should call with state filter
        expect(mockInvoke).toHaveBeenCalledWith('db:get-invoices',
          expect.objectContaining({ state: 'VALIDATED' })
        );
      });
    });

    it('should show count for each filter option', async () => {
      mockInvoke.mockResolvedValue({
        success: true,
        invoices: sampleInvoices,
      });

      renderWithRouter(<HomePage />);

      await waitFor(() => {
        // Should show count badges (e.g., "Todas (4)")
        expect(screen.getByText(/todas.*4|4.*todas/i)).toBeInTheDocument();
      });
    });

    it('should highlight active filter', async () => {
      const user = userEvent.setup();
      mockInvoke.mockResolvedValue({
        success: true,
        invoices: sampleInvoices,
      });

      renderWithRouter(<HomePage />);

      await waitFor(() => {
        const allTab = screen.getByTestId('filter-all');
        expect(allTab).toHaveClass('bg-primary-600', { exact: false });
      });

      // Click another filter
      const validatedFilter = screen.getByTestId('filter-validated');
      await user.click(validatedFilter);

      await waitFor(() => {
        expect(validatedFilter).toHaveClass('bg-primary-600', { exact: false });
      });
    });
  });

  // ==========================================================================
  // T030.1.4 - Nueva Factura Button
  // ==========================================================================

  describe('T030.1.4 - Nueva Factura Button', () => {
    it('should display "Nueva Factura" button', async () => {
      mockInvoke.mockResolvedValue({
        success: true,
        invoices: sampleInvoices,
      });

      renderWithRouter(<HomePage />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /nueva factura/i })).toBeInTheDocument();
      });
    });

    it('should have proper styling for primary action', async () => {
      mockInvoke.mockResolvedValue({
        success: true,
        invoices: sampleInvoices,
      });

      renderWithRouter(<HomePage />);

      await waitFor(() => {
        const button = screen.getByRole('button', { name: /nueva factura/i });
        expect(button).toHaveClass('bg-primary-600');
      });
    });

    it('should navigate to processing page on click', async () => {
      const user = userEvent.setup();
      mockInvoke.mockResolvedValue({
        success: true,
        invoices: [],
      });

      renderWithRouter(<HomePage />);

      const button = await screen.findByRole('button', { name: /nueva factura/i });
      await user.click(button);

      // Navigation would trigger - check link destination
      const link = screen.getByTestId('new-invoice-link');
      expect(link).toHaveAttribute('href', '/processing');
    });

    it('should have plus icon', async () => {
      mockInvoke.mockResolvedValue({
        success: true,
        invoices: sampleInvoices,
      });

      renderWithRouter(<HomePage />);

      await waitFor(() => {
        const button = screen.getByRole('button', { name: /nueva factura/i });
        const icon = within(button).getByTestId('plus-icon');
        expect(icon).toBeInTheDocument();
      });
    });
  });

  // ==========================================================================
  // T030.1.5 - Empty State
  // ==========================================================================

  describe('T030.1.5 - Empty State', () => {
    it('should display empty state when no invoices', async () => {
      mockInvoke.mockResolvedValue({
        success: true,
        invoices: [],
      });

      renderWithRouter(<HomePage />);

      await waitFor(() => {
        expect(screen.getByTestId('empty-state')).toBeInTheDocument();
      });
    });

    it('should show instructional message in empty state', async () => {
      mockInvoke.mockResolvedValue({
        success: true,
        invoices: [],
      });

      renderWithRouter(<HomePage />);

      await waitFor(() => {
        expect(screen.getByText(/no hay facturas/i)).toBeInTheDocument();
      });
    });

    it('should show instructions on how to add a new invoice', async () => {
      mockInvoke.mockResolvedValue({
        success: true,
        invoices: [],
      });

      renderWithRouter(<HomePage />);

      await waitFor(() => {
        // The empty state includes instructional text about how to begin
        expect(screen.getByText(/para comenzar/i)).toBeInTheDocument();
      });
    });

    it('should have action button in empty state', async () => {
      mockInvoke.mockResolvedValue({
        success: true,
        invoices: [],
      });

      renderWithRouter(<HomePage />);

      await waitFor(() => {
        const emptyState = screen.getByTestId('empty-state');
        const actionButton = within(emptyState).getByRole('button', { name: /nueva factura|agregar/i });
        expect(actionButton).toBeInTheDocument();
      });
    });

    it('should display empty state icon', async () => {
      mockInvoke.mockResolvedValue({
        success: true,
        invoices: [],
      });

      renderWithRouter(<HomePage />);

      await waitFor(() => {
        const emptyState = screen.getByTestId('empty-state');
        const icon = within(emptyState).getByTestId('empty-state-icon');
        expect(icon).toBeInTheDocument();
      });
    });

    it('should not display empty state when invoices exist', async () => {
      mockInvoke.mockResolvedValue({
        success: true,
        invoices: sampleInvoices,
      });

      renderWithRouter(<HomePage />);

      await waitFor(() => {
        expect(screen.queryByTestId('empty-state')).not.toBeInTheDocument();
      });
    });

    it('should show empty state when filter has no results', async () => {
      // Component makes 2 initial calls (fetchInvoices and fetchCounts)
      // Then 1 more call when filter is clicked
      mockInvoke
        .mockResolvedValueOnce({ success: true, invoices: sampleInvoices }) // fetchInvoices initial
        .mockResolvedValueOnce({ success: true, invoices: sampleInvoices }) // fetchCounts
        .mockResolvedValueOnce({ success: true, invoices: [] }); // fetchInvoices with filter

      const user = userEvent.setup();
      renderWithRouter(<HomePage />);

      await waitFor(() => {
        expect(screen.getByText('FAC-001')).toBeInTheDocument();
      });

      // Filter to a state with no results (e.g., VALIDATED if we only have one validated invoice that we'll mock as empty)
      const validatedFilter = screen.getByText(/validadas/i);
      await user.click(validatedFilter);

      await waitFor(() => {
        expect(screen.getByTestId('empty-state')).toBeInTheDocument();
        // Check that it shows the filter-specific empty message
        expect(screen.getByText(/no hay facturas/i)).toBeInTheDocument();
      });
    });
  });

  // ==========================================================================
  // Invoice Row Actions
  // ==========================================================================

  describe('Invoice Row Actions', () => {
    it('should navigate to invoice detail on row click', async () => {
      const user = userEvent.setup();
      mockInvoke.mockResolvedValue({
        success: true,
        invoices: sampleInvoices,
      });

      renderWithRouter(<HomePage />);

      await waitFor(() => {
        expect(screen.getByText('FAC-001')).toBeInTheDocument();
      });

      const row = screen.getByTestId('invoice-row-1');
      await user.click(row);

      // Should have link to processing page with invoice id
      expect(row.closest('a') || row).toHaveAttribute('href', expect.stringContaining('/processing'));
    });

    it('should show hover state on invoice row', async () => {
      mockInvoke.mockResolvedValue({
        success: true,
        invoices: sampleInvoices,
      });

      renderWithRouter(<HomePage />);

      await waitFor(() => {
        const row = screen.getByTestId('invoice-row-1');
        expect(row).toHaveClass('hover:bg-gray-50');
      });
    });
  });

  // ==========================================================================
  // Styling Tests
  // ==========================================================================

  describe('Tailwind Styling', () => {
    it('should use consistent spacing', async () => {
      mockInvoke.mockResolvedValue({
        success: true,
        invoices: sampleInvoices,
      });

      renderWithRouter(<HomePage />);

      await waitFor(() => {
        const header = screen.getByTestId('page-header');
        expect(header).toHaveClass('p-4');
      });
    });

    it('should have responsive layout', async () => {
      mockInvoke.mockResolvedValue({
        success: true,
        invoices: sampleInvoices,
      });

      renderWithRouter(<HomePage />);

      await waitFor(() => {
        const container = screen.getByTestId('home-page');
        expect(container).toHaveClass('max-w-7xl', { exact: false });
      });
    });

    it('should style status badges appropriately', async () => {
      mockInvoke.mockResolvedValue({
        success: true,
        invoices: sampleInvoices,
      });

      renderWithRouter(<HomePage />);

      await waitFor(() => {
        const uploadedBadge = screen.getByTestId('invoice-status-badge-1');
        expect(uploadedBadge).toHaveClass('bg-blue-100');
      });
    });
  });
});
