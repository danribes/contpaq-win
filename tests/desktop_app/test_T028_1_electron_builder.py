"""
T028.1 - Electron Builder Configuration Tests

Tests for the electron-builder configuration for the ContPAQ-Win
desktop application packaging.
"""

import json
from pathlib import Path

import pytest

# Get project root
PROJECT_ROOT = Path(__file__).parent.parent.parent
DESKTOP_APP_ROOT = PROJECT_ROOT / "desktop-app"


class TestElectronBuilderConfig:
    """Tests for electron-builder.json configuration."""

    @pytest.fixture
    def config_path(self) -> Path:
        """Get path to electron-builder config."""
        return DESKTOP_APP_ROOT / "electron-builder.json"

    @pytest.fixture
    def config(self, config_path: Path) -> dict:
        """Load electron-builder config."""
        assert config_path.exists(), f"Missing: {config_path}"
        return json.loads(config_path.read_text(encoding="utf-8"))

    def test_config_file_exists(self, config_path: Path) -> None:
        """Config file should exist."""
        assert config_path.exists()

    def test_app_id_defined(self, config: dict) -> None:
        """App ID should be defined."""
        assert "appId" in config
        assert config["appId"] == "com.contpaq.win"

    def test_product_name_defined(self, config: dict) -> None:
        """Product name should be defined."""
        assert "productName" in config
        assert "ContPAQ" in config["productName"]

    def test_asar_enabled(self, config: dict) -> None:
        """ASAR packaging should be enabled."""
        assert config.get("asar") is True

    def test_compression_maximum(self, config: dict) -> None:
        """Compression should be set to maximum."""
        assert config.get("compression") == "maximum"


class TestWindowsTarget:
    """Tests for Windows build target configuration."""

    @pytest.fixture
    def config(self) -> dict:
        """Load electron-builder config."""
        config_path = DESKTOP_APP_ROOT / "electron-builder.json"
        return json.loads(config_path.read_text(encoding="utf-8"))

    def test_win_target_defined(self, config: dict) -> None:
        """Windows target should be defined."""
        assert "win" in config

    def test_win_target_is_nsis(self, config: dict) -> None:
        """Windows target should be NSIS installer."""
        win = config.get("win", {})
        target = win.get("target", [])
        # Target can be string or array of objects
        if isinstance(target, list):
            targets = [t.get("target") if isinstance(t, dict) else t for t in target]
            assert "nsis" in targets
        else:
            assert target == "nsis"

    def test_win_arch_x64(self, config: dict) -> None:
        """Windows target should include x64 architecture."""
        win = config.get("win", {})
        target = win.get("target", [])
        if isinstance(target, list) and len(target) > 0:
            first_target = target[0]
            if isinstance(first_target, dict):
                arch = first_target.get("arch", [])
                assert "x64" in arch

    def test_win_icon_configured(self, config: dict) -> None:
        """Windows icon should be configured."""
        win = config.get("win", {})
        assert "icon" in win
        assert win["icon"].endswith(".ico")

    def test_win_artifact_name_configured(self, config: dict) -> None:
        """Artifact name pattern should be configured."""
        win = config.get("win", {})
        assert "artifactName" in win


class TestNsisConfiguration:
    """Tests for NSIS installer configuration."""

    @pytest.fixture
    def config(self) -> dict:
        """Load electron-builder config."""
        config_path = DESKTOP_APP_ROOT / "electron-builder.json"
        return json.loads(config_path.read_text(encoding="utf-8"))

    @pytest.fixture
    def nsis(self, config: dict) -> dict:
        """Get NSIS configuration."""
        return config.get("nsis", {})

    def test_nsis_config_exists(self, nsis: dict) -> None:
        """NSIS configuration should exist."""
        assert nsis, "NSIS configuration missing"

    def test_nsis_not_one_click(self, nsis: dict) -> None:
        """Installer should not be one-click (allow customization)."""
        assert nsis.get("oneClick") is False

    def test_nsis_per_machine(self, nsis: dict) -> None:
        """Installer should be per-machine (all users)."""
        assert nsis.get("perMachine") is True

    def test_nsis_allow_elevation(self, nsis: dict) -> None:
        """Installer should allow elevation (admin rights)."""
        assert nsis.get("allowElevation") is True

    def test_nsis_allow_custom_install_dir(self, nsis: dict) -> None:
        """User should be able to change install directory."""
        assert nsis.get("allowToChangeInstallationDirectory") is True

    def test_nsis_creates_desktop_shortcut(self, nsis: dict) -> None:
        """Installer should create desktop shortcut."""
        assert nsis.get("createDesktopShortcut") is True

    def test_nsis_creates_start_menu_shortcut(self, nsis: dict) -> None:
        """Installer should create start menu shortcut."""
        assert nsis.get("createStartMenuShortcut") is True

    def test_nsis_spanish_language(self, nsis: dict) -> None:
        """Installer should use Spanish language (1034)."""
        # 1034 is the LCID for Spanish
        assert nsis.get("language") == "1034"


