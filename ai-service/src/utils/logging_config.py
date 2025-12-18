"""
ContPaq-proPDF AI Service - JSON Logging Configuration

This module provides structured JSON logging for the AI service.
All logs are output in JSON format for easy parsing and analysis.

Features:
- JSON formatted log output
- File logging with rotation
- Configurable log levels
- Request correlation IDs support
- Exception stack trace serialization

Usage:
    from utils.logging_config import setup_logging, get_logger

    # Initialize logging (call once at startup)
    setup_logging(level="INFO")

    # Get logger for your module
    logger = get_logger(__name__)
    logger.info("Processing invoice", extra={"invoice_id": "123"})
"""

import json
import logging
import os
import sys
import traceback
from datetime import datetime
from logging.handlers import RotatingFileHandler
from pathlib import Path
from typing import Any, Dict, Optional

# Default log configuration
DEFAULT_LOG_LEVEL = "INFO"
DEFAULT_LOG_FORMAT = "json"
LOG_FILE_MAX_BYTES = 10 * 1024 * 1024  # 10 MB
LOG_FILE_BACKUP_COUNT = 5
APP_NAME = "ContPaq-proPDF"
SERVICE_NAME = "ai-service"


class JSONFormatter(logging.Formatter):
    """
    Custom JSON formatter for structured logging.

    Formats log records as JSON objects with standard fields:
    - timestamp: ISO 8601 formatted timestamp
    - level: Log level name (INFO, ERROR, etc.)
    - logger: Logger name
    - message: Log message
    - module: Source module name
    - function: Source function name
    - line: Source line number

    Extra fields passed to logger are included in the output.
    Exception information is serialized as a stack trace.
    """

    def __init__(self, *args: Any, **kwargs: Any) -> None:
        """Initialize the JSON formatter."""
        super().__init__(*args, **kwargs)
        self._skip_fields = {
            'args', 'asctime', 'created', 'exc_info', 'exc_text',
            'filename', 'funcName', 'levelname', 'levelno', 'lineno',
            'module', 'msecs', 'message', 'msg', 'name', 'pathname',
            'process', 'processName', 'relativeCreated', 'stack_info',
            'thread', 'threadName', 'taskName'
        }

    def format(self, record: logging.LogRecord) -> str:
        """
        Format the log record as JSON.

        Args:
            record: The log record to format

        Returns:
            JSON formatted string
        """
        # Build base log structure
        log_data: Dict[str, Any] = {
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "module": record.module,
            "function": record.funcName,
            "line": record.lineno,
            "service": SERVICE_NAME,
        }

        # Add process and thread info
        log_data["process_id"] = record.process
        log_data["thread_id"] = record.thread

        # Add extra fields from the record
        for key, value in record.__dict__.items():
            if key not in self._skip_fields and not key.startswith('_'):
                try:
                    # Ensure the value is JSON serializable
                    json.dumps(value)
                    log_data[key] = value
                except (TypeError, ValueError):
                    log_data[key] = str(value)

        # Add exception information if present
        if record.exc_info:
            log_data["exception"] = {
                "type": record.exc_info[0].__name__ if record.exc_info[0] else None,
                "message": str(record.exc_info[1]) if record.exc_info[1] else None,
                "traceback": traceback.format_exception(*record.exc_info)
            }

        # Add stack trace if present
        if record.stack_info:
            log_data["stack_trace"] = record.stack_info

        return json.dumps(log_data, default=str, ensure_ascii=False)


def get_log_directory() -> Path:
    """
    Get the log directory path.

    On Windows, logs are stored in %LOCALAPPDATA%/ContPaq-proPDF/Logs
    On other platforms, logs are stored in ~/.contpaq-win/logs

    Returns:
        Path to the log directory
    """
    if sys.platform == "win32":
        # Windows: Use LocalAppData
        local_app_data = os.environ.get("LOCALAPPDATA")
        if local_app_data:
            log_dir = Path(local_app_data) / APP_NAME / "Logs"
        else:
            # Fallback to user profile
            user_profile = os.environ.get("USERPROFILE", "C:\\Users\\Default")
            log_dir = Path(user_profile) / "AppData" / "Local" / APP_NAME / "Logs"
    else:
        # Linux/Mac: Use home directory
        home = Path.home()
        log_dir = home / ".contpaq-win" / "logs"

    return log_dir


def setup_logging(
    level: Optional[str] = None,
    log_to_file: bool = True,
    log_to_console: bool = True
) -> logging.Logger:
    """
    Configure the logging system with JSON format.

    Sets up logging handlers for both console and file output.
    File logging uses rotation to prevent unlimited growth.

    Args:
        level: Log level (DEBUG, INFO, WARNING, ERROR, CRITICAL)
               Defaults to INFO or LOG_LEVEL environment variable
        log_to_file: Whether to log to file (default: True)
        log_to_console: Whether to log to console (default: True)

    Returns:
        The root logger instance
    """
    # Determine log level
    log_level = level or os.environ.get("LOG_LEVEL", DEFAULT_LOG_LEVEL)
    numeric_level = getattr(logging, log_level.upper(), logging.INFO)

    # Get or create root logger for our application
    root_logger = logging.getLogger("contpaq.ai")
    root_logger.setLevel(numeric_level)

    # Clear any existing handlers
    root_logger.handlers.clear()

    # Create JSON formatter
    json_formatter = JSONFormatter()

    # Console handler
    if log_to_console:
        console_handler = logging.StreamHandler(sys.stdout)
        console_handler.setLevel(numeric_level)
        console_handler.setFormatter(json_formatter)
        root_logger.addHandler(console_handler)

    # File handler with rotation
    if log_to_file:
        log_dir = get_log_directory()

        try:
            # Create log directory if it doesn't exist
            log_dir.mkdir(parents=True, exist_ok=True)

            log_file = log_dir / f"{SERVICE_NAME}.log"

            file_handler = RotatingFileHandler(
                filename=str(log_file),
                maxBytes=LOG_FILE_MAX_BYTES,
                backupCount=LOG_FILE_BACKUP_COUNT,
                encoding="utf-8"
            )
            file_handler.setLevel(numeric_level)
            file_handler.setFormatter(json_formatter)
            root_logger.addHandler(file_handler)

        except (OSError, PermissionError) as e:
            # If we can't create the log file, just use console
            if log_to_console:
                root_logger.warning(
                    f"Could not create log file: {e}. Using console only."
                )

    # Prevent propagation to root logger to avoid duplicate logs
    root_logger.propagate = False

    return root_logger


def get_logger(name: str) -> logging.Logger:
    """
    Get a logger with the given name.

    The returned logger is a child of the 'contpaq.ai' logger
    and inherits its configuration.

    Args:
        name: Logger name (typically __name__ of the calling module)

    Returns:
        Configured logger instance

    Example:
        logger = get_logger(__name__)
        logger.info("Processing started", extra={"file": "invoice.pdf"})
    """
    # Ensure name is under our namespace
    if not name.startswith("contpaq.ai"):
        name = f"contpaq.ai.{name}"

    return logging.getLogger(name)


def log_with_context(
    logger: logging.Logger,
    level: int,
    message: str,
    **context: Any
) -> None:
    """
    Log a message with additional context fields.

    Convenience function to include extra fields in log output.

    Args:
        logger: Logger instance
        level: Log level (logging.INFO, logging.ERROR, etc.)
        message: Log message
        **context: Additional context fields to include

    Example:
        log_with_context(
            logger, logging.INFO,
            "Invoice processed",
            invoice_id="INV-001",
            duration_ms=150
        )
    """
    logger.log(level, message, extra=context)
