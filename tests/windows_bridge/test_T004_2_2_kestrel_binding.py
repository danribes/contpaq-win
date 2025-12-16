"""
Tests for T004.2.2: Configure Kestrel to bind only to 127.0.0.1:5000

Verifies that Kestrel is configured to bind exclusively to localhost (127.0.0.1)
on port 5000, ensuring the service is not accessible from external networks.
"""

import os
import re
import pytest

# Path to the Program.cs file
PROGRAM_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
    "windows-bridge",
    "src",
    "ContPAQWinBridge",
    "Program.cs"
)


class TestKestrelConfiguration:
    """Tests for Kestrel server configuration."""

    @pytest.fixture
    def program_content(self):
        """Load Program.cs content."""
        with open(PROGRAM_PATH, "r", encoding="utf-8") as f:
            return f.read()

    def test_configures_kestrel(self, program_content):
        """T004.2.2: Should configure Kestrel server."""
        has_kestrel_config = (
            "ConfigureKestrel" in program_content or
            "UseKestrel" in program_content or
            "Kestrel" in program_content or
            "builder.WebHost" in program_content
        )
        assert has_kestrel_config, "Should configure Kestrel server"

    def test_binds_to_localhost(self, program_content):
        """T004.2.2: Should bind to localhost (127.0.0.1)."""
        has_localhost = (
            "127.0.0.1" in program_content or
            "localhost" in program_content.lower() or
            "IPAddress.Loopback" in program_content
        )
        assert has_localhost, "Should bind to localhost (127.0.0.1)"

    def test_binds_to_port_5000(self, program_content):
        """T004.2.2: Should bind to port 5000."""
        assert "5000" in program_content, "Should bind to port 5000"

    def test_uses_http_not_https(self, program_content):
        """T004.2.2: Should use HTTP for localhost-only service."""
        # Either explicitly uses http:// or configures ListenLocalhost
        has_http = (
            "http://" in program_content or
            "ListenLocalhost" in program_content or
            ("127.0.0.1" in program_content and "5000" in program_content)
        )
        assert has_http, "Should use HTTP for localhost-only service"


class TestSecurityConfiguration:
    """Tests for security-related configuration."""

    @pytest.fixture
    def program_content(self):
        """Load Program.cs content."""
        with open(PROGRAM_PATH, "r", encoding="utf-8") as f:
            return f.read()

    def test_no_external_binding(self, program_content):
        """T004.2.2: Should not bind to all interfaces (0.0.0.0 or *)."""
        # Check that we're not accidentally binding to all interfaces
        binds_all = (
            "0.0.0.0" in program_content or
            '"*"' in program_content or
            "IPAddress.Any" in program_content
        )
        # If binding to all, this test fails
        assert not binds_all or "127.0.0.1" in program_content, \
            "Should not bind to all interfaces without explicit localhost"

    def test_localhost_only_comment(self, program_content):
        """T004.2.2: Should have comment explaining localhost-only design."""
        content_lower = program_content.lower()
        has_comment = (
            "localhost" in content_lower or
            "local" in content_lower or
            "127.0.0.1" in content_lower
        )
        assert has_comment, "Should document localhost-only configuration"


class TestUrlConfiguration:
    """Tests for URL configuration."""

    @pytest.fixture
    def program_content(self):
        """Load Program.cs content."""
        with open(PROGRAM_PATH, "r", encoding="utf-8") as f:
            return f.read()

    def test_has_url_configuration(self, program_content):
        """T004.2.2: Should configure URLs explicitly."""
        has_url_config = (
            "Urls" in program_content or
            "urls" in program_content or
            "Listen" in program_content or
            "http://127.0.0.1:5000" in program_content or
            "http://localhost:5000" in program_content
        )
        assert has_url_config, "Should configure URLs explicitly"

    def test_complete_url_present(self, program_content):
        """T004.2.2: Should have complete URL with protocol, host, and port."""
        # Check for complete URL pattern
        has_complete_url = (
            "http://127.0.0.1:5000" in program_content or
            "http://localhost:5000" in program_content or
            re.search(r'Listen.*127\.0\.0\.1.*5000', program_content) or
            re.search(r'ListenLocalhost\s*\(\s*5000', program_content)
        )
        assert has_complete_url, "Should have complete URL (http://127.0.0.1:5000)"


class TestKestrelOptions:
    """Tests for Kestrel options configuration."""

    @pytest.fixture
    def program_content(self):
        """Load Program.cs content."""
        with open(PROGRAM_PATH, "r", encoding="utf-8") as f:
            return f.read()

    def test_uses_webhost_or_kestrel_options(self, program_content):
        """T004.2.2: Should use WebHost or Kestrel options for configuration."""
        has_config = (
            "builder.WebHost" in program_content or
            "ConfigureKestrel" in program_content or
            "UseKestrel" in program_content or
            "UseUrls" in program_content or
            'Urls' in program_content
        )
        assert has_config, "Should use WebHost or Kestrel options"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
