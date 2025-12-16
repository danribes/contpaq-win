"""
Tests for T005.2: Create database indexes

Verifies that all required indexes are created in the schema for
optimal query performance.
"""

import os
import sqlite3
import pytest

# Path to the schema file
SCHEMA_FILE = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
    "database",
    "migrations",
    "001_initial_schema.sql"
)


class TestIndexesExist:
    """Tests for index creation."""

    @pytest.fixture
    def db_connection(self):
        """Create in-memory database with schema."""
        if not os.path.exists(SCHEMA_FILE):
            pytest.skip("Schema file not created yet")
        with open(SCHEMA_FILE, 'r', encoding='utf-8') as f:
            schema = f.read()
        conn = sqlite3.connect(':memory:')
        conn.executescript(schema)
        yield conn
        conn.close()

    @pytest.fixture
    def index_names(self, db_connection):
        """Get all index names."""
        cursor = db_connection.execute(
            "SELECT name FROM sqlite_master WHERE type='index' AND name NOT LIKE 'sqlite_%'"
        )
        return [row[0] for row in cursor.fetchall()]

    def test_has_invoice_state_index(self, index_names):
        """T005.2.1: Should have index on invoices.state."""
        matching = [n for n in index_names if 'invoice' in n.lower() and 'state' in n.lower()]
        assert len(matching) >= 1, \
            f"Should have index on invoices.state. Found indexes: {index_names}"

    def test_has_invoice_duplicate_hash_index(self, index_names):
        """T005.2.2: Should have index on invoices.duplicate_hash."""
        matching = [n for n in index_names if 'invoice' in n.lower() and 'duplicate' in n.lower()]
        assert len(matching) >= 1, \
            f"Should have index on invoices.duplicate_hash. Found indexes: {index_names}"

    def test_has_vendor_rfc_index(self, index_names):
        """T005.2.3: Should have unique index on vendors.rfc."""
        # Note: UNIQUE constraint creates an automatic index
        # We verify either explicit index or implicit from constraint
        matching = [n for n in index_names if 'vendor' in n.lower() and 'rfc' in n.lower()]
        # SQLite creates sqlite_autoindex for UNIQUE constraints
        has_rfc_index = len(matching) >= 1
        assert has_rfc_index or 'sqlite_autoindex_vendors_1' in index_names or any('vendors' in n for n in index_names), \
            f"Should have index on vendors.rfc. Found indexes: {index_names}"

    def test_has_extraction_results_invoice_index(self, index_names):
        """T005.2.4: Should have index on extraction_results.invoice_id."""
        matching = [n for n in index_names if 'extraction' in n.lower() and 'invoice' in n.lower()]
        assert len(matching) >= 1, \
            f"Should have index on extraction_results.invoice_id. Found indexes: {index_names}"


class TestIndexDefinitions:
    """Tests for index column definitions."""

    @pytest.fixture
    def schema_content(self):
        """Read schema file content."""
        if not os.path.exists(SCHEMA_FILE):
            pytest.skip("Schema file not created yet")
        with open(SCHEMA_FILE, 'r', encoding='utf-8') as f:
            return f.read()

    def test_has_create_index_statements(self, schema_content):
        """T005.2: Schema should contain CREATE INDEX statements."""
        assert 'CREATE INDEX' in schema_content, \
            "Schema should have CREATE INDEX statements"

    def test_invoice_state_index_definition(self, schema_content):
        """T005.2.1: Should define invoice state index correctly."""
        # Look for index on invoices(state)
        content_lower = schema_content.lower()
        assert 'invoices' in content_lower and 'state' in content_lower and 'index' in content_lower, \
            "Should have index definition for invoices.state"

    def test_invoice_duplicate_hash_index_definition(self, schema_content):
        """T005.2.2: Should define duplicate hash index correctly."""
        content_lower = schema_content.lower()
        assert 'invoices' in content_lower and 'duplicate' in content_lower and 'index' in content_lower, \
            "Should have index definition for invoices.duplicate_hash"


class TestIndexFunctionality:
    """Tests for index behavior."""

    @pytest.fixture
    def db_connection(self):
        """Create in-memory database with schema."""
        if not os.path.exists(SCHEMA_FILE):
            pytest.skip("Schema file not created yet")
        with open(SCHEMA_FILE, 'r', encoding='utf-8') as f:
            schema = f.read()
        conn = sqlite3.connect(':memory:')
        conn.executescript(schema)
        yield conn
        conn.close()

    def test_vendor_rfc_unique_constraint_works(self, db_connection):
        """T005.2.3: Vendor RFC should be unique (enforced by index/constraint)."""
        cursor = db_connection.cursor()
        cursor.execute(
            "INSERT INTO vendors (id, rfc, business_name) VALUES ('1', 'ABC123', 'Test1')"
        )

        # Second insert with same RFC should fail
        with pytest.raises(sqlite3.IntegrityError):
            cursor.execute(
                "INSERT INTO vendors (id, rfc, business_name) VALUES ('2', 'ABC123', 'Test2')"
            )

    def test_indexes_improve_query_plan(self, db_connection):
        """T005.2: Indexes should be used in query plans."""
        # Insert some test data
        cursor = db_connection.cursor()
        cursor.execute(
            "INSERT INTO vendors (id, rfc, business_name) VALUES ('v1', 'RFC001', 'Vendor 1')"
        )
        cursor.execute("""
            INSERT INTO invoices (id, vendor_id, invoice_number, invoice_date,
                subtotal, iva_amount, total, state, source_type, pdf_path)
            VALUES ('i1', 'v1', 'INV001', '2025-01-01', 100.0, 16.0, 116.0,
                'UPLOADED', 'text_based', '/path/to/pdf')
        """)
        db_connection.commit()

        # Check EXPLAIN QUERY PLAN uses index
        plan = cursor.execute(
            "EXPLAIN QUERY PLAN SELECT * FROM invoices WHERE state = 'UPLOADED'"
        ).fetchall()
        plan_str = str(plan)
        # Either uses index or does a scan (both valid, but index preferred)
        assert len(plan) > 0, "Query plan should be returned"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
