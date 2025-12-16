using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using ContPAQWinBridge.Services;
using ContPAQWinBridge.Models;
using System.Reflection;

namespace ContPAQWinBridge.Controllers;

/// <summary>
/// Health check controller for the Windows Bridge service.
/// Provides endpoint to check service and SDK status.
/// </summary>
/// <remarks>
/// T007.1.1 - T007.1.4: Implements health check functionality with SDK status.
/// </remarks>
[Route("api/[controller]")]
public class HealthController : BaseController
{
    private readonly ISdkService _sdkService;
    private readonly ILogger<HealthController> _logger;
    private static readonly string? _version;

    static HealthController()
    {
        // Get assembly version at startup
        _version = Assembly.GetExecutingAssembly()
            .GetName()
            .Version?
            .ToString() ?? "1.0.0";
    }

    /// <summary>
    /// Initializes a new instance of HealthController.
    /// </summary>
    /// <param name="sdkService">SDK service for checking ContPAQi availability.</param>
    /// <param name="logger">Logger instance.</param>
    public HealthController(ISdkService sdkService, ILogger<HealthController> logger)
    {
        _sdkService = sdkService ?? throw new ArgumentNullException(nameof(sdkService));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    /// <summary>
    /// Gets the health status of the Windows Bridge service.
    /// </summary>
    /// <returns>Health response with SDK status and component details.</returns>
    /// <response code="200">Returns health status (even when degraded/unhealthy).</response>
    [HttpGet]
    [Route("/health")]
    [Route("")]
    [ProducesResponseType(typeof(HealthResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetHealth()
    {
        _logger.LogDebug("Health check requested");

        var sdkStatus = await GetSdkStatusAsync();
        var overallStatus = DetermineOverallStatus(sdkStatus);

        var response = new HealthResponse
        {
            Status = overallStatus,
            Timestamp = DateTime.UtcNow,
            Version = _version,
            Components = new ComponentHealth
            {
                Sdk = sdkStatus
            }
        };

        _logger.LogInformation("Health check completed: {Status}", overallStatus);

        return Ok(response);
    }

    /// <summary>
    /// Gets the SDK component status.
    /// </summary>
    private async Task<ComponentStatus> GetSdkStatusAsync()
    {
        return await Task.Run(() =>
        {
            try
            {
                var isAvailable = _sdkService.IsAvailable();
                var isConnected = _sdkService.IsConnected;
                var version = _sdkService.GetVersion();

                string status;
                string details;

                if (!isAvailable)
                {
                    status = HealthStatus.Unhealthy;
                    details = "ContPAQi SDK is not installed or not accessible";
                }
                else if (!isConnected)
                {
                    status = HealthStatus.Degraded;
                    details = "ContPAQi SDK is available but not connected to a company";
                }
                else
                {
                    status = HealthStatus.Healthy;
                    details = "ContPAQi SDK is connected and operational";
                }

                return new ComponentStatus
                {
                    Status = status,
                    IsAvailable = isAvailable,
                    Version = version,
                    Details = details,
                    LastChecked = DateTime.UtcNow
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking SDK status");

                return new ComponentStatus
                {
                    Status = HealthStatus.Unhealthy,
                    IsAvailable = false,
                    Details = $"Error checking SDK: {ex.Message}",
                    LastChecked = DateTime.UtcNow
                };
            }
        });
    }

    /// <summary>
    /// Determines overall health status based on component statuses.
    /// </summary>
    private static string DetermineOverallStatus(ComponentStatus sdkStatus)
    {
        // If SDK is unhealthy, service is degraded (can still serve some requests)
        // If SDK is degraded, service is degraded
        // If SDK is healthy, service is healthy

        return sdkStatus.Status switch
        {
            HealthStatus.Healthy => HealthStatus.Healthy,
            HealthStatus.Degraded => HealthStatus.Degraded,
            _ => HealthStatus.Degraded // Default to degraded, not unhealthy
        };
    }
}
