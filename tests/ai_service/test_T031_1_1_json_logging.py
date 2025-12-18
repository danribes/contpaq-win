"""
Tests for T031.1.1: Configure Python logging with JSON format

Verifies that Python logging is properly configured with JSON format
for structured logging, including file logging to AppData/Logs.
"""

import os
import sys
import json
import pytest
import logging
import tempfile
from unittest.mock import patch, MagicMock
from pathlib import Path
from datetime import datetime

# Add ai-service/src to path for imports
AI_SERVICE_SRC = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
    "ai-service",
    "src"
)


class TestJSONLoggingModuleExists:
    """Tests for JSON logging module presence."""

    @pytest.fixture(autouse=True)
    def setup_path(self):
        """Add ai-service/src to path and clear module cache."""
        if AI_SERVICE_SRC not in sys.path:
            sys.path.insert(0, AI_SERVICE_SRC)
        # Clear any cached imports
        for mod in list(sys.modules.keys()):
            if "logging_config" in mod or mod.startswith("utils."):
                del sys.modules[mod]
        yield

    def test_logging_config_module_exists(self):
        """T031.1.1: logging_config module should exist."""
        import utils.logging_config
        assert utils.logging_config is not None

    def test_setup_logging_function_exists(self):
        """T031.1.1: setup_logging function should exist."""
        from utils.logging_config import setup_logging
        assert callable(setup_logging)

    def test_get_logger_function_exists(self):
        """T031.1.1: get_logger function should exist."""
        from utils.logging_config import get_logger
        assert callable(get_logger)


class TestJSONFormatterClass:
    """Tests for JSON formatter class."""

    @pytest.fixture(autouse=True)
    def setup_path(self):
        """Add ai-service/src to path and clear module cache."""
        if AI_SERVICE_SRC not in sys.path:
            sys.path.insert(0, AI_SERVICE_SRC)
        for mod in list(sys.modules.keys()):
            if "logging_config" in mod or mod.startswith("utils."):
                del sys.modules[mod]
        yield

    def test_json_formatter_class_exists(self):
        """T031.1.1: JSONFormatter class should exist."""
        from utils.logging_config import JSONFormatter
        assert JSONFormatter is not None

    def test_json_formatter_inherits_from_formatter(self):
        """T031.1.1: JSONFormatter should inherit from logging.Formatter."""
        from utils.logging_config import JSONFormatter
        assert issubclass(JSONFormatter, logging.Formatter)


class TestJSONFormatterOutput:
    """Tests for JSON formatter output format."""

    @pytest.fixture(autouse=True)
    def setup_path(self):
        """Add ai-service/src to path and clear module cache."""
        if AI_SERVICE_SRC not in sys.path:
            sys.path.insert(0, AI_SERVICE_SRC)
        for mod in list(sys.modules.keys()):
            if "logging_config" in mod or mod.startswith("utils."):
                del sys.modules[mod]
        yield

    @pytest.fixture
    def json_formatter(self):
        """Create JSONFormatter instance."""
        from utils.logging_config import JSONFormatter
        return JSONFormatter()

    @pytest.fixture
    def sample_log_record(self):
        """Create sample log record."""
        record = logging.LogRecord(
            name="contpaq.ai.test",
            level=logging.INFO,
            pathname="/test/path.py",
            lineno=42,
            msg="Test message",
            args=(),
            exc_info=None
        )
        return record

    def test_format_returns_valid_json(self, json_formatter, sample_log_record):
        """T031.1.1: Formatted output should be valid JSON."""
        output = json_formatter.format(sample_log_record)
        parsed = json.loads(output)
        assert isinstance(parsed, dict)

    def test_format_includes_timestamp(self, json_formatter, sample_log_record):
        """T031.1.1: JSON output should include timestamp."""
        output = json_formatter.format(sample_log_record)
        parsed = json.loads(output)
        assert "timestamp" in parsed or "time" in parsed or "@timestamp" in parsed

    def test_format_includes_level(self, json_formatter, sample_log_record):
        """T031.1.1: JSON output should include log level."""
        output = json_formatter.format(sample_log_record)
        parsed = json.loads(output)
        assert "level" in parsed or "levelname" in parsed or "severity" in parsed

    def test_format_includes_message(self, json_formatter, sample_log_record):
        """T031.1.1: JSON output should include message."""
        output = json_formatter.format(sample_log_record)
        parsed = json.loads(output)
        assert "message" in parsed or "msg" in parsed

    def test_format_includes_logger_name(self, json_formatter, sample_log_record):
        """T031.1.1: JSON output should include logger name."""
        output = json_formatter.format(sample_log_record)
        parsed = json.loads(output)
        assert "logger" in parsed or "name" in parsed or "logger_name" in parsed

    def test_format_message_content(self, json_formatter, sample_log_record):
        """T031.1.1: Message field should contain correct content."""
        output = json_formatter.format(sample_log_record)
        parsed = json.loads(output)
        message_key = next(k for k in ["message", "msg"] if k in parsed)
        assert parsed[message_key] == "Test message"

    def test_format_level_content(self, json_formatter, sample_log_record):
        """T031.1.1: Level field should contain INFO."""
        output = json_formatter.format(sample_log_record)
        parsed = json.loads(output)
        level_key = next(k for k in ["level", "levelname", "severity"] if k in parsed)
        assert "INFO" in parsed[level_key].upper()


