using Xunit;
using FluentAssertions;
using Serilog;
using Serilog.Events;
using Serilog.Formatting.Compact;
using System.Text.Json;
using ContPAQWinBridge.Configuration;

namespace ContPAQWinBridge.Tests.Configuration;

/// <summary>
/// Tests for T031.1.2: Configure Serilog in .NET with JSON format.
/// Verifies that logging is properly configured with JSON output.
/// </summary>
public class LoggingConfigurationTests
{
    #region T031.1.2.1 - LoggingConfiguration Class Exists

    /// <summary>
    /// T031.1.2: LoggingConfiguration class should exist.
    /// </summary>
    [Fact]
    public void LoggingConfiguration_Class_Should_Exist()
    {
        // Arrange & Act
        var type = typeof(LoggingConfiguration);

        // Assert
        type.Should().NotBeNull();
    }

    /// <summary>
    /// T031.1.2: LoggingConfiguration should have GetLogDirectory method.
    /// </summary>
    [Fact]
    public void LoggingConfiguration_Should_Have_GetLogDirectory_Method()
    {
        // Arrange
        var type = typeof(LoggingConfiguration);

        // Act
        var method = type.GetMethod("GetLogDirectory");

        // Assert
        method.Should().NotBeNull("LoggingConfiguration should have GetLogDirectory method");
    }

    /// <summary>
    /// T031.1.2: LoggingConfiguration should have CreateLoggerConfiguration method.
    /// </summary>
    [Fact]
    public void LoggingConfiguration_Should_Have_CreateLoggerConfiguration_Method()
    {
        // Arrange
        var type = typeof(LoggingConfiguration);

        // Act
        var method = type.GetMethod("CreateLoggerConfiguration");

        // Assert
        method.Should().NotBeNull("LoggingConfiguration should have CreateLoggerConfiguration method");
    }

    #endregion

    #region T031.1.2.2 - Log Directory Configuration

    /// <summary>
    /// T031.1.2: GetLogDirectory should return a path string.
    /// </summary>
    [Fact]
    public void GetLogDirectory_Should_Return_Path_String()
    {
        // Act
        var logDir = LoggingConfiguration.GetLogDirectory();

        // Assert
        logDir.Should().NotBeNullOrEmpty();
    }

    /// <summary>
    /// T031.1.2: GetLogDirectory should contain ContPAQ-Win in path.
    /// </summary>
    [Fact]
    public void GetLogDirectory_Should_Contain_AppName_In_Path()
    {
        // Act
        var logDir = LoggingConfiguration.GetLogDirectory();

        // Assert
        logDir.Should().Contain("ContPAQ-Win", "Log directory should be under ContPAQ-Win folder");
    }

    /// <summary>
    /// T031.1.2: GetLogDirectory should contain Logs in path.
    /// </summary>
    [Fact]
    public void GetLogDirectory_Should_Contain_Logs_In_Path()
    {
        // Act
        var logDir = LoggingConfiguration.GetLogDirectory();

        // Assert
        logDir.ToLower().Should().Contain("logs", "Log directory should have Logs folder");
    }

    /// <summary>
    /// T031.1.2: GetLogDirectory path should be absolute.
    /// </summary>
    [Fact]
    public void GetLogDirectory_Should_Return_Absolute_Path()
    {
        // Act
        var logDir = LoggingConfiguration.GetLogDirectory();

        // Assert
        Path.IsPathRooted(logDir).Should().BeTrue("Log directory should be an absolute path");
    }

    #endregion

    #region T031.1.2.3 - JSON Formatter Configuration

    /// <summary>
    /// T031.1.2: CreateLoggerConfiguration should return LoggerConfiguration.
    /// </summary>
    [Fact]
    public void CreateLoggerConfiguration_Should_Return_LoggerConfiguration()
    {
        // Act
        var config = LoggingConfiguration.CreateLoggerConfiguration();

        // Assert
        config.Should().NotBeNull();
        config.Should().BeOfType<LoggerConfiguration>();
    }

    /// <summary>
    /// T031.1.2: Logger should be able to create valid logs.
    /// </summary>
    [Fact]
    public void Logger_Should_Create_Valid_Logs()
    {
        // Arrange
        var output = new StringWriter();
        var logger = new LoggerConfiguration()
            .WriteTo.TextWriter(output, outputTemplate: "{Message}")
            .CreateLogger();

        // Act
        logger.Information("Test message");
        logger.Dispose();

        // Assert
        var logOutput = output.ToString();
        logOutput.Should().Contain("Test message");
    }

