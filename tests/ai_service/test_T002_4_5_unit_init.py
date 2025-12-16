"""
Test Suite: T002.4.5 - Create ai-service/tests/unit/__init__.py
Tests verify that the unit tests directory exists with proper structure.
"""

import os
import ast
import pytest

# Path to unit tests directory
UNIT_DIR = os.path.join(
    os.path.dirname(__file__),
    "..",
    "..",
    "ai-service",
    "tests",
    "unit",
)


class TestUnitDirectory:
    """Test suite for unit tests directory existence and structure."""

    def test_unit_directory_exists(self):
        """Test that unit directory exists in ai-service/tests/."""
        assert os.path.isdir(UNIT_DIR), (
            f"unit directory not found at {UNIT_DIR}"
        )

    def test_unit_has_init_file(self):
        """Test that unit directory has __init__.py file."""
        init_path = os.path.join(UNIT_DIR, "__init__.py")
        assert os.path.isfile(init_path), (
            "__init__.py not found in unit directory"
        )

    def test_unit_init_is_valid_python(self):
        """Test that unit/__init__.py is valid Python syntax."""
        init_path = os.path.join(UNIT_DIR, "__init__.py")
        with open(init_path, "r", encoding="utf-8") as f:
            content = f.read()
        # This will raise SyntaxError if invalid
        ast.parse(content)

    def test_unit_init_has_docstring(self):
        """Test that unit/__init__.py has a module docstring."""
        init_path = os.path.join(UNIT_DIR, "__init__.py")
        with open(init_path, "r", encoding="utf-8") as f:
            content = f.read()
        tree = ast.parse(content)
        assert ast.get_docstring(tree) is not None, (
            "unit/__init__.py must have a module docstring"
        )

    def test_unit_dir_is_python_package(self):
        """Test that unit directory is importable as a Python package."""
        init_path = os.path.join(UNIT_DIR, "__init__.py")
        assert os.path.isfile(init_path), (
            "unit must be a Python package (needs __init__.py)"
        )
