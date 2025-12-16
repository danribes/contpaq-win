using Microsoft.AspNetCore.Mvc;

namespace ContPAQWinBridge.Controllers;

/// <summary>
/// Base controller class for all API controllers in ContPAQ Win Bridge.
/// Provides common functionality and configuration for derived controllers.
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public abstract class BaseController : ControllerBase
{
    /// <summary>
    /// Gets the correlation ID from the current request headers.
    /// </summary>
    /// <returns>Correlation ID or null if not present.</returns>
    protected string? GetCorrelationId()
    {
        return Request.Headers.TryGetValue("X-Correlation-ID", out var value)
            ? value.ToString()
            : null;
    }

    /// <summary>
    /// Creates a standardized error response.
    /// </summary>
    /// <param name="message">Error message in Spanish.</param>
    /// <param name="statusCode">HTTP status code.</param>
    /// <returns>ObjectResult with error details.</returns>
    protected ObjectResult ErrorResponse(string message, int statusCode = 500)
    {
        var error = new
        {
            success = false,
            message,
            correlationId = GetCorrelationId(),
            timestamp = DateTime.UtcNow
        };

        return StatusCode(statusCode, error);
    }

    /// <summary>
    /// Creates a standardized success response.
    /// </summary>
    /// <typeparam name="T">Type of the data payload.</typeparam>
    /// <param name="data">Response data.</param>
    /// <param name="message">Optional success message.</param>
    /// <returns>OkObjectResult with success details.</returns>
    protected OkObjectResult SuccessResponse<T>(T data, string? message = null)
    {
        var response = new
        {
            success = true,
            message,
            data,
            timestamp = DateTime.UtcNow
        };

        return Ok(response);
    }
}
