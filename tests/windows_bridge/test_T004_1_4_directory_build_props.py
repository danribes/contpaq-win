"""
Tests for T004.1.4: Create windows-bridge/Directory.Build.props with common settings

Verifies that a Directory.Build.props file exists with common MSBuild properties
that apply to all projects in the Windows Bridge solution.
"""

import os
import xml.etree.ElementTree as ET
import pytest

# Path to the Directory.Build.props file
PROPS_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
    "windows-bridge",
    "Directory.Build.props"
)


class TestPropsFileExists:
    """Tests for Directory.Build.props file existence."""

    def test_props_file_exists(self):
        """T004.1.4: Directory.Build.props should exist at windows-bridge/."""
        assert os.path.exists(PROPS_PATH), f"Directory.Build.props not found at {PROPS_PATH}"

    def test_props_file_has_props_extension(self):
        """T004.1.4: File should have .props extension."""
        assert PROPS_PATH.endswith(".props"), "File should have .props extension"

    def test_props_file_is_not_empty(self):
        """T004.1.4: Directory.Build.props should not be empty."""
        assert os.path.getsize(PROPS_PATH) > 0, "File should not be empty"


class TestPropsFileFormat:
    """Tests for Directory.Build.props XML format."""

    @pytest.fixture
    def props_xml(self):
        """Parse props file as XML."""
        tree = ET.parse(PROPS_PATH)
        return tree.getroot()

    def test_props_is_valid_xml(self):
        """T004.1.4: Directory.Build.props should be valid XML."""
        try:
            ET.parse(PROPS_PATH)
        except ET.ParseError as e:
            pytest.fail(f"File is not valid XML: {e}")

    def test_props_has_project_root(self, props_xml):
        """T004.1.4: File should have Project root element."""
        assert props_xml.tag == "Project", "Root element should be 'Project'"


class TestBuildSettings:
    """Tests for common build settings."""

    @pytest.fixture
    def props_xml(self):
        """Parse props file as XML."""
        tree = ET.parse(PROPS_PATH)
        return tree.getroot()

    def test_has_treat_warnings_as_errors(self, props_xml):
        """T004.1.4: Should have TreatWarningsAsErrors setting."""
        treat_warnings = props_xml.find(".//TreatWarningsAsErrors")
        assert treat_warnings is not None, "Should have TreatWarningsAsErrors element"
        assert treat_warnings.text.lower() == "true", "TreatWarningsAsErrors should be true"

    def test_has_warning_level(self, props_xml):
        """T004.1.4: Should have WarningLevel setting."""
        warning_level = props_xml.find(".//WarningLevel")
        # WarningLevel is optional but recommended
        if warning_level is not None:
            assert warning_level.text in ["4", "5", "9999"], \
                "WarningLevel should be 4, 5, or 9999 (all warnings)"

    def test_has_nullable_enabled(self, props_xml):
        """T004.1.4: Should have Nullable enabled."""
        nullable = props_xml.find(".//Nullable")
        assert nullable is not None, "Should have Nullable element"
        assert nullable.text == "enable", "Nullable should be enable"

    def test_has_implicit_usings(self, props_xml):
        """T004.1.4: Should have ImplicitUsings enabled."""
        implicit_usings = props_xml.find(".//ImplicitUsings")
        assert implicit_usings is not None, "Should have ImplicitUsings element"
        assert implicit_usings.text == "enable", "ImplicitUsings should be enable"


class TestAnalyzerSettings:
    """Tests for code analysis settings."""

    @pytest.fixture
    def props_xml(self):
        """Parse props file as XML."""
        tree = ET.parse(PROPS_PATH)
        return tree.getroot()

    def test_has_enable_net_analyzers(self, props_xml):
        """T004.1.4: Should have EnableNETAnalyzers enabled."""
        analyzers = props_xml.find(".//EnableNETAnalyzers")
        assert analyzers is not None, "Should have EnableNETAnalyzers element"
        assert analyzers.text.lower() == "true", "EnableNETAnalyzers should be true"

    def test_has_analysis_level(self, props_xml):
        """T004.1.4: Should have AnalysisLevel set."""
        level = props_xml.find(".//AnalysisLevel")
        assert level is not None, "Should have AnalysisLevel element"
        # Should be latest or specific version
        assert level.text in ["latest", "8.0", "8", "latest-all", "latest-recommended"], \
            f"AnalysisLevel '{level.text}' should be 'latest' or '8.0'"


class TestAssemblyMetadata:
    """Tests for common assembly metadata."""

    @pytest.fixture
    def props_xml(self):
        """Parse props file as XML."""
        tree = ET.parse(PROPS_PATH)
        return tree.getroot()

    def test_has_company(self, props_xml):
        """T004.1.4: Should have Company metadata."""
        company = props_xml.find(".//Company")
        assert company is not None, "Should have Company element"
        assert len(company.text) > 0, "Company should not be empty"

    def test_has_product(self, props_xml):
        """T004.1.4: Should have Product metadata."""
        product = props_xml.find(".//Product")
        assert product is not None, "Should have Product element"
        assert "ContPAQ" in product.text, "Product should mention ContPAQ"

    def test_has_copyright(self, props_xml):
        """T004.1.4: Should have Copyright metadata."""
        copyright_elem = props_xml.find(".//Copyright")
        assert copyright_elem is not None, "Should have Copyright element"
        assert "2025" in copyright_elem.text or "©" in copyright_elem.text, \
            "Copyright should include year or symbol"


class TestOutputSettings:
    """Tests for output and build output settings."""

    @pytest.fixture
    def props_xml(self):
        """Parse props file as XML."""
        tree = ET.parse(PROPS_PATH)
        return tree.getroot()

    def test_has_deterministic_build(self, props_xml):
        """T004.1.4: Should have Deterministic build enabled."""
        deterministic = props_xml.find(".//Deterministic")
        assert deterministic is not None, "Should have Deterministic element"
        assert deterministic.text.lower() == "true", "Deterministic should be true"


class TestPropertyGroupStructure:
    """Tests for PropertyGroup organization."""

    @pytest.fixture
    def props_xml(self):
        """Parse props file as XML."""
        tree = ET.parse(PROPS_PATH)
        return tree.getroot()

    def test_has_property_group(self, props_xml):
        """T004.1.4: Should have at least one PropertyGroup."""
        property_groups = props_xml.findall(".//PropertyGroup")
        assert len(property_groups) >= 1, "Should have at least one PropertyGroup"

    def test_file_is_utf8(self):
        """T004.1.4: File should be UTF-8 encoded."""
        with open(PROPS_PATH, "rb") as f:
            content = f.read()
        try:
            if content.startswith(b'\xef\xbb\xbf'):
                content[3:].decode("utf-8")
            else:
                content.decode("utf-8")
        except UnicodeDecodeError:
            pytest.fail("File should be UTF-8 encoded")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
