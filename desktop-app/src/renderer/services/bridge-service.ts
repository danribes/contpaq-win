/**
 * T024.1 - Bridge Service Client
 *
 * HTTP client for communicating with the ContPAQ-Win Windows Bridge.
 * Handles duplicate checking, entry creation, vendor operations, and error handling.
 */

import type { ServiceHealth, ServiceStatus } from '../types';

// =============================================================================
// Types
// =============================================================================

/**
 * Configuration options for BridgeServiceClient.
 */
export interface BridgeServiceClientOptions {
  /** Request timeout in milliseconds (default: 30000) */
  timeout?: number;
}

/**
 * Request to check for duplicate entries.
 */
export interface DuplicateCheckRequest {
  vendorRfc: string;
  invoiceNumber: string;
  invoiceDate: Date;
}

/**
 * Result of duplicate check operation.
 */
export interface DuplicateCheckResult {
  isDuplicate: boolean;
  existingFolio: string | null;
  existingDate: string | null;
  message: string | null;
}

/**
 * Request to create a new entry.
 */
export interface CreateEntryRequest {
  vendorRfc: string;
  invoiceNumber: string;
  invoiceDate: Date;
  subtotal: number;
  ivaAmount: number;
  total: number;
  concept?: string;
  lineItems: EntryLineItem[];
  forceDuplicate: boolean;
}

/**
 * Line item for entry creation.
 */
export interface EntryLineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

/**
 * Result of entry creation.
 */
export interface EntryResult {
  success: boolean;
  folio?: string;
  errorMessage?: string;
  timestamp?: string;
}

/**
 * Request to create a new vendor.
 */
export interface CreateVendorRequest {
  rfc: string;
  name: string;
  commercialName?: string;
}

/**
 * Vendor data from the bridge.
 */
export interface VendorResult {
  code: string;
  rfc: string;
  name: string;
  commercialName?: string;
}

// =============================================================================
// API Response Types (from Windows Bridge)
// =============================================================================

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

interface ApiDuplicateCheckResult {
  isDuplicate: boolean;
  existingFolio: string | null;
  existingDate: string | null;
  message: string | null;
}

interface ApiEntryResult {
  success: boolean;
  folio?: string;
  errorMessage?: string;
  timestamp?: string;
}

interface ApiVendorResult {
  code: string;
  rfc: string;
  name: string;
  commercialName?: string;
}

// =============================================================================
// Errors
// =============================================================================

/**
 * Custom error for Bridge service failures.
 */
export class BridgeServiceError extends Error {
  public readonly statusCode?: number;
  public readonly detail?: string;

  constructor(message: string, statusCode?: number, detail?: string) {
    super(message);
    this.name = 'BridgeServiceError';
    this.statusCode = statusCode;
    this.detail = detail;
  }
}

// =============================================================================
// Bridge Service Client
// =============================================================================

/**
 * HTTP client for the ContPAQ-Win Windows Bridge.
 *
 * @example
 * ```typescript
 * const client = new BridgeServiceClient('http://localhost:5000');
 *
 * // Check for duplicate entry
 * const duplicate = await client.checkDuplicate({
 *   vendorRfc: 'XAXX010101000',
 *   invoiceNumber: 'FAC-001',
 *   invoiceDate: new Date(),
 * });
 *
 * // Create entry if no duplicate
 * if (!duplicate.isDuplicate) {
 *   const result = await client.createEntry({ ... });
 * }
 * ```
 */
export class BridgeServiceClient {
  private readonly baseUrl: string;
  private readonly timeout: number;

  constructor(baseUrl: string = 'http://localhost:5000', options: BridgeServiceClientOptions = {}) {
    this.baseUrl = baseUrl.replace(/\/$/, ''); // Remove trailing slash
    this.timeout = options.timeout ?? 30000;
  }

  // ===========================================================================
  // T024.1.3 - checkDuplicate() Method
  // ===========================================================================

  /**
   * Check if a duplicate entry exists for the given invoice.
   *
   * @param request - Duplicate check request data
   * @returns Duplicate check result
   * @throws BridgeServiceError on failure
   */
  async checkDuplicate(request: DuplicateCheckRequest): Promise<DuplicateCheckResult> {
    const body = {
      vendorRfc: request.vendorRfc,
      invoiceNumber: request.invoiceNumber,
      invoiceDate: request.invoiceDate.toISOString().split('T')[0],
    };

    const response = await this.fetchJson<ApiResponse<ApiDuplicateCheckResult>>(
      `${this.baseUrl}/api/entries/check-duplicate`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }
    );

