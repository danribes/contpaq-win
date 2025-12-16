"""
Tests for T004.4.3: Create Controllers/ test directory

Verifies that the Controllers test directory exists with proper structure
and initial test file.
"""

import os
import pytest

# Path to the test project directory
PROJECT_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
    "windows-bridge",
    "src",
    "ContPAQWinBridge.Tests"
)

CONTROLLERS_PATH = os.path.join(PROJECT_PATH, "Controllers")


class TestControllersDirectoryExists:
    """Tests for Controllers directory existence."""

    def test_controllers_directory_exists(self):
        """T004.4.3: Controllers test directory should exist."""
        assert os.path.exists(CONTROLLERS_PATH), \
            f"Controllers directory not found at {CONTROLLERS_PATH}"

    def test_controllers_is_directory(self):
        """T004.4.3: Controllers should be a directory, not a file."""
        assert os.path.isdir(CONTROLLERS_PATH), \
            "Controllers should be a directory"


class TestControllersHasFiles:
    """Tests for controller test files."""

    @pytest.fixture
    def controller_files(self):
        """Get list of files in Controllers directory."""
        if not os.path.exists(CONTROLLERS_PATH):
            return []
        return os.listdir(CONTROLLERS_PATH)

    def test_has_cs_files(self, controller_files):
        """T004.4.3: Should have at least one .cs file."""
        cs_files = [f for f in controller_files if f.endswith('.cs')]
        assert len(cs_files) >= 1, \
            "Should have at least one .cs test file"

    def test_has_test_file(self, controller_files):
        """T004.4.3: Should have a *Tests.cs file."""
        test_files = [f for f in controller_files if f.endswith('Tests.cs')]
        assert len(test_files) >= 1, \
            "Should have at least one *Tests.cs file"


class TestControllerTestFileContent:
    """Tests for controller test file content."""

    @pytest.fixture
    def test_files(self):
        """Get list of .cs files with full paths."""
        if not os.path.exists(CONTROLLERS_PATH):
            return []
        files = [f for f in os.listdir(CONTROLLERS_PATH) if f.endswith('.cs')]
        return [(f, os.path.join(CONTROLLERS_PATH, f)) for f in files]

    def test_has_correct_namespace(self, test_files):
        """T004.4.3: Test files should have correct namespace."""
        for filename, filepath in test_files:
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            assert 'namespace ContPAQWinBridge.Tests.Controllers' in content, \
                f"{filename} should have ContPAQWinBridge.Tests.Controllers namespace"

    def test_uses_xunit(self, test_files):
        """T004.4.3: Test files should use xUnit."""
        for filename, filepath in test_files:
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            has_xunit = 'using Xunit;' in content or '[Fact]' in content or '[Theory]' in content
            assert has_xunit, \
                f"{filename} should use xUnit framework"

    def test_has_test_class(self, test_files):
        """T004.4.3: Should have test class definition."""
        for filename, filepath in test_files:
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            assert 'public class' in content, \
                f"{filename} should have public class definition"


class TestPlaceholderContent:
    """Tests for placeholder test structure."""

    @pytest.fixture
    def first_test_file_content(self):
        """Get content of first test file."""
        if not os.path.exists(CONTROLLERS_PATH):
            pytest.skip("Controllers directory doesn't exist yet")
        files = [f for f in os.listdir(CONTROLLERS_PATH) if f.endswith('.cs')]
        if not files:
            pytest.skip("No .cs files yet")
        filepath = os.path.join(CONTROLLERS_PATH, files[0])
        with open(filepath, 'r', encoding='utf-8') as f:
            return f.read()

    def test_has_placeholder_test(self, first_test_file_content):
        """T004.4.3: Should have at least one test method."""
        has_fact = '[Fact]' in first_test_file_content
        has_theory = '[Theory]' in first_test_file_content
        assert has_fact or has_theory, \
            "Should have at least one [Fact] or [Theory] test"

    def test_mentions_controllers(self, first_test_file_content):
        """T004.4.3: Test file should be related to controllers."""
        mentions = (
            'Controller' in first_test_file_content or
            'controller' in first_test_file_content
        )
        assert mentions, \
            "Test file should mention controllers"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
