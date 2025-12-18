/**
 * T015.1 - AI Service API Client
 *
 * HTTP client for communicating with the ContPAQ-Win AI Service.
 * Handles invoice extraction, health checks, and error handling with retry logic.
 */

import type {
  InvoiceExtraction,
  ExtractionField,
  LineItemExtraction,
  ServiceHealth,
  ServiceStatus,
  SourceType,
  BoundingBox,
} from '../types';

// =============================================================================
// Types
// =============================================================================

/**
 * Configuration options for AIServiceClient.
 */
export interface AIServiceClientOptions {
  /** Request timeout in milliseconds (default: 60000) */
  timeout?: number;
  /** Maximum retry attempts for network errors (default: 3) */
  maxRetries?: number;
}

/**
 * Batch extraction response from the API.
 */
export interface BatchExtractionResponse {
  results: BatchResultItem[];
  totalFiles: number;
  successful: number;
  failed: number;
  totalProcessingTimeMs: number;
}

/**
 * Individual result item in batch extraction response.
 */
export interface BatchResultItem {
  filename: string;
  success: boolean;
  extraction?: InvoiceExtraction;
  error?: string;
}

// =============================================================================
// API Response Types (snake_case from Python API)
// =============================================================================

interface ApiExtractionField {
  field_name: string;
  value: string;
  confidence: number;
  user_verified: boolean;
  bbox?: BoundingBox;
}

interface ApiLineItem {
  description: string;
  quantity: number;
  unit_price: number;
  amount: number;
  confidence: number;
}

interface ApiExtractionResponse {
  source_file: string;
  source_type: string;
  vendor_rfc?: ApiExtractionField | null;
  vendor_name?: ApiExtractionField | null;
  invoice_number?: ApiExtractionField | null;
  invoice_date?: ApiExtractionField | null;
  subtotal?: ApiExtractionField | null;
  iva_amount?: ApiExtractionField | null;
  total?: ApiExtractionField | null;
  line_items: ApiLineItem[];
  processing_time_ms: number;
}

interface ApiBatchResultItem {
  filename: string;
  success: boolean;
  extraction?: ApiExtractionResponse;
  error?: string;
}

interface ApiBatchResponse {
  results: ApiBatchResultItem[];
  total_files: number;
  successful: number;
  failed: number;
  total_processing_time_ms: number;
}

// =============================================================================
// Errors
// =============================================================================

/**
 * Custom error for AI service failures.
 */
export class AIServiceError extends Error {
  public readonly statusCode?: number;
  public readonly detail?: string;

  constructor(message: string, statusCode?: number, detail?: string) {
    super(message);
    this.name = 'AIServiceError';
    this.statusCode = statusCode;
    this.detail = detail;
  }
}

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Convert API extraction field to TypeScript type.
 * Converts confidence from decimal (0-1) to percentage (0-100).
 */
function convertExtractionField(field: ApiExtractionField | null | undefined): ExtractionField | undefined {
  if (!field) return undefined;

  return {
    fieldName: field.field_name,
    value: field.value,
    confidence: Math.round(field.confidence * 100),
    userVerified: field.user_verified,
    bbox: field.bbox,
  };
}

/**
 * Convert API line item to TypeScript type.
 */
function convertLineItem(item: ApiLineItem): LineItemExtraction {
  return {
    description: item.description,
    quantity: item.quantity,
    unitPrice: item.unit_price,
    amount: item.amount,
    confidence: Math.round(item.confidence * 100),
  };
}

/**
 * Convert API extraction response to TypeScript InvoiceExtraction type.
 */
function convertExtractionResponse(response: ApiExtractionResponse): InvoiceExtraction {
  return {
    vendorRfc: convertExtractionField(response.vendor_rfc) ?? createEmptyField('vendor_rfc'),
    vendorName: convertExtractionField(response.vendor_name) ?? createEmptyField('vendor_name'),
    invoiceNumber: convertExtractionField(response.invoice_number) ?? createEmptyField('invoice_number'),
    invoiceDate: convertExtractionField(response.invoice_date) ?? createEmptyField('invoice_date'),
    subtotal: convertExtractionField(response.subtotal) ?? createEmptyField('subtotal'),
    ivaAmount: convertExtractionField(response.iva_amount) ?? createEmptyField('iva_amount'),
    total: convertExtractionField(response.total) ?? createEmptyField('total'),
    lineItems: response.line_items?.map(convertLineItem) ?? [],
    sourceType: response.source_type as SourceType,
    processingTimeMs: response.processing_time_ms,
  };
}

/**
 * Create an empty extraction field for missing data.
 */
function createEmptyField(fieldName: string): ExtractionField {
  return {
    fieldName,
    value: '',
    confidence: 0,
    userVerified: false,
  };
}

/**
 * Delay helper for retry logic.
 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Check if error is retriable (network errors, 5xx status codes).
 */