    #endregion

    #region T031.1.2.4 - Compact JSON Output Format

    /// <summary>
    /// T031.1.2: CompactJsonFormatter should produce valid JSON.
    /// </summary>
    [Fact]
    public void CompactJsonFormatter_Should_Produce_Valid_Json()
    {
        // Arrange
        var output = new StringWriter();
        var logger = new LoggerConfiguration()
            .WriteTo.TextWriter(output, new CompactJsonFormatter())
            .CreateLogger();

        // Act
        logger.Information("Test JSON message");
        logger.Dispose();

        // Assert
        var logOutput = output.ToString().Trim();
        logOutput.Should().NotBeEmpty();

        // Should be valid JSON
        var parseAction = () => JsonDocument.Parse(logOutput);
        parseAction.Should().NotThrow("Output should be valid JSON");
    }

    /// <summary>
    /// T031.1.2: JSON output should include timestamp field.
    /// </summary>
    [Fact]
    public void Json_Output_Should_Include_Timestamp()
    {
        // Arrange
        var output = new StringWriter();
        var logger = new LoggerConfiguration()
            .WriteTo.TextWriter(output, new CompactJsonFormatter())
            .CreateLogger();

        // Act
        logger.Information("Test message");
        logger.Dispose();

        // Assert
        var logOutput = output.ToString().Trim();
        var json = JsonDocument.Parse(logOutput);

        json.RootElement.TryGetProperty("@t", out _).Should().BeTrue("JSON should have timestamp (@t)");
    }

    /// <summary>
    /// T031.1.2: JSON output should include message field.
    /// </summary>
    [Fact]
    public void Json_Output_Should_Include_Message()
    {
        // Arrange
        var output = new StringWriter();
        var logger = new LoggerConfiguration()
            .WriteTo.TextWriter(output, new CompactJsonFormatter())
            .CreateLogger();

        // Act
        logger.Information("My test message");
        logger.Dispose();

        // Assert
        var logOutput = output.ToString().Trim();
        var json = JsonDocument.Parse(logOutput);

        json.RootElement.TryGetProperty("@m", out var messageElement).Should().BeTrue("JSON should have message (@m)");
        messageElement.GetString().Should().Contain("My test message");
    }

    /// <summary>
    /// T031.1.2: JSON output should include log level.
    /// </summary>
    [Fact]
    public void Json_Output_Should_Include_Level()
    {
        // Arrange
        var output = new StringWriter();
        var logger = new LoggerConfiguration()
            .MinimumLevel.Debug()
            .WriteTo.TextWriter(output, new CompactJsonFormatter())
            .CreateLogger();

        // Act
        logger.Warning("Warning message");
        logger.Dispose();

        // Assert
        var logOutput = output.ToString().Trim();
        var json = JsonDocument.Parse(logOutput);

        json.RootElement.TryGetProperty("@l", out var levelElement).Should().BeTrue("JSON should have level (@l)");
        levelElement.GetString().Should().Be("Warning");
    }

    #endregion

    #region T031.1.2.5 - Structured Data in JSON

    /// <summary>
    /// T031.1.2: JSON output should include structured properties.
    /// </summary>
    [Fact]
    public void Json_Output_Should_Include_Structured_Properties()
    {
        // Arrange
        var output = new StringWriter();
        var logger = new LoggerConfiguration()
            .WriteTo.TextWriter(output, new CompactJsonFormatter())
            .CreateLogger();

        // Act
        logger.Information("Processing invoice {InvoiceId} for amount {Amount}", "INV-001", 1500.50);
        logger.Dispose();

        // Assert
        var logOutput = output.ToString().Trim();
        var json = JsonDocument.Parse(logOutput);

        json.RootElement.TryGetProperty("InvoiceId", out var invoiceId).Should().BeTrue();
        invoiceId.GetString().Should().Be("INV-001");

        json.RootElement.TryGetProperty("Amount", out var amount).Should().BeTrue();
        amount.GetDouble().Should().Be(1500.50);
    }

    /// <summary>
    /// T031.1.2: JSON output should include exception details.
    /// </summary>
    [Fact]
    public void Json_Output_Should_Include_Exception_Details()
    {
        // Arrange
        var output = new StringWriter();
        var logger = new LoggerConfiguration()
            .WriteTo.TextWriter(output, new CompactJsonFormatter())
            .CreateLogger();

        var exception = new InvalidOperationException("Test exception message");

        // Act
        logger.Error(exception, "An error occurred");
        logger.Dispose();

        // Assert
        var logOutput = output.ToString().Trim();
        var json = JsonDocument.Parse(logOutput);

        json.RootElement.TryGetProperty("@x", out var exceptionElement).Should().BeTrue("JSON should have exception (@x)");
        exceptionElement.GetString().Should().Contain("InvalidOperationException");
        exceptionElement.GetString().Should().Contain("Test exception message");
    }

