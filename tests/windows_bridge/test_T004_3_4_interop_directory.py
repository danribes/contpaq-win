"""
Tests for T004.3.4: Create Interop/ directory for COM wrappers

Verifies that the Interop directory exists with proper structure
for COM interop with ContPAQi SDK DLLs.
"""

import os
import pytest

# Path to the ContPAQWinBridge project directory
PROJECT_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
    "windows-bridge",
    "src",
    "ContPAQWinBridge"
)

INTEROP_PATH = os.path.join(PROJECT_PATH, "Interop")


class TestInteropDirectoryExists:
    """Tests for Interop directory existence."""

    def test_interop_directory_exists(self):
        """T004.3.4: Interop directory should exist."""
        assert os.path.exists(INTEROP_PATH), \
            f"Interop directory not found at {INTEROP_PATH}"

    def test_interop_is_directory(self):
        """T004.3.4: Interop should be a directory, not a file."""
        assert os.path.isdir(INTEROP_PATH), \
            "Interop should be a directory"


class TestInteropHasFiles:
    """Tests for interop files."""

    @pytest.fixture
    def interop_files(self):
        """Get list of files in Interop directory."""
        if not os.path.exists(INTEROP_PATH):
            return []
        return os.listdir(INTEROP_PATH)

    def test_has_interop_files(self, interop_files):
        """T004.3.4: Should have interop files."""
        cs_files = [f for f in interop_files if f.endswith('.cs')]
        assert len(cs_files) >= 1, \
            "Should have at least one .cs interop file"

    def test_has_sdk_wrapper(self, interop_files):
        """T004.3.4: Should have SDK wrapper file."""
        has_sdk = any(
            'Sdk' in f or 'SDK' in f or 'ContPAQi' in f
            for f in interop_files
        )
        assert has_sdk, \
            "Should have SDK wrapper file"


class TestInteropFileContent:
    """Tests for interop file content."""

    @pytest.fixture
    def interop_files(self):
        """Get list of .cs files with full paths."""
        if not os.path.exists(INTEROP_PATH):
            return []
        files = [f for f in os.listdir(INTEROP_PATH) if f.endswith('.cs')]
        return [(f, os.path.join(INTEROP_PATH, f)) for f in files]

    def test_interop_has_namespace(self, interop_files):
        """T004.3.4: Interop files should have correct namespace."""
        for filename, filepath in interop_files:
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            assert 'namespace ContPAQWinBridge.Interop' in content, \
                f"{filename} should have ContPAQWinBridge.Interop namespace"

    def test_interop_has_xml_docs(self, interop_files):
        """T004.3.4: Interop files should have XML documentation."""
        for filename, filepath in interop_files:
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            has_docs = '///' in content
            assert has_docs, \
                f"{filename} should have XML documentation"


class TestComInteropPatterns:
    """Tests for COM interop patterns."""

    @pytest.fixture
    def interop_content(self):
        """Get content of all interop files."""
        if not os.path.exists(INTEROP_PATH):
            return ""
        content = ""
        for filename in os.listdir(INTEROP_PATH):
            if filename.endswith('.cs'):
                filepath = os.path.join(INTEROP_PATH, filename)
                with open(filepath, 'r', encoding='utf-8') as f:
                    content += f.read() + "\n"
        return content

    def test_has_runtime_interop_using(self, interop_content):
        """T004.3.4: Should reference System.Runtime.InteropServices."""
        if not interop_content:
            pytest.skip("No interop files yet")
        has_interop = (
            'System.Runtime.InteropServices' in interop_content or
            'InteropServices' in interop_content or
            'ComImport' in interop_content or
            'DllImport' in interop_content
        )
        assert has_interop, \
            "Should reference System.Runtime.InteropServices or use COM attributes"

    def test_has_interface_or_class(self, interop_content):
        """T004.3.4: Should define interface or class for SDK."""
        if not interop_content:
            pytest.skip("No interop files yet")
        has_definition = (
            'interface' in interop_content or
            'class' in interop_content
        )
        assert has_definition, \
            "Should define interface or class for SDK interop"


class TestSdkWrapperStructure:
    """Tests for SDK wrapper structure."""

    def test_sdk_wrapper_exists(self):
        """T004.3.4: Should have ContPAQi SDK wrapper."""
        if not os.path.exists(INTEROP_PATH):
            pytest.skip("Interop directory doesn't exist yet")

        files = os.listdir(INTEROP_PATH)
        has_wrapper = any(
            'ContPAQi' in f or 'Comercial' in f or 'Contabilidad' in f or 'Sdk' in f
            for f in files if f.endswith('.cs')
        )
        assert has_wrapper, \
            "Should have ContPAQi SDK wrapper file"

    def test_wrapper_mentions_sdk(self):
        """T004.3.4: Wrapper should mention SDK operations."""
        if not os.path.exists(INTEROP_PATH):
            pytest.skip("Interop directory doesn't exist yet")

        for filename in os.listdir(INTEROP_PATH):
            if filename.endswith('.cs'):
                filepath = os.path.join(INTEROP_PATH, filename)
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()
                if 'SDK' in content or 'Sdk' in content or 'ContPAQi' in content:
                    return  # Test passes
        pytest.fail("Wrapper should mention SDK or ContPAQi")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
