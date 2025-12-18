/**
 * ProcessingPage Component
 *
 * Main page for processing invoice PDFs. Features a split-screen layout
 * with PDF viewer on the left and extraction form on the right.
 *
 * Uses Tailwind CSS for styling.
 */

import { useState, useCallback } from 'react';
import { FileUpload } from '../components/FileUpload';
import { PDFViewer } from '../components/PDFViewer';

/**
 * Status configuration for display
 */
interface StatusConfig {
  label: string;
  badgeClass: string;
  textClass: string;
}

const STATUS_CONFIG: Record<string, StatusConfig> = {
  none: {
    label: 'Sin archivo',
    badgeClass: 'bg-gray-100 text-gray-600',
    textClass: 'text-gray-500',
  },
  uploaded: {
    label: 'Cargado',
    badgeClass: 'bg-blue-100 text-blue-700',
    textClass: 'text-blue-600',
  },
  extracting: {
    label: 'Extrayendo...',
    badgeClass: 'bg-yellow-100 text-yellow-700',
    textClass: 'text-yellow-600',
  },
  extracted: {
    label: 'Extraído',
    badgeClass: 'bg-green-100 text-green-700',
    textClass: 'text-green-600',
  },
  error: {
    label: 'Error',
    badgeClass: 'bg-red-100 text-red-700',
    textClass: 'text-red-600',
  },
};

/**
 * Document Icon for header
 */
function DocumentIcon(): JSX.Element {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    </svg>
  );
}

/**
 * Clear/X Icon
 */
function ClearIcon(): JSX.Element {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

/**
 * ProcessingPage component for invoice PDF processing
 *
 * @example
 * ```tsx
 * <ProcessingPage />
 * ```
 */
export function ProcessingPage(): JSX.Element {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('none');
  // Scale state for future zoom controls
  const [_scale, _setScale] = useState<number>(1);

  /**
   * Handle file selection from FileUpload
   */
  const handleFileSelect = useCallback((file: File) => {
    setPdfFile(file);
    setPdfUrl(URL.createObjectURL(file));
    setStatus('uploaded');
  }, []);

  /**
   * Handle clear/reset
   */
  const handleClear = useCallback(() => {
    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl);
    }
    setPdfFile(null);
    setPdfUrl(null);
    setStatus('none');
  }, [pdfUrl]);

  /**
   * Get current status configuration
   */
  const noneConfig = STATUS_CONFIG.none!;
  const statusConfig = STATUS_CONFIG[status] ?? noneConfig;

  return (
    <div data-testid="processing-page" className="h-full flex flex-col bg-gray-50">
      {/* Page Header */}
      <header
        data-testid="page-header"
        className="bg-white border-b border-gray-200 px-4 py-3"
      >
        <div className="flex items-center justify-between">
          {/* Left side: Title and status */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-gray-700">
              <DocumentIcon />
              <h1 className="text-lg font-semibold">Procesar Factura</h1>
            </div>

            {/* Status Badge */}
            <span
              data-testid="status-badge"
              className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig.badgeClass}`}
            >
              <span data-testid="invoice-status">{statusConfig.label}</span>
            </span>

            {/* Filename */}
            {pdfFile && (
              <span
                data-testid="filename-display"
                className="text-sm text-gray-500 truncate max-w-xs"
              >
                {pdfFile.name}
              </span>
            )}
          </div>

          {/* Right side: Actions */}
          <div className="flex items-center space-x-2">
            {pdfFile && (
              <button
                data-testid="clear-button"
                onClick={handleClear}
                className="flex items-center space-x-1 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
                title="Limpiar"
              >
                <ClearIcon />
                <span>Limpiar</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Split Container */}
      <div
        data-testid="split-container"
        className="flex-1 flex flex-col lg:flex-row gap-4 p-4 overflow-hidden"
      >
        {/* PDF Panel (Left) */}
        <div
          data-testid="pdf-panel"
          className="w-full lg:w-1/2 min-h-[400px] bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
        >
          {pdfUrl ? (
            <div className="relative h-full">
              <PDFViewer
                file={pdfUrl}
                onLoadSuccess={({ numPages }) => {
                  console.log(`Loaded PDF with ${numPages} pages`);
                }}
              />
              {/* Bounding box overlay will be positioned here */}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center p-8">
              <FileUpload
                onFileSelect={handleFileSelect}
                maxSizeMB={50}
              />
            </div>
          )}
        </div>

        {/* Form Panel (Right) */}
        <div
          data-testid="form-panel"
          className="w-full lg:w-1/2 bg-white rounded-lg shadow-sm border border-gray-200 overflow-auto"
        >
          {/* Placeholder when no extraction results */}
          <div
            data-testid="form-placeholder"
            className="h-full flex flex-col items-center justify-center p-8 text-center"
          >
            <div className="w-16 h-16 mb-4 text-gray-300">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-700 mb-2">
              Sin datos de extracción
            </h3>
            <p className="text-gray-500 max-w-sm">
              Seleccione un archivo PDF para extraer los datos de la factura.
              Los campos extraídos aparecerán aquí para su revisión.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProcessingPage;
