"""
Test T001.2.3 - Verify README.md exists and contains required sections

This test verifies that README.md exists and contains project overview,
installation instructions, and other essential documentation.
"""

import os
import pytest

# Base path for the project
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


class TestReadmeConfiguration:
    """Test cases for T001.2.3 - README.md configuration"""

    def test_readme_file_exists(self):
        """Verify that README.md file exists"""
        readme_path = os.path.join(PROJECT_ROOT, "README.md")
        assert os.path.isfile(readme_path), f"README.md should exist at {readme_path}"

    def test_readme_has_project_name(self):
        """Verify that README.md contains the project name"""
        readme_path = os.path.join(PROJECT_ROOT, "README.md")
        with open(readme_path, 'r') as f:
            content = f.read()

        assert "ContPAQ-Win" in content, "README.md should contain the project name 'ContPAQ-Win'"

    def test_readme_has_description(self):
        """Verify that README.md contains a project description"""
        readme_path = os.path.join(PROJECT_ROOT, "README.md")
        with open(readme_path, 'r') as f:
            content = f.read()

        # Check for key description terms
        description_terms = ["invoice", "Windows", "ContPAQi"]
        found = sum(1 for term in description_terms if term.lower() in content.lower())
        assert found >= 2, "README.md should contain project description with relevant terms"

    def test_readme_has_architecture_section(self):
        """Verify that README.md has an architecture or structure section"""
        readme_path = os.path.join(PROJECT_ROOT, "README.md")
        with open(readme_path, 'r') as f:
            content = f.read().lower()

        has_architecture = "architecture" in content or "structure" in content or "components" in content
        assert has_architecture, "README.md should have an architecture/structure section"

    def test_readme_has_requirements_section(self):
        """Verify that README.md has a requirements or prerequisites section"""
        readme_path = os.path.join(PROJECT_ROOT, "README.md")
        with open(readme_path, 'r') as f:
            content = f.read().lower()

        has_requirements = "requirements" in content or "prerequisites" in content or "dependencies" in content
        assert has_requirements, "README.md should have a requirements/prerequisites section"

    def test_readme_has_installation_section(self):
        """Verify that README.md has installation instructions"""
        readme_path = os.path.join(PROJECT_ROOT, "README.md")
        with open(readme_path, 'r') as f:
            content = f.read().lower()

        has_installation = "installation" in content or "getting started" in content or "setup" in content
        assert has_installation, "README.md should have installation instructions"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
