using Xunit;
using FluentAssertions;
using ContPAQWinBridge.Interop;

namespace ContPAQWinBridge.Tests.Interop;

/// <summary>
/// Tests for COM interop stubs.
/// T007.3.1 - T007.3.4
/// </summary>
public class ComInteropTests
{
    #region T007.3.1 - ContPAQiComercialSdk Interface

    /// <summary>
    /// T007.3.1: IContPAQiComercialSdk interface should exist.
    /// </summary>
    [Fact]
    public void IContPAQiComercialSdk_Interface_Should_Exist()
    {
        // Assert
        typeof(IContPAQiComercialSdk).Should().NotBeNull();
        typeof(IContPAQiComercialSdk).IsInterface.Should().BeTrue();
    }

    /// <summary>
    /// T007.3.1: IContPAQiComercialSdk should have Initialize method.
    /// </summary>
    [Fact]
    public void IContPAQiComercialSdk_Should_Have_Initialize_Method()
    {
        var method = typeof(IContPAQiComercialSdk).GetMethod("Initialize");
        method.Should().NotBeNull();
        method!.ReturnType.Should().Be(typeof(bool));
    }

    /// <summary>
    /// T007.3.1: IContPAQiComercialSdk should have Terminate method.
    /// </summary>
    [Fact]
    public void IContPAQiComercialSdk_Should_Have_Terminate_Method()
    {
        var method = typeof(IContPAQiComercialSdk).GetMethod("Terminate");
        method.Should().NotBeNull();
    }

    /// <summary>
    /// T007.3.1: IContPAQiComercialSdk should have OpenCompany method.
    /// </summary>
    [Fact]
    public void IContPAQiComercialSdk_Should_Have_OpenCompany_Method()
    {
        var method = typeof(IContPAQiComercialSdk).GetMethod("OpenCompany");
        method.Should().NotBeNull();
        method!.ReturnType.Should().Be(typeof(bool));
    }

    /// <summary>
    /// T007.3.1: IContPAQiComercialSdk should have CloseCompany method.
    /// </summary>
    [Fact]
    public void IContPAQiComercialSdk_Should_Have_CloseCompany_Method()
    {
        var method = typeof(IContPAQiComercialSdk).GetMethod("CloseCompany");
        method.Should().NotBeNull();
    }

    /// <summary>
    /// T007.3.1: ContPAQiComercialSdk should implement interface.
    /// </summary>
    [Fact]
    public void ContPAQiComercialSdk_Should_Implement_Interface()
    {
        var sdk = new ContPAQiComercialSdk();
        sdk.Should().BeAssignableTo<IContPAQiComercialSdk>();
    }

    #endregion

    #region T007.3.2 - ContPAQiContabilidadSdk Interface

    /// <summary>
    /// T007.3.2: IContPAQiContabilidadSdk interface should exist.
    /// </summary>
    [Fact]
    public void IContPAQiContabilidadSdk_Interface_Should_Exist()
    {
        typeof(IContPAQiContabilidadSdk).Should().NotBeNull();
        typeof(IContPAQiContabilidadSdk).IsInterface.Should().BeTrue();
    }

    /// <summary>
    /// T007.3.2: IContPAQiContabilidadSdk should have Initialize method.
    /// </summary>
    [Fact]
    public void IContPAQiContabilidadSdk_Should_Have_Initialize_Method()
    {
        var method = typeof(IContPAQiContabilidadSdk).GetMethod("Initialize");
        method.Should().NotBeNull();
        method!.ReturnType.Should().Be(typeof(bool));
    }

    /// <summary>
    /// T007.3.2: IContPAQiContabilidadSdk should have Terminate method.
    /// </summary>
    [Fact]
    public void IContPAQiContabilidadSdk_Should_Have_Terminate_Method()
    {
        var method = typeof(IContPAQiContabilidadSdk).GetMethod("Terminate");
        method.Should().NotBeNull();
    }

    /// <summary>
    /// T007.3.2: IContPAQiContabilidadSdk should have OpenCompany method.
    /// </summary>
    [Fact]
    public void IContPAQiContabilidadSdk_Should_Have_OpenCompany_Method()
    {
        var method = typeof(IContPAQiContabilidadSdk).GetMethod("OpenCompany");
        method.Should().NotBeNull();
        method!.ReturnType.Should().Be(typeof(bool));
    }

    /// <summary>
    /// T007.3.2: ContPAQiContabilidadSdk should implement interface.
    /// </summary>
    [Fact]
    public void ContPAQiContabilidadSdk_Should_Implement_Interface()
    {
        var sdk = new ContPAQiContabilidadSdk();
        sdk.Should().BeAssignableTo<IContPAQiContabilidadSdk>();
    }

    #endregion

    #region T007.3.4 - SDK Detection Logic

    /// <summary>
    /// T007.3.4: SdkDetector class should exist.
    /// </summary>
    [Fact]
    public void SdkDetector_Class_Should_Exist()
    {
        typeof(SdkDetector).Should().NotBeNull();
    }

    /// <summary>
    /// T007.3.4: SdkDetector should have IsComercialSdkInstalled method.
    /// </summary>
    [Fact]
    public void SdkDetector_Should_Have_IsComercialSdkInstalled_Method()
    {
        var method = typeof(SdkDetector).GetMethod("IsComercialSdkInstalled");
        method.Should().NotBeNull();
        method!.ReturnType.Should().Be(typeof(bool));
    }

