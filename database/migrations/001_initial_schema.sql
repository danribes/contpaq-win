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
-- Indexes (will be added in T005.2)
-- Note: Index creation is handled in subsequent migration tasks
-- ============================================================================
