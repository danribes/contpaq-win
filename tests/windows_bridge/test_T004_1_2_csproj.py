"""
Tests for T004.1.2: Create windows-bridge/src/ContPAQWinBridge/ContPAQWinBridge.csproj

Verifies that a valid .NET 8 SDK-style project file is created with proper
configuration for an ASP.NET Core Web API.
"""

import os
import xml.etree.ElementTree as ET
import pytest

# Path to the project file
CSPROJ_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
    "windows-bridge",
    "src",
    "ContPAQWinBridge",
    "ContPAQWinBridge.csproj"
)

# Path to the project directory
PROJECT_DIR = os.path.dirname(CSPROJ_PATH)


class TestProjectFileExists:
    """Tests for project file existence."""

    def test_project_file_exists(self):
        """T004.1.2: Project file should exist at correct path."""
        assert os.path.exists(CSPROJ_PATH), f"Project file not found at {CSPROJ_PATH}"

    def test_project_file_has_csproj_extension(self):
        """T004.1.2: Project file should have .csproj extension."""
        assert CSPROJ_PATH.endswith(".csproj"), "Project file should have .csproj extension"

    def test_project_file_is_not_empty(self):
        """T004.1.2: Project file should not be empty."""
        assert os.path.getsize(CSPROJ_PATH) > 0, "Project file should not be empty"

    def test_project_directory_exists(self):
        """T004.1.2: Project directory should exist."""
        assert os.path.isdir(PROJECT_DIR), f"Project directory not found at {PROJECT_DIR}"


class TestProjectFileFormat:
    """Tests for project file XML format."""

    @pytest.fixture
    def project_xml(self):
        """Parse project file as XML."""
        tree = ET.parse(CSPROJ_PATH)
        return tree.getroot()

    def test_project_is_valid_xml(self):
        """T004.1.2: Project file should be valid XML."""
        try:
            ET.parse(CSPROJ_PATH)
        except ET.ParseError as e:
            pytest.fail(f"Project file is not valid XML: {e}")

    def test_project_has_project_root(self, project_xml):
        """T004.1.2: Project file should have Project root element."""
        assert project_xml.tag == "Project", "Root element should be 'Project'"

    def test_project_is_sdk_style(self, project_xml):
        """T004.1.2: Project should be SDK-style with Sdk attribute."""
        sdk = project_xml.get("Sdk")
        assert sdk is not None, "Project should have Sdk attribute"
        assert "Microsoft.NET.Sdk" in sdk, "Project should use Microsoft.NET.Sdk"

    def test_project_uses_web_sdk(self, project_xml):
        """T004.1.2: Project should use Microsoft.NET.Sdk.Web for ASP.NET Core."""
        sdk = project_xml.get("Sdk")
        assert sdk == "Microsoft.NET.Sdk.Web", \
            "Project should use Microsoft.NET.Sdk.Web for ASP.NET Core"


class TestTargetFramework:
    """Tests for target framework configuration."""

    @pytest.fixture
    def project_xml(self):
        """Parse project file as XML."""
        tree = ET.parse(CSPROJ_PATH)
        return tree.getroot()

    def test_has_target_framework(self, project_xml):
        """T004.1.2: Project should have TargetFramework element."""
        target_framework = project_xml.find(".//TargetFramework")
        assert target_framework is not None, "Project should have TargetFramework element"

    def test_target_framework_is_net8(self, project_xml):
        """T004.1.2: Project should target .NET 8.0."""
        target_framework = project_xml.find(".//TargetFramework")
        assert target_framework is not None and target_framework.text == "net8.0", \
            "Project should target net8.0"


