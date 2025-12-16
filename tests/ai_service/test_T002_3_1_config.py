"""
Test T002.3.1 - Verify ai-service/src/config.py exists with Pydantic Settings

This test verifies that the configuration module exists and uses Pydantic Settings
for type-safe configuration management with environment variable support.
"""

import os
import pytest

# Base path for the project
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
AI_SERVICE_PATH = os.path.join(PROJECT_ROOT, "ai-service")


class TestConfigModule:
    """Test cases for T002.3.1 - config.py with Pydantic Settings"""

    def test_config_py_exists(self):
        """Verify that config.py file exists in ai-service/src"""
        config_path = os.path.join(AI_SERVICE_PATH, "src", "config.py")
        assert os.path.isfile(config_path), f"config.py should exist at {config_path}"

    def test_config_has_docstring(self):
        """Verify that config.py has a module docstring"""
        config_path = os.path.join(AI_SERVICE_PATH, "src", "config.py")
        with open(config_path, 'r') as f:
            content = f.read()

        assert '"""' in content or "'''" in content, "config.py should have a docstring"

    def test_config_imports_pydantic_settings(self):
        """Verify that config.py imports from pydantic_settings"""
        config_path = os.path.join(AI_SERVICE_PATH, "src", "config.py")
        with open(config_path, 'r') as f:
            content = f.read()

        # Check for pydantic_settings import (the new package name)
        assert "pydantic_settings" in content or "BaseSettings" in content, \
            "config.py should import from pydantic_settings"

    def test_config_defines_settings_class(self):
        """Verify that config.py defines a Settings class"""
        config_path = os.path.join(AI_SERVICE_PATH, "src", "config.py")
        with open(config_path, 'r') as f:
            content = f.read()

        assert "class Settings" in content, "config.py should define a Settings class"

    def test_config_settings_inherits_base_settings(self):
        """Verify that Settings class inherits from BaseSettings"""
        config_path = os.path.join(AI_SERVICE_PATH, "src", "config.py")
        with open(config_path, 'r') as f:
            content = f.read()

        # Check for inheritance pattern
        assert "Settings(BaseSettings)" in content or "Settings(BaseSettings," in content, \
            "Settings class should inherit from BaseSettings"

    def test_config_is_valid_python(self):
        """Verify that config.py is valid Python code"""
        config_path = os.path.join(AI_SERVICE_PATH, "src", "config.py")
        with open(config_path, 'r') as f:
            content = f.read()

        try:
            compile(content, config_path, 'exec')
            is_valid = True
        except SyntaxError:
            is_valid = False

        assert is_valid, "config.py should be valid Python code"

    def test_config_has_model_config(self):
        """Verify that Settings class has model_config for env file support"""
        config_path = os.path.join(AI_SERVICE_PATH, "src", "config.py")
        with open(config_path, 'r') as f:
            content = f.read()

        # Pydantic v2 uses model_config
        assert "model_config" in content or "SettingsConfigDict" in content, \
            "Settings should have model_config for environment configuration"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
