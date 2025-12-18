using Microsoft.Extensions.Logging;

namespace ContPAQWinBridge.Services;

/// <summary>
/// Implementation of entry service for ContPAQi operations.
/// Stub implementation - actual SDK calls will be added when SDK integration is complete.
/// </summary>
/// <remarks>
/// T023.3.2 - T023.3.4: Entry service implementation with test data.
/// When SDK is integrated, this will create/query entries (pólizas) via COM interop.
/// </remarks>
public class EntryService : IEntryService
{
    private readonly ISdkService _sdkService;
    private readonly ILogger<EntryService> _logger;

    // Test data for development - will be replaced with SDK operations
    private static readonly List<EntryRecord> _testEntries = new();

    // Counter for generating test folio numbers
    private static int _folioCounter = 1;

    // Lock for thread-safe operations
    private static readonly object _lock = new();

    /// <summary>
    /// Initializes a new instance of EntryService.
    /// </summary>
    /// <param name="sdkService">SDK service for ContPAQi operations.</param>
    /// <param name="logger">Logger instance for diagnostics.</param>
    public EntryService(ISdkService sdkService, ILogger<EntryService> logger)
    {
        _sdkService = sdkService ?? throw new ArgumentNullException(nameof(sdkService));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    /// <inheritdoc />
    public async Task<EntryResultDto> CreateAsync(CreateEntryRequest entry)
    {
        _logger.LogDebug(
            "CreateAsync called with RFC={Rfc}, Invoice={Invoice}, Total={Total}",
            entry.VendorRfc,
            entry.InvoiceNumber,
            entry.Total);

        // TODO: When SDK is integrated, create entry via ContPAQi SDK
        // For now, simulate creation with test data
        await Task.CompletedTask;

        string folio;
        lock (_lock)
        {
            // Generate a new folio number
            var year = DateTime.Now.Year;
            folio = $"POL-{year}-{_folioCounter++:D4}";

            // Store entry for duplicate checking and retrieval
            var record = new EntryRecord
            {
                Folio = folio,
                VendorRfc = entry.VendorRfc,
                InvoiceNumber = entry.InvoiceNumber,
                InvoiceDate = entry.InvoiceDate,
                Subtotal = entry.Subtotal,
                IvaAmount = entry.IvaAmount,
                Total = entry.Total,
                Concept = entry.Concept,
                CreatedAt = DateTime.UtcNow
            };

            _testEntries.Add(record);
        }

        _logger.LogInformation(
            "Entry created: Folio={Folio}, RFC={Rfc}, Invoice={Invoice}, Total={Total}",
            folio,
            entry.VendorRfc,
            entry.InvoiceNumber,
            entry.Total);

        return new EntryResultDto
        {
            Success = true,
            Folio = folio,
            Timestamp = DateTime.UtcNow
        };
    }

    /// <inheritdoc />
    public async Task<DuplicateCheckResult> CheckDuplicateAsync(
        string vendorRfc,
        string invoiceNumber,
        DateTime invoiceDate)
    {
        _logger.LogDebug(
            "CheckDuplicateAsync called with RFC={Rfc}, Invoice={Invoice}, Date={Date}",
            vendorRfc,
            invoiceNumber,
            invoiceDate);

        // Validate inputs
        if (string.IsNullOrWhiteSpace(vendorRfc) || string.IsNullOrWhiteSpace(invoiceNumber))
        {
            _logger.LogDebug("Empty RFC or invoice number provided, returning no duplicate");
            return new DuplicateCheckResult { IsDuplicate = false };
        }

        // TODO: When SDK is integrated, query ContPAQi for existing entry
        // For now, check against test data
        await Task.CompletedTask;

        EntryRecord? existingEntry;
        lock (_lock)
        {
            existingEntry = _testEntries.FirstOrDefault(e =>
                e.VendorRfc.Equals(vendorRfc, StringComparison.OrdinalIgnoreCase) &&
                e.InvoiceNumber.Equals(invoiceNumber, StringComparison.OrdinalIgnoreCase));
        }

        if (existingEntry != null)
        {
            _logger.LogInformation(
                "Duplicate found for RFC={Rfc}, Invoice={Invoice}: Folio={Folio}",
                vendorRfc,
                invoiceNumber,
                existingEntry.Folio);

            return new DuplicateCheckResult
            {
                IsDuplicate = true,
                ExistingFolio = existingEntry.Folio,
                ExistingDate = existingEntry.CreatedAt,
                Message = $"Ya existe una póliza registrada con estos datos (Folio: {existingEntry.Folio})"
            };
        }

        _logger.LogDebug(
            "No duplicate found for RFC={Rfc}, Invoice={Invoice}",
            vendorRfc,
            invoiceNumber);

        return new DuplicateCheckResult { IsDuplicate = false };
    }

    /// <inheritdoc />
    public async Task<EntryResultDto?> GetByFolioAsync(string folio)
    {
        _logger.LogDebug("GetByFolioAsync called with folio={Folio}", folio);

        if (string.IsNullOrWhiteSpace(folio))
        {
            _logger.LogDebug("Empty folio provided, returning null");
            return null;
        }

        // TODO: When SDK is integrated, query ContPAQi for entry by folio
        // For now, check against test data
        await Task.CompletedTask;

        EntryRecord? entry;
        lock (_lock)
        {
            entry = _testEntries.FirstOrDefault(e =>
                e.Folio.Equals(folio, StringComparison.OrdinalIgnoreCase));
        }

        if (entry == null)
        {
            _logger.LogDebug("Entry not found for folio={Folio}", folio);
            return null;
        }

        _logger.LogInformation(
            "Entry found: Folio={Folio}, RFC={Rfc}, Invoice={Invoice}",
            entry.Folio,
            entry.VendorRfc,
            entry.InvoiceNumber);

        return new EntryResultDto
        {
            Success = true,
            Folio = entry.Folio,
            Timestamp = entry.CreatedAt
        };
    }

    /// <summary>
    /// Internal record for storing entry data.
    /// Used by stub implementation - will be removed when SDK is integrated.
    /// </summary>
    private record EntryRecord
    {
        public required string Folio { get; init; }
        public required string VendorRfc { get; init; }
        public required string InvoiceNumber { get; init; }
        public DateTime InvoiceDate { get; init; }
        public decimal Subtotal { get; init; }
        public decimal IvaAmount { get; init; }
        public decimal Total { get; init; }
        public string? Concept { get; init; }
        public DateTime CreatedAt { get; init; }
    }
}
