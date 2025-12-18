<#
.SYNOPSIS
    Build script for ContPAQ-Win installer.

.DESCRIPTION
    This script automates the complete build process for ContPAQ-Win:
    1. Checks for required tools (Python, Node.js, .NET SDK, Inno Setup)
    2. Builds the AI Service executable (PyInstaller)
    3. Builds the Windows Bridge (.NET publish)
    4. Builds the Electron desktop app
    5. Compiles the Inno Setup installer

.PARAMETER SkipPrerequisiteCheck
    Skip checking for required tools.

.PARAMETER SkipAIService
    Skip building the AI Service.

.PARAMETER SkipBridge
    Skip building the Windows Bridge.

.PARAMETER SkipDesktopApp
    Skip building the Desktop App.

.PARAMETER SkipInstaller
    Skip building the installer (only build components).

.PARAMETER Clean
    Clean build artifacts before building.

.EXAMPLE
    .\build.ps1
    Build everything from scratch.

.EXAMPLE
    .\build.ps1 -SkipAIService -SkipBridge
    Only build the Desktop App and installer.

.EXAMPLE
    .\build.ps1 -Clean
    Clean and rebuild everything.

.NOTES
    Run this script from the repository root directory.
    Requires: Python 3.11+, Node.js 20+, .NET 8 SDK, Inno Setup 6.x
#>

param(
    [switch]$SkipPrerequisiteCheck,
    [switch]$SkipAIService,
    [switch]$SkipBridge,
    [switch]$SkipDesktopApp,
    [switch]$SkipInstaller,
    [switch]$Clean
)

# =============================================================================
# Configuration
# =============================================================================

$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"

$ScriptDir = $PSScriptRoot
if (-not $ScriptDir) {
    $ScriptDir = Get-Location
}

# Paths
$RootDir = $ScriptDir
$AIServiceDir = Join-Path $RootDir "ai-service"
$BridgeDir = Join-Path $RootDir "windows-bridge\src"
$DesktopAppDir = Join-Path $RootDir "desktop-app"
$InstallerDir = Join-Path $RootDir "installer"

# Output paths
$AIServiceDist = Join-Path $AIServiceDir "dist"
$BridgePublish = Join-Path $RootDir "windows-bridge\src\ContPAQWinBridge\bin\publish\win-x64"
$DesktopAppRelease = Join-Path $DesktopAppDir "release\win-unpacked"
$InstallerOutput = Join-Path $InstallerDir "output"

# =============================================================================
# Helper Functions
# =============================================================================

function Write-Log {
    param(
        [string]$Message,
        [string]$Level = "INFO"
    )
    $timestamp = Get-Date -Format "HH:mm:ss"
    $color = switch ($Level) {
        "ERROR" { "Red" }
        "WARN" { "Yellow" }
        "SUCCESS" { "Green" }
        "STEP" { "Cyan" }
        default { "White" }
    }
    Write-Host "[$timestamp] " -NoNewline -ForegroundColor DarkGray
    Write-Host "[$Level] " -NoNewline -ForegroundColor $color
    Write-Host $Message
}

function Write-Step {
    param([string]$Message)
    Write-Host ""
    Write-Host "=" * 70 -ForegroundColor Cyan
    Write-Log $Message "STEP"
    Write-Host "=" * 70 -ForegroundColor Cyan
}

function Test-Command {
    param([string]$Command)
    $null = Get-Command $Command -ErrorAction SilentlyContinue
    return $?
}

function Get-CommandVersion {
    param([string]$Command, [string]$VersionArg = "--version")
    try {
        $output = & $Command $VersionArg 2>&1 | Select-Object -First 1
        return $output
    }
    catch {
        return "Not found"
    }
}

# =============================================================================
# Prerequisite Checks
# =============================================================================

