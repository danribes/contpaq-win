"""
ContPAQ-Win AI Service - Pytest Configuration and Fixtures

This module provides shared fixtures and configuration for all AI service tests.
Fixtures include test settings, temporary environment files, and sample data paths.
"""

import os
import tempfile
from pathlib import Path

import pytest

# Directory containing test fixtures (sample PDFs, images, etc.)
FIXTURES_DIR = Path(__file__).parent / "fixtures"


@pytest.fixture
def test_settings():
    """
    Fixture providing test-specific settings configuration.

    Returns a dictionary with test environment settings that can be used
    to override default configuration values during testing.

    Yields:
        dict: Test settings with safe defaults for testing.
    """
    return {
        "HOST": "127.0.0.1",
        "PORT": 8001,  # Different port to avoid conflicts
        "LOG_LEVEL": "DEBUG",
        "TESSERACT_PATH": "/usr/bin/tesseract",
        "MODEL_PATH": str(FIXTURES_DIR / "models"),
    }


@pytest.fixture
def temp_env_file(test_settings):
    """
    Fixture providing a temporary .env file for testing.

    Creates a temporary .env file with test settings that can be used
    to test configuration loading. The file is automatically cleaned up
    after the test completes.

    Args:
        test_settings: The test_settings fixture providing configuration values.

    Yields:
        str: Path to the temporary .env file.
    """
    # Create a temporary file
    fd, path = tempfile.mkstemp(suffix=".env")

    try:
        # Write test settings to the file
        with os.fdopen(fd, "w", encoding="utf-8") as f:
            for key, value in test_settings.items():
                f.write(f"{key}={value}\n")

        yield path
    finally:
        # Clean up the temporary file
        if os.path.exists(path):
            os.unlink(path)


@pytest.fixture
def sample_pdf_path():
    """
    Fixture providing the path to a sample PDF file for testing.

    Returns the path to a sample text-based PDF in the fixtures directory.
    The fixture will return None if the fixtures directory doesn't exist yet,
    allowing tests to handle the case where sample files haven't been created.

    Returns:
        Path | None: Path to sample PDF or None if not available.
    """
    pdf_path = FIXTURES_DIR / "sample_invoice.pdf"

    if pdf_path.exists():
        return pdf_path

    # Return the expected path even if file doesn't exist yet
    # Tests can check for existence and skip if needed
    return pdf_path


@pytest.fixture
def sample_scanned_pdf_path():
    """
    Fixture providing the path to a sample scanned PDF file for testing.

    Returns the path to a sample scanned (image-based) PDF in the fixtures
    directory for OCR testing.

    Returns:
        Path | None: Path to sample scanned PDF or None if not available.
    """
    pdf_path = FIXTURES_DIR / "sample_scanned_invoice.pdf"

    if pdf_path.exists():
        return pdf_path

    return pdf_path


@pytest.fixture
def fixtures_dir():
    """
    Fixture providing the path to the fixtures directory.

    Returns:
        Path: Path to the fixtures directory.
    """
    return FIXTURES_DIR


@pytest.fixture(autouse=True)
def reset_settings_cache():
    """
    Fixture that resets the settings cache before each test.

    This ensures that each test gets a fresh Settings instance,
    preventing test pollution from cached configuration values.
    """
    # Import here to avoid circular imports
    try:
        from src.config import get_settings
        get_settings.cache_clear()
    except ImportError:
        # Config module may not be importable in all test contexts
        pass

    yield

    # Clear cache after test as well
    try:
        from src.config import get_settings
        get_settings.cache_clear()
    except ImportError:
        pass
