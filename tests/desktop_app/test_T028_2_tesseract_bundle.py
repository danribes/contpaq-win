"""
T028.2 - Tesseract Bundle Configuration Tests

Tests for the Tesseract OCR bundling configuration for the
ContPAQ-Win desktop application.
"""

import json
from pathlib import Path

import pytest

# Get project root
PROJECT_ROOT = Path(__file__).parent.parent.parent
DESKTOP_APP_ROOT = PROJECT_ROOT / "desktop-app"


class TestTesseractExtraResources:
    """Tests for Tesseract in electron-builder extraResources."""

    @pytest.fixture
    def config(self) -> dict:
        """Load electron-builder config."""
        config_path = DESKTOP_APP_ROOT / "electron-builder.json"
        return json.loads(config_path.read_text(encoding="utf-8"))

    def test_extra_resources_includes_tesseract(self, config: dict) -> None:
        """Tesseract should be included in extraResources."""
        resources = config.get("extraResources", [])
        tesseract_included = any(
            "tesseract" in str(r.get("to", "") if isinstance(r, dict) else r).lower()
            for r in resources
        )
        assert tesseract_included, "Tesseract should be in extraResources"

    def test_tesseract_filter_excludes_docs(self, config: dict) -> None:
        """Tesseract bundle should exclude documentation."""
        resources = config.get("extraResources", [])
        for resource in resources:
            if isinstance(resource, dict) and "tesseract" in str(resource.get("to", "")).lower():
                filters = resource.get("filter", [])
                # Should exclude docs or readme
                has_exclusion = any(
                    "doc" in f.lower() or "readme" in f.lower()
                    for f in filters if f.startswith("!")
                )
                assert has_exclusion, "Should exclude documentation files"


class TestTesseractDownloadScript:
    """Tests for Tesseract download script."""

    @pytest.fixture
    def script_path(self) -> Path:
        """Get path to download script."""
        return DESKTOP_APP_ROOT / "scripts" / "download-tesseract.ps1"

    @pytest.fixture
    def script_content(self, script_path: Path) -> str:
        """Read download script content."""
        if not script_path.exists():
            pytest.skip("Download script not created yet")
        return script_path.read_text(encoding="utf-8")

    def test_download_script_exists(self, script_path: Path) -> None:
        """Download script should exist."""
        assert script_path.exists(), f"Missing: {script_path}"

    def test_script_downloads_tesseract(self, script_content: str) -> None:
        """Script should download Tesseract binary."""
        assert "tesseract" in script_content.lower()
        assert "download" in script_content.lower() or "Invoke-WebRequest" in script_content

    def test_script_downloads_spanish_data(self, script_content: str) -> None:
        """Script should download Spanish language data."""
        # spa is the Tesseract code for Spanish
        assert "spa" in script_content.lower() or "spanish" in script_content.lower()

    def test_script_has_version(self, script_content: str) -> None:
        """Script should specify Tesseract version."""
        # Should have a version like 5.x or specific version number
        has_version = (
            "5.0" in script_content or
            "5.1" in script_content or
            "5.2" in script_content or
            "5.3" in script_content or
            "version" in script_content.lower()
        )
        assert has_version, "Should specify Tesseract version"


class TestTesseractPathConfig:
    """Tests for Tesseract path configuration."""

    @pytest.fixture
    def main_preload_path(self) -> Path:
        """Get path to main process preload or config."""
        # Check for tesseract path configuration in main process
        return DESKTOP_APP_ROOT / "src" / "main" / "tesseract-config.ts"

    def test_tesseract_config_exists(self, main_preload_path: Path) -> None:
        """Tesseract path configuration should exist."""
        assert main_preload_path.exists(), f"Missing: {main_preload_path}"

    def test_config_handles_development_path(self, main_preload_path: Path) -> None:
        """Config should handle development path."""
        if not main_preload_path.exists():
            pytest.skip("Config not created yet")
        content = main_preload_path.read_text(encoding="utf-8")
        # Should check for development mode
        has_dev_check = (
            "isDev" in content or
            "development" in content.lower() or
            "process.env" in content
        )
        assert has_dev_check, "Should handle development mode"

    def test_config_handles_packaged_path(self, main_preload_path: Path) -> None:
        """Config should handle packaged app path."""
        if not main_preload_path.exists():
            pytest.skip("Config not created yet")
        content = main_preload_path.read_text(encoding="utf-8")
        # Should reference resourcesPath for packaged app
        has_resources_path = (
            "resourcesPath" in content or
            "resources" in content.lower()
        )
        assert has_resources_path, "Should use resourcesPath for packaged app"


class TestTesseractLanguageData:
    """Tests for Tesseract language data configuration."""

    @pytest.fixture
    def download_script_path(self) -> Path:
        """Get path to download script."""
        return DESKTOP_APP_ROOT / "scripts" / "download-tesseract.ps1"

    def test_spanish_traineddata_configured(self, download_script_path: Path) -> None:
        """Spanish language data should be configured."""
        if not download_script_path.exists():
            pytest.skip("Script not created yet")
        content = download_script_path.read_text(encoding="utf-8")
        # spa.traineddata is the Spanish language file
        assert "spa" in content, "Should include Spanish (spa) language data"

    def test_english_traineddata_configured(self, download_script_path: Path) -> None:
        """English language data should be included as fallback."""
        if not download_script_path.exists():
            pytest.skip("Script not created yet")
        content = download_script_path.read_text(encoding="utf-8")
        # eng.traineddata for English
        assert "eng" in content, "Should include English (eng) language data"


class TestTesseractDirectory:
    """Tests for Tesseract directory structure."""

    @pytest.fixture
    def tesseract_readme(self) -> Path:
        """Get path to tesseract README."""
        return DESKTOP_APP_ROOT / "resources" / "tesseract" / "README.md"

    def test_tesseract_resources_dir_structure(self, tesseract_readme: Path) -> None:
        """Tesseract resources should have README."""
        assert tesseract_readme.exists(), f"Missing: {tesseract_readme}"

    def test_readme_has_instructions(self, tesseract_readme: Path) -> None:
        """README should have setup instructions."""
        if not tesseract_readme.exists():
            pytest.skip("README not created yet")
        content = tesseract_readme.read_text(encoding="utf-8")
        assert "download" in content.lower() or "setup" in content.lower()
