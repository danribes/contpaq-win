-- ============================================================================
-- Migration: 001_initial_schema.sql
-- Description: Initial database schema for ContPAQ Win Invoice Processing
-- Date: 2025-12-16
-- ============================================================================

-- Enable foreign key constraints (SQLite requires this to be set per connection)
PRAGMA foreign_keys = ON;

-- ============================================================================
-- Table: vendors
-- Description: Business entities that issue invoices
-- ============================================================================
CREATE TABLE IF NOT EXISTS vendors (
    id TEXT PRIMARY KEY,
    rfc TEXT UNIQUE NOT NULL,
    business_name TEXT NOT NULL,
    address TEXT,
    contact_info TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ============================================================================
-- Table: invoices
-- Description: Primary entity representing a processed PDF invoice
-- States: UPLOADED → EXTRACTED → VALIDATED → POSTED
-- ============================================================================
CREATE TABLE IF NOT EXISTS invoices (
    id TEXT PRIMARY KEY,
    vendor_id TEXT REFERENCES vendors(id),
    invoice_number TEXT NOT NULL,
    invoice_date TEXT NOT NULL,
    subtotal REAL NOT NULL,
    iva_amount REAL NOT NULL,
    total REAL NOT NULL,
    state TEXT NOT NULL CHECK (state IN ('UPLOADED', 'EXTRACTED', 'VALIDATED', 'POSTED')),
    source_type TEXT NOT NULL CHECK (source_type IN ('text_based', 'scanned')),
    pdf_path TEXT NOT NULL,
    duplicate_hash TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ============================================================================
-- Table: line_items
-- Description: Individual line items from an invoice
-- ============================================================================
CREATE TABLE IF NOT EXISTS line_items (
    id TEXT PRIMARY KEY,
    invoice_id TEXT NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    quantity REAL NOT NULL,
    unit_price REAL NOT NULL,
    amount REAL NOT NULL,
    line_order INTEGER NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ============================================================================
-- Table: extraction_results
-- Description: AI extraction output with confidence scores and bounding boxes
-- ============================================================================
CREATE TABLE IF NOT EXISTS extraction_results (
    id TEXT PRIMARY KEY,
    invoice_id TEXT NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    field_name TEXT NOT NULL,
    extracted_value TEXT NOT NULL,
    confidence REAL NOT NULL,
    bbox_x INTEGER,
    bbox_y INTEGER,
    bbox_width INTEGER,
    bbox_height INTEGER,
    user_verified INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ============================================================================
-- Table: contpaqi_entries
-- Description: Record of posting to ContPAQi system
-- ============================================================================
CREATE TABLE IF NOT EXISTS contpaqi_entries (
    id TEXT PRIMARY KEY,
    invoice_id TEXT UNIQUE NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    folio_number TEXT,
    entry_date TEXT NOT NULL,
    posting_status TEXT NOT NULL CHECK (posting_status IN ('pending', 'success', 'failed')),
    error_message TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ============================================================================
-- Indexes
-- Description: Performance indexes for common query patterns
-- ============================================================================

-- T005.2.1: Index on invoices.state for filtering by processing state
CREATE INDEX IF NOT EXISTS idx_invoice_state ON invoices(state);

-- T005.2.2: Index on invoices.duplicate_hash for duplicate detection
CREATE INDEX IF NOT EXISTS idx_invoice_duplicate ON invoices(duplicate_hash);

-- T005.2.3: Unique index on vendors.rfc (already enforced by UNIQUE constraint)
-- Note: SQLite creates an implicit index for UNIQUE constraints
-- Adding explicit index for clarity and consistency
CREATE INDEX IF NOT EXISTS idx_vendor_rfc ON vendors(rfc);

-- T005.2.4: Index on extraction_results.invoice_id for joining with invoices
CREATE INDEX IF NOT EXISTS idx_extraction_invoice ON extraction_results(invoice_id);

-- Additional indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_invoice_vendor ON invoices(vendor_id);
CREATE INDEX IF NOT EXISTS idx_lineitem_invoice ON line_items(invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoice_date ON invoices(invoice_date);
