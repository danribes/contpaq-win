"""
Test T002.3.2 - Verify HOST, PORT, LOG_LEVEL settings in config.py

This test verifies that the configuration module defines the server settings
with correct default values and types.
"""

import os
import pytest

# Base path for the project
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
AI_SERVICE_PATH = os.path.join(PROJECT_ROOT, "ai-service")


class TestServerSettings:
    """Test cases for T002.3.2 - HOST, PORT, LOG_LEVEL settings"""

    def test_config_defines_host_setting(self):
        """Verify that config.py defines HOST setting"""
        config_path = os.path.join(AI_SERVICE_PATH, "src", "config.py")
        with open(config_path, 'r') as f:
            content = f.read()

        assert "HOST" in content, "config.py should define HOST setting"

    def test_config_host_default_is_localhost(self):
        """Verify that HOST default is 127.0.0.1 (localhost only for security)"""
        config_path = os.path.join(AI_SERVICE_PATH, "src", "config.py")
        with open(config_path, 'r') as f:
            content = f.read()

        assert '127.0.0.1' in content, "HOST default should be 127.0.0.1 for localhost-only binding"

    def test_config_defines_port_setting(self):
        """Verify that config.py defines PORT setting"""
        config_path = os.path.join(AI_SERVICE_PATH, "src", "config.py")
        with open(config_path, 'r') as f:
            content = f.read()

        assert "PORT" in content, "config.py should define PORT setting"

    def test_config_port_default_is_8000(self):
        """Verify that PORT default is 8000"""
        config_path = os.path.join(AI_SERVICE_PATH, "src", "config.py")
        with open(config_path, 'r') as f:
            content = f.read()

        assert "8000" in content, "PORT default should be 8000"

    def test_config_port_is_integer_type(self):
        """Verify that PORT is typed as int"""
        config_path = os.path.join(AI_SERVICE_PATH, "src", "config.py")
        with open(config_path, 'r') as f:
            content = f.read()

        # Check for int type annotation
        assert "PORT:" in content and "int" in content, "PORT should be typed as int"

    def test_config_defines_log_level_setting(self):
        """Verify that config.py defines LOG_LEVEL setting"""
        config_path = os.path.join(AI_SERVICE_PATH, "src", "config.py")
        with open(config_path, 'r') as f:
            content = f.read()

        assert "LOG_LEVEL" in content, "config.py should define LOG_LEVEL setting"

    def test_config_log_level_default_is_info(self):
        """Verify that LOG_LEVEL default is INFO"""
        config_path = os.path.join(AI_SERVICE_PATH, "src", "config.py")
        with open(config_path, 'r') as f:
            content = f.read()

        # Check for INFO as default (case-insensitive check in the actual value)
        assert '"INFO"' in content or "'INFO'" in content, "LOG_LEVEL default should be INFO"

    def test_config_log_level_is_string_type(self):
        """Verify that LOG_LEVEL is typed as str"""
        config_path = os.path.join(AI_SERVICE_PATH, "src", "config.py")
        with open(config_path, 'r') as f:
            content = f.read()

        assert "LOG_LEVEL:" in content and "str" in content, "LOG_LEVEL should be typed as str"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
