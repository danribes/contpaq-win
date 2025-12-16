"""
Tests for T005.3: Create seed data

Verifies that seed data SQL files exist and contain valid test data
for development and testing purposes.
"""

import os
import sqlite3
import pytest

# Paths
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
MIGRATIONS_PATH = os.path.join(PROJECT_ROOT, "database", "migrations")
SEED_PATH = os.path.join(PROJECT_ROOT, "database", "seed")
SCHEMA_FILE = os.path.join(MIGRATIONS_PATH, "001_initial_schema.sql")
SEED_FILE = os.path.join(SEED_PATH, "sample_data.sql")


class TestSeedDirectoryExists:
    """Tests for seed directory existence."""

    def test_seed_directory_exists(self):
        """T005.3: seed directory should exist."""
        assert os.path.exists(SEED_PATH), \
            f"Seed directory not found at {SEED_PATH}"

    def test_sample_data_file_exists(self):
        """T005.3.1: sample_data.sql should exist."""
        assert os.path.exists(SEED_FILE), \
            f"sample_data.sql not found at {SEED_FILE}"


class TestSeedFileContent:
    """Tests for seed file content."""

    @pytest.fixture
    def seed_content(self):
        """Read seed file content."""
        if not os.path.exists(SEED_FILE):
            pytest.skip("Seed file not created yet")
        with open(SEED_FILE, 'r', encoding='utf-8') as f:
            return f.read()

    def test_seed_file_not_empty(self, seed_content):
        """T005.3: Seed file should not be empty."""
        assert len(seed_content.strip()) > 0, \
            "Seed file should not be empty"

    def test_has_vendor_inserts(self, seed_content):
        """T005.3.1: Should have INSERT statements for vendors."""
        content_lower = seed_content.lower()
        assert 'insert' in content_lower and 'vendors' in content_lower, \
            "Should have INSERT statements for vendors table"

    def test_has_invoice_inserts(self, seed_content):
        """T005.3.2: Should have INSERT statements for invoices."""
        content_lower = seed_content.lower()
        assert 'insert' in content_lower and 'invoices' in content_lower, \
            "Should have INSERT statements for invoices table"


class TestSeedDataValidity:
    """Tests for seed data validity when executed."""

    @pytest.fixture
    def db_with_seed(self):
        """Create database with schema and seed data."""
        if not os.path.exists(SCHEMA_FILE):
            pytest.skip("Schema file not created yet")
        if not os.path.exists(SEED_FILE):
            pytest.skip("Seed file not created yet")

        with open(SCHEMA_FILE, 'r', encoding='utf-8') as f:
            schema = f.read()
        with open(SEED_FILE, 'r', encoding='utf-8') as f:
            seed = f.read()

        conn = sqlite3.connect(':memory:')
        conn.executescript(schema)
        conn.executescript(seed)
        yield conn
        conn.close()

    def test_seed_executes_without_error(self, db_with_seed):
        """T005.3: Seed data should execute without errors."""
        # If we get here, the seed executed successfully
        assert db_with_seed is not None

    def test_has_test_vendors(self, db_with_seed):
        """T005.3.1: Should have test vendors in database."""
        cursor = db_with_seed.execute("SELECT COUNT(*) FROM vendors")
        count = cursor.fetchone()[0]
        assert count >= 1, "Should have at least one test vendor"

    def test_has_test_invoices(self, db_with_seed):
        """T005.3.2: Should have test invoices in database."""
        cursor = db_with_seed.execute("SELECT COUNT(*) FROM invoices")
        count = cursor.fetchone()[0]
        assert count >= 1, "Should have at least one test invoice"

    def test_vendors_have_valid_rfc(self, db_with_seed):
        """T005.3.1: Vendors should have valid RFC format."""
        cursor = db_with_seed.execute("SELECT rfc FROM vendors")
        for (rfc,) in cursor:
            assert len(rfc) >= 12 and len(rfc) <= 13, \
                f"RFC should be 12-13 characters, got: {rfc}"

    def test_invoices_have_valid_state(self, db_with_seed):
        """T005.3.2: Invoices should have valid state."""
        valid_states = {'UPLOADED', 'EXTRACTED', 'VALIDATED', 'POSTED'}
        cursor = db_with_seed.execute("SELECT state FROM invoices")
        for (state,) in cursor:
            assert state in valid_states, \
                f"Invalid state: {state}"


class TestSeedDataRelationships:
    """Tests for seed data relationships."""

    @pytest.fixture
    def db_with_seed(self):
        """Create database with schema and seed data."""
        if not os.path.exists(SCHEMA_FILE):
            pytest.skip("Schema file not created yet")
        if not os.path.exists(SEED_FILE):
            pytest.skip("Seed file not created yet")

        with open(SCHEMA_FILE, 'r', encoding='utf-8') as f:
            schema = f.read()
        with open(SEED_FILE, 'r', encoding='utf-8') as f:
            seed = f.read()

        conn = sqlite3.connect(':memory:')
        conn.executescript(schema)
        conn.executescript(seed)
        yield conn
        conn.close()

    def test_invoice_vendor_relationship(self, db_with_seed):
        """T005.3: Invoice vendor_id should reference valid vendor."""
        cursor = db_with_seed.execute("""
            SELECT COUNT(*) FROM invoices i
            WHERE i.vendor_id IS NOT NULL
            AND NOT EXISTS (SELECT 1 FROM vendors v WHERE v.id = i.vendor_id)
        """)
        orphan_count = cursor.fetchone()[0]
        assert orphan_count == 0, \
            "All invoice vendor_ids should reference existing vendors"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
