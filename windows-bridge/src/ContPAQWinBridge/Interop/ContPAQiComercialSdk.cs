using System.Runtime.InteropServices;

namespace ContPAQWinBridge.Interop;

/// <summary>
/// Interface for ContPAQi Comercial SDK operations.
/// </summary>
/// <remarks>
/// T007.3.1: Defines the contract for interacting with ContPAQi Comercial SDK.
/// This interface abstracts the COM interop layer for the commercial module.
/// </remarks>
public interface IContPAQiComercialSdk : IDisposable
{
    /// <summary>
    /// Initializes the ContPAQi Comercial SDK.
    /// </summary>
    /// <returns>True if initialization succeeded.</returns>
    bool Initialize();

    /// <summary>
    /// Terminates the SDK connection and releases resources.
    /// </summary>
    void Terminate();

    /// <summary>
    /// Opens a company database.
    /// </summary>
    /// <param name="companyPath">Path to the company database.</param>
    /// <returns>True if company was opened successfully.</returns>
    bool OpenCompany(string companyPath);

    /// <summary>
    /// Closes the current company database.
    /// </summary>
    void CloseCompany();

    /// <summary>
    /// Gets the last error code from the SDK.
    /// </summary>
    /// <returns>Error code, 0 if no error.</returns>
    int GetLastError();

    /// <summary>
    /// Gets the last error message from the SDK.
    /// </summary>
    /// <returns>Error message or empty string.</returns>
    string GetLastErrorMessage();

    /// <summary>
    /// Gets whether the SDK is currently initialized.
    /// </summary>
    bool IsInitialized { get; }

    /// <summary>
    /// Gets whether a company is currently open.
    /// </summary>
    bool IsCompanyOpen { get; }
}

/// <summary>
/// Stub implementation of ContPAQi Comercial SDK wrapper.
/// </summary>
/// <remarks>
/// T007.3.1: Provides a stub implementation that returns false/null for all operations.
/// Actual COM interop will be implemented when SDK DLLs are available (T007.3.3).
///
/// The real implementation will use COM interop to call:
/// - MGWSetNombrePAQ() - Set product name
/// - MGWAbreEmpresa() - Open company
/// - MGWCierraEmpresa() - Close company
/// - MGWTermina() - Terminate SDK
/// </remarks>
public class ContPAQiComercialSdk : IContPAQiComercialSdk
{
    private bool _disposed;
    private bool _isInitialized;
    private bool _isCompanyOpen;
    private int _lastError;
    private string _lastErrorMessage = string.Empty;

    /// <inheritdoc />
    public bool IsInitialized => _isInitialized;

    /// <inheritdoc />
    public bool IsCompanyOpen => _isCompanyOpen;

    /// <inheritdoc />
    public bool Initialize()
    {
        // Stub implementation
        // Real implementation will:
        // 1. Load SDK DLLs via COM interop
        // 2. Call MGWSetNombrePAQ("ContPAQ i COMERCIAL")
        // 3. Initialize SDK connection

        _lastError = 0;
        _lastErrorMessage = "SDK not available (stub)";
        _isInitialized = false;
        return false;
    }

    /// <inheritdoc />
    public void Terminate()
    {
        // Stub implementation
        // Real implementation will call MGWTermina()

        _isCompanyOpen = false;
        _isInitialized = false;
    }

    /// <inheritdoc />
    public bool OpenCompany(string companyPath)
    {
        if (string.IsNullOrWhiteSpace(companyPath))
        {
            _lastError = (int)SdkErrorCode.ValidationError;
            _lastErrorMessage = "Company path cannot be empty";
            return false;
        }

        // Stub implementation
        // Real implementation will:
        // 1. Call MGWAbreEmpresa(companyPath)
        // 2. Return true on success

        _lastError = (int)SdkErrorCode.NotInitialized;
        _lastErrorMessage = "SDK not initialized (stub)";
        _isCompanyOpen = false;
        return false;
    }

    /// <inheritdoc />
    public void CloseCompany()
    {
        // Stub implementation
        // Real implementation will call MGWCierraEmpresa()

        _isCompanyOpen = false;
    }

    /// <inheritdoc />
    public int GetLastError() => _lastError;

    /// <inheritdoc />
    public string GetLastErrorMessage() => _lastErrorMessage;

    /// <inheritdoc />
    public void Dispose()
    {
        Dispose(true);
        GC.SuppressFinalize(this);
    }

    /// <summary>
    /// Releases SDK resources.
    /// </summary>
    protected virtual void Dispose(bool disposing)
    {
        if (_disposed) return;

        if (disposing)
        {
            Terminate();
        }

        // Release COM objects when implemented
        // Marshal.ReleaseComObject() for any COM references

        _disposed = true;
    }

    /// <summary>
    /// Finalizer.
    /// </summary>
    ~ContPAQiComercialSdk()
    {
        Dispose(false);
    }
}
