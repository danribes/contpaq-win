"""
T026.2 - Windows Service Wrapper Tests

Tests for the NSSM-based Windows Service wrapper configuration
for the AI service.
"""

import os
from pathlib import Path

import pytest

# Get project root
PROJECT_ROOT = Path(__file__).parent.parent.parent
AI_SERVICE_ROOT = PROJECT_ROOT / "ai-service"
SCRIPTS_DIR = AI_SERVICE_ROOT / "scripts"


class TestNssmConfiguration:
    """Tests for NSSM service configuration."""

    @pytest.fixture
    def nssm_config_path(self) -> Path:
        """Get path to NSSM README/config file."""
        return SCRIPTS_DIR / "nssm" / "README.md"

    @pytest.fixture
    def install_script_path(self) -> Path:
        """Get path to service install script."""
        return SCRIPTS_DIR / "install-service.ps1"

    @pytest.fixture
    def uninstall_script_path(self) -> Path:
        """Get path to service uninstall script."""
        return SCRIPTS_DIR / "uninstall-service.ps1"

    def test_nssm_readme_exists(self, nssm_config_path: Path) -> None:
        """NSSM directory should have README with download instructions."""
        assert nssm_config_path.exists(), f"Missing NSSM README: {nssm_config_path}"

    def test_nssm_readme_has_download_url(self, nssm_config_path: Path) -> None:
        """NSSM README should include download URL."""
        content = nssm_config_path.read_text(encoding="utf-8")
        assert "nssm.cc" in content or "github.com" in content, \
            "Missing NSSM download URL"

    def test_install_script_exists(self, install_script_path: Path) -> None:
        """Service install script should exist."""
        assert install_script_path.exists(), f"Missing: {install_script_path}"

    def test_uninstall_script_exists(self, uninstall_script_path: Path) -> None:
        """Service uninstall script should exist."""
        assert uninstall_script_path.exists(), f"Missing: {uninstall_script_path}"


class TestInstallScript:
    """Tests for the service installation PowerShell script."""

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

    def test_script_defines_service_name(self, script_content: str) -> None:
        """Script should define service name."""
        assert "ContPAQ" in script_content or "contpaq" in script_content.lower(), \
            "Missing service name definition"

    def test_script_uses_nssm(self, script_content: str) -> None:
        """Script should use NSSM for service installation."""
        assert "nssm" in script_content.lower(), "Missing NSSM usage"

    def test_script_sets_application_path(self, script_content: str) -> None:
        """Script should set application path."""
        assert "AppDirectory" in script_content or "Application" in script_content, \
            "Missing application path configuration"

    def test_script_configures_restart(self, script_content: str) -> None:
        """Script should configure restart on failure."""
        assert "AppExit" in script_content or "restart" in script_content.lower(), \
            "Missing restart configuration"

    def test_script_sets_description(self, script_content: str) -> None:
        """Script should set service description."""
        assert "Description" in script_content or "DisplayName" in script_content, \
            "Missing service description"

    def test_script_configures_stdout_log(self, script_content: str) -> None:
        """Script should configure stdout logging."""
        assert "AppStdout" in script_content or "stdout" in script_content.lower(), \
            "Missing stdout log configuration"

    def test_script_configures_stderr_log(self, script_content: str) -> None:
        """Script should configure stderr logging."""
        assert "AppStderr" in script_content or "stderr" in script_content.lower(), \
            "Missing stderr log configuration"


class TestUninstallScript:
    """Tests for the service uninstallation PowerShell script."""

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

    def test_script_stops_service(self, script_content: str) -> None:
        """Script should stop service before removal."""
        assert "stop" in script_content.lower(), "Missing service stop command"

    def test_script_removes_service(self, script_content: str) -> None:
        """Script should remove the service."""
        assert "remove" in script_content.lower() or "delete" in script_content.lower(), \
            "Missing service removal command"

    def test_script_uses_nssm(self, script_content: str) -> None:
        """Script should use NSSM for service removal."""
        assert "nssm" in script_content.lower(), "Missing NSSM usage"


class TestServiceConfig:
    """Tests for service configuration values."""

    @pytest.fixture
    def install_script_content(self) -> str:
        """Read install script content."""
        path = SCRIPTS_DIR / "install-service.ps1"
        if not path.exists():
            pytest.skip("Install script not created yet")
        return path.read_text(encoding="utf-8")

    def test_service_binds_to_localhost(self, install_script_content: str) -> None:
        """Service should be configured for localhost only."""
        # The service runs on 127.0.0.1:8000
        assert "127.0.0.1" in install_script_content or "localhost" in install_script_content.lower(), \
            "Service should bind to localhost for security"

    def test_service_port_is_8000(self, install_script_content: str) -> None:
        """Service should use port 8000."""
        assert "8000" in install_script_content, "Expected port 8000"

    def test_restart_delay_configured(self, install_script_content: str) -> None:
        """Service should have restart delay configured."""
        assert "RestartDelay" in install_script_content or "AppRestartDelay" in install_script_content, \
            "Missing restart delay configuration"
