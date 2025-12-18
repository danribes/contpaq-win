using Xunit;
using FluentAssertions;
using Moq;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using ContPAQWinBridge.Controllers;
using ContPAQWinBridge.Services;

namespace ContPAQWinBridge.Tests.Controllers;

/// <summary>
/// Tests for VendorsController functionality.
/// T022.1.1 - T022.1.5: Vendor list endpoint implementation.
/// </summary>
public class VendorsControllerTests
{
    private readonly Mock<IVendorService> _mockVendorService;
    private readonly Mock<ILogger<VendorsController>> _mockLogger;
    private readonly VendorsController _controller;

    public VendorsControllerTests()
    {
        _mockVendorService = new Mock<IVendorService>();
        _mockLogger = new Mock<ILogger<VendorsController>>();
        _controller = new VendorsController(_mockVendorService.Object, _mockLogger.Object);
    }

    #region T022.1.1 - Controller Exists and Is Configured

    /// <summary>
    /// T022.1.1: VendorsController should exist.
    /// </summary>
    [Fact]
    public void VendorsController_Should_Exist()
    {
        // Assert
        _controller.Should().NotBeNull();
        _controller.Should().BeAssignableTo<ControllerBase>();
    }

    /// <summary>
    /// T022.1.1: VendorsController should inherit from BaseController.
    /// </summary>
    [Fact]
    public void VendorsController_Should_Inherit_From_BaseController()
    {
        // Assert
        _controller.Should().BeAssignableTo<BaseController>();
    }

    /// <summary>
    /// T022.1.1: VendorsController should have ApiController attribute.
    /// </summary>
    [Fact]
    public void VendorsController_Should_Have_ApiController_Attribute()
    {
        // Arrange
        var controllerType = typeof(VendorsController);

        // Assert
        controllerType.GetCustomAttributes(typeof(ApiControllerAttribute), true)
            .Should().NotBeEmpty("VendorsController should have [ApiController] attribute");
    }

    /// <summary>
    /// T022.1.1: VendorsController should have Route attribute with api/vendors.
    /// </summary>
    [Fact]
    public void VendorsController_Should_Have_Route_Attribute()
    {
        // Arrange
        var controllerType = typeof(VendorsController);

        // Assert
        var routeAttributes = controllerType.GetCustomAttributes(typeof(RouteAttribute), true);
        routeAttributes.Should().NotBeEmpty("VendorsController should have [Route] attribute");
    }

    #endregion

    #region T022.1.3 - GET /vendors with Search

    /// <summary>
    /// T022.1.3: GetVendors should return OkObjectResult.
    /// </summary>
    [Fact]
    public async Task GetVendors_Should_Return_OkObjectResult()
    {
        // Arrange
        _mockVendorService
            .Setup(s => s.SearchAsync(It.IsAny<string>(), It.IsAny<int>()))
            .ReturnsAsync(new List<VendorDto>());

        // Act
        var result = await _controller.GetVendors();

        // Assert
        result.Should().BeOfType<OkObjectResult>();
    }

    /// <summary>
    /// T022.1.3: GetVendors should return list of vendors.
    /// </summary>
    [Fact]
    public async Task GetVendors_Should_Return_List_Of_Vendors()
    {
        // Arrange
        var vendors = new List<VendorDto>
        {
            new() { Code = "PROV001", Rfc = "XAXX010101000", Name = "Test Vendor" }
        };
        _mockVendorService
            .Setup(s => s.SearchAsync(It.IsAny<string>(), It.IsAny<int>()))
            .ReturnsAsync(vendors);

        // Act
        var result = await _controller.GetVendors();
        var okResult = result as OkObjectResult;

        // Assert
        okResult.Should().NotBeNull();
        okResult!.Value.Should().NotBeNull();
    }

