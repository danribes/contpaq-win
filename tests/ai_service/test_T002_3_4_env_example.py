"""
Test T002.3.4 - Verify .env.example exists with sample configuration

This test verifies that the .env.example file exists in the ai-service directory
and contains sample values for all configuration settings.
"""

import os
import pytest

# Base path for the project
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
AI_SERVICE_PATH = os.path.join(PROJECT_ROOT, "ai-service")


class TestEnvExample:
    """Test cases for T002.3.4 - .env.example file"""

    def test_env_example_exists(self):
        """Verify that .env.example file exists in ai-service"""
        env_example_path = os.path.join(AI_SERVICE_PATH, ".env.example")
        assert os.path.isfile(env_example_path), f".env.example should exist at {env_example_path}"

    def test_env_example_contains_host(self):
        """Verify that .env.example contains HOST setting"""
        env_example_path = os.path.join(AI_SERVICE_PATH, ".env.example")
        with open(env_example_path, 'r') as f:
            content = f.read()

        assert "HOST" in content, ".env.example should contain HOST setting"

    def test_env_example_contains_port(self):
        """Verify that .env.example contains PORT setting"""
        env_example_path = os.path.join(AI_SERVICE_PATH, ".env.example")
        with open(env_example_path, 'r') as f:
            content = f.read()

        assert "PORT" in content, ".env.example should contain PORT setting"

    def test_env_example_contains_log_level(self):
        """Verify that .env.example contains LOG_LEVEL setting"""
        env_example_path = os.path.join(AI_SERVICE_PATH, ".env.example")
        with open(env_example_path, 'r') as f:
            content = f.read()

        assert "LOG_LEVEL" in content, ".env.example should contain LOG_LEVEL setting"

    def test_env_example_contains_tesseract_path(self):
        """Verify that .env.example contains TESSERACT_PATH setting"""
        env_example_path = os.path.join(AI_SERVICE_PATH, ".env.example")
        with open(env_example_path, 'r') as f:
            content = f.read()

        assert "TESSERACT_PATH" in content, ".env.example should contain TESSERACT_PATH setting"

    def test_env_example_contains_model_path(self):
        """Verify that .env.example contains MODEL_PATH setting"""
        env_example_path = os.path.join(AI_SERVICE_PATH, ".env.example")
        with open(env_example_path, 'r') as f:
            content = f.read()

        assert "MODEL_PATH" in content, ".env.example should contain MODEL_PATH setting"

    def test_env_example_has_comments(self):
        """Verify that .env.example has explanatory comments"""
        env_example_path = os.path.join(AI_SERVICE_PATH, ".env.example")
        with open(env_example_path, 'r') as f:
            content = f.read()

        # Check for comment lines (starting with #)
        assert "#" in content, ".env.example should have explanatory comments"

    def test_env_example_is_valid_format(self):
        """Verify that .env.example uses valid KEY=value format"""
        env_example_path = os.path.join(AI_SERVICE_PATH, ".env.example")
        with open(env_example_path, 'r') as f:
            lines = f.readlines()

        for line in lines:
            line = line.strip()
            # Skip empty lines and comments
            if not line or line.startswith('#'):
                continue
            # Should have KEY=value format
            assert '=' in line, f"Invalid format in line: {line}"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
