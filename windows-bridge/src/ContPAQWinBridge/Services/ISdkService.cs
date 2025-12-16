namespace ContPAQWinBridge.Services;

/// <summary>
/// Interface for ContPAQi SDK operations.
/// Provides abstraction over SDK connection and availability checking.
/// </summary>
public interface ISdkService
{
    /// <summary>
    /// Checks if the ContPAQi SDK is available on this system.
    /// </summary>
    /// <returns>True if SDK is installed and accessible.</returns>
    bool IsAvailable();

    /// <summary>
    /// Gets the installed SDK version.
    /// </summary>
    /// <returns>Version string or null if not available.</returns>
    string? GetVersion();

    /// <summary>
    /// Gets the current connection status.
    /// </summary>
    bool IsConnected { get; }
}
