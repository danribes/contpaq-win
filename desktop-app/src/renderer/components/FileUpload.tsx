/**
 * FileUpload Component
 *
 * A drag-and-drop file upload component for PDF files.
 * Supports file picker and drag-and-drop with progress indication.
 *
 * Uses Tailwind CSS for styling.
 */

import React, { useRef, useState, useCallback } from 'react';

/**
 * Props for the FileUpload component
 */
export interface FileUploadProps {
  /** Callback when a valid file is selected */
  onFileSelect: (file: File) => void;
  /** Callback when upload starts */
  onUploadStart?: () => void;
  /** Callback when upload completes */
  onUploadComplete?: () => void;
  /** Callback when an error occurs */
  onError?: (error: string) => void;
  /** Whether an upload is in progress */
  isUploading?: boolean;
  /** Upload progress (0-100) */
  progress?: number;
  /** Accepted file types (default: PDF) */
  accept?: string;
  /** Maximum file size in MB (default: 50) */
  maxSizeMB?: number;
  /** Whether the component is disabled */
  disabled?: boolean;
  /** Error message to display */
  error?: string;
}

/**
 * PDF Icon SVG component
 */
function PDFIcon(): JSX.Element {
  return (
    <svg
      data-testid="pdf-icon"
      className="w-12 h-12 text-gray-400 mb-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M9 13h6M9 17h6M9 9h.01"
      />
    </svg>
  );
}

/**
 * FileUpload component for selecting and uploading PDF files
 *
 * @example
 * ```tsx
 * <FileUpload
 *   onFileSelect={(file) => handleFile(file)}
 *   onError={(error) => setError(error)}
 *   isUploading={uploading}
 *   progress={uploadProgress}
 * />
 * ```
 */
export function FileUpload({
  onFileSelect,
  onError,
  isUploading = false,
  progress = 0,
  accept = '.pdf,application/pdf',
  maxSizeMB = 50,
  disabled = false,
  error,
}: FileUploadProps): JSX.Element {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  /**
   * Validate the selected file
   */
  const validateFile = useCallback(
    (file: File): string | null => {
      // Check file type
      const isPDF =
        file.type === 'application/pdf' ||
        file.name.toLowerCase().endsWith('.pdf');

      if (!isPDF) {
        return 'Solo se permiten archivos PDF. Por favor, seleccione un archivo PDF válido.';
      }

      // Check file size
      const maxSizeBytes = maxSizeMB * 1024 * 1024;
      if (file.size > maxSizeBytes) {
        return `El archivo excede el tamaño máximo de ${maxSizeMB}MB.`;
      }

      return null;
    },
    [maxSizeMB]
  );

  /**
   * Handle file selection from input or drop
   */
  const handleFile = useCallback(
    (file: File) => {
      if (disabled || isUploading) return;

      const validationError = validateFile(file);
      if (validationError) {
        onError?.(validationError);
        return;
      }

      onFileSelect(file);
    },
    [disabled, isUploading, validateFile, onError, onFileSelect]
  );

  /**
   * Handle file input change
   */
  const handleInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        handleFile(file);
      }
      // Reset input so the same file can be selected again
      event.target.value = '';
    },
    [handleFile]
  );

  /**
   * Handle button click to trigger file input
   */
  const handleButtonClick = useCallback(() => {
    if (!disabled && !isUploading) {
      fileInputRef.current?.click();
    }
  }, [disabled, isUploading]);

  /**
   * Handle drag enter
   */
  const handleDragEnter = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      event.stopPropagation();
      if (!disabled && !isUploading) {
        setIsDragging(true);
      }
    },
    [disabled, isUploading]
  );

  /**
   * Handle drag over
   */
  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
  }, []);

  /**
   * Handle drag leave
   */
  const handleDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
  }, []);

  /**
   * Handle file drop
   */
  const handleDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      event.stopPropagation();
      setIsDragging(false);

      if (disabled || isUploading) return;

      const file = event.dataTransfer.files[0];
      if (file) {
        handleFile(file);
      }
    },
    [disabled, isUploading, handleFile]
  );

  // Determine drop zone classes based on state
  const dropZoneClasses = [
    'border-2',
    'border-dashed',
    'rounded-lg',
    'p-8',
    'text-center',
    'cursor-pointer',
    'transition-colors',
    'duration-200',
    isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300',
    !isDragging && !disabled && 'hover:border-blue-400 hover:bg-gray-50',
    disabled && 'opacity-50 cursor-not-allowed',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="w-full">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        data-testid="file-input"
        accept={accept}
        onChange={handleInputChange}
        disabled={disabled || isUploading}
        className="hidden"
      />

      {/* Drop zone */}
      <div
        data-testid="drop-zone"
        className={dropZoneClasses}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleButtonClick}
      >
        {isUploading ? (
          /* Upload progress display */
          <div className="flex flex-col items-center">
            <div className="w-full max-w-xs mb-4">
              <div
                data-testid="progress-bar"
                className="w-full h-2 bg-gray-200 rounded-full overflow-hidden"
              >
                <div
                  data-testid="progress-fill"
                  className="h-full bg-blue-500 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
            <p className="text-gray-600 font-medium">
              Procesando... {progress}%
            </p>
          </div>
        ) : (
          /* Default drop zone content */
          <div className="flex flex-col items-center">
            <PDFIcon />
            <p className="text-gray-600 mb-2">
              Arrastre un archivo PDF aquí o
            </p>
            <button
              type="button"
              onClick={handleButtonClick}
              disabled={disabled}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Seleccionar archivo
            </button>
            <p className="text-xs text-gray-400 mt-2">
              PDF hasta {maxSizeMB}MB
            </p>
          </div>
        )}
      </div>

      {/* Error message */}
      {error && (
        <p className="mt-2 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}

export default FileUpload;