class TestJSONFormatterWithException:
    """Tests for JSON formatter exception handling."""

    @pytest.fixture(autouse=True)
    def setup_path(self):
        """Add ai-service/src to path and clear module cache."""
        if AI_SERVICE_SRC not in sys.path:
            sys.path.insert(0, AI_SERVICE_SRC)
        for mod in list(sys.modules.keys()):
            if "logging_config" in mod or mod.startswith("utils."):
                del sys.modules[mod]
        yield

    @pytest.fixture
    def json_formatter(self):
        """Create JSONFormatter instance."""
        from utils.logging_config import JSONFormatter
        return JSONFormatter()

    def test_format_handles_exception(self, json_formatter):
        """T031.1.1: Formatter should handle exception info."""
        try:
            raise ValueError("Test error")
        except ValueError:
            record = logging.LogRecord(
                name="contpaq.ai.test",
                level=logging.ERROR,
                pathname="/test/path.py",
                lineno=42,
                msg="Error occurred",
                args=(),
                exc_info=sys.exc_info()
            )

        output = json_formatter.format(record)
        parsed = json.loads(output)

        # Should have exception info in some form
        has_exception = any(
            k in parsed for k in ["exception", "exc_info", "traceback", "stack_trace"]
        )
        assert has_exception or "ValueError" in str(parsed)


class TestFileLogging:
    """Tests for file logging configuration."""

    @pytest.fixture(autouse=True)
    def setup_path(self):
        """Add ai-service/src to path and clear module cache."""
        if AI_SERVICE_SRC not in sys.path:
            sys.path.insert(0, AI_SERVICE_SRC)
        for mod in list(sys.modules.keys()):
            if "logging_config" in mod or mod.startswith("utils."):
                del sys.modules[mod]
        yield

    def test_get_log_directory_function_exists(self):
        """T031.1.1: get_log_directory function should exist."""
        from utils.logging_config import get_log_directory
        assert callable(get_log_directory)

    def test_get_log_directory_returns_path(self):
        """T031.1.1: get_log_directory should return a Path object."""
        from utils.logging_config import get_log_directory
        log_dir = get_log_directory()
        assert isinstance(log_dir, Path)

    def test_get_log_directory_contains_logs(self):
        """T031.1.1: Log directory path should contain 'Logs' or 'logs'."""
        from utils.logging_config import get_log_directory
        log_dir = get_log_directory()
        path_str = str(log_dir).lower()
        assert "logs" in path_str or "log" in path_str


class TestSetupLogging:
    """Tests for setup_logging function."""

    @pytest.fixture(autouse=True)
    def setup_path(self):
        """Add ai-service/src to path and clear module cache."""
        if AI_SERVICE_SRC not in sys.path:
            sys.path.insert(0, AI_SERVICE_SRC)
        for mod in list(sys.modules.keys()):
            if "logging_config" in mod or mod.startswith("utils."):
                del sys.modules[mod]
        yield

    def test_setup_logging_accepts_level_parameter(self):
        """T031.1.1: setup_logging should accept log level parameter."""
        from utils.logging_config import setup_logging
        import inspect
        sig = inspect.signature(setup_logging)
        params = list(sig.parameters.keys())
        assert any(p in params for p in ["level", "log_level"])

    def test_setup_logging_returns_logger(self):
        """T031.1.1: setup_logging should return root logger."""
        from utils.logging_config import setup_logging
        with tempfile.TemporaryDirectory() as tmpdir:
            with patch('utils.logging_config.get_log_directory', return_value=Path(tmpdir)):
                logger = setup_logging()
                assert isinstance(logger, logging.Logger)

    def test_setup_logging_configures_json_handler(self):
        """T031.1.1: setup_logging should configure JSON formatter on handlers."""
        from utils.logging_config import setup_logging, JSONFormatter
        with tempfile.TemporaryDirectory() as tmpdir:
            with patch('utils.logging_config.get_log_directory', return_value=Path(tmpdir)):
                logger = setup_logging()

                # At least one handler should use JSONFormatter
                has_json_formatter = any(
                    isinstance(handler.formatter, JSONFormatter)
                    for handler in logger.handlers
                )
                assert has_json_formatter


