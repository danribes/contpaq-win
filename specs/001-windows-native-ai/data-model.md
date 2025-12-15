# Data Model: Windows-Native AI Invoice Processing

**Feature**: 001-windows-native-ai
**Date**: 2025-12-15

## Entity Relationship Diagram

```
┌─────────────────┐       ┌─────────────────┐
│     Invoice     │───────│     Vendor      │
├─────────────────┤  N:1  ├─────────────────┤
│ id (PK)         │       │ id (PK)         │
│ vendor_id (FK)  │       │ rfc (UNIQUE)    │
│ invoice_number  │       │ business_name   │
│ invoice_date    │       │ address         │
│ subtotal        │       │ contact_info    │
│ iva_amount      │       │ created_at      │
│ total           │       │ updated_at      │
│ state           │       └─────────────────┘
│ source_type     │
│ pdf_path        │       ┌─────────────────┐
│ duplicate_hash  │       │  ContPAQiEntry  │
│ created_at      │───────├─────────────────┤
│ updated_at      │  1:1  │ id (PK)         │
└────────┬────────┘       │ invoice_id (FK) │
         │                │ folio_number    │
         │ 1:N            │ entry_date      │
         │                │ posting_status  │
┌────────▼────────┐       │ error_message   │
│    LineItem     │       │ created_at      │
├─────────────────┤       └─────────────────┘
│ id (PK)         │
│ invoice_id (FK) │       ┌─────────────────┐
│ description     │       │ExtractionResult │
│ quantity        │───────├─────────────────┤
│ unit_price      │  1:N  │ id (PK)         │
│ amount          │       │ invoice_id (FK) │
│ line_order      │       │ field_name      │
│ created_at      │       │ extracted_value │
└─────────────────┘       │ confidence      │
                          │ bbox_x          │
                          │ bbox_y          │
                          │ bbox_width      │
                          │ bbox_height     │
                          │ user_verified   │
                          │ created_at      │
                          └─────────────────┘
```

## Entity Definitions

### Invoice

Primary entity representing a processed PDF invoice.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| vendor_id | UUID | FK → Vendor.id, NULL | Associated vendor (null until extracted) |
| invoice_number | VARCHAR(50) | NOT NULL | Invoice number from document |
| invoice_date | DATE | NOT NULL | Date on the invoice |
| subtotal | DECIMAL(15,2) | NOT NULL | Subtotal before tax |
| iva_amount | DECIMAL(15,2) | NOT NULL | IVA (16% tax) amount |
| total | DECIMAL(15,2) | NOT NULL | Total invoice amount |
| state | ENUM | NOT NULL | Processing state (see below) |
| source_type | ENUM | NOT NULL | 'text_based' or 'scanned' |
| pdf_path | VARCHAR(500) | NOT NULL | Absolute path to PDF file |
| duplicate_hash | VARCHAR(64) | INDEX | SHA-256 hash for duplicate detection |
| created_at | TIMESTAMP | NOT NULL | Record creation time |
| updated_at | TIMESTAMP | NOT NULL | Last modification time |

**State Transitions**:
```
UPLOADED → EXTRACTED → VALIDATED → POSTED
    │          │           │
    └──────────┴───────────┴──→ (can return to previous state on error)
```

| State | Description | Valid Transitions |
|-------|-------------|-------------------|
| UPLOADED | PDF received, awaiting processing | → EXTRACTED |
| EXTRACTED | AI extraction complete | → VALIDATED, → UPLOADED (re-process) |
| VALIDATED | User has verified data | → POSTED, → EXTRACTED (edit) |
| POSTED | Successfully sent to ContPAQi | (terminal) |

### Vendor

Business entity that issues invoices.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| rfc | VARCHAR(13) | UNIQUE, NOT NULL | Mexican tax ID (RFC) |
| business_name | VARCHAR(200) | NOT NULL | Legal business name |
| address | TEXT | NULL | Business address |
| contact_info | TEXT | NULL | Phone, email, etc. |
| created_at | TIMESTAMP | NOT NULL | Record creation time |
| updated_at | TIMESTAMP | NOT NULL | Last modification time |

