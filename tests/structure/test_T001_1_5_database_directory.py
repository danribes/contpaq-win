"""
Test T001.1.5 - Verify database directory structure

This test verifies that the database directory structure is created correctly
with the required subdirectories: migrations/ and seed/
"""

import os
import pytest

# Base path for the project
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


class TestDatabaseDirectoryStructure:
    """Test cases for T001.1.5 - database directory structure"""

    def test_database_directory_exists(self):
        """Verify that database/ directory exists"""
        database_path = os.path.join(PROJECT_ROOT, "database")
        assert os.path.isdir(database_path), f"database/ directory should exist at {database_path}"

    def test_database_migrations_directory_exists(self):
        """Verify that database/migrations/ directory exists"""
        migrations_path = os.path.join(PROJECT_ROOT, "database", "migrations")
        assert os.path.isdir(migrations_path), f"database/migrations/ directory should exist at {migrations_path}"

    def test_database_seed_directory_exists(self):
        """Verify that database/seed/ directory exists"""
        seed_path = os.path.join(PROJECT_ROOT, "database", "seed")
        assert os.path.isdir(seed_path), f"database/seed/ directory should exist at {seed_path}"

    def test_directory_structure_complete(self):
        """Verify complete directory structure for database"""
        required_dirs = [
            "database",
            "database/migrations",
            "database/seed",
        ]

        missing_dirs = []
        for dir_path in required_dirs:
            full_path = os.path.join(PROJECT_ROOT, dir_path)
            if not os.path.isdir(full_path):
                missing_dirs.append(dir_path)

        assert len(missing_dirs) == 0, f"Missing directories: {missing_dirs}"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
