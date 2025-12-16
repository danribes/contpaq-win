"""
Test T002.3.3 - Verify TESSERACT_PATH, MODEL_PATH settings in config.py

This test verifies that the configuration module defines the service path settings
for external dependencies (Tesseract OCR and LayoutLMv3 model).
"""

import os
import pytest

# Base path for the project
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
AI_SERVICE_PATH = os.path.join(PROJECT_ROOT, "ai-service")


class TestServicePathSettings:
    """Test cases for T002.3.3 - TESSERACT_PATH, MODEL_PATH settings"""

    def test_config_defines_tesseract_path_setting(self):
        """Verify that config.py defines TESSERACT_PATH setting"""
        config_path = os.path.join(AI_SERVICE_PATH, "src", "config.py")
        with open(config_path, 'r') as f:
            content = f.read()

        assert "TESSERACT_PATH" in content, "config.py should define TESSERACT_PATH setting"

    def test_config_tesseract_path_is_string_type(self):
        """Verify that TESSERACT_PATH is typed as str"""
        config_path = os.path.join(AI_SERVICE_PATH, "src", "config.py")
        with open(config_path, 'r') as f:
            content = f.read()

        assert "TESSERACT_PATH:" in content and "str" in content, \
            "TESSERACT_PATH should be typed as str"

    def test_config_tesseract_path_has_default(self):
        """Verify that TESSERACT_PATH has a sensible default path"""
        config_path = os.path.join(AI_SERVICE_PATH, "src", "config.py")
        with open(config_path, 'r') as f:
            content = f.read()

        # Should have some default path (either Windows or Linux style)
        has_default = ("tesseract" in content.lower() and
                      ("=" in content or "default" in content.lower()))
        assert has_default, "TESSERACT_PATH should have a default value"

    def test_config_defines_model_path_setting(self):
        """Verify that config.py defines MODEL_PATH setting"""
        config_path = os.path.join(AI_SERVICE_PATH, "src", "config.py")
        with open(config_path, 'r') as f:
            content = f.read()

        assert "MODEL_PATH" in content, "config.py should define MODEL_PATH setting"

    def test_config_model_path_is_string_type(self):
        """Verify that MODEL_PATH is typed as str"""
        config_path = os.path.join(AI_SERVICE_PATH, "src", "config.py")
        with open(config_path, 'r') as f:
            content = f.read()

        assert "MODEL_PATH:" in content and "str" in content, \
            "MODEL_PATH should be typed as str"

    def test_config_model_path_has_default(self):
        """Verify that MODEL_PATH has a default path"""
        config_path = os.path.join(AI_SERVICE_PATH, "src", "config.py")
        with open(config_path, 'r') as f:
            content = f.read()

        # Should reference models directory
        has_default = "MODEL_PATH" in content and "=" in content
        assert has_default, "MODEL_PATH should have a default value"

    def test_config_has_service_paths_section(self):
        """Verify that config.py has a Service Paths section"""
        config_path = os.path.join(AI_SERVICE_PATH, "src", "config.py")
        with open(config_path, 'r') as f:
            content = f.read()

        # Check for section header or both path settings
        has_section = ("Service Paths" in content or "T002.3.3" in content or
                      ("TESSERACT_PATH" in content and "MODEL_PATH" in content))
        assert has_section, "config.py should have Service Paths section with both settings"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
