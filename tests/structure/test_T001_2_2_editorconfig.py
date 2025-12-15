"""
Test T001.2.2 - Verify .editorconfig configuration

This test verifies that .editorconfig exists and contains proper formatting rules
for consistent code style across different editors and IDEs.
"""

import os
import pytest

# Base path for the project
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


class TestEditorConfigConfiguration:
    """Test cases for T001.2.2 - .editorconfig configuration"""

    def test_editorconfig_file_exists(self):
        """Verify that .editorconfig file exists"""
        editorconfig_path = os.path.join(PROJECT_ROOT, ".editorconfig")
        assert os.path.isfile(editorconfig_path), f".editorconfig should exist at {editorconfig_path}"

    def test_editorconfig_has_root_setting(self):
        """Verify that .editorconfig has root = true setting"""
        editorconfig_path = os.path.join(PROJECT_ROOT, ".editorconfig")
        with open(editorconfig_path, 'r') as f:
            content = f.read()

        assert "root = true" in content, ".editorconfig should have 'root = true' setting"

    def test_editorconfig_has_default_settings(self):
        """Verify that .editorconfig has default settings for all files"""
        editorconfig_path = os.path.join(PROJECT_ROOT, ".editorconfig")
        with open(editorconfig_path, 'r') as f:
            content = f.read()

        required_settings = [
            "[*]",
            "indent_style",
            "indent_size",
            "end_of_line",
            "charset",
            "trim_trailing_whitespace",
            "insert_final_newline",
        ]

        missing = [s for s in required_settings if s not in content]
        assert len(missing) == 0, f"Missing default settings in .editorconfig: {missing}"

    def test_editorconfig_has_python_settings(self):
        """Verify that .editorconfig has Python-specific settings"""
        editorconfig_path = os.path.join(PROJECT_ROOT, ".editorconfig")
        with open(editorconfig_path, 'r') as f:
            content = f.read()

        assert "[*.py]" in content or "[*.{py" in content, ".editorconfig should have Python file settings"

    def test_editorconfig_has_typescript_settings(self):
        """Verify that .editorconfig has TypeScript-specific settings"""
        editorconfig_path = os.path.join(PROJECT_ROOT, ".editorconfig")
        with open(editorconfig_path, 'r') as f:
            content = f.read()

        # Check for TypeScript settings - could be [*.ts] or combined like [*.{ts,tsx}]
        has_ts = "[*.ts]" in content or "ts" in content
        assert has_ts, ".editorconfig should have TypeScript file settings"

    def test_editorconfig_has_csharp_settings(self):
        """Verify that .editorconfig has C#-specific settings"""
        editorconfig_path = os.path.join(PROJECT_ROOT, ".editorconfig")
        with open(editorconfig_path, 'r') as f:
            content = f.read()

        assert "[*.cs]" in content or "cs" in content, ".editorconfig should have C# file settings"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
