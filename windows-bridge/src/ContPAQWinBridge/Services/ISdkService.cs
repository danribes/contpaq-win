namespace ContPAQWinBridge.Services;

/// <summary>
/// Interface for ContPAQi SDK operations.
/// Provides abstraction over SDK connection and availability checking.
/// </summary>
/// <remarks>
/// T007.2.1 - T007.2.2: SDK service interface definition.
/// </remarks>
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

    /// <summary>
    /// Connects to a ContPAQi company database.
    /// </summary>
    /// <param name="companyName">Name of the company to connect to.</param>
    /// <returns>True if connection was successful.</returns>
    bool Connect(string companyName);

    /// <summary>
    /// Disconnects from the current company database.
    /// </summary>
    void Disconnect();
}
