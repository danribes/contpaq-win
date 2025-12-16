"""
Tests for T004.4.2: Add xUnit, Moq, FluentAssertions packages

Verifies that the test project has all required testing packages
with appropriate versions.
"""

import os
import xml.etree.ElementTree as ET
import pytest

# Path to the test project csproj
CSPROJ_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
    "windows-bridge",
    "src",
    "ContPAQWinBridge.Tests",
    "ContPAQWinBridge.Tests.csproj"
)


class TestCsprojExists:
    """Prerequisite test for csproj existence."""

    def test_csproj_exists(self):
        """T004.4.2: Test project csproj should exist."""
        assert os.path.exists(CSPROJ_PATH), \
            f"Test project csproj not found at {CSPROJ_PATH}"


class TestXunitPackages:
    """Tests for xUnit packages."""

    @pytest.fixture
    def csproj_content(self):
        """Read raw csproj content."""
        if not os.path.exists(CSPROJ_PATH):
            pytest.skip("Test project not created yet")
        with open(CSPROJ_PATH, 'r', encoding='utf-8') as f:
            return f.read()

    @pytest.fixture
    def package_refs(self):
        """Get all PackageReference elements."""
        if not os.path.exists(CSPROJ_PATH):
            pytest.skip("Test project not created yet")
        tree = ET.parse(CSPROJ_PATH)
        root = tree.getroot()
        return {ref.get("Include"): ref.get("Version") for ref in root.findall(".//PackageReference")}

    def test_has_xunit(self, package_refs):
        """T004.4.2: Should have xUnit package."""
        assert "xunit" in package_refs, \
            "Should have xunit package"

    def test_has_xunit_runner(self, package_refs):
        """T004.4.2: Should have xUnit.runner.visualstudio."""
        assert "xunit.runner.visualstudio" in package_refs, \
            "Should have xunit.runner.visualstudio package"

    def test_has_microsoft_test_sdk(self, package_refs):
        """T004.4.2: Should have Microsoft.NET.Test.Sdk."""
        assert "Microsoft.NET.Test.Sdk" in package_refs, \
            "Should have Microsoft.NET.Test.Sdk package"


class TestMoqPackage:
    """Tests for Moq package."""

    @pytest.fixture
    def package_refs(self):
        """Get all PackageReference elements."""
        if not os.path.exists(CSPROJ_PATH):
            pytest.skip("Test project not created yet")
        tree = ET.parse(CSPROJ_PATH)
        root = tree.getroot()
        return {ref.get("Include"): ref.get("Version") for ref in root.findall(".//PackageReference")}

    def test_has_moq(self, package_refs):
        """T004.4.2: Should have Moq package."""
        assert "Moq" in package_refs, \
            "Should have Moq package"


class TestFluentAssertionsPackage:
    """Tests for FluentAssertions package."""

    @pytest.fixture
    def package_refs(self):
        """Get all PackageReference elements."""
        if not os.path.exists(CSPROJ_PATH):
            pytest.skip("Test project not created yet")
        tree = ET.parse(CSPROJ_PATH)
        root = tree.getroot()
        return {ref.get("Include"): ref.get("Version") for ref in root.findall(".//PackageReference")}

    def test_has_fluent_assertions(self, package_refs):
        """T004.4.2: Should have FluentAssertions package."""
        assert "FluentAssertions" in package_refs, \
            "Should have FluentAssertions package"


class TestCoverletPackage:
    """Tests for code coverage package."""

    @pytest.fixture
    def package_refs(self):
        """Get all PackageReference elements."""
        if not os.path.exists(CSPROJ_PATH):
            pytest.skip("Test project not created yet")
        tree = ET.parse(CSPROJ_PATH)
        root = tree.getroot()
        return {ref.get("Include"): ref.get("Version") for ref in root.findall(".//PackageReference")}

    def test_has_coverlet(self, package_refs):
        """T004.4.2: Should have coverlet.collector for coverage."""
        assert "coverlet.collector" in package_refs, \
            "Should have coverlet.collector package"


class TestPackageVersions:
    """Tests for package version specifications."""

    @pytest.fixture
    def csproj_content(self):
        """Read raw csproj content."""
        if not os.path.exists(CSPROJ_PATH):
            pytest.skip("Test project not created yet")
        with open(CSPROJ_PATH, 'r', encoding='utf-8') as f:
            return f.read()

    @pytest.fixture
    def package_refs(self):
        """Get all PackageReference elements."""
        if not os.path.exists(CSPROJ_PATH):
            pytest.skip("Test project not created yet")
        tree = ET.parse(CSPROJ_PATH)
        root = tree.getroot()
        return {ref.get("Include"): ref.get("Version") for ref in root.findall(".//PackageReference")}

    def test_all_packages_have_versions(self, package_refs):
        """T004.4.2: All packages should have version specified."""
        for package, version in package_refs.items():
            assert version is not None, \
                f"Package {package} should have version specified"
            assert version.strip() != "", \
                f"Package {package} should have non-empty version"

    def test_xunit_version_recent(self, package_refs):
        """T004.4.2: xUnit should be version 2.x."""
        if "xunit" not in package_refs:
            pytest.skip("xunit package not present")
        version = package_refs["xunit"]
        assert version.startswith("2."), \
            f"xunit should be version 2.x, got {version}"

    def test_moq_version_recent(self, package_refs):
        """T004.4.2: Moq should be version 4.x."""
        if "Moq" not in package_refs:
            pytest.skip("Moq package not present")
        version = package_refs["Moq"]
        assert version.startswith("4."), \
            f"Moq should be version 4.x, got {version}"

    def test_fluent_assertions_version_recent(self, package_refs):
        """T004.4.2: FluentAssertions should be version 6.x or 7.x."""
        if "FluentAssertions" not in package_refs:
            pytest.skip("FluentAssertions package not present")
        version = package_refs["FluentAssertions"]
        assert version.startswith(("6.", "7.")), \
            f"FluentAssertions should be version 6.x or 7.x, got {version}"


class TestPackageStructure:
    """Tests for proper package reference structure."""

    @pytest.fixture
    def csproj_content(self):
        """Read raw csproj content."""
        if not os.path.exists(CSPROJ_PATH):
            pytest.skip("Test project not created yet")
        with open(CSPROJ_PATH, 'r', encoding='utf-8') as f:
            return f.read()

    def test_packages_in_item_group(self, csproj_content):
        """T004.4.2: PackageReferences should be in ItemGroup."""
        assert "<ItemGroup>" in csproj_content, \
            "Should have ItemGroup element"
        assert "<PackageReference" in csproj_content, \
            "Should have PackageReference elements"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
