/**
 * HomePage Component
 *
 * Main landing page displaying:
 * - Recent invoices list
 * - Filter by state (tabs)
 * - "Nueva Factura" button
 * - Empty state with instructions
 *
 * Uses Tailwind CSS for styling.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { Invoice, InvoiceState } from '../types';

/**
 * Filter tab configuration
 */
interface FilterTab {
  id: string;
  label: string;
  state: InvoiceState | null;
}

const FILTER_TABS: FilterTab[] = [
  { id: 'all', label: 'Todas', state: null },
  { id: 'uploaded', label: 'Cargadas', state: 'UPLOADED' },
  { id: 'extracted', label: 'Extraídas', state: 'EXTRACTED' },
  { id: 'validated', label: 'Validadas', state: 'VALIDATED' },
  { id: 'posted', label: 'Enviadas', state: 'POSTED' },
];

/**
 * Status badge configuration
 */
interface StatusConfig {
  label: string;
  bgClass: string;
  textClass: string;
}

const STATUS_CONFIG: Record<InvoiceState, StatusConfig> = {
  UPLOADED: {
    label: 'Cargada',
    bgClass: 'bg-blue-100',
    textClass: 'text-blue-700',
  },
  EXTRACTED: {
    label: 'Extraída',
    bgClass: 'bg-yellow-100',
    textClass: 'text-yellow-700',
  },
  VALIDATED: {
    label: 'Validada',
    bgClass: 'bg-green-100',
    textClass: 'text-green-700',
  },
  POSTED: {
    label: 'Enviada',
    bgClass: 'bg-purple-100',
    textClass: 'text-purple-700',
  },
};

/**
 * Plus Icon for button
 */
function PlusIcon(): JSX.Element {
  return (
    <svg
      data-testid="plus-icon"
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 4v16m8-8H4"
      />
    </svg>
  );
}

/**
 * Document Stack Icon for empty state
 */
function DocumentStackIcon(): JSX.Element {
  return (
    <svg
      data-testid="empty-state-icon"
      className="w-16 h-16 text-gray-300"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    </svg>
  );
}

/**
 * Loading spinner component
 */
function LoadingSpinner(): JSX.Element {
  return (
    <div data-testid="loading-indicator" className="flex justify-center items-center py-12">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
    </div>
  );
}

/**
 * Format currency in Mexican Peso format
 */
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(amount);
}

/**
 * Format date in Spanish locale
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('es-MX', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

/**
 * Empty state component
 */
interface EmptyStateProps {
  filterState: InvoiceState | null;
}

function EmptyState({ filterState }: EmptyStateProps): JSX.Element {
  const navigate = useNavigate();

  const getMessage = (): string => {
    if (filterState) {
      const stateLabel = STATUS_CONFIG[filterState]?.label.toLowerCase() || filterState.toLowerCase();
      return `No hay facturas ${stateLabel}s`;
    }
    return 'No hay facturas';
  };

  return (
    <div
      data-testid="empty-state"
      className="flex flex-col items-center justify-center py-16 px-4 text-center"
    >
      <DocumentStackIcon />
      <h3 className="mt-4 text-lg font-medium text-gray-700">
        {getMessage()}
      </h3>
      <p className="mt-2 text-gray-500 max-w-sm">
        Haga clic en "Nueva Factura" para comenzar a procesar una factura.
      </p>
      <button
        onClick={() => navigate('/processing')}
        className="mt-6 inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
      >
        <PlusIcon />
        <span className="ml-2">Nueva Factura</span>
      </button>
    </div>
  );
}

/**
 * Invoice row component
 */
interface InvoiceRowProps {
  invoice: Invoice;
  index: number;
}

