"""
Tests for T004.2.3: Create windows-bridge/src/ContPAQWinBridge/appsettings.json

Verifies that appsettings.json contains proper configuration for the
Windows Bridge service including Serilog, logging levels, and app settings.
"""

import os
import json
import pytest

# Path to the appsettings.json file
APPSETTINGS_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
    "windows-bridge",
    "src",
    "ContPAQWinBridge",
    "appsettings.json"
)


class TestAppsettingsFileExists:
    """Tests for appsettings.json file existence."""

    def test_appsettings_file_exists(self):
        """T004.2.3: appsettings.json should exist at correct path."""
        assert os.path.exists(APPSETTINGS_PATH), \
            f"appsettings.json not found at {APPSETTINGS_PATH}"

    def test_appsettings_has_json_extension(self):
        """T004.2.3: File should have .json extension."""
        assert APPSETTINGS_PATH.endswith(".json"), \
            "File should have .json extension"

    def test_appsettings_is_not_empty(self):
        """T004.2.3: appsettings.json should not be empty."""
        assert os.path.getsize(APPSETTINGS_PATH) > 0, \
            "File should not be empty"


class TestAppsettingsFormat:
    """Tests for appsettings.json JSON format."""

    @pytest.fixture
    def config(self):
        """Load appsettings.json as dictionary."""
        with open(APPSETTINGS_PATH, "r", encoding="utf-8") as f:
            return json.load(f)

    def test_is_valid_json(self):
        """T004.2.3: appsettings.json should be valid JSON."""
        try:
            with open(APPSETTINGS_PATH, "r", encoding="utf-8") as f:
                json.load(f)
        except json.JSONDecodeError as e:
            pytest.fail(f"File is not valid JSON: {e}")

    def test_root_is_object(self, config):
        """T004.2.3: Root element should be a JSON object."""
        assert isinstance(config, dict), "Root element should be a JSON object"


class TestSerilogConfiguration:
    """Tests for Serilog configuration in appsettings."""

    @pytest.fixture
    def config(self):
        """Load appsettings.json as dictionary."""
        with open(APPSETTINGS_PATH, "r", encoding="utf-8") as f:
            return json.load(f)

    def test_has_serilog_section(self, config):
        """T004.2.3: Should have Serilog configuration section."""
        assert "Serilog" in config, "Should have Serilog configuration section"

    def test_serilog_has_minimum_level(self, config):
        """T004.2.3: Serilog should have MinimumLevel configuration."""
        serilog = config.get("Serilog", {})
        assert "MinimumLevel" in serilog, \
            "Serilog should have MinimumLevel configuration"

    def test_serilog_minimum_level_default(self, config):
        """T004.2.3: Serilog MinimumLevel Default should be Information or Debug."""
        serilog = config.get("Serilog", {})
        min_level = serilog.get("MinimumLevel", {})

        # Can be string or object with Default key
        if isinstance(min_level, str):
            default = min_level
        else:
            default = min_level.get("Default", "")

        assert default in ["Information", "Debug", "Verbose"], \
            f"MinimumLevel Default should be Information or Debug, got {default}"

    def test_serilog_has_overrides(self, config):
        """T004.2.3: Serilog should have log level overrides."""
        serilog = config.get("Serilog", {})
        min_level = serilog.get("MinimumLevel", {})

        if isinstance(min_level, dict):
            assert "Override" in min_level, \
                "Serilog MinimumLevel should have Override section"

    def test_serilog_microsoft_override_is_warning(self, config):
        """T004.2.3: Microsoft logs should be at Warning level or higher."""
        serilog = config.get("Serilog", {})
        min_level = serilog.get("MinimumLevel", {})

        if isinstance(min_level, dict):
            overrides = min_level.get("Override", {})
            microsoft_level = overrides.get("Microsoft", "")
            assert microsoft_level in ["Warning", "Error", "Fatal"], \
                f"Microsoft override should be Warning or higher, got {microsoft_level}"


class TestLoggingConfiguration:
    """Tests for general logging configuration."""

    @pytest.fixture
    def config(self):
        """Load appsettings.json as dictionary."""
        with open(APPSETTINGS_PATH, "r", encoding="utf-8") as f:
            return json.load(f)

    def test_has_serilog_using(self, config):
        """T004.2.3: Serilog should have Using section for sinks."""
        serilog = config.get("Serilog", {})
        # Using is optional but recommended
        if "Using" in serilog:
            assert isinstance(serilog["Using"], list), \
                "Serilog Using should be a list"

    def test_has_serilog_write_to(self, config):
        """T004.2.3: Serilog should have WriteTo section for sinks."""
        serilog = config.get("Serilog", {})
        # WriteTo is optional if configured in code
        if "WriteTo" in serilog:
            assert isinstance(serilog["WriteTo"], list), \
                "Serilog WriteTo should be a list"


class TestAllowedHosts:
    """Tests for AllowedHosts configuration."""

    @pytest.fixture
    def config(self):
        """Load appsettings.json as dictionary."""
        with open(APPSETTINGS_PATH, "r", encoding="utf-8") as f:
            return json.load(f)

    def test_has_allowed_hosts(self, config):
        """T004.2.3: Should have AllowedHosts configuration."""
        assert "AllowedHosts" in config, "Should have AllowedHosts configuration"

    def test_allowed_hosts_value(self, config):
        """T004.2.3: AllowedHosts should be '*' or specific hosts."""
        allowed = config.get("AllowedHosts", "")
        assert allowed == "*" or "localhost" in allowed.lower(), \
            "AllowedHosts should be '*' or include localhost"


class TestFileEncoding:
    """Tests for file encoding."""

    def test_file_is_utf8(self):
        """T004.2.3: File should be UTF-8 encoded."""
        with open(APPSETTINGS_PATH, "rb") as f:
            content = f.read()
        try:
            if content.startswith(b'\xef\xbb\xbf'):
                content[3:].decode("utf-8")
            else:
                content.decode("utf-8")
        except UnicodeDecodeError:
            pytest.fail("File should be UTF-8 encoded")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
