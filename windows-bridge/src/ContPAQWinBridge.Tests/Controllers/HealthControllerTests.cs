using Xunit;
using FluentAssertions;
using Moq;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using ContPAQWinBridge.Controllers;
using ContPAQWinBridge.Services;
using ContPAQWinBridge.Models;

namespace ContPAQWinBridge.Tests.Controllers;

/// <summary>
/// Tests for HealthController functionality.
/// T007.1.1 - T007.1.4
/// </summary>
public class HealthControllerTests
{
    private readonly Mock<ISdkService> _mockSdkService;
    private readonly Mock<ILogger<HealthController>> _mockLogger;
    private readonly HealthController _controller;

    public HealthControllerTests()
    {
        _mockSdkService = new Mock<ISdkService>();
        _mockLogger = new Mock<ILogger<HealthController>>();
        _controller = new HealthController(_mockSdkService.Object, _mockLogger.Object);
    }

    #region T007.1.1 - Controller Exists and Is Configured

    /// <summary>
    /// T007.1.1: HealthController should exist.
    /// </summary>
    [Fact]
    public void HealthController_Should_Exist()
    {
        // Assert
        _controller.Should().NotBeNull();
        _controller.Should().BeAssignableTo<ControllerBase>();
    }

    /// <summary>
    /// T007.1.1: HealthController should inherit from BaseController.
    /// </summary>
    [Fact]
    public void HealthController_Should_Inherit_From_BaseController()
    {
        // Assert
        _controller.Should().BeAssignableTo<BaseController>();
    }

    /// <summary>
    /// T007.1.1: HealthController should have ApiController attribute.
    /// </summary>
    [Fact]
    public void HealthController_Should_Have_ApiController_Attribute()
    {
        // Arrange
        var controllerType = typeof(HealthController);

        // Assert
        controllerType.GetCustomAttributes(typeof(ApiControllerAttribute), true)
            .Should().NotBeEmpty("HealthController should have [ApiController] attribute");
    }

    #endregion

    #region T007.1.2 - GET /health Endpoint

    /// <summary>
    /// T007.1.2: GetHealth should return OkObjectResult.
    /// </summary>
    [Fact]
    public async Task GetHealth_Should_Return_OkObjectResult()
    {
        // Arrange
        _mockSdkService.Setup(s => s.IsAvailable()).Returns(false);
        _mockSdkService.Setup(s => s.IsConnected).Returns(false);

        // Act
        var result = await _controller.GetHealth();

        // Assert
        result.Should().BeOfType<OkObjectResult>();
    }

    /// <summary>
    /// T007.1.2: GetHealth should return HealthResponse.
    /// </summary>
    [Fact]
    public async Task GetHealth_Should_Return_HealthResponse()
    {
        // Arrange
        _mockSdkService.Setup(s => s.IsAvailable()).Returns(false);
        _mockSdkService.Setup(s => s.IsConnected).Returns(false);

        // Act
        var result = await _controller.GetHealth();
        var okResult = result as OkObjectResult;

        // Assert
        okResult.Should().NotBeNull();
        okResult!.Value.Should().BeOfType<HealthResponse>();
    }

    /// <summary>
    /// T007.1.2: GetHealth should include timestamp.
    /// </summary>
    [Fact]
    public async Task GetHealth_Should_Include_Timestamp()
    {
        // Arrange
        _mockSdkService.Setup(s => s.IsAvailable()).Returns(false);
        var beforeCall = DateTime.UtcNow;

        // Act
        var result = await _controller.GetHealth();
        var okResult = result as OkObjectResult;
        var health = okResult?.Value as HealthResponse;

        // Assert
        health.Should().NotBeNull();
        health!.Timestamp.Should().BeOnOrAfter(beforeCall);
        health.Timestamp.Should().BeOnOrBefore(DateTime.UtcNow);
    }

    /// <summary>
    /// T007.1.2: GetHealth should include version.
    /// </summary>
    [Fact]
    public async Task GetHealth_Should_Include_Version()
    {
        // Arrange
        _mockSdkService.Setup(s => s.IsAvailable()).Returns(false);

        // Act
        var result = await _controller.GetHealth();
        var okResult = result as OkObjectResult;
        var health = okResult?.Value as HealthResponse;

        // Assert
        health.Should().NotBeNull();
        health!.Version.Should().NotBeNullOrEmpty();
    }

    #endregion

    #region T007.1.3 - SDK Connection Status

    /// <summary>
    /// T007.1.3: GetHealth should return Healthy when SDK is available.
    /// </summary>
    [Fact]
    public async Task GetHealth_Should_Return_Healthy_When_SDK_Available()
    {
        // Arrange
        _mockSdkService.Setup(s => s.IsAvailable()).Returns(true);
        _mockSdkService.Setup(s => s.IsConnected).Returns(true);
        _mockSdkService.Setup(s => s.GetVersion()).Returns("10.0.0");

        // Act
        var result = await _controller.GetHealth();
        var okResult = result as OkObjectResult;
        var health = okResult?.Value as HealthResponse;

        // Assert
        health.Should().NotBeNull();
        health!.Status.Should().Be(HealthStatus.Healthy);
    }