class TestNativeModules:
    """Tests for native module configuration."""

    @pytest.fixture
    def config(self) -> dict:
        """Load electron-builder config."""
        config_path = DESKTOP_APP_ROOT / "electron-builder.json"
        return json.loads(config_path.read_text(encoding="utf-8"))

    @pytest.fixture
    def package_json(self) -> dict:
        """Load package.json."""
        package_path = DESKTOP_APP_ROOT / "package.json"
        return json.loads(package_path.read_text(encoding="utf-8"))

    def test_better_sqlite3_in_dependencies(self, package_json: dict) -> None:
        """better-sqlite3 should be in dependencies."""
        deps = package_json.get("dependencies", {})
        assert "better-sqlite3" in deps

    def test_asar_unpack_configured(self, config: dict) -> None:
        """Native modules should be unpacked from ASAR."""
        # Native modules like better-sqlite3 need to be unpacked
        asar_unpack = config.get("asarUnpack", [])
        # Should unpack .node files or better-sqlite3 directory
        has_native_unpack = any(
            "*.node" in pattern or "better-sqlite3" in pattern or "node_modules/**/*.node" in pattern
            for pattern in asar_unpack
        )
        assert has_native_unpack, "Native modules should be unpacked from ASAR"

    def test_native_rebuild_configured(self, config: dict) -> None:
        """Native rebuild should be configured for electron."""
        # Check for npmRebuild or buildDependenciesFromSource
        has_rebuild = (
            config.get("npmRebuild", True) is True or
            config.get("buildDependenciesFromSource", False) is True
        )
        assert has_rebuild, "Native module rebuild should be enabled"


class TestCodeSigning:
    """Tests for code signing configuration."""

    @pytest.fixture
    def config(self) -> dict:
        """Load electron-builder config."""
        config_path = DESKTOP_APP_ROOT / "electron-builder.json"
        return json.loads(config_path.read_text(encoding="utf-8"))

    def test_signing_config_structure_exists(self, config: dict) -> None:
        """Code signing config should have proper structure."""
        win = config.get("win", {})
        # Code signing is optional, but config should support it
        # Either has sign config or has docs about environment variables
        # The presence of certificateFile or forceCodeSigning indicates awareness
        # If not present, should at least have publisherName for unsigned builds
        assert "publisherName" in win, "Publisher name required for builds"

    def test_force_code_signing_optional(self, config: dict) -> None:
        """Force code signing should not be required (optional cert)."""
        win = config.get("win", {})
        # forceCodeSigning should be false or not set (allow unsigned dev builds)
        force_signing = win.get("forceCodeSigning", False)
        # If it's not set, that's fine (defaults to false)
        # If it's explicitly true, builds will fail without cert
        assert force_signing is not True or "certificateFile" in win, \
            "forceCodeSigning=true requires certificateFile or env var"


class TestExtraResources:
    """Tests for extra resources configuration."""

    @pytest.fixture
    def config(self) -> dict:
        """Load electron-builder config."""
        config_path = DESKTOP_APP_ROOT / "electron-builder.json"
        return json.loads(config_path.read_text(encoding="utf-8"))

    def test_extra_resources_defined(self, config: dict) -> None:
        """Extra resources should be defined."""
        assert "extraResources" in config

    def test_ai_service_included(self, config: dict) -> None:
        """AI service should be included in resources."""
        resources = config.get("extraResources", [])
        ai_service_included = any(
            "ai-service" in str(r.get("from", "") if isinstance(r, dict) else r)
            for r in resources
        )
        assert ai_service_included, "AI service should be in extraResources"

    def test_pycache_excluded(self, config: dict) -> None:
        """Python cache files should be excluded."""
        resources = config.get("extraResources", [])
        for resource in resources:
            if isinstance(resource, dict) and "ai-service" in str(resource.get("from", "")):
                filters = resource.get("filter", [])
                pycache_excluded = any("__pycache__" in f for f in filters)
                assert pycache_excluded, "__pycache__ should be filtered out"


class TestBuildDirectory:
    """Tests for build directory structure."""

    @pytest.fixture
    def config(self) -> dict:
        """Load electron-builder config."""
        config_path = DESKTOP_APP_ROOT / "electron-builder.json"
        return json.loads(config_path.read_text(encoding="utf-8"))

    def test_output_directory_configured(self, config: dict) -> None:
        """Output directory should be configured."""
        dirs = config.get("directories", {})
        assert "output" in dirs

    def test_build_resources_directory_configured(self, config: dict) -> None:
        """Build resources directory should be configured."""
        dirs = config.get("directories", {})
        assert "buildResources" in dirs
