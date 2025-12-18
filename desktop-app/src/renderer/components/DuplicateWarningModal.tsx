/**
 * T025.1 - DuplicateWarningModal Component
 *
 * Modal dialog that displays when a duplicate entry is detected before
 * posting to ContPAQi. Shows existing entry details and allows user to
 * either cancel or proceed with creating a duplicate.
 *
 * Uses Tailwind CSS for styling.
 */

import { useEffect, useCallback } from 'react';

// =============================================================================
// Types
// =============================================================================

/**
 * Props for DuplicateWarningModal component
 */
export interface DuplicateWarningModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Folio number of existing entry */
  existingFolio: string;
  /** Date of existing entry (ISO format) */
  existingDate: string | null;
  /** RFC of the vendor */
  vendorRfc: string;
  /** Invoice number that is duplicated */
  invoiceNumber: string;
  /** Whether an action is in progress */
  isLoading?: boolean;
  /** Callback when user chooses to continue (forceDuplicate: boolean) */
  onContinue: (forceDuplicate: boolean) => void;
  /** Callback when user cancels */
  onCancel: () => void;
}

// =============================================================================
// Component
// =============================================================================

/**
 * DuplicateWarningModal component
 *
 * Displays a warning when attempting to create an entry that already exists.
 * User can choose to proceed (creating a duplicate) or cancel.
 *
 * @example
 * ```tsx
 * <DuplicateWarningModal
 *   isOpen={showDuplicateWarning}
 *   existingFolio="POL-2024-0001"
 *   existingDate="2024-12-08"
 *   vendorRfc="XAXX010101000"
 *   invoiceNumber="FAC-001"
 *   onContinue={(force) => handleContinue(force)}
 *   onCancel={() => setShowDuplicateWarning(false)}
 * />
 * ```
 */
export function DuplicateWarningModal({
  isOpen,
  existingFolio,
  existingDate,
  vendorRfc,
  invoiceNumber,
  isLoading = false,
  onContinue,
  onCancel,
}: DuplicateWarningModalProps): JSX.Element | null {
  /**
   * Handle Escape key press
   */
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isLoading) {
        onCancel();
      }
    },
    [onCancel, isLoading]
  );

  /**
   * Handle continue button click
   */
  const handleContinue = useCallback(() => {
    onContinue(true);
  }, [onContinue]);

  /**
   * Handle overlay click
   */
  const handleOverlayClick = useCallback(
    (event: React.MouseEvent) => {
      if (event.target === event.currentTarget && !isLoading) {
        onCancel();
      }
    },
    [onCancel, isLoading]
  );

  /**
   * Prevent clicks on modal content from closing
   */
  const handleContentClick = useCallback((event: React.MouseEvent) => {
    event.stopPropagation();
  }, []);

  // Add escape key listener
  useEffect(() => {
    if (!isOpen) return;
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  // Don't render if not open
  if (!isOpen) {
    return null;
  }

  const titleId = 'duplicate-warning-title';

  return (
    <div
      data-testid="duplicate-warning-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      className="fixed inset-0 z-50 flex items-center justify-center"
    >
      {/* Overlay */}
      <div
        data-testid="modal-overlay"
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={handleOverlayClick}
      />

      {/* Modal Content */}
      <div
        data-testid="modal-content"
        className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 overflow-hidden"
        onClick={handleContentClick}
      >
        {/* Header */}
        <div className="bg-orange-50 px-6 py-4 border-b border-orange-100">
          <div className="flex items-center gap-3">
            {/* Warning Icon */}
            <div
              data-testid="warning-icon"
              className="flex-shrink-0 w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center"
            >
              <svg
                className="w-6 h-6 text-orange-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h2
              id={titleId}
              className="text-lg font-semibold text-orange-800"
            >
              Póliza Duplicada Detectada
            </h2>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-4">
          {/* Warning Message */}
          <p className="text-gray-700 mb-4">
            Ya existe una póliza registrada con los mismos datos. ¿Desea crear una nueva póliza de todas formas?
          </p>

          {/* Existing Entry Details */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            {/* Folio */}
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Folio existente:</span>
              <span className="text-sm font-medium text-gray-900">{existingFolio}</span>
            </div>

            {/* Date */}
            {existingDate && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Fecha de registro:</span>
                <span className="text-sm font-medium text-gray-900">{existingDate}</span>
              </div>
            )}

            {/* Vendor RFC */}
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">RFC Proveedor:</span>
              <span className="text-sm font-medium text-gray-900">{vendorRfc}</span>
            </div>

            {/* Invoice Number */}
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">No. Factura:</span>
              <span className="text-sm font-medium text-gray-900">{invoiceNumber}</span>
            </div>
          </div>
        </div>

        {/* Footer - Action Buttons */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
          {/* Cancel Button */}
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Cancelar
          </button>

          {/* Continue Button */}
          <button
            type="button"
            onClick={handleContinue}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-white bg-orange-500 rounded-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {isLoading && (
              <svg
                data-testid="loading-spinner"
                className="animate-spin h-4 w-4 text-white"
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
            )}
            Continuar
          </button>
        </div>
      </div>
    </div>
  );
}

export default DuplicateWarningModal;