    return {
      isDuplicate: response.data?.isDuplicate ?? false,
      existingFolio: response.data?.existingFolio ?? null,
      existingDate: response.data?.existingDate ?? null,
      message: response.data?.message ?? null,
    };
  }

  // ===========================================================================
  // T024.1.4 - createEntry() Method
  // ===========================================================================

  /**
   * Create a new accounting entry in ContPAQi.
   *
   * @param request - Entry data to create
   * @returns Entry creation result with folio
   * @throws BridgeServiceError on failure
   */
  async createEntry(request: CreateEntryRequest): Promise<EntryResult> {
    const body = {
      vendorRfc: request.vendorRfc,
      invoiceNumber: request.invoiceNumber,
      invoiceDate: request.invoiceDate.toISOString().split('T')[0],
      subtotal: request.subtotal,
      ivaAmount: request.ivaAmount,
      total: request.total,
      concept: request.concept,
      lineItems: request.lineItems.map(item => ({
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        amount: item.amount,
      })),
      forceDuplicate: request.forceDuplicate,
    };

    const response = await this.fetchJson<ApiResponse<ApiEntryResult>>(
      `${this.baseUrl}/api/entries`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }
    );

    return {
      success: response.data?.success ?? false,
      folio: response.data?.folio,
      errorMessage: response.data?.errorMessage,
      timestamp: response.data?.timestamp,
    };
  }

  // ===========================================================================
  // T024.1.5 - getVendorByRfc() Method
  // ===========================================================================

  /**
   * Get a vendor by RFC (tax ID).
   *
   * @param rfc - The RFC to search for
   * @returns Vendor data or null if not found
   * @throws BridgeServiceError on error (except 404)
   */
  async getVendorByRfc(rfc: string): Promise<VendorResult | null> {
    try {
      const response = await this.fetchJson<ApiResponse<ApiVendorResult>>(
        `${this.baseUrl}/api/vendors/${encodeURIComponent(rfc)}`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        }
      );

      if (!response.data) {
        return null;
      }

      return {
        code: response.data.code,
        rfc: response.data.rfc,
        name: response.data.name,
        commercialName: response.data.commercialName,
      };
    } catch (error) {
      // Return null for 404 (not found)
      if (error instanceof BridgeServiceError && error.statusCode === 404) {
        return null;
      }
      throw error;
    }
  }

  // ===========================================================================
  // T024.1.6 - createVendor() Method
  // ===========================================================================

  /**
   * Create a new vendor in ContPAQi.
   *
   * @param request - Vendor data to create
   * @returns Created vendor with assigned code
   * @throws BridgeServiceError on failure
   */
  async createVendor(request: CreateVendorRequest): Promise<VendorResult> {
    const body = {
      rfc: request.rfc,
      name: request.name,
      commercialName: request.commercialName,
    };

    const response = await this.fetchJson<ApiResponse<ApiVendorResult>>(
      `${this.baseUrl}/api/vendors`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }
    );

    if (!response.data) {
      throw new BridgeServiceError('No data returned from vendor creation');
    }

    return {
      code: response.data.code,
      rfc: response.data.rfc,
      name: response.data.name,
      commercialName: response.data.commercialName,
    };
  }

  // ===========================================================================
  // Health Check
  // ===========================================================================

  /**
   * Check the health status of the Bridge service.
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
        message: error instanceof Error ? error.message : 'Error desconocido',
        timestamp: new Date().toISOString(),
      };
    }
  }

  // ===========================================================================
  // T024.1.7 - Error Handling
  // ===========================================================================

  /**
   * Fetch JSON with error handling.
   */
  private async fetchJson<T>(url: string, options: RequestInit): Promise<T> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const errorMessage = data.message || `Error del servidor (${response.status})`;
        throw new BridgeServiceError(errorMessage, response.status, data.message);
      }

      return data as T;
    } catch (error) {
      // Re-throw BridgeServiceError as-is
      if (error instanceof BridgeServiceError) {
        throw error;
      }

      // Handle abort (timeout)
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new BridgeServiceError(
          'La solicitud excedió el tiempo de espera',
          undefined,
          'Timeout'
        );
      }

      // Handle network errors
      if (error instanceof TypeError) {
        throw new BridgeServiceError(
          'No se pudo conectar con el servicio de Windows Bridge',
          undefined,
          error.message
        );
      }

      // Handle other errors
      throw new BridgeServiceError(
        error instanceof Error ? error.message : 'Error desconocido',
        undefined,
        error instanceof Error ? error.message : undefined
      );
    }
  }
}
