"""
Test T002.2.4 - Verify ai-service/src/api/__init__.py exists and is properly configured

This test verifies that the api package __init__.py exists in the ai-service/src directory
and contains proper package initialization for HTTP API endpoints.
"""

import os
import pytest

# Base path for the project
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
AI_SERVICE_PATH = os.path.join(PROJECT_ROOT, "ai-service")


class TestApiInit:
    """Test cases for T002.2.4 - api/__init__.py configuration"""

    def test_api_directory_exists(self):
        """Verify that api/ directory exists in ai-service/src"""
        api_path = os.path.join(AI_SERVICE_PATH, "src", "api")
        assert os.path.isdir(api_path), f"api/ directory should exist at {api_path}"

    def test_api_init_py_exists(self):
        """Verify that api/__init__.py file exists"""
        init_path = os.path.join(AI_SERVICE_PATH, "src", "api", "__init__.py")
        assert os.path.isfile(init_path), f"api/__init__.py should exist at {init_path}"

    def test_api_init_has_docstring(self):
        """Verify that api/__init__.py has a module docstring"""
        init_path = os.path.join(AI_SERVICE_PATH, "src", "api", "__init__.py")
        with open(init_path, 'r') as f:
            content = f.read()

        # Check for docstring (starts with triple quotes)
        assert '"""' in content or "'''" in content, "api/__init__.py should have a docstring"

    def test_api_init_describes_purpose(self):
        """Verify that api/__init__.py docstring describes its purpose"""
        init_path = os.path.join(AI_SERVICE_PATH, "src", "api", "__init__.py")
        with open(init_path, 'r') as f:
            content = f.read().lower()

        # Check that the docstring mentions API, endpoints, routes, or HTTP
        keywords = ["api", "endpoint", "route", "http", "rest", "fastapi"]
        has_description = any(keyword in content for keyword in keywords)
        assert has_description, "api/__init__.py should describe its purpose (API/endpoints/routes)"

    def test_api_is_valid_python(self):
        """Verify that api/__init__.py is valid Python code"""
        init_path = os.path.join(AI_SERVICE_PATH, "src", "api", "__init__.py")
        with open(init_path, 'r') as f:
            content = f.read()

        # Try to compile it to check for syntax errors
        try:
            compile(content, init_path, 'exec')
            is_valid = True
        except SyntaxError:
            is_valid = False

        assert is_valid, "api/__init__.py should be valid Python code"

    def test_api_defines_all_exports(self):
        """Verify that api/__init__.py defines __all__ for explicit exports"""
        init_path = os.path.join(AI_SERVICE_PATH, "src", "api", "__init__.py")
        with open(init_path, 'r') as f:
            content = f.read()

        assert "__all__" in content, "api/__init__.py should define __all__ for explicit exports"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
