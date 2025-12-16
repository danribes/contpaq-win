"""
Tests for T003.3.3: Create desktop-app/src/renderer/App.tsx

Tests verify that the main App component exists and contains
the required structure including React Router setup and layout.
"""

import os

import pytest


# Path to the App.tsx file
APP_TSX_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
    "desktop-app",
    "src",
    "renderer",
    "App.tsx",
)


class TestAppTsx:
    """Test suite for desktop-app/src/renderer/App.tsx."""

    def test_app_tsx_exists(self):
        """Test that App.tsx exists in src/renderer directory."""
        assert os.path.isfile(APP_TSX_PATH), (
            f"App.tsx not found at {APP_TSX_PATH}"
        )

    def test_app_tsx_is_not_empty(self):
        """Test that App.tsx has content."""
        with open(APP_TSX_PATH, "r", encoding="utf-8") as f:
            content = f.read()
        assert len(content.strip()) > 0, "App.tsx must not be empty"

    def test_app_tsx_imports_react(self):
        """Test that App.tsx imports React."""
        with open(APP_TSX_PATH, "r", encoding="utf-8") as f:
            content = f.read()
        has_react = (
            "from 'react'" in content or
            'from "react"' in content or
            "import React" in content
        )
        assert has_react, (
            "App.tsx must import React"
        )

    def test_app_tsx_uses_router(self):
        """Test that App.tsx uses React Router."""
        with open(APP_TSX_PATH, "r", encoding="utf-8") as f:
            content = f.read()
        has_router = (
            "react-router" in content or
            "Router" in content or
            "Routes" in content or
            "Route" in content
        )
        assert has_router, (
            "App.tsx must use React Router"
        )

    def test_app_tsx_defines_routes(self):
        """Test that App.tsx defines at least one route."""
        with open(APP_TSX_PATH, "r", encoding="utf-8") as f:
            content = f.read()
        has_route_definition = (
            "<Route" in content or
            "path=" in content or
            'path="' in content or
            "path='" in content
        )
        assert has_route_definition, (
            "App.tsx must define routes"
        )

    def test_app_tsx_has_home_route(self):
        """Test that App.tsx has a home/root route."""
        with open(APP_TSX_PATH, "r", encoding="utf-8") as f:
            content = f.read()
        has_home_route = (
            'path="/"' in content or
            "path='/'" in content or
            'path="*"' in content or
            "index" in content.lower()
        )
        assert has_home_route, (
            "App.tsx must have a home/root route"
        )

    def test_app_tsx_is_functional_component(self):
        """Test that App.tsx defines a functional component."""
        with open(APP_TSX_PATH, "r", encoding="utf-8") as f:
            content = f.read()
        is_functional = (
            "function App" in content or
            "const App" in content or
            "App: React.FC" in content or
            "App = ()" in content
        )
        assert is_functional, (
            "App.tsx must define a functional component"
        )

    def test_app_tsx_has_default_export(self):
        """Test that App.tsx has default export."""
        with open(APP_TSX_PATH, "r", encoding="utf-8") as f:
            content = f.read()
        has_default_export = (
            "export default" in content or
            "export { App as default" in content
        )
        assert has_default_export, (
            "App.tsx must have default export"
        )

    def test_app_tsx_has_layout_structure(self):
        """Test that App.tsx has layout structure with className."""
        with open(APP_TSX_PATH, "r", encoding="utf-8") as f:
            content = f.read()
        has_layout = (
            "className=" in content or
            "class=" in content
        )
        assert has_layout, (
            "App.tsx must have layout structure with Tailwind classes"
        )

    def test_app_tsx_uses_tailwind_classes(self):
        """Test that App.tsx uses Tailwind CSS classes."""
        with open(APP_TSX_PATH, "r", encoding="utf-8") as f:
            content = f.read()
        # Common Tailwind patterns
        tailwind_patterns = [
            "flex",
            "min-h",
            "bg-",
            "text-",
            "p-",
            "m-",
            "w-",
            "h-",
        ]
        has_tailwind = any(pattern in content for pattern in tailwind_patterns)
        assert has_tailwind, (
            "App.tsx must use Tailwind CSS classes"
        )

    def test_app_tsx_has_return_statement(self):
        """Test that App.tsx has a return statement with JSX."""
        with open(APP_TSX_PATH, "r", encoding="utf-8") as f:
            content = f.read()
        has_return = (
            "return (" in content or
            "return(" in content or
            "=> (" in content or
            "=>(" in content
        )
        assert has_return, (
            "App.tsx must have a return statement with JSX"
        )

    def test_app_tsx_uses_hash_router(self):
        """Test that App.tsx uses HashRouter for Electron compatibility."""
        with open(APP_TSX_PATH, "r", encoding="utf-8") as f:
            content = f.read()
        has_hash_router = (
            "HashRouter" in content or
            "MemoryRouter" in content
        )
        assert has_hash_router, (
            "App.tsx should use HashRouter or MemoryRouter for Electron"
        )
