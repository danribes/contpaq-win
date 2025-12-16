using Microsoft.Extensions.Logging;

namespace ContPAQWinBridge.Services;

/// <summary>
/// Implementation of ContPAQi SDK service.
/// Stub implementation - actual SDK calls will be added in T007.3.
/// </summary>
/// <remarks>
/// T007.2.3: SDK service implementation stub.
/// T007.2.4: Registered in DI container in Program.cs.
/// </remarks>
public class SdkService : ISdkService
{
    private readonly ILogger<SdkService> _logger;
    private string? _connectedCompany;

    /// <summary>
    /// Initializes a new instance of SdkService.
    /// </summary>
    /// <param name="logger">Logger instance for diagnostics.</param>
    public SdkService(ILogger<SdkService> logger)
    {
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    /// <inheritdoc />
    public bool IsConnected => _connectedCompany != null;

    /// <inheritdoc />
    public bool IsAvailable()
    {
        _logger.LogDebug("Checking SDK availability...");
        // Stub implementation - actual SDK detection in T007.3
        // Will check registry for ContPAQi installation
        return false;
    }

    /// <inheritdoc />
    public string? GetVersion()
    {
        _logger.LogDebug("Getting SDK version...");
        // Stub implementation - actual SDK version detection in T007.3
        // Will read version from installed SDK DLLs
        return null;
    }

    /// <inheritdoc />
    public bool Connect(string companyName)
    {
        if (string.IsNullOrWhiteSpace(companyName))
        {
            _logger.LogWarning("Connect called with empty company name");
            return false;
        }

        _logger.LogDebug("Attempting to connect to company: {CompanyName}", companyName);

        // Stub implementation - actual SDK connection in T007.3
        // Will use COM interop to connect to ContPAQi company

        // For now, always return false (not connected)
        _logger.LogInformation("SDK connection stub - returning false");
        return false;
    }

    /// <inheritdoc />
    public void Disconnect()
    {
        _logger.LogDebug("Disconnecting from SDK...");

        if (_connectedCompany != null)
        {
            _logger.LogInformation("Disconnected from company: {CompanyName}", _connectedCompany);
            _connectedCompany = null;
        }

        // Stub implementation - actual SDK disconnection in T007.3
        // Will use COM interop to disconnect from ContPAQi
    }
}
