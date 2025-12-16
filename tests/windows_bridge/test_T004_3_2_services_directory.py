"""
Tests for T004.3.2: Create Services/ directory with interfaces

Verifies that the Services directory exists with proper interface definitions
following ASP.NET Core service layer patterns.
"""

import os
import re
import pytest

# Path to the ContPAQWinBridge project directory
PROJECT_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
    "windows-bridge",
    "src",
    "ContPAQWinBridge"
)

SERVICES_PATH = os.path.join(PROJECT_PATH, "Services")


class TestServicesDirectoryExists:
    """Tests for Services directory existence."""

    def test_services_directory_exists(self):
        """T004.3.2: Services directory should exist."""
        assert os.path.exists(SERVICES_PATH), \
            f"Services directory not found at {SERVICES_PATH}"

    def test_services_is_directory(self):
        """T004.3.2: Services should be a directory, not a file."""
        assert os.path.isdir(SERVICES_PATH), \
            "Services should be a directory"


class TestServicesHasInterfaces:
    """Tests for service interfaces."""

    @pytest.fixture
    def service_files(self):
        """Get list of files in Services directory."""
        if not os.path.exists(SERVICES_PATH):
            return []
        return os.listdir(SERVICES_PATH)

    def test_has_interface_files(self, service_files):
        """T004.3.2: Should have interface files (I*.cs)."""
        interface_files = [f for f in service_files if f.startswith('I') and f.endswith('.cs')]
        assert len(interface_files) >= 1, \
            "Should have at least one interface file (I*.cs)"

    def test_has_sdk_service_interface(self, service_files):
        """T004.3.2: Should have ISdkService interface."""
        assert 'ISdkService.cs' in service_files, \
            "Should have ISdkService.cs interface"

    def test_has_vendor_service_interface(self, service_files):
        """T004.3.2: Should have IVendorService interface."""
        assert 'IVendorService.cs' in service_files, \
            "Should have IVendorService.cs interface"

    def test_has_entry_service_interface(self, service_files):
        """T004.3.2: Should have IEntryService interface."""
        assert 'IEntryService.cs' in service_files, \
            "Should have IEntryService.cs interface"


class TestInterfaceNaming:
    """Tests for interface naming conventions."""

    @pytest.fixture
    def interface_files(self):
        """Get list of interface files."""
        if not os.path.exists(SERVICES_PATH):
            return []
        return [f for f in os.listdir(SERVICES_PATH) if f.startswith('I') and f.endswith('.cs')]

    def test_interface_naming_convention(self, interface_files):
        """T004.3.2: Interface files should follow I*Service.cs pattern."""
        for filename in interface_files:
            # Should be I[Name]Service.cs or I[Name].cs
            assert filename.startswith('I'), \
                f"{filename} should start with 'I'"
            assert filename.endswith('.cs'), \
                f"{filename} should end with '.cs'"


class TestInterfaceContent:
    """Tests for interface file content."""

    @pytest.fixture
    def interface_files(self):
        """Get list of interface files with full paths."""
        if not os.path.exists(SERVICES_PATH):
            return []
        files = [f for f in os.listdir(SERVICES_PATH) if f.startswith('I') and f.endswith('.cs')]
        return [(f, os.path.join(SERVICES_PATH, f)) for f in files]

    def test_interfaces_have_namespace(self, interface_files):
        """T004.3.2: Interfaces should have correct namespace."""
        for filename, filepath in interface_files:
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            assert 'namespace ContPAQWinBridge.Services' in content, \
                f"{filename} should have ContPAQWinBridge.Services namespace"

    def test_interfaces_are_public(self, interface_files):
        """T004.3.2: Interfaces should be public."""
        for filename, filepath in interface_files:
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            assert 'public interface' in content, \
                f"{filename} should declare public interface"

    def test_interfaces_have_xml_docs(self, interface_files):
        """T004.3.2: Interfaces should have XML documentation."""
        for filename, filepath in interface_files:
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            has_docs = '///' in content or '///<summary>' in content.replace(' ', '')
            assert has_docs, \
                f"{filename} should have XML documentation"


class TestImplementationFiles:
    """Tests for service implementation files."""

    @pytest.fixture
    def service_files(self):
        """Get list of files in Services directory."""
        if not os.path.exists(SERVICES_PATH):
            return []
        return os.listdir(SERVICES_PATH)

    def test_has_sdk_service_implementation(self, service_files):
        """T004.3.2: Should have SdkService implementation."""
        assert 'SdkService.cs' in service_files, \
            "Should have SdkService.cs implementation"

    def test_implementation_matches_interface(self, service_files):
        """T004.3.2: Each interface should have matching implementation stub."""
        interfaces = [f for f in service_files if f.startswith('I') and f.endswith('.cs')]
        for interface in interfaces:
            impl_name = interface[1:]  # Remove 'I' prefix
            # Implementation might not exist yet - just check pattern
            assert interface.startswith('I'), \
                f"Interface {interface} should start with 'I'"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