    #endregion

    #region T031.1.2.6 - Log Enrichment

    /// <summary>
    /// T031.1.2: Logger should support enrichment with context.
    /// </summary>
    [Fact]
    public void Logger_Should_Support_Enrichment()
    {
        // Arrange
        var output = new StringWriter();
        var logger = new LoggerConfiguration()
            .Enrich.WithProperty("ServiceName", "windows-bridge")
            .WriteTo.TextWriter(output, new CompactJsonFormatter())
            .CreateLogger();

        // Act
        logger.Information("Test with enrichment");
        logger.Dispose();

        // Assert
        var logOutput = output.ToString().Trim();
        var json = JsonDocument.Parse(logOutput);

        json.RootElement.TryGetProperty("ServiceName", out var serviceNameElement).Should().BeTrue();
        serviceNameElement.GetString().Should().Be("windows-bridge");
    }

    /// <summary>
    /// T031.1.2: Logger should include machine name enricher.
    /// </summary>
    [Fact]
    public void Logger_Should_Support_MachineName_Enrichment()
    {
        // Arrange
        var output = new StringWriter();
        var logger = new LoggerConfiguration()
            .Enrich.WithMachineName()
            .WriteTo.TextWriter(output, new CompactJsonFormatter())
            .CreateLogger();

        // Act
        logger.Information("Test with machine name");
        logger.Dispose();

        // Assert
        var logOutput = output.ToString().Trim();
        var json = JsonDocument.Parse(logOutput);

        json.RootElement.TryGetProperty("MachineName", out _).Should().BeTrue("JSON should include MachineName");
    }

    #endregion

    #region T031.1.2.7 - Log File Path Configuration

    /// <summary>
    /// T031.1.2: GetLogFilePath should return valid file path.
    /// </summary>
    [Fact]
    public void GetLogFilePath_Should_Return_Valid_Path()
    {
        // Act
        var logFilePath = LoggingConfiguration.GetLogFilePath();

        // Assert
        logFilePath.Should().NotBeNullOrEmpty();
        logFilePath.Should().EndWith(".log");
    }

    /// <summary>
    /// T031.1.2: GetLogFilePath should include service name.
    /// </summary>
    [Fact]
    public void GetLogFilePath_Should_Include_Service_Name()
    {
        // Act
        var logFilePath = LoggingConfiguration.GetLogFilePath();

        // Assert
        logFilePath.ToLower().Should().Contain("bridge", "Log file should include service name");
    }

    #endregion

    #region T031.1.2.8 - Configuration Constants

    /// <summary>
    /// T031.1.2: LoggingConfiguration should define APP_NAME constant.
    /// </summary>
    [Fact]
    public void LoggingConfiguration_Should_Define_AppName_Constant()
    {
        // Act
        var appName = LoggingConfiguration.AppName;

        // Assert
        appName.Should().Be("ContPAQ-Win");
    }

    /// <summary>
    /// T031.1.2: LoggingConfiguration should define SERVICE_NAME constant.
    /// </summary>
    [Fact]
    public void LoggingConfiguration_Should_Define_ServiceName_Constant()
    {
        // Act
        var serviceName = LoggingConfiguration.ServiceName;

        // Assert
        serviceName.Should().Be("windows-bridge");
    }

    /// <summary>
    /// T031.1.2: LoggingConfiguration should define log file size limit.
    /// </summary>
    [Fact]
    public void LoggingConfiguration_Should_Define_FileSizeLimit()
    {
        // Act
        var sizeLimit = LoggingConfiguration.FileSizeLimitBytes;

        // Assert
        sizeLimit.Should().BeGreaterThan(0);
        sizeLimit.Should().Be(10 * 1024 * 1024, "Default should be 10 MB");
    }

    /// <summary>
    /// T031.1.2: LoggingConfiguration should define retained file count.
    /// </summary>
    [Fact]
    public void LoggingConfiguration_Should_Define_RetainedFileCount()
    {
        // Act
        var retainedCount = LoggingConfiguration.RetainedFileCountLimit;

        // Assert
        retainedCount.Should().BeGreaterThan(0);
        retainedCount.Should().Be(5, "Default should keep 5 backup files");
    }

    #endregion
}