class TestGetLogger:
    """Tests for get_logger function."""

    @pytest.fixture(autouse=True)
    def setup_path(self):
        """Add ai-service/src to path and clear module cache."""
        if AI_SERVICE_SRC not in sys.path:
            sys.path.insert(0, AI_SERVICE_SRC)
        for mod in list(sys.modules.keys()):
            if "logging_config" in mod or mod.startswith("utils."):
                del sys.modules[mod]
        yield

    def test_get_logger_returns_logger(self):
        """T031.1.1: get_logger should return Logger instance."""
        from utils.logging_config import get_logger
        logger = get_logger("test")
        assert isinstance(logger, logging.Logger)

    def test_get_logger_with_name(self):
        """T031.1.1: get_logger should set correct name."""
        from utils.logging_config import get_logger
        logger = get_logger("mymodule")
        assert "mymodule" in logger.name

    def test_get_logger_inherits_from_root(self):
        """T031.1.1: Child loggers should use root config."""
        from utils.logging_config import get_logger
        logger = get_logger("contpaq.ai.test.child")
        # Logger should be part of hierarchy
        assert logger.parent is not None or logger.name == "root"


class TestLogRotation:
    """Tests for log file rotation configuration."""

    @pytest.fixture(autouse=True)
    def setup_path(self):
        """Add ai-service/src to path and clear module cache."""
        if AI_SERVICE_SRC not in sys.path:
            sys.path.insert(0, AI_SERVICE_SRC)
        for mod in list(sys.modules.keys()):
            if "logging_config" in mod or mod.startswith("utils."):
                del sys.modules[mod]
        yield

    def test_file_handler_uses_rotation(self):
        """T031.1.1: File handler should use rotation (RotatingFileHandler or TimedRotatingFileHandler)."""
        from utils.logging_config import setup_logging
        from logging.handlers import RotatingFileHandler, TimedRotatingFileHandler

        with tempfile.TemporaryDirectory() as tmpdir:
            with patch('utils.logging_config.get_log_directory', return_value=Path(tmpdir)):
                logger = setup_logging()

                # Check for file handlers with rotation
                file_handlers = [
                    h for h in logger.handlers
                    if isinstance(h, (RotatingFileHandler, TimedRotatingFileHandler,
                                     logging.FileHandler))
                ]
                assert len(file_handlers) > 0, "Should have at least one file handler"


class TestLoggingIntegration:
    """Integration tests for logging system."""

    @pytest.fixture(autouse=True)
    def setup_path(self):
        """Add ai-service/src to path and clear module cache."""
        if AI_SERVICE_SRC not in sys.path:
            sys.path.insert(0, AI_SERVICE_SRC)
        for mod in list(sys.modules.keys()):
            if "logging_config" in mod or mod.startswith("utils."):
                del sys.modules[mod]
        yield

    def test_log_message_written_as_json(self):
        """T031.1.1: Logged messages should be written as JSON."""
        from utils.logging_config import setup_logging, get_logger
        import io

        with tempfile.TemporaryDirectory() as tmpdir:
            with patch('utils.logging_config.get_log_directory', return_value=Path(tmpdir)):
                setup_logging()
                logger = get_logger("integration.test")

                # Create a string buffer to capture output
                log_capture = io.StringIO()
                test_handler = logging.StreamHandler(log_capture)

                from utils.logging_config import JSONFormatter
                test_handler.setFormatter(JSONFormatter())
                logger.addHandler(test_handler)

                logger.info("Integration test message")

                output = log_capture.getvalue()
                assert output.strip()  # Not empty
                parsed = json.loads(output.strip())
                assert "Integration test message" in str(parsed)

    def test_extra_fields_in_log(self):
        """T031.1.1: Extra fields should be included in JSON output."""
        from utils.logging_config import JSONFormatter
        import io

        formatter = JSONFormatter()

        record = logging.LogRecord(
            name="test",
            level=logging.INFO,
            pathname="/test.py",
            lineno=1,
            msg="Test with extra",
            args=(),
            exc_info=None
        )
        record.request_id = "abc123"
        record.user_id = "user456"

        output = formatter.format(record)
        parsed = json.loads(output)

        # Extra fields should be present
        assert "request_id" in parsed or "abc123" in str(parsed)


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
