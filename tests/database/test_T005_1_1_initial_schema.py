"""
Tests for T005.1.1: Create database/migrations/001_initial_schema.sql

Verifies that the initial schema migration file exists with valid SQL
structure for SQLite database initialization.
"""

import os
import sqlite3
import tempfile
import pytest

# Path to the migrations directory
MIGRATIONS_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
    "database",
    "migrations"
)

SCHEMA_FILE = os.path.join(MIGRATIONS_PATH, "001_initial_schema.sql")


class TestMigrationFileExists:
    """Tests for migration file existence."""

    def test_migrations_directory_exists(self):
        """T005.1.1: migrations directory should exist."""
        assert os.path.exists(MIGRATIONS_PATH), \
            f"Migrations directory not found at {MIGRATIONS_PATH}"

    def test_schema_file_exists(self):
        """T005.1.1: 001_initial_schema.sql should exist."""
        assert os.path.exists(SCHEMA_FILE), \
            f"Schema file not found at {SCHEMA_FILE}"

    def test_schema_file_not_empty(self):
        """T005.1.1: Schema file should not be empty."""
        if not os.path.exists(SCHEMA_FILE):
            pytest.skip("Schema file not created yet")
        with open(SCHEMA_FILE, 'r', encoding='utf-8') as f:
            content = f.read()
        assert len(content.strip()) > 0, \
            "Schema file should not be empty"


class TestSqlSyntax:
    """Tests for valid SQL syntax."""

    @pytest.fixture
    def schema_content(self):
        """Read schema file content."""
        if not os.path.exists(SCHEMA_FILE):
            pytest.skip("Schema file not created yet")
        with open(SCHEMA_FILE, 'r', encoding='utf-8') as f:
            return f.read()

    @pytest.fixture
    def temp_db(self, schema_content):
        """Create temporary database and execute schema."""
        with tempfile.NamedTemporaryFile(suffix='.db', delete=False) as f:
            db_path = f.name

        try:
            conn = sqlite3.connect(db_path)
            conn.executescript(schema_content)
            conn.close()
            yield db_path
        finally:
            if os.path.exists(db_path):
                os.unlink(db_path)

    def test_sql_is_valid(self, temp_db):
        """T005.1.1: SQL should execute without errors."""
        # If we get here, the SQL executed successfully
        assert os.path.exists(temp_db), "Database should be created"

    def test_has_pragma_foreign_keys(self, schema_content):
        """T005.1.1: Should enable foreign keys."""
        assert 'PRAGMA foreign_keys' in schema_content or 'pragma foreign_keys' in schema_content.lower(), \
            "Should have PRAGMA foreign_keys statement"


class TestTableStructure:
    """Tests for table creation in schema."""

    @pytest.fixture
    def schema_content(self):
        """Read schema file content."""
        if not os.path.exists(SCHEMA_FILE):
            pytest.skip("Schema file not created yet")
        with open(SCHEMA_FILE, 'r', encoding='utf-8') as f:
            return f.read()

    @pytest.fixture
    def db_connection(self, schema_content):
        """Create in-memory database with schema."""
        conn = sqlite3.connect(':memory:')
        conn.executescript(schema_content)
        yield conn
        conn.close()

    def test_has_vendors_table(self, db_connection):
        """T005.1.1: Should create vendors table."""
        cursor = db_connection.execute(
            "SELECT name FROM sqlite_master WHERE type='table' AND name='vendors'"
        )
        result = cursor.fetchone()
        assert result is not None, "vendors table should exist"

    def test_has_invoices_table(self, db_connection):
        """T005.1.1: Should create invoices table."""
        cursor = db_connection.execute(
            "SELECT name FROM sqlite_master WHERE type='table' AND name='invoices'"
        )
        result = cursor.fetchone()
        assert result is not None, "invoices table should exist"

    def test_has_line_items_table(self, db_connection):
        """T005.1.1: Should create line_items table."""
        cursor = db_connection.execute(
            "SELECT name FROM sqlite_master WHERE type='table' AND name='line_items'"
        )
        result = cursor.fetchone()
        assert result is not None, "line_items table should exist"

    def test_has_extraction_results_table(self, db_connection):
        """T005.1.1: Should create extraction_results table."""
        cursor = db_connection.execute(
            "SELECT name FROM sqlite_master WHERE type='table' AND name='extraction_results'"
        )
        result = cursor.fetchone()
        assert result is not None, "extraction_results table should exist"

    def test_has_contpaqi_entries_table(self, db_connection):
        """T005.1.1: Should create contpaqi_entries table."""
        cursor = db_connection.execute(
            "SELECT name FROM sqlite_master WHERE type='table' AND name='contpaqi_entries'"
        )
        result = cursor.fetchone()
        assert result is not None, "contpaqi_entries table should exist"


class TestSchemaComments:
    """Tests for schema documentation."""

    @pytest.fixture
    def schema_content(self):
        """Read schema file content."""
        if not os.path.exists(SCHEMA_FILE):
            pytest.skip("Schema file not created yet")
        with open(SCHEMA_FILE, 'r', encoding='utf-8') as f:
            return f.read()

    def test_has_header_comment(self, schema_content):
        """T005.1.1: Should have descriptive header comment."""
        has_comment = '--' in schema_content or '/*' in schema_content
        assert has_comment, "Schema should have SQL comments for documentation"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
