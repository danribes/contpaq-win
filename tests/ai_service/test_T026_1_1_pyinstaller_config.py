"""
T026.1.1 - PyInstaller Configuration Tests

Tests for the PyInstaller spec file configuration used to package
the AI service as a standalone Windows executable.
"""

import os
from pathlib import Path

import pytest

# Get project root
PROJECT_ROOT = Path(__file__).parent.parent.parent
AI_SERVICE_ROOT = PROJECT_ROOT / "ai-service"


class TestPyInstallerSpecFile:
    """Tests for ai-service.spec PyInstaller configuration."""

    @pytest.fixture
    def spec_file_path(self) -> Path:
        """Get path to PyInstaller spec file."""
        return AI_SERVICE_ROOT / "ai-service.spec"

    @pytest.fixture
    def spec_content(self, spec_file_path: Path) -> str:
        """Read spec file content."""
        assert spec_file_path.exists(), f"Spec file not found: {spec_file_path}"
        return spec_file_path.read_text(encoding="utf-8")

    def test_spec_file_exists(self, spec_file_path: Path) -> None:
        """Spec file should exist in ai-service directory."""
        assert spec_file_path.exists(), f"Missing spec file: {spec_file_path}"

    def test_spec_file_is_valid_python(self, spec_file_path: Path) -> None:
        """Spec file should be valid Python syntax."""
        content = spec_file_path.read_text(encoding="utf-8")
        try:
            compile(content, spec_file_path, "exec")
        except SyntaxError as e:
            pytest.fail(f"Spec file has invalid Python syntax: {e}")

    def test_spec_defines_analysis(self, spec_content: str) -> None:
        """Spec file should define Analysis object."""
        assert "Analysis(" in spec_content, "Missing Analysis configuration"

    def test_spec_entry_point_is_main(self, spec_content: str) -> None:
        """Spec file should use src/main.py as entry point."""
        assert "main.py" in spec_content, "Entry point should be main.py"

    def test_spec_includes_hidden_imports(self, spec_content: str) -> None:
        """Spec file should include hidden imports for dynamic modules."""
        assert "hiddenimports" in spec_content, "Missing hiddenimports configuration"

    def test_spec_includes_uvicorn_hidden_imports(self, spec_content: str) -> None:
        """Spec file should include uvicorn hidden imports."""
        assert "uvicorn" in spec_content, "Missing uvicorn in hidden imports"

    def test_spec_includes_fastapi_hidden_imports(self, spec_content: str) -> None:
        """Spec file should include FastAPI hidden imports."""
        # FastAPI uses starlette internally
        assert "starlette" in spec_content or "fastapi" in spec_content, \
            "Missing FastAPI/starlette in hidden imports"

    def test_spec_includes_torch_hidden_imports(self, spec_content: str) -> None:
        """Spec file should include PyTorch hidden imports."""
        assert "torch" in spec_content, "Missing torch in hidden imports"

    def test_spec_includes_transformers_hidden_imports(self, spec_content: str) -> None:
        """Spec file should include transformers hidden imports."""
        assert "transformers" in spec_content, "Missing transformers in hidden imports"

    def test_spec_includes_datas_section(self, spec_content: str) -> None:
        """Spec file should include datas for additional files."""
        assert "datas" in spec_content, "Missing datas configuration"

    def test_spec_defines_exe(self, spec_content: str) -> None:
        """Spec file should define EXE object."""
        assert "EXE(" in spec_content, "Missing EXE configuration"

    def test_spec_defines_collect(self, spec_content: str) -> None:
        """Spec file should define COLLECT for folder mode."""
        assert "COLLECT(" in spec_content, "Missing COLLECT configuration"

    def test_spec_sets_console_false_or_true(self, spec_content: str) -> None:
        """Spec file should configure console mode."""
        assert "console=" in spec_content, "Missing console configuration"

    def test_spec_sets_output_name(self, spec_content: str) -> None:
        """Spec file should set application name."""
        assert "name=" in spec_content, "Missing name configuration"


class TestBuildScript:
    """Tests for the build script that packages the AI service."""

    @pytest.fixture
    def build_script_path(self) -> Path:
        """Get path to build script."""
        return AI_SERVICE_ROOT / "scripts" / "build.py"

    def test_build_script_exists(self, build_script_path: Path) -> None:
        """Build script should exist."""
        assert build_script_path.exists(), f"Missing build script: {build_script_path}"

    def test_build_script_is_valid_python(self, build_script_path: Path) -> None:
        """Build script should be valid Python syntax."""
        if not build_script_path.exists():
            pytest.skip("Build script not created yet")
        content = build_script_path.read_text(encoding="utf-8")
        try:
            compile(content, build_script_path, "exec")
        except SyntaxError as e:
            pytest.fail(f"Build script has invalid Python syntax: {e}")


class TestRequirementsDev:
    """Tests for development requirements including PyInstaller."""

    @pytest.fixture
    def requirements_dev_path(self) -> Path:
        """Get path to requirements-dev.txt."""
        return AI_SERVICE_ROOT / "requirements-dev.txt"

    @pytest.fixture
    def requirements_dev_content(self, requirements_dev_path: Path) -> str:
        """Read requirements-dev.txt content."""
        assert requirements_dev_path.exists()
        return requirements_dev_path.read_text(encoding="utf-8")

    def test_pyinstaller_in_dev_requirements(self, requirements_dev_content: str) -> None:
        """PyInstaller should be in development requirements."""
        assert "pyinstaller" in requirements_dev_content.lower(), \
            "PyInstaller missing from requirements-dev.txt"
