using Xunit;
using FluentAssertions;
using Moq;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using ContPAQWinBridge.Controllers;
using ContPAQWinBridge.Services;

namespace ContPAQWinBridge.Tests.Controllers;

/// <summary>
/// Tests for EntriesController functionality.
/// T023.1.1 - T023.1.5: Duplicate check endpoint implementation.
/// </summary>
public class EntriesControllerTests
{
    private readonly Mock<IEntryService> _mockEntryService;
    private readonly Mock<ILogger<EntriesController>> _mockLogger;
    private readonly EntriesController _controller;

    public EntriesControllerTests()
    {
        _mockEntryService = new Mock<IEntryService>();
        _mockLogger = new Mock<ILogger<EntriesController>>();
        _controller = new EntriesController(_mockEntryService.Object, _mockLogger.Object);
    }

    #region T023.1.1 - Controller Exists and Is Configured

    /// <summary>
    /// T023.1.2: EntriesController should exist.
    /// </summary>
    [Fact]
    public void EntriesController_Should_Exist()
    {
        // Assert
        _controller.Should().NotBeNull();
        _controller.Should().BeAssignableTo<ControllerBase>();
    }

    /// <summary>
    /// T023.1.2: EntriesController should inherit from BaseController.
    /// </summary>
    [Fact]
    public void EntriesController_Should_Inherit_From_BaseController()
    {
        // Assert
        _controller.Should().BeAssignableTo<BaseController>();
    }

    /// <summary>
    /// T023.1.2: EntriesController should have ApiController attribute.
    /// </summary>
    [Fact]
    public void EntriesController_Should_Have_ApiController_Attribute()
    {
        // Arrange
        var controllerType = typeof(EntriesController);

        // Assert
        controllerType.GetCustomAttributes(typeof(ApiControllerAttribute), true)
            .Should().NotBeEmpty("EntriesController should have [ApiController] attribute");
    }

    /// <summary>
    /// T023.1.2: EntriesController should have Route attribute with api/entries.
    /// </summary>
    [Fact]
    public void EntriesController_Should_Have_Route_Attribute()
    {
        // Arrange
        var controllerType = typeof(EntriesController);

        // Assert
        var routeAttributes = controllerType.GetCustomAttributes(typeof(RouteAttribute), true);
        routeAttributes.Should().NotBeEmpty("EntriesController should have [Route] attribute");
    }

    #endregion

    #region T023.1.3 - POST /entries/check-duplicate

    /// <summary>
    /// T023.1.3: CheckDuplicate should return OkObjectResult.
    /// </summary>
    [Fact]
    public async Task CheckDuplicate_Should_Return_OkObjectResult()
    {
        // Arrange
        var request = new DuplicateCheckRequest
        {
            VendorRfc = "XAXX010101000",
            InvoiceNumber = "FAC-001",
            InvoiceDate = DateTime.Today
        };
        _mockEntryService
            .Setup(s => s.CheckDuplicateAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<DateTime>()))
            .ReturnsAsync(new DuplicateCheckResult { IsDuplicate = false });

        // Act
        var result = await _controller.CheckDuplicate(request);

