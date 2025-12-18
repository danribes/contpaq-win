using Xunit;
using FluentAssertions;
using Moq;
using Microsoft.Extensions.Logging;
using ContPAQWinBridge.Services;

namespace ContPAQWinBridge.Tests.Services;

/// <summary>
/// Tests for VendorService implementation.
/// T022.3.1 - T022.3.4: Vendor service interface and implementation.
/// </summary>
public class VendorServiceTests
{
    private readonly Mock<ISdkService> _mockSdkService;
    private readonly Mock<ILogger<VendorService>> _mockLogger;
    private readonly VendorService _service;

    public VendorServiceTests()
    {
        _mockSdkService = new Mock<ISdkService>();
        _mockLogger = new Mock<ILogger<VendorService>>();
        _service = new VendorService(_mockSdkService.Object, _mockLogger.Object);
    }

    #region T022.3.1 - Interface Exists

    /// <summary>
    /// T022.3.1: IVendorService interface should exist.
    /// </summary>
    [Fact]
    public void IVendorService_Interface_Should_Exist()
    {
        // Assert
        typeof(IVendorService).Should().NotBeNull();
        typeof(IVendorService).IsInterface.Should().BeTrue();
    }

    /// <summary>
    /// T022.3.1: VendorService should implement IVendorService.
    /// </summary>
    [Fact]
    public void VendorService_Should_Implement_IVendorService()
    {
        // Assert
        _service.Should().BeAssignableTo<IVendorService>();
    }

    /// <summary>
    /// T022.3.1: IVendorService should have GetByRfcAsync method.
    /// </summary>
    [Fact]
    public void IVendorService_Should_Have_GetByRfcAsync_Method()
    {
        // Arrange
        var methodInfo = typeof(IVendorService).GetMethod("GetByRfcAsync");

        // Assert
        methodInfo.Should().NotBeNull("IVendorService should have GetByRfcAsync method");
        methodInfo!.ReturnType.Should().Be(typeof(Task<VendorDto?>));
    }

    /// <summary>
    /// T022.3.1: IVendorService should have SearchAsync method.
    /// </summary>
    [Fact]
    public void IVendorService_Should_Have_SearchAsync_Method()
    {
        // Arrange
        var methodInfo = typeof(IVendorService).GetMethod("SearchAsync");

        // Assert
        methodInfo.Should().NotBeNull("IVendorService should have SearchAsync method");
        methodInfo!.ReturnType.Should().Be(typeof(Task<IEnumerable<VendorDto>>));
    }

    /// <summary>
    /// T022.3.1: IVendorService should have CreateAsync method.
    /// </summary>
    [Fact]
    public void IVendorService_Should_Have_CreateAsync_Method()
    {
        // Arrange
        var methodInfo = typeof(IVendorService).GetMethod("CreateAsync");

        // Assert
        methodInfo.Should().NotBeNull("IVendorService should have CreateAsync method");
        methodInfo!.ReturnType.Should().Be(typeof(Task<VendorDto>));
    }

    /// <summary>
    /// T022.3.1: IVendorService should have ExistsAsync method.
    /// </summary>
    [Fact]
    public void IVendorService_Should_Have_ExistsAsync_Method()
    {
        // Arrange
        var methodInfo = typeof(IVendorService).GetMethod("ExistsAsync");

        // Assert
        methodInfo.Should().NotBeNull("IVendorService should have ExistsAsync method");
        methodInfo!.ReturnType.Should().Be(typeof(Task<bool>));
    }

    #endregion

    #region T022.3.2 - VendorService Implementation

    /// <summary>
    /// T022.3.2: VendorService should require ISdkService in constructor.
    /// </summary>
    [Fact]
    public void VendorService_Should_Require_SdkService()
    {
        // Arrange
        var constructors = typeof(VendorService).GetConstructors();

        // Assert
        constructors.Should().HaveCount(1);
        var parameters = constructors[0].GetParameters();
        parameters.Should().Contain(p => p.ParameterType == typeof(ISdkService));
    }

