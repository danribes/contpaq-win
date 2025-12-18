using Serilog;
using Serilog.Events;
using Serilog.Formatting.Compact;

namespace ContPAQWinBridge.Configuration;

/// <summary>
/// Configuration helper for Serilog structured JSON logging.
///
/// Provides centralized logging configuration for the Windows Bridge service
/// with JSON output format, file rotation, and enrichment.
///
/// Log files are stored in: %LOCALAPPDATA%\ContPAQ-Win\Logs\
/// </summary>
public static class LoggingConfiguration
{
    /// <summary>
    /// Application name used in log paths.
    /// </summary>
    public const string AppName = "ContPAQ-Win";

    /// <summary>
    /// Service name for log identification.
    /// </summary>
    public const string ServiceName = "windows-bridge";

    /// <summary>
    /// Maximum size of each log file in bytes (10 MB).
    /// </summary>
    public const long FileSizeLimitBytes = 10 * 1024 * 1024;

    /// <summary>
    /// Number of log files to retain.
    /// </summary>
    public const int RetainedFileCountLimit = 5;

    /// <summary>
    /// Gets the log directory path.
    ///
    /// On Windows, logs are stored in %LOCALAPPDATA%\ContPAQ-Win\Logs
    /// On other platforms, falls back to current directory.
    /// </summary>
    /// <returns>The full path to the log directory.</returns>
    public static string GetLogDirectory()
    {
        string basePath;

        if (OperatingSystem.IsWindows())
        {
            // Windows: Use LocalAppData
            var localAppData = Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData);
            basePath = Path.Combine(localAppData, AppName, "Logs");
        }
        else
        {
            // Other platforms: Use home directory
            var home = Environment.GetFolderPath(Environment.SpecialFolder.UserProfile);
            basePath = Path.Combine(home, ".contpaq-win", "logs");
        }

        return basePath;
    }

    /// <summary>
    /// Gets the full path for the log file.
    /// </summary>
    /// <returns>The full path to the log file with rolling pattern.</returns>
    public static string GetLogFilePath()
    {
        var logDir = GetLogDirectory();
        return Path.Combine(logDir, $"{ServiceName}-.log");
    }

    /// <summary>
    /// Creates a LoggerConfiguration with JSON format and standard enrichers.
    ///
    /// Features:
    /// - Compact JSON output format
    /// - File logging with size-based rotation
    /// - Console output for development
    /// - Enrichment with machine name, process ID, thread ID
    /// </summary>
    /// <param name="minimumLevel">Minimum log level (default: Information)</param>
    /// <returns>A configured LoggerConfiguration instance.</returns>
    public static LoggerConfiguration CreateLoggerConfiguration(
        LogEventLevel minimumLevel = LogEventLevel.Information)
    {
        var logFilePath = GetLogFilePath();

        // Ensure log directory exists
        var logDir = Path.GetDirectoryName(logFilePath);
        if (!string.IsNullOrEmpty(logDir) && !Directory.Exists(logDir))
        {
            try
            {
                Directory.CreateDirectory(logDir);
            }
            catch (Exception)
            {
                // If we can't create the directory, fall back to current directory
                logFilePath = $"{ServiceName}-.log";
            }
        }

        return new LoggerConfiguration()
            .MinimumLevel.Is(minimumLevel)
            .MinimumLevel.Override("Microsoft", LogEventLevel.Warning)
            .MinimumLevel.Override("Microsoft.Hosting.Lifetime", LogEventLevel.Information)
            .MinimumLevel.Override("System", LogEventLevel.Warning)
            .Enrich.FromLogContext()
            .Enrich.WithMachineName()
            .Enrich.WithProcessId()
            .Enrich.WithThreadId()
            .Enrich.WithProperty("ServiceName", ServiceName)
            .WriteTo.Console(new CompactJsonFormatter())
            .WriteTo.File(
                formatter: new CompactJsonFormatter(),
                path: logFilePath,
                rollingInterval: RollingInterval.Day,
                fileSizeLimitBytes: FileSizeLimitBytes,
                retainedFileCountLimit: RetainedFileCountLimit,
                rollOnFileSizeLimit: true,
                shared: true,
                flushToDiskInterval: TimeSpan.FromSeconds(1));
    }

    /// <summary>
    /// Configures Serilog for ASP.NET Core with JSON format.
    ///
    /// Use this in Program.cs:
    /// <code>
    /// builder.Host.UseSerilog((context, services, configuration) =>
    ///     LoggingConfiguration.ConfigureLogger(configuration, context.Configuration));
    /// </code>
    /// </summary>
    /// <param name="configuration">The logger configuration to configure.</param>
    /// <param name="appConfiguration">The application configuration for reading settings.</param>
    /// <returns>The configured LoggerConfiguration.</returns>
    public static LoggerConfiguration ConfigureLogger(
        LoggerConfiguration configuration,
        IConfiguration? appConfiguration = null)
    {
        var logFilePath = GetLogFilePath();

        // Ensure log directory exists
        var logDir = Path.GetDirectoryName(logFilePath);
        if (!string.IsNullOrEmpty(logDir) && !Directory.Exists(logDir))
        {
            try
            {
                Directory.CreateDirectory(logDir);
            }
            catch (Exception)
            {
                // Fall back to current directory
                logFilePath = $"{ServiceName}-.log";
            }
        }

        // Read from configuration if available
        if (appConfiguration != null)
        {
            configuration.ReadFrom.Configuration(appConfiguration);
        }

        return configuration
            .MinimumLevel.Information()
            .MinimumLevel.Override("Microsoft", LogEventLevel.Warning)
            .MinimumLevel.Override("Microsoft.Hosting.Lifetime", LogEventLevel.Information)
            .MinimumLevel.Override("System", LogEventLevel.Warning)
            .Enrich.FromLogContext()
            .Enrich.WithMachineName()
            .Enrich.WithProcessId()
            .Enrich.WithThreadId()
            .Enrich.WithProperty("ServiceName", ServiceName)
            .WriteTo.Console(new CompactJsonFormatter())
            .WriteTo.File(
                formatter: new CompactJsonFormatter(),
                path: logFilePath,
                rollingInterval: RollingInterval.Day,
                fileSizeLimitBytes: FileSizeLimitBytes,
                retainedFileCountLimit: RetainedFileCountLimit,
                rollOnFileSizeLimit: true,
                shared: true,
                flushToDiskInterval: TimeSpan.FromSeconds(1));
    }
}
