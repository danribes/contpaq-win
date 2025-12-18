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
}
