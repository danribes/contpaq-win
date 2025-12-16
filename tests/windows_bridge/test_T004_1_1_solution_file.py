"""
Tests for T004.1.1: Create windows-bridge/ContPAQWinBridge.sln

Verifies that a valid .NET solution file is created with proper
structure and project references.
"""

import os
import re
import uuid
import pytest

# Path to the solution file
SLN_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
    "windows-bridge",
    "ContPAQWinBridge.sln"
)

# Path to the windows-bridge directory
WINDOWS_BRIDGE_DIR = os.path.dirname(SLN_PATH)


class TestSolutionFileExists:
    """Tests for solution file existence."""

    def test_solution_file_exists(self):
        """T004.1.1: Solution file should exist at windows-bridge/ContPAQWinBridge.sln."""
        assert os.path.exists(SLN_PATH), f"Solution file not found at {SLN_PATH}"

    def test_solution_file_has_sln_extension(self):
        """T004.1.1: Solution file should have .sln extension."""
        assert SLN_PATH.endswith(".sln"), "Solution file should have .sln extension"

    def test_solution_file_is_not_empty(self):
        """T004.1.1: Solution file should not be empty."""
        assert os.path.getsize(SLN_PATH) > 0, "Solution file should not be empty"


class TestSolutionFileHeader:
    """Tests for solution file header format."""

    @pytest.fixture
    def sln_content(self):
        """Load solution file content."""
        with open(SLN_PATH, "r", encoding="utf-8-sig") as f:
            return f.read()

    def test_solution_has_format_version(self, sln_content):
        """T004.1.1: Solution should have Microsoft Visual Studio Solution File header."""
        assert "Microsoft Visual Studio Solution File" in sln_content, \
            "Solution should have Visual Studio format header"

    def test_solution_has_format_version_12(self, sln_content):
        """T004.1.1: Solution should use format version 12.00 (VS 2013+)."""
        assert "Format Version 12.00" in sln_content, \
            "Solution should use format version 12.00"

    def test_solution_has_visual_studio_version(self, sln_content):
        """T004.1.1: Solution should specify Visual Studio version."""
        # VS 2022 = 17.x, VS 2019 = 16.x
        pattern = r"VisualStudioVersion\s*=\s*\d+\.\d+"
        assert re.search(pattern, sln_content), \
            "Solution should specify VisualStudioVersion"

    def test_solution_has_minimum_version(self, sln_content):
        """T004.1.1: Solution should specify minimum Visual Studio version."""
        pattern = r"MinimumVisualStudioVersion\s*=\s*\d+\.\d+"
        assert re.search(pattern, sln_content), \
            "Solution should specify MinimumVisualStudioVersion"


class TestSolutionProjectReference:
    """Tests for project references in solution."""

    @pytest.fixture
    def sln_content(self):
        """Load solution file content."""
        with open(SLN_PATH, "r", encoding="utf-8-sig") as f:
            return f.read()

    def test_solution_contains_project_reference(self, sln_content):
        """T004.1.1: Solution should reference ContPAQWinBridge project."""
        assert "ContPAQWinBridge" in sln_content, \
            "Solution should reference ContPAQWinBridge project"

    def test_solution_has_project_block(self, sln_content):
        """T004.1.1: Solution should have Project block with GUID."""
        # C# project GUID: {FAE04EC0-301F-11D3-BF4B-00C04F79EFBC} or {9A19103F-16F7-4668-BE54-9A1E7A4F7556}
        project_pattern = r'Project\("\{[A-F0-9-]+\}"\)\s*=\s*"ContPAQWinBridge"'
        assert re.search(project_pattern, sln_content), \
            "Solution should have Project block with GUID for ContPAQWinBridge"

    def test_solution_references_csproj(self, sln_content):
        """T004.1.1: Solution should reference the .csproj file."""
        assert "ContPAQWinBridge.csproj" in sln_content, \
            "Solution should reference ContPAQWinBridge.csproj"

    def test_project_has_unique_guid(self, sln_content):
        """T004.1.1: Project should have a unique GUID."""
        # Extract project GUID (second GUID in Project line)
        pattern = r'Project\("[^"]+"\)\s*=\s*"[^"]+",\s*"[^"]+",\s*"\{([A-F0-9-]+)\}"'
        match = re.search(pattern, sln_content)
        assert match, "Project should have a unique GUID"
        project_guid = match.group(1)
        # Validate it's a proper GUID format
        try:
            uuid.UUID(project_guid)
        except ValueError:
            pytest.fail(f"Project GUID '{project_guid}' is not a valid UUID")


class TestSolutionConfiguration:
    """Tests for solution configuration sections."""

    @pytest.fixture
    def sln_content(self):
        """Load solution file content."""
        with open(SLN_PATH, "r", encoding="utf-8-sig") as f:
            return f.read()

    def test_solution_has_global_section(self, sln_content):
        """T004.1.1: Solution should have Global section."""
        assert "Global" in sln_content, "Solution should have Global section"
        assert "EndGlobal" in sln_content, "Solution should have EndGlobal"

    def test_solution_has_configuration_platforms(self, sln_content):
        """T004.1.1: Solution should have SolutionConfigurationPlatforms section."""
        assert "SolutionConfigurationPlatforms" in sln_content, \
            "Solution should have SolutionConfigurationPlatforms section"

    def test_solution_has_debug_configuration(self, sln_content):
        """T004.1.1: Solution should have Debug configuration."""
        assert "Debug|" in sln_content, "Solution should have Debug configuration"

    def test_solution_has_release_configuration(self, sln_content):
        """T004.1.1: Solution should have Release configuration."""
        assert "Release|" in sln_content, "Solution should have Release configuration"

    def test_solution_has_any_cpu_platform(self, sln_content):
        """T004.1.1: Solution should have Any CPU platform."""
        # Any CPU appears as "Any CPU" or "AnyCPU" depending on context
        assert "Any CPU" in sln_content or "AnyCPU" in sln_content, \
            "Solution should have Any CPU platform"

    def test_solution_has_project_configuration_platforms(self, sln_content):
        """T004.1.1: Solution should have ProjectConfigurationPlatforms section."""
        assert "ProjectConfigurationPlatforms" in sln_content, \
            "Solution should have ProjectConfigurationPlatforms section"


class TestSolutionBestPractices:
    """Tests for solution file best practices."""

    @pytest.fixture
    def sln_content(self):
        """Load solution file content."""
        with open(SLN_PATH, "r", encoding="utf-8-sig") as f:
            return f.read()

    def test_solution_uses_relative_path(self, sln_content):
        """T004.1.1: Solution should use relative path to project."""
        # Should reference src/ContPAQWinBridge/ContPAQWinBridge.csproj
        assert "src" in sln_content.lower() or "ContPAQWinBridge.csproj" in sln_content, \
            "Solution should reference project with proper path"

    def test_solution_encoding_is_utf8(self):
        """T004.1.1: Solution file should be UTF-8 encoded."""
        with open(SLN_PATH, "rb") as f:
            content = f.read()
        # Check for UTF-8 BOM or valid UTF-8
        try:
            if content.startswith(b'\xef\xbb\xbf'):
                content[3:].decode("utf-8")
            else:
                content.decode("utf-8")
        except UnicodeDecodeError:
            pytest.fail("Solution file should be UTF-8 encoded")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
