#Requires -RunAsAdministrator
<#
.SYNOPSIS
    Uninstalls the ContPaq-proPDF AI Service Windows Service.

.DESCRIPTION
    This script stops and removes the AI service from Windows Services
    using NSSM. Log files are preserved for troubleshooting.

.PARAMETER KeepLogs
    If specified, preserves log files in the log directory.
    Default: Logs are preserved.

.PARAMETER RemoveLogs
    If specified, removes log files along with the service.

.PARAMETER NssmPath
    Path to nssm.exe.
    Default: Looks in the scripts/nssm directory.

.EXAMPLE
    .\uninstall-service.ps1

.EXAMPLE
    .\uninstall-service.ps1 -RemoveLogs

.NOTES
    Requires Administrator privileges.
#>

param(
    [Parameter(Mandatory=$false)]
    [switch]$RemoveLogs,

    [Parameter(Mandatory=$false)]
    [string]$NssmPath
)

# =============================================================================
# Configuration
# =============================================================================

$ServiceName = "ContPaqProPDFAIService"
$LogDirectory = "$env:PROGRAMDATA\ContPaq-proPDF\logs"

# =============================================================================
# Functions
# =============================================================================

function Write-Log {
    param([string]$Message, [string]$Level = "INFO")
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Write-Host "[$timestamp] [$Level] $Message"
}

function Find-Nssm {
    param([string]$DefaultPath)

    if ($DefaultPath -and (Test-Path $DefaultPath)) {
        return $DefaultPath
    }

    $locations = @(
        (Join-Path $PSScriptRoot "nssm\nssm.exe"),
        (Join-Path $PSScriptRoot "nssm.exe"),
        "$env:ProgramFiles\nssm\nssm.exe",
        "$env:ProgramFiles(x86)\nssm\nssm.exe"
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

# =============================================================================
# Main Script
# =============================================================================

Write-Log "ContPaq-proPDF AI Service Uninstaller"
Write-Log "==================================="

# Check if service exists
if (-not (Test-ServiceExists -Name $ServiceName)) {
    Write-Log "Service '$ServiceName' is not installed." "WARN"
    exit 0
}

# Find NSSM
$NssmPath = Find-Nssm -DefaultPath $NssmPath

if (-not $NssmPath) {
    Write-Log "NSSM not found. Attempting to stop and remove using sc.exe..." "WARN"

    # Try using sc.exe as fallback
    Write-Log "Stopping service..."
    sc.exe stop $ServiceName 2>$null
    Start-Sleep -Seconds 3

    Write-Log "Removing service..."
    sc.exe delete $ServiceName 2>$null

    if ($LASTEXITCODE -eq 0) {
        Write-Log "Service removed using sc.exe" "SUCCESS"
    } else {
        Write-Log "Failed to remove service. Try running as Administrator." "ERROR"
        exit 1
    }
} else {
    Write-Log "Using NSSM: $NssmPath"

    # Stop the service
    Write-Log "Stopping service: $ServiceName"
    & $NssmPath stop $ServiceName

    # Wait for service to stop
    Start-Sleep -Seconds 3

    # Remove the service
    Write-Log "Removing service: $ServiceName"
    & $NssmPath remove $ServiceName confirm

    if ($LASTEXITCODE -ne 0) {
        Write-Log "Failed to remove service" "ERROR"
        exit 1
    }
}

# Verify removal
Start-Sleep -Seconds 2
if (Test-ServiceExists -Name $ServiceName) {
    Write-Log "Warning: Service may still exist. Restart may be required." "WARN"
} else {
    Write-Log "Service removed successfully!" "SUCCESS"
}

# Handle logs
if ($RemoveLogs) {
    if (Test-Path $LogDirectory) {
        Write-Log "Removing log directory: $LogDirectory"
        Remove-Item -Path $LogDirectory -Recurse -Force -ErrorAction SilentlyContinue
        Write-Log "Logs removed"
    }
} else {
    Write-Log ""
    Write-Log "Log files preserved at: $LogDirectory"
    Write-Log "Run with -RemoveLogs to delete them."
}

Write-Log ""
Write-Log "Uninstallation complete."
