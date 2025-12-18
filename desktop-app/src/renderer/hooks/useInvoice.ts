/**
 * T017.2 - useInvoice Hook
 *
 * React hook for managing the invoice processing workflow:
 * - File selection and management
 * - Extraction via AI service
 * - Loading and error states
 * - State transitions (none → uploaded → extracting → extracted/error)
 */

import { useState, useCallback, useMemo } from 'react';
import { AIServiceClient, AIServiceError } from '../services/ai-service';
import type { InvoiceExtraction } from '../types';

// =============================================================================
// Types
// =============================================================================

/**
 * Processing state for the invoice workflow.
 */
export type ProcessingState = 'none' | 'uploaded' | 'extracting' | 'extracted' | 'error';

/**
 * Options for the useInvoice hook.
 */
export interface UseInvoiceOptions {
  /** Custom AI service URL (default: http://localhost:8000) */
  aiServiceUrl?: string;
}

/**
 * Return type of the useInvoice hook.
 */
export interface UseInvoiceReturn {
  /** Currently selected file */
  file: File | null;
  /** Extraction result from AI service */
  extraction: InvoiceExtraction | null;
  /** Current processing state */
  state: ProcessingState;
  /** Whether extraction is in progress */
  loading: boolean;
  /** Error message if extraction failed */
  error: string | null;
  /** Set the file for processing */
  setFile: (file: File) => void;
  /** Start the extraction process */
  extract: () => Promise<void>;
  /** Reset all state */
  reset: () => void;
}

// =============================================================================
// Hook Implementation
// =============================================================================

/**
 * Hook for managing invoice processing workflow.
 *
 * @example
 * ```tsx
 * function InvoiceProcessor() {
 *   const {
 *     file,
 *     extraction,
 *     state,
 *     loading,
 *     error,
 *     setFile,
 *     extract,
 *     reset
 *   } = useInvoice();
 *
 *   const handleFileSelect = (selectedFile: File) => {
 *     setFile(selectedFile);
 *   };
 *
 *   const handleExtract = async () => {
 *     await extract();
 *   };
 *
 *   return (
 *     <div>
 *       {loading && <p>Extracting...</p>}
 *       {error && <p>Error: {error}</p>}
 *       {extraction && <pre>{JSON.stringify(extraction, null, 2)}</pre>}
 *     </div>
 *   );
 * }
 * ```
 */
export function useInvoice(options: UseInvoiceOptions = {}): UseInvoiceReturn {
  const { aiServiceUrl = 'http://localhost:8000' } = options;

  // State
  const [file, setFileState] = useState<File | null>(null);
  const [extraction, setExtraction] = useState<InvoiceExtraction | null>(null);
  const [state, setState] = useState<ProcessingState>('none');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Create AI service client
  const aiClient = useMemo(
    () => new AIServiceClient(aiServiceUrl),
    [aiServiceUrl]
  );

  /**
   * Set file for processing.
   * Clears previous extraction and error.
   */
  const setFile = useCallback((newFile: File) => {
    setFileState(newFile);
    setExtraction(null);
    setError(null);
    setState('uploaded');
  }, []);

  /**
   * Start extraction process.
   * Does nothing if no file is selected or already loading.
   */
  const extract = useCallback(async () => {
    // Guard: no file selected
    if (!file) {
      return;
    }

    // Guard: already loading
    if (loading) {
      return;
    }

    setLoading(true);
    setState('extracting');
    setError(null);

    try {
      const result = await aiClient.extractInvoice(file);
      setExtraction(result);
      setState('extracted');
    } catch (err) {
      // Handle AIServiceError with detail
      if (err instanceof AIServiceError && err.detail) {
        setError(err.detail);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Unknown error occurred');
      }
      setState('error');
    } finally {
      setLoading(false);
    }
  }, [file, loading, aiClient]);

  /**
   * Reset all state to initial values.
   */
  const reset = useCallback(() => {
    setFileState(null);
    setExtraction(null);
    setState('none');
    setLoading(false);
    setError(null);
  }, []);

  return {
    file,
    extraction,
    state,
    loading,
    error,
    setFile,
    extract,
    reset,
  };
}

export default useInvoice;