function Test-Prerequisites {
    Write-Step "Checking Prerequisites"

    $allGood = $true

    # Python
    if (Test-Command "python") {
        $version = Get-CommandVersion "python" "--version"
        Write-Log "Python: $version" "SUCCESS"
    }
    else {
        Write-Log "Python: Not found - Install from https://python.org" "ERROR"
        $allGood = $false
    }

    # PyInstaller
    if (Test-Command "pyinstaller") {
        $version = Get-CommandVersion "pyinstaller" "--version"
        Write-Log "PyInstaller: $version" "SUCCESS"
    }
    else {
        Write-Log "PyInstaller: Not found - Run: pip install pyinstaller" "WARN"
        # Will try to install later
    }

    # Node.js
    if (Test-Command "node") {
        $version = Get-CommandVersion "node" "--version"
        Write-Log "Node.js: $version" "SUCCESS"
    }
    else {
        Write-Log "Node.js: Not found - Install from https://nodejs.org" "ERROR"
        $allGood = $false
    }

    # npm
    if (Test-Command "npm") {
        $version = Get-CommandVersion "npm" "--version"
        Write-Log "npm: $version" "SUCCESS"
    }
    else {
        Write-Log "npm: Not found" "ERROR"
        $allGood = $false
    }

    # .NET SDK
    if (Test-Command "dotnet") {
        $version = Get-CommandVersion "dotnet" "--version"
        Write-Log ".NET SDK: $version" "SUCCESS"
    }
    else {
        Write-Log ".NET SDK: Not found - Install from https://dot.net" "ERROR"
        $allGood = $false
    }

    # Inno Setup
    $isccPaths = @(
        "iscc",
        "${env:ProgramFiles(x86)}\Inno Setup 6\ISCC.exe",
        "${env:ProgramFiles}\Inno Setup 6\ISCC.exe"
    )

    $isccFound = $false
    foreach ($path in $isccPaths) {
        if (Test-Path $path -ErrorAction SilentlyContinue) {
            $script:IsccPath = $path
            Write-Log "Inno Setup: Found at $path" "SUCCESS"
            $isccFound = $true
            break
        }
        if (Test-Command $path) {
            $script:IsccPath = $path
            Write-Log "Inno Setup: Found" "SUCCESS"
            $isccFound = $true
            break
        }
    }

    if (-not $isccFound) {
        Write-Log "Inno Setup: Not found - Install from https://jrsoftware.org/isinfo.php" "ERROR"
        $allGood = $false
    }

    if (-not $allGood) {
        Write-Log "Some prerequisites are missing. Please install them and try again." "ERROR"
        exit 1
    }

    Write-Log "All prerequisites satisfied!" "SUCCESS"
}

# =============================================================================
# Clean
# =============================================================================

function Invoke-Clean {
    Write-Step "Cleaning Build Artifacts"

    $dirsToClean = @(
        $AIServiceDist,
        (Join-Path $AIServiceDir "build"),
        (Join-Path $AIServiceDir "*.spec"),
        $BridgePublish,
        (Join-Path $BridgeDir "ContPAQWinBridge\bin"),
        (Join-Path $BridgeDir "ContPAQWinBridge\obj"),
        (Join-Path $DesktopAppDir "release"),
        (Join-Path $DesktopAppDir "dist"),
        $InstallerOutput
    )

    foreach ($dir in $dirsToClean) {
        if (Test-Path $dir) {
            Write-Log "Removing: $dir"
            Remove-Item -Path $dir -Recurse -Force -ErrorAction SilentlyContinue
        }
    }

    Write-Log "Clean complete" "SUCCESS"
}

# =============================================================================
# Build AI Service
# =============================================================================

function Build-AIService {
    Write-Step "Building AI Service (Python)"

    Push-Location $AIServiceDir
    try {
        # Create/activate virtual environment
        if (-not (Test-Path ".venv")) {
            Write-Log "Creating virtual environment..."
            python -m venv .venv
        }

        # Activate and install dependencies
        Write-Log "Installing dependencies..."
        & .\.venv\Scripts\python.exe -m pip install --upgrade pip -q
        & .\.venv\Scripts\pip.exe install -r requirements.txt -q
        & .\.venv\Scripts\pip.exe install pyinstaller -q

        # Build executable
        Write-Log "Building executable with PyInstaller..."
        & .\.venv\Scripts\pyinstaller.exe `
            --onefile `
            --name contpaq-ai-service `
            --distpath dist `
            --workpath build `
            --specpath . `
            --clean `
            --noconfirm `
            src\main.py

        if (Test-Path "dist\contpaq-ai-service.exe") {
            $size = (Get-Item "dist\contpaq-ai-service.exe").Length / 1MB
            Write-Log "AI Service built: dist\contpaq-ai-service.exe ($([math]::Round($size, 2)) MB)" "SUCCESS"
        }
        else {
            throw "PyInstaller failed to create executable"
        }
    }
    finally {
        Pop-Location
    }
}

# =============================================================================
# Build Windows Bridge
# =============================================================================

function Build-Bridge {
    Write-Step "Building Windows Bridge (.NET)"

    Push-Location $BridgeDir
    try {
        Write-Log "Restoring NuGet packages..."
        dotnet restore ContPAQWinBridge\ContPAQWinBridge.csproj

        Write-Log "Publishing release build..."
        dotnet publish ContPAQWinBridge\ContPAQWinBridge.csproj `
            -c Release `
            -r win-x64 `
            --self-contained true `
            -o ContPAQWinBridge\bin\publish\win-x64 `
            /p:PublishSingleFile=true `
            /p:IncludeNativeLibrariesForSelfExtract=true

        $exePath = "ContPAQWinBridge\bin\publish\win-x64\ContPAQWinBridge.exe"
        if (Test-Path $exePath) {
            $size = (Get-Item $exePath).Length / 1MB
            Write-Log "Windows Bridge built: $exePath ($([math]::Round($size, 2)) MB)" "SUCCESS"
        }
        else {
            throw "dotnet publish failed to create executable"
        }
    }
    finally {
        Pop-Location
    }
}