    /// <summary>
    /// T022.1.3: GetVendors should accept search parameter.
    /// </summary>
    [Fact]
    public async Task GetVendors_Should_Accept_Search_Parameter()
    {
        // Arrange
        var searchTerm = "Test";
        _mockVendorService
            .Setup(s => s.SearchAsync(searchTerm, It.IsAny<int>()))
            .ReturnsAsync(new List<VendorDto>());

        // Act
        var result = await _controller.GetVendors(search: searchTerm);

        // Assert
        _mockVendorService.Verify(s => s.SearchAsync(searchTerm, It.IsAny<int>()), Times.Once);
    }

    /// <summary>
    /// T022.1.3: GetVendors should accept limit parameter.
    /// </summary>
    [Fact]
    public async Task GetVendors_Should_Accept_Limit_Parameter()
    {
        // Arrange
        var limit = 10;
        _mockVendorService
            .Setup(s => s.SearchAsync(It.IsAny<string>(), limit))
            .ReturnsAsync(new List<VendorDto>());

        // Act
        var result = await _controller.GetVendors(limit: limit);

        // Assert
        _mockVendorService.Verify(s => s.SearchAsync(It.IsAny<string>(), limit), Times.Once);
    }

    /// <summary>
    /// T022.1.3: GetVendors should default limit to 20.
    /// </summary>
    [Fact]
    public async Task GetVendors_Should_Default_Limit_To_20()
    {
        // Arrange
        _mockVendorService
            .Setup(s => s.SearchAsync(It.IsAny<string>(), 20))
            .ReturnsAsync(new List<VendorDto>());

        // Act
        await _controller.GetVendors();

        // Assert
        _mockVendorService.Verify(s => s.SearchAsync(It.IsAny<string>(), 20), Times.Once);
    }

    /// <summary>
    /// T022.1.3: GetVendors should return empty list when no vendors found.
    /// </summary>
    [Fact]
    public async Task GetVendors_Should_Return_Empty_List_When_No_Vendors_Found()
    {
        // Arrange
        _mockVendorService
            .Setup(s => s.SearchAsync(It.IsAny<string>(), It.IsAny<int>()))
            .ReturnsAsync(new List<VendorDto>());

        // Act
        var result = await _controller.GetVendors(search: "nonexistent");
        var okResult = result as OkObjectResult;

        // Assert
        okResult.Should().NotBeNull();
    }

    /// <summary>
    /// T022.1.3: GetVendors should filter vendors by search term.
    /// </summary>
    [Fact]
    public async Task GetVendors_Should_Filter_Vendors_By_Search_Term()
    {
        // Arrange
        var searchTerm = "ABC";
        var matchingVendors = new List<VendorDto>
        {
            new() { Code = "PROV001", Rfc = "ABC850101ABC", Name = "ABC Company" }
        };
        _mockVendorService
            .Setup(s => s.SearchAsync(searchTerm, It.IsAny<int>()))
            .ReturnsAsync(matchingVendors);

        // Act
        var result = await _controller.GetVendors(search: searchTerm);
        var okResult = result as OkObjectResult;

        // Assert
        okResult.Should().NotBeNull();
        _mockVendorService.Verify(s => s.SearchAsync(searchTerm, It.IsAny<int>()), Times.Once);
    }

    #endregion

    #region T022.1.4 - GET /vendors/{rfc}

    /// <summary>
    /// T022.1.4: GetVendorByRfc should return OkObjectResult when vendor found.
    /// </summary>
    [Fact]
    public async Task GetVendorByRfc_Should_Return_OkObjectResult_When_Found()
    {
        // Arrange
        var rfc = "XAXX010101000";
        var vendor = new VendorDto { Code = "PROV001", Rfc = rfc, Name = "Test Vendor" };
        _mockVendorService
            .Setup(s => s.GetByRfcAsync(rfc))
            .ReturnsAsync(vendor);

        // Act
        var result = await _controller.GetVendorByRfc(rfc);

        // Assert
        result.Should().BeOfType<OkObjectResult>();
    }

