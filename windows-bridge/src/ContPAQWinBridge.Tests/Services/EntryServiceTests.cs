using Xunit;
using FluentAssertions;
using Moq;
using Microsoft.Extensions.Logging;
using ContPAQWinBridge.Services;

namespace ContPAQWinBridge.Tests.Services;

/// <summary>
/// Tests for EntryService functionality.
/// T023.3.1 - T023.3.4: Entry service implementation.
/// </summary>
public class EntryServiceTests
{
    private readonly Mock<ISdkService> _mockSdkService;
    private readonly Mock<ILogger<EntryService>> _mockLogger;
    private readonly EntryService _service;

    public EntryServiceTests()
    {
        _mockSdkService = new Mock<ISdkService>();
        _mockLogger = new Mock<ILogger<EntryService>>();
        _service = new EntryService(_mockSdkService.Object, _mockLogger.Object);
    }

    #region T023.3.1 - Interface Exists

    /// <summary>
    /// T023.3.1: IEntryService interface should exist.
    /// </summary>
    [Fact]
    public void IEntryService_Interface_Should_Exist()
    {
        // Assert
        typeof(IEntryService).Should().NotBeNull();
        typeof(IEntryService).IsInterface.Should().BeTrue();
    }

    /// <summary>
    /// T023.3.1: EntryService should implement IEntryService.
    /// </summary>
    [Fact]
    public void EntryService_Should_Implement_IEntryService()
    {
        // Assert
        _service.Should().BeAssignableTo<IEntryService>();
    }

    /// <summary>
    /// T023.3.1: IEntryService should have CreateAsync method.
    /// </summary>
    [Fact]
    public void IEntryService_Should_Have_CreateAsync_Method()
    {
        // Arrange
        var methodInfo = typeof(IEntryService).GetMethod("CreateAsync");

        // Assert
        methodInfo.Should().NotBeNull();
        methodInfo!.ReturnType.Should().Be(typeof(Task<EntryResultDto>));
    }

    /// <summary>
    /// T023.3.1: IEntryService should have CheckDuplicateAsync method.
    /// </summary>
    [Fact]
    public void IEntryService_Should_Have_CheckDuplicateAsync_Method()
    {
        // Arrange
        var methodInfo = typeof(IEntryService).GetMethod("CheckDuplicateAsync");

        // Assert
        methodInfo.Should().NotBeNull();
        methodInfo!.ReturnType.Should().Be(typeof(Task<DuplicateCheckResult>));
    }

    /// <summary>
    /// T023.3.1: IEntryService should have GetByFolioAsync method.
    /// </summary>
    [Fact]
    public void IEntryService_Should_Have_GetByFolioAsync_Method()
    {
        // Arrange
        var methodInfo = typeof(IEntryService).GetMethod("GetByFolioAsync");

        // Assert
        methodInfo.Should().NotBeNull();
    }

    #endregion

    #region T023.3.2 - EntryService Implementation

    /// <summary>
    /// T023.3.2: EntryService should require ISdkService.
    /// </summary>
    [Fact]
    public void EntryService_Should_Require_SdkService()
    {
        // Act & Assert
        var action = () => new EntryService(null!, _mockLogger.Object);
        action.Should().Throw<ArgumentNullException>()
            .WithParameterName("sdkService");
    }

    /// <summary>
    /// T023.3.2: EntryService should require ILogger.
    /// </summary>
    [Fact]
    public void EntryService_Should_Require_Logger()
    {
        // Act & Assert
        var action = () => new EntryService(_mockSdkService.Object, null!);
        action.Should().Throw<ArgumentNullException>()
            .WithParameterName("logger");
    }

    /// <summary>
    /// T023.3.2: EntryService should be instantiable for DI.
    /// </summary>
    [Fact]
    public void EntryService_Should_Be_Instantiable_For_DI()
    {
        // Assert
        _service.Should().NotBeNull();
    }

    #endregion

    #region T023.3.3 - CreateAsync Method

    /// <summary>
    /// T023.3.3: CreateAsync should return success result.
    /// </summary>
    [Fact]
    public async Task CreateAsync_Should_Return_Success_Result()
    {
        // Arrange
        var request = new CreateEntryRequest
        {
            VendorRfc = "XAXX010101000",
            InvoiceNumber = "FAC-001",
            InvoiceDate = DateTime.Today,
            Subtotal = 1000m,
            IvaAmount = 160m,
            Total = 1160m
        };

        // Act
        var result = await _service.CreateAsync(request);

        // Assert
        result.Should().NotBeNull();
        result.Success.Should().BeTrue();
    }

    /// <summary>
    /// T023.3.3: CreateAsync should return folio number.
    /// </summary>
    [Fact]
    public async Task CreateAsync_Should_Return_Folio_Number()
    {
        // Arrange
        var request = new CreateEntryRequest
        {
            VendorRfc = "XAXX010101000",
            InvoiceNumber = "FAC-001",
            InvoiceDate = DateTime.Today,
            Total = 1160m
        };

        // Act
        var result = await _service.CreateAsync(request);

        // Assert
        result.Folio.Should().NotBeNullOrEmpty();
        result.Folio.Should().StartWith("POL-");
    }

