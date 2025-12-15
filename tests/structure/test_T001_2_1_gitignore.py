"""
Test T001.2.1 - Verify .gitignore configuration

This test verifies that .gitignore contains patterns for Python, Node.js, and .NET
"""

import os
import pytest

# Base path for the project
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


class TestGitignoreConfiguration:
    """Test cases for T001.2.1 - .gitignore configuration"""

    def test_gitignore_file_exists(self):
        """Verify that .gitignore file exists"""
        gitignore_path = os.path.join(PROJECT_ROOT, ".gitignore")
        assert os.path.isfile(gitignore_path), f".gitignore should exist at {gitignore_path}"

    def test_gitignore_contains_python_patterns(self):
        """Verify that .gitignore contains Python-specific patterns"""
        gitignore_path = os.path.join(PROJECT_ROOT, ".gitignore")
        with open(gitignore_path, 'r') as f:
            content = f.read()

        python_patterns = [
            "__pycache__",
            "*.pyc",
            ".venv",
            "*.egg-info",
        ]

        missing = [p for p in python_patterns if p not in content]
        assert len(missing) == 0, f"Missing Python patterns in .gitignore: {missing}"

    def test_gitignore_contains_node_patterns(self):
        """Verify that .gitignore contains Node.js-specific patterns"""
        gitignore_path = os.path.join(PROJECT_ROOT, ".gitignore")
        with open(gitignore_path, 'r') as f:
            content = f.read()

        node_patterns = [
            "node_modules",
            "npm-debug.log",
            "dist/",
        ]

        missing = [p for p in node_patterns if p not in content]
        assert len(missing) == 0, f"Missing Node.js patterns in .gitignore: {missing}"

    def test_gitignore_contains_dotnet_patterns(self):
        """Verify that .gitignore contains .NET-specific patterns"""
        gitignore_path = os.path.join(PROJECT_ROOT, ".gitignore")
        with open(gitignore_path, 'r') as f:
            content = f.read()

        dotnet_patterns = [
            "bin/",
            "obj/",
            "*.dll",
            "*.exe",
        ]

        missing = [p for p in dotnet_patterns if p not in content]
        assert len(missing) == 0, f"Missing .NET patterns in .gitignore: {missing}"

    def test_gitignore_contains_ide_patterns(self):
        """Verify that .gitignore contains IDE-specific patterns"""
        gitignore_path = os.path.join(PROJECT_ROOT, ".gitignore")
        with open(gitignore_path, 'r') as f:
            content = f.read()

        ide_patterns = [
            ".vscode",
            ".idea",
        ]

        missing = [p for p in ide_patterns if p not in content]
        assert len(missing) == 0, f"Missing IDE patterns in .gitignore: {missing}"

    def test_gitignore_contains_env_patterns(self):
        """Verify that .gitignore contains environment/secrets patterns"""
        gitignore_path = os.path.join(PROJECT_ROOT, ".gitignore")
        with open(gitignore_path, 'r') as f:
            content = f.read()

        env_patterns = [
            ".env",
            "*.local",
        ]

        missing = [p for p in env_patterns if p not in content]
        assert len(missing) == 0, f"Missing environment patterns in .gitignore: {missing}"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
