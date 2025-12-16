"""
Test T002.2.3 - Verify ai-service/src/services/__init__.py exists and is properly configured

This test verifies that the services package __init__.py exists in the ai-service/src directory
and contains proper package initialization for business logic services.
"""

import os
import pytest

# Base path for the project
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
AI_SERVICE_PATH = os.path.join(PROJECT_ROOT, "ai-service")


class TestServicesInit:
    """Test cases for T002.2.3 - services/__init__.py configuration"""

    def test_services_directory_exists(self):
        """Verify that services/ directory exists in ai-service/src"""
        services_path = os.path.join(AI_SERVICE_PATH, "src", "services")
        assert os.path.isdir(services_path), f"services/ directory should exist at {services_path}"

    def test_services_init_py_exists(self):
        """Verify that services/__init__.py file exists"""
        init_path = os.path.join(AI_SERVICE_PATH, "src", "services", "__init__.py")
        assert os.path.isfile(init_path), f"services/__init__.py should exist at {init_path}"

    def test_services_init_has_docstring(self):
        """Verify that services/__init__.py has a module docstring"""
        init_path = os.path.join(AI_SERVICE_PATH, "src", "services", "__init__.py")
        with open(init_path, 'r') as f:
            content = f.read()

        # Check for docstring (starts with triple quotes)
        assert '"""' in content or "'''" in content, "services/__init__.py should have a docstring"

    def test_services_init_describes_purpose(self):
        """Verify that services/__init__.py docstring describes its purpose"""
        init_path = os.path.join(AI_SERVICE_PATH, "src", "services", "__init__.py")
        with open(init_path, 'r') as f:
            content = f.read().lower()

        # Check that the docstring mentions services, business logic, or processing
        keywords = ["service", "business", "logic", "processing", "extraction", "ocr", "pdf"]
        has_description = any(keyword in content for keyword in keywords)
        assert has_description, "services/__init__.py should describe its purpose (services/business logic)"

    def test_services_is_valid_python(self):
        """Verify that services/__init__.py is valid Python code"""
        init_path = os.path.join(AI_SERVICE_PATH, "src", "services", "__init__.py")
        with open(init_path, 'r') as f:
            content = f.read()

        # Try to compile it to check for syntax errors
        try:
            compile(content, init_path, 'exec')
            is_valid = True
        except SyntaxError:
            is_valid = False

        assert is_valid, "services/__init__.py should be valid Python code"

    def test_services_defines_all_exports(self):
        """Verify that services/__init__.py defines __all__ for explicit exports"""
        init_path = os.path.join(AI_SERVICE_PATH, "src", "services", "__init__.py")
        with open(init_path, 'r') as f:
            content = f.read()

        assert "__all__" in content, "services/__init__.py should define __all__ for explicit exports"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
