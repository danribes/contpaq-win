"""
Tests for T003.2.1: Create desktop-app/src/main/index.ts

Tests verify that the Electron main process entry point exists
and contains all required components for a proper Electron application.
"""

import os
import re

import pytest


# Path to the main index.ts file
MAIN_INDEX_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
    "desktop-app",
    "src",
    "main",
    "index.ts",
)


class TestMainIndexTs:
    """Test suite for desktop-app/src/main/index.ts."""

    def test_main_index_ts_exists(self):
        """Test that index.ts exists in src/main directory."""
        assert os.path.isfile(MAIN_INDEX_PATH), (
            f"index.ts not found at {MAIN_INDEX_PATH}"
        )

    def test_main_index_ts_is_not_empty(self):
        """Test that index.ts has content."""
        with open(MAIN_INDEX_PATH, "r", encoding="utf-8") as f:
            content = f.read()
        assert len(content.strip()) > 0, "index.ts must not be empty"

    def test_main_index_imports_electron_app(self):
        """Test that index.ts imports app from electron."""
        with open(MAIN_INDEX_PATH, "r", encoding="utf-8") as f:
            content = f.read()
        # Check for import { app, ... } from 'electron' or similar
        assert "app" in content and "electron" in content, (
            "index.ts must import app from electron"
        )

    def test_main_index_imports_browser_window(self):
        """Test that index.ts imports BrowserWindow from electron."""
        with open(MAIN_INDEX_PATH, "r", encoding="utf-8") as f:
            content = f.read()
        assert "BrowserWindow" in content, (
            "index.ts must import BrowserWindow from electron"
        )

    def test_main_index_has_create_window_function(self):
        """Test that index.ts has a createWindow function."""
        with open(MAIN_INDEX_PATH, "r", encoding="utf-8") as f:
            content = f.read()
        # Check for function createWindow or const createWindow =
        has_create_window = (
            "function createWindow" in content or
            "createWindow" in content and ("=>" in content or "function" in content)
        )
        assert has_create_window, (
            "index.ts must have a createWindow function"
        )

    def test_main_index_has_app_ready_handler(self):
        """Test that index.ts handles app ready event."""
        with open(MAIN_INDEX_PATH, "r", encoding="utf-8") as f:
            content = f.read()
        # Check for app.whenReady() or app.on('ready', ...)
        has_ready_handler = (
            "app.whenReady()" in content or
            "app.on('ready'" in content or
            'app.on("ready"' in content
        )
        assert has_ready_handler, (
            "index.ts must handle app ready event with app.whenReady() or app.on('ready')"
        )

    def test_main_index_has_window_all_closed_handler(self):
        """Test that index.ts handles window-all-closed event."""
        with open(MAIN_INDEX_PATH, "r", encoding="utf-8") as f:
            content = f.read()
        assert "window-all-closed" in content, (
            "index.ts must handle window-all-closed event"
        )

    def test_main_index_has_activate_handler(self):
        """Test that index.ts handles activate event for macOS."""
        with open(MAIN_INDEX_PATH, "r", encoding="utf-8") as f:
            content = f.read()
        assert "activate" in content, (
            "index.ts must handle activate event for macOS dock click"
        )

    def test_main_index_creates_browser_window_instance(self):
        """Test that index.ts creates a new BrowserWindow."""
        with open(MAIN_INDEX_PATH, "r", encoding="utf-8") as f:
            content = f.read()
        assert "new BrowserWindow" in content, (
            "index.ts must create a new BrowserWindow instance"
        )

    def test_main_index_has_webpreferences(self):
        """Test that index.ts configures webPreferences for security."""
        with open(MAIN_INDEX_PATH, "r", encoding="utf-8") as f:
            content = f.read()
        assert "webPreferences" in content, (
            "index.ts must configure webPreferences for BrowserWindow"
        )

    def test_main_index_has_preload_reference(self):
        """Test that index.ts references preload script."""
        with open(MAIN_INDEX_PATH, "r", encoding="utf-8") as f:
            content = f.read()
        assert "preload" in content, (
            "index.ts must reference preload script in webPreferences"
        )

    def test_main_index_disables_node_integration(self):
        """Test that index.ts disables nodeIntegration for security."""
        with open(MAIN_INDEX_PATH, "r", encoding="utf-8") as f:
            content = f.read()
        assert "nodeIntegration" in content, (
            "index.ts must explicitly set nodeIntegration"
        )

    def test_main_index_enables_context_isolation(self):
        """Test that index.ts enables contextIsolation for security."""
        with open(MAIN_INDEX_PATH, "r", encoding="utf-8") as f:
            content = f.read()
        assert "contextIsolation" in content, (
            "index.ts must enable contextIsolation for security"
        )
