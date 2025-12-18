"""
T029.3 - Service Registration Tests

Tests for the service registration scripts in the installer.
"""

from pathlib import Path

import pytest

# Get project root
PROJECT_ROOT = Path(__file__).parent.parent.parent
INSTALLER_DIR = PROJECT_ROOT / "installer"


class TestInstallServicesScript:
    """Tests for the install-services.ps1 script."""

    @pytest.fixture
    def script_path(self) -> Path:
        """Get path to install script."""
        return INSTALLER_DIR / "scripts" / "install-services.ps1"

    @pytest.fixture
    def script_content(self, script_path: Path) -> str:
        """Read script content."""
        if not script_path.exists():
            pytest.skip("Script not created yet")
        return script_path.read_text(encoding="utf-8")

    def test_install_script_exists(self, script_path: Path) -> None:
        """Install services script should exist."""
        assert script_path.exists(), f"Missing: {script_path}"

    def test_script_installs_ai_service(self, script_content: str) -> None:
        """Script should install AI service."""
        has_ai_service = (
            "AIService" in script_content or
            "ContPAQWinAIService" in script_content
        )
        assert has_ai_service, "Should install AI service"

    def test_script_uses_nssm_for_ai(self, script_content: str) -> None:
        """Script should use NSSM for AI service."""
        assert "nssm" in script_content.lower(), "Should use NSSM for AI service"

    def test_script_installs_bridge_service(self, script_content: str) -> None:
        """Script should install Windows Bridge service."""
        has_bridge = (
            "BridgeService" in script_content or
            "ContPAQWinBridge" in script_content
        )
        assert has_bridge, "Should install Windows Bridge"

    def test_script_starts_services(self, script_content: str) -> None:
        """Script should start services after install."""
        assert "Start-Service" in script_content, "Should start services"

    def test_script_configures_auto_start(self, script_content: str) -> None:
        """Services should be configured for automatic start."""
        has_auto = (
            "SERVICE_AUTO_START" in script_content or
            "Automatic" in script_content
        )
        assert has_auto, "Should configure automatic startup"


class TestUninstallServicesScript:
    """Tests for the uninstall-services.ps1 script."""

    @pytest.fixture
    def script_path(self) -> Path:
        """Get path to uninstall script."""
        return INSTALLER_DIR / "scripts" / "uninstall-services.ps1"

    @pytest.fixture
    def script_content(self, script_path: Path) -> str:
        """Read script content."""
        if not script_path.exists():
            pytest.skip("Script not created yet")
        return script_path.read_text(encoding="utf-8")

    def test_uninstall_script_exists(self, script_path: Path) -> None:
        """Uninstall services script should exist."""
        assert script_path.exists(), f"Missing: {script_path}"

    def test_script_removes_ai_service(self, script_content: str) -> None:
        """Script should remove AI service."""
        has_remove = (
            "Remove-AIService" in script_content or
            ("AIService" in script_content and "remove" in script_content.lower())
        )
        assert has_remove, "Should remove AI service"

    def test_script_removes_bridge_service(self, script_content: str) -> None:
        """Script should remove Windows Bridge."""
        has_remove = (
            "Remove-BridgeService" in script_content or
            ("BridgeService" in script_content and "remove" in script_content.lower())
        )
        assert has_remove, "Should remove Windows Bridge"

    def test_script_stops_services_first(self, script_content: str) -> None:
        """Script should stop services before removing."""
        has_stop = (
            "Stop-Service" in script_content or
            "stop" in script_content.lower()
        )
        assert has_stop, "Should stop services first"

    def test_script_has_remove_logs_option(self, script_content: str) -> None:
        """Script should have option to remove logs."""
        assert "RemoveLogs" in script_content, "Should have RemoveLogs parameter"


class TestServiceConfiguration:
    """Tests for service configuration."""

    @pytest.fixture
    def install_script_path(self) -> Path:
        """Get path to install script."""
        return INSTALLER_DIR / "scripts" / "install-services.ps1"

    @pytest.fixture
    def install_script_content(self, install_script_path: Path) -> str:
        """Read script content."""
        if not install_script_path.exists():
            pytest.skip("Script not created yet")
        return install_script_path.read_text(encoding="utf-8")

    def test_ai_service_binds_localhost(self, install_script_content: str) -> None:
        """AI service should bind to localhost only."""
        assert "127.0.0.1" in install_script_content, "Should bind to localhost"

    def test_ai_service_port_8000(self, install_script_content: str) -> None:
        """AI service should use port 8000."""
        assert "8000" in install_script_content, "Should use port 8000"

    def test_restart_on_failure_configured(self, install_script_content: str) -> None:
        """Services should restart on failure."""
        has_restart = (
            "AppRestartDelay" in install_script_content or
            "failure" in install_script_content.lower()
        )
        assert has_restart, "Should configure restart on failure"

    def test_log_rotation_configured(self, install_script_content: str) -> None:
        """Log rotation should be configured."""
        has_rotation = (
            "AppRotate" in install_script_content or
            "rotate" in install_script_content.lower()
        )
        assert has_rotation, "Should configure log rotation"
