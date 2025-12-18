"""
T029.1 - Inno Setup Installer Script Tests

Tests for the Inno Setup installer configuration for the
ContPAQ-Win application.
"""

from pathlib import Path

import pytest

# Get project root
PROJECT_ROOT = Path(__file__).parent.parent.parent
INSTALLER_DIR = PROJECT_ROOT / "installer"


class TestInnoSetupScript:
    """Tests for the main Inno Setup script."""

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

    def test_iss_script_exists(self, script_path: Path) -> None:
        """Inno Setup script should exist."""
        assert script_path.exists(), f"Missing: {script_path}"

    def test_script_has_setup_section(self, script_content: str) -> None:
        """Script should have [Setup] section."""
        assert "[Setup]" in script_content

    def test_script_has_app_name(self, script_content: str) -> None:
        """Script should define AppName."""
        assert "AppName=" in script_content
        assert "ContPAQ" in script_content

    def test_script_has_app_version(self, script_content: str) -> None:
        """Script should define AppVersion."""
        assert "AppVersion=" in script_content

    def test_script_has_publisher(self, script_content: str) -> None:
        """Script should define AppPublisher."""
        assert "AppPublisher=" in script_content

    def test_script_has_default_dir(self, script_content: str) -> None:
        """Script should define DefaultDirName."""
        assert "DefaultDirName=" in script_content

    def test_script_targets_x64(self, script_content: str) -> None:
        """Script should target x64 architecture."""
        assert "x64" in script_content.lower() or "ArchitecturesAllowed=x64" in script_content


class TestInstallationDirectory:
    """Tests for installation directory structure."""

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

    def test_default_program_files(self, script_content: str) -> None:
        """Default installation should be in Program Files."""
        assert "{autopf}" in script_content or "{pf}" in script_content or "Program Files" in script_content

    def test_files_section_exists(self, script_content: str) -> None:
        """Script should have [Files] section."""
        assert "[Files]" in script_content

    def test_defines_desktop_app_files(self, script_content: str) -> None:
        """Script should include desktop app files."""
        # Should reference the Electron app
        has_app_ref = (
            "desktop-app" in script_content.lower() or
            "contpaq" in script_content.lower()
        )
        assert has_app_ref


class TestLicenseAgreement:
    """Tests for license agreement configuration."""

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

    @pytest.fixture
    def license_path(self) -> Path:
        """Get path to license file."""
        return INSTALLER_DIR / "LICENSE_ES.txt"

    def test_license_file_referenced(self, script_content: str) -> None:
        """Script should reference a license file."""
        assert "LicenseFile=" in script_content

    def test_spanish_license_exists(self, license_path: Path) -> None:
        """Spanish license file should exist."""
        assert license_path.exists(), f"Missing: {license_path}"

    def test_license_is_spanish(self, license_path: Path) -> None:
        """License file should be in Spanish."""
        if not license_path.exists():
            pytest.skip("License not created yet")
        content = license_path.read_text(encoding="utf-8")
        # Check for Spanish words
        spanish_indicators = ["uso", "software", "usuario", "derechos", "licencia"]
        has_spanish = any(word in content.lower() for word in spanish_indicators)
        assert has_spanish, "License should be in Spanish"


class TestApplicationIcon:
    """Tests for application icon configuration."""

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

    def test_setup_icon_configured(self, script_content: str) -> None:
        """Installer should have a setup icon."""
        assert "SetupIconFile=" in script_content

    def test_uninstall_icon_configured(self, script_content: str) -> None:
        """Uninstaller should have an icon."""
        # UninstallDisplayIcon is optional but good practice
        has_uninstall_icon = (
            "UninstallDisplayIcon=" in script_content or
            "SetupIconFile=" in script_content
        )
        assert has_uninstall_icon


class TestInstallerOutput:
    """Tests for installer output configuration."""

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

    def test_output_base_filename(self, script_content: str) -> None:
        """Output filename should be configured."""
        assert "OutputBaseFilename=" in script_content

    def test_output_dir_configured(self, script_content: str) -> None:
        """Output directory should be configured."""
        assert "OutputDir=" in script_content

    def test_compression_configured(self, script_content: str) -> None:
        """Compression should be configured."""
        assert "Compression=" in script_content


class TestSpanishLanguage:
    """Tests for Spanish language configuration."""

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

    def test_languages_section_exists(self, script_content: str) -> None:
        """Script should have [Languages] section."""
        assert "[Languages]" in script_content

    def test_spanish_language_included(self, script_content: str) -> None:
        """Spanish language should be included."""
        has_spanish = (
            "spanish" in script_content.lower() or
            "español" in script_content.lower()
        )
        assert has_spanish
