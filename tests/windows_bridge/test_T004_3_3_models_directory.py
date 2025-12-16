"""
Tests for T004.3.3: Create Models/ directory

Verifies that the Models directory exists with proper model definitions
for API request/response objects and domain models.
"""

import os
import pytest

# Path to the ContPAQWinBridge project directory
PROJECT_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
    "windows-bridge",
    "src",
    "ContPAQWinBridge"
)

MODELS_PATH = os.path.join(PROJECT_PATH, "Models")


class TestModelsDirectoryExists:
    """Tests for Models directory existence."""

    def test_models_directory_exists(self):
        """T004.3.3: Models directory should exist."""
        assert os.path.exists(MODELS_PATH), \
            f"Models directory not found at {MODELS_PATH}"

    def test_models_is_directory(self):
        """T004.3.3: Models should be a directory, not a file."""
        assert os.path.isdir(MODELS_PATH), \
            "Models should be a directory"


class TestModelsHasFiles:
    """Tests for model files."""

    @pytest.fixture
    def model_files(self):
        """Get list of files in Models directory."""
        if not os.path.exists(MODELS_PATH):
            return []
        return os.listdir(MODELS_PATH)

    def test_has_model_files(self, model_files):
        """T004.3.3: Should have model files."""
        cs_files = [f for f in model_files if f.endswith('.cs')]
        assert len(cs_files) >= 1, \
            "Should have at least one .cs model file"

    def test_has_api_response_model(self, model_files):
        """T004.3.3: Should have API response model."""
        has_response = any(
            'Response' in f or 'Result' in f or 'ApiResponse' in f
            for f in model_files
        )
        assert has_response, \
            "Should have API response model file"

    def test_has_health_model(self, model_files):
        """T004.3.3: Should have health check model."""
        has_health = any(
            'Health' in f
            for f in model_files
        )
        assert has_health, \
            "Should have health check model file"


class TestModelFileContent:
    """Tests for model file content."""

    @pytest.fixture
    def model_files(self):
        """Get list of .cs files with full paths."""
        if not os.path.exists(MODELS_PATH):
            return []
        files = [f for f in os.listdir(MODELS_PATH) if f.endswith('.cs')]
        return [(f, os.path.join(MODELS_PATH, f)) for f in files]

    def test_models_have_namespace(self, model_files):
        """T004.3.3: Models should have correct namespace."""
        for filename, filepath in model_files:
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            assert 'namespace ContPAQWinBridge.Models' in content, \
                f"{filename} should have ContPAQWinBridge.Models namespace"

    def test_models_are_public(self, model_files):
        """T004.3.3: Models should be public."""
        for filename, filepath in model_files:
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            has_public = (
                'public class' in content or
                'public record' in content or
                'public enum' in content
            )
            assert has_public, \
                f"{filename} should have public class, record, or enum"

    def test_models_have_xml_docs(self, model_files):
        """T004.3.3: Models should have XML documentation."""
        for filename, filepath in model_files:
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            has_docs = '///' in content
            assert has_docs, \
                f"{filename} should have XML documentation"


class TestApiResponseModel:
    """Tests for generic API response model."""

    def test_api_response_file_exists(self):
        """T004.3.3: Should have ApiResponse model file."""
        if not os.path.exists(MODELS_PATH):
            pytest.skip("Models directory doesn't exist yet")

        files = os.listdir(MODELS_PATH)
        has_api_response = any('ApiResponse' in f or 'Response' in f for f in files)
        assert has_api_response, "Should have ApiResponse model file"

    def test_api_response_has_success_property(self):
        """T004.3.3: ApiResponse should have Success property."""
        if not os.path.exists(MODELS_PATH):
            pytest.skip("Models directory doesn't exist yet")

        # Find ApiResponse file
        for filename in os.listdir(MODELS_PATH):
            if 'Response' in filename and filename.endswith('.cs'):
                filepath = os.path.join(MODELS_PATH, filename)
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()
                if 'Success' in content:
                    return  # Test passes
        pytest.fail("ApiResponse should have Success property")

    def test_api_response_has_message_property(self):
        """T004.3.3: ApiResponse should have Message property."""
        if not os.path.exists(MODELS_PATH):
            pytest.skip("Models directory doesn't exist yet")

        for filename in os.listdir(MODELS_PATH):
            if 'Response' in filename and filename.endswith('.cs'):
                filepath = os.path.join(MODELS_PATH, filename)
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()
                if 'Message' in content:
                    return
        pytest.fail("ApiResponse should have Message property")


class TestHealthModel:
    """Tests for health check model."""

    def test_health_response_has_status(self):
        """T004.3.3: HealthResponse should have Status property."""
        if not os.path.exists(MODELS_PATH):
            pytest.skip("Models directory doesn't exist yet")

        for filename in os.listdir(MODELS_PATH):
            if 'Health' in filename and filename.endswith('.cs'):
                filepath = os.path.join(MODELS_PATH, filename)
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()
                if 'Status' in content:
                    return
        pytest.fail("HealthResponse should have Status property")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
