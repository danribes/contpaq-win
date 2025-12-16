"""
Test T002.1.1 - Verify ai-service/pyproject.toml exists and contains required metadata

This test verifies that pyproject.toml exists in the ai-service directory
and contains proper project metadata for the Python AI service.
"""

import os
import pytest

# Base path for the project
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
AI_SERVICE_PATH = os.path.join(PROJECT_ROOT, "ai-service")


class TestPyprojectToml:
    """Test cases for T002.1.1 - pyproject.toml configuration"""

    def test_pyproject_toml_exists(self):
        """Verify that pyproject.toml file exists in ai-service directory"""
        pyproject_path = os.path.join(AI_SERVICE_PATH, "pyproject.toml")
        assert os.path.isfile(pyproject_path), f"pyproject.toml should exist at {pyproject_path}"

    def test_pyproject_has_project_section(self):
        """Verify that pyproject.toml has [project] section"""
        pyproject_path = os.path.join(AI_SERVICE_PATH, "pyproject.toml")
        with open(pyproject_path, 'r') as f:
            content = f.read()

        assert "[project]" in content, "pyproject.toml should have [project] section"

    def test_pyproject_has_project_name(self):
        """Verify that pyproject.toml has project name"""
        pyproject_path = os.path.join(AI_SERVICE_PATH, "pyproject.toml")
        with open(pyproject_path, 'r') as f:
            content = f.read()

        assert 'name = ' in content, "pyproject.toml should have project name"
        assert 'contpaq-win-ai-service' in content.lower() or 'ai-service' in content.lower(), \
            "pyproject.toml should have appropriate project name"

    def test_pyproject_has_version(self):
        """Verify that pyproject.toml has version"""
        pyproject_path = os.path.join(AI_SERVICE_PATH, "pyproject.toml")
        with open(pyproject_path, 'r') as f:
            content = f.read()

        assert 'version = ' in content, "pyproject.toml should have version field"

    def test_pyproject_has_python_version(self):
        """Verify that pyproject.toml specifies Python version requirement"""
        pyproject_path = os.path.join(AI_SERVICE_PATH, "pyproject.toml")
        with open(pyproject_path, 'r') as f:
            content = f.read()

        assert 'requires-python' in content or 'python_requires' in content, \
            "pyproject.toml should specify Python version requirement"

    def test_pyproject_has_description(self):
        """Verify that pyproject.toml has project description"""
        pyproject_path = os.path.join(AI_SERVICE_PATH, "pyproject.toml")
        with open(pyproject_path, 'r') as f:
            content = f.read()

        assert 'description = ' in content, "pyproject.toml should have description field"

    def test_pyproject_has_build_system(self):
        """Verify that pyproject.toml has [build-system] section"""
        pyproject_path = os.path.join(AI_SERVICE_PATH, "pyproject.toml")
        with open(pyproject_path, 'r') as f:
            content = f.read()

        assert "[build-system]" in content, "pyproject.toml should have [build-system] section"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
