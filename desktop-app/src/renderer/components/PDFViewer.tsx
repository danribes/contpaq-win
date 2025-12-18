/**
 * PDFViewer Component
 *
 * A PDF viewer component with zoom controls and page navigation.
 * Uses react-pdf for rendering PDF documents.
 *
 * Uses Tailwind CSS for styling.
 */

import React, { useState, useCallback } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

/**
 * Props for the PDFViewer component
 */
export interface PDFViewerProps {
  /** PDF file URL, Blob, or File to display */
  file: string | File | Blob;
  /** Callback when PDF successfully loads */
  onLoadSuccess?: (data: { numPages: number }) => void;
  /** Callback when PDF fails to load */
  onLoadError?: (error: Error) => void;
  /** Error message to display */
  error?: string;
  /** Initial page number (default: 1) */
  initialPage?: number;
  /** Initial zoom level (default: 1.0) */
  initialScale?: number;
  /** Width of the PDF container */
  width?: number;
}

// Zoom constants
const MIN_SCALE = 0.25;
const MAX_SCALE = 3.0;
const SCALE_STEP = 0.25;
const DEFAULT_SCALE = 1.0;

/**
 * Zoom In Icon
 */
function ZoomInIcon(): JSX.Element {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
    </svg>
  );
}

/**
 * Zoom Out Icon
 */
function ZoomOutIcon(): JSX.Element {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
    </svg>
  );
}

/**
 * Reset Zoom Icon
 */
function ResetIcon(): JSX.Element {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  );
}

/**
 * Previous Page Icon
 */
function PrevIcon(): JSX.Element {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
  );
}

/**
 * Next Page Icon
 */
function NextIcon(): JSX.Element {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  );
}

/**
 * Loading Spinner
 */
function LoadingSpinner(): JSX.Element {
  return (
    <div data-testid="pdf-loading" className="flex items-center justify-center p-8">
      <svg
        className="animate-spin h-8 w-8 text-blue-500"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      <span className="ml-2 text-gray-600">Cargando PDF...</span>
    </div>
  );
}

/**
 * PDFViewer component for displaying PDF documents with zoom and navigation
 *
 * @example
 * ```tsx
 * <PDFViewer
 *   file={pdfUrl}
 *   onLoadSuccess={({ numPages }) => console.log(`Loaded ${numPages} pages`)}
 * />
 * ```
 */
