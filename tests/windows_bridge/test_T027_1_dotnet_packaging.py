"""
T027.1 - .NET Packaging Configuration Tests

Tests for the .NET publish configuration and deployment scripts
for the Windows Bridge service.
"""

import os
import xml.etree.ElementTree as ET
from pathlib import Path

import pytest

# Get project root
PROJECT_ROOT = Path(__file__).parent.parent.parent
WINDOWS_BRIDGE_ROOT = PROJECT_ROOT / "windows-bridge"
SRC_DIR = WINDOWS_BRIDGE_ROOT / "src" / "ContPAQWinBridge"


class TestCsprojPublishConfig:
    """Tests for .csproj publish configuration."""

    @pytest.fixture
    def csproj_path(self) -> Path:
        """Get path to main csproj file."""
        return SRC_DIR / "ContPAQWinBridge.csproj"

    @pytest.fixture
    def csproj_content(self, csproj_path: Path) -> str:
        """Read csproj content."""
        assert csproj_path.exists(), f"Missing csproj: {csproj_path}"
        return csproj_path.read_text(encoding="utf-8")

    @pytest.fixture
    def csproj_tree(self, csproj_path: Path) -> ET.Element:
        """Parse csproj as XML."""
        return ET.parse(csproj_path).getroot()

    def test_csproj_exists(self, csproj_path: Path) -> None:
        """Project file should exist."""
        assert csproj_path.exists()

    def test_target_framework_net8(self, csproj_content: str) -> None:
        """Project should target .NET 8."""
        assert "net8.0" in csproj_content, "Expected .NET 8.0 target framework"

    def test_self_contained_configured(self, csproj_content: str) -> None:
        """Project should have self-contained option configured."""
        assert "SelfContained" in csproj_content or "PublishSingleFile" in csproj_content, \
            "Missing self-contained or single-file configuration"

    def test_runtime_identifier_winx64(self, csproj_content: str) -> None:
        """Project should support win-x64 runtime."""
        assert "win-x64" in csproj_content or "RuntimeIdentifier" in csproj_content, \
            "Missing Windows x64 runtime identifier"


class TestPublishProfile:
    """Tests for publish profile configuration."""

    @pytest.fixture
    def profiles_dir(self) -> Path:
        """Get publish profiles directory."""
        return SRC_DIR / "Properties" / "PublishProfiles"

    @pytest.fixture
    def win_profile_path(self, profiles_dir: Path) -> Path:
        """Get Windows publish profile path."""
        return profiles_dir / "win-x64.pubxml"

    def test_publish_profiles_dir_exists(self, profiles_dir: Path) -> None:
        """Publish profiles directory should exist."""
        assert profiles_dir.exists(), f"Missing: {profiles_dir}"

    def test_win_x64_profile_exists(self, win_profile_path: Path) -> None:
        """Windows x64 publish profile should exist."""
        assert win_profile_path.exists(), f"Missing: {win_profile_path}"

    def test_profile_is_self_contained(self, win_profile_path: Path) -> None:
        """Profile should specify self-contained deployment."""
        if not win_profile_path.exists():
            pytest.skip("Profile not created yet")
        content = win_profile_path.read_text(encoding="utf-8")
        assert "SelfContained" in content and "true" in content.lower(), \
            "Missing self-contained configuration"

    def test_profile_targets_winx64(self, win_profile_path: Path) -> None:
        """Profile should target win-x64 runtime."""
        if not win_profile_path.exists():
            pytest.skip("Profile not created yet")
        content = win_profile_path.read_text(encoding="utf-8")
        assert "win-x64" in content, "Missing win-x64 runtime"

    def test_profile_publish_single_file(self, win_profile_path: Path) -> None:
        """Profile should publish as single file."""
        if not win_profile_path.exists():
            pytest.skip("Profile not created yet")
        content = win_profile_path.read_text(encoding="utf-8")
        assert "PublishSingleFile" in content, "Missing single file configuration"


class TestBuildScript:
    """Tests for .NET build/publish script."""

    @pytest.fixture
    def scripts_dir(self) -> Path:
        """Get scripts directory."""
        return WINDOWS_BRIDGE_ROOT / "scripts"

    @pytest.fixture
    def build_script_path(self, scripts_dir: Path) -> Path:
        """Get build script path."""
        return scripts_dir / "publish.ps1"

    def test_scripts_dir_exists(self, scripts_dir: Path) -> None:
        """Scripts directory should exist."""
        assert scripts_dir.exists(), f"Missing: {scripts_dir}"

    def test_build_script_exists(self, build_script_path: Path) -> None:
        """Build script should exist."""
        assert build_script_path.exists(), f"Missing: {build_script_path}"

    def test_script_uses_dotnet_publish(self, build_script_path: Path) -> None:
        """Script should use dotnet publish command."""
        if not build_script_path.exists():
            pytest.skip("Script not created yet")
        content = build_script_path.read_text(encoding="utf-8")
        # Script uses "publish" in publishArgs array and calls dotnet @publishArgs
        assert "publish" in content.lower() and "dotnet" in content.lower(), \
            "Missing dotnet publish command"

    def test_script_specifies_configuration(self, build_script_path: Path) -> None:
        """Script should specify Release configuration."""
        if not build_script_path.exists():
            pytest.skip("Script not created yet")
        content = build_script_path.read_text(encoding="utf-8")
        assert "Release" in content, "Missing Release configuration"

    def test_script_specifies_runtime(self, build_script_path: Path) -> None:
        """Script should specify win-x64 runtime."""
        if not build_script_path.exists():
            pytest.skip("Script not created yet")
        content = build_script_path.read_text(encoding="utf-8")
        assert "win-x64" in content, "Missing win-x64 runtime"
