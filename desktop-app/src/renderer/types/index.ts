/**
 * ContPAQ Win - TypeScript Type Definitions
 *
 * This file contains all TypeScript interfaces and types used
 * throughout the desktop application renderer process.
 */

// =============================================================================
// Enums and Type Aliases
// =============================================================================

/**
 * Invoice processing state.
 * Follows the workflow: UPLOADED → EXTRACTED → VALIDATED → POSTED
 */
export type InvoiceState = 'UPLOADED' | 'EXTRACTED' | 'VALIDATED' | 'POSTED';

/**
 * Source type of the PDF document.
 * - text_based: PDF with embedded text (can be extracted directly)
 * - scanned: PDF is an image that requires OCR
 */
export type SourceType = 'text_based' | 'scanned';

/**
 * Status of posting to ContPAQi system.
 */
export type PostingStatus = 'pending' | 'success' | 'failed';

/**
 * Service health status for AI and Bridge services.
 */
export type ServiceStatus = 'stopped' | 'starting' | 'running' | 'stopping' | 'error';

// =============================================================================
// Geometry Types
// =============================================================================

/**
 * Bounding box coordinates for extracted field locations.
 * Used for highlighting fields in the PDF viewer.
 */
export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

// =============================================================================
// Extraction Types
// =============================================================================

/**
 * Result of AI extraction for a single field.
 * Includes confidence score and optional bounding box for visualization.
 */
export interface ExtractionField {
  fieldName: string;
  value: string;
  confidence: number; // 0-100
  bbox?: BoundingBox;
  userVerified: boolean;
}

/**
 * Extraction result for a line item.
 */
export interface LineItemExtraction {
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  confidence: number; // 0-100
}

/**
 * Complete invoice extraction response from AI service.
 */
export interface InvoiceExtraction {
  vendorRfc: ExtractionField;
  vendorName: ExtractionField;
  invoiceNumber: ExtractionField;
  invoiceDate: ExtractionField;
  subtotal: ExtractionField;
  ivaAmount: ExtractionField;
  total: ExtractionField;
  lineItems: LineItemExtraction[];
  sourceType: SourceType;
  processingTimeMs: number;
}

// =============================================================================
// Entity Types
// =============================================================================

/**
 * Line item from an invoice.
 */
export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  lineOrder: number;
}

/**
 * Vendor (supplier) information.
 * Corresponds to a provider in ContPAQi.
 */
export interface Vendor {
  id: string;
  rfc: string;
  businessName: string;
  address?: string;
  contactInfo?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Invoice entity with all related data.
 */
export interface Invoice {
  id: string;
  vendor?: Vendor;
  vendorId?: string;
  invoiceNumber: string;
  invoiceDate: string; // ISO date format
  subtotal: number;
  ivaAmount: number;
  total: number;
  state: InvoiceState;
  sourceType: SourceType;
  pdfPath: string;
  duplicateHash?: string;
  lineItems: LineItem[];
  extractionResults: ExtractionField[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Record of posting to ContPAQi system.
 */
export interface ContPAQiEntry {
  id: string;
  invoiceId: string;
  folioNumber?: string;
  entryDate: string;
  postingStatus: PostingStatus;
  errorMessage?: string;
  createdAt: string;
}

// =============================================================================
// Service Types
// =============================================================================

/**
 * Health check response from a service.
 */
export interface ServiceHealth {
  status: ServiceStatus;
  healthy: boolean;
  message?: string;
  version?: string;
  timestamp: string;
}

/**
 * Combined status of all backend services.
 */
export interface ServicesStatus {
  aiService: ServiceHealth;
  bridgeService: ServiceHealth;
}

// =============================================================================
// API Response Types
// =============================================================================

/**
 * Generic API response wrapper.
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Paginated list response.
 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Invoice filter options for listing.
 */
export interface InvoiceFilters {
  state?: InvoiceState;
  vendorId?: string;
  startDate?: string;
  endDate?: string;
  searchQuery?: string;
}

// =============================================================================
// Electron IPC Types
// =============================================================================

/**
 * ElectronAPI interface exposed via preload script.
 * Provides type-safe access to IPC communication.
 */
export interface ElectronAPI {
  /**
   * Invoke an IPC handler and wait for response.
   */
  invoke: (channel: string, ...args: unknown[]) => Promise<unknown>;

  /**
   * Send a one-way message (fire and forget).
   */
  send: (channel: string, ...args: unknown[]) => void;

  /**
   * Subscribe to messages from main process.
   */
  on: (channel: string, callback: (...args: unknown[]) => void) => void;

  /**
   * Remove a specific listener.
   */
  removeListener: (channel: string, callback: (...args: unknown[]) => void) => void;

  /**
   * Remove all listeners for a channel.
   */
  removeAllListeners: (channel: string) => void;
}

// =============================================================================
// Window Type Augmentation
// =============================================================================

/**
 * Extend the global Window interface to include electronAPI.
 */
declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

// =============================================================================
// Component Prop Types
// =============================================================================

/**
 * Props for confidence indicator component.
 */
export interface ConfidenceIndicatorProps {
  confidence: number;
  showPercentage?: boolean;
}

/**
 * Confidence level thresholds.
 */
export const CONFIDENCE_THRESHOLDS = {
  HIGH: 90,
  MEDIUM: 70,
} as const;

/**
 * Get confidence level based on value.
 */
export type ConfidenceLevel = 'high' | 'medium' | 'low';

export function getConfidenceLevel(confidence: number): ConfidenceLevel {
  if (confidence >= CONFIDENCE_THRESHOLDS.HIGH) return 'high';
  if (confidence >= CONFIDENCE_THRESHOLDS.MEDIUM) return 'medium';
  return 'low';
}
