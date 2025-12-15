"""
Test T001.1.1 - Verify ai-service directory structure

This test verifies that the ai-service directory structure is created correctly
with the required subdirectories: src/ and tests/
"""

import os
import pytest

# Base path for the project
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


class TestAIServiceDirectoryStructure:
    """Test cases for T001.1.1 - ai-service directory structure"""

    def test_ai_service_directory_exists(self):
        """Verify that ai-service/ directory exists"""
        ai_service_path = os.path.join(PROJECT_ROOT, "ai-service")
        assert os.path.isdir(ai_service_path), f"ai-service/ directory should exist at {ai_service_path}"

    def test_ai_service_src_directory_exists(self):
        """Verify that ai-service/src/ directory exists"""
        src_path = os.path.join(PROJECT_ROOT, "ai-service", "src")
        assert os.path.isdir(src_path), f"ai-service/src/ directory should exist at {src_path}"

    def test_ai_service_tests_directory_exists(self):
        """Verify that ai-service/tests/ directory exists"""
        tests_path = os.path.join(PROJECT_ROOT, "ai-service", "tests")
        assert os.path.isdir(tests_path), f"ai-service/tests/ directory should exist at {tests_path}"

    def test_directory_structure_complete(self):
        """Verify complete directory structure for ai-service"""
        required_dirs = [
            "ai-service",
            "ai-service/src",
            "ai-service/tests",
        ]

        missing_dirs = []
        for dir_path in required_dirs:
            full_path = os.path.join(PROJECT_ROOT, dir_path)
            if not os.path.isdir(full_path):
                missing_dirs.append(dir_path)

        assert len(missing_dirs) == 0, f"Missing directories: {missing_dirs}"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
