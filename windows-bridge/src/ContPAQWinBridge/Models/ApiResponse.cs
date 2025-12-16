namespace ContPAQWinBridge.Models;

/// <summary>
/// Generic API response wrapper for standardized responses.
/// </summary>
/// <typeparam name="T">Type of the data payload.</typeparam>
public record ApiResponse<T>
{
    /// <summary>
    /// Indicates whether the operation was successful.
    /// </summary>
    public bool Success { get; init; }

    /// <summary>
    /// Optional message providing additional context.
    /// </summary>
    public string? Message { get; init; }

    /// <summary>
    /// The response data payload.
    /// </summary>
    public T? Data { get; init; }

    /// <summary>
    /// Error details if the operation failed.
    /// </summary>
    public ErrorDetails? Error { get; init; }

    /// <summary>
    /// Timestamp of the response.
    /// </summary>
    public DateTime Timestamp { get; init; } = DateTime.UtcNow;

    /// <summary>
    /// Creates a successful response with data.
    /// </summary>
    public static ApiResponse<T> Ok(T data, string? message = null) => new()
    {
        Success = true,
        Data = data,
        Message = message
    };

    /// <summary>
    /// Creates a failed response with error details.
    /// </summary>
    public static ApiResponse<T> Fail(string message, string? code = null) => new()
    {
        Success = false,
        Message = message,
        Error = new ErrorDetails { Code = code, Message = message }
    };
}

/// <summary>
/// Non-generic API response for operations without data.
/// </summary>
public record ApiResponse
{
    /// <summary>
    /// Indicates whether the operation was successful.
    /// </summary>
    public bool Success { get; init; }

    /// <summary>
    /// Optional message providing additional context.
    /// </summary>
    public string? Message { get; init; }

    /// <summary>
    /// Error details if the operation failed.
    /// </summary>
    public ErrorDetails? Error { get; init; }

    /// <summary>
    /// Timestamp of the response.
    /// </summary>
    public DateTime Timestamp { get; init; } = DateTime.UtcNow;

    /// <summary>
    /// Creates a successful response.
    /// </summary>
    public static ApiResponse Ok(string? message = null) => new()
    {
        Success = true,
        Message = message
    };

    /// <summary>
    /// Creates a failed response.
    /// </summary>
    public static ApiResponse Fail(string message, string? code = null) => new()
    {
        Success = false,
        Message = message,
        Error = new ErrorDetails { Code = code, Message = message }
    };
}

/// <summary>
/// Error details for failed API responses.
/// </summary>
public record ErrorDetails
{
    /// <summary>
    /// Error code for programmatic handling.
    /// </summary>
    public string? Code { get; init; }

    /// <summary>
    /// Human-readable error message in Spanish.
    /// </summary>
    public string? Message { get; init; }

    /// <summary>
    /// Additional error details or stack trace (development only).
    /// </summary>
    public string? Details { get; init; }

    /// <summary>
    /// Correlation ID for tracking the request.
    /// </summary>
    public string? CorrelationId { get; init; }
}
