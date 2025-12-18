<#
.SYNOPSIS
    Publishes the ContPAQ-Win Windows Bridge service.

.DESCRIPTION
    This script builds and publishes the Windows Bridge .NET application
    as a self-contained Windows executable. The output is a single .exe
    file that can run without installing .NET runtime.

.PARAMETER Configuration
    Build configuration. Default: Release

.PARAMETER Clean
    Clean build artifacts before publishing.

.PARAMETER OutputDir
    Custom output directory. Default: bin\publish\win-x64

.EXAMPLE
    .\publish.ps1

.EXAMPLE
    .\publish.ps1 -Clean -Configuration Release

.NOTES
    Requires .NET 8 SDK installed.
#>

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("Debug", "Release")]
    [string]$Configuration = "Release",

    [Parameter(Mandatory=$false)]
    [switch]$Clean,

    [Parameter(Mandatory=$false)]
    [string]$OutputDir
)

# =============================================================================
# Configuration
# =============================================================================

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent $ScriptDir
$SrcDir = Join-Path $ProjectRoot "src\ContPAQWinBridge"
$ProjectFile = Join-Path $SrcDir "ContPAQWinBridge.csproj"

if (-not $OutputDir) {
    $OutputDir = Join-Path $SrcDir "bin\publish\win-x64"
}

$RuntimeIdentifier = "win-x64"

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

function Test-DotNetSdk {
    try {
        $version = dotnet --version
        Write-Log "Found .NET SDK: $version"
        return $true
    }
    catch {
        return $false
    }
}

function Get-OutputSize {
    param([string]$Path)
    if (Test-Path $Path) {
        $size = (Get-ChildItem $Path -Recurse | Measure-Object -Property Length -Sum).Sum
        return [math]::Round($size / 1MB, 2)
    }
    return 0
}

# =============================================================================
# Main Script
# =============================================================================

Write-Log "ContPAQ-Win Windows Bridge Publisher"
Write-Log "====================================="
Write-Log ""

# Check prerequisites
Write-Log "Checking prerequisites..."

if (-not (Test-DotNetSdk)) {
    Write-Log ".NET SDK not found. Please install .NET 8 SDK." "ERROR"
    Write-Log "Download from: https://dotnet.microsoft.com/download/dotnet/8.0" "ERROR"
    exit 1
}

if (-not (Test-Path $ProjectFile)) {
    Write-Log "Project file not found: $ProjectFile" "ERROR"
    exit 1
}

Write-Log "Project: $ProjectFile"
Write-Log "Configuration: $Configuration"
Write-Log "Runtime: $RuntimeIdentifier"
Write-Log "Output: $OutputDir"
Write-Log ""

# Clean if requested
if ($Clean) {
    Write-Log "Cleaning build artifacts..."

    $binDir = Join-Path $SrcDir "bin"
    $objDir = Join-Path $SrcDir "obj"

    if (Test-Path $binDir) {
        Remove-Item -Path $binDir -Recurse -Force
        Write-Log "  Removed $binDir"
    }

    if (Test-Path $objDir) {
        Remove-Item -Path $objDir -Recurse -Force
        Write-Log "  Removed $objDir"
    }

    Write-Log "Clean complete"
    Write-Log ""
}

# Restore dependencies
Write-Log "Restoring dependencies..."
dotnet restore $ProjectFile --runtime $RuntimeIdentifier

if ($LASTEXITCODE -ne 0) {
    Write-Log "Restore failed" "ERROR"
    exit 1
}

Write-Log "Restore complete"
Write-Log ""

# Build and publish
Write-Log "Publishing application..."
Write-Log "This may take a few minutes..."

$publishArgs = @(
    "publish"
    $ProjectFile
    "--configuration", $Configuration
    "--runtime", $RuntimeIdentifier
    "--self-contained", "true"
    "--output", $OutputDir
    "-p:PublishSingleFile=true"
    "-p:PublishReadyToRun=true"
    "-p:IncludeNativeLibrariesForSelfExtract=true"
    "-p:EnableCompressionInSingleFile=true"
)

dotnet @publishArgs

if ($LASTEXITCODE -ne 0) {
    Write-Log "Publish failed" "ERROR"
    exit 1
}

Write-Log "Publish complete"
Write-Log ""

# Verify output
Write-Log "Verifying output..."

$exePath = Join-Path $OutputDir "ContPAQWinBridge.exe"

if (-not (Test-Path $exePath)) {
    Write-Log "Executable not found: $exePath" "ERROR"
    exit 1
}

$exeSize = [math]::Round((Get-Item $exePath).Length / 1MB, 2)
Write-Log "  Executable: ContPAQWinBridge.exe ($exeSize MB)"

$totalSize = Get-OutputSize $OutputDir
Write-Log "  Total size: $totalSize MB"

Write-Log ""
Write-Log "====================================="
Write-Log "BUILD SUCCESSFUL" "SUCCESS"
Write-Log "====================================="
Write-Log ""
Write-Log "Output directory: $OutputDir"
Write-Log ""
Write-Log "To run the service:"
Write-Log "  cd `"$OutputDir`""
Write-Log "  .\ContPAQWinBridge.exe"
Write-Log ""
Write-Log "The service will start on http://127.0.0.1:5000"
Write-Log ""
Write-Log "For Windows Service installation, run:"
Write-Log "  .\install-service.ps1"
