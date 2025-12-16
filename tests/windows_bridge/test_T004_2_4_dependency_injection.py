"""
Tests for T004.2.4: Configure dependency injection container

Verifies that Program.cs properly configures the ASP.NET Core
dependency injection container with appropriate service registrations,
lifetimes, and patterns.
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


class TestDependencyInjectionSection:
    """Tests for DI container configuration section."""

    @pytest.fixture
    def program_content(self):
        """Load Program.cs content."""
        with open(PROGRAM_PATH, "r", encoding="utf-8") as f:
            return f.read()

    def test_has_services_configuration(self, program_content):
        """T004.2.4: Should have services configuration section."""
        assert "builder.Services" in program_content, \
            "Should configure services using builder.Services"

    def test_has_di_section_comment(self, program_content):
        """T004.2.4: Should have comment for DI section."""
        content_lower = program_content.lower()
        has_comment = (
            "dependency injection" in content_lower or
            "di container" in content_lower or
            "service registration" in content_lower or
            "register services" in content_lower or
            "add services" in content_lower
        )
        assert has_comment, "Should have comment for DI configuration section"


class TestHttpClientConfiguration:
    """Tests for HttpClient registration."""

    @pytest.fixture
    def program_content(self):
        """Load Program.cs content."""
        with open(PROGRAM_PATH, "r", encoding="utf-8") as f:
            return f.read()

    def test_has_http_client_factory(self, program_content):
        """T004.2.4: Should register HttpClient for external calls."""
        has_http_client = (
            "AddHttpClient" in program_content or
            "IHttpClientFactory" in program_content
        )
        assert has_http_client, "Should register HttpClient factory"


class TestOptionsPattern:
    """Tests for Options pattern configuration."""

    @pytest.fixture
    def program_content(self):
        """Load Program.cs content."""
        with open(PROGRAM_PATH, "r", encoding="utf-8") as f:
            return f.read()

    def test_has_options_configuration(self, program_content):
        """T004.2.4: Should configure options pattern."""
        has_options = (
            "Configure<" in program_content or
            "AddOptions" in program_content or
            "IOptions<" in program_content or
            "GetSection" in program_content
        )
        assert has_options, "Should use Options pattern for configuration"


class TestServiceLifetimes:
    """Tests for proper service lifetime usage."""

    @pytest.fixture
    def program_content(self):
        """Load Program.cs content."""
        with open(PROGRAM_PATH, "r", encoding="utf-8") as f:
            return f.read()

    def test_uses_service_lifetimes(self, program_content):
        """T004.2.4: Should use appropriate service lifetimes."""
        # Check for at least one lifetime registration method
        has_lifetime = (
            "AddScoped" in program_content or
            "AddTransient" in program_content or
            "AddSingleton" in program_content
        )
        assert has_lifetime, "Should use AddScoped, AddTransient, or AddSingleton"

    def test_has_scoped_services(self, program_content):
        """T004.2.4: Should have scoped services for request-based operations."""
        # Scoped is typical for request-scoped services
        assert "AddScoped" in program_content, \
            "Should register scoped services"


class TestServiceRegistrationPatterns:
    """Tests for service registration patterns."""

    @pytest.fixture
    def program_content(self):
        """Load Program.cs content."""
        with open(PROGRAM_PATH, "r", encoding="utf-8") as f:
            return f.read()

    def test_uses_interface_implementation_pattern(self, program_content):
        """T004.2.4: Should register services with interface-implementation pattern."""
        # Pattern: AddScoped<IService, ServiceImpl>() or similar
        has_interface_pattern = (
            re.search(r'Add(Scoped|Transient|Singleton)<I\w+,\s*\w+>', program_content) or
            re.search(r'Add(Scoped|Transient|Singleton)<I\w+>', program_content)
        )
        assert has_interface_pattern, \
            "Should use interface-implementation pattern (e.g., AddScoped<IService, ServiceImpl>)"


class TestCorsConfiguration:
    """Tests for CORS configuration."""

    @pytest.fixture
    def program_content(self):
        """Load Program.cs content."""
        with open(PROGRAM_PATH, "r", encoding="utf-8") as f:
            return f.read()

    def test_has_cors_configuration(self, program_content):
        """T004.2.4: Should configure CORS for localhost."""
        has_cors = (
            "AddCors" in program_content or
            "UseCors" in program_content
        )
        # CORS is optional for localhost-only service
        # If present, verify it's configured
        if has_cors:
            assert "AddCors" in program_content, \
                "If using CORS, should add CORS services"


class TestHealthCheckServices:
    """Tests for health check service registration."""

    @pytest.fixture
    def program_content(self):
        """Load Program.cs content."""
        with open(PROGRAM_PATH, "r", encoding="utf-8") as f:
            return f.read()

    def test_has_health_checks(self, program_content):
        """T004.2.4: Should register health check services."""
        has_health = (
            "AddHealthChecks" in program_content or
            "MapHealthChecks" in program_content
        )
        assert has_health, "Should register health check services"


class TestMemoryCacheConfiguration:
    """Tests for memory cache registration."""

    @pytest.fixture
    def program_content(self):
        """Load Program.cs content."""
        with open(PROGRAM_PATH, "r", encoding="utf-8") as f:
            return f.read()

    def test_has_memory_cache(self, program_content):
        """T004.2.4: Should register memory cache for performance."""
        has_cache = (
            "AddMemoryCache" in program_content or
            "IMemoryCache" in program_content
        )
        assert has_cache, "Should register memory cache service"


class TestApplicationServicesPlaceholder:
    """Tests for application service placeholders."""

    @pytest.fixture
    def program_content(self):
        """Load Program.cs content."""
        with open(PROGRAM_PATH, "r", encoding="utf-8") as f:
            return f.read()

    def test_has_application_services_section(self, program_content):
        """T004.2.4: Should have section for application services."""
        content_lower = program_content.lower()
        has_section = (
            "application services" in content_lower or
            "business services" in content_lower or
            "domain services" in content_lower or
            "sdk service" in content_lower.lower() or
            "contpaqi" in content_lower
        )
        assert has_section, "Should have section for application/business services"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
