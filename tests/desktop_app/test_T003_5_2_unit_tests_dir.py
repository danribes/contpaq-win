"""
Tests for T003.5.2: Create desktop-app/tests/unit/ directory

Tests verify that the unit tests directory structure exists with proper
organization for testing different parts of the desktop application.
"""

import os

import pytest


# Base path for the desktop-app tests directory
DESKTOP_APP_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
    "desktop-app",
)
TESTS_PATH = os.path.join(DESKTOP_APP_PATH, "tests")
UNIT_TESTS_PATH = os.path.join(TESTS_PATH, "tests", "unit")


class TestUnitTestsDirectory:
    """Test suite for desktop-app/tests/unit/ directory structure."""

    def test_tests_directory_exists(self):
        """Test that tests directory exists in desktop-app."""
        tests_dir = os.path.join(DESKTOP_APP_PATH, "tests")
        assert os.path.isdir(tests_dir), "desktop-app/tests/ directory must exist"

    def test_unit_directory_exists(self):
        """Test that unit directory exists in tests."""
        unit_dir = os.path.join(DESKTOP_APP_PATH, "tests", "unit")
        assert os.path.isdir(unit_dir), "desktop-app/tests/unit/ directory must exist"

    def test_unit_init_file_exists(self):
        """Test that __init__.py exists in unit directory."""
        init_file = os.path.join(DESKTOP_APP_PATH, "tests", "unit", "__init__.py")
        assert os.path.isfile(init_file), "desktop-app/tests/unit/__init__.py must exist"

    def test_unit_init_has_docstring(self):
        """Test that __init__.py has a module docstring."""
        init_file = os.path.join(DESKTOP_APP_PATH, "tests", "unit", "__init__.py")
        with open(init_file, "r", encoding="utf-8") as f:
            content = f.read()
        assert '"""' in content or "'''" in content, "__init__.py should have a docstring"

    def test_components_subdirectory_exists(self):
        """Test that components subdirectory exists for React component tests."""
        components_dir = os.path.join(DESKTOP_APP_PATH, "tests", "unit", "components")
        assert os.path.isdir(components_dir), "tests/unit/components/ directory must exist"

    def test_components_init_file_exists(self):
        """Test that __init__.py exists in components directory."""
        init_file = os.path.join(DESKTOP_APP_PATH, "tests", "unit", "components", "__init__.py")
        assert os.path.isfile(init_file), "tests/unit/components/__init__.py must exist"

    def test_hooks_subdirectory_exists(self):
        """Test that hooks subdirectory exists for React hooks tests."""
        hooks_dir = os.path.join(DESKTOP_APP_PATH, "tests", "unit", "hooks")
        assert os.path.isdir(hooks_dir), "tests/unit/hooks/ directory must exist"

    def test_hooks_init_file_exists(self):
        """Test that __init__.py exists in hooks directory."""
        init_file = os.path.join(DESKTOP_APP_PATH, "tests", "unit", "hooks", "__init__.py")
        assert os.path.isfile(init_file), "tests/unit/hooks/__init__.py must exist"

    def test_utils_subdirectory_exists(self):
        """Test that utils subdirectory exists for utility function tests."""
        utils_dir = os.path.join(DESKTOP_APP_PATH, "tests", "unit", "utils")
        assert os.path.isdir(utils_dir), "tests/unit/utils/ directory must exist"

    def test_utils_init_file_exists(self):
        """Test that __init__.py exists in utils directory."""
        init_file = os.path.join(DESKTOP_APP_PATH, "tests", "unit", "utils", "__init__.py")
        assert os.path.isfile(init_file), "tests/unit/utils/__init__.py must exist"

    def test_services_subdirectory_exists(self):
        """Test that services subdirectory exists for service tests."""
        services_dir = os.path.join(DESKTOP_APP_PATH, "tests", "unit", "services")
        assert os.path.isdir(services_dir), "tests/unit/services/ directory must exist"

    def test_services_init_file_exists(self):
        """Test that __init__.py exists in services directory."""
        init_file = os.path.join(DESKTOP_APP_PATH, "tests", "unit", "services", "__init__.py")
        assert os.path.isfile(init_file), "tests/unit/services/__init__.py must exist"

    def test_setup_file_exists(self):
        """Test that setup.ts exists in tests directory."""
        setup_file = os.path.join(DESKTOP_APP_PATH, "tests", "setup.ts")
        assert os.path.isfile(setup_file), "desktop-app/tests/setup.ts must exist"

    def test_setup_file_imports_testing_library(self):
        """Test that setup.ts imports testing-library/jest-dom."""
        setup_file = os.path.join(DESKTOP_APP_PATH, "tests", "setup.ts")
        with open(setup_file, "r", encoding="utf-8") as f:
            content = f.read()
        assert "@testing-library/jest-dom" in content, "setup.ts should import @testing-library/jest-dom"

    def test_setup_file_has_window_mocks(self):
        """Test that setup.ts has window mocks for Electron."""
        setup_file = os.path.join(DESKTOP_APP_PATH, "tests", "setup.ts")
        with open(setup_file, "r", encoding="utf-8") as f:
            content = f.read()
        # Should have some kind of window or global mock
        assert "window" in content.lower() or "global" in content.lower(), \
            "setup.ts should have window/global mocks"
