using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using ContPAQWinBridge.Services;

namespace ContPAQWinBridge.Controllers;

/// <summary>
/// Controller for accounting entry (póliza) operations.
/// Provides endpoints to check duplicates and create entries in ContPAQi.
/// </summary>
/// <remarks>
/// T023.1.1 - T023.1.5: Implements duplicate check endpoint.
/// </remarks>
[Route("api/[controller]")]
public class EntriesController : BaseController
{
    private readonly IEntryService _entryService;
    private readonly ILogger<EntriesController> _logger;

    /// <summary>
    /// Initializes a new instance of EntriesController.
    /// </summary>
    /// <param name="entryService">Entry service for ContPAQi operations.</param>
    /// <param name="logger">Logger instance.</param>
    public EntriesController(IEntryService entryService, ILogger<EntriesController> logger)
    {
        _entryService = entryService ?? throw new ArgumentNullException(nameof(entryService));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    /// <summary>
    /// Checks if a duplicate entry exists for the given invoice.
    /// </summary>
    /// <param name="request">Duplicate check request data.</param>
    /// <returns>Duplicate check result.</returns>
    /// <response code="200">Returns duplicate check result.</response>
    /// <response code="400">Invalid request data.</response>
    /// <response code="500">Internal server error.</response>
    [HttpPost("check-duplicate")]
    [ProducesResponseType(typeof(DuplicateCheckResult), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> CheckDuplicate([FromBody] DuplicateCheckRequest request)
    {
        _logger.LogDebug(
            "CheckDuplicate called with RFC={Rfc}, Invoice={Invoice}, Date={Date}",
            request.VendorRfc,
            request.InvoiceNumber,
            request.InvoiceDate);

        // Validate RFC is provided
        if (string.IsNullOrWhiteSpace(request.VendorRfc))
        {
            return BadRequest(new
            {
                success = false,
                message = "El RFC del proveedor es requerido"
            });
        }

        // Validate invoice number is provided
        if (string.IsNullOrWhiteSpace(request.InvoiceNumber))
        {
            return BadRequest(new
            {
                success = false,
                message = "El número de factura es requerido"
            });
        }

        // Normalize RFC to uppercase
        var normalizedRfc = request.VendorRfc.Trim().ToUpperInvariant();

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
            var result = await _entryService.CheckDuplicateAsync(
                normalizedRfc,
                request.InvoiceNumber.Trim(),
                request.InvoiceDate);

            if (result.IsDuplicate)
            {
                _logger.LogInformation(
                    "Duplicate found for RFC={Rfc}, Invoice={Invoice}: Folio={Folio}",
                    normalizedRfc,
                    request.InvoiceNumber,
                    result.ExistingFolio);
            }
            else
            {
                _logger.LogDebug(
                    "No duplicate found for RFC={Rfc}, Invoice={Invoice}",
                    normalizedRfc,
                    request.InvoiceNumber);
            }

            return SuccessResponse(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex,
                "Error checking duplicate for RFC={Rfc}, Invoice={Invoice}",
                normalizedRfc,
                request.InvoiceNumber);
            return ErrorResponse("Error al verificar duplicados", 500);
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

/// <summary>
/// Request DTO for duplicate check endpoint.
/// </summary>
public record DuplicateCheckRequest
{
    /// <summary>
    /// Vendor RFC (tax ID). Required.
    /// </summary>
    public string VendorRfc { get; init; } = string.Empty;

    /// <summary>
    /// Invoice number to check. Required.
    /// </summary>
    public string InvoiceNumber { get; init; } = string.Empty;

    /// <summary>
    /// Invoice date. Required.
    /// </summary>
    public DateTime InvoiceDate { get; init; }
}
