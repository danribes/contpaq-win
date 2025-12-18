<#
.SYNOPSIS
    Installs prerequisites for ContPaq-proPDF application.

.DESCRIPTION
    This script checks for and installs required prerequisites:
    - .NET 8.0 Desktop Runtime
    - Visual C++ Redistributable

    Run this script before or during installation to ensure
    all dependencies are met.

.PARAMETER DownloadPath
    Directory for downloading installers. Default: $env:TEMP

.PARAMETER Force
    Install prerequisites even if they appear to be installed.

.EXAMPLE
    .\install-prerequisites.ps1

.EXAMPLE
    .\install-prerequisites.ps1 -Force

.NOTES
    Requires Administrator privileges.
    Downloads from Microsoft official sources.
#>

param(
    [Parameter(Mandatory=$false)]
    [string]$DownloadPath = $env:TEMP,

    [Parameter(Mandatory=$false)]
    [switch]$Force
)

# =============================================================================
# Configuration
# =============================================================================

# .NET 8.0 Desktop Runtime (required for Windows Bridge)
$DotNetUrl = "https://aka.ms/dotnet/8.0/windowsdesktop-runtime-win-x64.exe"
$DotNetInstaller = "dotnet-runtime-8.0-win-x64.exe"
$DotNetMinVersion = "8.0"

# Visual C++ Redistributable 2022 (required for native modules)
$VCRedistUrl = "https://aka.ms/vs/17/release/vc_redist.x64.exe"
$VCRedistInstaller = "vc_redist.x64.exe"

# =============================================================================
# Functions
# =============================================================================

function Write-Log {
    param([string]$Message, [string]$Level = "INFO")
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $color = switch ($Level) {
        "ERROR" { "Red" }
        "WARN" { "Yellow" }
        "SUCCESS" { "Green" }
        default { "White" }
    }
    Write-Host "[$timestamp] [$Level] $Message" -ForegroundColor $color
}

function Test-DotNetRuntime {
    <#
    .SYNOPSIS
        Check if .NET 8.0 Desktop Runtime is installed.
    #>
    try {
        # Check for .NET Desktop Runtime via dotnet command
        $runtimes = & dotnet --list-runtimes 2>$null

        if ($runtimes) {
            $desktopRuntime = $runtimes | Where-Object { $_ -match "Microsoft\.WindowsDesktop\.App 8\." }
            if ($desktopRuntime) {
                Write-Log ".NET 8.0 Desktop Runtime found: $($desktopRuntime[0])"
                return $true
            }
        }

        # Alternative check via registry
        $regPath = "HKLM:\SOFTWARE\dotnet\Setup\InstalledVersions\x64\sharedfx\Microsoft.WindowsDesktop.App"
        if (Test-Path $regPath) {
            $versions = Get-ChildItem $regPath | Where-Object { $_.PSChildName -like "8.*" }
            if ($versions) {
                Write-Log ".NET 8.0 Desktop Runtime found in registry"
                return $true
            }
        }

        return $false
    }
    catch {
        return $false
    }
}

function Test-VCRedist {
    <#
    .SYNOPSIS
        Check if Visual C++ Redistributable 2022 (x64) is installed.
    #>
    try {
        # Check for VC++ 2022 in registry (or 2015-2022 which is cumulative)
        $regPaths = @(
            "HKLM:\SOFTWARE\Microsoft\VisualStudio\14.0\VC\Runtimes\x64",
            "HKLM:\SOFTWARE\WOW6432Node\Microsoft\VisualStudio\14.0\VC\Runtimes\x64"
        )

        foreach ($path in $regPaths) {
            if (Test-Path $path) {
                $installed = Get-ItemProperty -Path $path -ErrorAction SilentlyContinue
                if ($installed.Installed -eq 1) {
                    $version = $installed.Version
                    Write-Log "Visual C++ Redistributable found: $version"
                    return $true
                }
            }
        }

        # Alternative: Check for vcruntime140.dll
        $dllPath = "$env:SystemRoot\System32\vcruntime140.dll"
        if (Test-Path $dllPath) {
            Write-Log "vcruntime140.dll found"
            return $true
        }

        return $false
    }
    catch {
        return $false
    }
}

