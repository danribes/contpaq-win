/**
 * Invoice Repository
 *
 * Provides CRUD operations for invoices in the SQLite database.
 */

import type Database from 'better-sqlite3';
import { randomUUID } from 'crypto';

/**
 * Valid invoice states following the state machine:
 * UPLOADED → EXTRACTED → VALIDATED → POSTED
 */
export type InvoiceState = 'UPLOADED' | 'EXTRACTED' | 'VALIDATED' | 'POSTED';

/**
 * Valid source types for invoice documents
 */
export type SourceType = 'text_based' | 'scanned';

/**
 * Invoice entity representing a processed PDF invoice
 */
export interface Invoice {
  id: string;
  vendorId: string | null;
  invoiceNumber: string;
  invoiceDate: string;
  subtotal: number;
  ivaAmount: number;
  total: number;
  state: InvoiceState;
  sourceType: SourceType;
  pdfPath: string;
  duplicateHash: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Data required to create a new invoice
 */
export interface CreateInvoiceData {
  vendorId?: string;
  invoiceNumber: string;
  invoiceDate: string;
  subtotal: number;
  ivaAmount: number;
  total: number;
  state: InvoiceState;
  sourceType: SourceType;
  pdfPath: string;
  duplicateHash?: string;
}

/**
 * Data that can be updated on an invoice
 */
export interface UpdateInvoiceData {
  vendorId?: string;
  invoiceNumber?: string;
  invoiceDate?: string;
  subtotal?: number;
  ivaAmount?: number;
  total?: number;
  state?: InvoiceState;
  sourceType?: SourceType;
  pdfPath?: string;
  duplicateHash?: string;
}

/**
 * Filter options for listing invoices
 */
export interface ListInvoicesOptions {
  state?: InvoiceState;
  states?: InvoiceState[];
  limit?: number;
  offset?: number;
}

/**
 * Result of duplicate check
 */
export interface DuplicateCheckResult {
  isDuplicate: boolean;
  existingInvoice: Invoice | null;
}

/**
 * Raw database row for invoice
 */
interface InvoiceRow {
  id: string;
  vendor_id: string | null;
  invoice_number: string;
  invoice_date: string;
  subtotal: number;
  iva_amount: number;
  total: number;
  state: string;
  source_type: string;
  pdf_path: string;
  duplicate_hash: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * InvoiceRepository provides CRUD operations for invoices.
 */
export class InvoiceRepository {
  private db: Database.Database;

  /**
   * Creates a new InvoiceRepository instance.
   * @param db - The database connection
   */
  constructor(db: Database.Database) {
    this.db = db;
  }

