namespace ContPAQWinBridge.Models;

/// <summary>
/// Health check response model for the /health endpoint.
/// </summary>
public record HealthResponse
{
    /// <summary>
    /// Overall health status: "Healthy", "Degraded", or "Unhealthy".
    /// </summary>
    public string Status { get; init; } = "Unknown";

    /// <summary>
    /// Timestamp of the health check.
    /// </summary>
    public DateTime Timestamp { get; init; } = DateTime.UtcNow;

    /// <summary>
    /// Service version.
    /// </summary>
    public string? Version { get; init; }

    /// <summary>
    /// Individual component health statuses.
    /// </summary>
    public ComponentHealth Components { get; init; } = new();
}

/// <summary>
/// Health status of individual components.
/// </summary>
public record ComponentHealth
{
    /// <summary>
    /// ContPAQi SDK connection status.
    /// </summary>
    public ComponentStatus Sdk { get; init; } = new();

    /// <summary>
    /// Database connection status (if applicable).
    /// </summary>
    public ComponentStatus? Database { get; init; }
}

/// <summary>
/// Status of a single component.
/// </summary>
public record ComponentStatus
{
    /// <summary>
    /// Component status: "Healthy", "Degraded", or "Unhealthy".
    /// </summary>
    public string Status { get; init; } = "Unknown";

    /// <summary>
    /// Whether the component is available.
    /// </summary>
    public bool IsAvailable { get; init; }

    /// <summary>
    /// Component version if available.
    /// </summary>
    public string? Version { get; init; }

    /// <summary>
    /// Additional details about the component status.
    /// </summary>
    public string? Details { get; init; }

    /// <summary>
    /// Last successful check timestamp.
    /// </summary>
    public DateTime? LastChecked { get; init; }
}

/// <summary>
/// Health status enumeration values as strings.
/// </summary>
public static class HealthStatus
{
    /// <summary>
    /// All components are functioning normally.
    /// </summary>
    public const string Healthy = "Healthy";

    /// <summary>
    /// Some components have issues but service is operational.
    /// </summary>
    public const string Degraded = "Degraded";

    /// <summary>
    /// Service is not functioning properly.
    /// </summary>
    public const string Unhealthy = "Unhealthy";

    /// <summary>
    /// Status is unknown or not yet determined.
    /// </summary>
    public const string Unknown = "Unknown";
}
