"""
Test T001.1.2 - Verify desktop-app directory structure

This test verifies that the desktop-app directory structure is created correctly
with the required subdirectories: src/main/ and src/renderer/
"""

import os
import pytest

# Base path for the project
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


class TestDesktopAppDirectoryStructure:
    """Test cases for T001.1.2 - desktop-app directory structure"""

    def test_desktop_app_directory_exists(self):
        """Verify that desktop-app/ directory exists"""
        desktop_app_path = os.path.join(PROJECT_ROOT, "desktop-app")
        assert os.path.isdir(desktop_app_path), f"desktop-app/ directory should exist at {desktop_app_path}"

    def test_desktop_app_src_directory_exists(self):
        """Verify that desktop-app/src/ directory exists"""
        src_path = os.path.join(PROJECT_ROOT, "desktop-app", "src")
        assert os.path.isdir(src_path), f"desktop-app/src/ directory should exist at {src_path}"

    def test_desktop_app_src_main_directory_exists(self):
        """Verify that desktop-app/src/main/ directory exists (Electron main process)"""
        main_path = os.path.join(PROJECT_ROOT, "desktop-app", "src", "main")
        assert os.path.isdir(main_path), f"desktop-app/src/main/ directory should exist at {main_path}"

    def test_desktop_app_src_renderer_directory_exists(self):
        """Verify that desktop-app/src/renderer/ directory exists (React UI)"""
        renderer_path = os.path.join(PROJECT_ROOT, "desktop-app", "src", "renderer")
        assert os.path.isdir(renderer_path), f"desktop-app/src/renderer/ directory should exist at {renderer_path}"

    def test_directory_structure_complete(self):
        """Verify complete directory structure for desktop-app"""
        required_dirs = [
            "desktop-app",
            "desktop-app/src",
            "desktop-app/src/main",
            "desktop-app/src/renderer",
        ]

        missing_dirs = []
        for dir_path in required_dirs:
            full_path = os.path.join(PROJECT_ROOT, dir_path)
            if not os.path.isdir(full_path):
                missing_dirs.append(dir_path)

        assert len(missing_dirs) == 0, f"Missing directories: {missing_dirs}"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
