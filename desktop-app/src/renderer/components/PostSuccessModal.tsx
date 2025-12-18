/**
 * T025.3 - PostSuccessModal Component
 *
 * Modal dialog that displays after successfully posting an entry to ContPAQi.
 * Shows the folio number and a success message.
 *
 * Uses Tailwind CSS for styling.
 */

import React, { useEffect, useCallback } from 'react';

// =============================================================================
// Types
// =============================================================================

/**
 * Props for PostSuccessModal component
 */
export interface PostSuccessModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Folio number of the created entry */
  folio: string;
  /** Callback when user closes the modal */
  onClose: () => void;
}

// =============================================================================
// Component
// =============================================================================

/**
 * PostSuccessModal component
 *
 * Displays a success message with the folio number after an entry
 * has been successfully created in ContPAQi.
 *
 * @example
 * ```tsx
 * <PostSuccessModal
 *   isOpen={showSuccess}
 *   folio="POL-2024-0001"
 *   onClose={() => setShowSuccess(false)}
 * />
 * ```
 */
export function PostSuccessModal({
  isOpen,
  folio,
  onClose,
}: PostSuccessModalProps): JSX.Element | null {
  /**
   * Handle Escape key press
   */
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    },
    [onClose]
  );

  /**
   * Handle overlay click
   */
  const handleOverlayClick = useCallback(
    (event: React.MouseEvent) => {
      if (event.target === event.currentTarget) {
        onClose();
      }
    },
    [onClose]
  );

  /**
   * Prevent clicks on modal content from closing
   */
  const handleContentClick = useCallback((event: React.MouseEvent) => {
    event.stopPropagation();
  }, []);

  // Add escape key listener
  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen, handleKeyDown]);

  // Don't render if not open
  if (!isOpen) {
    return null;
  }

  const titleId = 'post-success-title';

  return (
    <div
      data-testid="post-success-modal"
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
        <div className="bg-green-50 px-6 py-4 border-b border-green-100">
          <div className="flex items-center gap-3">
            {/* Success Check Icon */}
            <div
              data-testid="success-icon"
              className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center"
            >
              <svg
                className="w-6 h-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2
              id={titleId}
              className="text-lg font-semibold text-green-800"
            >
              Póliza Creada Exitosamente
            </h2>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-4">
          {/* Success Message */}
          <p className="text-gray-700 mb-4">
            La póliza se ha registrado correctamente en ContPAQi.
          </p>

          {/* Folio Display */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Número de Folio:</span>
              <span className="text-lg font-semibold text-gray-900">{folio}</span>
            </div>
          </div>
        </div>

        {/* Footer - Action Button */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
          {/* Accept Button */}
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-white bg-green-500 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 transition-colors"
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
}

export default PostSuccessModal;