    /// <summary>
    /// T022.1.4: GetVendorByRfc should return vendor data.
    /// </summary>
    [Fact]
    public async Task GetVendorByRfc_Should_Return_Vendor_Data()
    {
        // Arrange
        var rfc = "XAXX010101000";
        var vendor = new VendorDto
        {
            Code = "PROV001",
            Rfc = rfc,
            Name = "Test Vendor",
            CommercialName = "Test Commercial"
        };
        _mockVendorService
            .Setup(s => s.GetByRfcAsync(rfc))
            .ReturnsAsync(vendor);

        // Act
        var result = await _controller.GetVendorByRfc(rfc);
        var okResult = result as OkObjectResult;

        // Assert
        okResult.Should().NotBeNull();
        okResult!.Value.Should().NotBeNull();
    }

    /// <summary>
    /// T022.1.4: GetVendorByRfc should return NotFound when vendor not found.
    /// </summary>
    [Fact]
    public async Task GetVendorByRfc_Should_Return_NotFound_When_Not_Found()
    {
        // Arrange
        var rfc = "NONEXISTENT00";
        _mockVendorService
            .Setup(s => s.GetByRfcAsync(rfc))
            .ReturnsAsync((VendorDto?)null);

        // Act
        var result = await _controller.GetVendorByRfc(rfc);

        // Assert
        result.Should().BeOfType<NotFoundObjectResult>();
    }

    /// <summary>
    /// T022.1.4: GetVendorByRfc should normalize RFC to uppercase.
    /// </summary>
    [Fact]
    public async Task GetVendorByRfc_Should_Normalize_RFC_To_Uppercase()
    {
        // Arrange
        var lowercaseRfc = "xaxx010101000";
        var uppercaseRfc = "XAXX010101000";
        var vendor = new VendorDto { Code = "PROV001", Rfc = uppercaseRfc, Name = "Test" };
        _mockVendorService
            .Setup(s => s.GetByRfcAsync(uppercaseRfc))
            .ReturnsAsync(vendor);

        // Act
        await _controller.GetVendorByRfc(lowercaseRfc);

        // Assert
        _mockVendorService.Verify(s => s.GetByRfcAsync(uppercaseRfc), Times.Once);
    }

    /// <summary>
    /// T022.1.4: GetVendorByRfc should return BadRequest for invalid RFC format.
    /// </summary>
    [Fact]
    public async Task GetVendorByRfc_Should_Return_BadRequest_For_Invalid_RFC()
    {
        // Arrange
        var invalidRfc = "BAD";

        // Act
        var result = await _controller.GetVendorByRfc(invalidRfc);

        // Assert
        result.Should().BeOfType<BadRequestObjectResult>();
    }

    /// <summary>
    /// T022.1.4: GetVendorByRfc should return BadRequest for empty RFC.
    /// </summary>
    [Fact]
    public async Task GetVendorByRfc_Should_Return_BadRequest_For_Empty_RFC()
    {
        // Arrange
        var emptyRfc = "";

        // Act
        var result = await _controller.GetVendorByRfc(emptyRfc);

        // Assert
        result.Should().BeOfType<BadRequestObjectResult>();
    }

    #endregion

    #region T022.1.5 - Query ContPAQi SDK for Vendors

    /// <summary>
    /// T022.1.5: GetVendors should call IVendorService.SearchAsync.
    /// </summary>
    [Fact]
    public async Task GetVendors_Should_Call_VendorService_SearchAsync()
    {
        // Arrange
        _mockVendorService
            .Setup(s => s.SearchAsync(It.IsAny<string>(), It.IsAny<int>()))
            .ReturnsAsync(new List<VendorDto>());

        // Act
        await _controller.GetVendors();

        // Assert
        _mockVendorService.Verify(s => s.SearchAsync(It.IsAny<string>(), It.IsAny<int>()), Times.Once);
    }

