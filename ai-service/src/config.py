"""
ContPAQ-Win AI Service - Configuration Module

This module provides type-safe configuration management using Pydantic Settings.
Configuration values can be set via:
    1. Environment variables (highest priority)
    2. .env file in the project root
    3. Default values defined in the Settings class

Usage:
    from src.config import settings

    print(settings.HOST)  # "127.0.0.1"
    print(settings.PORT)  # 8000

Environment Variables:
    All settings can be overridden with environment variables prefixed with
    the configured env_prefix (default: none). For example:
        HOST=0.0.0.0 python -m uvicorn main:app
"""

from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Application settings with environment variable support.

    Attributes are loaded from environment variables or .env file.
    Default values are provided for development convenience.
    """

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # ===================
    # Server Settings (T002.3.2)
    # ===================

    HOST: str = "127.0.0.1"
    """Server host address. Default 127.0.0.1 binds only to localhost for security."""

    PORT: int = 8000
    """Server port number. Default 8000 is the standard FastAPI/Uvicorn port."""

    LOG_LEVEL: str = "INFO"
    """Logging level. Options: DEBUG, INFO, WARNING, ERROR, CRITICAL."""

    # ===================
    # Service Paths (T002.3.3)
    # ===================

    TESSERACT_PATH: str = "C:\\Program Files\\Tesseract-OCR\\tesseract.exe"
    """Path to Tesseract OCR executable. Windows default installation path."""

    MODEL_PATH: str = "./models/layoutlm"
    """Path to LayoutLMv3 model directory. Relative to ai-service root."""


@lru_cache
def get_settings() -> Settings:
    """
    Get cached settings instance.

    Using lru_cache ensures settings are only loaded once,
    improving performance and ensuring consistency.

    Returns:
        Settings: The application settings instance
    """
    return Settings()


# Convenience export for direct import
settings = get_settings()
