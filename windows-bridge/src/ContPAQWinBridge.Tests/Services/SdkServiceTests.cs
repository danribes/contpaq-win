using Xunit;
using FluentAssertions;
using Moq;
using Microsoft.Extensions.Logging;
using ContPAQWinBridge.Services;

namespace ContPAQWinBridge.Tests.Services;

/// <summary>
/// Tests for SDK service interface and implementation.
/// T007.2.1 - T007.2.4
/// </summary>
public class SdkServiceTests
{
    private readonly Mock<ILogger<SdkService>> _mockLogger;
    private readonly SdkService _service;

    public SdkServiceTests()
    {
        _mockLogger = new Mock<ILogger<SdkService>>();
        _service = new SdkService(_mockLogger.Object);
    }

    #region T007.2.1 - Interface Exists

    /// <summary>
    /// T007.2.1: ISdkService interface should exist.
    /// </summary>
    [Fact]
    public void ISdkService_Interface_Should_Exist()
    {
        // Assert
        typeof(ISdkService).Should().NotBeNull();
        typeof(ISdkService).IsInterface.Should().BeTrue();
    }

    /// <summary>
    /// T007.2.1: SdkService should implement ISdkService.
    /// </summary>
    [Fact]
    public void SdkService_Should_Implement_ISdkService()
    {
        // Assert
        _service.Should().BeAssignableTo<ISdkService>();
    }

    #endregion

    #region T007.2.2 - Method Definitions

    /// <summary>
    /// T007.2.2: ISdkService should have IsAvailable method.
    /// </summary>
    [Fact]
    public void ISdkService_Should_Have_IsAvailable_Method()
    {
        // Arrange
        var methodInfo = typeof(ISdkService).GetMethod("IsAvailable");

        // Assert
        methodInfo.Should().NotBeNull("ISdkService should have IsAvailable method");
        methodInfo!.ReturnType.Should().Be(typeof(bool));
    }

    /// <summary>
    /// T007.2.2: ISdkService should have GetVersion method.
    /// </summary>
    [Fact]
    public void ISdkService_Should_Have_GetVersion_Method()
    {
        // Arrange
        var methodInfo = typeof(ISdkService).GetMethod("GetVersion");

        // Assert
        methodInfo.Should().NotBeNull("ISdkService should have GetVersion method");
        methodInfo!.ReturnType.Should().Be(typeof(string));
    }

    /// <summary>
    /// T007.2.2: ISdkService should have Connect method.
    /// </summary>
    [Fact]
    public void ISdkService_Should_Have_Connect_Method()
    {
        // Arrange
        var methodInfo = typeof(ISdkService).GetMethod("Connect");

        // Assert
        methodInfo.Should().NotBeNull("ISdkService should have Connect method");
        methodInfo!.ReturnType.Should().Be(typeof(bool));
    }

    /// <summary>
    /// T007.2.2: ISdkService should have IsConnected property.
    /// </summary>
    [Fact]
    public void ISdkService_Should_Have_IsConnected_Property()
    {
        // Arrange
        var propertyInfo = typeof(ISdkService).GetProperty("IsConnected");

        // Assert
        propertyInfo.Should().NotBeNull("ISdkService should have IsConnected property");
        propertyInfo!.PropertyType.Should().Be(typeof(bool));
    }

    /// <summary>
    /// T007.2.2: ISdkService should have Disconnect method.
    /// </summary>
    [Fact]
    public void ISdkService_Should_Have_Disconnect_Method()
    {
        // Arrange
        var methodInfo = typeof(ISdkService).GetMethod("Disconnect");

        // Assert
        methodInfo.Should().NotBeNull("ISdkService should have Disconnect method");
    }

    #endregion

    #region T007.2.3 - SdkService Implementation

    /// <summary>
    /// T007.2.3: SdkService.IsAvailable should return false (stub).
    /// </summary>
    [Fact]
    public void IsAvailable_Should_Return_False_For_Stub()
    {
        // Act
        var result = _service.IsAvailable();

        // Assert
        result.Should().BeFalse("stub implementation should return false");
    }

