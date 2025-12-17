/**
 * T009.2.1 Invoice Repository Tests
 *
 * Tests for invoice CRUD operations in the desktop app main process.
 */

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { DatabaseService } from '../../src/main/database';

// Import will be created in T009.2.2
// eslint-disable-next-line @typescript-eslint/no-unused-vars
let InvoiceRepository: typeof import('../../src/main/invoice-repository').InvoiceRepository;

describe('T009.2 - Invoice Repository', () => {
  let tempDir: string;
  let testDbPath: string;
  let db: DatabaseService;

  beforeAll(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'contpaq-invoice-test-'));
  });

  afterAll(() => {
    if (tempDir && fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  beforeEach(async () => {
    testDbPath = path.join(tempDir, `test-${Date.now()}.db`);
    db = new DatabaseService(testDbPath);
    await db.initialize();

    // Create a test vendor for foreign key tests
    const conn = db.getConnection();
    conn.prepare(`
      INSERT INTO vendors (id, rfc, business_name)
      VALUES (?, ?, ?)
    `).run('vendor-1', 'TEST010101000', 'Test Vendor S.A. de C.V.');
  });

  afterEach(async () => {
    await db.close();
  });

  // ==========================================================================
  // T009.2.1 - Class Structure Tests
  // ==========================================================================

  describe('T009.2.1 - Class Structure', () => {
    it('should export InvoiceRepository class', async () => {
      const module = await import('../../src/main/invoice-repository');
      expect(module.InvoiceRepository).toBeDefined();
      expect(typeof module.InvoiceRepository).toBe('function');
    });

    it('should create instance with database connection', async () => {
      const module = await import('../../src/main/invoice-repository');
      const repo = new module.InvoiceRepository(db.getConnection());
      expect(repo).toBeInstanceOf(module.InvoiceRepository);
    });

    it('should have createInvoice method', async () => {
      const module = await import('../../src/main/invoice-repository');
      const repo = new module.InvoiceRepository(db.getConnection());
      expect(typeof repo.createInvoice).toBe('function');
    });

    it('should have getInvoiceById method', async () => {
      const module = await import('../../src/main/invoice-repository');
      const repo = new module.InvoiceRepository(db.getConnection());
      expect(typeof repo.getInvoiceById).toBe('function');
    });

    it('should have updateInvoice method', async () => {
      const module = await import('../../src/main/invoice-repository');
      const repo = new module.InvoiceRepository(db.getConnection());
      expect(typeof repo.updateInvoice).toBe('function');
    });

    it('should have listInvoices method', async () => {
      const module = await import('../../src/main/invoice-repository');
      const repo = new module.InvoiceRepository(db.getConnection());
      expect(typeof repo.listInvoices).toBe('function');
    });

    it('should have checkDuplicate method', async () => {
      const module = await import('../../src/main/invoice-repository');
      const repo = new module.InvoiceRepository(db.getConnection());
      expect(typeof repo.checkDuplicate).toBe('function');
    });

    it('should have deleteInvoice method', async () => {
      const module = await import('../../src/main/invoice-repository');
      const repo = new module.InvoiceRepository(db.getConnection());
      expect(typeof repo.deleteInvoice).toBe('function');
    });
  });

  // ==========================================================================
  // T009.2.2 - createInvoice Tests
  // ==========================================================================

  describe('T009.2.2 - createInvoice', () => {
    it('should create invoice with all required fields', async () => {
      const module = await import('../../src/main/invoice-repository');
      const repo = new module.InvoiceRepository(db.getConnection());

      const invoice = await repo.createInvoice({
        invoiceNumber: 'F-001',
        invoiceDate: '2024-01-15',
        subtotal: 1000.00,
        ivaAmount: 160.00,
        total: 1160.00,
        state: 'UPLOADED',
        sourceType: 'text_based',
        pdfPath: '/path/to/invoice.pdf',
      });

      expect(invoice).toBeDefined();
      expect(invoice.id).toBeDefined();
      expect(invoice.invoiceNumber).toBe('F-001');
      expect(invoice.total).toBe(1160.00);
    });

    it('should generate UUID for new invoice', async () => {
      const module = await import('../../src/main/invoice-repository');
      const repo = new module.InvoiceRepository(db.getConnection());

      const invoice = await repo.createInvoice({
        invoiceNumber: 'F-001',
        invoiceDate: '2024-01-15',
        subtotal: 1000.00,
        ivaAmount: 160.00,
        total: 1160.00,
        state: 'UPLOADED',
        sourceType: 'text_based',
        pdfPath: '/path/to/invoice.pdf',
      });

      expect(invoice.id).toMatch(/^[0-9a-f-]{36}$/i);
    });

    it('should create invoice with vendor_id', async () => {
      const module = await import('../../src/main/invoice-repository');
      const repo = new module.InvoiceRepository(db.getConnection());

      const invoice = await repo.createInvoice({
        vendorId: 'vendor-1',
        invoiceNumber: 'F-001',
        invoiceDate: '2024-01-15',
        subtotal: 1000.00,
        ivaAmount: 160.00,
        total: 1160.00,
        state: 'UPLOADED',
        sourceType: 'text_based',
        pdfPath: '/path/to/invoice.pdf',
      });

      expect(invoice.vendorId).toBe('vendor-1');
    });

    it('should create invoice with duplicate_hash', async () => {
      const module = await import('../../src/main/invoice-repository');
      const repo = new module.InvoiceRepository(db.getConnection());

      const invoice = await repo.createInvoice({
        invoiceNumber: 'F-001',
        invoiceDate: '2024-01-15',
        subtotal: 1000.00,
        ivaAmount: 160.00,
        total: 1160.00,
        state: 'UPLOADED',
        sourceType: 'text_based',
        pdfPath: '/path/to/invoice.pdf',
        duplicateHash: 'abc123hash',
      });

      expect(invoice.duplicateHash).toBe('abc123hash');
    });

    it('should set created_at and updated_at timestamps', async () => {
      const module = await import('../../src/main/invoice-repository');
      const repo = new module.InvoiceRepository(db.getConnection());

      const before = new Date();
      const invoice = await repo.createInvoice({
        invoiceNumber: 'F-001',
        invoiceDate: '2024-01-15',
        subtotal: 1000.00,
        ivaAmount: 160.00,
        total: 1160.00,
        state: 'UPLOADED',
        sourceType: 'text_based',
        pdfPath: '/path/to/invoice.pdf',
      });
      const after = new Date();

      expect(new Date(invoice.createdAt).getTime()).toBeGreaterThanOrEqual(before.getTime() - 1000);
      expect(new Date(invoice.createdAt).getTime()).toBeLessThanOrEqual(after.getTime() + 1000);
      expect(invoice.updatedAt).toBe(invoice.createdAt);
    });

    it('should throw error for invalid state', async () => {
      const module = await import('../../src/main/invoice-repository');
      const repo = new module.InvoiceRepository(db.getConnection());

      await expect(repo.createInvoice({
        invoiceNumber: 'F-001',
        invoiceDate: '2024-01-15',
        subtotal: 1000.00,
        ivaAmount: 160.00,
        total: 1160.00,
        state: 'INVALID_STATE' as any,
        sourceType: 'text_based',
        pdfPath: '/path/to/invoice.pdf',
      })).rejects.toThrow();
    });

    it('should throw error for invalid source_type', async () => {
      const module = await import('../../src/main/invoice-repository');
      const repo = new module.InvoiceRepository(db.getConnection());

      await expect(repo.createInvoice({
        invoiceNumber: 'F-001',
        invoiceDate: '2024-01-15',
        subtotal: 1000.00,
        ivaAmount: 160.00,
        total: 1160.00,
        state: 'UPLOADED',
        sourceType: 'invalid_type' as any,
        pdfPath: '/path/to/invoice.pdf',
      })).rejects.toThrow();
    });

    it('should throw error for non-existent vendor_id', async () => {
      const module = await import('../../src/main/invoice-repository');
      const repo = new module.InvoiceRepository(db.getConnection());

      await expect(repo.createInvoice({
        vendorId: 'non-existent-vendor',
        invoiceNumber: 'F-001',
        invoiceDate: '2024-01-15',
        subtotal: 1000.00,
        ivaAmount: 160.00,
        total: 1160.00,
        state: 'UPLOADED',
        sourceType: 'text_based',
        pdfPath: '/path/to/invoice.pdf',
      })).rejects.toThrow(/FOREIGN KEY/);
    });
  });

  // ==========================================================================
  // T009.2.3 - getInvoiceById Tests
  // ==========================================================================

  describe('T009.2.3 - getInvoiceById', () => {
    it('should return invoice by ID', async () => {
      const module = await import('../../src/main/invoice-repository');
      const repo = new module.InvoiceRepository(db.getConnection());

      const created = await repo.createInvoice({
        invoiceNumber: 'F-001',
        invoiceDate: '2024-01-15',
        subtotal: 1000.00,
        ivaAmount: 160.00,
        total: 1160.00,
        state: 'UPLOADED',
        sourceType: 'text_based',
        pdfPath: '/path/to/invoice.pdf',
      });

      const found = await repo.getInvoiceById(created.id);
      expect(found).toBeDefined();
      expect(found?.id).toBe(created.id);
      expect(found?.invoiceNumber).toBe('F-001');
    });

    it('should return null for non-existent ID', async () => {
      const module = await import('../../src/main/invoice-repository');
      const repo = new module.InvoiceRepository(db.getConnection());

      const found = await repo.getInvoiceById('non-existent-id');
      expect(found).toBeNull();
    });

    it('should return all invoice fields', async () => {
      const module = await import('../../src/main/invoice-repository');
      const repo = new module.InvoiceRepository(db.getConnection());

      const created = await repo.createInvoice({
        vendorId: 'vendor-1',
        invoiceNumber: 'F-001',
        invoiceDate: '2024-01-15',
        subtotal: 1000.00,
        ivaAmount: 160.00,
        total: 1160.00,
        state: 'UPLOADED',
        sourceType: 'text_based',
        pdfPath: '/path/to/invoice.pdf',
        duplicateHash: 'hash123',
      });

      const found = await repo.getInvoiceById(created.id);
      expect(found?.vendorId).toBe('vendor-1');
      expect(found?.invoiceNumber).toBe('F-001');
      expect(found?.invoiceDate).toBe('2024-01-15');
      expect(found?.subtotal).toBe(1000.00);
      expect(found?.ivaAmount).toBe(160.00);
      expect(found?.total).toBe(1160.00);
      expect(found?.state).toBe('UPLOADED');
      expect(found?.sourceType).toBe('text_based');
      expect(found?.pdfPath).toBe('/path/to/invoice.pdf');
      expect(found?.duplicateHash).toBe('hash123');
      expect(found?.createdAt).toBeDefined();
      expect(found?.updatedAt).toBeDefined();
    });
  });

  // ==========================================================================
  // T009.2.4 - updateInvoice Tests
  // ==========================================================================

  describe('T009.2.4 - updateInvoice', () => {
    it('should update invoice state', async () => {
      const module = await import('../../src/main/invoice-repository');
      const repo = new module.InvoiceRepository(db.getConnection());

      const created = await repo.createInvoice({
        invoiceNumber: 'F-001',
        invoiceDate: '2024-01-15',
        subtotal: 1000.00,
        ivaAmount: 160.00,
        total: 1160.00,
        state: 'UPLOADED',
        sourceType: 'text_based',
        pdfPath: '/path/to/invoice.pdf',
      });

      const updated = await repo.updateInvoice(created.id, { state: 'EXTRACTED' });
      expect(updated?.state).toBe('EXTRACTED');
    });

    it('should update invoice vendor_id', async () => {
      const module = await import('../../src/main/invoice-repository');
      const repo = new module.InvoiceRepository(db.getConnection());

      const created = await repo.createInvoice({
        invoiceNumber: 'F-001',
        invoiceDate: '2024-01-15',
        subtotal: 1000.00,
        ivaAmount: 160.00,
        total: 1160.00,
        state: 'UPLOADED',
        sourceType: 'text_based',
        pdfPath: '/path/to/invoice.pdf',
      });

      const updated = await repo.updateInvoice(created.id, { vendorId: 'vendor-1' });
      expect(updated?.vendorId).toBe('vendor-1');
    });

    it('should update multiple fields at once', async () => {
      const module = await import('../../src/main/invoice-repository');
      const repo = new module.InvoiceRepository(db.getConnection());

      const created = await repo.createInvoice({
        invoiceNumber: 'F-001',
        invoiceDate: '2024-01-15',
        subtotal: 1000.00,
        ivaAmount: 160.00,
        total: 1160.00,
        state: 'UPLOADED',
        sourceType: 'text_based',
        pdfPath: '/path/to/invoice.pdf',
      });

      const updated = await repo.updateInvoice(created.id, {
        state: 'EXTRACTED',
        vendorId: 'vendor-1',
        duplicateHash: 'newhash',
      });

      expect(updated?.state).toBe('EXTRACTED');
      expect(updated?.vendorId).toBe('vendor-1');
      expect(updated?.duplicateHash).toBe('newhash');
    });

    it('should update updated_at timestamp', async () => {
      const module = await import('../../src/main/invoice-repository');
      const repo = new module.InvoiceRepository(db.getConnection());

      const created = await repo.createInvoice({
        invoiceNumber: 'F-001',
        invoiceDate: '2024-01-15',
        subtotal: 1000.00,
        ivaAmount: 160.00,
        total: 1160.00,
        state: 'UPLOADED',
        sourceType: 'text_based',
        pdfPath: '/path/to/invoice.pdf',
      });

      // Wait a bit to ensure timestamp difference
      await new Promise((resolve) => setTimeout(resolve, 10));

      const updated = await repo.updateInvoice(created.id, { state: 'EXTRACTED' });
      expect(new Date(updated!.updatedAt).getTime()).toBeGreaterThan(
        new Date(created.createdAt).getTime()
      );
    });

    it('should return null for non-existent ID', async () => {
      const module = await import('../../src/main/invoice-repository');
      const repo = new module.InvoiceRepository(db.getConnection());

      const updated = await repo.updateInvoice('non-existent', { state: 'EXTRACTED' });
      expect(updated).toBeNull();
    });

    it('should throw error for invalid state update', async () => {
      const module = await import('../../src/main/invoice-repository');
      const repo = new module.InvoiceRepository(db.getConnection());

      const created = await repo.createInvoice({
        invoiceNumber: 'F-001',
        invoiceDate: '2024-01-15',
        subtotal: 1000.00,
        ivaAmount: 160.00,
        total: 1160.00,
        state: 'UPLOADED',
        sourceType: 'text_based',
        pdfPath: '/path/to/invoice.pdf',
      });

      await expect(
        repo.updateInvoice(created.id, { state: 'INVALID' as any })
      ).rejects.toThrow();
    });

    it('should not modify other fields when updating', async () => {
      const module = await import('../../src/main/invoice-repository');
      const repo = new module.InvoiceRepository(db.getConnection());

      const created = await repo.createInvoice({
        invoiceNumber: 'F-001',
        invoiceDate: '2024-01-15',
        subtotal: 1000.00,
        ivaAmount: 160.00,
        total: 1160.00,
        state: 'UPLOADED',
        sourceType: 'text_based',
        pdfPath: '/path/to/invoice.pdf',
      });

      await repo.updateInvoice(created.id, { state: 'EXTRACTED' });
      const found = await repo.getInvoiceById(created.id);

      expect(found?.invoiceNumber).toBe('F-001');
      expect(found?.total).toBe(1160.00);
      expect(found?.pdfPath).toBe('/path/to/invoice.pdf');
    });
  });

  // ==========================================================================
  // T009.2.5 - listInvoices Tests
  // ==========================================================================

  describe('T009.2.5 - listInvoices', () => {
    it('should return empty array when no invoices', async () => {
      const module = await import('../../src/main/invoice-repository');
      const repo = new module.InvoiceRepository(db.getConnection());

      const invoices = await repo.listInvoices();
      expect(invoices).toEqual([]);
    });

    it('should return all invoices', async () => {
      const module = await import('../../src/main/invoice-repository');
      const repo = new module.InvoiceRepository(db.getConnection());

      await repo.createInvoice({
        invoiceNumber: 'F-001',
        invoiceDate: '2024-01-15',
        subtotal: 1000.00,
        ivaAmount: 160.00,
        total: 1160.00,
        state: 'UPLOADED',
        sourceType: 'text_based',
        pdfPath: '/path/to/invoice1.pdf',
      });

      await repo.createInvoice({
        invoiceNumber: 'F-002',
        invoiceDate: '2024-01-16',
        subtotal: 2000.00,
        ivaAmount: 320.00,
        total: 2320.00,
        state: 'EXTRACTED',
        sourceType: 'scanned',
        pdfPath: '/path/to/invoice2.pdf',
      });

      const invoices = await repo.listInvoices();
      expect(invoices.length).toBe(2);
    });

    it('should filter invoices by state', async () => {
      const module = await import('../../src/main/invoice-repository');
      const repo = new module.InvoiceRepository(db.getConnection());

      await repo.createInvoice({
        invoiceNumber: 'F-001',
        invoiceDate: '2024-01-15',
        subtotal: 1000.00,
        ivaAmount: 160.00,
        total: 1160.00,
        state: 'UPLOADED',
        sourceType: 'text_based',
        pdfPath: '/path/to/invoice1.pdf',
      });

      await repo.createInvoice({
        invoiceNumber: 'F-002',
        invoiceDate: '2024-01-16',
        subtotal: 2000.00,
        ivaAmount: 320.00,
        total: 2320.00,
        state: 'EXTRACTED',
        sourceType: 'scanned',
        pdfPath: '/path/to/invoice2.pdf',
      });

      const uploaded = await repo.listInvoices({ state: 'UPLOADED' });
      expect(uploaded.length).toBe(1);
      expect(uploaded[0].invoiceNumber).toBe('F-001');

      const extracted = await repo.listInvoices({ state: 'EXTRACTED' });
      expect(extracted.length).toBe(1);
      expect(extracted[0].invoiceNumber).toBe('F-002');
    });

    it('should filter by multiple states', async () => {
      const module = await import('../../src/main/invoice-repository');
      const repo = new module.InvoiceRepository(db.getConnection());

      await repo.createInvoice({
        invoiceNumber: 'F-001',
        invoiceDate: '2024-01-15',
        subtotal: 1000.00,
        ivaAmount: 160.00,
        total: 1160.00,
        state: 'UPLOADED',
        sourceType: 'text_based',
        pdfPath: '/path/to/invoice1.pdf',
      });

      await repo.createInvoice({
        invoiceNumber: 'F-002',
        invoiceDate: '2024-01-16',
        subtotal: 2000.00,
        ivaAmount: 320.00,
        total: 2320.00,
        state: 'EXTRACTED',
        sourceType: 'scanned',
        pdfPath: '/path/to/invoice2.pdf',
      });

      await repo.createInvoice({
        invoiceNumber: 'F-003',
        invoiceDate: '2024-01-17',
        subtotal: 3000.00,
        ivaAmount: 480.00,
        total: 3480.00,
        state: 'VALIDATED',
        sourceType: 'text_based',
        pdfPath: '/path/to/invoice3.pdf',
      });

      const pending = await repo.listInvoices({ states: ['UPLOADED', 'EXTRACTED'] });
      expect(pending.length).toBe(2);
    });

    it('should order invoices by created_at descending', async () => {
      const module = await import('../../src/main/invoice-repository');
      const repo = new module.InvoiceRepository(db.getConnection());

      await repo.createInvoice({
        invoiceNumber: 'F-001',
        invoiceDate: '2024-01-15',
        subtotal: 1000.00,
        ivaAmount: 160.00,
        total: 1160.00,
        state: 'UPLOADED',
        sourceType: 'text_based',
        pdfPath: '/path/to/invoice1.pdf',
      });

      await new Promise((resolve) => setTimeout(resolve, 10));

      await repo.createInvoice({
        invoiceNumber: 'F-002',
        invoiceDate: '2024-01-16',
        subtotal: 2000.00,
        ivaAmount: 320.00,
        total: 2320.00,
        state: 'UPLOADED',
        sourceType: 'scanned',
        pdfPath: '/path/to/invoice2.pdf',
      });

      const invoices = await repo.listInvoices();
      expect(invoices[0].invoiceNumber).toBe('F-002'); // Most recent first
      expect(invoices[1].invoiceNumber).toBe('F-001');
    });

    it('should support limit option', async () => {
      const module = await import('../../src/main/invoice-repository');
      const repo = new module.InvoiceRepository(db.getConnection());

      for (let i = 1; i <= 5; i++) {
        await repo.createInvoice({
          invoiceNumber: `F-00${i}`,
          invoiceDate: '2024-01-15',
          subtotal: 1000.00,
          ivaAmount: 160.00,
          total: 1160.00,
          state: 'UPLOADED',
          sourceType: 'text_based',
          pdfPath: `/path/to/invoice${i}.pdf`,
        });
      }

      const invoices = await repo.listInvoices({ limit: 3 });
      expect(invoices.length).toBe(3);
    });

    it('should support offset option', async () => {
      const module = await import('../../src/main/invoice-repository');
      const repo = new module.InvoiceRepository(db.getConnection());

      for (let i = 1; i <= 5; i++) {
        await repo.createInvoice({
          invoiceNumber: `F-00${i}`,
          invoiceDate: '2024-01-15',
          subtotal: 1000.00,
          ivaAmount: 160.00,
          total: 1160.00,
          state: 'UPLOADED',
          sourceType: 'text_based',
          pdfPath: `/path/to/invoice${i}.pdf`,
        });
        await new Promise((resolve) => setTimeout(resolve, 5));
      }

      const invoices = await repo.listInvoices({ limit: 2, offset: 2 });
      expect(invoices.length).toBe(2);
      // Should skip first 2 (F-005, F-004) and return F-003, F-002
      expect(invoices[0].invoiceNumber).toBe('F-003');
      expect(invoices[1].invoiceNumber).toBe('F-002');
    });
  });

  // ==========================================================================
  // T009.2.6 - checkDuplicate Tests
  // ==========================================================================

  describe('T009.2.6 - checkDuplicate', () => {
    it('should return false when no duplicate exists', async () => {
      const module = await import('../../src/main/invoice-repository');
      const repo = new module.InvoiceRepository(db.getConnection());

      const result = await repo.checkDuplicate('unique-hash');
      expect(result.isDuplicate).toBe(false);
      expect(result.existingInvoice).toBeNull();
    });

    it('should return true when duplicate hash exists', async () => {
      const module = await import('../../src/main/invoice-repository');
      const repo = new module.InvoiceRepository(db.getConnection());

      await repo.createInvoice({
        invoiceNumber: 'F-001',
        invoiceDate: '2024-01-15',
        subtotal: 1000.00,
        ivaAmount: 160.00,
        total: 1160.00,
        state: 'UPLOADED',
        sourceType: 'text_based',
        pdfPath: '/path/to/invoice.pdf',
        duplicateHash: 'duplicate-hash-123',
      });

      const result = await repo.checkDuplicate('duplicate-hash-123');
      expect(result.isDuplicate).toBe(true);
      expect(result.existingInvoice).toBeDefined();
      expect(result.existingInvoice?.invoiceNumber).toBe('F-001');
    });

    it('should return null when checking empty hash', async () => {
      const module = await import('../../src/main/invoice-repository');
      const repo = new module.InvoiceRepository(db.getConnection());

      const result = await repo.checkDuplicate('');
      expect(result.isDuplicate).toBe(false);
    });

    it('should find duplicate among multiple invoices', async () => {
      const module = await import('../../src/main/invoice-repository');
      const repo = new module.InvoiceRepository(db.getConnection());

      await repo.createInvoice({
        invoiceNumber: 'F-001',
        invoiceDate: '2024-01-15',
        subtotal: 1000.00,
        ivaAmount: 160.00,
        total: 1160.00,
        state: 'UPLOADED',
        sourceType: 'text_based',
        pdfPath: '/path/to/invoice1.pdf',
        duplicateHash: 'hash-1',
      });

      await repo.createInvoice({
        invoiceNumber: 'F-002',
        invoiceDate: '2024-01-16',
        subtotal: 2000.00,
        ivaAmount: 320.00,
        total: 2320.00,
        state: 'UPLOADED',
        sourceType: 'text_based',
        pdfPath: '/path/to/invoice2.pdf',
        duplicateHash: 'hash-2',
      });

      const result = await repo.checkDuplicate('hash-2');
      expect(result.isDuplicate).toBe(true);
      expect(result.existingInvoice?.invoiceNumber).toBe('F-002');
    });
  });

  // ==========================================================================
  // Delete Tests
  // ==========================================================================

  describe('deleteInvoice', () => {
    it('should delete invoice by ID', async () => {
      const module = await import('../../src/main/invoice-repository');
      const repo = new module.InvoiceRepository(db.getConnection());

      const created = await repo.createInvoice({
        invoiceNumber: 'F-001',
        invoiceDate: '2024-01-15',
        subtotal: 1000.00,
        ivaAmount: 160.00,
        total: 1160.00,
        state: 'UPLOADED',
        sourceType: 'text_based',
        pdfPath: '/path/to/invoice.pdf',
      });

      const deleted = await repo.deleteInvoice(created.id);
      expect(deleted).toBe(true);

      const found = await repo.getInvoiceById(created.id);
      expect(found).toBeNull();
    });

    it('should return false for non-existent ID', async () => {
      const module = await import('../../src/main/invoice-repository');
      const repo = new module.InvoiceRepository(db.getConnection());

      const deleted = await repo.deleteInvoice('non-existent-id');
      expect(deleted).toBe(false);
    });

    it('should cascade delete related line_items', async () => {
      const module = await import('../../src/main/invoice-repository');
      const repo = new module.InvoiceRepository(db.getConnection());

      const created = await repo.createInvoice({
        invoiceNumber: 'F-001',
        invoiceDate: '2024-01-15',
        subtotal: 1000.00,
        ivaAmount: 160.00,
        total: 1160.00,
        state: 'UPLOADED',
        sourceType: 'text_based',
        pdfPath: '/path/to/invoice.pdf',
      });

      // Add line item directly
      const conn = db.getConnection();
      conn.prepare(`
        INSERT INTO line_items (id, invoice_id, description, quantity, unit_price, amount, line_order)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run('item-1', created.id, 'Test Item', 1, 1000.00, 1000.00, 1);

      // Delete invoice
      await repo.deleteInvoice(created.id);

      // Line item should be gone
      const lineItem = conn.prepare('SELECT * FROM line_items WHERE id = ?').get('item-1');
      expect(lineItem).toBeUndefined();
    });
  });
});