**RFC Validation Rules**:
- Individuals (Persona Física): 13 characters (4 letters + 6 digits + 3 alphanumeric)
- Companies (Persona Moral): 12 characters (3 letters + 6 digits + 3 alphanumeric)

### LineItem

Individual line items from an invoice.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| invoice_id | UUID | FK → Invoice.id, NOT NULL | Parent invoice |
| description | VARCHAR(500) | NOT NULL | Product/service description |
| quantity | DECIMAL(10,4) | NOT NULL | Quantity |
| unit_price | DECIMAL(15,2) | NOT NULL | Price per unit |
| amount | DECIMAL(15,2) | NOT NULL | Line total (qty × price) |
| line_order | INTEGER | NOT NULL | Position in invoice (1-based) |
| created_at | TIMESTAMP | NOT NULL | Record creation time |

### ExtractionResult

AI extraction output with confidence scores.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| invoice_id | UUID | FK → Invoice.id, NOT NULL | Parent invoice |
| field_name | VARCHAR(50) | NOT NULL | Name of extracted field |
| extracted_value | TEXT | NOT NULL | Extracted text value |
| confidence | DECIMAL(5,2) | NOT NULL | Confidence score (0.00-100.00) |
| bbox_x | INTEGER | NULL | Bounding box X coordinate (pixels) |
| bbox_y | INTEGER | NULL | Bounding box Y coordinate (pixels) |
| bbox_width | INTEGER | NULL | Bounding box width (pixels) |
| bbox_height | INTEGER | NULL | Bounding box height (pixels) |
| user_verified | BOOLEAN | NOT NULL DEFAULT FALSE | User has verified/edited |
| created_at | TIMESTAMP | NOT NULL | Record creation time |

**Standard Field Names**:
- `vendor_rfc` - Vendor RFC
- `vendor_name` - Vendor business name
- `invoice_number` - Invoice number
- `invoice_date` - Invoice date
- `subtotal` - Subtotal amount
- `iva_amount` - IVA tax amount
- `total` - Total amount
- `line_item_N_desc` - Line item N description
- `line_item_N_qty` - Line item N quantity
- `line_item_N_price` - Line item N unit price
- `line_item_N_amount` - Line item N total

### ContPAQiEntry

Record of posting to ContPAQi system.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| invoice_id | UUID | FK → Invoice.id, UNIQUE | Associated invoice |
| folio_number | VARCHAR(50) | NULL | ContPAQi folio (set on success) |
| entry_date | DATE | NOT NULL | Date of posting attempt |
| posting_status | ENUM | NOT NULL | 'pending', 'success', 'failed' |
| error_message | TEXT | NULL | Error details if failed |
| created_at | TIMESTAMP | NOT NULL | Record creation time |

## Indexes

```sql
-- Invoice lookups
CREATE INDEX idx_invoice_state ON Invoice(state);
CREATE INDEX idx_invoice_vendor ON Invoice(vendor_id);
CREATE INDEX idx_invoice_duplicate ON Invoice(duplicate_hash);
CREATE INDEX idx_invoice_date ON Invoice(invoice_date);

-- Vendor lookups
CREATE UNIQUE INDEX idx_vendor_rfc ON Vendor(rfc);

-- LineItem lookups
CREATE INDEX idx_lineitem_invoice ON LineItem(invoice_id);

-- ExtractionResult lookups
CREATE INDEX idx_extraction_invoice ON ExtractionResult(invoice_id);
CREATE INDEX idx_extraction_field ON ExtractionResult(invoice_id, field_name);

-- ContPAQiEntry lookups
CREATE UNIQUE INDEX idx_contpaqi_invoice ON ContPAQiEntry(invoice_id);
```