    /// <summary>
    /// T007.3.4: SdkDetector should have IsContabilidadSdkInstalled method.
    /// </summary>
    [Fact]
    public void SdkDetector_Should_Have_IsContabilidadSdkInstalled_Method()
    {
        var method = typeof(SdkDetector).GetMethod("IsContabilidadSdkInstalled");
        method.Should().NotBeNull();
        method!.ReturnType.Should().Be(typeof(bool));
    }

    /// <summary>
    /// T007.3.4: SdkDetector should have GetComercialSdkVersion method.
    /// </summary>
    [Fact]
    public void SdkDetector_Should_Have_GetComercialSdkVersion_Method()
    {
        var method = typeof(SdkDetector).GetMethod("GetComercialSdkVersion");
        method.Should().NotBeNull();
        method!.ReturnType.Should().Be(typeof(string));
    }

    /// <summary>
    /// T007.3.4: SdkDetector should have GetContabilidadSdkVersion method.
    /// </summary>
    [Fact]
    public void SdkDetector_Should_Have_GetContabilidadSdkVersion_Method()
    {
        var method = typeof(SdkDetector).GetMethod("GetContabilidadSdkVersion");
        method.Should().NotBeNull();
        method!.ReturnType.Should().Be(typeof(string));
    }

    /// <summary>
    /// T007.3.4: SdkDetector.IsComercialSdkInstalled should return false (stub).
    /// </summary>
    [Fact]
    public void IsComercialSdkInstalled_Should_Return_False_For_Stub()
    {
        var result = SdkDetector.IsComercialSdkInstalled();
        result.Should().BeFalse("stub implementation should return false");
    }

    /// <summary>
    /// T007.3.4: SdkDetector.IsContabilidadSdkInstalled should return false (stub).
    /// </summary>
    [Fact]
    public void IsContabilidadSdkInstalled_Should_Return_False_For_Stub()
    {
        var result = SdkDetector.IsContabilidadSdkInstalled();
        result.Should().BeFalse("stub implementation should return false");
    }

    /// <summary>
    /// T007.3.4: SdkDetector.GetComercialSdkVersion should return null (stub).
    /// </summary>
    [Fact]
    public void GetComercialSdkVersion_Should_Return_Null_For_Stub()
    {
        var result = SdkDetector.GetComercialSdkVersion();
        result.Should().BeNull("stub implementation should return null");
    }

    #endregion

    #region Stub Behavior Tests

    /// <summary>
    /// ContPAQiComercialSdk.Initialize should return false (stub).
    /// </summary>
    [Fact]
    public void ComercialSdk_Initialize_Should_Return_False_For_Stub()
    {
        var sdk = new ContPAQiComercialSdk();
        var result = sdk.Initialize();
        result.Should().BeFalse();
    }

    /// <summary>
    /// ContPAQiComercialSdk.OpenCompany should return false (stub).
    /// </summary>
    [Fact]
    public void ComercialSdk_OpenCompany_Should_Return_False_For_Stub()
    {
        var sdk = new ContPAQiComercialSdk();
        var result = sdk.OpenCompany("TestCompany");
        result.Should().BeFalse();
    }

    /// <summary>
    /// ContPAQiContabilidadSdk.Initialize should return false (stub).
    /// </summary>
    [Fact]
    public void ContabilidadSdk_Initialize_Should_Return_False_For_Stub()
    {
        var sdk = new ContPAQiContabilidadSdk();
        var result = sdk.Initialize();
        result.Should().BeFalse();
    }

    /// <summary>
    /// ContPAQiContabilidadSdk.OpenCompany should return false (stub).
    /// </summary>
    [Fact]
    public void ContabilidadSdk_OpenCompany_Should_Return_False_For_Stub()
    {
        var sdk = new ContPAQiContabilidadSdk();
        var result = sdk.OpenCompany("TestCompany");
        result.Should().BeFalse();
    }

    #endregion

    #region Disposable Tests

    /// <summary>
    /// ContPAQiComercialSdk should implement IDisposable.
    /// </summary>
    [Fact]
    public void ComercialSdk_Should_Implement_IDisposable()
    {
        var sdk = new ContPAQiComercialSdk();
        sdk.Should().BeAssignableTo<IDisposable>();
    }

    /// <summary>
    /// ContPAQiContabilidadSdk should implement IDisposable.
    /// </summary>
    [Fact]
    public void ContabilidadSdk_Should_Implement_IDisposable()
    {
        var sdk = new ContPAQiContabilidadSdk();
        sdk.Should().BeAssignableTo<IDisposable>();
    }

    /// <summary>
    /// ContPAQiComercialSdk.Dispose should not throw.
    /// </summary>
    [Fact]
    public void ComercialSdk_Dispose_Should_Not_Throw()
    {
        var sdk = new ContPAQiComercialSdk();
        var exception = Record.Exception(() => sdk.Dispose());
        exception.Should().BeNull();
    }

    /// <summary>
    /// ContPAQiContabilidadSdk.Dispose should not throw.
    /// </summary>
    [Fact]
    public void ContabilidadSdk_Dispose_Should_Not_Throw()
    {
        var sdk = new ContPAQiContabilidadSdk();
        var exception = Record.Exception(() => sdk.Dispose());
        exception.Should().BeNull();
    }

    #endregion
}