        // Assert
        result.Should().BeOfType<OkObjectResult>();
    }

    /// <summary>
    /// T023.1.3: CheckDuplicate should validate RFC is required.
    /// </summary>
    [Fact]
    public async Task CheckDuplicate_Should_Validate_RFC_Required()
    {
        // Arrange
        var request = new DuplicateCheckRequest
        {
            VendorRfc = "",
            InvoiceNumber = "FAC-001",
            InvoiceDate = DateTime.Today
        };

        // Act
        var result = await _controller.CheckDuplicate(request);

        // Assert
        result.Should().BeOfType<BadRequestObjectResult>();
    }

    /// <summary>
    /// T023.1.3: CheckDuplicate should validate invoice number is required.
    /// </summary>
    [Fact]
    public async Task CheckDuplicate_Should_Validate_InvoiceNumber_Required()
    {
        // Arrange
        var request = new DuplicateCheckRequest
        {
            VendorRfc = "XAXX010101000",
            InvoiceNumber = "",
            InvoiceDate = DateTime.Today
        };

        // Act
        var result = await _controller.CheckDuplicate(request);

        // Assert
        result.Should().BeOfType<BadRequestObjectResult>();
    }

    /// <summary>
    /// T023.1.3: CheckDuplicate should validate RFC format.
    /// </summary>
    [Fact]
    public async Task CheckDuplicate_Should_Validate_RFC_Format()
    {
        // Arrange
        var request = new DuplicateCheckRequest
        {
            VendorRfc = "INVALID",
            InvoiceNumber = "FAC-001",
            InvoiceDate = DateTime.Today
        };

        // Act
        var result = await _controller.CheckDuplicate(request);

        // Assert
        result.Should().BeOfType<BadRequestObjectResult>();
    }

    /// <summary>
    /// T023.1.3: CheckDuplicate should normalize RFC to uppercase.
    /// </summary>
    [Fact]
    public async Task CheckDuplicate_Should_Normalize_RFC_To_Uppercase()
    {
        // Arrange
        var lowercaseRfc = "xaxx010101000";
        var uppercaseRfc = "XAXX010101000";
        var request = new DuplicateCheckRequest
        {
            VendorRfc = lowercaseRfc,
            InvoiceNumber = "FAC-001",
            InvoiceDate = DateTime.Today
        };
        _mockEntryService
            .Setup(s => s.CheckDuplicateAsync(uppercaseRfc, It.IsAny<string>(), It.IsAny<DateTime>()))
            .ReturnsAsync(new DuplicateCheckResult { IsDuplicate = false });

        // Act
        await _controller.CheckDuplicate(request);

        // Assert
        _mockEntryService.Verify(
            s => s.CheckDuplicateAsync(uppercaseRfc, It.IsAny<string>(), It.IsAny<DateTime>()),
            Times.Once);
    }

    #endregion

    #region T023.1.4 - Query SDK for Existing Entry

    /// <summary>
    /// T023.1.4: CheckDuplicate should call IEntryService.CheckDuplicateAsync.
    /// </summary>
    [Fact]
    public async Task CheckDuplicate_Should_Call_EntryService_CheckDuplicateAsync()
    {
        // Arrange
        var request = new DuplicateCheckRequest
        {
            VendorRfc = "XAXX010101000",
            InvoiceNumber = "FAC-001",
            InvoiceDate = DateTime.Today
        };
        _mockEntryService
            .Setup(s => s.CheckDuplicateAsync(
                request.VendorRfc,
                request.InvoiceNumber,
                request.InvoiceDate))
            .ReturnsAsync(new DuplicateCheckResult { IsDuplicate = false });

        // Act
        await _controller.CheckDuplicate(request);

        // Assert
        _mockEntryService.Verify(
            s => s.CheckDuplicateAsync(
                request.VendorRfc,
                request.InvoiceNumber,
                request.InvoiceDate),
            Times.Once);
    }

    /// <summary>
    /// T023.1.4: CheckDuplicate should pass all parameters to service.
    /// </summary>
    [Fact]
    public async Task CheckDuplicate_Should_Pass_All_Parameters_To_Service()
    {
        // Arrange
        var rfc = "CACX7605101P8";
        var invoiceNumber = "A-12345";
        var invoiceDate = new DateTime(2024, 12, 15);
        var request = new DuplicateCheckRequest
        {
            VendorRfc = rfc,
            InvoiceNumber = invoiceNumber,
            InvoiceDate = invoiceDate
        };
        _mockEntryService
            .Setup(s => s.CheckDuplicateAsync(rfc, invoiceNumber, invoiceDate))
            .ReturnsAsync(new DuplicateCheckResult { IsDuplicate = false });

        // Act
        await _controller.CheckDuplicate(request);

        // Assert
        _mockEntryService.Verify(
            s => s.CheckDuplicateAsync(rfc, invoiceNumber, invoiceDate),
            Times.Once);
    }

    #endregion

    #region T023.1.5 - Return Duplicate Status

    /// <summary>
    /// T023.1.5: CheckDuplicate should return isDuplicate=false when no duplicate.
    /// </summary>
    [Fact]
    public async Task CheckDuplicate_Should_Return_IsDuplicate_False_When_No_Duplicate()
    {
        // Arrange
        var request = new DuplicateCheckRequest
        {
            VendorRfc = "XAXX010101000",
            InvoiceNumber = "FAC-001",
            InvoiceDate = DateTime.Today
        };
        _mockEntryService
            .Setup(s => s.CheckDuplicateAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<DateTime>()))
            .ReturnsAsync(new DuplicateCheckResult { IsDuplicate = false });

        // Act
        var result = await _controller.CheckDuplicate(request);
        var okResult = result as OkObjectResult;

        // Assert
        okResult.Should().NotBeNull();
        okResult!.Value.Should().NotBeNull();
    }

    /// <summary>
    /// T023.1.5: CheckDuplicate should return isDuplicate=true when duplicate found.
    /// </summary>
    [Fact]
    public async Task CheckDuplicate_Should_Return_IsDuplicate_True_When_Duplicate_Found()
    {
        // Arrange
        var request = new DuplicateCheckRequest
        {
            VendorRfc = "XAXX010101000",
            InvoiceNumber = "FAC-001",
            InvoiceDate = DateTime.Today
        };
        _mockEntryService
            .Setup(s => s.CheckDuplicateAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<DateTime>()))
            .ReturnsAsync(new DuplicateCheckResult
            {
                IsDuplicate = true,
                ExistingFolio = "POL-2024-0001",
                ExistingDate = DateTime.Today.AddDays(-7),
                Message = "Ya existe una póliza con estos datos"
            });

        // Act
        var result = await _controller.CheckDuplicate(request);
        var okResult = result as OkObjectResult;

        // Assert
        okResult.Should().NotBeNull();
        okResult!.Value.Should().NotBeNull();
    }

    /// <summary>
    /// T023.1.5: CheckDuplicate should include existing folio when duplicate found.
    /// </summary>
    [Fact]
    public async Task CheckDuplicate_Should_Include_Existing_Folio_When_Duplicate()
    {
        // Arrange
        var existingFolio = "POL-2024-0001";
        var request = new DuplicateCheckRequest
        {
            VendorRfc = "XAXX010101000",
            InvoiceNumber = "FAC-001",
            InvoiceDate = DateTime.Today
        };
        _mockEntryService
            .Setup(s => s.CheckDuplicateAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<DateTime>()))
            .ReturnsAsync(new DuplicateCheckResult
            {
                IsDuplicate = true,
                ExistingFolio = existingFolio
            });

        // Act
        var result = await _controller.CheckDuplicate(request);

        // Assert
        result.Should().BeOfType<OkObjectResult>();
    }

    /// <summary>
    /// T023.1.5: CheckDuplicate should include existing date when duplicate found.
    /// </summary>
    [Fact]
    public async Task CheckDuplicate_Should_Include_Existing_Date_When_Duplicate()
    {
        // Arrange
        var existingDate = DateTime.Today.AddDays(-7);
        var request = new DuplicateCheckRequest
        {
            VendorRfc = "XAXX010101000",
            InvoiceNumber = "FAC-001",
            InvoiceDate = DateTime.Today
        };
        _mockEntryService
            .Setup(s => s.CheckDuplicateAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<DateTime>()))
            .ReturnsAsync(new DuplicateCheckResult
            {
                IsDuplicate = true,
                ExistingFolio = "POL-2024-0001",
                ExistingDate = existingDate
            });

        // Act
        var result = await _controller.CheckDuplicate(request);

        // Assert
        result.Should().BeOfType<OkObjectResult>();
    }

    /// <summary>
    /// T023.1.5: CheckDuplicate should include Spanish message when duplicate found.
    /// </summary>
    [Fact]
    public async Task CheckDuplicate_Should_Include_Spanish_Message_When_Duplicate()
    {
        // Arrange
        var spanishMessage = "Ya existe una póliza registrada con estos datos";
        var request = new DuplicateCheckRequest
        {
            VendorRfc = "XAXX010101000",
            InvoiceNumber = "FAC-001",
            InvoiceDate = DateTime.Today
        };
        _mockEntryService
            .Setup(s => s.CheckDuplicateAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<DateTime>()))
            .ReturnsAsync(new DuplicateCheckResult
            {
                IsDuplicate = true,
                ExistingFolio = "POL-2024-0001",
                Message = spanishMessage
            });

        // Act
        var result = await _controller.CheckDuplicate(request);

        // Assert
        result.Should().BeOfType<OkObjectResult>();
    }

    #endregion

    #region Error Handling

    /// <summary>
    /// CheckDuplicate should handle service exceptions gracefully.
    /// </summary>
    [Fact]
    public async Task CheckDuplicate_Should_Handle_Service_Exceptions_Gracefully()
    {
        // Arrange
        var request = new DuplicateCheckRequest
        {
            VendorRfc = "XAXX010101000",
            InvoiceNumber = "FAC-001",
            InvoiceDate = DateTime.Today
        };
        _mockEntryService
            .Setup(s => s.CheckDuplicateAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<DateTime>()))
            .ThrowsAsync(new Exception("SDK error"));

        // Act
        var result = await _controller.CheckDuplicate(request);

        // Assert
        result.Should().BeOfType<ObjectResult>();
        var objectResult = result as ObjectResult;
        objectResult!.StatusCode.Should().Be(500);
    }

    /// <summary>
    /// Error responses should include Spanish messages.
    /// </summary>
    [Fact]
    public async Task Error_Responses_Should_Include_Spanish_Messages()
    {
        // Arrange
        var request = new DuplicateCheckRequest
        {
            VendorRfc = "INVALID",
            InvoiceNumber = "FAC-001",
            InvoiceDate = DateTime.Today
        };

        // Act
        var result = await _controller.CheckDuplicate(request);

        // Assert
        var badRequestResult = result as BadRequestObjectResult;
        badRequestResult.Should().NotBeNull();
    }

    /// <summary>
    /// CheckDuplicate should handle null invoice number gracefully.
    /// </summary>
    [Fact]
    public async Task CheckDuplicate_Should_Handle_Null_InvoiceNumber()
    {
        // Arrange
        var request = new DuplicateCheckRequest
        {
            VendorRfc = "XAXX010101000",
            InvoiceNumber = null!,
            InvoiceDate = DateTime.Today
        };

        // Act
        var result = await _controller.CheckDuplicate(request);

        // Assert
        result.Should().BeOfType<BadRequestObjectResult>();
    }

    /// <summary>
    /// CheckDuplicate should handle null RFC gracefully.
    /// </summary>
    [Fact]
    public async Task CheckDuplicate_Should_Handle_Null_RFC()
    {
        // Arrange
        var request = new DuplicateCheckRequest
        {
            VendorRfc = null!,
            InvoiceNumber = "FAC-001",
            InvoiceDate = DateTime.Today
        };

        // Act
        var result = await _controller.CheckDuplicate(request);

        // Assert
        result.Should().BeOfType<BadRequestObjectResult>();
    }

    #endregion

    #region Request DTO Validation

    /// <summary>
    /// DuplicateCheckRequest should have VendorRfc property.
    /// </summary>
    [Fact]
    public void DuplicateCheckRequest_Should_Have_VendorRfc_Property()
    {
        // Arrange & Act
        var request = new DuplicateCheckRequest
        {
            VendorRfc = "XAXX010101000",
            InvoiceNumber = "FAC-001",
            InvoiceDate = DateTime.Today
        };

        // Assert
        request.VendorRfc.Should().NotBeNullOrEmpty();
    }

    /// <summary>
    /// DuplicateCheckRequest should have InvoiceNumber property.
    /// </summary>
    [Fact]
    public void DuplicateCheckRequest_Should_Have_InvoiceNumber_Property()
    {
        // Arrange & Act
        var request = new DuplicateCheckRequest
        {
            VendorRfc = "XAXX010101000",
            InvoiceNumber = "FAC-001",
            InvoiceDate = DateTime.Today
        };

        // Assert
        request.InvoiceNumber.Should().NotBeNullOrEmpty();
    }

    /// <summary>
    /// DuplicateCheckRequest should have InvoiceDate property.
    /// </summary>
    [Fact]
    public void DuplicateCheckRequest_Should_Have_InvoiceDate_Property()
    {
        // Arrange & Act
        var request = new DuplicateCheckRequest
        {
            VendorRfc = "XAXX010101000",
            InvoiceNumber = "FAC-001",
            InvoiceDate = DateTime.Today
        };

        // Assert
        request.InvoiceDate.Should().NotBe(default);
    }

    #endregion

    #region T023.2.1 - POST /entries Endpoint Tests

    /// <summary>
    /// T023.2.2: CreateEntry should return CreatedResult on success.
    /// </summary>
    [Fact]
    public async Task CreateEntry_Should_Return_CreatedResult_On_Success()
    {
        // Arrange
        var request = new CreateEntryRequest
        {
            VendorRfc = "XAXX010101000",
            InvoiceNumber = "FAC-001",
            InvoiceDate = DateTime.Today,
            Total = 1160m
        };
        _mockEntryService
            .Setup(s => s.CheckDuplicateAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<DateTime>()))
            .ReturnsAsync(new DuplicateCheckResult { IsDuplicate = false });
        _mockEntryService
            .Setup(s => s.CreateAsync(It.IsAny<CreateEntryRequest>()))
            .ReturnsAsync(new EntryResultDto { Success = true, Folio = "POL-2024-0001" });

        // Act
        var result = await _controller.CreateEntry(request);

        // Assert
        result.Should().BeOfType<CreatedAtActionResult>();
    }

    /// <summary>
    /// T023.2.2: CreateEntry should return folio number in response.
    /// </summary>
    [Fact]
    public async Task CreateEntry_Should_Return_Folio_Number_In_Response()
    {
        // Arrange
        var expectedFolio = "POL-2024-0001";
        var request = new CreateEntryRequest
        {
            VendorRfc = "XAXX010101000",
            InvoiceNumber = "FAC-001",
            InvoiceDate = DateTime.Today,
            Total = 1160m
        };
        _mockEntryService
            .Setup(s => s.CheckDuplicateAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<DateTime>()))
            .ReturnsAsync(new DuplicateCheckResult { IsDuplicate = false });
        _mockEntryService
            .Setup(s => s.CreateAsync(It.IsAny<CreateEntryRequest>()))
            .ReturnsAsync(new EntryResultDto { Success = true, Folio = expectedFolio });

        // Act
        var result = await _controller.CreateEntry(request);
        var createdResult = result as CreatedAtActionResult;

        // Assert
        createdResult.Should().NotBeNull();
        createdResult!.Value.Should().NotBeNull();
    }

    #endregion

    #region T023.2.3 - Request Validation

    /// <summary>
    /// T023.2.3: CreateEntry should validate RFC is required.
    /// </summary>
    [Fact]
    public async Task CreateEntry_Should_Validate_RFC_Required()
    {
        // Arrange
        var request = new CreateEntryRequest
        {
            VendorRfc = "",
            InvoiceNumber = "FAC-001",
            InvoiceDate = DateTime.Today,
            Total = 1160m
        };

        // Act
        var result = await _controller.CreateEntry(request);

        // Assert
        result.Should().BeOfType<BadRequestObjectResult>();
    }

    /// <summary>
    /// T023.2.3: CreateEntry should validate invoice number is required.
    /// </summary>
    [Fact]
    public async Task CreateEntry_Should_Validate_InvoiceNumber_Required()
    {
        // Arrange
        var request = new CreateEntryRequest
        {
            VendorRfc = "XAXX010101000",
            InvoiceNumber = "",
            InvoiceDate = DateTime.Today,
            Total = 1160m
        };

        // Act
        var result = await _controller.CreateEntry(request);

        // Assert
        result.Should().BeOfType<BadRequestObjectResult>();
    }

    /// <summary>
    /// T023.2.3: CreateEntry should validate RFC format.
    /// </summary>
    [Fact]
    public async Task CreateEntry_Should_Validate_RFC_Format()
    {
        // Arrange
        var request = new CreateEntryRequest
        {
            VendorRfc = "INVALID",
            InvoiceNumber = "FAC-001",
            InvoiceDate = DateTime.Today,
            Total = 1160m
        };

        // Act
        var result = await _controller.CreateEntry(request);

        // Assert
        result.Should().BeOfType<BadRequestObjectResult>();
    }

    /// <summary>
    /// T023.2.3: CreateEntry should validate total is positive.
    /// </summary>
    [Fact]
    public async Task CreateEntry_Should_Validate_Total_Positive()
    {
        // Arrange
        var request = new CreateEntryRequest
        {
            VendorRfc = "XAXX010101000",
            InvoiceNumber = "FAC-001",
            InvoiceDate = DateTime.Today,
            Total = -100m
        };

        // Act
        var result = await _controller.CreateEntry(request);

        // Assert
        result.Should().BeOfType<BadRequestObjectResult>();
    }

    /// <summary>
    /// T023.2.3: CreateEntry should normalize RFC to uppercase.
    /// </summary>
    [Fact]
    public async Task CreateEntry_Should_Normalize_RFC_To_Uppercase()
    {
        // Arrange
        var lowercaseRfc = "xaxx010101000";
        var uppercaseRfc = "XAXX010101000";
        var request = new CreateEntryRequest
        {
            VendorRfc = lowercaseRfc,
            InvoiceNumber = "FAC-001",
            InvoiceDate = DateTime.Today,
            Total = 1160m
        };
        _mockEntryService
            .Setup(s => s.CheckDuplicateAsync(uppercaseRfc, It.IsAny<string>(), It.IsAny<DateTime>()))
            .ReturnsAsync(new DuplicateCheckResult { IsDuplicate = false });
        _mockEntryService
            .Setup(s => s.CreateAsync(It.Is<CreateEntryRequest>(r => r.VendorRfc == uppercaseRfc)))
            .ReturnsAsync(new EntryResultDto { Success = true, Folio = "POL-001" });

        // Act
        await _controller.CreateEntry(request);

        // Assert
        _mockEntryService.Verify(
            s => s.CreateAsync(It.Is<CreateEntryRequest>(r => r.VendorRfc == uppercaseRfc)),
            Times.Once);
    }

    #endregion

    #region T023.2.4 - Duplicate Check Before Creation

    /// <summary>
    /// T023.2.4: CreateEntry should check for duplicates before creating.
    /// </summary>
    [Fact]
    public async Task CreateEntry_Should_Check_For_Duplicates_Before_Creating()
    {
        // Arrange
        var request = new CreateEntryRequest
        {
            VendorRfc = "XAXX010101000",
            InvoiceNumber = "FAC-001",
            InvoiceDate = DateTime.Today,
            Total = 1160m
        };
        _mockEntryService
            .Setup(s => s.CheckDuplicateAsync(
                request.VendorRfc,
                request.InvoiceNumber,
                request.InvoiceDate))
            .ReturnsAsync(new DuplicateCheckResult { IsDuplicate = false });
        _mockEntryService
            .Setup(s => s.CreateAsync(It.IsAny<CreateEntryRequest>()))
            .ReturnsAsync(new EntryResultDto { Success = true, Folio = "POL-001" });

        // Act
        await _controller.CreateEntry(request);

        // Assert
        _mockEntryService.Verify(
            s => s.CheckDuplicateAsync(
                request.VendorRfc,
                request.InvoiceNumber,
                request.InvoiceDate),
            Times.Once);
    }

    /// <summary>
    /// T023.2.4: CreateEntry should return Conflict when duplicate found and force_duplicate=false.
    /// </summary>
    [Fact]
    public async Task CreateEntry_Should_Return_Conflict_When_Duplicate_Found()
    {
        // Arrange
        var request = new CreateEntryRequest
        {
            VendorRfc = "XAXX010101000",
            InvoiceNumber = "FAC-001",
            InvoiceDate = DateTime.Today,
            Total = 1160m,
            ForceDuplicate = false
        };
        _mockEntryService
            .Setup(s => s.CheckDuplicateAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<DateTime>()))
            .ReturnsAsync(new DuplicateCheckResult
            {
                IsDuplicate = true,
                ExistingFolio = "POL-2024-0001"
            });

        // Act
        var result = await _controller.CreateEntry(request);

        // Assert
        result.Should().BeOfType<ConflictObjectResult>();
    }

    /// <summary>
    /// T023.2.4: CreateEntry should create entry when duplicate found but force_duplicate=true.
    /// </summary>
    [Fact]
    public async Task CreateEntry_Should_Create_When_Force_Duplicate_True()
    {
        // Arrange
        var request = new CreateEntryRequest
        {
            VendorRfc = "XAXX010101000",
            InvoiceNumber = "FAC-001",
            InvoiceDate = DateTime.Today,
            Total = 1160m,
            ForceDuplicate = true
        };
        _mockEntryService
            .Setup(s => s.CheckDuplicateAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<DateTime>()))
            .ReturnsAsync(new DuplicateCheckResult
            {
                IsDuplicate = true,
                ExistingFolio = "POL-2024-0001"
            });
        _mockEntryService
            .Setup(s => s.CreateAsync(It.IsAny<CreateEntryRequest>()))
            .ReturnsAsync(new EntryResultDto { Success = true, Folio = "POL-2024-0002" });

        // Act
        var result = await _controller.CreateEntry(request);

        // Assert
        result.Should().BeOfType<CreatedAtActionResult>();
    }

    /// <summary>
    /// T023.2.4: CreateEntry should skip duplicate check when force_duplicate=true.
    /// </summary>
    [Fact]
    public async Task CreateEntry_Should_Skip_Duplicate_Check_When_Force_Duplicate_True()
    {
        // Arrange
        var request = new CreateEntryRequest
        {
            VendorRfc = "XAXX010101000",
            InvoiceNumber = "FAC-001",
            InvoiceDate = DateTime.Today,
            Total = 1160m,
            ForceDuplicate = true
        };
        _mockEntryService
            .Setup(s => s.CreateAsync(It.IsAny<CreateEntryRequest>()))
            .ReturnsAsync(new EntryResultDto { Success = true, Folio = "POL-001" });

        // Act
        await _controller.CreateEntry(request);

        // Assert
        _mockEntryService.Verify(
            s => s.CheckDuplicateAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<DateTime>()),
            Times.Never);
    }

    #endregion

    #region T023.2.5 - Create Entry via Service

    /// <summary>
    /// T023.2.5: CreateEntry should call IEntryService.CreateAsync.
    /// </summary>
    [Fact]
    public async Task CreateEntry_Should_Call_EntryService_CreateAsync()
    {
        // Arrange
        var request = new CreateEntryRequest
        {
            VendorRfc = "XAXX010101000",
            InvoiceNumber = "FAC-001",
            InvoiceDate = DateTime.Today,
            Total = 1160m
        };
        _mockEntryService
            .Setup(s => s.CheckDuplicateAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<DateTime>()))
            .ReturnsAsync(new DuplicateCheckResult { IsDuplicate = false });
        _mockEntryService
            .Setup(s => s.CreateAsync(It.IsAny<CreateEntryRequest>()))
            .ReturnsAsync(new EntryResultDto { Success = true, Folio = "POL-001" });

        // Act
        await _controller.CreateEntry(request);

        // Assert
        _mockEntryService.Verify(s => s.CreateAsync(It.IsAny<CreateEntryRequest>()), Times.Once);
    }

    /// <summary>
    /// T023.2.5: CreateEntry should pass all request data to service.
    /// </summary>
    [Fact]
    public async Task CreateEntry_Should_Pass_All_Request_Data_To_Service()
    {
        // Arrange
        var request = new CreateEntryRequest
        {
            VendorRfc = "XAXX010101000",
            InvoiceNumber = "FAC-001",
            InvoiceDate = DateTime.Today,
            Subtotal = 1000m,
            IvaAmount = 160m,
            Total = 1160m,
            Concept = "Compra de materiales"
        };
        _mockEntryService
            .Setup(s => s.CheckDuplicateAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<DateTime>()))
            .ReturnsAsync(new DuplicateCheckResult { IsDuplicate = false });
        _mockEntryService
            .Setup(s => s.CreateAsync(It.Is<CreateEntryRequest>(r =>
                r.VendorRfc == request.VendorRfc &&
                r.InvoiceNumber == request.InvoiceNumber &&
                r.Subtotal == request.Subtotal &&
                r.IvaAmount == request.IvaAmount &&
                r.Total == request.Total)))
            .ReturnsAsync(new EntryResultDto { Success = true, Folio = "POL-001" });

        // Act
        await _controller.CreateEntry(request);

        // Assert
        _mockEntryService.Verify(
            s => s.CreateAsync(It.Is<CreateEntryRequest>(r =>
                r.VendorRfc == request.VendorRfc &&
                r.InvoiceNumber == request.InvoiceNumber)),
            Times.Once);
    }

    /// <summary>
    /// T023.2.5: CreateEntry should include line items in request.
    /// </summary>
    [Fact]
    public async Task CreateEntry_Should_Include_Line_Items_In_Request()
    {
        // Arrange
        var lineItems = new List<EntryLineItem>
        {
            new() { Description = "Item 1", Quantity = 2, UnitPrice = 500m, Amount = 1000m }
        };
        var request = new CreateEntryRequest
        {
            VendorRfc = "XAXX010101000",
            InvoiceNumber = "FAC-001",
            InvoiceDate = DateTime.Today,
            Total = 1160m,
            LineItems = lineItems
        };
        _mockEntryService
            .Setup(s => s.CheckDuplicateAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<DateTime>()))
            .ReturnsAsync(new DuplicateCheckResult { IsDuplicate = false });
        _mockEntryService
            .Setup(s => s.CreateAsync(It.Is<CreateEntryRequest>(r => r.LineItems.Any())))
            .ReturnsAsync(new EntryResultDto { Success = true, Folio = "POL-001" });

        // Act
        await _controller.CreateEntry(request);

        // Assert
        _mockEntryService.Verify(
            s => s.CreateAsync(It.Is<CreateEntryRequest>(r => r.LineItems.Any())),
            Times.Once);
    }

    #endregion

    #region T023.2.6 - Return Folio Number on Success

    /// <summary>
    /// T023.2.6: CreateEntry should return location header pointing to entry.
    /// </summary>
    [Fact]
    public async Task CreateEntry_Should_Return_Location_Header()
    {
        // Arrange
        var folio = "POL-2024-0001";
        var request = new CreateEntryRequest
        {
            VendorRfc = "XAXX010101000",
            InvoiceNumber = "FAC-001",
            InvoiceDate = DateTime.Today,
            Total = 1160m
        };
        _mockEntryService
            .Setup(s => s.CheckDuplicateAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<DateTime>()))
            .ReturnsAsync(new DuplicateCheckResult { IsDuplicate = false });
        _mockEntryService
            .Setup(s => s.CreateAsync(It.IsAny<CreateEntryRequest>()))
            .ReturnsAsync(new EntryResultDto { Success = true, Folio = folio });

        // Act
        var result = await _controller.CreateEntry(request);
        var createdResult = result as CreatedAtActionResult;

        // Assert
        createdResult.Should().NotBeNull();
        createdResult!.ActionName.Should().Be(nameof(EntriesController.GetEntryByFolio));
    }

    /// <summary>
    /// T023.2.6: CreateEntry response should include success message.
    /// </summary>
    [Fact]
    public async Task CreateEntry_Response_Should_Include_Success_Message()
    {
        // Arrange
        var request = new CreateEntryRequest
        {
            VendorRfc = "XAXX010101000",
            InvoiceNumber = "FAC-001",
            InvoiceDate = DateTime.Today,
            Total = 1160m
        };
        _mockEntryService
            .Setup(s => s.CheckDuplicateAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<DateTime>()))
            .ReturnsAsync(new DuplicateCheckResult { IsDuplicate = false });
        _mockEntryService
            .Setup(s => s.CreateAsync(It.IsAny<CreateEntryRequest>()))
            .ReturnsAsync(new EntryResultDto { Success = true, Folio = "POL-001" });

        // Act
        var result = await _controller.CreateEntry(request);
        var createdResult = result as CreatedAtActionResult;

        // Assert
        createdResult.Should().NotBeNull();
    }

    #endregion

    #region T023.2.7 - Return Detailed Error on Failure

    /// <summary>
    /// T023.2.7: CreateEntry should return error when service fails.
    /// </summary>
    [Fact]
    public async Task CreateEntry_Should_Return_Error_When_Service_Fails()
    {
        // Arrange
        var request = new CreateEntryRequest
        {
            VendorRfc = "XAXX010101000",
            InvoiceNumber = "FAC-001",
            InvoiceDate = DateTime.Today,
            Total = 1160m
        };
        _mockEntryService
            .Setup(s => s.CheckDuplicateAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<DateTime>()))
            .ReturnsAsync(new DuplicateCheckResult { IsDuplicate = false });
        _mockEntryService
            .Setup(s => s.CreateAsync(It.IsAny<CreateEntryRequest>()))
            .ReturnsAsync(new EntryResultDto
            {
                Success = false,
                ErrorMessage = "Error al crear la póliza en ContPAQi"
            });

        // Act
        var result = await _controller.CreateEntry(request);

        // Assert
        result.Should().BeOfType<ObjectResult>();
        var objectResult = result as ObjectResult;
        objectResult!.StatusCode.Should().Be(500);
    }

    /// <summary>
    /// T023.2.7: CreateEntry should include error message from service.
    /// </summary>
    [Fact]
    public async Task CreateEntry_Should_Include_Error_Message_From_Service()
    {
        // Arrange
        var errorMessage = "Proveedor no encontrado en ContPAQi";
        var request = new CreateEntryRequest
        {
            VendorRfc = "XAXX010101000",
            InvoiceNumber = "FAC-001",
            InvoiceDate = DateTime.Today,
            Total = 1160m
        };
        _mockEntryService
            .Setup(s => s.CheckDuplicateAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<DateTime>()))
            .ReturnsAsync(new DuplicateCheckResult { IsDuplicate = false });
        _mockEntryService
            .Setup(s => s.CreateAsync(It.IsAny<CreateEntryRequest>()))
            .ReturnsAsync(new EntryResultDto
            {
                Success = false,
                ErrorMessage = errorMessage
            });

        // Act
        var result = await _controller.CreateEntry(request);

        // Assert
        result.Should().BeOfType<ObjectResult>();
    }

    /// <summary>
    /// T023.2.7: CreateEntry should handle service exceptions gracefully.
    /// </summary>
    [Fact]
    public async Task CreateEntry_Should_Handle_Service_Exceptions_Gracefully()
    {
        // Arrange
        var request = new CreateEntryRequest
        {
            VendorRfc = "XAXX010101000",
            InvoiceNumber = "FAC-001",
            InvoiceDate = DateTime.Today,
            Total = 1160m
        };
        _mockEntryService
            .Setup(s => s.CheckDuplicateAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<DateTime>()))
            .ReturnsAsync(new DuplicateCheckResult { IsDuplicate = false });
        _mockEntryService
            .Setup(s => s.CreateAsync(It.IsAny<CreateEntryRequest>()))
            .ThrowsAsync(new Exception("SDK error"));

        // Act
        var result = await _controller.CreateEntry(request);

        // Assert
        result.Should().BeOfType<ObjectResult>();
        var objectResult = result as ObjectResult;
        objectResult!.StatusCode.Should().Be(500);
    }

    /// <summary>
    /// T023.2.7: CreateEntry error response should be in Spanish.
    /// </summary>
    [Fact]
    public async Task CreateEntry_Error_Response_Should_Be_In_Spanish()
    {
        // Arrange
        var request = new CreateEntryRequest
        {
            VendorRfc = "INVALID",
            InvoiceNumber = "FAC-001",
            InvoiceDate = DateTime.Today,
            Total = 1160m
        };

        // Act
        var result = await _controller.CreateEntry(request);

        // Assert
        result.Should().BeOfType<BadRequestObjectResult>();
    }

    #endregion

    #region GET /entries/{folio} Endpoint Tests

    /// <summary>
    /// GetEntryByFolio should return OkObjectResult when found.
    /// </summary>
    [Fact]
    public async Task GetEntryByFolio_Should_Return_OkObjectResult_When_Found()
    {
        // Arrange
        var folio = "POL-2024-0001";
        _mockEntryService
            .Setup(s => s.GetByFolioAsync(folio))
            .ReturnsAsync(new EntryResultDto { Success = true, Folio = folio });

        // Act
        var result = await _controller.GetEntryByFolio(folio);

        // Assert
        result.Should().BeOfType<OkObjectResult>();
    }

    /// <summary>
    /// GetEntryByFolio should return NotFound when entry not found.
    /// </summary>
    [Fact]
    public async Task GetEntryByFolio_Should_Return_NotFound_When_Not_Found()
    {
        // Arrange
        var folio = "NONEXISTENT";
        _mockEntryService
            .Setup(s => s.GetByFolioAsync(folio))
            .ReturnsAsync((EntryResultDto?)null);

        // Act
        var result = await _controller.GetEntryByFolio(folio);

        // Assert
        result.Should().BeOfType<NotFoundObjectResult>();
    }

    /// <summary>
    /// GetEntryByFolio should validate folio is required.
    /// </summary>
    [Fact]
    public async Task GetEntryByFolio_Should_Validate_Folio_Required()
    {
        // Arrange
        var emptyFolio = "";

        // Act
        var result = await _controller.GetEntryByFolio(emptyFolio);

        // Assert
        result.Should().BeOfType<BadRequestObjectResult>();
    }

    #endregion
}