## SQLite Schema

```sql
-- Enable foreign keys
PRAGMA foreign_keys = ON;

CREATE TABLE vendors (
    id TEXT PRIMARY KEY,
    rfc TEXT UNIQUE NOT NULL,
    business_name TEXT NOT NULL,
    address TEXT,
    contact_info TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE invoices (
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

CREATE TABLE line_items (
    id TEXT PRIMARY KEY,
    invoice_id TEXT NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    quantity REAL NOT NULL,
    unit_price REAL NOT NULL,
    amount REAL NOT NULL,
    line_order INTEGER NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE extraction_results (
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

CREATE TABLE contpaqi_entries (
    id TEXT PRIMARY KEY,
    invoice_id TEXT UNIQUE NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    folio_number TEXT,
    entry_date TEXT NOT NULL,
    posting_status TEXT NOT NULL CHECK (posting_status IN ('pending', 'success', 'failed')),
    error_message TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Indexes
CREATE INDEX idx_invoice_state ON invoices(state);
CREATE INDEX idx_invoice_vendor ON invoices(vendor_id);
CREATE INDEX idx_invoice_duplicate ON invoices(duplicate_hash);
CREATE INDEX idx_lineitem_invoice ON line_items(invoice_id);
CREATE INDEX idx_extraction_invoice ON extraction_results(invoice_id);
```

## Pydantic Models (Python AI Service)

```python
from pydantic import BaseModel, Field
from datetime import date, datetime
from enum import Enum
from typing import Optional, List
from uuid import UUID

class InvoiceState(str, Enum):
    UPLOADED = "UPLOADED"
    EXTRACTED = "EXTRACTED"
    VALIDATED = "VALIDATED"
    POSTED = "POSTED"

class SourceType(str, Enum):
    TEXT_BASED = "text_based"
    SCANNED = "scanned"

class BoundingBox(BaseModel):
    x: int
    y: int
    width: int
    height: int

class ExtractionField(BaseModel):
    field_name: str
    value: str
    confidence: float = Field(ge=0, le=100)
    bbox: Optional[BoundingBox] = None
    user_verified: bool = False

class LineItemExtraction(BaseModel):
    description: str
    quantity: float
    unit_price: float
    amount: float
    confidence: float = Field(ge=0, le=100)

class InvoiceExtraction(BaseModel):
    vendor_rfc: ExtractionField
    vendor_name: ExtractionField
    invoice_number: ExtractionField
    invoice_date: ExtractionField
    subtotal: ExtractionField
    iva_amount: ExtractionField
    total: ExtractionField
    line_items: List[LineItemExtraction]
    source_type: SourceType
    processing_time_ms: int
```

## TypeScript Interfaces (Desktop App)

```typescript
type InvoiceState = 'UPLOADED' | 'EXTRACTED' | 'VALIDATED' | 'POSTED';
type SourceType = 'text_based' | 'scanned';
type PostingStatus = 'pending' | 'success' | 'failed';

interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface ExtractionField {
  fieldName: string;
  value: string;
  confidence: number; // 0-100
  bbox?: BoundingBox;
  userVerified: boolean;
}

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  lineOrder: number;
}

interface Vendor {
  id: string;
  rfc: string;
  businessName: string;
  address?: string;
  contactInfo?: string;
}

interface Invoice {
  id: string;
  vendor?: Vendor;
  invoiceNumber: string;
  invoiceDate: string; // ISO date
  subtotal: number;
  ivaAmount: number;
  total: number;
  state: InvoiceState;
  sourceType: SourceType;
  pdfPath: string;
  lineItems: LineItem[];
  extractionResults: ExtractionField[];
  createdAt: string;
  updatedAt: string;
}

interface ContPAQiEntry {
  id: string;
  invoiceId: string;
  folioNumber?: string;
  entryDate: string;
  postingStatus: PostingStatus;
  errorMessage?: string;
}
```
