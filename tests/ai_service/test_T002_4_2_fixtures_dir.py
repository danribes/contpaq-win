"""
Test Suite: T002.4.2 - Create ai-service/tests/fixtures/ directory
Tests verify that the fixtures directory exists with proper structure.
"""

import os
import ast
import pytest

# Path to fixtures directory
FIXTURES_DIR = os.path.join(
    os.path.dirname(__file__),
    "..",
    "..",
    "ai-service",
    "tests",
    "fixtures",
)


class TestFixturesDirectory:
    """Test suite for fixtures directory existence and structure."""

    def test_fixtures_directory_exists(self):
        """Test that fixtures directory exists in ai-service/tests/."""
        assert os.path.isdir(FIXTURES_DIR), (
            f"fixtures directory not found at {FIXTURES_DIR}"
        )

    def test_fixtures_has_init_file(self):
        """Test that fixtures directory has __init__.py file."""
        init_path = os.path.join(FIXTURES_DIR, "__init__.py")
        assert os.path.isfile(init_path), (
            f"__init__.py not found in fixtures directory"
        )

    def test_fixtures_init_is_valid_python(self):
        """Test that fixtures/__init__.py is valid Python syntax."""
        init_path = os.path.join(FIXTURES_DIR, "__init__.py")
        with open(init_path, "r", encoding="utf-8") as f:
            content = f.read()
        # This will raise SyntaxError if invalid
        ast.parse(content)

    def test_fixtures_init_has_docstring(self):
        """Test that fixtures/__init__.py has a module docstring."""
        init_path = os.path.join(FIXTURES_DIR, "__init__.py")
        with open(init_path, "r", encoding="utf-8") as f:
            content = f.read()
        tree = ast.parse(content)
        assert ast.get_docstring(tree) is not None, (
            "fixtures/__init__.py must have a module docstring"
        )

    def test_fixtures_dir_is_python_package(self):
        """Test that fixtures directory is importable as a Python package."""
        # Verify __init__.py makes it a package
        init_path = os.path.join(FIXTURES_DIR, "__init__.py")
        assert os.path.isfile(init_path), (
            "fixtures must be a Python package (needs __init__.py)"
        )
