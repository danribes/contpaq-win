/**
 * Vendor Repository
 *
 * Provides CRUD operations for vendors in the SQLite database.
 */

import type Database from 'better-sqlite3';
import { randomUUID } from 'crypto';

/**
 * Vendor entity representing a business that issues invoices
 */
export interface Vendor {
  id: string;
  rfc: string;
  businessName: string;
  address: string | null;
  contactInfo: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Data required to create a new vendor
 */
export interface CreateVendorData {
  rfc: string;
  businessName: string;
  address?: string;
  contactInfo?: string;
}

/**
 * Data for upserting a vendor (create or update by RFC)
 */
export interface UpsertVendorData {
  rfc: string;
  businessName: string;
  address?: string;
  contactInfo?: string;
}

/**
 * Options for listing vendors
 */
export interface ListVendorsOptions {
  search?: string;
  limit?: number;
  offset?: number;
}

/**
 * Raw database row for vendor
 */
interface VendorRow {
  id: string;
  rfc: string;
  business_name: string;
  address: string | null;
  contact_info: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * VendorRepository provides CRUD operations for vendors.
 */
export class VendorRepository {
  private db: Database.Database;

  /**
   * Creates a new VendorRepository instance.
   * @param db - The database connection
   */
  constructor(db: Database.Database) {
    this.db = db;
  }

  /**
   * Creates a new vendor in the database.
   */
  async createVendor(data: CreateVendorData): Promise<Vendor> {
    const id = randomUUID();
    const now = new Date().toISOString();

    const stmt = this.db.prepare(`
      INSERT INTO vendors (id, rfc, business_name, address, contact_info, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      data.rfc,
      data.businessName,
      data.address ?? null,
      data.contactInfo ?? null,
      now,
      now
    );

    return {
      id,
      rfc: data.rfc,
      businessName: data.businessName,
      address: data.address ?? null,
      contactInfo: data.contactInfo ?? null,
      createdAt: now,
      updatedAt: now,
    };
  }

  /**
   * Gets a vendor by RFC (Mexican tax ID).
   */
  async getVendorByRfc(rfc: string): Promise<Vendor | null> {
    const stmt = this.db.prepare('SELECT * FROM vendors WHERE rfc = ?');
    const row = stmt.get(rfc) as VendorRow | undefined;

    if (!row) {
      return null;
    }

    return this.rowToVendor(row);
  }

  /**
   * Gets a vendor by ID.
   */
  async getVendorById(id: string): Promise<Vendor | null> {
    const stmt = this.db.prepare('SELECT * FROM vendors WHERE id = ?');
    const row = stmt.get(id) as VendorRow | undefined;

    if (!row) {
      return null;
    }

    return this.rowToVendor(row);
  }

  /**
   * Creates or updates a vendor by RFC.
   * If vendor with RFC exists, updates it. Otherwise creates new.
   */
  async upsertVendor(data: UpsertVendorData): Promise<Vendor> {
    // Check if vendor exists
    const existing = await this.getVendorByRfc(data.rfc);

    if (existing) {
      // Update existing vendor
      const now = new Date().toISOString();

      // Only update fields that are provided, preserve existing for others
      const stmt = this.db.prepare(`
        UPDATE vendors
        SET business_name = ?,
            address = COALESCE(?, address),
            contact_info = COALESCE(?, contact_info),
            updated_at = ?
        WHERE rfc = ?
      `);

      stmt.run(
        data.businessName,
        data.address ?? null,
        data.contactInfo ?? null,
        now,
        data.rfc
      );

      // Return updated vendor
      return (await this.getVendorByRfc(data.rfc))!;
    } else {
      // Create new vendor
      return this.createVendor(data);
    }
  }

  /**
   * Lists all vendors with optional filtering.
   */
  async listVendors(options: ListVendorsOptions = {}): Promise<Vendor[]> {
    let sql = 'SELECT * FROM vendors';
    const values: unknown[] = [];

    // Search filter
    if (options.search) {
      sql += ' WHERE business_name LIKE ?';
      values.push(`%${options.search}%`);
    }

    // Order by business_name alphabetically
    sql += ' ORDER BY business_name ASC';

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
    const rows = stmt.all(...values) as VendorRow[];

    return rows.map((row) => this.rowToVendor(row));
  }

  /**
   * Deletes a vendor by ID.
   * Returns true if vendor was deleted, false if not found.
   */
  async deleteVendor(id: string): Promise<boolean> {
    const stmt = this.db.prepare('DELETE FROM vendors WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  /**
   * Converts a database row to a Vendor object.
   */
  private rowToVendor(row: VendorRow): Vendor {
    return {
      id: row.id,
      rfc: row.rfc,
      businessName: row.business_name,
      address: row.address,
      contactInfo: row.contact_info,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}
