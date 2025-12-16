"""
Tests for T004.1.3: Add NuGet packages: ASP.NET Core, Serilog, Swashbuckle

Verifies that the ContPAQWinBridge.csproj contains all required NuGet package
references for the Windows Bridge service.
"""

import os
import xml.etree.ElementTree as ET
import re
import pytest

# Path to the project file
CSPROJ_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
    "windows-bridge",
    "src",
    "ContPAQWinBridge",
    "ContPAQWinBridge.csproj"
)


class TestSerilogPackages:
    """Tests for Serilog logging packages."""

    @pytest.fixture
    def project_xml(self):
        """Parse project file as XML."""
        tree = ET.parse(CSPROJ_PATH)
        return tree.getroot()

    @pytest.fixture
    def package_references(self, project_xml):
        """Get all PackageReference elements."""
        return project_xml.findall(".//PackageReference")

    def test_has_serilog_aspnetcore(self, package_references):
        """T004.1.3: Project should have Serilog.AspNetCore package."""
        packages = [p.get("Include") for p in package_references]
        assert "Serilog.AspNetCore" in packages, \
            "Project should include Serilog.AspNetCore package"

    def test_serilog_aspnetcore_has_version(self, package_references):
        """T004.1.3: Serilog.AspNetCore should have a version specified."""
        for pkg in package_references:
            if pkg.get("Include") == "Serilog.AspNetCore":
                version = pkg.get("Version")
                assert version is not None, "Serilog.AspNetCore should have Version attribute"
                assert re.match(r'^\d+\.\d+\.\d+', version), \
                    f"Version '{version}' should be semantic version"
                return
        pytest.fail("Serilog.AspNetCore package not found")

    def test_has_serilog_sinks_file(self, package_references):
        """T004.1.3: Project should have Serilog.Sinks.File for file logging."""
        packages = [p.get("Include") for p in package_references]
        assert "Serilog.Sinks.File" in packages, \
            "Project should include Serilog.Sinks.File package"

    def test_has_serilog_sinks_console(self, package_references):
        """T004.1.3: Project should have Serilog.Sinks.Console for console logging."""
        packages = [p.get("Include") for p in package_references]
        assert "Serilog.Sinks.Console" in packages, \
            "Project should include Serilog.Sinks.Console package"


class TestSwashbucklePackages:
    """Tests for Swashbuckle/OpenAPI packages."""

    @pytest.fixture
    def project_xml(self):
        """Parse project file as XML."""
        tree = ET.parse(CSPROJ_PATH)
        return tree.getroot()

    @pytest.fixture
    def package_references(self, project_xml):
        """Get all PackageReference elements."""
        return project_xml.findall(".//PackageReference")

    def test_has_swashbuckle_aspnetcore(self, package_references):
        """T004.1.3: Project should have Swashbuckle.AspNetCore package."""
        packages = [p.get("Include") for p in package_references]
        assert "Swashbuckle.AspNetCore" in packages, \
            "Project should include Swashbuckle.AspNetCore package"

    def test_swashbuckle_has_version(self, package_references):
        """T004.1.3: Swashbuckle.AspNetCore should have a version specified."""
        for pkg in package_references:
            if pkg.get("Include") == "Swashbuckle.AspNetCore":
                version = pkg.get("Version")
                assert version is not None, "Swashbuckle.AspNetCore should have Version attribute"
                assert re.match(r'^\d+\.\d+\.\d+', version), \
                    f"Version '{version}' should be semantic version"
                return
        pytest.fail("Swashbuckle.AspNetCore package not found")

    def test_has_swashbuckle_annotations(self, package_references):
        """T004.1.3: Project should have Swashbuckle.AspNetCore.Annotations for API docs."""
        packages = [p.get("Include") for p in package_references]
        assert "Swashbuckle.AspNetCore.Annotations" in packages, \
            "Project should include Swashbuckle.AspNetCore.Annotations package"


class TestAspNetCorePackages:
    """Tests for ASP.NET Core related packages."""

    @pytest.fixture
    def project_xml(self):
        """Parse project file as XML."""
        tree = ET.parse(CSPROJ_PATH)
        return tree.getroot()

    @pytest.fixture
    def package_references(self, project_xml):
        """Get all PackageReference elements."""
        return project_xml.findall(".//PackageReference")

    def test_uses_web_sdk(self, project_xml):
        """T004.1.3: Project should use Microsoft.NET.Sdk.Web (provides ASP.NET Core)."""
        sdk = project_xml.get("Sdk")
        assert sdk == "Microsoft.NET.Sdk.Web", \
            "Project should use Microsoft.NET.Sdk.Web for ASP.NET Core"


class TestPackageItemGroup:
    """Tests for PackageReference ItemGroup structure."""

    @pytest.fixture
    def project_xml(self):
        """Parse project file as XML."""
        tree = ET.parse(CSPROJ_PATH)
        return tree.getroot()

    @pytest.fixture
    def package_references(self, project_xml):
        """Get all PackageReference elements."""
        return project_xml.findall(".//PackageReference")

    def test_has_package_references_section(self, package_references):
        """T004.1.3: Project should have PackageReference elements."""
        assert len(package_references) > 0, \
            "Project should have at least one PackageReference"

    def test_minimum_package_count(self, package_references):
        """T004.1.3: Project should have at least 5 required packages."""
        # Serilog.AspNetCore, Serilog.Sinks.File, Serilog.Sinks.Console,
        # Swashbuckle.AspNetCore, Swashbuckle.AspNetCore.Annotations
        assert len(package_references) >= 5, \
            f"Project should have at least 5 packages, found {len(package_references)}"

    def test_all_packages_have_versions(self, package_references):
        """T004.1.3: All PackageReferences should have Version attribute."""
        for pkg in package_references:
            name = pkg.get("Include")
            version = pkg.get("Version")
            assert version is not None, f"Package '{name}' should have Version attribute"

    def test_no_duplicate_packages(self, package_references):
        """T004.1.3: There should be no duplicate package references."""
        packages = [p.get("Include") for p in package_references]
        assert len(packages) == len(set(packages)), \
            "There should be no duplicate package references"


class TestPackageVersions:
    """Tests for package version compatibility."""

    @pytest.fixture
    def project_xml(self):
        """Parse project file as XML."""
        tree = ET.parse(CSPROJ_PATH)
        return tree.getroot()

    @pytest.fixture
    def package_versions(self, project_xml):
        """Get package names and versions as dictionary."""
        refs = project_xml.findall(".//PackageReference")
        return {p.get("Include"): p.get("Version") for p in refs}

    def test_serilog_version_is_recent(self, package_versions):
        """T004.1.3: Serilog.AspNetCore should be version 8.x for .NET 8."""
        version = package_versions.get("Serilog.AspNetCore", "")
        major = int(version.split(".")[0]) if version else 0
        assert major >= 8, \
            f"Serilog.AspNetCore should be version 8.x or higher for .NET 8, got {version}"

    def test_swashbuckle_version_is_recent(self, package_versions):
        """T004.1.3: Swashbuckle.AspNetCore should be version 6.x or higher."""
        version = package_versions.get("Swashbuckle.AspNetCore", "")
        major = int(version.split(".")[0]) if version else 0
        assert major >= 6, \
            f"Swashbuckle.AspNetCore should be version 6.x or higher, got {version}"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
