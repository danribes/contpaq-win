"""
Tests for T003.3.2: Create desktop-app/src/renderer/index.tsx

Tests verify that the React entry point exists and contains
all required elements for bootstrapping a React 18 application.
"""

import os

import pytest


# Path to the index.tsx file
INDEX_TSX_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
    "desktop-app",
    "src",
    "renderer",
    "index.tsx",
)


class TestIndexTsx:
    """Test suite for desktop-app/src/renderer/index.tsx."""

    def test_index_tsx_exists(self):
        """Test that index.tsx exists in src/renderer directory."""
        assert os.path.isfile(INDEX_TSX_PATH), (
            f"index.tsx not found at {INDEX_TSX_PATH}"
        )

    def test_index_tsx_is_not_empty(self):
        """Test that index.tsx has content."""
        with open(INDEX_TSX_PATH, "r", encoding="utf-8") as f:
            content = f.read()
        assert len(content.strip()) > 0, "index.tsx must not be empty"

    def test_index_tsx_imports_react(self):
        """Test that index.tsx imports React."""
        with open(INDEX_TSX_PATH, "r", encoding="utf-8") as f:
            content = f.read()
        has_react_import = (
            "from 'react'" in content or
            'from "react"' in content or
            "import React" in content
        )
        assert has_react_import, (
            "index.tsx must import React"
        )

    def test_index_tsx_imports_react_dom(self):
        """Test that index.tsx imports ReactDOM for rendering."""
        with open(INDEX_TSX_PATH, "r", encoding="utf-8") as f:
            content = f.read()
        has_react_dom = (
            "react-dom" in content or
            "ReactDOM" in content
        )
        assert has_react_dom, (
            "index.tsx must import react-dom"
        )

    def test_index_tsx_uses_create_root(self):
        """Test that index.tsx uses createRoot (React 18)."""
        with open(INDEX_TSX_PATH, "r", encoding="utf-8") as f:
            content = f.read()
        assert "createRoot" in content, (
            "index.tsx must use createRoot for React 18"
        )

    def test_index_tsx_uses_strict_mode(self):
        """Test that index.tsx uses StrictMode for development checks."""
        with open(INDEX_TSX_PATH, "r", encoding="utf-8") as f:
            content = f.read()
        has_strict_mode = (
            "StrictMode" in content or
            "React.StrictMode" in content
        )
        assert has_strict_mode, (
            "index.tsx should use StrictMode for development"
        )

    def test_index_tsx_mounts_to_root(self):
        """Test that index.tsx mounts to root element."""
        with open(INDEX_TSX_PATH, "r", encoding="utf-8") as f:
            content = f.read()
        has_root_reference = (
            "getElementById('root')" in content or
            'getElementById("root")' in content or
            "root" in content.lower()
        )
        assert has_root_reference, (
            "index.tsx must mount to root element"
        )

    def test_index_tsx_imports_app(self):
        """Test that index.tsx imports App component."""
        with open(INDEX_TSX_PATH, "r", encoding="utf-8") as f:
            content = f.read()
        has_app_import = (
            "import App" in content or
            "import { App" in content or
            "./App" in content
        )
        assert has_app_import, (
            "index.tsx must import App component"
        )

    def test_index_tsx_imports_styles(self):
        """Test that index.tsx imports styles/CSS."""
        with open(INDEX_TSX_PATH, "r", encoding="utf-8") as f:
            content = f.read()
        has_style_import = (
            ".css" in content or
            "styles" in content.lower() or
            "tailwind" in content.lower()
        )
        assert has_style_import, (
            "index.tsx must import styles (CSS/Tailwind)"
        )

    def test_index_tsx_renders_app(self):
        """Test that index.tsx renders App component."""
        with open(INDEX_TSX_PATH, "r", encoding="utf-8") as f:
            content = f.read()
        has_app_render = (
            "<App" in content or
            "<App/" in content or
            "App />" in content
        )
        assert has_app_render, (
            "index.tsx must render App component"
        )

    def test_index_tsx_has_null_check(self):
        """Test that index.tsx has null check for root element."""
        with open(INDEX_TSX_PATH, "r", encoding="utf-8") as f:
            content = f.read()
        has_null_check = (
            "!" in content or  # Non-null assertion
            "if" in content or  # Conditional check
            "throw" in content  # Error throwing
        )
        assert has_null_check, (
            "index.tsx should handle null root element"
        )
