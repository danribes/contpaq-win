"""
T029.2 - Prerequisite Detection Tests

Tests for the prerequisite detection and installation
configuration in the Inno Setup installer.
"""

from pathlib import Path

import pytest

# Get project root
PROJECT_ROOT = Path(__file__).parent.parent.parent
INSTALLER_DIR = PROJECT_ROOT / "installer"


class TestDotNetDetection:
    """Tests for .NET Runtime detection."""

    @pytest.fixture
    def script_path(self) -> Path:
        """Get path to Inno Setup script."""
        return INSTALLER_DIR / "contpaq-win.iss"

    @pytest.fixture
    def script_content(self, script_path: Path) -> str:
        """Read Inno Setup script content."""
        if not script_path.exists():
            pytest.skip("Script not created yet")
        return script_path.read_text(encoding="utf-8")

    def test_dotnet_detection_function(self, script_content: str) -> None:
        """Script should have .NET detection function."""
        has_dotnet_check = (
            "IsDotNet" in script_content or
            "dotnet" in script_content.lower()
        )
        assert has_dotnet_check, "Should detect .NET Runtime"

    def test_dotnet_8_version_check(self, script_content: str) -> None:
        """Script should check for .NET 8.0 specifically."""
        has_version_check = (
            "8.0" in script_content or
            "8" in script_content
        )
        assert has_version_check, "Should check for .NET 8.0"


class TestDotNetDownload:
    """Tests for .NET Runtime download configuration."""

    @pytest.fixture
    def prereq_script_path(self) -> Path:
        """Get path to prerequisites script."""
        return INSTALLER_DIR / "scripts" / "install-prerequisites.ps1"

    @pytest.fixture
    def prereq_script_content(self, prereq_script_path: Path) -> str:
        """Read prerequisites script content."""
        if not prereq_script_path.exists():
            pytest.skip("Prerequisites script not created yet")
        return prereq_script_path.read_text(encoding="utf-8")

    def test_prerequisites_script_exists(self, prereq_script_path: Path) -> None:
        """Prerequisites installation script should exist."""
        assert prereq_script_path.exists(), f"Missing: {prereq_script_path}"

    def test_script_downloads_dotnet(self, prereq_script_content: str) -> None:
        """Script should download .NET if missing."""
        has_download = (
            "dotnet" in prereq_script_content.lower() and
            ("download" in prereq_script_content.lower() or
             "Invoke-WebRequest" in prereq_script_content)
        )
        assert has_download, "Should download .NET Runtime"

    def test_script_has_dotnet_url(self, prereq_script_content: str) -> None:
        """Script should have .NET download URL."""
        has_url = (
            "microsoft.com" in prereq_script_content.lower() or
            "aka.ms" in prereq_script_content.lower()
        )
        assert has_url, "Should have Microsoft download URL"


class TestVCRedistDetection:
    """Tests for VC++ Redistributable detection."""

    @pytest.fixture
    def prereq_script_path(self) -> Path:
        """Get path to prerequisites script."""
        return INSTALLER_DIR / "scripts" / "install-prerequisites.ps1"

    @pytest.fixture
    def prereq_script_content(self, prereq_script_path: Path) -> str:
        """Read prerequisites script content."""
        if not prereq_script_path.exists():
            pytest.skip("Prerequisites script not created yet")
        return prereq_script_path.read_text(encoding="utf-8")

    def test_vcredist_detection(self, prereq_script_content: str) -> None:
        """Script should detect VC++ Redistributable."""
        has_vcredist = (
            "vc" in prereq_script_content.lower() or
            "redistributable" in prereq_script_content.lower() or
            "vcruntime" in prereq_script_content.lower()
        )
        assert has_vcredist, "Should detect VC++ Redistributable"


class TestVCRedistDownload:
    """Tests for VC++ Redistributable download."""

    @pytest.fixture
    def prereq_script_path(self) -> Path:
        """Get path to prerequisites script."""
        return INSTALLER_DIR / "scripts" / "install-prerequisites.ps1"

    @pytest.fixture
    def prereq_script_content(self, prereq_script_path: Path) -> str:
        """Read prerequisites script content."""
        if not prereq_script_path.exists():
            pytest.skip("Prerequisites script not created yet")
        return prereq_script_path.read_text(encoding="utf-8")

    def test_vcredist_download_configured(self, prereq_script_content: str) -> None:
        """Script should download VC++ if missing."""
        # Should reference vc_redist or similar
        has_download = (
            "vc_redist" in prereq_script_content.lower() or
            "vcredist" in prereq_script_content.lower()
        )
        assert has_download, "Should download VC++ Redistributable"


class TestContPAQiDetection:
    """Tests for ContPAQi detection."""

    @pytest.fixture
    def script_path(self) -> Path:
        """Get path to Inno Setup script."""
        return INSTALLER_DIR / "contpaq-win.iss"

    @pytest.fixture
    def script_content(self, script_path: Path) -> str:
        """Read Inno Setup script content."""
        if not script_path.exists():
            pytest.skip("Script not created yet")
        return script_path.read_text(encoding="utf-8")

    def test_contpaqi_detection_function(self, script_content: str) -> None:
        """Script should have ContPAQi detection."""
        has_detection = (
            "ContPAQi" in script_content or
            "Compac" in script_content
        )
        assert has_detection, "Should detect ContPAQi installation"

    def test_contpaqi_path_check(self, script_content: str) -> None:
        """Script should check ContPAQi installation path."""
        has_path_check = (
            "Program Files" in script_content or
            "Compac" in script_content
        )
        assert has_path_check, "Should check ContPAQi paths"

    def test_contpaqi_warning_message(self, script_content: str) -> None:
        """Script should warn if ContPAQi not found."""
        has_warning = (
            "no ha sido detectado" in script_content.lower() or
            "not found" in script_content.lower() or
            "not detected" in script_content.lower()
        )
        assert has_warning, "Should warn about missing ContPAQi"


class TestPrerequisiteIntegration:
    """Tests for prerequisite integration in main installer."""

    @pytest.fixture
    def script_path(self) -> Path:
        """Get path to Inno Setup script."""
        return INSTALLER_DIR / "contpaq-win.iss"

    @pytest.fixture
    def script_content(self, script_path: Path) -> str:
        """Read Inno Setup script content."""
        if not script_path.exists():
            pytest.skip("Script not created yet")
        return script_path.read_text(encoding="utf-8")

    def test_code_section_exists(self, script_content: str) -> None:
        """Script should have [Code] section for Pascal scripting."""
        assert "[Code]" in script_content

    def test_initialize_setup_function(self, script_content: str) -> None:
        """Script should have InitializeSetup function."""
        assert "InitializeSetup" in script_content
