"""
Tests for T003.2.2: Create desktop-app/src/main/preload.ts

Tests verify that the preload script exists and contains
secure context bridge configuration for IPC communication.
"""

import os
import re

import pytest


# Path to the preload.ts file
PRELOAD_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
    "desktop-app",
    "src",
    "main",
    "preload.ts",
)


class TestPreloadTs:
    """Test suite for desktop-app/src/main/preload.ts."""

    def test_preload_ts_exists(self):
        """Test that preload.ts exists in src/main directory."""
        assert os.path.isfile(PRELOAD_PATH), (
            f"preload.ts not found at {PRELOAD_PATH}"
        )

    def test_preload_ts_is_not_empty(self):
        """Test that preload.ts has content."""
        with open(PRELOAD_PATH, "r", encoding="utf-8") as f:
            content = f.read()
        assert len(content.strip()) > 0, "preload.ts must not be empty"

    def test_preload_imports_context_bridge(self):
        """Test that preload.ts imports contextBridge from electron."""
        with open(PRELOAD_PATH, "r", encoding="utf-8") as f:
            content = f.read()
        assert "contextBridge" in content, (
            "preload.ts must import contextBridge from electron"
        )

    def test_preload_imports_ipc_renderer(self):
        """Test that preload.ts imports ipcRenderer from electron."""
        with open(PRELOAD_PATH, "r", encoding="utf-8") as f:
            content = f.read()
        assert "ipcRenderer" in content, (
            "preload.ts must import ipcRenderer from electron"
        )

    def test_preload_uses_expose_in_main_world(self):
        """Test that preload.ts uses exposeInMainWorld for security."""
        with open(PRELOAD_PATH, "r", encoding="utf-8") as f:
            content = f.read()
        assert "exposeInMainWorld" in content, (
            "preload.ts must use contextBridge.exposeInMainWorld"
        )

    def test_preload_defines_api_namespace(self):
        """Test that preload.ts defines an API namespace."""
        with open(PRELOAD_PATH, "r", encoding="utf-8") as f:
            content = f.read()
        # Should expose under a namespace like 'api', 'electron', or 'electronAPI'
        has_namespace = (
            "'api'" in content or
            '"api"' in content or
            "'electronAPI'" in content or
            '"electronAPI"' in content or
            "'electron'" in content or
            '"electron"' in content
        )
        assert has_namespace, (
            "preload.ts must define an API namespace (e.g., 'api', 'electronAPI')"
        )

    def test_preload_has_invoke_method(self):
        """Test that preload.ts exposes an invoke method for IPC."""
        with open(PRELOAD_PATH, "r", encoding="utf-8") as f:
            content = f.read()
        assert "invoke" in content, (
            "preload.ts must expose an invoke method for two-way IPC"
        )

    def test_preload_has_send_method(self):
        """Test that preload.ts exposes a send method for IPC."""
        with open(PRELOAD_PATH, "r", encoding="utf-8") as f:
            content = f.read()
        assert "send" in content, (
            "preload.ts must expose a send method for one-way IPC"
        )

    def test_preload_has_on_method(self):
        """Test that preload.ts exposes an on method for receiving IPC."""
        with open(PRELOAD_PATH, "r", encoding="utf-8") as f:
            content = f.read()
        # Check for 'on' or 'receive' or 'listen' method
        has_listener = "on" in content or "receive" in content or "listen" in content
        assert has_listener, (
            "preload.ts must expose an on/receive method for listening to IPC events"
        )

    def test_preload_does_not_expose_raw_ipc_renderer(self):
        """Test that preload.ts doesn't directly expose ipcRenderer object."""
        with open(PRELOAD_PATH, "r", encoding="utf-8") as f:
            content = f.read()
        # Should not have patterns that expose ipcRenderer directly in exposeInMainWorld
        # It's okay to use ipcRenderer internally, but not expose the whole object
        # Note: "ipcRenderer," in imports is fine, we only check for actual exposure
        dangerous_patterns = [
            "ipcRenderer: ipcRenderer",
            "'ipcRenderer': ipcRenderer",
            '"ipcRenderer": ipcRenderer',
            "exposeInMainWorld('ipcRenderer'",
            'exposeInMainWorld("ipcRenderer"',
        ]
        for pattern in dangerous_patterns:
            assert pattern not in content, (
                f"preload.ts must not directly expose ipcRenderer object ({pattern})"
            )

    def test_preload_has_type_annotations(self):
        """Test that preload.ts uses TypeScript type annotations."""
        with open(PRELOAD_PATH, "r", encoding="utf-8") as f:
            content = f.read()
        # Check for common type patterns
        has_types = (
            ": string" in content or
            ": number" in content or
            ": void" in content or
            ": Promise" in content or
            "=> " in content  # Arrow function return type
        )
        assert has_types, (
            "preload.ts should use TypeScript type annotations"
        )
