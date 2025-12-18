/**
 * T025.3 - usePostToContPAQi Hook
 *
 * Custom hook that orchestrates posting invoices to ContPAQi.
 * Handles duplicate checking, vendor resolution, entry creation,
 * and provides state management for the entire flow.
 */

import { useState, useCallback, useRef } from 'react';
import {
  BridgeServiceClient,
  BridgeServiceError,
  type CreateVendorRequest,
  type EntryLineItem,
} from '../services/bridge-service';

// =============================================================================
// Types
// =============================================================================

/**
 * Status of the posting flow
 */
export type PostStatus =
  | 'idle'
  | 'checking_duplicate'
  | 'duplicate_warning'
  | 'checking_vendor'
  | 'vendor_required'
  | 'creating_vendor'
  | 'creating_entry'
  | 'success'
  | 'error';

/**
 * Input data for posting to ContPAQi
 */
export interface PostToContPAQiInput {
  vendorRfc: string;
  vendorName: string;
  invoiceNumber: string;
  invoiceDate: Date;
  subtotal: number;
  ivaAmount: number;
  total: number;
  concept?: string;
  lineItems: EntryLineItem[];
}

/**
 * Duplicate entry information
 */
export interface DuplicateInfo {
  existingFolio: string;
  existingDate: string | null;
}

/**
 * Vendor creation required information
 */
export interface VendorRequiredInfo {
  rfc: string;
  suggestedName: string;
}

/**
 * State of the posting flow
 */
export interface PostToContPAQiState {
  status: PostStatus;
  error: string | null;
  folio: string | null;
  duplicateInfo: DuplicateInfo | null;
  vendorInfo: VendorRequiredInfo | null;
}

/**
 * Return type of the hook
 */
export interface UsePostToContPAQiReturn {
  state: PostToContPAQiState;
  startPost: (input: PostToContPAQiInput) => Promise<void>;
  continueDespiteDuplicate: () => Promise<void>;
  createVendorAndContinue: (vendorData: CreateVendorRequest) => Promise<void>;
  cancel: () => void;
  reset: () => void;
}

// =============================================================================
// Initial State
// =============================================================================

const initialState: PostToContPAQiState = {
  status: 'idle',
  error: null,
  folio: null,
  duplicateInfo: null,
  vendorInfo: null,
};

// =============================================================================
// Hook
// =============================================================================

/**
 * Hook for orchestrating the post to ContPAQi flow
 *
 * @param baseUrl - Optional base URL for the bridge service (default: http://localhost:5000)
 *
 * @example
 * ```tsx
 * const { state, startPost, continueDespiteDuplicate, createVendorAndContinue, cancel, reset } = usePostToContPAQi();
 *
 * // Start posting
 * await startPost({
 *   vendorRfc: 'XAXX010101000',
 *   vendorName: 'Test Vendor',
 *   invoiceNumber: 'FAC-001',
 *   invoiceDate: new Date(),
 *   subtotal: 1000,
 *   ivaAmount: 160,
 *   total: 1160,
 *   lineItems: [...],
 * });
 *
 * // Handle duplicate warning
 * if (state.status === 'duplicate_warning') {
 *   // Show modal and call continueDespiteDuplicate() or cancel()
 * }
 *
 * // Handle vendor required
 * if (state.status === 'vendor_required') {
 *   // Show modal and call createVendorAndContinue(vendorData) or cancel()
 * }
 * ```
 */
