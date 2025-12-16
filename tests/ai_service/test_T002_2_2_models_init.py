"""
Test T002.2.2 - Verify ai-service/src/models/__init__.py exists and is properly configured

This test verifies that the models package __init__.py exists in the ai-service/src directory
and contains proper package initialization for data models.
"""

import os
import pytest

# Base path for the project
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
AI_SERVICE_PATH = os.path.join(PROJECT_ROOT, "ai-service")


class TestModelsInit:
    """Test cases for T002.2.2 - models/__init__.py configuration"""

    def test_models_directory_exists(self):
        """Verify that models/ directory exists in ai-service/src"""
        models_path = os.path.join(AI_SERVICE_PATH, "src", "models")
        assert os.path.isdir(models_path), f"models/ directory should exist at {models_path}"

    def test_models_init_py_exists(self):
        """Verify that models/__init__.py file exists"""
        init_path = os.path.join(AI_SERVICE_PATH, "src", "models", "__init__.py")
        assert os.path.isfile(init_path), f"models/__init__.py should exist at {init_path}"

    def test_models_init_has_docstring(self):
        """Verify that models/__init__.py has a module docstring"""
        init_path = os.path.join(AI_SERVICE_PATH, "src", "models", "__init__.py")
        with open(init_path, 'r') as f:
            content = f.read()

        # Check for docstring (starts with triple quotes)
        assert '"""' in content or "'''" in content, "models/__init__.py should have a docstring"

    def test_models_init_describes_purpose(self):
        """Verify that models/__init__.py docstring describes its purpose"""
        init_path = os.path.join(AI_SERVICE_PATH, "src", "models", "__init__.py")
        with open(init_path, 'r') as f:
            content = f.read().lower()

        # Check that the docstring mentions models, data structures, or Pydantic
        keywords = ["model", "pydantic", "data", "schema", "structure"]
        has_description = any(keyword in content for keyword in keywords)
        assert has_description, "models/__init__.py should describe its purpose (models/data structures)"

    def test_models_is_valid_python(self):
        """Verify that models/__init__.py is valid Python code"""
        init_path = os.path.join(AI_SERVICE_PATH, "src", "models", "__init__.py")
        with open(init_path, 'r') as f:
            content = f.read()

        # Try to compile it to check for syntax errors
        try:
            compile(content, init_path, 'exec')
            is_valid = True
        except SyntaxError:
            is_valid = False

        assert is_valid, "models/__init__.py should be valid Python code"

    def test_models_defines_all_exports(self):
        """Verify that models/__init__.py defines __all__ for explicit exports"""
        init_path = os.path.join(AI_SERVICE_PATH, "src", "models", "__init__.py")
        with open(init_path, 'r') as f:
            content = f.read()

        assert "__all__" in content, "models/__init__.py should define __all__ for explicit exports"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