    /// <summary>
    /// T022.3.2: VendorService should require ILogger in constructor.
    /// </summary>
    [Fact]
    public void VendorService_Should_Require_Logger()
    {
        // Arrange
        var constructors = typeof(VendorService).GetConstructors();

        // Assert
        constructors.Should().HaveCount(1);
        var parameters = constructors[0].GetParameters();
        parameters.Should().Contain(p => p.ParameterType == typeof(ILogger<VendorService>));
    }

    /// <summary>
    /// T022.3.2: VendorService should be instantiable for DI.
    /// </summary>
    [Fact]
    public void VendorService_Should_Be_Instantiable_For_DI()
    {
        // Arrange
        var sdkService = Mock.Of<ISdkService>();
        var logger = Mock.Of<ILogger<VendorService>>();

        // Act
        var service = new VendorService(sdkService, logger);

        // Assert
        service.Should().NotBeNull();
        service.Should().BeAssignableTo<IVendorService>();
    }

    #endregion

    #region T022.3.3 - SDK Vendor Queries

    /// <summary>
    /// T022.3.3: GetByRfcAsync should return null when vendor not found.
    /// </summary>
    [Fact]
    public async Task GetByRfcAsync_Should_Return_Null_When_Not_Found()
    {
        // Arrange
        var rfc = "NONEXISTENT00";

        // Act
        var result = await _service.GetByRfcAsync(rfc);

        // Assert
        result.Should().BeNull();
    }

    /// <summary>
    /// T022.3.3: GetByRfcAsync should return vendor when found in test data.
    /// </summary>
    [Fact]
    public async Task GetByRfcAsync_Should_Return_Vendor_When_Found()
    {
        // Arrange - use test RFC
        var rfc = "XAXX010101000";

        // Act
        var result = await _service.GetByRfcAsync(rfc);

        // Assert - stub returns test data for known RFC
        result.Should().NotBeNull();
        result!.Rfc.Should().Be(rfc);
    }

    /// <summary>
    /// T022.3.3: SearchAsync should return empty list when no matches.
    /// </summary>
    [Fact]
    public async Task SearchAsync_Should_Return_Empty_When_No_Matches()
    {
        // Arrange
        var searchTerm = "NONEXISTENT_SEARCH_TERM";

        // Act
        var result = await _service.SearchAsync(searchTerm);

        // Assert
        result.Should().NotBeNull();
        result.Should().BeEmpty();
    }

    /// <summary>
    /// T022.3.3: SearchAsync should return vendors matching search term.
    /// </summary>
    [Fact]
    public async Task SearchAsync_Should_Return_Matching_Vendors()
    {
        // Arrange
        var searchTerm = ""; // Empty search returns all test data

        // Act
        var result = await _service.SearchAsync(searchTerm);

        // Assert - stub returns test data
        result.Should().NotBeNull();
        result.Should().NotBeEmpty();
    }

    /// <summary>
    /// T022.3.3: SearchAsync should respect limit parameter.
    /// </summary>
    [Fact]
    public async Task SearchAsync_Should_Respect_Limit()
    {
        // Arrange
        var limit = 1;

        // Act
        var result = await _service.SearchAsync("", limit);

        // Assert
        result.Should().NotBeNull();
        result.Count().Should().BeLessOrEqualTo(limit);
    }

    /// <summary>
    /// T022.3.3: ExistsAsync should return false when vendor not found.
    /// </summary>
    [Fact]
    public async Task ExistsAsync_Should_Return_False_When_Not_Found()
    {
        // Arrange
        var rfc = "NONEXISTENT00";

        // Act
        var result = await _service.ExistsAsync(rfc);

        // Assert
        result.Should().BeFalse();
    }

    /// <summary>
    /// T022.3.3: ExistsAsync should return true when vendor exists.
    /// </summary>
    [Fact]
    public async Task ExistsAsync_Should_Return_True_When_Found()
    {
        // Arrange - use test RFC
        var rfc = "XAXX010101000";

        // Act
        var result = await _service.ExistsAsync(rfc);

        // Assert
        result.Should().BeTrue();
    }

    #endregion

