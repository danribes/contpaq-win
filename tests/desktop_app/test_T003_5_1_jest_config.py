"""
Tests for T003.5.1: Create Jest configuration in package.json

Tests verify that Jest is properly configured for the desktop-app
with TypeScript support, React testing environment, and coverage settings.
"""

import json
import os

import pytest


# Path to the package.json file
PACKAGE_JSON_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
    "desktop-app",
    "package.json",
)


class TestJestConfiguration:
    """Test suite for Jest configuration in package.json."""

    @pytest.fixture
    def package_json(self):
        """Load package.json."""
        with open(PACKAGE_JSON_PATH, "r", encoding="utf-8") as f:
            return json.load(f)

    def test_jest_dependency_exists(self, package_json):
        """Test that jest is in devDependencies."""
        dev_deps = package_json.get("devDependencies", {})
        assert "jest" in dev_deps, "Must have jest in devDependencies"
        assert dev_deps["jest"].startswith("^29"), "Jest should be version 29.x"

    def test_ts_jest_dependency_exists(self, package_json):
        """Test that ts-jest is in devDependencies."""
        dev_deps = package_json.get("devDependencies", {})
        assert "ts-jest" in dev_deps, "Must have ts-jest in devDependencies"

    def test_jest_types_dependency_exists(self, package_json):
        """Test that @types/jest is in devDependencies."""
        dev_deps = package_json.get("devDependencies", {})
        assert "@types/jest" in dev_deps, "Must have @types/jest in devDependencies"

    def test_test_script_exists(self, package_json):
        """Test that test script is defined."""
        scripts = package_json.get("scripts", {})
        assert "test" in scripts, "Must have test script"
        assert "jest" in scripts["test"], "Test script should use jest"

    def test_jest_config_section_exists(self, package_json):
        """Test that jest configuration section exists."""
        assert "jest" in package_json, "package.json must have 'jest' configuration section"

    def test_jest_preset_is_ts_jest(self, package_json):
        """Test that Jest uses ts-jest preset."""
        jest_config = package_json.get("jest", {})
        assert jest_config.get("preset") == "ts-jest", "Jest preset should be 'ts-jest'"

    def test_jest_test_environment_is_jsdom(self, package_json):
        """Test that Jest uses jsdom for React testing."""
        jest_config = package_json.get("jest", {})
        assert jest_config.get("testEnvironment") == "jsdom", "Jest testEnvironment should be 'jsdom'"

    def test_jest_roots_configured(self, package_json):
        """Test that Jest roots are configured."""
        jest_config = package_json.get("jest", {})
        assert "roots" in jest_config, "Jest must have roots configured"
        roots = jest_config["roots"]
        assert "<rootDir>/src" in roots, "Roots should include <rootDir>/src"

    def test_jest_test_match_configured(self, package_json):
        """Test that Jest testMatch is configured."""
        jest_config = package_json.get("jest", {})
        assert "testMatch" in jest_config, "Jest must have testMatch configured"
        test_match = jest_config["testMatch"]
        # Should match test/spec files with ts/tsx extensions
        # Patterns like "**/?(*.)+(spec|test).+(ts|tsx|js)" or similar
        assert any(
            ("test" in pattern and "ts" in pattern) or
            ("spec" in pattern and "ts" in pattern) or
            "__tests__" in pattern
            for pattern in test_match
        ), "testMatch should include TypeScript test files"

    def test_jest_module_name_mapper_configured(self, package_json):
        """Test that Jest moduleNameMapper is configured for path aliases."""
        jest_config = package_json.get("jest", {})
        assert "moduleNameMapper" in jest_config, "Jest must have moduleNameMapper for path aliases"
        mapper = jest_config["moduleNameMapper"]
        # Should have @ alias mapping
        assert any("@" in key for key in mapper.keys()), "Should have @ path alias mapping"

    def test_jest_coverage_directory_configured(self, package_json):
        """Test that Jest coverageDirectory is configured."""
        jest_config = package_json.get("jest", {})
        assert "coverageDirectory" in jest_config, "Jest must have coverageDirectory configured"

    def test_jest_collect_coverage_from_configured(self, package_json):
        """Test that Jest collectCoverageFrom is configured."""
        jest_config = package_json.get("jest", {})
        assert "collectCoverageFrom" in jest_config, "Jest must have collectCoverageFrom configured"
        coverage_from = jest_config["collectCoverageFrom"]
        # Should include src files
        assert any("src" in pattern for pattern in coverage_from), \
            "collectCoverageFrom should include src directory"

    def test_jest_transform_configured(self, package_json):
        """Test that Jest transform is configured for TypeScript."""
        jest_config = package_json.get("jest", {})
        assert "transform" in jest_config, "Jest must have transform configured"
        transform = jest_config["transform"]
        # Should transform .ts and .tsx files
        ts_patterns = [key for key in transform.keys() if "ts" in key]
        assert len(ts_patterns) > 0, "Transform should include TypeScript patterns"

    def test_jest_setup_files_after_env_configured(self, package_json):
        """Test that Jest setupFilesAfterEnv is configured."""
        jest_config = package_json.get("jest", {})
        assert "setupFilesAfterEnv" in jest_config, "Jest must have setupFilesAfterEnv configured"
        setup_files = jest_config["setupFilesAfterEnv"]
        assert len(setup_files) > 0, "Should have at least one setup file"

    def test_jest_module_file_extensions_configured(self, package_json):
        """Test that Jest moduleFileExtensions includes TypeScript."""
        jest_config = package_json.get("jest", {})
        assert "moduleFileExtensions" in jest_config, "Jest must have moduleFileExtensions"
        extensions = jest_config["moduleFileExtensions"]
        assert "ts" in extensions, "Should include .ts extension"
        assert "tsx" in extensions, "Should include .tsx extension"
        assert "js" in extensions, "Should include .js extension"
        assert "jsx" in extensions, "Should include .jsx extension"

    def test_jest_test_environment_options(self, package_json):
        """Test that Jest has testEnvironmentOptions for jsdom."""
        jest_config = package_json.get("jest", {})
        # testEnvironmentOptions is optional but good to have for jsdom
        if "testEnvironmentOptions" in jest_config:
            options = jest_config["testEnvironmentOptions"]
            assert isinstance(options, dict), "testEnvironmentOptions should be a dict"

    def test_jest_coverage_threshold_configured(self, package_json):
        """Test that Jest has coverage thresholds (optional but recommended)."""
        jest_config = package_json.get("jest", {})
        # Coverage thresholds are optional but good practice
        if "coverageThreshold" in jest_config:
            threshold = jest_config["coverageThreshold"]
            assert "global" in threshold, "Should have global coverage threshold"
