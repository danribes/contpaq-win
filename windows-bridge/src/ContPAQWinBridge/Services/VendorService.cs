using Microsoft.Extensions.Logging;

namespace ContPAQWinBridge.Services;

/// <summary>
/// Implementation of vendor service for ContPAQi operations.
/// Stub implementation - actual SDK calls will be added when SDK integration is complete.
/// </summary>
/// <remarks>
/// T022.3.2 - T022.3.4: Vendor service implementation with test data.
/// When SDK is integrated, this will query/create vendors via COM interop.
/// </remarks>
public class VendorService : IVendorService
{
    private readonly ISdkService _sdkService;
    private readonly ILogger<VendorService> _logger;

    // Test data for development - will be replaced with SDK queries
    private static readonly List<VendorDto> _testVendors = new()
    {
        new VendorDto
        {
            Code = "PROV001",
            Rfc = "XAXX010101000",
            Name = "Proveedor Genérico SA de CV",
            CommercialName = "Proveedor Genérico"
        },
        new VendorDto
        {
            Code = "PROV002",
            Rfc = "CACX7605101P8",
            Name = "Comercializadora ABC SA de CV",
            CommercialName = "ABC Comercial"
        },
        new VendorDto
        {
            Code = "PROV003",
            Rfc = "MXYZ850101XXX",
            Name = "Materiales XYZ SA de CV",
            CommercialName = "XYZ Materiales"
        }
    };

    // Counter for generating test vendor codes
    private static int _vendorCounter = 4;

    /// <summary>
    /// Initializes a new instance of VendorService.
    /// </summary>
    /// <param name="sdkService">SDK service for ContPAQi operations.</param>
    /// <param name="logger">Logger instance for diagnostics.</param>
    public VendorService(ISdkService sdkService, ILogger<VendorService> logger)
    {
        _sdkService = sdkService ?? throw new ArgumentNullException(nameof(sdkService));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    /// <inheritdoc />
    public async Task<VendorDto?> GetByRfcAsync(string rfc)
    {
        _logger.LogDebug("GetByRfcAsync called with RFC={Rfc}", rfc);

        if (string.IsNullOrWhiteSpace(rfc))
        {
            _logger.LogDebug("Empty RFC provided, returning null");
            return null;
        }

        // Normalize RFC for comparison
        var normalizedRfc = rfc.Trim().ToUpperInvariant();

        // TODO: When SDK is integrated, query ContPAQi for vendor by RFC
        // For now, use test data
        await Task.CompletedTask;

        var vendor = _testVendors.FirstOrDefault(v =>
            v.Rfc.Equals(normalizedRfc, StringComparison.OrdinalIgnoreCase));

        if (vendor != null)
        {
            _logger.LogInformation("Vendor found for RFC={Rfc}: {Name}", normalizedRfc, vendor.Name);
        }
        else
        {
            _logger.LogDebug("No vendor found for RFC={Rfc}", normalizedRfc);
        }

        return vendor;
    }

    /// <inheritdoc />
    public async Task<IEnumerable<VendorDto>> SearchAsync(string searchTerm, int limit = 20)
    {
        _logger.LogDebug("SearchAsync called with searchTerm={SearchTerm}, limit={Limit}", searchTerm, limit);

        // Normalize search term
        var normalizedSearch = (searchTerm ?? string.Empty).Trim().ToUpperInvariant();

        // TODO: When SDK is integrated, query ContPAQi for vendors
        // For now, use test data
        await Task.CompletedTask;

        IEnumerable<VendorDto> results;

        if (string.IsNullOrEmpty(normalizedSearch))
        {
            // Return all vendors up to limit
            results = _testVendors.Take(limit);
        }
        else
        {
            // Filter by RFC or Name containing search term
            results = _testVendors
                .Where(v =>
                    v.Rfc.Contains(normalizedSearch, StringComparison.OrdinalIgnoreCase) ||
                    v.Name.Contains(normalizedSearch, StringComparison.OrdinalIgnoreCase) ||
                    (v.CommercialName?.Contains(normalizedSearch, StringComparison.OrdinalIgnoreCase) ?? false))
                .Take(limit);
        }

        var resultList = results.ToList();
        _logger.LogInformation("SearchAsync returned {Count} vendors for search={Search}", resultList.Count, searchTerm);

        return resultList;
    }

    /// <inheritdoc />
    public async Task<VendorDto> CreateAsync(CreateVendorRequest vendor)
    {
        _logger.LogDebug("CreateAsync called with RFC={Rfc}, Name={Name}", vendor.Rfc, vendor.Name);

        // TODO: When SDK is integrated, create vendor via ContPAQi SDK
        // For now, simulate creation with test data
        await Task.CompletedTask;

        // Generate a new vendor code
        var newCode = $"PROV{_vendorCounter++:D3}";

        var createdVendor = new VendorDto
        {
            Code = newCode,
            Rfc = vendor.Rfc,
            Name = vendor.Name,
            CommercialName = vendor.CommercialName
        };

        // Add to test data (in real implementation, this would be persisted via SDK)
        _testVendors.Add(createdVendor);

        _logger.LogInformation(
            "Vendor created: Code={Code}, RFC={Rfc}, Name={Name}",
            createdVendor.Code,
            createdVendor.Rfc,
            createdVendor.Name);

        return createdVendor;
    }

    /// <inheritdoc />
    public async Task<bool> ExistsAsync(string rfc)
    {
        _logger.LogDebug("ExistsAsync called with RFC={Rfc}", rfc);

        if (string.IsNullOrWhiteSpace(rfc))
        {
            _logger.LogDebug("Empty RFC provided, returning false");
            return false;
        }

        // Use GetByRfcAsync to check existence
        var vendor = await GetByRfcAsync(rfc);

        var exists = vendor != null;
        _logger.LogDebug("ExistsAsync for RFC={Rfc}: {Exists}", rfc, exists);

        return exists;
    }
}
