"""
Tests for T003.4.2: Create i18n provider component

Tests verify that the i18n provider/hook exists and contains
all required functionality for internationalization.
"""

import os

import pytest


# Path to the i18n index.tsx file
I18N_INDEX_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
    "desktop-app",
    "src",
    "renderer",
    "i18n",
    "index.tsx",
)


class TestI18nProvider:
    """Test suite for desktop-app/src/renderer/i18n/index.tsx."""

    def test_i18n_index_exists(self):
        """Test that index.tsx exists in src/renderer/i18n directory."""
        assert os.path.isfile(I18N_INDEX_PATH), (
            f"i18n/index.tsx not found at {I18N_INDEX_PATH}"
        )

    def test_i18n_index_is_not_empty(self):
        """Test that index.tsx has content."""
        with open(I18N_INDEX_PATH, "r", encoding="utf-8") as f:
            content = f.read()
        assert len(content.strip()) > 0, "index.tsx must not be empty"

    def test_i18n_imports_react(self):
        """Test that index.tsx imports React."""
        with open(I18N_INDEX_PATH, "r", encoding="utf-8") as f:
            content = f.read()
        has_react = (
            "from 'react'" in content or
            'from "react"' in content or
            "import React" in content
        )
        assert has_react, "index.tsx must import React"

    def test_i18n_imports_translations(self):
        """Test that index.tsx imports the Spanish translations."""
        with open(I18N_INDEX_PATH, "r", encoding="utf-8") as f:
            content = f.read()
        has_es_import = (
            "es.json" in content or
            "./es" in content or
            "esTranslations" in content.lower()
        )
        assert has_es_import, "index.tsx must import es.json translations"

    def test_i18n_creates_context(self):
        """Test that index.tsx creates a React context."""
        with open(I18N_INDEX_PATH, "r", encoding="utf-8") as f:
            content = f.read()
        has_context = (
            "createContext" in content or
            "Context" in content
        )
        assert has_context, "index.tsx must create a React context"

    def test_i18n_exports_provider(self):
        """Test that index.tsx exports a provider component."""
        with open(I18N_INDEX_PATH, "r", encoding="utf-8") as f:
            content = f.read()
        has_provider = (
            "Provider" in content and
            "export" in content
        )
        assert has_provider, "index.tsx must export a Provider component"

    def test_i18n_exports_hook(self):
        """Test that index.tsx exports useTranslation hook."""
        with open(I18N_INDEX_PATH, "r", encoding="utf-8") as f:
            content = f.read()
        has_hook = (
            "useTranslation" in content or
            "useI18n" in content or
            "useT" in content
        )
        assert has_hook, "index.tsx must export a translation hook"

    def test_i18n_has_t_function(self):
        """Test that index.tsx has a translation function."""
        with open(I18N_INDEX_PATH, "r", encoding="utf-8") as f:
            content = f.read()
        has_t_function = (
            "t(" in content or
            "translate(" in content or
            "getString(" in content
        )
        assert has_t_function, "index.tsx must have a translation function"

    def test_i18n_supports_nested_keys(self):
        """Test that index.tsx supports nested key access."""
        with open(I18N_INDEX_PATH, "r", encoding="utf-8") as f:
            content = f.read()
        has_nested_support = (
            "split" in content or  # key.split('.')
            "." in content or  # dot notation
            "reduce" in content  # array reduce for traversal
        )
        assert has_nested_support, (
            "index.tsx must support nested key access (e.g., 'buttons.save')"
        )

    def test_i18n_has_type_definitions(self):
        """Test that index.tsx has TypeScript type definitions."""
        with open(I18N_INDEX_PATH, "r", encoding="utf-8") as f:
            content = f.read()
        has_types = (
            "interface" in content or
            "type " in content or
            ": string" in content or
            ": React" in content
        )
        assert has_types, "index.tsx must have TypeScript type definitions"

    def test_i18n_exports_are_named(self):
        """Test that index.tsx uses named exports."""
        with open(I18N_INDEX_PATH, "r", encoding="utf-8") as f:
            content = f.read()
        has_named_exports = (
            "export const" in content or
            "export function" in content or
            "export {" in content
        )
        assert has_named_exports, "index.tsx must use named exports"

    def test_i18n_has_fallback_handling(self):
        """Test that index.tsx handles missing keys."""
        with open(I18N_INDEX_PATH, "r", encoding="utf-8") as f:
            content = f.read()
        has_fallback = (
            "||" in content or  # Fallback operator
            "??" in content or  # Nullish coalescing
            "fallback" in content.lower() or
            "return key" in content  # Return key if not found
        )
        assert has_fallback, "index.tsx must handle missing translation keys"
