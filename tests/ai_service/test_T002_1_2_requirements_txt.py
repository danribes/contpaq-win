"""
Test T002.1.2 - Verify ai-service/requirements.txt exists and contains required dependencies

This test verifies that requirements.txt exists in the ai-service directory
and contains all production dependencies specified in the task.
"""

import os
import pytest

# Base path for the project
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
AI_SERVICE_PATH = os.path.join(PROJECT_ROOT, "ai-service")


class TestRequirementsTxt:
    """Test cases for T002.1.2 - requirements.txt configuration"""

    def test_requirements_txt_exists(self):
        """Verify that requirements.txt file exists in ai-service directory"""
        requirements_path = os.path.join(AI_SERVICE_PATH, "requirements.txt")
        assert os.path.isfile(requirements_path), f"requirements.txt should exist at {requirements_path}"

    def test_requirements_has_fastapi(self):
        """Verify that requirements.txt contains FastAPI"""
        requirements_path = os.path.join(AI_SERVICE_PATH, "requirements.txt")
        with open(requirements_path, 'r') as f:
            content = f.read().lower()

        assert "fastapi" in content, "requirements.txt should contain FastAPI"

    def test_requirements_has_uvicorn(self):
        """Verify that requirements.txt contains uvicorn"""
        requirements_path = os.path.join(AI_SERVICE_PATH, "requirements.txt")
        with open(requirements_path, 'r') as f:
            content = f.read().lower()

        assert "uvicorn" in content, "requirements.txt should contain uvicorn"

    def test_requirements_has_pymupdf(self):
        """Verify that requirements.txt contains PyMuPDF"""
        requirements_path = os.path.join(AI_SERVICE_PATH, "requirements.txt")
        with open(requirements_path, 'r') as f:
            content = f.read().lower()

        assert "pymupdf" in content, "requirements.txt should contain PyMuPDF"

    def test_requirements_has_pytesseract(self):
        """Verify that requirements.txt contains pytesseract"""
        requirements_path = os.path.join(AI_SERVICE_PATH, "requirements.txt")
        with open(requirements_path, 'r') as f:
            content = f.read().lower()

        assert "pytesseract" in content, "requirements.txt should contain pytesseract"

    def test_requirements_has_transformers(self):
        """Verify that requirements.txt contains transformers"""
        requirements_path = os.path.join(AI_SERVICE_PATH, "requirements.txt")
        with open(requirements_path, 'r') as f:
            content = f.read().lower()

        assert "transformers" in content, "requirements.txt should contain transformers"

    def test_requirements_has_torch(self):
        """Verify that requirements.txt contains torch"""
        requirements_path = os.path.join(AI_SERVICE_PATH, "requirements.txt")
        with open(requirements_path, 'r') as f:
            content = f.read().lower()

        assert "torch" in content, "requirements.txt should contain torch"

    def test_requirements_has_pillow(self):
        """Verify that requirements.txt contains Pillow"""
        requirements_path = os.path.join(AI_SERVICE_PATH, "requirements.txt")
        with open(requirements_path, 'r') as f:
            content = f.read().lower()

        assert "pillow" in content, "requirements.txt should contain Pillow"

    def test_requirements_has_pydantic(self):
        """Verify that requirements.txt contains pydantic"""
        requirements_path = os.path.join(AI_SERVICE_PATH, "requirements.txt")
        with open(requirements_path, 'r') as f:
            content = f.read().lower()

        assert "pydantic" in content, "requirements.txt should contain pydantic"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