export function PDFViewer({
  file,
  onLoadSuccess,
  onLoadError,
  error,
  initialPage = 1,
  initialScale = DEFAULT_SCALE,
  width,
}: PDFViewerProps): JSX.Element {
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(initialPage);
  const [scale, setScale] = useState<number>(initialScale);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [pageInputValue, setPageInputValue] = useState<string>(String(initialPage));

  /**
   * Handle successful PDF load
   */
  const handleLoadSuccess = useCallback(
    ({ numPages: pages }: { numPages: number }) => {
      setNumPages(pages);
      setIsLoading(false);
      onLoadSuccess?.({ numPages: pages });
    },
    [onLoadSuccess]
  );

  /**
   * Handle PDF load error
   */
  const handleLoadError = useCallback(
    (err: Error) => {
      setIsLoading(false);
      onLoadError?.(err);
    },
    [onLoadError]
  );

  /**
   * Zoom in
   */
  const handleZoomIn = useCallback(() => {
    setScale((prev) => Math.min(prev + SCALE_STEP, MAX_SCALE));
  }, []);

  /**
   * Zoom out
   */
  const handleZoomOut = useCallback(() => {
    setScale((prev) => Math.max(prev - SCALE_STEP, MIN_SCALE));
  }, []);

  /**
   * Reset zoom to default
   */
  const handleZoomReset = useCallback(() => {
    setScale(DEFAULT_SCALE);
  }, []);

  /**
   * Go to previous page
   */
  const handlePrevPage = useCallback(() => {
    setCurrentPage((prev) => {
      const newPage = Math.max(prev - 1, 1);
      setPageInputValue(String(newPage));
      return newPage;
    });
  }, []);

  /**
   * Go to next page
   */
  const handleNextPage = useCallback(() => {
    setCurrentPage((prev) => {
      const newPage = Math.min(prev + 1, numPages);
      setPageInputValue(String(newPage));
      return newPage;
    });
  }, [numPages]);

  /**
   * Handle page input change
   */
  const handlePageInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setPageInputValue(event.target.value);
    },
    []
  );

  /**
   * Handle page input blur (navigate to page)
   */
  const handlePageInputBlur = useCallback(() => {
    const pageNum = parseInt(pageInputValue, 10);
    if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= numPages) {
      setCurrentPage(pageNum);
    } else {
      setPageInputValue(String(currentPage));
    }
  }, [pageInputValue, numPages, currentPage]);

  /**
   * Handle page input key press
   */
  const handlePageInputKeyPress = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Enter') {
        handlePageInputBlur();
      }
    },
    [handlePageInputBlur]
  );

  // Calculate zoom percentage for display
  const zoomPercentage = Math.round(scale * 100);

  return (
    <div data-testid="pdf-viewer" className="flex flex-col h-full bg-gray-100">
      {/* Toolbar */}
      <div
        data-testid="pdf-toolbar"
        className="flex items-center justify-between px-4 py-2 bg-white border-b border-gray-200"
      >
        {/* Page Navigation */}
        <div className="flex items-center space-x-2">
          <button
            data-testid="prev-page-button"
            onClick={handlePrevPage}
            disabled={currentPage <= 1 || isLoading}
            className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Página anterior"
          >
            <PrevIcon />
          </button>

          <div className="flex items-center space-x-1">
            <input
              data-testid="page-input"
              type="text"
              value={pageInputValue}
              onChange={handlePageInputChange}
              onBlur={handlePageInputBlur}
              onKeyPress={handlePageInputKeyPress}
              className="w-12 px-2 py-1 text-center border border-gray-300 rounded text-sm"
              disabled={isLoading}
            />
            <span data-testid="page-info" className="text-sm text-gray-600">
              {currentPage} / {numPages || '?'}
            </span>
          </div>

          <button
            data-testid="next-page-button"
            onClick={handleNextPage}
            disabled={currentPage >= numPages || isLoading}
            className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Página siguiente"
          >
            <NextIcon />
          </button>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center space-x-2">
          <button
            data-testid="zoom-out-button"
            onClick={handleZoomOut}
            disabled={scale <= MIN_SCALE}
            className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Alejar"
          >
            <ZoomOutIcon />
          </button>

          <span data-testid="zoom-level" className="text-sm text-gray-600 w-14 text-center">
            {zoomPercentage}%
          </span>

          <button
            data-testid="zoom-in-button"
            onClick={handleZoomIn}
            disabled={scale >= MAX_SCALE}
            className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Acercar"
          >
            <ZoomInIcon />
          </button>

          <button
            data-testid="zoom-reset-button"
            onClick={handleZoomReset}
            className="p-2 rounded hover:bg-gray-100"
            title="Restablecer zoom"
          >
            <ResetIcon />
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border-b border-red-200">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* PDF Container */}
      <div
        data-testid="pdf-container"
        className="flex-1 overflow-auto flex justify-center bg-gray-200 p-4"
      >
        <Document
          file={file}
          onLoadSuccess={handleLoadSuccess}
          onLoadError={handleLoadError}
          loading={<LoadingSpinner />}
        >
          {isLoading ? (
            <LoadingSpinner />
          ) : (
            <Page
              pageNumber={currentPage}
              scale={scale}
              width={width}
              renderTextLayer={false}
              renderAnnotationLayer={false}
            />
          )}
        </Document>
      </div>
    </div>
  );
}

export default PDFViewer;
