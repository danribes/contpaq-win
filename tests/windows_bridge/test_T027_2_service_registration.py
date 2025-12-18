"""
T027.2 - Windows Bridge Service Registration Tests

Tests for the Windows Service registration scripts for the
Windows Bridge .NET application.
"""

from pathlib import Path

import pytest

# Get project root
PROJECT_ROOT = Path(__file__).parent.parent.parent
WINDOWS_BRIDGE_ROOT = PROJECT_ROOT / "windows-bridge"
SCRIPTS_DIR = WINDOWS_BRIDGE_ROOT / "scripts"


class TestServiceInstallScript:
    """Tests for the Windows service install script."""

    @pytest.fixture
    def script_path(self) -> Path:
        """Get path to install script."""
        return SCRIPTS_DIR / "install-service.ps1"

    @pytest.fixture
    def script_content(self, script_path: Path) -> str:
        """Read install script content."""
        if not script_path.exists():
            pytest.skip("Install script not created yet")
        return script_path.read_text(encoding="utf-8")

    def test_install_script_exists(self, script_path: Path) -> None:
        """Install script should exist."""
        assert script_path.exists(), f"Missing: {script_path}"

    def test_script_requires_admin(self, script_content: str) -> None:
        """Script should require administrator privileges."""
        assert "RunAsAdministrator" in script_content or "Administrator" in script_content, \
            "Missing administrator requirement"

    def test_script_defines_service_name(self, script_content: str) -> None:
        """Script should define service name."""
        assert "ContPAQ" in script_content, "Missing service name"

    def test_script_configures_localhost_binding(self, script_content: str) -> None:
        """Script should configure localhost-only binding."""
        assert "127.0.0.1" in script_content or "localhost" in script_content.lower(), \
            "Missing localhost binding"

    def test_script_configures_port_5000(self, script_content: str) -> None:
        """Script should configure port 5000 for Windows Bridge."""
        assert "5000" in script_content, "Missing port 5000 configuration"

    def test_script_sets_startup_type(self, script_content: str) -> None:
        """Script should set service startup type."""
        assert "StartupType" in script_content or "Start" in script_content, \
            "Missing startup type configuration"

    def test_script_configures_description(self, script_content: str) -> None:
        """Script should set service description."""
        assert "Description" in script_content, "Missing service description"

    def test_script_creates_service(self, script_content: str) -> None:
        """Script should create/register the service."""
        assert "New-Service" in script_content or "sc.exe create" in script_content.lower(), \
            "Missing service creation command"


class TestServiceUninstallScript:
    """Tests for the Windows service uninstall script."""

    @pytest.fixture
    def script_path(self) -> Path:
        """Get path to uninstall script."""
        return SCRIPTS_DIR / "uninstall-service.ps1"

    @pytest.fixture
    def script_content(self, script_path: Path) -> str:
        """Read uninstall script content."""
        if not script_path.exists():
            pytest.skip("Uninstall script not created yet")
        return script_path.read_text(encoding="utf-8")

    def test_uninstall_script_exists(self, script_path: Path) -> None:
        """Uninstall script should exist."""
        assert script_path.exists(), f"Missing: {script_path}"

    def test_script_stops_service(self, script_content: str) -> None:
        """Script should stop service before removal."""
        assert "Stop-Service" in script_content or "stop" in script_content.lower(), \
            "Missing service stop command"

    def test_script_removes_service(self, script_content: str) -> None:
        """Script should remove the service."""
        assert "Remove-Service" in script_content or "sc.exe delete" in script_content.lower() \
            or "delete" in script_content.lower(), "Missing service removal"


class TestServiceConfiguration:
    """Tests for service configuration values."""

    @pytest.fixture
    def install_content(self) -> str:
        """Read install script content."""
        path = SCRIPTS_DIR / "install-service.ps1"
        if not path.exists():
            pytest.skip("Install script not created yet")
        return path.read_text(encoding="utf-8")

    def test_service_runs_as_local_system(self, install_content: str) -> None:
        """Service should run as LocalSystem or LocalService."""
        # Default for New-Service is LocalSystem
        # Could also specify LocalService or NetworkService
        assert "LocalSystem" in install_content or "LocalService" in install_content \
            or "New-Service" in install_content, \
            "Missing service account configuration"

    def test_recovery_options_configured(self, install_content: str) -> None:
        """Service should have recovery options (restart on failure)."""
        # Either PowerShell sc.exe failure or explicit recovery config
        assert "failure" in install_content.lower() or "recovery" in install_content.lower() \
            or "restart" in install_content.lower(), \
            "Missing recovery configuration"
