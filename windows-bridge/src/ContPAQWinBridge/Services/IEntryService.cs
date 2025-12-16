namespace ContPAQWinBridge.Services;

/// <summary>
/// Interface for accounting entry operations in ContPAQi.
/// Provides abstraction for creating and querying entries (pólizas) via SDK.
/// </summary>
public interface IEntryService
{
    /// <summary>
    /// Creates a new accounting entry in ContPAQi.
    /// </summary>
    /// <param name="entry">Entry data to create.</param>
    /// <returns>Created entry with assigned folio.</returns>
    Task<EntryResultDto> CreateAsync(CreateEntryRequest entry);

    /// <summary>
    /// Checks if a duplicate entry exists.
    /// </summary>
    /// <param name="vendorRfc">Vendor RFC.</param>
    /// <param name="invoiceNumber">Invoice number.</param>
    /// <param name="invoiceDate">Invoice date.</param>
    /// <returns>Duplicate check result.</returns>
    Task<DuplicateCheckResult> CheckDuplicateAsync(
        string vendorRfc,
        string invoiceNumber,
        DateTime invoiceDate);

    /// <summary>
    /// Gets an entry by folio number.
    /// </summary>
    /// <param name="folio">The folio to search for.</param>
    /// <returns>Entry data or null if not found.</returns>
    Task<EntryResultDto?> GetByFolioAsync(string folio);
}

/// <summary>
/// Request to create a new accounting entry.
/// </summary>
public record CreateEntryRequest
{
    /// <summary>
    /// Vendor RFC (tax ID). Required.
    /// </summary>
    public required string VendorRfc { get; init; }

    /// <summary>
    /// Invoice number from vendor. Required.
    /// </summary>
    public required string InvoiceNumber { get; init; }

    /// <summary>
    /// Invoice date. Required.
    /// </summary>
    public required DateTime InvoiceDate { get; init; }

    /// <summary>
    /// Invoice subtotal before taxes.
    /// </summary>
    public decimal Subtotal { get; init; }

    /// <summary>
    /// IVA (VAT) amount.
    /// </summary>
    public decimal IvaAmount { get; init; }

    /// <summary>
    /// Total invoice amount.
    /// </summary>
    public decimal Total { get; init; }

    /// <summary>
    /// Entry concept/description.
    /// </summary>
    public string? Concept { get; init; }

    /// <summary>
    /// Line items for the entry.
    /// </summary>
    public IEnumerable<EntryLineItem> LineItems { get; init; } = [];

    /// <summary>
    /// Force creation even if duplicate detected.
    /// </summary>
    public bool ForceDuplicate { get; init; } = false;
}

/// <summary>
/// Line item for an accounting entry.
/// </summary>
public record EntryLineItem
{
    /// <summary>
    /// Item description.
    /// </summary>
    public required string Description { get; init; }

    /// <summary>
    /// Quantity.
    /// </summary>
    public decimal Quantity { get; init; } = 1;

    /// <summary>
    /// Unit price.
    /// </summary>
    public decimal UnitPrice { get; init; }

    /// <summary>
    /// Line total amount.
    /// </summary>
    public decimal Amount { get; init; }
}

/// <summary>
/// Result of creating an entry.
/// </summary>
public record EntryResultDto
{
    /// <summary>
    /// Whether creation was successful.
    /// </summary>
    public bool Success { get; init; }

    /// <summary>
    /// ContPAQi folio number assigned.
    /// </summary>
    public string? Folio { get; init; }

    /// <summary>
    /// Error message if creation failed.
    /// </summary>
    public string? ErrorMessage { get; init; }

    /// <summary>
    /// Timestamp of creation.
    /// </summary>
    public DateTime Timestamp { get; init; } = DateTime.UtcNow;
}

/// <summary>
/// Result of duplicate check.
/// </summary>
public record DuplicateCheckResult
{
    /// <summary>
    /// Whether a duplicate was found.
    /// </summary>
    public bool IsDuplicate { get; init; }

    /// <summary>
    /// Existing entry folio if duplicate found.
    /// </summary>
    public string? ExistingFolio { get; init; }

    /// <summary>
    /// Date of existing entry if duplicate found.
    /// </summary>
    public DateTime? ExistingDate { get; init; }

    /// <summary>
    /// Message describing the duplicate.
    /// </summary>
    public string? Message { get; init; }
}
