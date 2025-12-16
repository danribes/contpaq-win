"""
Test Suite: T002.4.6 - Create ai-service/tests/integration/__init__.py
Tests verify that the integration tests directory exists with proper structure.
"""

import os
import ast
import pytest

# Path to integration tests directory
INTEGRATION_DIR = os.path.join(
    os.path.dirname(__file__),
    "..",
    "..",
    "ai-service",
    "tests",
    "integration",
)


class TestIntegrationDirectory:
    """Test suite for integration tests directory existence and structure."""

    def test_integration_directory_exists(self):
        """Test that integration directory exists in ai-service/tests/."""
        assert os.path.isdir(INTEGRATION_DIR), (
            f"integration directory not found at {INTEGRATION_DIR}"
        )

    def test_integration_has_init_file(self):
        """Test that integration directory has __init__.py file."""
        init_path = os.path.join(INTEGRATION_DIR, "__init__.py")
        assert os.path.isfile(init_path), (
            "__init__.py not found in integration directory"
        )

    def test_integration_init_is_valid_python(self):
        """Test that integration/__init__.py is valid Python syntax."""
        init_path = os.path.join(INTEGRATION_DIR, "__init__.py")
        with open(init_path, "r", encoding="utf-8") as f:
            content = f.read()
        # This will raise SyntaxError if invalid
        ast.parse(content)

    def test_integration_init_has_docstring(self):
        """Test that integration/__init__.py has a module docstring."""
        init_path = os.path.join(INTEGRATION_DIR, "__init__.py")
        with open(init_path, "r", encoding="utf-8") as f:
            content = f.read()
        tree = ast.parse(content)
        assert ast.get_docstring(tree) is not None, (
            "integration/__init__.py must have a module docstring"
        )

    def test_integration_dir_is_python_package(self):
        """Test that integration directory is importable as a Python package."""
        init_path = os.path.join(INTEGRATION_DIR, "__init__.py")
        assert os.path.isfile(init_path), (
            "integration must be a Python package (needs __init__.py)"
        )
