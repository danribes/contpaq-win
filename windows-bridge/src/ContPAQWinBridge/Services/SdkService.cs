using Microsoft.Extensions.Logging;

namespace ContPAQWinBridge.Services;

/// <summary>
/// Implementation of ContPAQi SDK service.
/// Stub implementation - actual SDK calls will be added in later tasks.
/// </summary>
public class SdkService : ISdkService
{
    private readonly ILogger<SdkService> _logger;

    public SdkService(ILogger<SdkService> logger)
    {
        _logger = logger;
    }

    /// <inheritdoc />
    public bool IsConnected => false; // Stub - will be implemented later

    /// <inheritdoc />
    public bool IsAvailable()
    {
        _logger.LogDebug("Checking SDK availability...");
        // Stub implementation - actual SDK detection in T007
        return false;
    }

    /// <inheritdoc />
    public string? GetVersion()
    {
        _logger.LogDebug("Getting SDK version...");
        // Stub implementation - actual SDK version detection in T007
        return null;
    }
}
