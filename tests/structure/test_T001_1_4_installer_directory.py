"""
Test T001.1.4 - Verify installer directory structure

This test verifies that the installer directory structure is created correctly
with the required subdirectories: scripts/ and assets/
"""

import os
import pytest

# Base path for the project
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


class TestInstallerDirectoryStructure:
    """Test cases for T001.1.4 - installer directory structure"""

    def test_installer_directory_exists(self):
        """Verify that installer/ directory exists"""
        installer_path = os.path.join(PROJECT_ROOT, "installer")
        assert os.path.isdir(installer_path), f"installer/ directory should exist at {installer_path}"

    def test_installer_scripts_directory_exists(self):
        """Verify that installer/scripts/ directory exists"""
        scripts_path = os.path.join(PROJECT_ROOT, "installer", "scripts")
        assert os.path.isdir(scripts_path), f"installer/scripts/ directory should exist at {scripts_path}"

    def test_installer_assets_directory_exists(self):
        """Verify that installer/assets/ directory exists"""
        assets_path = os.path.join(PROJECT_ROOT, "installer", "assets")
        assert os.path.isdir(assets_path), f"installer/assets/ directory should exist at {assets_path}"

    def test_directory_structure_complete(self):
        """Verify complete directory structure for installer"""
        required_dirs = [
            "installer",
            "installer/scripts",
            "installer/assets",
        ]

        missing_dirs = []
        for dir_path in required_dirs:
            full_path = os.path.join(PROJECT_ROOT, dir_path)
            if not os.path.isdir(full_path):
                missing_dirs.append(dir_path)

        assert len(missing_dirs) == 0, f"Missing directories: {missing_dirs}"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
