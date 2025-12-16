"""
Tests for T003.2.4: Create desktop-app/src/main/ipc-handlers.ts stub

Tests verify that the IPC handlers stub exists and contains
the required structure for handling IPC communication from renderer.
"""

import os

import pytest


# Path to the ipc-handlers.ts file
IPC_HANDLERS_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
    "desktop-app",
    "src",
    "main",
    "ipc-handlers.ts",
)


class TestIpcHandlersTs:
    """Test suite for desktop-app/src/main/ipc-handlers.ts."""

    def test_ipc_handlers_ts_exists(self):
        """Test that ipc-handlers.ts exists in src/main directory."""
        assert os.path.isfile(IPC_HANDLERS_PATH), (
            f"ipc-handlers.ts not found at {IPC_HANDLERS_PATH}"
        )

    def test_ipc_handlers_ts_is_not_empty(self):
        """Test that ipc-handlers.ts has content."""
        with open(IPC_HANDLERS_PATH, "r", encoding="utf-8") as f:
            content = f.read()
        assert len(content.strip()) > 0, "ipc-handlers.ts must not be empty"

    def test_ipc_handlers_imports_ipc_main(self):
        """Test that ipc-handlers.ts imports ipcMain from electron."""
        with open(IPC_HANDLERS_PATH, "r", encoding="utf-8") as f:
            content = f.read()
        assert "ipcMain" in content, (
            "ipc-handlers.ts must import ipcMain from electron"
        )

    def test_ipc_handlers_has_register_function(self):
        """Test that ipc-handlers.ts has a register handlers function."""
        with open(IPC_HANDLERS_PATH, "r", encoding="utf-8") as f:
            content = f.read()
        has_register = (
            "registerHandlers" in content or
            "registerIpcHandlers" in content or
            "setupHandlers" in content or
            "initHandlers" in content
        )
        assert has_register, (
            "ipc-handlers.ts must have a register/setup handlers function"
        )

    def test_ipc_handlers_has_handle_method(self):
        """Test that ipc-handlers.ts uses ipcMain.handle for invoke channels."""
        with open(IPC_HANDLERS_PATH, "r", encoding="utf-8") as f:
            content = f.read()
        assert "handle" in content, (
            "ipc-handlers.ts must use ipcMain.handle for invoke channels"
        )

    def test_ipc_handlers_has_ai_service_handlers(self):
        """Test that ipc-handlers.ts has AI service handlers."""
        with open(IPC_HANDLERS_PATH, "r", encoding="utf-8") as f:
            content = f.read()
        has_ai_handlers = (
            "ai:" in content or
            "extract" in content or
            "aiService" in content or
            "AI" in content
        )
        assert has_ai_handlers, (
            "ipc-handlers.ts must have AI service handlers"
        )

    def test_ipc_handlers_has_bridge_handlers(self):
        """Test that ipc-handlers.ts has Windows Bridge handlers."""
        with open(IPC_HANDLERS_PATH, "r", encoding="utf-8") as f:
            content = f.read()
        has_bridge_handlers = (
            "bridge:" in content or
            "bridgeService" in content or
            "Bridge" in content
        )
        assert has_bridge_handlers, (
            "ipc-handlers.ts must have Windows Bridge handlers"
        )

    def test_ipc_handlers_has_database_handlers(self):
        """Test that ipc-handlers.ts has database handlers."""
        with open(IPC_HANDLERS_PATH, "r", encoding="utf-8") as f:
            content = f.read()
        has_db_handlers = (
            "db:" in content or
            "database" in content or
            "invoice" in content.lower()
        )
        assert has_db_handlers, (
            "ipc-handlers.ts must have database handlers"
        )

    def test_ipc_handlers_has_export(self):
        """Test that ipc-handlers.ts exports its functions."""
        with open(IPC_HANDLERS_PATH, "r", encoding="utf-8") as f:
            content = f.read()
        assert "export" in content, (
            "ipc-handlers.ts must export its functions"
        )

    def test_ipc_handlers_has_async_handlers(self):
        """Test that ipc-handlers.ts uses async handlers."""
        with open(IPC_HANDLERS_PATH, "r", encoding="utf-8") as f:
            content = f.read()
        assert "async" in content, (
            "ipc-handlers.ts should use async handlers for IPC operations"
        )