  /**
   * Creates a new invoice in the database.
   */
  async createInvoice(data: CreateInvoiceData): Promise<Invoice> {
    const id = randomUUID();
    const now = new Date().toISOString();

    const stmt = this.db.prepare(`
      INSERT INTO invoices (
        id, vendor_id, invoice_number, invoice_date,
        subtotal, iva_amount, total, state, source_type,
        pdf_path, duplicate_hash, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      data.vendorId ?? null,
      data.invoiceNumber,
      data.invoiceDate,
      data.subtotal,
      data.ivaAmount,
      data.total,
      data.state,
      data.sourceType,
      data.pdfPath,
      data.duplicateHash ?? null,
      now,
      now
    );

    return {
      id,
      vendorId: data.vendorId ?? null,
      invoiceNumber: data.invoiceNumber,
      invoiceDate: data.invoiceDate,
      subtotal: data.subtotal,
      ivaAmount: data.ivaAmount,
      total: data.total,
      state: data.state,
      sourceType: data.sourceType,
      pdfPath: data.pdfPath,
      duplicateHash: data.duplicateHash ?? null,
      createdAt: now,
      updatedAt: now,
    };
  }

  /**
   * Gets an invoice by ID.
   */
  async getInvoiceById(id: string): Promise<Invoice | null> {
    const stmt = this.db.prepare('SELECT * FROM invoices WHERE id = ?');
    const row = stmt.get(id) as InvoiceRow | undefined;

    if (!row) {
      return null;
    }

    return this.rowToInvoice(row);
  }

  /**
   * Updates an invoice by ID.
   */
  async updateInvoice(id: string, data: UpdateInvoiceData): Promise<Invoice | null> {
    // First check if invoice exists
    const existing = await this.getInvoiceById(id);
    if (!existing) {
      return null;
    }

    // Build dynamic update query
    const updates: string[] = [];
    const values: unknown[] = [];

    if (data.vendorId !== undefined) {
      updates.push('vendor_id = ?');
      values.push(data.vendorId);
    }
    if (data.invoiceNumber !== undefined) {
      updates.push('invoice_number = ?');
      values.push(data.invoiceNumber);
    }
    if (data.invoiceDate !== undefined) {
      updates.push('invoice_date = ?');
      values.push(data.invoiceDate);
    }
    if (data.subtotal !== undefined) {
      updates.push('subtotal = ?');
      values.push(data.subtotal);
    }
    if (data.ivaAmount !== undefined) {
      updates.push('iva_amount = ?');
      values.push(data.ivaAmount);
    }
    if (data.total !== undefined) {
      updates.push('total = ?');
      values.push(data.total);
    }
    if (data.state !== undefined) {
      updates.push('state = ?');
      values.push(data.state);
    }
    if (data.sourceType !== undefined) {
      updates.push('source_type = ?');
      values.push(data.sourceType);
    }
    if (data.pdfPath !== undefined) {
      updates.push('pdf_path = ?');
      values.push(data.pdfPath);
    }
    if (data.duplicateHash !== undefined) {
      updates.push('duplicate_hash = ?');
      values.push(data.duplicateHash);
    }

    // Always update updated_at
    const now = new Date().toISOString();
    updates.push('updated_at = ?');
    values.push(now);

    // Add id for WHERE clause
    values.push(id);

    const sql = `UPDATE invoices SET ${updates.join(', ')} WHERE id = ?`;
    this.db.prepare(sql).run(...values);

    // Return updated invoice
    return this.getInvoiceById(id);
  }

  /**
   * Lists invoices with optional filtering.
   */
  async listInvoices(options: ListInvoicesOptions = {}): Promise<Invoice[]> {
    let sql = 'SELECT * FROM invoices';
    const conditions: string[] = [];
    const values: unknown[] = [];

    // Filter by single state
    if (options.state) {
      conditions.push('state = ?');
      values.push(options.state);
    }

    // Filter by multiple states
    if (options.states && options.states.length > 0) {
      const placeholders = options.states.map(() => '?').join(', ');
      conditions.push(`state IN (${placeholders})`);
      values.push(...options.states);
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }

    // Order by created_at descending (most recent first)
    sql += ' ORDER BY created_at DESC';

    // Pagination
    if (options.limit) {
      sql += ' LIMIT ?';
      values.push(options.limit);
    }

    if (options.offset) {
      sql += ' OFFSET ?';
      values.push(options.offset);
    }

    const stmt = this.db.prepare(sql);
    const rows = stmt.all(...values) as InvoiceRow[];

    return rows.map((row) => this.rowToInvoice(row));
  }

  /**
   * Checks if an invoice with the given hash already exists.
   */
  async checkDuplicate(hash: string): Promise<DuplicateCheckResult> {
    if (!hash) {
      return { isDuplicate: false, existingInvoice: null };
    }

    const stmt = this.db.prepare('SELECT * FROM invoices WHERE duplicate_hash = ?');
    const row = stmt.get(hash) as InvoiceRow | undefined;

    if (!row) {
      return { isDuplicate: false, existingInvoice: null };
    }

    return {
      isDuplicate: true,
      existingInvoice: this.rowToInvoice(row),
    };
  }

  /**
   * Deletes an invoice by ID.
   * Returns true if invoice was deleted, false if not found.
   */
  async deleteInvoice(id: string): Promise<boolean> {
    const stmt = this.db.prepare('DELETE FROM invoices WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  /**
   * Converts a database row to an Invoice object.
   */
  private rowToInvoice(row: InvoiceRow): Invoice {
    return {
      id: row.id,
      vendorId: row.vendor_id,
      invoiceNumber: row.invoice_number,
      invoiceDate: row.invoice_date,
      subtotal: row.subtotal,
      ivaAmount: row.iva_amount,
      total: row.total,
      state: row.state as InvoiceState,
      sourceType: row.source_type as SourceType,
      pdfPath: row.pdf_path,
      duplicateHash: row.duplicate_hash,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}
