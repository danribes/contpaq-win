#Requires -RunAsAdministrator
<#
.SYNOPSIS
    Uninstalls the ContPAQ-Win Windows Bridge Windows Service.

.DESCRIPTION
    This script stops and removes the Windows Bridge service from Windows.
    The application files are not removed - only the service registration.

.PARAMETER KeepLogs
    If specified, preserves log files. This is the default behavior.

.PARAMETER RemoveLogs
    If specified, removes log files along with the service.

.EXAMPLE
    .\uninstall-service.ps1

.EXAMPLE
    .\uninstall-service.ps1 -RemoveLogs

.NOTES
    Requires Administrator privileges.
#>

param(
    [Parameter(Mandatory=$false)]
    [switch]$RemoveLogs
)

# =============================================================================
# Configuration
# =============================================================================

$ServiceName = "ContPAQWinBridge"
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

function Test-ServiceExists {
    param([string]$Name)
    $service = Get-Service -Name $Name -ErrorAction SilentlyContinue
    return $null -ne $service
}

# =============================================================================
# Main Script
# =============================================================================

Write-Log "ContPAQ-Win Windows Bridge Service Uninstaller"
Write-Log "==============================================="
Write-Log ""

# Check if service exists
if (-not (Test-ServiceExists -Name $ServiceName)) {
    Write-Log "Service '$ServiceName' is not installed." "WARN"
    exit 0
}

# Get service info before removal
$service = Get-Service -Name $ServiceName
Write-Log "Found service: $ServiceName"
Write-Log "Current status: $($service.Status)"
Write-Log ""

# Stop the service if running
if ($service.Status -ne "Stopped") {
    Write-Log "Stopping service..."
    try {
        Stop-Service -Name $ServiceName -Force -ErrorAction Stop
        Start-Sleep -Seconds 3
        Write-Log "Service stopped"
    }
    catch {
        Write-Log "Warning: Could not stop service gracefully: $_" "WARN"
        # Try harder
        sc.exe stop $ServiceName 2>$null
        Start-Sleep -Seconds 3
    }
}

# Remove the service
Write-Log "Removing service..."

# Try sc.exe delete (works on all Windows versions)
sc.exe delete $ServiceName 2>$null

if ($LASTEXITCODE -eq 0) {
    Write-Log "Service removed successfully"
}
else {
    # Try Remove-Service (PowerShell 6+)
    try {
        Remove-Service -Name $ServiceName -ErrorAction Stop
        Write-Log "Service removed successfully"
    }
    catch {
        Write-Log "Failed to remove service: $_" "ERROR"
        Write-Log "Try restarting Windows and running this script again." "ERROR"
        exit 1
    }
}

# Verify removal
Start-Sleep -Seconds 2
if (Test-ServiceExists -Name $ServiceName) {
    Write-Log "Warning: Service may still exist. A restart may be required." "WARN"
}
else {
    Write-Log "Service registration removed" "SUCCESS"
}

# Handle logs
Write-Log ""
if ($RemoveLogs) {
    if (Test-Path $LogDirectory) {
        Write-Log "Removing log directory: $LogDirectory"
        Remove-Item -Path $LogDirectory -Recurse -Force -ErrorAction SilentlyContinue
        Write-Log "Logs removed"
    }
}
else {
    if (Test-Path $LogDirectory) {
        Write-Log "Log files preserved at: $LogDirectory"
        Write-Log "Run with -RemoveLogs to delete them."
    }
}

Write-Log ""
Write-Log "==============================================="
Write-Log "UNINSTALLATION COMPLETE" "SUCCESS"
Write-Log "==============================================="
Write-Log ""
Write-Log "The service has been removed."
Write-Log "Application files remain in place."
Write-Log ""
Write-Log "To reinstall, run: .\install-service.ps1"