    /// <summary>
    /// T023.3.3: CreateAsync should generate unique folio numbers.
    /// </summary>
    [Fact]
    public async Task CreateAsync_Should_Generate_Unique_Folio_Numbers()
    {
        // Arrange
        var request1 = new CreateEntryRequest
        {
            VendorRfc = "XAXX010101000",
            InvoiceNumber = "FAC-001",
            InvoiceDate = DateTime.Today,
            Total = 1160m
        };
        var request2 = new CreateEntryRequest
        {
            VendorRfc = "XAXX010101000",
            InvoiceNumber = "FAC-002",
            InvoiceDate = DateTime.Today,
            Total = 2320m
        };

        // Act
        var result1 = await _service.CreateAsync(request1);
        var result2 = await _service.CreateAsync(request2);

        // Assert
        result1.Folio.Should().NotBe(result2.Folio);
    }

    /// <summary>
    /// T023.3.3: CreateAsync should include timestamp.
    /// </summary>
    [Fact]
    public async Task CreateAsync_Should_Include_Timestamp()
    {
        // Arrange
        var request = new CreateEntryRequest
        {
            VendorRfc = "XAXX010101000",
            InvoiceNumber = "FAC-001",
            InvoiceDate = DateTime.Today,
            Total = 1160m
        };

        // Act
        var result = await _service.CreateAsync(request);

        // Assert
        result.Timestamp.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(5));
    }

    /// <summary>
    /// T023.3.3: CreateAsync should store entry for GetByFolioAsync.
    /// </summary>
    [Fact]
    public async Task CreateAsync_Should_Store_Entry_For_Retrieval()
    {
        // Arrange
        var request = new CreateEntryRequest
        {
            VendorRfc = "XAXX010101000",
            InvoiceNumber = "FAC-001",
            InvoiceDate = DateTime.Today,
            Total = 1160m
        };

        // Act
        var createResult = await _service.CreateAsync(request);
        var getResult = await _service.GetByFolioAsync(createResult.Folio!);

        // Assert
        getResult.Should().NotBeNull();
        getResult!.Folio.Should().Be(createResult.Folio);
    }

    #endregion

    #region CheckDuplicateAsync Method

    /// <summary>
    /// CheckDuplicateAsync should return false when no duplicate exists.
    /// </summary>
    [Fact]
    public async Task CheckDuplicateAsync_Should_Return_False_When_No_Duplicate()
    {
        // Arrange
        var rfc = "XAXX010101000";
        var invoiceNumber = "FAC-NEW-001";
        var invoiceDate = DateTime.Today;

        // Act
        var result = await _service.CheckDuplicateAsync(rfc, invoiceNumber, invoiceDate);

        // Assert
        result.IsDuplicate.Should().BeFalse();
        result.ExistingFolio.Should().BeNull();
    }

    /// <summary>
    /// CheckDuplicateAsync should return true when duplicate exists.
    /// </summary>
    [Fact]
    public async Task CheckDuplicateAsync_Should_Return_True_When_Duplicate_Exists()
    {
        // Arrange - create an entry first
        var request = new CreateEntryRequest
        {
            VendorRfc = "CACX7605101P8",
            InvoiceNumber = "FAC-DUP-001",
            InvoiceDate = DateTime.Today,
            Total = 1160m
        };
        await _service.CreateAsync(request);

        // Act - check for duplicate
        var result = await _service.CheckDuplicateAsync(
            request.VendorRfc,
            request.InvoiceNumber,
            request.InvoiceDate);

        // Assert
        result.IsDuplicate.Should().BeTrue();
        result.ExistingFolio.Should().NotBeNullOrEmpty();
    }

    /// <summary>
    /// CheckDuplicateAsync should include existing folio when duplicate found.
    /// </summary>
    [Fact]
    public async Task CheckDuplicateAsync_Should_Include_Existing_Folio()
    {
        // Arrange
        var request = new CreateEntryRequest
        {
            VendorRfc = "MXYZ850101XXX",
            InvoiceNumber = "FAC-DUP-002",
            InvoiceDate = DateTime.Today,
            Total = 500m
        };
        var createResult = await _service.CreateAsync(request);

        // Act
        var duplicateResult = await _service.CheckDuplicateAsync(
            request.VendorRfc,
            request.InvoiceNumber,
            request.InvoiceDate);

        // Assert
        duplicateResult.ExistingFolio.Should().Be(createResult.Folio);
    }

    /// <summary>
    /// CheckDuplicateAsync should include existing date when duplicate found.
    /// </summary>
    [Fact]
    public async Task CheckDuplicateAsync_Should_Include_Existing_Date()
    {
        // Arrange
        var invoiceDate = DateTime.Today.AddDays(-5);
        var request = new CreateEntryRequest
        {
            VendorRfc = "XAXX010101000",
            InvoiceNumber = "FAC-DUP-003",
            InvoiceDate = invoiceDate,
            Total = 750m
        };
        await _service.CreateAsync(request);

        // Act
        var duplicateResult = await _service.CheckDuplicateAsync(
            request.VendorRfc,
            request.InvoiceNumber,
            invoiceDate);

        // Assert
        duplicateResult.ExistingDate.Should().NotBeNull();
    }

    /// <summary>
    /// CheckDuplicateAsync should include Spanish message when duplicate found.
    /// </summary>
    [Fact]
    public async Task CheckDuplicateAsync_Should_Include_Spanish_Message()
    {
        // Arrange
        var request = new CreateEntryRequest
        {
            VendorRfc = "XAXX010101000",
            InvoiceNumber = "FAC-DUP-004",
            InvoiceDate = DateTime.Today,
            Total = 900m
        };
        await _service.CreateAsync(request);

        // Act
        var duplicateResult = await _service.CheckDuplicateAsync(
            request.VendorRfc,
            request.InvoiceNumber,
            request.InvoiceDate);

        // Assert
        duplicateResult.Message.Should().NotBeNullOrEmpty();
        duplicateResult.Message.Should().Contain("póliza");
    }

    /// <summary>
    /// CheckDuplicateAsync should handle empty RFC.
    /// </summary>
    [Fact]
    public async Task CheckDuplicateAsync_Should_Handle_Empty_RFC()
    {
        // Act
        var result = await _service.CheckDuplicateAsync("", "FAC-001", DateTime.Today);

        // Assert
        result.IsDuplicate.Should().BeFalse();
    }

    /// <summary>
    /// CheckDuplicateAsync should handle empty invoice number.
    /// </summary>
    [Fact]
    public async Task CheckDuplicateAsync_Should_Handle_Empty_InvoiceNumber()
    {
        // Act
        var result = await _service.CheckDuplicateAsync("XAXX010101000", "", DateTime.Today);

        // Assert
        result.IsDuplicate.Should().BeFalse();
    }

    #endregion

    #region GetByFolioAsync Method

    /// <summary>
    /// GetByFolioAsync should return null when not found.
    /// </summary>
    [Fact]
    public async Task GetByFolioAsync_Should_Return_Null_When_Not_Found()
    {
        // Arrange
        var nonExistentFolio = "POL-NONEXISTENT";

        // Act
        var result = await _service.GetByFolioAsync(nonExistentFolio);

        // Assert
        result.Should().BeNull();
    }

    /// <summary>
    /// GetByFolioAsync should return entry when found.
    /// </summary>
    [Fact]
    public async Task GetByFolioAsync_Should_Return_Entry_When_Found()
    {
        // Arrange - create an entry first
        var request = new CreateEntryRequest
        {
            VendorRfc = "XAXX010101000",
            InvoiceNumber = "FAC-GET-001",
            InvoiceDate = DateTime.Today,
            Total = 1500m
        };
        var createResult = await _service.CreateAsync(request);

        // Act
        var result = await _service.GetByFolioAsync(createResult.Folio!);

        // Assert
        result.Should().NotBeNull();
        result!.Folio.Should().Be(createResult.Folio);
        result.Success.Should().BeTrue();
    }

    /// <summary>
    /// GetByFolioAsync should handle empty folio.
    /// </summary>
    [Fact]
    public async Task GetByFolioAsync_Should_Handle_Empty_Folio()
    {
        // Act
        var result = await _service.GetByFolioAsync("");

        // Assert
        result.Should().BeNull();
    }

    /// <summary>
    /// GetByFolioAsync should handle null folio.
    /// </summary>
    [Fact]
    public async Task GetByFolioAsync_Should_Handle_Null_Folio()
    {
        // Act
        var result = await _service.GetByFolioAsync(null!);

        // Assert
        result.Should().BeNull();
    }

    #endregion

    #region T023.3.4 - Error Handling

    /// <summary>
    /// T023.3.4: IEntryService should be mockable.
    /// </summary>
    [Fact]
    public void IEntryService_Should_Be_Mockable()
    {
        // Arrange
        var mockService = new Mock<IEntryService>();
        mockService
            .Setup(s => s.CreateAsync(It.IsAny<CreateEntryRequest>()))
            .ReturnsAsync(new EntryResultDto { Success = true, Folio = "POL-MOCK-001" });

        // Act
        var result = mockService.Object.CreateAsync(new CreateEntryRequest
        {
            VendorRfc = "TEST",
            InvoiceNumber = "TEST",
            InvoiceDate = DateTime.Today
        }).Result;

        // Assert
        result.Folio.Should().Be("POL-MOCK-001");
    }

    #endregion
}