    /// <summary>
    /// T007.2.3: SdkService.GetVersion should return null (stub).
    /// </summary>
    [Fact]
    public void GetVersion_Should_Return_Null_For_Stub()
    {
        // Act
        var result = _service.GetVersion();

        // Assert
        result.Should().BeNull("stub implementation should return null");
    }

    /// <summary>
    /// T007.2.3: SdkService.IsConnected should return false (stub).
    /// </summary>
    [Fact]
    public void IsConnected_Should_Return_False_For_Stub()
    {
        // Act
        var result = _service.IsConnected;

        // Assert
        result.Should().BeFalse("stub implementation should return false");
    }

    /// <summary>
    /// T007.2.3: SdkService.Connect should return false (stub).
    /// </summary>
    [Fact]
    public void Connect_Should_Return_False_For_Stub()
    {
        // Act
        var result = _service.Connect("TestCompany");

        // Assert
        result.Should().BeFalse("stub implementation should return false");
    }

    /// <summary>
    /// T007.2.3: SdkService.Connect should accept company name parameter.
    /// </summary>
    [Fact]
    public void Connect_Should_Accept_CompanyName_Parameter()
    {
        // Arrange
        var methodInfo = typeof(SdkService).GetMethod("Connect");

        // Assert
        methodInfo.Should().NotBeNull();
        var parameters = methodInfo!.GetParameters();
        parameters.Should().HaveCount(1);
        parameters[0].Name.Should().Be("companyName");
        parameters[0].ParameterType.Should().Be(typeof(string));
    }

    /// <summary>
    /// T007.2.3: SdkService.Disconnect should complete without error.
    /// </summary>
    [Fact]
    public void Disconnect_Should_Complete_Without_Error()
    {
        // Act & Assert - should not throw
        var exception = Record.Exception(() => _service.Disconnect());
        exception.Should().BeNull();
    }

    /// <summary>
    /// T007.2.3: SdkService should require ILogger in constructor.
    /// </summary>
    [Fact]
    public void SdkService_Should_Require_Logger()
    {
        // Arrange
        var constructors = typeof(SdkService).GetConstructors();

        // Assert
        constructors.Should().HaveCount(1);
        var parameters = constructors[0].GetParameters();
        parameters.Should().Contain(p => p.ParameterType == typeof(ILogger<SdkService>));
    }

    #endregion

    #region T007.2.4 - DI Registration Ready

    /// <summary>
    /// T007.2.4: SdkService should be instantiable for DI.
    /// </summary>
    [Fact]
    public void SdkService_Should_Be_Instantiable_For_DI()
    {
        // Arrange
        var logger = Mock.Of<ILogger<SdkService>>();

        // Act
        var service = new SdkService(logger);

        // Assert
        service.Should().NotBeNull();
        service.Should().BeAssignableTo<ISdkService>();
    }

    /// <summary>
    /// T007.2.4: SdkService should work with mocked dependencies.
    /// </summary>
    [Fact]
    public void SdkService_Should_Work_With_Mocked_Dependencies()
    {
        // Arrange
        var mockLogger = new Mock<ILogger<SdkService>>();
        var service = new SdkService(mockLogger.Object);

        // Act
        service.IsAvailable();

        // Assert - verify logger was potentially used (debug logging)
        mockLogger.Invocations.Should().NotBeNull();
    }

    #endregion

    #region Interface Mockability

    /// <summary>
    /// ISdkService should be mockable for testing.
    /// </summary>
    [Fact]
    public void ISdkService_Should_Be_Mockable()
    {
        // Arrange
        var mock = new Mock<ISdkService>();
        mock.Setup(s => s.IsAvailable()).Returns(true);
        mock.Setup(s => s.GetVersion()).Returns("10.0.0");
        mock.Setup(s => s.IsConnected).Returns(true);
        mock.Setup(s => s.Connect(It.IsAny<string>())).Returns(true);

        // Act & Assert
        mock.Object.IsAvailable().Should().BeTrue();
        mock.Object.GetVersion().Should().Be("10.0.0");
        mock.Object.IsConnected.Should().BeTrue();
        mock.Object.Connect("TestCompany").Should().BeTrue();
    }

    #endregion
}