class TestProjectSettings:
    """Tests for project settings."""

    @pytest.fixture
    def project_xml(self):
        """Parse project file as XML."""
        tree = ET.parse(CSPROJ_PATH)
        return tree.getroot()

    def test_nullable_enabled(self, project_xml):
        """T004.1.2: Project should have nullable reference types enabled."""
        nullable = project_xml.find(".//Nullable")
        assert nullable is not None and nullable.text == "enable", \
            "Nullable should be enabled"

    def test_implicit_usings_enabled(self, project_xml):
        """T004.1.2: Project should have implicit usings enabled."""
        implicit_usings = project_xml.find(".//ImplicitUsings")
        assert implicit_usings is not None and implicit_usings.text == "enable", \
            "ImplicitUsings should be enabled"

    def test_has_root_namespace(self, project_xml):
        """T004.1.2: Project should define RootNamespace."""
        root_namespace = project_xml.find(".//RootNamespace")
        assert root_namespace is not None and root_namespace.text == "ContPAQWinBridge", \
            "RootNamespace should be ContPAQWinBridge"

    def test_has_assembly_name(self, project_xml):
        """T004.1.2: Project should define AssemblyName."""
        assembly_name = project_xml.find(".//AssemblyName")
        assert assembly_name is not None and assembly_name.text == "ContPAQWinBridge", \
            "AssemblyName should be ContPAQWinBridge"


class TestOutputSettings:
    """Tests for output and build settings."""

    @pytest.fixture
    def project_xml(self):
        """Parse project file as XML."""
        tree = ET.parse(CSPROJ_PATH)
        return tree.getroot()

    def test_output_type_is_exe(self, project_xml):
        """T004.1.2: Output type should be Exe for self-contained web host."""
        # For ASP.NET Core, default is Exe when using Web SDK, so this might be implicit
        output_type = project_xml.find(".//OutputType")
        # OutputType is optional for Web SDK (defaults to Exe), but if present should be Exe
        if output_type is not None:
            assert output_type.text == "Exe", "OutputType should be Exe"

    def test_treat_warnings_as_errors_optional(self, project_xml):
        """T004.1.2: TreatWarningsAsErrors should be set for quality."""
        # This is optional but recommended
        treat_warnings = project_xml.find(".//TreatWarningsAsErrors")
        # Just check the element exists or not, don't fail if missing
        pass  # Optional setting


class TestDocumentation:
    """Tests for documentation settings."""

    @pytest.fixture
    def project_xml(self):
        """Parse project file as XML."""
        tree = ET.parse(CSPROJ_PATH)
        return tree.getroot()

    def test_generate_documentation_file(self, project_xml):
        """T004.1.2: Project should generate XML documentation."""
        generate_doc = project_xml.find(".//GenerateDocumentationFile")
        assert generate_doc is not None and generate_doc.text.lower() == "true", \
            "GenerateDocumentationFile should be true for API documentation"


class TestVersionInfo:
    """Tests for version information."""

    @pytest.fixture
    def project_xml(self):
        """Parse project file as XML."""
        tree = ET.parse(CSPROJ_PATH)
        return tree.getroot()

    def test_has_version(self, project_xml):
        """T004.1.2: Project should have Version element."""
        version = project_xml.find(".//Version")
        assert version is not None, "Project should have Version element"

    def test_version_format_valid(self, project_xml):
        """T004.1.2: Version should follow semantic versioning."""
        version = project_xml.find(".//Version")
        if version is not None:
            import re
            # Basic semver pattern
            pattern = r'^\d+\.\d+\.\d+(-[a-zA-Z0-9]+)?$'
            assert re.match(pattern, version.text), \
                f"Version '{version.text}' should follow semantic versioning"


class TestEncodingAndFormat:
    """Tests for file encoding and format."""

    def test_file_is_utf8(self):
        """T004.1.2: Project file should be UTF-8 encoded."""
        with open(CSPROJ_PATH, "rb") as f:
            content = f.read()
        try:
            # Try to decode as UTF-8 (with or without BOM)
            if content.startswith(b'\xef\xbb\xbf'):
                content[3:].decode("utf-8")
            else:
                content.decode("utf-8")
        except UnicodeDecodeError:
            pytest.fail("Project file should be UTF-8 encoded")

    def test_has_xml_declaration(self):
        """T004.1.2: Project file should have XML declaration (optional but good practice)."""
        with open(CSPROJ_PATH, "r", encoding="utf-8") as f:
            first_line = f.readline().strip()
        # SDK-style projects don't require XML declaration, but check content
        # Either starts with <?xml or <Project
        assert first_line.startswith("<?xml") or first_line.startswith("<Project"), \
            "Project file should start with XML declaration or Project element"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