export function usePostToContPAQi(baseUrl?: string): UsePostToContPAQiReturn {
  const [state, setState] = useState<PostToContPAQiState>(initialState);

  // Store input data for continuation after user actions
  const inputRef = useRef<PostToContPAQiInput | null>(null);
  const forceDuplicateRef = useRef<boolean>(false);

  // Create bridge client (could be injected for testing)
  const clientRef = useRef<BridgeServiceClient | null>(null);
  const getClient = useCallback(() => {
    if (!clientRef.current) {
      clientRef.current = new BridgeServiceClient(baseUrl);
    }
    return clientRef.current;
  }, [baseUrl]);

  /**
   * Update state helper
   */
  const updateState = useCallback((updates: Partial<PostToContPAQiState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  }, []);

  /**
   * Create the entry after all checks pass
   */
  const createEntry = useCallback(async (forceDuplicate: boolean) => {
    const input = inputRef.current;
    if (!input) return;

    updateState({ status: 'creating_entry' });

    try {
      const client = getClient();
      const result = await client.createEntry({
        vendorRfc: input.vendorRfc,
        invoiceNumber: input.invoiceNumber,
        invoiceDate: input.invoiceDate,
        subtotal: input.subtotal,
        ivaAmount: input.ivaAmount,
        total: input.total,
        concept: input.concept,
        lineItems: input.lineItems,
        forceDuplicate,
      });

      if (result.success && result.folio) {
        updateState({
          status: 'success',
          folio: result.folio,
          error: null,
        });
      } else {
        updateState({
          status: 'error',
          error: result.errorMessage || 'Error al crear la póliza',
        });
      }
    } catch (error) {
      const message = error instanceof BridgeServiceError
        ? error.message
        : error instanceof Error
          ? error.message
          : 'Error desconocido';

      updateState({
        status: 'error',
        error: message,
      });
    }
  }, [getClient, updateState]);

  /**
   * Check if vendor exists, create entry if it does
   */
  const checkVendorAndContinue = useCallback(async (forceDuplicate: boolean) => {
    const input = inputRef.current;
    if (!input) return;

    updateState({ status: 'checking_vendor' });

    try {
      const client = getClient();
      const vendor = await client.getVendorByRfc(input.vendorRfc);

      if (!vendor) {
        // Vendor not found - need user to create
        updateState({
          status: 'vendor_required',
          vendorInfo: {
            rfc: input.vendorRfc,
            suggestedName: input.vendorName,
          },
        });
        forceDuplicateRef.current = forceDuplicate;
        return;
      }

      // Vendor exists - proceed to create entry
      await createEntry(forceDuplicate);
    } catch (error) {
      const message = error instanceof BridgeServiceError
        ? error.message
        : error instanceof Error
          ? error.message
          : 'Error desconocido';

      updateState({
        status: 'error',
        error: message,
      });
    }
  }, [getClient, updateState, createEntry]);

  /**
   * Start the posting flow
   */
  const startPost = useCallback(async (input: PostToContPAQiInput) => {
    // Store input for later use
    inputRef.current = input;
    forceDuplicateRef.current = false;

    updateState({
      status: 'checking_duplicate',
      error: null,
      folio: null,
      duplicateInfo: null,
      vendorInfo: null,
    });

    try {
      const client = getClient();

      // Step 1: Check for duplicates
      const duplicateResult = await client.checkDuplicate({
        vendorRfc: input.vendorRfc,
        invoiceNumber: input.invoiceNumber,
        invoiceDate: input.invoiceDate,
      });

      if (duplicateResult.isDuplicate) {
        // Duplicate found - need user confirmation
        updateState({
          status: 'duplicate_warning',
          duplicateInfo: {
            existingFolio: duplicateResult.existingFolio || '',
            existingDate: duplicateResult.existingDate,
          },
        });
        return;
      }

      // No duplicate - proceed to vendor check
      await checkVendorAndContinue(false);
    } catch (error) {
      const message = error instanceof BridgeServiceError
        ? error.message
        : error instanceof Error
          ? error.message
          : 'Error desconocido';

      updateState({
        status: 'error',
        error: message,
      });
    }
  }, [getClient, updateState, checkVendorAndContinue]);

  /**
   * Continue despite duplicate warning
   */
  const continueDespiteDuplicate = useCallback(async () => {
    await checkVendorAndContinue(true);
  }, [checkVendorAndContinue]);

  /**
   * Create vendor and continue with entry creation
   */
  const createVendorAndContinue = useCallback(async (vendorData: CreateVendorRequest) => {
    updateState({ status: 'creating_vendor' });

    try {
      const client = getClient();
      await client.createVendor(vendorData);

      // Vendor created - now create entry
      await createEntry(forceDuplicateRef.current);
    } catch (error) {
      const message = error instanceof BridgeServiceError
        ? error.message
        : error instanceof Error
          ? error.message
          : 'Error desconocido';

      updateState({
        status: 'error',
        error: message,
      });
    }
  }, [getClient, updateState, createEntry]);

  /**
   * Cancel the current flow
   */
  const cancel = useCallback(() => {
    inputRef.current = null;
    forceDuplicateRef.current = false;
    setState(initialState);
  }, []);

  /**
   * Reset to initial state
   */
  const reset = useCallback(() => {
    inputRef.current = null;
    forceDuplicateRef.current = false;
    setState(initialState);
  }, []);

  return {
    state,
    startPost,
    continueDespiteDuplicate,
    createVendorAndContinue,
    cancel,
    reset,
  };
}

export default usePostToContPAQi;