function isRetriable(error: unknown, statusCode?: number): boolean {
  // Network errors are retriable
  if (error instanceof TypeError) return true;
  if (error instanceof Error && error.name === 'AbortError') return false;

  // 5xx errors are retriable
  if (statusCode && statusCode >= 500) return true;

  // 4xx errors are not retriable
  if (statusCode && statusCode >= 400 && statusCode < 500) return false;

  return true;
}

// =============================================================================
// AI Service Client
// =============================================================================

/**
 * HTTP client for the ContPAQ-Win AI Service.
 *
 * @example
 * ```typescript
 * const client = new AIServiceClient('http://localhost:8000');
 *
 * // Extract invoice data from PDF
 * const result = await client.extractInvoice(pdfFile);
 *
 * // Check service health
 * const health = await client.checkHealth();
 * ```
 */
export class AIServiceClient {
  private readonly baseUrl: string;
  private readonly timeout: number;
  private readonly maxRetries: number;

  constructor(baseUrl: string = 'http://localhost:8000', options: AIServiceClientOptions = {}) {
    this.baseUrl = baseUrl.replace(/\/$/, ''); // Remove trailing slash
    this.timeout = options.timeout ?? 60000;
    this.maxRetries = options.maxRetries ?? 3;
  }

  /**
   * Extract invoice data from a PDF file.
   *
   * @param file - PDF file to extract data from
   * @returns Extracted invoice data
   * @throws AIServiceError on failure
   */
  async extractInvoice(file: File): Promise<InvoiceExtraction> {
    const formData = new FormData();
    formData.append('file', file, file.name);

    const response = await this.fetchWithRetry(`${this.baseUrl}/extract`, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json() as ApiExtractionResponse;
    return convertExtractionResponse(data);
  }

  /**
   * Extract invoice data from multiple PDF files.
   *
   * @param files - Array of PDF files to extract data from
   * @returns Batch extraction results
   * @throws AIServiceError on failure
   */
  async extractBatch(files: File[]): Promise<BatchExtractionResponse> {
    const formData = new FormData();
    for (const file of files) {
      formData.append('files', file, file.name);
    }

    const response = await this.fetchWithRetry(`${this.baseUrl}/extract/batch`, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json() as ApiBatchResponse;

    return {
      results: data.results.map(item => ({
        filename: item.filename,
        success: item.success,
        extraction: item.extraction ? convertExtractionResponse(item.extraction) : undefined,
        error: item.error,
      })),
      totalFiles: data.total_files,
      successful: data.successful,
      failed: data.failed,
      totalProcessingTimeMs: data.total_processing_time_ms,
    };
  }

  /**
   * Check the health status of the AI service.
   *
   * @returns Service health information
   */
  async checkHealth(): Promise<ServiceHealth> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        return {
          status: 'error',
          healthy: false,
          message: `Service returned ${response.status}`,
          timestamp: new Date().toISOString(),
        };
      }

      const data = await response.json();
      return {
        status: data.status as ServiceStatus,
        healthy: data.healthy ?? true,
        message: data.message,
        version: data.version,
        timestamp: data.timestamp ?? new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: 'stopped',
        healthy: false,
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Fetch with retry logic for transient failures.
   */
  private async fetchWithRetry(url: string, options: RequestInit): Promise<Response> {
    let lastError: Error | undefined;
    let lastStatusCode: number | undefined;

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        const response = await fetch(url, {
          ...options,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          return response;
        }

        lastStatusCode = response.status;

        // Check if we should retry
        if (!isRetriable(null, response.status)) {
          const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
          throw new AIServiceError(
            errorData.detail || `Request failed with status ${response.status}`,
            response.status,
            errorData.detail
          );
        }

        // Retry on 5xx errors
        if (attempt < this.maxRetries) {
          await delay(Math.pow(2, attempt) * 100); // Exponential backoff: 200ms, 400ms, 800ms
          continue;
        }

        // Max retries exceeded
        const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
        throw new AIServiceError(
          errorData.detail || `Request failed with status ${response.status}`,
          response.status,
          errorData.detail
        );
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        // Don't retry on AIServiceError (already handled above)
        if (error instanceof AIServiceError) {
          throw error;
        }

        // Don't retry on abort (timeout)
        if (error instanceof DOMException && error.name === 'AbortError') {
          throw new AIServiceError('Request timed out', undefined, 'Request timed out');
        }

        // Check if error is retriable
        if (!isRetriable(error, lastStatusCode) || attempt >= this.maxRetries) {
          throw new AIServiceError(
            lastError.message,
            lastStatusCode,
            lastError.message
          );
        }

        // Wait before retry with exponential backoff
        await delay(Math.pow(2, attempt) * 100);
      }
    }

    // Should not reach here, but just in case
    throw new AIServiceError(
      lastError?.message || 'Request failed after max retries',
      lastStatusCode
    );
  }
}
