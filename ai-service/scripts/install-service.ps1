#Requires -RunAsAdministrator
<#
.SYNOPSIS
    Installs the ContPAQ-Win AI Service as a Windows Service using NSSM.

.DESCRIPTION
    This script uses NSSM (Non-Sucking Service Manager) to install the
    AI invoice processing service as a Windows Service with auto-restart
    capabilities.

.PARAMETER ServicePath
    Path to the contpaq-ai-service.exe executable.
    Default: Looks in the parent dist directory.

.PARAMETER NssmPath
    Path to nssm.exe.
    Default: Looks in the scripts/nssm directory.

.EXAMPLE
    .\install-service.ps1

.EXAMPLE
    .\install-service.ps1 -ServicePath "C:\Program Files\ContPAQ-Win\ai-service\contpaq-ai-service.exe"

.NOTES
    Requires Administrator privileges.
    NSSM must be downloaded separately - see scripts/nssm/README.md
#>

param(
    [Parameter(Mandatory=$false)]
    [string]$ServicePath,

    [Parameter(Mandatory=$false)]
    [string]$NssmPath
)

# =============================================================================
# Configuration
# =============================================================================

$ServiceName = "ContPAQWinAIService"
$DisplayName = "ContPAQ-Win AI Service"
$Description = "AI-powered invoice processing service for ContPAQ-Win. Provides PDF extraction, OCR, and intelligent field recognition for Mexican invoices."
$Host = "127.0.0.1"
$Port = "8000"

# Log directory
$LogDirectory = "$env:PROGRAMDATA\ContPAQ-Win\logs"

# Restart configuration
$RestartDelay = 5000  # 5 seconds in milliseconds
$RestartThrottle = 60000  # 1 minute throttle

# =============================================================================
# Functions
# =============================================================================

function Write-Log {
    param([string]$Message, [string]$Level = "INFO")
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Write-Host "[$timestamp] [$Level] $Message"
}

function Find-Executable {
    param([string]$Name, [string]$DefaultPath)

    if (Test-Path $DefaultPath) {
        return $DefaultPath
    }

    # Try common locations
    $locations = @(
        (Join-Path $PSScriptRoot $Name),
        (Join-Path $PSScriptRoot "nssm\$Name"),
        (Join-Path $PSScriptRoot "..\dist\contpaq-ai-service\$Name")
    )

    foreach ($location in $locations) {
        if (Test-Path $location) {
            return $location
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
        Start-Sleep -Seconds 2
    }
}

# =============================================================================
# Main Script
# =============================================================================

Write-Log "ContPAQ-Win AI Service Installer"
Write-Log "================================="

# Find NSSM
if (-not $NssmPath) {
    $NssmPath = Find-Executable -Name "nssm.exe" -DefaultPath (Join-Path $PSScriptRoot "nssm\nssm.exe")
}

if (-not $NssmPath -or -not (Test-Path $NssmPath)) {
    Write-Log "NSSM not found. Please download it from https://nssm.cc/download" "ERROR"
    Write-Log "Extract nssm.exe to: $PSScriptRoot\nssm\" "ERROR"
    exit 1
}

Write-Log "Using NSSM: $NssmPath"

# Find service executable
if (-not $ServicePath) {
    $ServicePath = Find-Executable -Name "contpaq-ai-service.exe" -DefaultPath (Join-Path $PSScriptRoot "..\dist\contpaq-ai-service\contpaq-ai-service.exe")
}

if (-not $ServicePath -or -not (Test-Path $ServicePath)) {
    Write-Log "Service executable not found." "ERROR"
    Write-Log "Run 'python scripts/build.py' first to create the distribution." "ERROR"
    exit 1
}

$ServicePath = Resolve-Path $ServicePath
$AppDirectory = Split-Path -Parent $ServicePath

Write-Log "Service executable: $ServicePath"
Write-Log "App directory: $AppDirectory"

# Create log directory
if (-not (Test-Path $LogDirectory)) {
    Write-Log "Creating log directory: $LogDirectory"
    New-Item -ItemType Directory -Path $LogDirectory -Force | Out-Null
}

# Stop existing service if running
Stop-ExistingService -Name $ServiceName

# Remove existing service
if (Test-ServiceExists -Name $ServiceName) {
    Write-Log "Removing existing service registration"
    & $NssmPath remove $ServiceName confirm
    Start-Sleep -Seconds 2
}

# Install the service
Write-Log "Installing service: $ServiceName"
& $NssmPath install $ServiceName $ServicePath

if ($LASTEXITCODE -ne 0) {
    Write-Log "Failed to install service" "ERROR"
    exit 1
}

# Configure service display name and description
Write-Log "Configuring service metadata"
& $NssmPath set $ServiceName DisplayName $DisplayName
& $NssmPath set $ServiceName Description $Description

# Configure application directory
Write-Log "Configuring application directory"
& $NssmPath set $ServiceName AppDirectory $AppDirectory

# Configure command line arguments (host and port)
Write-Log "Configuring application arguments"
& $NssmPath set $ServiceName AppParameters "--host $Host --port $Port"

# Configure restart on failure
Write-Log "Configuring auto-restart"
& $NssmPath set $ServiceName AppExit Default Restart
& $NssmPath set $ServiceName AppRestartDelay $RestartDelay
& $NssmPath set $ServiceName AppThrottle $RestartThrottle

# Configure stdout logging
Write-Log "Configuring stdout logging"
& $NssmPath set $ServiceName AppStdout "$LogDirectory\ai-service-stdout.log"
& $NssmPath set $ServiceName AppStdoutCreationDisposition 4  # Append

# Configure stderr logging
Write-Log "Configuring stderr logging"
& $NssmPath set $ServiceName AppStderr "$LogDirectory\ai-service-stderr.log"
& $NssmPath set $ServiceName AppStderrCreationDisposition 4  # Append

# Configure log file rotation
Write-Log "Configuring log rotation"
& $NssmPath set $ServiceName AppRotateFiles 1
& $NssmPath set $ServiceName AppRotateOnline 1
& $NssmPath set $ServiceName AppRotateBytes 10485760  # 10 MB

# Configure startup type (automatic)
Write-Log "Setting startup type to Automatic"
& $NssmPath set $ServiceName Start SERVICE_AUTO_START

# Configure service dependencies (none for AI service)
# The AI service is standalone and doesn't depend on other services

# Start the service
Write-Log "Starting service"
& $NssmPath start $ServiceName

if ($LASTEXITCODE -ne 0) {
    Write-Log "Warning: Service may not have started correctly" "WARN"
    Write-Log "Check logs at: $LogDirectory" "WARN"
}

# Verify service status
Start-Sleep -Seconds 3
$service = Get-Service -Name $ServiceName -ErrorAction SilentlyContinue

if ($service -and $service.Status -eq "Running") {
    Write-Log "Service installed and running successfully!" "SUCCESS"
    Write-Log ""
    Write-Log "Service Details:"
    Write-Log "  Name: $ServiceName"
    Write-Log "  Status: $($service.Status)"
    Write-Log "  URL: http://${Host}:${Port}"
    Write-Log "  Logs: $LogDirectory"
    Write-Log ""
    Write-Log "To test, open: http://${Host}:${Port}/health"
} else {
    Write-Log "Service installed but may not be running" "WARN"
    Write-Log "Check logs at: $LogDirectory"
}
