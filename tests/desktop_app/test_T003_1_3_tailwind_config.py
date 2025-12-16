"""
Test Suite: T003.1.3 - Create desktop-app/tailwind.config.js
Tests verify that tailwind.config.js exists and has proper configuration.
"""

import os
import re
import pytest

# Path to tailwind.config.js
TAILWIND_CONFIG_PATH = os.path.join(
    os.path.dirname(__file__),
    "..",
    "..",
    "desktop-app",
    "tailwind.config.js",
)


class TestTailwindConfig:
    """Test suite for desktop-app/tailwind.config.js."""

    def test_tailwind_config_exists(self):
        """Test that tailwind.config.js file exists in desktop-app directory."""
        assert os.path.isfile(TAILWIND_CONFIG_PATH), (
            f"tailwind.config.js not found at {TAILWIND_CONFIG_PATH}"
        )

    def test_tailwind_config_is_valid_javascript(self):
        """Test that tailwind.config.js is valid JavaScript syntax."""
        with open(TAILWIND_CONFIG_PATH, "r", encoding="utf-8") as f:
            content = f.read()
        # Check for module.exports or export default
        has_export = (
            "module.exports" in content or
            "export default" in content
        )
        assert has_export, (
            "tailwind.config.js must export configuration"
        )

    def test_tailwind_config_has_content_array(self):
        """Test that tailwind.config.js has content array for purging."""
        with open(TAILWIND_CONFIG_PATH, "r", encoding="utf-8") as f:
            content = f.read()
        assert "content" in content, (
            "tailwind.config.js must have 'content' configuration"
        )
        # Check for content array with file patterns
        assert re.search(r'content\s*:', content), (
            "tailwind.config.js must have 'content:' property"
        )

    def test_tailwind_config_includes_tsx_files(self):
        """Test that content includes .tsx files."""
        with open(TAILWIND_CONFIG_PATH, "r", encoding="utf-8") as f:
            content = f.read()
        assert ".tsx" in content, (
            "tailwind.config.js content must include .tsx files"
        )

    def test_tailwind_config_includes_ts_files(self):
        """Test that content includes .ts files."""
        with open(TAILWIND_CONFIG_PATH, "r", encoding="utf-8") as f:
            content = f.read()
        assert ".ts" in content, (
            "tailwind.config.js content must include .ts files"
        )

    def test_tailwind_config_has_theme_section(self):
        """Test that tailwind.config.js has theme configuration."""
        with open(TAILWIND_CONFIG_PATH, "r", encoding="utf-8") as f:
            content = f.read()
        assert "theme" in content, (
            "tailwind.config.js must have 'theme' configuration"
        )

    def test_tailwind_config_has_extend_section(self):
        """Test that tailwind.config.js has theme.extend for customization."""
        with open(TAILWIND_CONFIG_PATH, "r", encoding="utf-8") as f:
            content = f.read()
        assert "extend" in content, (
            "tailwind.config.js must have 'theme.extend' for customization"
        )

    def test_tailwind_config_has_plugins_array(self):
        """Test that tailwind.config.js has plugins array."""
        with open(TAILWIND_CONFIG_PATH, "r", encoding="utf-8") as f:
            content = f.read()
        assert "plugins" in content, (
            "tailwind.config.js must have 'plugins' array"
        )
