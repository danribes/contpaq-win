"""
Tests for T003.2.3: Create desktop-app/src/main/process-manager.ts stub

Tests verify that the process manager stub exists and contains
the required structure for managing AI service and Windows Bridge processes.
"""

import os

import pytest


# Path to the process-manager.ts file
PROCESS_MANAGER_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
    "desktop-app",
    "src",
    "main",
    "process-manager.ts",
)


class TestProcessManagerTs:
    """Test suite for desktop-app/src/main/process-manager.ts."""

    def test_process_manager_ts_exists(self):
        """Test that process-manager.ts exists in src/main directory."""
        assert os.path.isfile(PROCESS_MANAGER_PATH), (
            f"process-manager.ts not found at {PROCESS_MANAGER_PATH}"
        )

    def test_process_manager_ts_is_not_empty(self):
        """Test that process-manager.ts has content."""
        with open(PROCESS_MANAGER_PATH, "r", encoding="utf-8") as f:
            content = f.read()
        assert len(content.strip()) > 0, "process-manager.ts must not be empty"

    def test_process_manager_has_class_or_interface(self):
        """Test that process-manager.ts defines ProcessManager class or interface."""
        with open(PROCESS_MANAGER_PATH, "r", encoding="utf-8") as f:
            content = f.read()
        has_definition = (
            "class ProcessManager" in content or
            "interface ProcessManager" in content or
            "ProcessManager" in content
        )
        assert has_definition, (
            "process-manager.ts must define ProcessManager class or interface"
        )

    def test_process_manager_has_start_ai_service(self):
        """Test that process-manager.ts has startAIService method."""
        with open(PROCESS_MANAGER_PATH, "r", encoding="utf-8") as f:
            content = f.read()
        assert "startAIService" in content, (
            "process-manager.ts must have startAIService method"
        )

    def test_process_manager_has_stop_ai_service(self):
        """Test that process-manager.ts has stopAIService method."""
        with open(PROCESS_MANAGER_PATH, "r", encoding="utf-8") as f:
            content = f.read()
        assert "stopAIService" in content, (
            "process-manager.ts must have stopAIService method"
        )

    def test_process_manager_has_start_bridge_service(self):
        """Test that process-manager.ts has startBridgeService method."""
        with open(PROCESS_MANAGER_PATH, "r", encoding="utf-8") as f:
            content = f.read()
        assert "startBridgeService" in content, (
            "process-manager.ts must have startBridgeService method"
        )

    def test_process_manager_has_stop_bridge_service(self):
        """Test that process-manager.ts has stopBridgeService method."""
        with open(PROCESS_MANAGER_PATH, "r", encoding="utf-8") as f:
            content = f.read()
        assert "stopBridgeService" in content, (
            "process-manager.ts must have stopBridgeService method"
        )

    def test_process_manager_has_check_health(self):
        """Test that process-manager.ts has health check functionality."""
        with open(PROCESS_MANAGER_PATH, "r", encoding="utf-8") as f:
            content = f.read()
        has_health_check = (
            "checkHealth" in content or
            "getStatus" in content or
            "isRunning" in content
        )
        assert has_health_check, (
            "process-manager.ts must have health check method (checkHealth/getStatus/isRunning)"
        )

    def test_process_manager_has_export(self):
        """Test that process-manager.ts exports the ProcessManager."""
        with open(PROCESS_MANAGER_PATH, "r", encoding="utf-8") as f:
            content = f.read()
        has_export = (
            "export" in content
        )
        assert has_export, (
            "process-manager.ts must export ProcessManager"
        )

    def test_process_manager_has_type_annotations(self):
        """Test that process-manager.ts uses TypeScript type annotations."""
        with open(PROCESS_MANAGER_PATH, "r", encoding="utf-8") as f:
            content = f.read()
        has_types = (
            ": Promise" in content or
            ": void" in content or
            ": boolean" in content or
            ": string" in content or
            "async " in content
        )
        assert has_types, (
            "process-manager.ts should use TypeScript type annotations"
        )
