"""
Tests for T004.3.1: Create Controllers/ directory

Verifies that the Controllers directory exists with proper structure
for ASP.NET Core API controllers.
"""

import os
import pytest

# Path to the ContPAQWinBridge project directory
PROJECT_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
    "windows-bridge",
    "src",
    "ContPAQWinBridge"
)

CONTROLLERS_PATH = os.path.join(PROJECT_PATH, "Controllers")


class TestControllersDirectoryExists:
    """Tests for Controllers directory existence."""

    def test_controllers_directory_exists(self):
        """T004.3.1: Controllers directory should exist."""
        assert os.path.exists(CONTROLLERS_PATH), \
            f"Controllers directory not found at {CONTROLLERS_PATH}"

    def test_controllers_is_directory(self):
        """T004.3.1: Controllers should be a directory, not a file."""
        assert os.path.isdir(CONTROLLERS_PATH), \
            "Controllers should be a directory"


class TestControllersPlaceholder:
    """Tests for Controllers directory placeholder file."""

    def test_has_placeholder_file(self):
        """T004.3.1: Should have a placeholder or base controller file."""
        files = os.listdir(CONTROLLERS_PATH) if os.path.exists(CONTROLLERS_PATH) else []
        has_file = len(files) > 0
        assert has_file, "Controllers directory should have at least one file"

    def test_has_gitkeep_or_cs_file(self):
        """T004.3.1: Should have .gitkeep or .cs file."""
        if not os.path.exists(CONTROLLERS_PATH):
            pytest.skip("Controllers directory doesn't exist yet")

        files = os.listdir(CONTROLLERS_PATH)
        has_valid_file = any(
            f.endswith('.cs') or f == '.gitkeep' or f.endswith('.md')
            for f in files
        )
        assert has_valid_file, \
            "Should have .gitkeep, .cs, or documentation file"


class TestBaseControllerExists:
    """Tests for base controller class."""

    def test_has_base_controller_or_placeholder(self):
        """T004.3.1: Should have base controller or placeholder."""
        if not os.path.exists(CONTROLLERS_PATH):
            pytest.skip("Controllers directory doesn't exist yet")

        files = os.listdir(CONTROLLERS_PATH)
        has_controller = any(
            'Controller' in f or f == '.gitkeep' or f == 'README.md'
            for f in files
        )
        assert has_controller, \
            "Should have controller file or placeholder"


class TestControllerFileContent:
    """Tests for controller file content."""

    @pytest.fixture
    def controller_files(self):
        """Get list of .cs files in Controllers directory."""
        if not os.path.exists(CONTROLLERS_PATH):
            return []
        return [f for f in os.listdir(CONTROLLERS_PATH) if f.endswith('.cs')]

    def test_controller_has_namespace(self, controller_files):
        """T004.3.1: Controller files should have correct namespace."""
        if not controller_files:
            pytest.skip("No controller files yet")

        for filename in controller_files:
            filepath = os.path.join(CONTROLLERS_PATH, filename)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            assert 'namespace ContPAQWinBridge.Controllers' in content, \
                f"{filename} should have ContPAQWinBridge.Controllers namespace"

    def test_controller_uses_api_controller_attribute(self, controller_files):
        """T004.3.1: Controller files should use ApiController attribute."""
        if not controller_files:
            pytest.skip("No controller files yet")

        for filename in controller_files:
            filepath = os.path.join(CONTROLLERS_PATH, filename)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            # Either has [ApiController] or is a base class
            has_api_attr = (
                '[ApiController]' in content or
                'abstract' in content or
                'BaseController' in filename
            )
            assert has_api_attr, \
                f"{filename} should use [ApiController] or be abstract base"

    def test_controller_inherits_controller_base(self, controller_files):
        """T004.3.1: Controller should inherit from ControllerBase."""
        if not controller_files:
            pytest.skip("No controller files yet")

        for filename in controller_files:
            filepath = os.path.join(CONTROLLERS_PATH, filename)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            has_inheritance = (
                ': ControllerBase' in content or
                'ControllerBase' in content
            )
            assert has_inheritance, \
                f"{filename} should inherit from ControllerBase"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
