"""
Test T002.2.1 - Verify ai-service/src/__init__.py exists and is properly configured

This test verifies that the src package __init__.py exists in the ai-service directory
and contains proper package initialization.
"""

import os
import pytest

# Base path for the project
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
AI_SERVICE_PATH = os.path.join(PROJECT_ROOT, "ai-service")


class TestSrcInit:
    """Test cases for T002.2.1 - src/__init__.py configuration"""

    def test_src_directory_exists(self):
        """Verify that src/ directory exists in ai-service"""
        src_path = os.path.join(AI_SERVICE_PATH, "src")
        assert os.path.isdir(src_path), f"src/ directory should exist at {src_path}"

    def test_src_init_py_exists(self):
        """Verify that src/__init__.py file exists"""
        init_path = os.path.join(AI_SERVICE_PATH, "src", "__init__.py")
        assert os.path.isfile(init_path), f"src/__init__.py should exist at {init_path}"

    def test_src_init_has_version(self):
        """Verify that src/__init__.py defines __version__"""
        init_path = os.path.join(AI_SERVICE_PATH, "src", "__init__.py")
        with open(init_path, 'r') as f:
            content = f.read()

        assert "__version__" in content, "src/__init__.py should define __version__"

    def test_src_init_has_docstring(self):
        """Verify that src/__init__.py has a module docstring"""
        init_path = os.path.join(AI_SERVICE_PATH, "src", "__init__.py")
        with open(init_path, 'r') as f:
            content = f.read()

        # Check for docstring (starts with triple quotes)
        assert '"""' in content or "'''" in content, "src/__init__.py should have a docstring"

    def test_src_is_importable_package(self):
        """Verify that src can be recognized as a Python package"""
        init_path = os.path.join(AI_SERVICE_PATH, "src", "__init__.py")
        # A valid __init__.py should be a valid Python file
        with open(init_path, 'r') as f:
            content = f.read()

        # Try to compile it to check for syntax errors
        try:
            compile(content, init_path, 'exec')
            is_valid = True
        except SyntaxError:
            is_valid = False

        assert is_valid, "src/__init__.py should be valid Python code"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
