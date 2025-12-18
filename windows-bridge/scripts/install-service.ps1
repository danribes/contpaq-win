#Requires -RunAsAdministrator
<#
.SYNOPSIS
    Installs the ContPAQ-Win Windows Bridge as a Windows Service.

.DESCRIPTION
    This script registers the Windows Bridge .NET application as a Windows
    Service using native Windows service management. The service will run
    on localhost:5000 and provide the bridge between the desktop app and
    ContPAQi SDK.

.PARAMETER ServicePath
    Path to the ContPAQWinBridge.exe executable.
    Default: Looks in the publish directory.

.PARAMETER StartupType
    Service startup type. Default: Automatic

.EXAMPLE
    .\install-service.ps1

.EXAMPLE
    .\install-service.ps1 -ServicePath "C:\Program Files\ContPAQ-Win\bridge\ContPAQWinBridge.exe"

.NOTES
    Requires Administrator privileges.
    The service binds to 127.0.0.1:5000 (localhost only) for security.
#>

param(
    [Parameter(Mandatory=$false)]
    [string]$ServicePath,

    [Parameter(Mandatory=$false)]
    [ValidateSet("Automatic", "Manual", "Disabled")]
    [string]$StartupType = "Automatic"
)

# =============================================================================
# Configuration
# =============================================================================

$ServiceName = "ContPAQWinBridge"
$DisplayName = "ContPAQ-Win Windows Bridge"
$Description = "Bridge service connecting ContPAQ-Win desktop application to ContPAQi SDK. Provides REST API for vendor management, entry creation, and duplicate checking."
$Host = "127.0.0.1"
$Port = "5000"

# Log directory
$LogDirectory = "$env:PROGRAMDATA\ContPAQ-Win\logs"

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

function Find-Executable {
    param([string]$DefaultPath)

    if ($DefaultPath -and (Test-Path $DefaultPath)) {
        return $DefaultPath
    }

    $ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
    $locations = @(
        (Join-Path $ScriptDir "..\src\ContPAQWinBridge\bin\publish\win-x64\ContPAQWinBridge.exe"),
        (Join-Path $ScriptDir "..\publish\ContPAQWinBridge.exe"),
        "$env:ProgramFiles\ContPAQ-Win\bridge\ContPAQWinBridge.exe"
    )

    foreach ($location in $locations) {
        if (Test-Path $location) {
            return (Resolve-Path $location).Path
        }
    }

    return $null
}

function Test-ServiceExists {
    param([string]$Name)
    $service = Get-Service -Name $Name -ErrorAction SilentlyContinue
    return $null -ne $service
}

function Stop-ExistingService {
    param([string]$Name)

    if (Test-ServiceExists -Name $Name) {
        Write-Log "Stopping existing service: $Name"
        Stop-Service -Name $Name -Force -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 3
    }
}

function Remove-ExistingService {
    param([string]$Name)

    if (Test-ServiceExists -Name $Name) {
        Write-Log "Removing existing service: $Name"
        # Use sc.exe for removal as Remove-Service requires PS 6+
        sc.exe delete $Name 2>$null
        Start-Sleep -Seconds 2
    }
}

# =============================================================================
# Main Script
# =============================================================================

Write-Log "ContPAQ-Win Windows Bridge Service Installer"
Write-Log "============================================="
Write-Log ""

# Find executable
$ServicePath = Find-Executable -DefaultPath $ServicePath

if (-not $ServicePath) {
    Write-Log "Service executable not found." "ERROR"
    Write-Log "Run '.\publish.ps1' first to build the application." "ERROR"
    Write-Log "Or specify the path with -ServicePath parameter." "ERROR"
    exit 1
}

Write-Log "Service executable: $ServicePath"
Write-Log "Service name: $ServiceName"
Write-Log "Startup type: $StartupType"
Write-Log "Binding: http://${Host}:${Port}"
Write-Log ""

# Create log directory
if (-not (Test-Path $LogDirectory)) {
    Write-Log "Creating log directory: $LogDirectory"
    New-Item -ItemType Directory -Path $LogDirectory -Force | Out-Null
}

# Stop and remove existing service
Stop-ExistingService -Name $ServiceName
Remove-ExistingService -Name $ServiceName

# Create the service using New-Service
Write-Log "Creating Windows Service..."

try {
    $serviceParams = @{
        Name = $ServiceName
        BinaryPathName = "`"$ServicePath`" --urls http://${Host}:${Port}"
        DisplayName = $DisplayName
        Description = $Description
        StartupType = $StartupType
    }

    New-Service @serviceParams -ErrorAction Stop
    Write-Log "Service created successfully"
}
catch {
    Write-Log "Failed to create service: $_" "ERROR"
    exit 1
}

# Configure recovery options (restart on failure)
Write-Log "Configuring recovery options..."

# sc.exe failure <ServiceName> reset= <seconds> actions= <action1>/<delay1>/<action2>/<delay2>/...
# restart service after 5 seconds on first, second, and subsequent failures
sc.exe failure $ServiceName reset= 86400 actions= restart/5000/restart/5000/restart/5000 2>$null

if ($LASTEXITCODE -ne 0) {
    Write-Log "Warning: Could not configure recovery options" "WARN"
}

# Start the service
Write-Log "Starting service..."

try {
    Start-Service -Name $ServiceName -ErrorAction Stop
    Write-Log "Service started"
}
catch {
    Write-Log "Warning: Service may not have started: $_" "WARN"
}

# Verify service status
Start-Sleep -Seconds 3
$service = Get-Service -Name $ServiceName -ErrorAction SilentlyContinue

if ($service -and $service.Status -eq "Running") {
    Write-Log ""
    Write-Log "============================================="
    Write-Log "SERVICE INSTALLED SUCCESSFULLY" "SUCCESS"
    Write-Log "============================================="
    Write-Log ""
    Write-Log "Service Details:"
    Write-Log "  Name: $ServiceName"
    Write-Log "  Status: $($service.Status)"
    Write-Log "  URL: http://${Host}:${Port}"
    Write-Log "  Startup: $StartupType"
    Write-Log ""
    Write-Log "To test, open: http://${Host}:${Port}/health"
    Write-Log ""
    Write-Log "Service management commands:"
    Write-Log "  Start:   Start-Service $ServiceName"
    Write-Log "  Stop:    Stop-Service $ServiceName"
    Write-Log "  Restart: Restart-Service $ServiceName"
    Write-Log "  Status:  Get-Service $ServiceName"
}
else {
    Write-Log ""
    Write-Log "Service installed but may not be running" "WARN"
    Write-Log "Check Windows Event Viewer for errors"
    Write-Log "Or run manually: `"$ServicePath`" --urls http://${Host}:${Port}"
}
