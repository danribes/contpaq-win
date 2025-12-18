using Microsoft.Win32;
using System.Runtime.InteropServices;
using System.Runtime.Versioning;

namespace ContPAQWinBridge.Interop;

/// <summary>
/// Detects ContPAQi SDK installation and version information.
/// </summary>
/// <remarks>
/// T007.3.4: Implements SDK detection logic by checking:
/// - Windows Registry for installation paths
/// - File system for SDK DLLs
/// - COM registration for SDK components
///
/// ContPAQi typically installs SDK components at:
/// - Registry: HKLM\SOFTWARE\Computación en Acción, SA de CV\ContPAQi
/// - Files: C:\Program Files (x86)\Compac\
/// </remarks>
[SupportedOSPlatform("windows")]
public static class SdkDetector
{
    // Registry paths for ContPAQi installation
    private const string ContPAQiRegistryPath = @"SOFTWARE\Computación en Acción, SA de CV\ContPAQi";
    private const string ContPAQiRegistryPath32 = @"SOFTWARE\WOW6432Node\Computación en Acción, SA de CV\ContPAQi";

    // Default installation paths
    private const string DefaultInstallPath = @"C:\Program Files (x86)\Compac";
    private const string ComercialSdkDll = "MGW_SDK.dll";
    private const string ContabilidadSdkDll = "ContpaqiSDK.dll";

    /// <summary>
    /// Checks if ContPAQi Comercial SDK is installed.
    /// </summary>
    /// <returns>True if SDK is installed and available.</returns>
    public static bool IsComercialSdkInstalled()
    {
        // Stub implementation - will check:
        // 1. Registry for installation
        // 2. File system for SDK DLL
        // 3. COM registration

        // In production, would check:
        // - Registry key exists
        // - SDK DLL file exists
        // - COM object can be created

        return false; // Stub: always return false
    }

    /// <summary>
    /// Checks if ContPAQi Contabilidad SDK is installed.
    /// </summary>
    /// <returns>True if SDK is installed and available.</returns>
    public static bool IsContabilidadSdkInstalled()
    {
        // Stub implementation - same checks as Comercial

        return false; // Stub: always return false
    }

    /// <summary>
    /// Gets the installed ContPAQi Comercial SDK version.
    /// </summary>
    /// <returns>Version string or null if not installed.</returns>
    public static string? GetComercialSdkVersion()
    {
        // Stub implementation
        // Real implementation will read version from:
        // - Registry
        // - File version info
        // - SDK API call

        if (!IsComercialSdkInstalled())
        {
            return null;
        }

        return null; // Stub: return null
    }

    /// <summary>
    /// Gets the installed ContPAQi Contabilidad SDK version.
    /// </summary>
    /// <returns>Version string or null if not installed.</returns>
    public static string? GetContabilidadSdkVersion()
    {
        // Stub implementation

        if (!IsContabilidadSdkInstalled())
        {
            return null;
        }

        return null; // Stub: return null
    }

    /// <summary>
    /// Gets the installation path for ContPAQi products.
    /// </summary>
    /// <returns>Installation path or null if not found.</returns>
    public static string? GetInstallationPath()
    {
        // Stub implementation
        // Real implementation will check registry for installation path

        try
        {
            // Check 64-bit registry view
            using var key = Registry.LocalMachine.OpenSubKey(ContPAQiRegistryPath);
            if (key != null)
            {
                var path = key.GetValue("InstallPath") as string;
                if (!string.IsNullOrEmpty(path))
                {
                    return path;
                }
            }

            // Check 32-bit registry view (WOW6432Node)
            using var key32 = Registry.LocalMachine.OpenSubKey(ContPAQiRegistryPath32);
            if (key32 != null)
            {
                var path = key32.GetValue("InstallPath") as string;
                if (!string.IsNullOrEmpty(path))
                {
                    return path;
                }
            }

            // Check default path
            if (Directory.Exists(DefaultInstallPath))
            {
                return DefaultInstallPath;
            }
        }
        catch (Exception)
        {
            // Registry access may fail on non-Windows or without permissions
        }

        return null;
    }

    /// <summary>
    /// Gets detailed SDK installation information.
    /// </summary>
    /// <returns>SDK installation details.</returns>
    public static SdkInstallationInfo GetInstallationInfo()
    {
        return new SdkInstallationInfo
        {
            IsComercialInstalled = IsComercialSdkInstalled(),
            IsContabilidadInstalled = IsContabilidadSdkInstalled(),
            ComercialVersion = GetComercialSdkVersion(),
            ContabilidadVersion = GetContabilidadSdkVersion(),
            InstallationPath = GetInstallationPath(),
            IsWindows = RuntimeInformation.IsOSPlatform(OSPlatform.Windows)
        };
    }
}

/// <summary>
/// Information about ContPAQi SDK installation.
/// </summary>
public record SdkInstallationInfo
{
    /// <summary>
    /// Whether ContPAQi Comercial SDK is installed.
    /// </summary>
    public bool IsComercialInstalled { get; init; }

    /// <summary>
    /// Whether ContPAQi Contabilidad SDK is installed.
    /// </summary>
    public bool IsContabilidadInstalled { get; init; }

    /// <summary>
    /// ContPAQi Comercial SDK version.
    /// </summary>
    public string? ComercialVersion { get; init; }

    /// <summary>
    /// ContPAQi Contabilidad SDK version.
    /// </summary>
    public string? ContabilidadVersion { get; init; }

    /// <summary>
    /// Installation path.
    /// </summary>
    public string? InstallationPath { get; init; }

    /// <summary>
    /// Whether running on Windows (required for SDK).
    /// </summary>
    public bool IsWindows { get; init; }

    /// <summary>
    /// Whether any SDK is available.
    /// </summary>
    public bool IsAnyAvailable => IsComercialInstalled || IsContabilidadInstalled;
}