# =============================================================================
# Build Desktop App
# =============================================================================

function Build-DesktopApp {
    Write-Step "Building Desktop App (Electron)"

    Push-Location $DesktopAppDir
    try {
        # Install dependencies
        Write-Log "Installing npm dependencies..."
        npm install --silent

        # Build TypeScript/React
        Write-Log "Building application..."
        npm run build

        # Package with Electron Builder
        Write-Log "Packaging with Electron Builder..."
        npm run package

        $appPath = "release\win-unpacked\ContPAQ Win.exe"
        if (Test-Path $appPath) {
            Write-Log "Desktop App built: release\win-unpacked\" "SUCCESS"
        }
        else {
            # Check alternative paths
            $altPaths = Get-ChildItem -Path "release" -Filter "*.exe" -Recurse -ErrorAction SilentlyContinue
            if ($altPaths) {
                Write-Log "Desktop App built: $($altPaths[0].Directory)" "SUCCESS"
            }
            else {
                throw "Electron Builder failed to create application"
            }
        }
    }
    finally {
        Pop-Location
    }
}

# =============================================================================
# Build Installer
# =============================================================================

function Build-Installer {
    Write-Step "Building Installer (Inno Setup)"

    # Verify all components exist
    Write-Log "Verifying build artifacts..."

    $artifacts = @(
        @{ Path = (Join-Path $AIServiceDist "contpaq-ai-service.exe"); Name = "AI Service" },
        @{ Path = (Join-Path $BridgePublish "ContPAQWinBridge.exe"); Name = "Windows Bridge" }
    )

    # Check for desktop app (might be in different location)
    $desktopExe = Get-ChildItem -Path (Join-Path $DesktopAppDir "release") -Filter "*.exe" -Recurse -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($desktopExe) {
        Write-Log "Desktop App: $($desktopExe.FullName)" "SUCCESS"
    }
    else {
        Write-Log "Desktop App executable not found in release folder" "WARN"
    }

    foreach ($artifact in $artifacts) {
        if (Test-Path $artifact.Path) {
            Write-Log "$($artifact.Name): $($artifact.Path)" "SUCCESS"
        }
        else {
            Write-Log "$($artifact.Name): Not found at $($artifact.Path)" "ERROR"
            throw "Missing build artifact: $($artifact.Name)"
        }
    }

    # Create output directory
    if (-not (Test-Path $InstallerOutput)) {
        New-Item -ItemType Directory -Path $InstallerOutput -Force | Out-Null
    }

    # Run Inno Setup compiler
    Push-Location $InstallerDir
    try {
        Write-Log "Compiling installer..."
        & $script:IsccPath contpaq-win.iss

        $installer = Get-ChildItem -Path $InstallerOutput -Filter "*.exe" | Select-Object -First 1
        if ($installer) {
            $size = $installer.Length / 1MB
            Write-Log "Installer created: $($installer.FullName) ($([math]::Round($size, 2)) MB)" "SUCCESS"
        }
        else {
            throw "Inno Setup failed to create installer"
        }
    }
    finally {
        Pop-Location
    }
}

# =============================================================================
# Main
# =============================================================================

$startTime = Get-Date

Write-Host ""
Write-Host "╔══════════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                    ContPAQ-Win Build Script                          ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Check we're in the right directory
if (-not (Test-Path (Join-Path $RootDir "installer\contpaq-win.iss"))) {
    Write-Log "Please run this script from the repository root directory." "ERROR"
    exit 1
}

# Run steps
if (-not $SkipPrerequisiteCheck) {
    Test-Prerequisites
}

if ($Clean) {
    Invoke-Clean
}

if (-not $SkipAIService) {
    Build-AIService
}

if (-not $SkipBridge) {
    Build-Bridge
}

if (-not $SkipDesktopApp) {
    Build-DesktopApp
}

if (-not $SkipInstaller) {
    Build-Installer
}

# Summary
$elapsed = (Get-Date) - $startTime
Write-Host ""
Write-Host "╔══════════════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║                        BUILD COMPLETE!                               ║" -ForegroundColor Green
Write-Host "╚══════════════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Log "Total time: $([math]::Round($elapsed.TotalMinutes, 2)) minutes" "SUCCESS"

if (-not $SkipInstaller) {
    $installer = Get-ChildItem -Path $InstallerOutput -Filter "*.exe" -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($installer) {
        Write-Host ""
        Write-Log "Installer location:" "INFO"
        Write-Host "  $($installer.FullName)" -ForegroundColor Yellow
        Write-Host ""
    }
}