    #region T022.3.4 - Vendor Creation via SDK

    /// <summary>
    /// T022.3.4: CreateAsync should return created vendor.
    /// </summary>
    [Fact]
    public async Task CreateAsync_Should_Return_Created_Vendor()
    {
        // Arrange
        var request = new CreateVendorRequest
        {
            Rfc = "GARC850101ABC",
            Name = "Test Vendor SA de CV"
        };

        // Act
        var result = await _service.CreateAsync(request);

        // Assert
        result.Should().NotBeNull();
        result.Rfc.Should().Be(request.Rfc);
        result.Name.Should().Be(request.Name);
    }

    /// <summary>
    /// T022.3.4: CreateAsync should assign vendor code.
    /// </summary>
    [Fact]
    public async Task CreateAsync_Should_Assign_Vendor_Code()
    {
        // Arrange
        var request = new CreateVendorRequest
        {
            Rfc = "GARC850101ABC",
            Name = "Test Vendor SA de CV"
        };

        // Act
        var result = await _service.CreateAsync(request);

        // Assert
        result.Code.Should().NotBeNullOrEmpty();
    }

    /// <summary>
    /// T022.3.4: CreateAsync should preserve commercial name.
    /// </summary>
    [Fact]
    public async Task CreateAsync_Should_Preserve_Commercial_Name()
    {
        // Arrange
        var request = new CreateVendorRequest
        {
            Rfc = "GARC850101ABC",
            Name = "Test Vendor SA de CV",
            CommercialName = "Test Commercial"
        };

        // Act
        var result = await _service.CreateAsync(request);

        // Assert
        result.CommercialName.Should().Be(request.CommercialName);
    }

    #endregion

    #region Interface Mockability

    /// <summary>
    /// IVendorService should be mockable for testing.
    /// </summary>
    [Fact]
    public void IVendorService_Should_Be_Mockable()
    {
        // Arrange
        var mock = new Mock<IVendorService>();
        var testVendor = new VendorDto
        {
            Code = "PROV001",
            Rfc = "XAXX010101000",
            Name = "Test Vendor"
        };
        mock.Setup(s => s.GetByRfcAsync(It.IsAny<string>()))
            .ReturnsAsync(testVendor);
        mock.Setup(s => s.SearchAsync(It.IsAny<string>(), It.IsAny<int>()))
            .ReturnsAsync(new List<VendorDto> { testVendor });
        mock.Setup(s => s.CreateAsync(It.IsAny<CreateVendorRequest>()))
            .ReturnsAsync(testVendor);
        mock.Setup(s => s.ExistsAsync(It.IsAny<string>()))
            .ReturnsAsync(true);

        // Act & Assert
        mock.Object.GetByRfcAsync("TEST").Result.Should().Be(testVendor);
        mock.Object.SearchAsync("TEST").Result.Should().Contain(testVendor);
        mock.Object.CreateAsync(new CreateVendorRequest { Rfc = "TEST", Name = "Test" }).Result.Should().Be(testVendor);
        mock.Object.ExistsAsync("TEST").Result.Should().BeTrue();
    }

    #endregion

    #region Error Handling

    /// <summary>
    /// GetByRfcAsync should handle empty RFC gracefully.
    /// </summary>
    [Fact]
    public async Task GetByRfcAsync_Should_Handle_Empty_RFC()
    {
        // Act
        var result = await _service.GetByRfcAsync("");

        // Assert
        result.Should().BeNull();
    }

    /// <summary>
    /// SearchAsync should handle null search term.
    /// </summary>
    [Fact]
    public async Task SearchAsync_Should_Handle_Null_Search_Term()
    {
        // Act
        var result = await _service.SearchAsync(null!);

        // Assert
        result.Should().NotBeNull();
    }

    /// <summary>
    /// ExistsAsync should handle empty RFC.
    /// </summary>
    [Fact]
    public async Task ExistsAsync_Should_Handle_Empty_RFC()
    {
        // Act
        var result = await _service.ExistsAsync("");

        // Assert
        result.Should().BeFalse();
    }

    #endregion
}
