/**
 * T009.1.1 Database Service Tests
 *
 * Tests for SQLite database initialization, connection management,
 * and migration execution in the desktop app main process.
 */

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

// Import will be created in T009.1.2
// eslint-disable-next-line @typescript-eslint/no-unused-vars
let DatabaseService: typeof import('../../src/main/database').DatabaseService;

describe('T009.1 - Database Service', () => {
  let testDbPath: string;
  let tempDir: string;

  beforeAll(() => {
    // Create a unique temp directory for tests
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'contpaq-test-'));
  });

  afterAll(() => {
    // Clean up temp directory
    if (tempDir && fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  beforeEach(async () => {
    // Lazy load to allow tests to fail gracefully before implementation
    try {
      const module = await import('../../src/main/database');
      DatabaseService = module.DatabaseService;
    } catch {
      // Module doesn't exist yet - tests will fail as expected in TDD
    }
    testDbPath = path.join(tempDir, `test-${Date.now()}.db`);
  });

  // ==========================================================================
  // T009.1.1 - Database Initialization Tests
  // ==========================================================================

  describe('T009.1.1 - Class Structure', () => {
    it('should export DatabaseService class', async () => {
      const module = await import('../../src/main/database');
      expect(module.DatabaseService).toBeDefined();
      expect(typeof module.DatabaseService).toBe('function');
    });

    it('should create instance with database path', async () => {
      const module = await import('../../src/main/database');
      const db = new module.DatabaseService(testDbPath);
      expect(db).toBeInstanceOf(module.DatabaseService);
    });

    it('should have initialize method', async () => {
      const module = await import('../../src/main/database');
      const db = new module.DatabaseService(testDbPath);
      expect(typeof db.initialize).toBe('function');
    });

    it('should have close method', async () => {
      const module = await import('../../src/main/database');
      const db = new module.DatabaseService(testDbPath);
      expect(typeof db.close).toBe('function');
    });

    it('should have isInitialized method', async () => {
      const module = await import('../../src/main/database');
      const db = new module.DatabaseService(testDbPath);
      expect(typeof db.isInitialized).toBe('function');
    });

    it('should have getConnection method', async () => {
      const module = await import('../../src/main/database');
      const db = new module.DatabaseService(testDbPath);
      expect(typeof db.getConnection).toBe('function');
    });
  });

  describe('T009.1.1 - Database Lifecycle', () => {
    it('should not be initialized before calling initialize()', async () => {
      const module = await import('../../src/main/database');
      const db = new module.DatabaseService(testDbPath);
      expect(db.isInitialized()).toBe(false);
    });

    it('should create database file on initialize', async () => {
      const module = await import('../../src/main/database');
      const db = new module.DatabaseService(testDbPath);

      expect(fs.existsSync(testDbPath)).toBe(false);
      await db.initialize();
      expect(fs.existsSync(testDbPath)).toBe(true);

      await db.close();
    });

    it('should be initialized after calling initialize()', async () => {
      const module = await import('../../src/main/database');
      const db = new module.DatabaseService(testDbPath);

      await db.initialize();
      expect(db.isInitialized()).toBe(true);

      await db.close();
    });

    it('should not be initialized after calling close()', async () => {
      const module = await import('../../src/main/database');
      const db = new module.DatabaseService(testDbPath);

      await db.initialize();
      await db.close();
      expect(db.isInitialized()).toBe(false);
    });

    it('should throw error when getting connection before initialize', async () => {
      const module = await import('../../src/main/database');
      const db = new module.DatabaseService(testDbPath);

      expect(() => db.getConnection()).toThrow(/not initialized/i);
    });

    it('should return connection after initialize', async () => {
      const module = await import('../../src/main/database');
      const db = new module.DatabaseService(testDbPath);

      await db.initialize();
      const conn = db.getConnection();
      expect(conn).toBeDefined();
      expect(conn).not.toBeNull();

      await db.close();
    });

    it('should allow multiple initialize calls (idempotent)', async () => {
      const module = await import('../../src/main/database');
      const db = new module.DatabaseService(testDbPath);

      await db.initialize();
      await db.initialize(); // Should not throw
      expect(db.isInitialized()).toBe(true);

      await db.close();
    });

    it('should allow close without initialize', async () => {
      const module = await import('../../src/main/database');
      const db = new module.DatabaseService(testDbPath);

      // Should not throw
      await expect(db.close()).resolves.not.toThrow();
    });
  });

  describe('T009.1.1 - Migration Execution', () => {
    it('should run migrations on first initialize', async () => {
      const module = await import('../../src/main/database');
      const db = new module.DatabaseService(testDbPath);

      await db.initialize();
      const conn = db.getConnection();

      // Check that vendors table exists
      const tables = conn.prepare(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='vendors'"
      ).get();
      expect(tables).toBeDefined();

      await db.close();
    });

    it('should create vendors table with correct schema', async () => {
      const module = await import('../../src/main/database');
      const db = new module.DatabaseService(testDbPath);

      await db.initialize();
      const conn = db.getConnection();

      // Get table info
      const columns = conn.prepare('PRAGMA table_info(vendors)').all() as Array<{
        name: string;
        type: string;
        notnull: number;
        pk: number;
      }>;

      const columnNames = columns.map((c) => c.name);
      expect(columnNames).toContain('id');
      expect(columnNames).toContain('rfc');
      expect(columnNames).toContain('business_name');
      expect(columnNames).toContain('address');
      expect(columnNames).toContain('contact_info');
      expect(columnNames).toContain('created_at');
      expect(columnNames).toContain('updated_at');

      await db.close();
    });

    it('should create invoices table with correct schema', async () => {
      const module = await import('../../src/main/database');
      const db = new module.DatabaseService(testDbPath);

      await db.initialize();
      const conn = db.getConnection();

      const columns = conn.prepare('PRAGMA table_info(invoices)').all() as Array<{
        name: string;
      }>;

      const columnNames = columns.map((c) => c.name);
      expect(columnNames).toContain('id');
      expect(columnNames).toContain('vendor_id');
      expect(columnNames).toContain('invoice_number');
      expect(columnNames).toContain('invoice_date');
      expect(columnNames).toContain('subtotal');
      expect(columnNames).toContain('iva_amount');
      expect(columnNames).toContain('total');
      expect(columnNames).toContain('state');
      expect(columnNames).toContain('source_type');
      expect(columnNames).toContain('pdf_path');
      expect(columnNames).toContain('duplicate_hash');

      await db.close();
    });

    it('should create line_items table', async () => {
      const module = await import('../../src/main/database');
      const db = new module.DatabaseService(testDbPath);

      await db.initialize();
      const conn = db.getConnection();

      const tables = conn.prepare(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='line_items'"
      ).get();
      expect(tables).toBeDefined();

      await db.close();
    });

    it('should create extraction_results table', async () => {
      const module = await import('../../src/main/database');
      const db = new module.DatabaseService(testDbPath);

      await db.initialize();
      const conn = db.getConnection();

      const tables = conn.prepare(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='extraction_results'"
      ).get();
      expect(tables).toBeDefined();

      await db.close();
    });

    it('should create contpaqi_entries table', async () => {
      const module = await import('../../src/main/database');
      const db = new module.DatabaseService(testDbPath);

      await db.initialize();
      const conn = db.getConnection();

      const tables = conn.prepare(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='contpaqi_entries'"
      ).get();
      expect(tables).toBeDefined();

      await db.close();
    });

    it('should create all required indexes', async () => {
      const module = await import('../../src/main/database');
      const db = new module.DatabaseService(testDbPath);

      await db.initialize();
      const conn = db.getConnection();

      const indexes = conn.prepare(
        "SELECT name FROM sqlite_master WHERE type='index' AND name LIKE 'idx_%'"
      ).all() as Array<{ name: string }>;

      const indexNames = indexes.map((i) => i.name);
      expect(indexNames).toContain('idx_invoice_state');
      expect(indexNames).toContain('idx_invoice_duplicate');
      expect(indexNames).toContain('idx_vendor_rfc');
      expect(indexNames).toContain('idx_extraction_invoice');

      await db.close();
    });

    it('should not re-run migrations on second initialize', async () => {
      const module = await import('../../src/main/database');

      // First init
      const db1 = new module.DatabaseService(testDbPath);
      await db1.initialize();
      const conn1 = db1.getConnection();

      // Insert test data
      conn1.prepare(
        "INSERT INTO vendors (id, rfc, business_name) VALUES (?, ?, ?)"
      ).run('test-id', 'TEST010101000', 'Test Company');

      await db1.close();

      // Second init (should not drop data)
      const db2 = new module.DatabaseService(testDbPath);
      await db2.initialize();
      const conn2 = db2.getConnection();

      const vendor = conn2.prepare(
        "SELECT * FROM vendors WHERE id = ?"
      ).get('test-id');

      expect(vendor).toBeDefined();

      await db2.close();
    });
  });

  describe('T009.1.1 - Foreign Keys', () => {
    it('should enable foreign key constraints', async () => {
      const module = await import('../../src/main/database');
      const db = new module.DatabaseService(testDbPath);

      await db.initialize();
      const conn = db.getConnection();

      const result = conn.prepare('PRAGMA foreign_keys').get() as { foreign_keys: number };
      expect(result.foreign_keys).toBe(1);

      await db.close();
    });

    it('should enforce foreign key constraint on invoices.vendor_id', async () => {
      const module = await import('../../src/main/database');
      const db = new module.DatabaseService(testDbPath);

      await db.initialize();
      const conn = db.getConnection();

      // Try to insert invoice with non-existent vendor
      expect(() => {
        conn.prepare(`
          INSERT INTO invoices
          (id, vendor_id, invoice_number, invoice_date, subtotal, iva_amount, total, state, source_type, pdf_path)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          'inv-1', 'non-existent-vendor', 'F-001', '2024-01-15',
          1000.00, 160.00, 1160.00, 'UPLOADED', 'text_based', '/path/to/invoice.pdf'
        );
      }).toThrow(/FOREIGN KEY constraint failed/);

      await db.close();
    });

    it('should cascade delete line_items when invoice is deleted', async () => {
      const module = await import('../../src/main/database');
      const db = new module.DatabaseService(testDbPath);

      await db.initialize();
      const conn = db.getConnection();

      // Create vendor and invoice
      conn.prepare(
        "INSERT INTO vendors (id, rfc, business_name) VALUES (?, ?, ?)"
      ).run('vendor-1', 'TEST010101000', 'Test Company');

      conn.prepare(`
        INSERT INTO invoices
        (id, vendor_id, invoice_number, invoice_date, subtotal, iva_amount, total, state, source_type, pdf_path)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        'inv-1', 'vendor-1', 'F-001', '2024-01-15',
        1000.00, 160.00, 1160.00, 'UPLOADED', 'text_based', '/path/to/invoice.pdf'
      );

      // Create line item
      conn.prepare(`
        INSERT INTO line_items
        (id, invoice_id, description, quantity, unit_price, amount, line_order)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run('item-1', 'inv-1', 'Test Item', 1, 1000.00, 1000.00, 1);

      // Verify line item exists
      const beforeDelete = conn.prepare(
        "SELECT * FROM line_items WHERE invoice_id = ?"
      ).get('inv-1');
      expect(beforeDelete).toBeDefined();

      // Delete invoice
      conn.prepare("DELETE FROM invoices WHERE id = ?").run('inv-1');

      // Line items should be gone
      const afterDelete = conn.prepare(
        "SELECT * FROM line_items WHERE invoice_id = ?"
      ).get('inv-1');
      expect(afterDelete).toBeUndefined();

      await db.close();
    });
  });

  describe('T009.1.1 - Error Handling', () => {
    it('should throw error when database path is a directory', async () => {
      const module = await import('../../src/main/database');
      // Create a directory where the database file should be
      const dirPath = path.join(tempDir, 'is-a-directory.db');
      fs.mkdirSync(dirPath, { recursive: true });

      const db = new module.DatabaseService(dirPath);

      await expect(db.initialize()).rejects.toThrow();
    });

    it('should create parent directories if they do not exist', async () => {
      const module = await import('../../src/main/database');
      const nestedPath = path.join(tempDir, 'nested', 'dir', 'test.db');
      const db = new module.DatabaseService(nestedPath);

      await db.initialize();
      expect(fs.existsSync(nestedPath)).toBe(true);

      await db.close();
    });
  });

  describe('T009.1.1 - Database Path', () => {
    it('should expose database path via getDatabasePath method', async () => {
      const module = await import('../../src/main/database');
      const db = new module.DatabaseService(testDbPath);

      expect(db.getDatabasePath()).toBe(testDbPath);
    });

    it('should use provided path for database file', async () => {
      const module = await import('../../src/main/database');
      const customPath = path.join(tempDir, 'custom-name.sqlite');
      const db = new module.DatabaseService(customPath);

      await db.initialize();
      expect(fs.existsSync(customPath)).toBe(true);

      await db.close();
    });
  });

  describe('T009.1.1 - WAL Mode', () => {
    it('should enable WAL mode for better concurrency', async () => {
      const module = await import('../../src/main/database');
      const db = new module.DatabaseService(testDbPath);

      await db.initialize();
      const conn = db.getConnection();

      const result = conn.prepare('PRAGMA journal_mode').get() as { journal_mode: string };
      expect(result.journal_mode).toBe('wal');

      await db.close();
    });
  });
});
