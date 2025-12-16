namespace ContPAQWinBridge.Configuration;

/// <summary>
/// Configuration options for the ContPAQ Win Bridge service.
/// Bound from appsettings.json "Bridge" section.
/// </summary>
public class BridgeOptions
{
    /// <summary>
    /// Configuration section name in appsettings.json.
    /// </summary>
    public const string SectionName = "Bridge";

    /// <summary>
    /// Gets or sets the SDK installation path.
    /// </summary>
    public string? SdkPath { get; set; }

    /// <summary>
    /// Gets or sets the default company database name.
    /// </summary>
    public string? DefaultCompany { get; set; }

    /// <summary>
    /// Gets or sets the connection timeout in seconds.
    /// </summary>
    public int ConnectionTimeoutSeconds { get; set; } = 30;

    /// <summary>
    /// Gets or sets whether to enable detailed SDK logging.
    /// </summary>
    public bool EnableSdkLogging { get; set; } = false;
}
