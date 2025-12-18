using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using ContPAQWinBridge.Services;

namespace ContPAQWinBridge.Controllers;

/// <summary>
/// Controller for vendor (proveedor) operations.
/// Provides endpoints to search and retrieve vendors from ContPAQi.
/// </summary>
/// <remarks>
/// T022.1.1 - T022.1.5: Implements vendor list endpoint with search functionality.
/// </remarks>
[Route("api/[controller]")]
public class VendorsController : BaseController
{
    private readonly IVendorService _vendorService;
    private readonly ILogger<VendorsController> _logger;

    /// <summary>
    /// Initializes a new instance of VendorsController.
    /// </summary>
    /// <param name="vendorService">Vendor service for ContPAQi operations.</param>
    /// <param name="logger">Logger instance.</param>
    public VendorsController(IVendorService vendorService, ILogger<VendorsController> logger)
    {
        _vendorService = vendorService ?? throw new ArgumentNullException(nameof(vendorService));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    /// <summary>
    /// Gets a list of vendors with optional search filtering.
    /// </summary>
    /// <param name="search">Optional search term to filter by RFC or name.</param>
    /// <param name="limit">Maximum number of results (default: 20).</param>
    /// <returns>List of matching vendors.</returns>
    /// <response code="200">Returns list of vendors.</response>
    /// <response code="500">Internal server error.</response>
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<VendorDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> GetVendors(
        [FromQuery] string? search = null,
        [FromQuery] int limit = 20)
    {
        _logger.LogDebug("GetVendors called with search={Search}, limit={Limit}", search, limit);

        try
        {
            var vendors = await _vendorService.SearchAsync(search ?? string.Empty, limit);

            _logger.LogInformation(
                "GetVendors returned {Count} vendors for search={Search}",
                vendors.Count(),
                search);

            return SuccessResponse(vendors);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting vendors with search={Search}", search);
            return ErrorResponse("Error al obtener la lista de proveedores", 500);
        }
    }

    /// <summary>
    /// Gets a vendor by RFC (tax ID).
    /// </summary>
    /// <param name="rfc">The RFC to search for.</param>
    /// <returns>Vendor data if found.</returns>
    /// <response code="200">Returns the vendor.</response>
    /// <response code="400">Invalid RFC format.</response>
    /// <response code="404">Vendor not found.</response>
    /// <response code="500">Internal server error.</response>
    [HttpGet("{rfc}")]
    [ProducesResponseType(typeof(VendorDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> GetVendorByRfc(string rfc)
    {
        _logger.LogDebug("GetVendorByRfc called with rfc={Rfc}", rfc);

        // Validate RFC
        if (string.IsNullOrWhiteSpace(rfc))
        {
            return BadRequest(new { success = false, message = "El RFC es requerido" });
        }

        // Normalize to uppercase
        var normalizedRfc = rfc.Trim().ToUpperInvariant();

        // Validate RFC format (12-13 alphanumeric characters)
        if (!IsValidRfcFormat(normalizedRfc))
        {
            return BadRequest(new
            {
                success = false,
                message = "El RFC debe tener 12 o 13 caracteres alfanuméricos"
            });
        }

        try
        {
            var vendor = await _vendorService.GetByRfcAsync(normalizedRfc);

            if (vendor == null)
            {
                _logger.LogInformation("Vendor not found for RFC={Rfc}", normalizedRfc);
                return NotFound(new
                {
                    success = false,
                    message = $"No se encontró proveedor con RFC: {normalizedRfc}"
                });
            }

            _logger.LogInformation("Vendor found for RFC={Rfc}: {Name}", normalizedRfc, vendor.Name);
            return SuccessResponse(vendor);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting vendor by RFC={Rfc}", normalizedRfc);
            return ErrorResponse("Error al buscar el proveedor", 500);
        }
    }

    /// <summary>
    /// Validates RFC format (12-13 alphanumeric characters).
    /// </summary>
    /// <param name="rfc">RFC to validate.</param>
    /// <returns>True if valid format.</returns>
    private static bool IsValidRfcFormat(string rfc)
    {
        if (string.IsNullOrWhiteSpace(rfc))
        {
            return false;
        }

        // RFC must be 12 (persona moral) or 13 (persona física) characters
        if (rfc.Length < 12 || rfc.Length > 13)
        {
            return false;
        }

        // RFC must be alphanumeric (with Ñ and &)
        foreach (var c in rfc)
        {
            if (!char.IsLetterOrDigit(c) && c != 'Ñ' && c != '&')
            {
                return false;
            }
        }

        return true;
    }
}
