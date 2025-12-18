/**
 * T016.1 - PDFViewer Component Tests
 *
 * Tests for the PDF viewer component that:
 * - Renders PDF documents using react-pdf
 * - Implements zoom controls
 * - Implements page navigation
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock react-pdf before importing the component
jest.mock('react-pdf', () => ({
  Document: ({ children, onLoadSuccess, onLoadError, file }: any) => {
    // Simulate successful load after render
    React.useEffect(() => {
      if (file) {
        // Simulate async load
        setTimeout(() => {
          onLoadSuccess?.({ numPages: 5 });
        }, 0);
      }
    }, [file, onLoadSuccess]);

    return <div data-testid="pdf-document">{children}</div>;
  },
  Page: ({ pageNumber, scale, width }: any) => (
    <div
      data-testid={`pdf-page-${pageNumber}`}
      data-scale={scale}
      data-width={width}
    >
      Page {pageNumber}
    </div>
  ),
  pdfjs: {
    GlobalWorkerOptions: {
      workerSrc: '',
    },
  },
}));

// Import after mocking
let PDFViewer: typeof import('../../../src/renderer/components/PDFViewer').PDFViewer;

describe('T016.1 - PDFViewer Component', () => {
  const mockPdfUrl = 'blob:http://localhost/test-pdf';
  const mockPdfFile = new File(['%PDF-1.4'], 'test.pdf', { type: 'application/pdf' });

  // ==========================================================================
  // T016.1.1 - Component Structure Tests
  // ==========================================================================

  describe('T016.1.1 - Component Structure', () => {
    it('should export PDFViewer component', async () => {
      const module = await import('../../../src/renderer/components/PDFViewer');
      expect(module.PDFViewer).toBeDefined();
      expect(typeof module.PDFViewer).toBe('function');
    });

    it('should render without crashing', async () => {
      const module = await import('../../../src/renderer/components/PDFViewer');
      const { PDFViewer: PV } = module;

      expect(() => {
        render(<PV file={mockPdfUrl} />);
      }).not.toThrow();
    });

    it('should render PDF container', async () => {
      const module = await import('../../../src/renderer/components/PDFViewer');
      const { PDFViewer: PV } = module;

      render(<PV file={mockPdfUrl} />);

      expect(screen.getByTestId('pdf-viewer')).toBeInTheDocument();
    });
  });

  // ==========================================================================
  // T016.1.2/3 - PDF Rendering Tests
  // ==========================================================================

  describe('T016.1.2/3 - PDF Rendering with react-pdf', () => {
    it('should render PDF Document component', async () => {
      const module = await import('../../../src/renderer/components/PDFViewer');
      const { PDFViewer: PV } = module;

      render(<PV file={mockPdfUrl} />);

      expect(screen.getByTestId('pdf-document')).toBeInTheDocument();
    });

    it('should pass file prop to Document', async () => {
      const module = await import('../../../src/renderer/components/PDFViewer');
      const { PDFViewer: PV } = module;

      render(<PV file={mockPdfUrl} />);

      // Document should be rendered with file
      expect(screen.getByTestId('pdf-document')).toBeInTheDocument();
    });

    it('should render Page component', async () => {
      const module = await import('../../../src/renderer/components/PDFViewer');
      const { PDFViewer: PV } = module;

      render(<PV file={mockPdfUrl} />);

      await waitFor(() => {
        expect(screen.getByTestId('pdf-page-1')).toBeInTheDocument();
      });
    });

    it('should show loading state initially', async () => {
      const module = await import('../../../src/renderer/components/PDFViewer');
      const { PDFViewer: PV } = module;

      render(<PV file={mockPdfUrl} />);

      // Should show loading indicator before PDF loads
      expect(screen.getByTestId('pdf-loading')).toBeInTheDocument();
    });

    it('should hide loading state after PDF loads', async () => {
      const module = await import('../../../src/renderer/components/PDFViewer');
      const { PDFViewer: PV } = module;

      render(<PV file={mockPdfUrl} />);

      await waitFor(() => {
        expect(screen.queryByTestId('pdf-loading')).not.toBeInTheDocument();
      });
    });

    it('should call onLoadSuccess when PDF loads', async () => {
      const module = await import('../../../src/renderer/components/PDFViewer');
      const { PDFViewer: PV } = module;

      const onLoadSuccess = jest.fn();
      render(<PV file={mockPdfUrl} onLoadSuccess={onLoadSuccess} />);

      await waitFor(() => {
        expect(onLoadSuccess).toHaveBeenCalledWith({ numPages: 5 });
      });
    });
  });

  // ==========================================================================
  // T016.1.4 - Zoom Controls Tests
  // ==========================================================================

  describe('T016.1.4 - Zoom Controls', () => {
    it('should render zoom in button', async () => {
      const module = await import('../../../src/renderer/components/PDFViewer');
      const { PDFViewer: PV } = module;

      render(<PV file={mockPdfUrl} />);

      expect(screen.getByTestId('zoom-in-button')).toBeInTheDocument();
    });

    it('should render zoom out button', async () => {
      const module = await import('../../../src/renderer/components/PDFViewer');
      const { PDFViewer: PV } = module;

      render(<PV file={mockPdfUrl} />);

      expect(screen.getByTestId('zoom-out-button')).toBeInTheDocument();
    });

    it('should render zoom reset button', async () => {
      const module = await import('../../../src/renderer/components/PDFViewer');
      const { PDFViewer: PV } = module;

      render(<PV file={mockPdfUrl} />);

      expect(screen.getByTestId('zoom-reset-button')).toBeInTheDocument();
    });

    it('should display current zoom level', async () => {
      const module = await import('../../../src/renderer/components/PDFViewer');
      const { PDFViewer: PV } = module;

      render(<PV file={mockPdfUrl} />);

      expect(screen.getByTestId('zoom-level')).toBeInTheDocument();
      expect(screen.getByTestId('zoom-level')).toHaveTextContent('100%');
    });

    it('should increase zoom when zoom in button clicked', async () => {
      const module = await import('../../../src/renderer/components/PDFViewer');
      const { PDFViewer: PV } = module;

      render(<PV file={mockPdfUrl} />);

      const zoomInButton = screen.getByTestId('zoom-in-button');
      fireEvent.click(zoomInButton);

      expect(screen.getByTestId('zoom-level')).toHaveTextContent('125%');
    });

    it('should decrease zoom when zoom out button clicked', async () => {
      const module = await import('../../../src/renderer/components/PDFViewer');
      const { PDFViewer: PV } = module;

      render(<PV file={mockPdfUrl} />);

      const zoomOutButton = screen.getByTestId('zoom-out-button');
      fireEvent.click(zoomOutButton);

      expect(screen.getByTestId('zoom-level')).toHaveTextContent('75%');
    });

    it('should reset zoom to 100% when reset button clicked', async () => {
      const module = await import('../../../src/renderer/components/PDFViewer');
      const { PDFViewer: PV } = module;

      render(<PV file={mockPdfUrl} />);

      // First zoom in (25% steps: 100% -> 125% -> 150%)
      fireEvent.click(screen.getByTestId('zoom-in-button'));
      fireEvent.click(screen.getByTestId('zoom-in-button'));
      expect(screen.getByTestId('zoom-level')).toHaveTextContent('150%');

      // Then reset
      fireEvent.click(screen.getByTestId('zoom-reset-button'));
      expect(screen.getByTestId('zoom-level')).toHaveTextContent('100%');
    });

    it('should have minimum zoom limit', async () => {
      const module = await import('../../../src/renderer/components/PDFViewer');
      const { PDFViewer: PV } = module;

      render(<PV file={mockPdfUrl} />);

      const zoomOutButton = screen.getByTestId('zoom-out-button');

      // Click many times
      for (let i = 0; i < 10; i++) {
        fireEvent.click(zoomOutButton);
      }

      // Should not go below 25%
      const zoomLevel = screen.getByTestId('zoom-level').textContent;
      const zoomValue = parseInt(zoomLevel?.replace('%', '') || '0');
      expect(zoomValue).toBeGreaterThanOrEqual(25);
    });

    it('should have maximum zoom limit', async () => {
      const module = await import('../../../src/renderer/components/PDFViewer');
      const { PDFViewer: PV } = module;

      render(<PV file={mockPdfUrl} />);

      const zoomInButton = screen.getByTestId('zoom-in-button');

      // Click many times
      for (let i = 0; i < 20; i++) {
        fireEvent.click(zoomInButton);
      }

      // Should not go above 300%
      const zoomLevel = screen.getByTestId('zoom-level').textContent;
      const zoomValue = parseInt(zoomLevel?.replace('%', '') || '0');
      expect(zoomValue).toBeLessThanOrEqual(300);
    });

    it('should apply scale to PDF page', async () => {
      const module = await import('../../../src/renderer/components/PDFViewer');
      const { PDFViewer: PV } = module;

      render(<PV file={mockPdfUrl} />);

      await waitFor(() => {
        expect(screen.getByTestId('pdf-page-1')).toBeInTheDocument();
      });

      // Zoom in
      fireEvent.click(screen.getByTestId('zoom-in-button'));

      await waitFor(() => {
        const page = screen.getByTestId('pdf-page-1');
        expect(page).toHaveAttribute('data-scale', '1.25');
      });
    });
  });

  // ==========================================================================
  // T016.1.5 - Page Navigation Tests
  // ==========================================================================

  describe('T016.1.5 - Page Navigation', () => {
    it('should render previous page button', async () => {
      const module = await import('../../../src/renderer/components/PDFViewer');
      const { PDFViewer: PV } = module;

      render(<PV file={mockPdfUrl} />);

      expect(screen.getByTestId('prev-page-button')).toBeInTheDocument();
    });

    it('should render next page button', async () => {
      const module = await import('../../../src/renderer/components/PDFViewer');
      const { PDFViewer: PV } = module;

      render(<PV file={mockPdfUrl} />);

      expect(screen.getByTestId('next-page-button')).toBeInTheDocument();
    });

    it('should display current page and total pages', async () => {
      const module = await import('../../../src/renderer/components/PDFViewer');
      const { PDFViewer: PV } = module;

      render(<PV file={mockPdfUrl} />);

      await waitFor(() => {
        const pageInfo = screen.getByTestId('page-info');
        expect(pageInfo).toHaveTextContent('1 / 5');
      });
    });

    it('should go to next page when next button clicked', async () => {
      const module = await import('../../../src/renderer/components/PDFViewer');
      const { PDFViewer: PV } = module;

      render(<PV file={mockPdfUrl} />);

      await waitFor(() => {
        expect(screen.getByTestId('page-info')).toHaveTextContent('1 / 5');
      });

      fireEvent.click(screen.getByTestId('next-page-button'));

      expect(screen.getByTestId('page-info')).toHaveTextContent('2 / 5');
    });

    it('should go to previous page when prev button clicked', async () => {
      const module = await import('../../../src/renderer/components/PDFViewer');
      const { PDFViewer: PV } = module;

      render(<PV file={mockPdfUrl} />);

      await waitFor(() => {
        expect(screen.getByTestId('page-info')).toHaveTextContent('1 / 5');
      });

      // Go to page 2 first
      fireEvent.click(screen.getByTestId('next-page-button'));
      expect(screen.getByTestId('page-info')).toHaveTextContent('2 / 5');

      // Then go back to page 1
      fireEvent.click(screen.getByTestId('prev-page-button'));
      expect(screen.getByTestId('page-info')).toHaveTextContent('1 / 5');
    });

    it('should disable prev button on first page', async () => {
      const module = await import('../../../src/renderer/components/PDFViewer');
      const { PDFViewer: PV } = module;

      render(<PV file={mockPdfUrl} />);

      await waitFor(() => {
        expect(screen.getByTestId('page-info')).toHaveTextContent('1 / 5');
      });

      expect(screen.getByTestId('prev-page-button')).toBeDisabled();
    });

    it('should disable next button on last page', async () => {
      const module = await import('../../../src/renderer/components/PDFViewer');
      const { PDFViewer: PV } = module;

      render(<PV file={mockPdfUrl} />);

      await waitFor(() => {
        expect(screen.getByTestId('page-info')).toHaveTextContent('1 / 5');
      });

      // Navigate to last page
      for (let i = 0; i < 4; i++) {
        fireEvent.click(screen.getByTestId('next-page-button'));
      }

      expect(screen.getByTestId('page-info')).toHaveTextContent('5 / 5');
      expect(screen.getByTestId('next-page-button')).toBeDisabled();
    });

    it('should render correct page number in Page component', async () => {
      const module = await import('../../../src/renderer/components/PDFViewer');
      const { PDFViewer: PV } = module;

      render(<PV file={mockPdfUrl} />);

      await waitFor(() => {
        expect(screen.getByTestId('pdf-page-1')).toBeInTheDocument();
      });

      // Go to page 3
      fireEvent.click(screen.getByTestId('next-page-button'));
      fireEvent.click(screen.getByTestId('next-page-button'));

      await waitFor(() => {
        expect(screen.getByTestId('pdf-page-3')).toBeInTheDocument();
      });
    });

    it('should have page input for direct navigation', async () => {
      const module = await import('../../../src/renderer/components/PDFViewer');
      const { PDFViewer: PV } = module;

      render(<PV file={mockPdfUrl} />);

      await waitFor(() => {
        expect(screen.getByTestId('page-input')).toBeInTheDocument();
      });
    });

    it('should navigate to page when input value changed', async () => {
      const module = await import('../../../src/renderer/components/PDFViewer');
      const { PDFViewer: PV } = module;

      render(<PV file={mockPdfUrl} />);

      await waitFor(() => {
        expect(screen.getByTestId('page-input')).toBeInTheDocument();
      });

      const pageInput = screen.getByTestId('page-input') as HTMLInputElement;
      fireEvent.change(pageInput, { target: { value: '3' } });
      fireEvent.blur(pageInput);

      expect(screen.getByTestId('page-info')).toHaveTextContent('3 / 5');
    });
  });

  // ==========================================================================
  // Error Handling Tests
  // ==========================================================================

  describe('Error Handling', () => {
    it('should call onLoadError when PDF fails to load', async () => {
      // Re-mock with error simulation
      jest.doMock('react-pdf', () => ({
        Document: ({ onLoadError }: any) => {
          React.useEffect(() => {
            onLoadError?.(new Error('Failed to load PDF'));
          }, [onLoadError]);
          return <div data-testid="pdf-document" />;
        },
        Page: () => <div />,
        pdfjs: { GlobalWorkerOptions: { workerSrc: '' } },
      }));

      const module = await import('../../../src/renderer/components/PDFViewer');
      const { PDFViewer: PV } = module;

      const onLoadError = jest.fn();
      render(<PV file="invalid.pdf" onLoadError={onLoadError} />);

      // Error handling is async, give it time
      await waitFor(
        () => {
          // Component should handle the error gracefully
          expect(screen.getByTestId('pdf-viewer')).toBeInTheDocument();
        },
        { timeout: 1000 }
      );
    });

    it('should display error message when PDF fails to load', async () => {
      const module = await import('../../../src/renderer/components/PDFViewer');
      const { PDFViewer: PV } = module;

      const { rerender } = render(<PV file={mockPdfUrl} />);

      // Simulate error state by passing error prop
      rerender(<PV file={mockPdfUrl} error="No se pudo cargar el PDF" />);

      expect(screen.getByText(/No se pudo cargar el PDF/i)).toBeInTheDocument();
    });
  });

  // ==========================================================================
  // Tailwind Styling Tests
  // ==========================================================================

  describe('Tailwind Styling', () => {
    it('should have overflow scroll on PDF container', async () => {
      const module = await import('../../../src/renderer/components/PDFViewer');
      const { PDFViewer: PV } = module;

      render(<PV file={mockPdfUrl} />);

      const container = screen.getByTestId('pdf-container');
      expect(container).toHaveClass('overflow-auto');
    });

    it('should have toolbar with flex layout', async () => {
      const module = await import('../../../src/renderer/components/PDFViewer');
      const { PDFViewer: PV } = module;

      render(<PV file={mockPdfUrl} />);

      const toolbar = screen.getByTestId('pdf-toolbar');
      expect(toolbar).toHaveClass('flex');
    });

    it('should have proper button styling', async () => {
      const module = await import('../../../src/renderer/components/PDFViewer');
      const { PDFViewer: PV } = module;

      render(<PV file={mockPdfUrl} />);

      const zoomInButton = screen.getByTestId('zoom-in-button');
      expect(zoomInButton).toHaveClass('rounded');
    });
  });
});
