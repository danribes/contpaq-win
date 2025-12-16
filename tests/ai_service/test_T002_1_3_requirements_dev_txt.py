"""
Test T002.1.3 - Verify ai-service/requirements-dev.txt exists and contains required dev dependencies

This test verifies that requirements-dev.txt exists in the ai-service directory
and contains all development dependencies specified in the task.
"""

import os
import pytest

# Base path for the project
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
AI_SERVICE_PATH = os.path.join(PROJECT_ROOT, "ai-service")


class TestRequirementsDevTxt:
    """Test cases for T002.1.3 - requirements-dev.txt configuration"""

    def test_requirements_dev_txt_exists(self):
        """Verify that requirements-dev.txt file exists in ai-service directory"""
        requirements_path = os.path.join(AI_SERVICE_PATH, "requirements-dev.txt")
        assert os.path.isfile(requirements_path), f"requirements-dev.txt should exist at {requirements_path}"

    def test_requirements_dev_has_pytest(self):
        """Verify that requirements-dev.txt contains pytest"""
        requirements_path = os.path.join(AI_SERVICE_PATH, "requirements-dev.txt")
        with open(requirements_path, 'r') as f:
            content = f.read().lower()

        assert "pytest" in content, "requirements-dev.txt should contain pytest"

    def test_requirements_dev_has_pytest_asyncio(self):
        """Verify that requirements-dev.txt contains pytest-asyncio"""
        requirements_path = os.path.join(AI_SERVICE_PATH, "requirements-dev.txt")
        with open(requirements_path, 'r') as f:
            content = f.read().lower()

        assert "pytest-asyncio" in content, "requirements-dev.txt should contain pytest-asyncio"

    def test_requirements_dev_has_pytest_cov(self):
        """Verify that requirements-dev.txt contains pytest-cov"""
        requirements_path = os.path.join(AI_SERVICE_PATH, "requirements-dev.txt")
        with open(requirements_path, 'r') as f:
            content = f.read().lower()

        assert "pytest-cov" in content, "requirements-dev.txt should contain pytest-cov"

    def test_requirements_dev_has_black(self):
        """Verify that requirements-dev.txt contains black"""
        requirements_path = os.path.join(AI_SERVICE_PATH, "requirements-dev.txt")
        with open(requirements_path, 'r') as f:
            content = f.read().lower()

        assert "black" in content, "requirements-dev.txt should contain black"

    def test_requirements_dev_has_ruff(self):
        """Verify that requirements-dev.txt contains ruff"""
        requirements_path = os.path.join(AI_SERVICE_PATH, "requirements-dev.txt")
        with open(requirements_path, 'r') as f:
            content = f.read().lower()

        assert "ruff" in content, "requirements-dev.txt should contain ruff"

    def test_requirements_dev_has_mypy(self):
        """Verify that requirements-dev.txt contains mypy"""
        requirements_path = os.path.join(AI_SERVICE_PATH, "requirements-dev.txt")
        with open(requirements_path, 'r') as f:
            content = f.read().lower()

        assert "mypy" in content, "requirements-dev.txt should contain mypy"

    def test_requirements_dev_has_httpx(self):
        """Verify that requirements-dev.txt contains httpx"""
        requirements_path = os.path.join(AI_SERVICE_PATH, "requirements-dev.txt")
        with open(requirements_path, 'r') as f:
            content = f.read().lower()

        assert "httpx" in content, "requirements-dev.txt should contain httpx"

    def test_requirements_dev_references_base_requirements(self):
        """Verify that requirements-dev.txt references base requirements.txt"""
        requirements_path = os.path.join(AI_SERVICE_PATH, "requirements-dev.txt")
        with open(requirements_path, 'r') as f:
            content = f.read()

        assert "-r requirements.txt" in content, "requirements-dev.txt should reference base requirements.txt"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