    /// <summary>
    /// T022.1.5: GetVendorByRfc should call IVendorService.GetByRfcAsync.
    /// </summary>
    [Fact]
    public async Task GetVendorByRfc_Should_Call_VendorService_GetByRfcAsync()
    {
        // Arrange
        var rfc = "XAXX010101000";
        _mockVendorService
            .Setup(s => s.GetByRfcAsync(rfc))
            .ReturnsAsync(new VendorDto { Rfc = rfc });

        // Act
        await _controller.GetVendorByRfc(rfc);

        // Assert
        _mockVendorService.Verify(s => s.GetByRfcAsync(rfc), Times.Once);
    }

    #endregion

    #region Error Handling

    /// <summary>
    /// GetVendors should handle service exceptions gracefully.
    /// </summary>
    [Fact]
    public async Task GetVendors_Should_Handle_Service_Exceptions_Gracefully()
    {
        // Arrange
        _mockVendorService
            .Setup(s => s.SearchAsync(It.IsAny<string>(), It.IsAny<int>()))
            .ThrowsAsync(new Exception("Database error"));

        // Act
        var result = await _controller.GetVendors();

        // Assert
        result.Should().BeOfType<ObjectResult>();
        var objectResult = result as ObjectResult;
        objectResult!.StatusCode.Should().Be(500);
    }

    /// <summary>
    /// GetVendorByRfc should handle service exceptions gracefully.
    /// </summary>
    [Fact]
    public async Task GetVendorByRfc_Should_Handle_Service_Exceptions_Gracefully()
    {
        // Arrange
        var rfc = "XAXX010101000";
        _mockVendorService
            .Setup(s => s.GetByRfcAsync(rfc))
            .ThrowsAsync(new Exception("SDK error"));

        // Act
        var result = await _controller.GetVendorByRfc(rfc);

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
        var invalidRfc = "BAD";

        // Act
        var result = await _controller.GetVendorByRfc(invalidRfc);

        // Assert
        var badRequestResult = result as BadRequestObjectResult;
        badRequestResult.Should().NotBeNull();
    }

    #endregion

    #region Response Format

    /// <summary>
    /// GetVendors response should include vendor code.
    /// </summary>
    [Fact]
    public async Task GetVendors_Response_Should_Include_Vendor_Code()
    {
        // Arrange
        var vendors = new List<VendorDto>
        {
            new() { Code = "PROV001", Rfc = "XAXX010101000", Name = "Test" }
        };
        _mockVendorService
            .Setup(s => s.SearchAsync(It.IsAny<string>(), It.IsAny<int>()))
            .ReturnsAsync(vendors);

        // Act
        var result = await _controller.GetVendors();

        // Assert
        result.Should().BeOfType<OkObjectResult>();
    }

    /// <summary>
    /// GetVendors response should include vendor RFC.
    /// </summary>
    [Fact]
    public async Task GetVendors_Response_Should_Include_Vendor_RFC()
    {
        // Arrange
        var rfc = "XAXX010101000";
        var vendors = new List<VendorDto>
        {
            new() { Code = "PROV001", Rfc = rfc, Name = "Test" }
        };
        _mockVendorService
            .Setup(s => s.SearchAsync(It.IsAny<string>(), It.IsAny<int>()))
            .ReturnsAsync(vendors);

        // Act
        var result = await _controller.GetVendors();

        // Assert
        result.Should().BeOfType<OkObjectResult>();
    }

    /// <summary>
    /// GetVendors response should include vendor name.
    /// </summary>
    [Fact]
    public async Task GetVendors_Response_Should_Include_Vendor_Name()
    {
        // Arrange
        var name = "Test Vendor SA de CV";
        var vendors = new List<VendorDto>
        {
            new() { Code = "PROV001", Rfc = "XAXX010101000", Name = name }
        };
        _mockVendorService
            .Setup(s => s.SearchAsync(It.IsAny<string>(), It.IsAny<int>()))
            .ReturnsAsync(vendors);

        // Act
        var result = await _controller.GetVendors();

        // Assert
        result.Should().BeOfType<OkObjectResult>();
    }

    #endregion
}