function InvoiceRow({ invoice, index }: InvoiceRowProps): JSX.Element {
  const statusConfig = STATUS_CONFIG[invoice.state];
  const vendorName = invoice.vendor?.businessName || 'Proveedor desconocido';

  return (
    <Link
      to={`/processing?id=${invoice.id}`}
      data-testid={`invoice-row-${invoice.id}`}
      className="block hover:bg-gray-50 transition-colors"
    >
      <div className="px-4 py-4 flex items-center justify-between border-b border-gray-100 last:border-b-0">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-3">
            <span className="font-medium text-gray-900">{invoice.invoiceNumber}</span>
            <span
              data-testid={`invoice-status-badge-${invoice.id}`}
              className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig.bgClass} ${statusConfig.textClass}`}
            >
              {statusConfig.label}
            </span>
          </div>
          <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
            <span>{vendorName}</span>
            <span>{formatDate(invoice.invoiceDate)}</span>
          </div>
        </div>
        <div className="text-right">
          <span className="font-medium text-gray-900">{formatCurrency(invoice.total)}</span>
        </div>
      </div>
    </Link>
  );
}

/**
 * Filter tabs component
 */
interface FilterTabsProps {
  activeFilter: InvoiceState | null;
  onFilterChange: (state: InvoiceState | null) => void;
  counts: Record<string, number>;
}

function FilterTabs({ activeFilter, onFilterChange, counts }: FilterTabsProps): JSX.Element {
  return (
    <div data-testid="state-filter" className="flex space-x-1 bg-gray-100 rounded-lg p-1">
      {FILTER_TABS.map((tab) => {
        const isActive = activeFilter === tab.state;
        const count = tab.state ? counts[tab.state] || 0 : counts.total || 0;

        return (
          <button
            key={tab.id}
            data-testid={`filter-${tab.id}`}
            onClick={() => onFilterChange(tab.state)}
            role="tab"
            aria-selected={isActive}
            className={`
              px-3 py-1.5 rounded-md text-sm font-medium transition-colors
              ${isActive
                ? 'bg-primary-600 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
              }
            `}
          >
            {tab.label} ({count})
          </button>
        );
      })}
    </div>
  );
}

/**
 * HomePage component
 */
export function HomePage(): JSX.Element {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<InvoiceState | null>(null);
  const [counts, setCounts] = useState<Record<string, number>>({ total: 0 });

  /**
   * Fetch invoices from database
   */
  const fetchInvoices = useCallback(async (state: InvoiceState | null) => {
    setLoading(true);
    setError(null);

    try {
      const filters = state ? { state } : {};
      const result = await window.electronAPI.invoke('db:get-invoices', filters);

      if (result && typeof result === 'object') {
        const response = result as { success: boolean; invoices?: Invoice[]; error?: string };

        if (response.success && response.invoices) {
          setInvoices(response.invoices);
        } else {
          setError(response.error || 'Error al cargar facturas');
          setInvoices([]);
        }
      } else {
        setError('Respuesta inválida del servidor');
        setInvoices([]);
      }
    } catch (err) {
      setError('Error de conexión');
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Fetch all invoices to calculate counts
   */
  const fetchCounts = useCallback(async () => {
    try {
      const result = await window.electronAPI.invoke('db:get-invoices', {});

      if (result && typeof result === 'object') {
        const response = result as { success: boolean; invoices?: Invoice[] };

        if (response.success && response.invoices) {
          const newCounts: Record<string, number> = {
            total: response.invoices.length,
            UPLOADED: 0,
            EXTRACTED: 0,
            VALIDATED: 0,
            POSTED: 0,
          };

          response.invoices.forEach((inv) => {
            newCounts[inv.state] = (newCounts[inv.state] || 0) + 1;
          });

          setCounts(newCounts);
        }
      }
    } catch {
      // Silently fail count fetch
    }
  }, []);

  // Initial fetch and filter change handler
  useEffect(() => {
    fetchInvoices(activeFilter);
  }, [activeFilter, fetchInvoices]);

  // Fetch counts on mount only
  useEffect(() => {
    fetchCounts();
  }, [fetchCounts]);

  /**
   * Handle filter change
   */
  const handleFilterChange = (state: InvoiceState | null) => {
    setActiveFilter(state);
  };

  return (
    <div
      data-testid="home-page"
      className="min-h-full bg-gray-50 max-w-7xl mx-auto"
    >
      {/* Page Header */}
      <header data-testid="page-header" className="p-4 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Facturas</h1>
          <Link
            to="/processing"
            data-testid="new-invoice-link"
            className="inline-flex items-center"
          >
            <button className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors">
              <PlusIcon />
              <span className="ml-2">Nueva Factura</span>
            </button>
          </Link>
        </div>
      </header>

      {/* Filter Bar */}
      <div className="p-4 bg-white border-b border-gray-200">
        <FilterTabs
          activeFilter={activeFilter}
          onFilterChange={handleFilterChange}
          counts={counts}
        />
      </div>

      {/* Content Area */}
      <div className="p-4">
        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-600">Error: {error}</p>
          </div>
        ) : invoices.length === 0 ? (
          <EmptyState filterState={activeFilter} />
        ) : (
          <div
            data-testid="invoices-list"
            className="bg-white rounded-lg shadow-sm border border-gray-200"
          >
            {invoices.map((invoice, index) => (
              <InvoiceRow key={invoice.id} invoice={invoice} index={index} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default HomePage;
