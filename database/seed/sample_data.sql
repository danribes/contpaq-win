-- ============================================================================
-- Seed Data: sample_data.sql
-- Description: Sample test data for development and testing
-- Date: 2025-12-16
-- ============================================================================

-- ============================================================================
-- T005.3.1: Test Vendors
-- Mexican business entities with valid RFC formats
-- ============================================================================

-- Vendor 1: Persona Moral (Company) - 12 character RFC
INSERT INTO vendors (id, rfc, business_name, address, contact_info, created_at, updated_at)
VALUES (
    'vendor-001-uuid',
    'ABC123456789',
    'Tecnología Avanzada S.A. de C.V.',
    'Av. Insurgentes Sur 1234, Col. Del Valle, CDMX, 03100',
    'Tel: 55 1234 5678, Email: contacto@tecavanzada.mx',
    datetime('now'),
    datetime('now')
);

-- Vendor 2: Persona Moral (Company) - 12 character RFC
INSERT INTO vendors (id, rfc, business_name, address, contact_info, created_at, updated_at)
VALUES (
    'vendor-002-uuid',
    'XYZ987654321',
    'Distribuidora Nacional de México S.A.',
    'Blvd. Manuel Ávila Camacho 36, Lomas de Chapultepec, CDMX, 11000',
    'Tel: 55 9876 5432, Email: ventas@distnalmex.com.mx',
    datetime('now'),
    datetime('now')
);

-- Vendor 3: Persona Física (Individual) - 13 character RFC
INSERT INTO vendors (id, rfc, business_name, address, contact_info, created_at, updated_at)
VALUES (
    'vendor-003-uuid',
    'GARO850101ABC',
    'García Rodríguez Consulting',
    'Calle Reforma 789, Col. Juárez, CDMX, 06600',
    'Tel: 55 5555 1234, Email: garcia@consulting.mx',
    datetime('now'),
    datetime('now')
);

-- Vendor 4: Persona Moral (Company) - 12 character RFC
INSERT INTO vendors (id, rfc, business_name, address, contact_info, created_at, updated_at)
VALUES (
    'vendor-004-uuid',
    'SUM456789012',
    'Suministros Industriales del Norte S.A.',
    'Av. Universidad 500, San Nicolás de los Garza, NL, 66450',
    'Tel: 81 8765 4321, Email: pedidos@suministrosnorte.mx',
    datetime('now'),
    datetime('now')
);

-- ============================================================================
-- T005.3.2: Test Invoices
-- Sample invoices in various processing states
-- ============================================================================

-- Invoice 1: UPLOADED state (just received, not processed)
INSERT INTO invoices (
    id, vendor_id, invoice_number, invoice_date,
    subtotal, iva_amount, total, state, source_type, pdf_path,
    duplicate_hash, created_at, updated_at
)
VALUES (
    'invoice-001-uuid',
    'vendor-001-uuid',
    'FAC-2025-0001',
    '2025-01-15',
    10000.00,
    1600.00,
    11600.00,
    'UPLOADED',
    'text_based',
    '/invoices/2025/01/fac-2025-0001.pdf',
    'sha256-hash-001',
    datetime('now'),
    datetime('now')
);

-- Invoice 2: EXTRACTED state (AI has processed)
INSERT INTO invoices (
    id, vendor_id, invoice_number, invoice_date,
    subtotal, iva_amount, total, state, source_type, pdf_path,
    duplicate_hash, created_at, updated_at
)
VALUES (
    'invoice-002-uuid',
    'vendor-002-uuid',
    'A-12345',
    '2025-01-16',
    25000.00,
    4000.00,
    29000.00,
    'EXTRACTED',
    'text_based',
    '/invoices/2025/01/a-12345.pdf',
    'sha256-hash-002',
    datetime('now'),
    datetime('now')
);

-- Invoice 3: VALIDATED state (user has verified)
INSERT INTO invoices (
    id, vendor_id, invoice_number, invoice_date,
    subtotal, iva_amount, total, state, source_type, pdf_path,
    duplicate_hash, created_at, updated_at
)
VALUES (
    'invoice-003-uuid',
    'vendor-003-uuid',
    'CONS-2025-001',
    '2025-01-17',
    15000.00,
    2400.00,
    17400.00,
    'VALIDATED',
    'scanned',
    '/invoices/2025/01/cons-2025-001.pdf',
    'sha256-hash-003',
    datetime('now'),
    datetime('now')
);

-- Invoice 4: POSTED state (sent to ContPAQi)
INSERT INTO invoices (
    id, vendor_id, invoice_number, invoice_date,
    subtotal, iva_amount, total, state, source_type, pdf_path,
    duplicate_hash, created_at, updated_at
)
VALUES (
    'invoice-004-uuid',
    'vendor-004-uuid',
    'SUM-00789',
    '2025-01-18',
    50000.00,
    8000.00,
    58000.00,
    'POSTED',
    'text_based',
    '/invoices/2025/01/sum-00789.pdf',
    'sha256-hash-004',
    datetime('now'),
    datetime('now')
);

-- ============================================================================
-- Sample Line Items (for Invoice 2 - EXTRACTED state)
-- ============================================================================

INSERT INTO line_items (id, invoice_id, description, quantity, unit_price, amount, line_order, created_at)
VALUES ('item-001-uuid', 'invoice-002-uuid', 'Servicio de consultoría técnica', 40.0, 500.00, 20000.00, 1, datetime('now'));

INSERT INTO line_items (id, invoice_id, description, quantity, unit_price, amount, line_order, created_at)
VALUES ('item-002-uuid', 'invoice-002-uuid', 'Materiales de oficina', 10.0, 500.00, 5000.00, 2, datetime('now'));

-- ============================================================================
-- Sample Extraction Results (for Invoice 2 - EXTRACTED state)
-- ============================================================================

INSERT INTO extraction_results (id, invoice_id, field_name, extracted_value, confidence, bbox_x, bbox_y, bbox_width, bbox_height, user_verified, created_at)
VALUES ('extract-001-uuid', 'invoice-002-uuid', 'vendor_rfc', 'XYZ987654321', 98.5, 100, 50, 150, 20, 0, datetime('now'));

INSERT INTO extraction_results (id, invoice_id, field_name, extracted_value, confidence, bbox_x, bbox_y, bbox_width, bbox_height, user_verified, created_at)
VALUES ('extract-002-uuid', 'invoice-002-uuid', 'vendor_name', 'Distribuidora Nacional de México S.A.', 95.2, 100, 80, 300, 20, 0, datetime('now'));

INSERT INTO extraction_results (id, invoice_id, field_name, extracted_value, confidence, bbox_x, bbox_y, bbox_width, bbox_height, user_verified, created_at)
VALUES ('extract-003-uuid', 'invoice-002-uuid', 'invoice_number', 'A-12345', 99.1, 400, 50, 100, 20, 0, datetime('now'));

INSERT INTO extraction_results (id, invoice_id, field_name, extracted_value, confidence, bbox_x, bbox_y, bbox_width, bbox_height, user_verified, created_at)
VALUES ('extract-004-uuid', 'invoice-002-uuid', 'total', '29000.00', 97.8, 400, 500, 100, 20, 0, datetime('now'));

-- ============================================================================
-- Sample ContPAQi Entry (for Invoice 4 - POSTED state)
-- ============================================================================

INSERT INTO contpaqi_entries (id, invoice_id, folio_number, entry_date, posting_status, error_message, created_at)
VALUES ('entry-001-uuid', 'invoice-004-uuid', 'CONTPAQI-2025-0123', '2025-01-18', 'success', NULL, datetime('now'));
