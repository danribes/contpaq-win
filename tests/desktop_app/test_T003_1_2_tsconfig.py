"""
Test Suite: T003.1.2 - Create desktop-app/tsconfig.json with strict mode
Tests verify that tsconfig.json exists and has proper TypeScript configuration.
"""

import os
import json
import pytest

# Path to tsconfig.json
TSCONFIG_PATH = os.path.join(
    os.path.dirname(__file__),
    "..",
    "..",
    "desktop-app",
    "tsconfig.json",
)


class TestTsConfig:
    """Test suite for desktop-app/tsconfig.json."""

    def test_tsconfig_exists(self):
        """Test that tsconfig.json file exists in desktop-app directory."""
        assert os.path.isfile(TSCONFIG_PATH), (
            f"tsconfig.json not found at {TSCONFIG_PATH}"
        )

    def test_tsconfig_is_valid_json(self):
        """Test that tsconfig.json is valid JSON."""
        with open(TSCONFIG_PATH, "r", encoding="utf-8") as f:
            content = f.read()
        # This will raise JSONDecodeError if invalid
        json.loads(content)

    def test_tsconfig_has_compiler_options(self):
        """Test that tsconfig.json has compilerOptions section."""
        with open(TSCONFIG_PATH, "r", encoding="utf-8") as f:
            data = json.load(f)
        assert "compilerOptions" in data, (
            "tsconfig.json must have 'compilerOptions' section"
        )

    def test_tsconfig_strict_mode_enabled(self):
        """Test that strict mode is enabled."""
        with open(TSCONFIG_PATH, "r", encoding="utf-8") as f:
            data = json.load(f)
        compiler_opts = data.get("compilerOptions", {})
        assert compiler_opts.get("strict") is True, (
            "tsconfig.json must have 'strict: true'"
        )

    def test_tsconfig_target_es2022(self):
        """Test that target is ES2022 or later."""
        with open(TSCONFIG_PATH, "r", encoding="utf-8") as f:
            data = json.load(f)
        compiler_opts = data.get("compilerOptions", {})
        target = compiler_opts.get("target", "").upper()
        valid_targets = ["ES2022", "ES2023", "ESNEXT"]
        assert target in valid_targets, (
            f"tsconfig.json target should be ES2022 or later, got {target}"
        )

    def test_tsconfig_module_commonjs_or_esnext(self):
        """Test that module is CommonJS or ESNext."""
        with open(TSCONFIG_PATH, "r", encoding="utf-8") as f:
            data = json.load(f)
        compiler_opts = data.get("compilerOptions", {})
        module = compiler_opts.get("module", "").upper()
        # For Electron, CommonJS or ESNext are valid
        valid_modules = ["COMMONJS", "ESNEXT", "NODENEXT"]
        assert module in valid_modules, (
            f"tsconfig.json module should be CommonJS or ESNext, got {module}"
        )

    def test_tsconfig_jsx_react(self):
        """Test that JSX is configured for React."""
        with open(TSCONFIG_PATH, "r", encoding="utf-8") as f:
            data = json.load(f)
        compiler_opts = data.get("compilerOptions", {})
        jsx = compiler_opts.get("jsx", "").lower()
        valid_jsx = ["react", "react-jsx", "react-jsxdev"]
        assert jsx in valid_jsx, (
            f"tsconfig.json jsx should be 'react' or 'react-jsx', got {jsx}"
        )

    def test_tsconfig_es_module_interop(self):
        """Test that esModuleInterop is enabled."""
        with open(TSCONFIG_PATH, "r", encoding="utf-8") as f:
            data = json.load(f)
        compiler_opts = data.get("compilerOptions", {})
        assert compiler_opts.get("esModuleInterop") is True, (
            "tsconfig.json must have 'esModuleInterop: true'"
        )

    def test_tsconfig_skip_lib_check(self):
        """Test that skipLibCheck is enabled for faster builds."""
        with open(TSCONFIG_PATH, "r", encoding="utf-8") as f:
            data = json.load(f)
        compiler_opts = data.get("compilerOptions", {})
        assert compiler_opts.get("skipLibCheck") is True, (
            "tsconfig.json should have 'skipLibCheck: true'"
        )

    def test_tsconfig_resolve_json_module(self):
        """Test that resolveJsonModule is enabled."""
        with open(TSCONFIG_PATH, "r", encoding="utf-8") as f:
            data = json.load(f)
        compiler_opts = data.get("compilerOptions", {})
        assert compiler_opts.get("resolveJsonModule") is True, (
            "tsconfig.json should have 'resolveJsonModule: true'"
        )

    def test_tsconfig_has_include(self):
        """Test that tsconfig.json has include section."""
        with open(TSCONFIG_PATH, "r", encoding="utf-8") as f:
            data = json.load(f)
        assert "include" in data, (
            "tsconfig.json must have 'include' section"
        )
        assert len(data["include"]) > 0, (
            "include section should not be empty"
        )
