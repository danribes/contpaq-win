/**
 * T017.1 - ProcessingPage Component Tests
 *
 * Tests for the processing page layout that:
 * - Creates ProcessingPage.tsx
 * - Implements split-screen layout (PDF | Form)
 * - Adds responsive breakpoints
 * - Adds page header with invoice status
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock URL.createObjectURL and revokeObjectURL
global.URL.createObjectURL = jest.fn(() => 'blob:mock-url');
global.URL.revokeObjectURL = jest.fn();

// Mock the child components
jest.mock('../../../src/renderer/components/PDFViewer', () => ({
  PDFViewer: ({ file }: { file: string }) => (
    <div data-testid="pdf-viewer">PDF: {file}</div>
  ),
}));

jest.mock('../../../src/renderer/components/FileUpload', () => ({
  FileUpload: ({ onFileSelect }: { onFileSelect: (file: File) => void }) => (
    <div data-testid="file-upload">
      <button
        data-testid="mock-file-select"
        onClick={() => onFileSelect(new File(['%PDF'], 'test.pdf', { type: 'application/pdf' }))}
      >
        Select File
      </button>
    </div>
  ),
}));

jest.mock('../../../src/renderer/components/BoundingBoxOverlay', () => ({
  BoundingBoxOverlay: () => <div data-testid="bbox-overlay" />,
}));

// Will be created in T017.1.1
let ProcessingPage: typeof import('../../../src/renderer/pages/ProcessingPage').ProcessingPage;

describe('T017.1 - ProcessingPage Component', () => {
  // ==========================================================================
  // T017.1.1 - Component Structure Tests
  // ==========================================================================

  describe('T017.1.1 - Component Structure', () => {
    it('should export ProcessingPage component', async () => {
      const module = await import('../../../src/renderer/pages/ProcessingPage');
      expect(module.ProcessingPage).toBeDefined();
      expect(typeof module.ProcessingPage).toBe('function');
    });

    it('should render without crashing', async () => {
      const module = await import('../../../src/renderer/pages/ProcessingPage');
      const { ProcessingPage: PP } = module;

      expect(() => {
        render(<PP />);
      }).not.toThrow();
    });

    it('should render page container', async () => {
      const module = await import('../../../src/renderer/pages/ProcessingPage');
      const { ProcessingPage: PP } = module;

      render(<PP />);

      expect(screen.getByTestId('processing-page')).toBeInTheDocument();
    });
  });

  // ==========================================================================
  // T017.1.2 - Split-screen Layout Tests
  // ==========================================================================

  describe('T017.1.2 - Split-screen Layout', () => {
    it('should render left panel for PDF viewer', async () => {
      const module = await import('../../../src/renderer/pages/ProcessingPage');
      const { ProcessingPage: PP } = module;

      render(<PP />);

      expect(screen.getByTestId('pdf-panel')).toBeInTheDocument();
    });

    it('should render right panel for form', async () => {
      const module = await import('../../../src/renderer/pages/ProcessingPage');
      const { ProcessingPage: PP } = module;

      render(<PP />);

      expect(screen.getByTestId('form-panel')).toBeInTheDocument();
    });

    it('should have flex container for panels', async () => {
      const module = await import('../../../src/renderer/pages/ProcessingPage');
      const { ProcessingPage: PP } = module;

      render(<PP />);

      const container = screen.getByTestId('split-container');
      expect(container).toHaveClass('flex');
    });

    it('should allocate equal width to both panels on large screens', async () => {
      const module = await import('../../../src/renderer/pages/ProcessingPage');
      const { ProcessingPage: PP } = module;

      render(<PP />);

      const pdfPanel = screen.getByTestId('pdf-panel');
      const formPanel = screen.getByTestId('form-panel');

      // Both should have w-1/2 for large screens
      expect(pdfPanel).toHaveClass('lg:w-1/2');
      expect(formPanel).toHaveClass('lg:w-1/2');
    });

    it('should show FileUpload when no PDF is loaded', async () => {
      const module = await import('../../../src/renderer/pages/ProcessingPage');
      const { ProcessingPage: PP } = module;

      render(<PP />);

      expect(screen.getByTestId('file-upload')).toBeInTheDocument();
    });

    it('should show PDFViewer when PDF is loaded', async () => {
      const module = await import('../../../src/renderer/pages/ProcessingPage');
      const { ProcessingPage: PP } = module;

      render(<PP />);

      // Simulate file selection
      const selectButton = screen.getByTestId('mock-file-select');
      fireEvent.click(selectButton);

      await waitFor(() => {
        expect(screen.getByTestId('pdf-viewer')).toBeInTheDocument();
      });
    });

    it('should hide FileUpload when PDF is loaded', async () => {
      const module = await import('../../../src/renderer/pages/ProcessingPage');
      const { ProcessingPage: PP } = module;

      render(<PP />);

      // Simulate file selection
      fireEvent.click(screen.getByTestId('mock-file-select'));

      await waitFor(() => {
        expect(screen.queryByTestId('file-upload')).not.toBeInTheDocument();
      });
    });
  });

  // ==========================================================================
  // T017.1.3 - Responsive Breakpoints Tests
  // ==========================================================================

  describe('T017.1.3 - Responsive Breakpoints', () => {
    it('should stack panels vertically on small screens', async () => {
      const module = await import('../../../src/renderer/pages/ProcessingPage');
      const { ProcessingPage: PP } = module;

      render(<PP />);

      const container = screen.getByTestId('split-container');
      expect(container).toHaveClass('flex-col');
      expect(container).toHaveClass('lg:flex-row');
    });

    it('should make PDF panel full width on small screens', async () => {
      const module = await import('../../../src/renderer/pages/ProcessingPage');
      const { ProcessingPage: PP } = module;

      render(<PP />);

      const pdfPanel = screen.getByTestId('pdf-panel');
      expect(pdfPanel).toHaveClass('w-full');
    });

    it('should make form panel full width on small screens', async () => {
      const module = await import('../../../src/renderer/pages/ProcessingPage');
      const { ProcessingPage: PP } = module;

      render(<PP />);

      const formPanel = screen.getByTestId('form-panel');
      expect(formPanel).toHaveClass('w-full');
    });

    it('should have minimum height for PDF panel', async () => {
      const module = await import('../../../src/renderer/pages/ProcessingPage');
      const { ProcessingPage: PP } = module;

      render(<PP />);

      const pdfPanel = screen.getByTestId('pdf-panel');
      expect(pdfPanel).toHaveClass('min-h-[400px]');
    });
  });

  // ==========================================================================
  // T017.1.4 - Page Header Tests
  // ==========================================================================

  describe('T017.1.4 - Page Header with Invoice Status', () => {
    it('should render page header', async () => {
      const module = await import('../../../src/renderer/pages/ProcessingPage');
      const { ProcessingPage: PP } = module;

      render(<PP />);

      expect(screen.getByTestId('page-header')).toBeInTheDocument();
    });

    it('should display page title', async () => {
      const module = await import('../../../src/renderer/pages/ProcessingPage');
      const { ProcessingPage: PP } = module;

      render(<PP />);

      expect(screen.getByText(/Procesar Factura/i)).toBeInTheDocument();
    });

    it('should show "Sin archivo" status when no file loaded', async () => {
      const module = await import('../../../src/renderer/pages/ProcessingPage');
      const { ProcessingPage: PP } = module;

      render(<PP />);

      expect(screen.getByTestId('invoice-status')).toHaveTextContent(/Sin archivo/i);
    });

    it('should show "Cargado" status when file is loaded', async () => {
      const module = await import('../../../src/renderer/pages/ProcessingPage');
      const { ProcessingPage: PP } = module;

      render(<PP />);

      fireEvent.click(screen.getByTestId('mock-file-select'));

      await waitFor(() => {
        expect(screen.getByTestId('invoice-status')).toHaveTextContent(/Cargado/i);
      });
    });

    it('should display filename when file is loaded', async () => {
      const module = await import('../../../src/renderer/pages/ProcessingPage');
      const { ProcessingPage: PP } = module;

      render(<PP />);

      fireEvent.click(screen.getByTestId('mock-file-select'));

      await waitFor(() => {
        expect(screen.getByTestId('filename-display')).toHaveTextContent('test.pdf');
      });
    });

    it('should have status badge with appropriate color', async () => {
      const module = await import('../../../src/renderer/pages/ProcessingPage');
      const { ProcessingPage: PP } = module;

      render(<PP />);

      const statusBadge = screen.getByTestId('status-badge');
      expect(statusBadge).toHaveClass('bg-gray-100'); // No file state
    });

    it('should change status badge color when file loaded', async () => {
      const module = await import('../../../src/renderer/pages/ProcessingPage');
      const { ProcessingPage: PP } = module;

      render(<PP />);

      fireEvent.click(screen.getByTestId('mock-file-select'));

      await waitFor(() => {
        const statusBadge = screen.getByTestId('status-badge');
        expect(statusBadge).toHaveClass('bg-blue-100');
      });
    });
  });

  // ==========================================================================
  // Form Panel Tests
  // ==========================================================================

  describe('Form Panel', () => {
    it('should show placeholder when no extraction results', async () => {
      const module = await import('../../../src/renderer/pages/ProcessingPage');
      const { ProcessingPage: PP } = module;

      render(<PP />);

      expect(screen.getByTestId('form-placeholder')).toBeInTheDocument();
    });

    it('should display instructions in placeholder', async () => {
      const module = await import('../../../src/renderer/pages/ProcessingPage');
      const { ProcessingPage: PP } = module;

      render(<PP />);

      expect(screen.getByText(/Seleccione.*PDF/i)).toBeInTheDocument();
    });
  });

  // ==========================================================================
  // Actions Tests
  // ==========================================================================

  describe('Page Actions', () => {
    it('should have clear/reset button when file is loaded', async () => {
      const module = await import('../../../src/renderer/pages/ProcessingPage');
      const { ProcessingPage: PP } = module;

      render(<PP />);

      fireEvent.click(screen.getByTestId('mock-file-select'));

      await waitFor(() => {
        expect(screen.getByTestId('clear-button')).toBeInTheDocument();
      });
    });

    it('should clear file when clear button clicked', async () => {
      const module = await import('../../../src/renderer/pages/ProcessingPage');
      const { ProcessingPage: PP } = module;

      render(<PP />);

      // Load file
      fireEvent.click(screen.getByTestId('mock-file-select'));

      await waitFor(() => {
        expect(screen.getByTestId('pdf-viewer')).toBeInTheDocument();
      });

      // Clear file
      fireEvent.click(screen.getByTestId('clear-button'));

      await waitFor(() => {
        expect(screen.getByTestId('file-upload')).toBeInTheDocument();
      });
    });
  });

  // ==========================================================================
  // Tailwind Styling Tests
  // ==========================================================================

  describe('Tailwind Styling', () => {
    it('should have full height layout', async () => {
      const module = await import('../../../src/renderer/pages/ProcessingPage');
      const { ProcessingPage: PP } = module;

      render(<PP />);

      const page = screen.getByTestId('processing-page');
      expect(page).toHaveClass('h-full');
    });

    it('should have proper padding on header', async () => {
      const module = await import('../../../src/renderer/pages/ProcessingPage');
      const { ProcessingPage: PP } = module;

      render(<PP />);

      const header = screen.getByTestId('page-header');
      expect(header).toHaveClass('px-4');
      expect(header).toHaveClass('py-3');
    });

    it('should have border between header and content', async () => {
      const module = await import('../../../src/renderer/pages/ProcessingPage');
      const { ProcessingPage: PP } = module;

      render(<PP />);

      const header = screen.getByTestId('page-header');
      expect(header).toHaveClass('border-b');
    });

    it('should have gap between panels', async () => {
      const module = await import('../../../src/renderer/pages/ProcessingPage');
      const { ProcessingPage: PP } = module;

      render(<PP />);

      const container = screen.getByTestId('split-container');
      expect(container).toHaveClass('gap-4');
    });
  });
});
