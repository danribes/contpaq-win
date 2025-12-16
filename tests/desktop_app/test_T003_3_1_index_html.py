"""
Tests for T003.3.1: Create desktop-app/src/renderer/index.html

Tests verify that the HTML entry point for the React renderer exists
and contains all required elements for a modern web application.
"""

import os
import re

import pytest


# Path to the index.html file
INDEX_HTML_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
    "desktop-app",
    "src",
    "renderer",
    "index.html",
)


class TestIndexHtml:
    """Test suite for desktop-app/src/renderer/index.html."""

    def test_index_html_exists(self):
        """Test that index.html exists in src/renderer directory."""
        assert os.path.isfile(INDEX_HTML_PATH), (
            f"index.html not found at {INDEX_HTML_PATH}"
        )

    def test_index_html_is_not_empty(self):
        """Test that index.html has content."""
        with open(INDEX_HTML_PATH, "r", encoding="utf-8") as f:
            content = f.read()
        assert len(content.strip()) > 0, "index.html must not be empty"

    def test_index_html_has_doctype(self):
        """Test that index.html has HTML5 doctype."""
        with open(INDEX_HTML_PATH, "r", encoding="utf-8") as f:
            content = f.read()
        assert "<!DOCTYPE html>" in content or "<!doctype html>" in content, (
            "index.html must have HTML5 doctype"
        )

    def test_index_html_has_html_tag(self):
        """Test that index.html has html tag with lang attribute."""
        with open(INDEX_HTML_PATH, "r", encoding="utf-8") as f:
            content = f.read()
        assert "<html" in content and "</html>" in content, (
            "index.html must have html tags"
        )

    def test_index_html_has_head_tag(self):
        """Test that index.html has head section."""
        with open(INDEX_HTML_PATH, "r", encoding="utf-8") as f:
            content = f.read()
        assert "<head>" in content and "</head>" in content, (
            "index.html must have head tags"
        )

    def test_index_html_has_body_tag(self):
        """Test that index.html has body section."""
        with open(INDEX_HTML_PATH, "r", encoding="utf-8") as f:
            content = f.read()
        assert "<body>" in content or "<body " in content, (
            "index.html must have body tag"
        )

    def test_index_html_has_charset_meta(self):
        """Test that index.html has charset meta tag."""
        with open(INDEX_HTML_PATH, "r", encoding="utf-8") as f:
            content = f.read()
        has_charset = (
            'charset="utf-8"' in content.lower() or
            "charset='utf-8'" in content.lower() or
            'charset="UTF-8"' in content or
            "charset='UTF-8'" in content
        )
        assert has_charset, (
            "index.html must have charset meta tag"
        )

    def test_index_html_has_viewport_meta(self):
        """Test that index.html has viewport meta tag for responsive design."""
        with open(INDEX_HTML_PATH, "r", encoding="utf-8") as f:
            content = f.read()
        assert "viewport" in content, (
            "index.html must have viewport meta tag"
        )

    def test_index_html_has_title(self):
        """Test that index.html has a title element."""
        with open(INDEX_HTML_PATH, "r", encoding="utf-8") as f:
            content = f.read()
        assert "<title>" in content and "</title>" in content, (
            "index.html must have title element"
        )

    def test_index_html_has_root_div(self):
        """Test that index.html has root div for React mounting."""
        with open(INDEX_HTML_PATH, "r", encoding="utf-8") as f:
            content = f.read()
        has_root = (
            'id="root"' in content or
            "id='root'" in content or
            'id="app"' in content or
            "id='app'" in content
        )
        assert has_root, (
            "index.html must have a root div (id='root' or id='app') for React"
        )

    def test_index_html_has_script_reference(self):
        """Test that index.html has script reference for the app."""
        with open(INDEX_HTML_PATH, "r", encoding="utf-8") as f:
            content = f.read()
        has_script = (
            "<script" in content or
            "type=\"module\"" in content
        )
        assert has_script, (
            "index.html must have a script reference"
        )

    def test_index_html_has_spanish_lang(self):
        """Test that index.html has Spanish language attribute."""
        with open(INDEX_HTML_PATH, "r", encoding="utf-8") as f:
            content = f.read()
        has_spanish = (
            'lang="es"' in content or
            "lang='es'" in content
        )
        assert has_spanish, (
            "index.html should have Spanish language attribute (lang='es')"
        )
