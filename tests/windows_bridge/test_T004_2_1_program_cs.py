"""
Tests for T004.2.1: Create windows-bridge/src/ContPAQWinBridge/Program.cs

Verifies that Program.cs contains the ASP.NET Core application entry point
with proper configuration for the Windows Bridge service.
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


class TestProgramFileExists:
    """Tests for Program.cs file existence."""

    def test_program_file_exists(self):
        """T004.2.1: Program.cs should exist at correct path."""
        assert os.path.exists(PROGRAM_PATH), f"Program.cs not found at {PROGRAM_PATH}"

    def test_program_file_has_cs_extension(self):
        """T004.2.1: File should have .cs extension."""
        assert PROGRAM_PATH.endswith(".cs"), "File should have .cs extension"

    def test_program_file_is_not_empty(self):
        """T004.2.1: Program.cs should not be empty."""
        assert os.path.getsize(PROGRAM_PATH) > 0, "File should not be empty"


class TestWebApplicationBuilder:
    """Tests for WebApplication builder setup."""

    @pytest.fixture
    def program_content(self):
        """Load Program.cs content."""
        with open(PROGRAM_PATH, "r", encoding="utf-8") as f:
            return f.read()

    def test_creates_web_application_builder(self, program_content):
        """T004.2.1: Should create WebApplication.CreateBuilder."""
        assert "WebApplication.CreateBuilder" in program_content, \
            "Should use WebApplication.CreateBuilder(args)"

    def test_builds_and_runs_app(self, program_content):
        """T004.2.1: Should build and run the application."""
        assert "builder.Build()" in program_content or "app = builder.Build()" in program_content, \
            "Should call builder.Build()"
        assert "app.Run()" in program_content or "Run()" in program_content, \
            "Should call app.Run()"


class TestSerilogConfiguration:
    """Tests for Serilog logging configuration."""

    @pytest.fixture
    def program_content(self):
        """Load Program.cs content."""
        with open(PROGRAM_PATH, "r", encoding="utf-8") as f:
            return f.read()

    def test_uses_serilog(self, program_content):
        """T004.2.1: Should configure Serilog for logging."""
        # Check for Serilog usage
        has_serilog = (
            "UseSerilog" in program_content or
            "Serilog" in program_content
        )
        assert has_serilog, "Should configure Serilog"

    def test_has_logging_configuration(self, program_content):
        """T004.2.1: Should have logging configuration."""
        has_logging = (
            "Log." in program_content or
            "Serilog" in program_content or
            "logging" in program_content.lower()
        )
        assert has_logging, "Should have logging configuration"


class TestSwaggerConfiguration:
    """Tests for Swagger/OpenAPI configuration."""

    @pytest.fixture
    def program_content(self):
        """Load Program.cs content."""
        with open(PROGRAM_PATH, "r", encoding="utf-8") as f:
            return f.read()

    def test_adds_swagger_services(self, program_content):
        """T004.2.1: Should add Swagger services."""
        has_swagger = (
            "AddSwaggerGen" in program_content or
            "AddEndpointsApiExplorer" in program_content
        )
        assert has_swagger, "Should add Swagger services"

    def test_uses_swagger_middleware(self, program_content):
        """T004.2.1: Should use Swagger middleware."""
        has_swagger_ui = (
            "UseSwagger" in program_content or
            "UseSwaggerUI" in program_content
        )
        assert has_swagger_ui, "Should use Swagger middleware"


class TestControllerConfiguration:
    """Tests for controller/API configuration."""

    @pytest.fixture
    def program_content(self):
        """Load Program.cs content."""
        with open(PROGRAM_PATH, "r", encoding="utf-8") as f:
            return f.read()

    def test_adds_controllers(self, program_content):
        """T004.2.1: Should add controllers."""
        has_controllers = (
            "AddControllers" in program_content or
            "AddControllersWithViews" in program_content or
            "MapControllers" in program_content
        )
        assert has_controllers, "Should add/map controllers"

    def test_maps_controllers(self, program_content):
        """T004.2.1: Should map controller endpoints."""
        assert "MapControllers" in program_content, \
            "Should call MapControllers() to map endpoints"


class TestMiddlewarePipeline:
    """Tests for middleware pipeline configuration."""

    @pytest.fixture
    def program_content(self):
        """Load Program.cs content."""
        with open(PROGRAM_PATH, "r", encoding="utf-8") as f:
            return f.read()

    def test_has_https_redirection_or_http(self, program_content):
        """T004.2.1: Should handle HTTP/HTTPS appropriately."""
        # Either uses HTTPS redirection or explicitly allows HTTP for local service
        has_http_handling = (
            "UseHttpsRedirection" in program_content or
            "http://" in program_content or
            "localhost" in program_content or
            "127.0.0.1" in program_content
        )
        assert has_http_handling, "Should configure HTTP handling"

    def test_has_authorization_or_comment(self, program_content):
        """T004.2.1: Should address authorization."""
        # Either uses authorization or has it commented/noted for localhost-only
        has_auth = (
            "UseAuthorization" in program_content or
            "authorization" in program_content.lower() or
            "localhost" in program_content.lower()
        )
        assert has_auth, "Should address authorization"


class TestCodeStructure:
    """Tests for code structure and quality."""

    @pytest.fixture
    def program_content(self):
        """Load Program.cs content."""
        with open(PROGRAM_PATH, "r", encoding="utf-8") as f:
            return f.read()

    def test_is_valid_csharp(self, program_content):
        """T004.2.1: Should be valid C# syntax (basic check)."""
        # Check for balanced braces (simple validation)
        open_braces = program_content.count("{")
        close_braces = program_content.count("}")
        assert open_braces == close_braces, \
            f"Unbalanced braces: {open_braces} {{ vs {close_braces} }}"

    def test_has_top_level_statements_or_main(self, program_content):
        """T004.2.1: Should use top-level statements or have Main method."""
        # Modern .NET uses top-level statements (no explicit Main needed)
        # Or traditional Main method
        has_entry = (
            "WebApplication.CreateBuilder" in program_content or
            "static void Main" in program_content or
            "static async Task Main" in program_content
        )
        assert has_entry, "Should have application entry point"

    def test_file_is_utf8(self):
        """T004.2.1: File should be UTF-8 encoded."""
        with open(PROGRAM_PATH, "rb") as f:
            content = f.read()
        try:
            if content.startswith(b'\xef\xbb\xbf'):
                content[3:].decode("utf-8")
            else:
                content.decode("utf-8")
        except UnicodeDecodeError:
            pytest.fail("File should be UTF-8 encoded")


class TestErrorHandling:
    """Tests for error handling configuration."""

    @pytest.fixture
    def program_content(self):
        """Load Program.cs content."""
        with open(PROGRAM_PATH, "r", encoding="utf-8") as f:
            return f.read()

    def test_has_try_catch_or_exception_handling(self, program_content):
        """T004.2.1: Should have exception handling."""
        has_error_handling = (
            "try" in program_content or
            "catch" in program_content or
            "Exception" in program_content or
            "finally" in program_content or
            "Log.Fatal" in program_content or
            "Log.Error" in program_content
        )
        assert has_error_handling, "Should have exception handling"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