function Download-File {
    param(
        [string]$Url,
        [string]$OutFile
    )

    Write-Log "Downloading: $Url"
    try {
        $ProgressPreference = 'SilentlyContinue'
        Invoke-WebRequest -Uri $Url -OutFile $OutFile -UseBasicParsing
        Write-Log "Downloaded: $OutFile" "SUCCESS"
        return $true
    }
    catch {
        Write-Log "Download failed: $_" "ERROR"
        return $false
    }
}

function Install-DotNetRuntime {
    <#
    .SYNOPSIS
        Download and install .NET 8.0 Desktop Runtime.
    #>
    Write-Log "Installing .NET 8.0 Desktop Runtime..."

    $installerPath = Join-Path $DownloadPath $DotNetInstaller

    # Download
    if (-not (Test-Path $installerPath)) {
        if (-not (Download-File -Url $DotNetUrl -OutFile $installerPath)) {
            return $false
        }
    }

    # Install silently
    Write-Log "Running .NET installer (silent)..."
    $process = Start-Process -FilePath $installerPath -ArgumentList "/install", "/quiet", "/norestart" -Wait -PassThru

    if ($process.ExitCode -eq 0 -or $process.ExitCode -eq 3010) {
        Write-Log ".NET 8.0 Desktop Runtime installed successfully" "SUCCESS"
        return $true
    }
    else {
        Write-Log ".NET installation failed with code: $($process.ExitCode)" "ERROR"
        return $false
    }
}

function Install-VCRedist {
    <#
    .SYNOPSIS
        Download and install Visual C++ Redistributable.
    #>
    Write-Log "Installing Visual C++ Redistributable..."

    $installerPath = Join-Path $DownloadPath $VCRedistInstaller

    # Download
    if (-not (Test-Path $installerPath)) {
        if (-not (Download-File -Url $VCRedistUrl -OutFile $installerPath)) {
            return $false
        }
    }

    # Install silently
    Write-Log "Running VC++ installer (silent)..."
    $process = Start-Process -FilePath $installerPath -ArgumentList "/install", "/quiet", "/norestart" -Wait -PassThru

    if ($process.ExitCode -eq 0 -or $process.ExitCode -eq 3010) {
        Write-Log "Visual C++ Redistributable installed successfully" "SUCCESS"
        return $true
    }
    else {
        Write-Log "VC++ installation failed with code: $($process.ExitCode)" "ERROR"
        return $false
    }
}

# =============================================================================
# Main Script
# =============================================================================

Write-Log "ContPaq-proPDF Prerequisites Installer"
Write-Log "===================================="
Write-Log ""

# Check admin rights
$isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Log "This script requires Administrator privileges." "ERROR"
    exit 1
}

$needsRestart = $false

# Check and install .NET Runtime
Write-Log "Checking .NET 8.0 Desktop Runtime..."
if ($Force -or -not (Test-DotNetRuntime)) {
    if (-not $Force) {
        Write-Log ".NET 8.0 Desktop Runtime not found" "WARN"
    }

    if (Install-DotNetRuntime) {
        $needsRestart = $true
    }
    else {
        Write-Log "Failed to install .NET Runtime" "ERROR"
        exit 1
    }
}
else {
    Write-Log ".NET 8.0 Desktop Runtime is already installed" "SUCCESS"
}

Write-Log ""

# Check and install VC++ Redistributable
Write-Log "Checking Visual C++ Redistributable..."
if ($Force -or -not (Test-VCRedist)) {
    if (-not $Force) {
        Write-Log "Visual C++ Redistributable not found" "WARN"
    }

    if (Install-VCRedist) {
        # VC++ rarely needs restart
    }
    else {
        Write-Log "Failed to install VC++ Redistributable" "ERROR"
        exit 1
    }
}
else {
    Write-Log "Visual C++ Redistributable is already installed" "SUCCESS"
}

Write-Log ""
Write-Log "===================================="
Write-Log "Prerequisites installation complete" "SUCCESS"
Write-Log "===================================="

if ($needsRestart) {
    Write-Log ""
    Write-Log "NOTE: A system restart may be required." "WARN"
}

exit 0
