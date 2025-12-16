"""
Tests for T003.1.4: Create desktop-app/electron-builder.json

Tests verify that electron-builder.json exists and contains
all required configuration for Windows packaging.
"""

import json
import os

import pytest


# Path to the electron-builder.json file
ELECTRON_BUILDER_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
    "desktop-app",
    "electron-builder.json",
)


class TestElectronBuilderJson:
    """Test suite for electron-builder.json configuration."""

    def test_electron_builder_json_exists(self):
        """Test that electron-builder.json exists in desktop-app directory."""
        assert os.path.isfile(ELECTRON_BUILDER_PATH), (
            f"electron-builder.json not found at {ELECTRON_BUILDER_PATH}"
        )

    def test_electron_builder_json_is_valid_json(self):
        """Test that electron-builder.json contains valid JSON."""
        with open(ELECTRON_BUILDER_PATH, "r", encoding="utf-8") as f:
            content = f.read()
        try:
            json.loads(content)
        except json.JSONDecodeError as e:
            pytest.fail(f"electron-builder.json is not valid JSON: {e}")

    def test_electron_builder_has_app_id(self):
        """Test that electron-builder.json has appId property."""
        with open(ELECTRON_BUILDER_PATH, "r", encoding="utf-8") as f:
            config = json.load(f)
        assert "appId" in config, (
            "electron-builder.json must have appId property"
        )
        assert config["appId"], "appId must not be empty"

    def test_electron_builder_has_product_name(self):
        """Test that electron-builder.json has productName property."""
        with open(ELECTRON_BUILDER_PATH, "r", encoding="utf-8") as f:
            config = json.load(f)
        assert "productName" in config, (
            "electron-builder.json must have productName property"
        )
        assert config["productName"], "productName must not be empty"

    def test_electron_builder_has_directories(self):
        """Test that electron-builder.json has directories configuration."""
        with open(ELECTRON_BUILDER_PATH, "r", encoding="utf-8") as f:
            config = json.load(f)
        assert "directories" in config, (
            "electron-builder.json must have directories property"
        )
        assert isinstance(config["directories"], dict), (
            "directories must be an object"
        )

    def test_electron_builder_has_output_directory(self):
        """Test that directories has output specified."""
        with open(ELECTRON_BUILDER_PATH, "r", encoding="utf-8") as f:
            config = json.load(f)
        directories = config.get("directories", {})
        assert "output" in directories, (
            "directories must have output property"
        )

    def test_electron_builder_has_files_array(self):
        """Test that electron-builder.json has files array."""
        with open(ELECTRON_BUILDER_PATH, "r", encoding="utf-8") as f:
            config = json.load(f)
        assert "files" in config, (
            "electron-builder.json must have files property"
        )
        assert isinstance(config["files"], list), "files must be an array"

    def test_electron_builder_has_win_target(self):
        """Test that electron-builder.json has win configuration."""
        with open(ELECTRON_BUILDER_PATH, "r", encoding="utf-8") as f:
            config = json.load(f)
        assert "win" in config, (
            "electron-builder.json must have win property for Windows target"
        )
        assert isinstance(config["win"], dict), "win must be an object"

    def test_electron_builder_win_has_target(self):
        """Test that win configuration has target specified."""
        with open(ELECTRON_BUILDER_PATH, "r", encoding="utf-8") as f:
            config = json.load(f)
        win = config.get("win", {})
        assert "target" in win, "win must have target property"

    def test_electron_builder_has_nsis_config(self):
        """Test that electron-builder.json has NSIS installer configuration."""
        with open(ELECTRON_BUILDER_PATH, "r", encoding="utf-8") as f:
            config = json.load(f)
        assert "nsis" in config, (
            "electron-builder.json must have nsis property for installer config"
        )
        assert isinstance(config["nsis"], dict), "nsis must be an object"

    def test_electron_builder_nsis_has_one_click(self):
        """Test that NSIS configuration has oneClick property."""
        with open(ELECTRON_BUILDER_PATH, "r", encoding="utf-8") as f:
            config = json.load(f)
        nsis = config.get("nsis", {})
        assert "oneClick" in nsis, "nsis must have oneClick property"
        assert isinstance(nsis["oneClick"], bool), "oneClick must be a boolean"

    def test_electron_builder_nsis_has_per_machine(self):
        """Test that NSIS configuration has perMachine property."""
        with open(ELECTRON_BUILDER_PATH, "r", encoding="utf-8") as f:
            config = json.load(f)
        nsis = config.get("nsis", {})
        assert "perMachine" in nsis, "nsis must have perMachine property"

    def test_electron_builder_has_asar(self):
        """Test that electron-builder.json has asar configuration."""
        with open(ELECTRON_BUILDER_PATH, "r", encoding="utf-8") as f:
            config = json.load(f)
        assert "asar" in config, (
            "electron-builder.json must have asar property"
        )
