/**
 * T025.2 - CreateVendorModal Component
 *
 * Modal dialog that displays when a vendor RFC is not found in ContPAQi
 * during the posting flow. Allows user to create a new vendor with the
 * RFC and name from the invoice.
 *
 * Uses Tailwind CSS for styling.
 */

import React, { useState, useEffect, useCallback } from 'react';

// =============================================================================
// Types
// =============================================================================

/**
 * Data for creating a new vendor
 */
export interface CreateVendorData {
  rfc: string;
  name: string;
  commercialName?: string;
}

/**
 * Props for CreateVendorModal component
 */
export interface CreateVendorModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** The RFC that was not found */
  rfc: string;
  /** Suggested name from invoice extraction */
  suggestedName?: string;
  /** Whether an action is in progress */
  isLoading?: boolean;
  /** Error message to display */
  error?: string;
  /** Callback when user submits the form */
  onSubmit: (data: CreateVendorData) => void;
  /** Callback when user cancels */
  onCancel: () => void;
}

// =============================================================================
// Component
// =============================================================================

/**
 * CreateVendorModal component
 *
 * Displays when a vendor RFC is not found in ContPAQi, allowing the user
 * to create a new vendor with the provided RFC.
 *
 * @example
 * ```tsx
 * <CreateVendorModal
 *   isOpen={showCreateVendor}
 *   rfc="XAXX010101000"
 *   suggestedName="Empresa Ejemplo SA de CV"
 *   onSubmit={(data) => handleCreateVendor(data)}
 *   onCancel={() => setShowCreateVendor(false)}
 * />
 * ```
 */
export function CreateVendorModal({
  isOpen,
  rfc,
  suggestedName = '',
  isLoading = false,
  error,
  onSubmit,
  onCancel,
}: CreateVendorModalProps): JSX.Element | null {
  // Form state
  const [name, setName] = useState(suggestedName);
  const [commercialName, setCommercialName] = useState('');

  // Reset form when modal opens with new data
  useEffect(() => {
    if (isOpen) {
      setName(suggestedName);
      setCommercialName('');
    }
  }, [isOpen, suggestedName]);

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
   * Handle form submission
   */
  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (name.trim()) {
        onSubmit({
          rfc,
          name: name.trim(),
          commercialName: commercialName.trim() || undefined,
        });
      }
    },
    [rfc, name, commercialName, onSubmit]
  );

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

  const titleId = 'create-vendor-title';
  const isNameValid = name.trim().length > 0;

  return (
    <div
      data-testid="create-vendor-modal"
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
        <div className="bg-blue-50 px-6 py-4 border-b border-blue-100">
          <div className="flex items-center gap-3">
            {/* User Plus Icon */}
            <div
              data-testid="vendor-icon"
              className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center"
            >
              <svg
                className="w-6 h-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                />
              </svg>
            </div>
            <h2
              id={titleId}
              className="text-lg font-semibold text-blue-800"
            >
              Crear Nuevo Proveedor
            </h2>
          </div>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit}>
          <div className="px-6 py-4">
            {/* Explanation Message */}
            <p className="text-gray-700 mb-4">
              El RFC <span className="font-medium">{rfc}</span> no se encontró en ContPAQi.
              Complete los datos para crear el proveedor.
            </p>

            {/* RFC Display (read-only) */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                RFC:
              </label>
              <div
                data-testid="rfc-display"
                className="bg-gray-100 px-3 py-2 rounded-md text-gray-900 font-mono"
              >
                {rfc}
              </div>
            </div>

            {/* Vendor Name Input */}
            <div className="mb-4">
              <label
                htmlFor="vendor-name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Nombre del Proveedor <span className="text-red-500">*</span>
              </label>
              <input
                id="vendor-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isLoading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="Razón social del proveedor"
              />
            </div>

            {/* Commercial Name Input (optional) */}
            <div className="mb-4">
              <label
                htmlFor="commercial-name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Nombre Comercial <span className="text-gray-400 text-xs">(opcional)</span>
              </label>
              <input
                id="commercial-name"
                type="text"
                value={commercialName}
                onChange={(e) => setCommercialName(e.target.value)}
                disabled={isLoading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="Nombre comercial o marca"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div
                data-testid="error-message"
                className="text-red-600 text-sm bg-red-50 px-3 py-2 rounded-md"
              >
                {error}
              </div>
            )}
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

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !isNameValid}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
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
              Crear Proveedor
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateVendorModal;
