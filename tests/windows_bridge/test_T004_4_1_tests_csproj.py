"""
Tests for T004.4.1: Create ContPAQWinBridge.Tests.csproj

Verifies that the test project is properly configured as a .NET 8.0
xUnit test project with appropriate references.
"""

import os
import re
import xml.etree.ElementTree as ET
import pytest

# Path to the test project directory
PROJECT_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
    "windows-bridge",
    "src",
    "ContPAQWinBridge.Tests"
)

CSPROJ_PATH = os.path.join(PROJECT_PATH, "ContPAQWinBridge.Tests.csproj")


class TestTestProjectExists:
    """Tests for test project existence."""

    def test_tests_directory_exists(self):
        """T004.4.1: ContPAQWinBridge.Tests directory should exist."""
        assert os.path.exists(PROJECT_PATH), \
            f"Test project directory not found at {PROJECT_PATH}"

    def test_tests_csproj_exists(self):
        """T004.4.1: ContPAQWinBridge.Tests.csproj should exist."""
        assert os.path.exists(CSPROJ_PATH), \
            f"Test project file not found at {CSPROJ_PATH}"


class TestCsprojStructure:
    """Tests for csproj XML structure."""

    @pytest.fixture
    def csproj_tree(self):
        """Parse the csproj XML."""
        if not os.path.exists(CSPROJ_PATH):
            pytest.skip("Test project not created yet")
        return ET.parse(CSPROJ_PATH)

    @pytest.fixture
    def csproj_root(self, csproj_tree):
        """Get the root element."""
        return csproj_tree.getroot()

    def test_is_valid_xml(self):
        """T004.4.1: csproj should be valid XML."""
        if not os.path.exists(CSPROJ_PATH):
            pytest.skip("Test project not created yet")
        try:
            ET.parse(CSPROJ_PATH)
        except ET.ParseError as e:
            pytest.fail(f"Invalid XML: {e}")

    def test_uses_sdk_style_project(self, csproj_root):
        """T004.4.1: Should use SDK-style project format."""
        sdk = csproj_root.get("Sdk")
        assert sdk is not None, "Should have Sdk attribute"
        assert "Microsoft.NET.Sdk" in sdk, "Should use Microsoft.NET.Sdk"

    def test_targets_net8(self, csproj_root):
        """T004.4.1: Should target .NET 8.0."""
        tf = csproj_root.find(".//TargetFramework")
        assert tf is not None, "Should have TargetFramework element"
        assert tf.text == "net8.0", "Should target net8.0"

    def test_has_implicit_usings(self, csproj_root):
        """T004.4.1: Should have ImplicitUsings enabled."""
        iu = csproj_root.find(".//ImplicitUsings")
        assert iu is not None, "Should have ImplicitUsings element"
        assert iu.text.lower() == "enable", "ImplicitUsings should be enabled"

    def test_has_nullable_enabled(self, csproj_root):
        """T004.4.1: Should have nullable reference types enabled."""
        nullable = csproj_root.find(".//Nullable")
        assert nullable is not None, "Should have Nullable element"
        assert nullable.text.lower() == "enable", "Nullable should be enabled"

    def test_is_not_packable(self, csproj_root):
        """T004.4.1: Test project should not be packable."""
        is_packable = csproj_root.find(".//IsPackable")
        assert is_packable is not None, "Should have IsPackable element"
        assert is_packable.text.lower() == "false", "Test project should not be packable"


class TestProjectReference:
    """Tests for project reference to main project."""

    @pytest.fixture
    def csproj_content(self):
        """Read raw csproj content."""
        if not os.path.exists(CSPROJ_PATH):
            pytest.skip("Test project not created yet")
        with open(CSPROJ_PATH, 'r', encoding='utf-8') as f:
            return f.read()

    @pytest.fixture
    def csproj_root(self):
        """Parse and return root element."""
        if not os.path.exists(CSPROJ_PATH):
            pytest.skip("Test project not created yet")
        return ET.parse(CSPROJ_PATH).getroot()

    def test_references_main_project(self, csproj_root):
        """T004.4.1: Should reference ContPAQWinBridge project."""
        project_refs = csproj_root.findall(".//ProjectReference")
        assert len(project_refs) >= 1, "Should have at least one ProjectReference"

        ref_paths = [ref.get("Include", "") for ref in project_refs]
        has_main_ref = any("ContPAQWinBridge.csproj" in path for path in ref_paths)
        assert has_main_ref, "Should reference ContPAQWinBridge.csproj"

    def test_project_reference_is_relative(self, csproj_content):
        """T004.4.1: Project reference should use relative path."""
        # Should reference parent directory
        assert ".." in csproj_content, \
            "Project reference should use relative path with .."


class TestOutputType:
    """Tests for output configuration."""

    @pytest.fixture
    def csproj_root(self):
        """Parse and return root element."""
        if not os.path.exists(CSPROJ_PATH):
            pytest.skip("Test project not created yet")
        return ET.parse(CSPROJ_PATH).getroot()

    def test_output_type_not_exe(self, csproj_root):
        """T004.4.1: Test project should be library (default for test projects)."""
        # SDK test projects default to Library which is correct
        # If OutputType is set, it should not be Exe
        output_type = csproj_root.find(".//OutputType")
        if output_type is not None:
            assert output_type.text.lower() != "exe", \
                "Test project should not be an executable"


class TestRootNamespace:
    """Tests for namespace configuration."""

    @pytest.fixture
    def csproj_content(self):
        """Read raw csproj content."""
        if not os.path.exists(CSPROJ_PATH):
            pytest.skip("Test project not created yet")
        with open(CSPROJ_PATH, 'r', encoding='utf-8') as f:
            return f.read()

    def test_has_root_namespace(self, csproj_content):
        """T004.4.1: Should define RootNamespace."""
        assert "RootNamespace" in csproj_content or "ContPAQWinBridge.Tests" in csproj_content, \
            "Should have RootNamespace defined or use default from project name"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
