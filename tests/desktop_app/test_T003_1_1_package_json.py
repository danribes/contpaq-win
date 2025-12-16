"""
Test Suite: T003.1.1 - Create desktop-app/package.json with dependencies
Tests verify that package.json exists and contains required dependencies.
"""

import os
import json
import pytest

# Path to package.json
PACKAGE_JSON_PATH = os.path.join(
    os.path.dirname(__file__),
    "..",
    "..",
    "desktop-app",
    "package.json",
)


class TestPackageJson:
    """Test suite for desktop-app/package.json."""

    def test_package_json_exists(self):
        """Test that package.json file exists in desktop-app directory."""
        assert os.path.isfile(PACKAGE_JSON_PATH), (
            f"package.json not found at {PACKAGE_JSON_PATH}"
        )

    def test_package_json_is_valid_json(self):
        """Test that package.json is valid JSON."""
        with open(PACKAGE_JSON_PATH, "r", encoding="utf-8") as f:
            content = f.read()
        # This will raise JSONDecodeError if invalid
        json.loads(content)

    def test_package_json_has_name(self):
        """Test that package.json has a name field."""
        with open(PACKAGE_JSON_PATH, "r", encoding="utf-8") as f:
            data = json.load(f)
        assert "name" in data, "package.json must have 'name' field"
        assert data["name"] == "contpaq-win-desktop", (
            "package.json name should be 'contpaq-win-desktop'"
        )

    def test_package_json_has_version(self):
        """Test that package.json has a version field."""
        with open(PACKAGE_JSON_PATH, "r", encoding="utf-8") as f:
            data = json.load(f)
        assert "version" in data, "package.json must have 'version' field"
        assert data["version"] == "0.1.0", (
            "package.json version should be '0.1.0'"
        )

    def test_package_json_has_description(self):
        """Test that package.json has a description field."""
        with open(PACKAGE_JSON_PATH, "r", encoding="utf-8") as f:
            data = json.load(f)
        assert "description" in data, "package.json must have 'description' field"
        assert len(data["description"]) > 0, "description should not be empty"

    def test_package_json_has_electron_dependency(self):
        """Test that package.json includes electron dependency."""
        with open(PACKAGE_JSON_PATH, "r", encoding="utf-8") as f:
            data = json.load(f)
        dev_deps = data.get("devDependencies", {})
        assert "electron" in dev_deps, (
            "package.json must have 'electron' in devDependencies"
        )
        assert dev_deps["electron"].startswith("^28"), (
            "electron version should be ^28.x.x"
        )

    def test_package_json_has_react_dependencies(self):
        """Test that package.json includes react and react-dom dependencies."""
        with open(PACKAGE_JSON_PATH, "r", encoding="utf-8") as f:
            data = json.load(f)
        deps = data.get("dependencies", {})
        assert "react" in deps, "package.json must have 'react' dependency"
        assert "react-dom" in deps, "package.json must have 'react-dom' dependency"
        assert deps["react"].startswith("^18"), "react version should be ^18.x.x"
        assert deps["react-dom"].startswith("^18"), "react-dom version should be ^18.x.x"

    def test_package_json_has_react_pdf_dependency(self):
        """Test that package.json includes react-pdf dependency."""
        with open(PACKAGE_JSON_PATH, "r", encoding="utf-8") as f:
            data = json.load(f)
        deps = data.get("dependencies", {})
        assert "react-pdf" in deps, "package.json must have 'react-pdf' dependency"
        assert deps["react-pdf"].startswith("^7"), "react-pdf version should be ^7.x.x"

    def test_package_json_has_better_sqlite3_dependency(self):
        """Test that package.json includes better-sqlite3 dependency."""
        with open(PACKAGE_JSON_PATH, "r", encoding="utf-8") as f:
            data = json.load(f)
        deps = data.get("dependencies", {})
        assert "better-sqlite3" in deps, (
            "package.json must have 'better-sqlite3' dependency"
        )
        assert deps["better-sqlite3"].startswith("^9"), (
            "better-sqlite3 version should be ^9.x.x"
        )

    def test_package_json_has_tailwindcss_dependency(self):
        """Test that package.json includes tailwindcss dependency."""
        with open(PACKAGE_JSON_PATH, "r", encoding="utf-8") as f:
            data = json.load(f)
        dev_deps = data.get("devDependencies", {})
        assert "tailwindcss" in dev_deps, (
            "package.json must have 'tailwindcss' in devDependencies"
        )
        assert dev_deps["tailwindcss"].startswith("^3"), (
            "tailwindcss version should be ^3.x.x"
        )

    def test_package_json_has_main_entry(self):
        """Test that package.json has main entry point."""
        with open(PACKAGE_JSON_PATH, "r", encoding="utf-8") as f:
            data = json.load(f)
        assert "main" in data, "package.json must have 'main' entry point"

    def test_package_json_has_scripts(self):
        """Test that package.json has scripts section."""
        with open(PACKAGE_JSON_PATH, "r", encoding="utf-8") as f:
            data = json.load(f)
        assert "scripts" in data, "package.json must have 'scripts' section"
        scripts = data["scripts"]
        assert "start" in scripts, "scripts must include 'start'"
        assert "build" in scripts, "scripts must include 'build'"
