"""
Test Suite: T002.4.1 - Create ai-service/tests/conftest.py with pytest fixtures
Tests verify that conftest.py exists and contains required pytest fixtures.
"""

import os
import ast
import pytest

# Path to conftest.py
CONFTEST_PATH = os.path.join(
    os.path.dirname(__file__),
    "..",
    "..",
    "ai-service",
    "tests",
    "conftest.py",
)


class TestConftest:
    """Test suite for conftest.py existence and structure."""

    def test_conftest_exists(self):
        """Test that conftest.py file exists in ai-service/tests/."""
        assert os.path.isfile(CONFTEST_PATH), (
            f"conftest.py not found at {CONFTEST_PATH}"
        )

    def test_conftest_is_valid_python(self):
        """Test that conftest.py is valid Python syntax."""
        with open(CONFTEST_PATH, "r", encoding="utf-8") as f:
            content = f.read()
        # This will raise SyntaxError if invalid
        ast.parse(content)

    def test_conftest_imports_pytest(self):
        """Test that conftest.py imports pytest."""
        with open(CONFTEST_PATH, "r", encoding="utf-8") as f:
            content = f.read()
        assert "import pytest" in content or "from pytest" in content, (
            "conftest.py must import pytest"
        )

    def test_conftest_has_test_settings_fixture(self):
        """Test that conftest.py defines a test_settings fixture."""
        with open(CONFTEST_PATH, "r", encoding="utf-8") as f:
            content = f.read()
        assert "@pytest.fixture" in content, (
            "conftest.py must contain at least one @pytest.fixture"
        )
        assert "def test_settings" in content, (
            "conftest.py must define test_settings fixture"
        )

    def test_conftest_has_temp_env_file_fixture(self):
        """Test that conftest.py defines a temp_env_file fixture for testing."""
        with open(CONFTEST_PATH, "r", encoding="utf-8") as f:
            content = f.read()
        assert "def temp_env_file" in content, (
            "conftest.py must define temp_env_file fixture"
        )

    def test_conftest_has_sample_pdf_path_fixture(self):
        """Test that conftest.py defines a sample_pdf_path fixture."""
        with open(CONFTEST_PATH, "r", encoding="utf-8") as f:
            content = f.read()
        assert "def sample_pdf_path" in content, (
            "conftest.py must define sample_pdf_path fixture"
        )

    def test_conftest_has_docstring(self):
        """Test that conftest.py has a module docstring."""
        with open(CONFTEST_PATH, "r", encoding="utf-8") as f:
            content = f.read()
        tree = ast.parse(content)
        assert ast.get_docstring(tree) is not None, (
            "conftest.py must have a module docstring"
        )

    def test_conftest_fixtures_directory_constant(self):
        """Test that conftest.py defines FIXTURES_DIR constant."""
        with open(CONFTEST_PATH, "r", encoding="utf-8") as f:
            content = f.read()
        assert "FIXTURES_DIR" in content, (
            "conftest.py must define FIXTURES_DIR constant"
        )
