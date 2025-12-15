"""
Test T001.1.3 - Verify windows-bridge directory structure

This test verifies that the windows-bridge directory structure is created correctly
with the required subdirectory: src/
"""

import os
import pytest

# Base path for the project
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


class TestWindowsBridgeDirectoryStructure:
    """Test cases for T001.1.3 - windows-bridge directory structure"""

    def test_windows_bridge_directory_exists(self):
        """Verify that windows-bridge/ directory exists"""
        windows_bridge_path = os.path.join(PROJECT_ROOT, "windows-bridge")
        assert os.path.isdir(windows_bridge_path), f"windows-bridge/ directory should exist at {windows_bridge_path}"

    def test_windows_bridge_src_directory_exists(self):
        """Verify that windows-bridge/src/ directory exists"""
        src_path = os.path.join(PROJECT_ROOT, "windows-bridge", "src")
        assert os.path.isdir(src_path), f"windows-bridge/src/ directory should exist at {src_path}"

    def test_directory_structure_complete(self):
        """Verify complete directory structure for windows-bridge"""
        required_dirs = [
            "windows-bridge",
            "windows-bridge/src",
        ]

        missing_dirs = []
        for dir_path in required_dirs:
            full_path = os.path.join(PROJECT_ROOT, dir_path)
            if not os.path.isdir(full_path):
                missing_dirs.append(dir_path)

        assert len(missing_dirs) == 0, f"Missing directories: {missing_dirs}"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