    /// <summary>
    /// T007.1.3: GetHealth should return Degraded when SDK unavailable.
    /// </summary>
    [Fact]
    public async Task GetHealth_Should_Return_Degraded_When_SDK_Unavailable()
    {
        // Arrange
        _mockSdkService.Setup(s => s.IsAvailable()).Returns(false);
        _mockSdkService.Setup(s => s.IsConnected).Returns(false);

        // Act
        var result = await _controller.GetHealth();
        var okResult = result as OkObjectResult;
        var health = okResult?.Value as HealthResponse;

        // Assert
        health.Should().NotBeNull();
        health!.Status.Should().Be(HealthStatus.Degraded);
    }

    /// <summary>
    /// T007.1.3: GetHealth should include SDK component status.
    /// </summary>
    [Fact]
    public async Task GetHealth_Should_Include_SDK_Component_Status()
    {
        // Arrange
        _mockSdkService.Setup(s => s.IsAvailable()).Returns(true);
        _mockSdkService.Setup(s => s.GetVersion()).Returns("10.0.0");

        // Act
        var result = await _controller.GetHealth();
        var okResult = result as OkObjectResult;
        var health = okResult?.Value as HealthResponse;

        // Assert
        health.Should().NotBeNull();
        health!.Components.Should().NotBeNull();
        health.Components.Sdk.Should().NotBeNull();
        health.Components.Sdk.IsAvailable.Should().BeTrue();
        health.Components.Sdk.Version.Should().Be("10.0.0");
    }

    /// <summary>
    /// T007.1.3: GetHealth should show SDK unavailable when not installed.
    /// </summary>
    [Fact]
    public async Task GetHealth_Should_Show_SDK_Unavailable_When_Not_Installed()
    {
        // Arrange
        _mockSdkService.Setup(s => s.IsAvailable()).Returns(false);
        _mockSdkService.Setup(s => s.GetVersion()).Returns((string?)null);

        // Act
        var result = await _controller.GetHealth();
        var okResult = result as OkObjectResult;
        var health = okResult?.Value as HealthResponse;

        // Assert
        health.Should().NotBeNull();
        health!.Components.Sdk.IsAvailable.Should().BeFalse();
        health.Components.Sdk.Status.Should().Be(HealthStatus.Unhealthy);
    }

    /// <summary>
    /// T007.1.3: GetHealth should call ISdkService.IsAvailable.
    /// </summary>
    [Fact]
    public async Task GetHealth_Should_Call_SdkService_IsAvailable()
    {
        // Arrange
        _mockSdkService.Setup(s => s.IsAvailable()).Returns(false);

        // Act
        await _controller.GetHealth();

        // Assert
        _mockSdkService.Verify(s => s.IsAvailable(), Times.Once);
    }

    #endregion

    #region T007.1.4 - Current Company Status

    /// <summary>
    /// T007.1.4: GetHealth should show connected status when SDK connected.
    /// </summary>
    [Fact]
    public async Task GetHealth_Should_Show_Connected_Status_When_SDK_Connected()
    {
        // Arrange
        _mockSdkService.Setup(s => s.IsAvailable()).Returns(true);
        _mockSdkService.Setup(s => s.IsConnected).Returns(true);

        // Act
        var result = await _controller.GetHealth();
        var okResult = result as OkObjectResult;
        var health = okResult?.Value as HealthResponse;

        // Assert
        health.Should().NotBeNull();
        health!.Components.Sdk.Status.Should().Be(HealthStatus.Healthy);
    }

    /// <summary>
    /// T007.1.4: GetHealth should show disconnected when SDK not connected.
    /// </summary>
    [Fact]
    public async Task GetHealth_Should_Show_Disconnected_When_SDK_Not_Connected()
    {
        // Arrange
        _mockSdkService.Setup(s => s.IsAvailable()).Returns(true);
        _mockSdkService.Setup(s => s.IsConnected).Returns(false);

        // Act
        var result = await _controller.GetHealth();
        var okResult = result as OkObjectResult;
        var health = okResult?.Value as HealthResponse;

        // Assert
        health.Should().NotBeNull();
        health!.Components.Sdk.Status.Should().Be(HealthStatus.Degraded);
    }

    /// <summary>
    /// T007.1.4: GetHealth should include connection details.
    /// </summary>
    [Fact]
    public async Task GetHealth_Should_Include_Connection_Details()
    {
        // Arrange
        _mockSdkService.Setup(s => s.IsAvailable()).Returns(true);
        _mockSdkService.Setup(s => s.IsConnected).Returns(false);

        // Act
        var result = await _controller.GetHealth();
        var okResult = result as OkObjectResult;
        var health = okResult?.Value as HealthResponse;

        // Assert
        health.Should().NotBeNull();
        health!.Components.Sdk.Details.Should().NotBeNullOrEmpty();
    }

    #endregion

    #region Error Handling

    /// <summary>
    /// GetHealth should handle SDK service exceptions gracefully.
    /// </summary>
    [Fact]
    public async Task GetHealth_Should_Handle_SDK_Exceptions_Gracefully()
    {
        // Arrange
        _mockSdkService.Setup(s => s.IsAvailable()).Throws(new Exception("SDK error"));

        // Act
        var result = await _controller.GetHealth();
        var okResult = result as OkObjectResult;
        var health = okResult?.Value as HealthResponse;

        // Assert
        health.Should().NotBeNull();
        health!.Status.Should().Be(HealthStatus.Unhealthy);
        health.Components.Sdk.Status.Should().Be(HealthStatus.Unhealthy);
    }

    #endregion
}
