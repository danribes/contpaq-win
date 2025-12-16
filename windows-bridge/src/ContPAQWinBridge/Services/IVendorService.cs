namespace ContPAQWinBridge.Services;

/// <summary>
/// Interface for vendor (proveedor) operations in ContPAQi.
/// Provides abstraction for vendor queries and creation via SDK.
/// </summary>
public interface IVendorService
{
    /// <summary>
    /// Gets a vendor by RFC (tax ID).
    /// </summary>
    /// <param name="rfc">The RFC to search for.</param>
    /// <returns>Vendor data or null if not found.</returns>
    Task<VendorDto?> GetByRfcAsync(string rfc);

    /// <summary>
    /// Searches vendors by name or RFC pattern.
    /// </summary>
    /// <param name="searchTerm">Search term to match.</param>
    /// <param name="limit">Maximum number of results.</param>
    /// <returns>List of matching vendors.</returns>
    Task<IEnumerable<VendorDto>> SearchAsync(string searchTerm, int limit = 20);

    /// <summary>
    /// Creates a new vendor in ContPAQi.
    /// </summary>
    /// <param name="vendor">Vendor data to create.</param>
    /// <returns>Created vendor with assigned code.</returns>
    Task<VendorDto> CreateAsync(CreateVendorRequest vendor);

    /// <summary>
    /// Checks if a vendor exists by RFC.
    /// </summary>
    /// <param name="rfc">The RFC to check.</param>
    /// <returns>True if vendor exists.</returns>
    Task<bool> ExistsAsync(string rfc);
}

/// <summary>
/// Data transfer object for vendor information.
/// </summary>
public record VendorDto
{
    /// <summary>
    /// ContPAQi vendor code.
    /// </summary>
    public string Code { get; init; } = string.Empty;

    /// <summary>
    /// Vendor RFC (tax ID).
    /// </summary>
    public string Rfc { get; init; } = string.Empty;

    /// <summary>
    /// Vendor business name (razón social).
    /// </summary>
    public string Name { get; init; } = string.Empty;

    /// <summary>
    /// Vendor commercial name (nombre comercial).
    /// </summary>
    public string? CommercialName { get; init; }
}

/// <summary>
/// Request to create a new vendor.
/// </summary>
public record CreateVendorRequest
{
    /// <summary>
    /// Vendor RFC (tax ID). Required.
    /// </summary>
    public required string Rfc { get; init; }

    /// <summary>
    /// Vendor business name (razón social). Required.
    /// </summary>
    public required string Name { get; init; }

    /// <summary>
    /// Vendor commercial name (nombre comercial). Optional.
    /// </summary>
    public string? CommercialName { get; init; }
}
