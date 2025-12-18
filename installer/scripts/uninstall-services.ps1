<#
.SYNOPSIS
    Uninstalls ContPaq-proPDF services.

.DESCRIPTION
    This script stops and removes the AI service and Windows Bridge
    services. It should be run before uninstalling the application.

.PARAMETER RemoveLogs
    If specified, also removes log files.

.PARAMETER InstallDir
    Installation directory. Default: Script location's parent.

.EXAMPLE
    .\uninstall-services.ps1

.EXAMPLE
    .\uninstall-services.ps1 -RemoveLogs

.NOTES
    Requires Administrator privileges.
#>

param(
    [Parameter(Mandatory=$false)]
    [switch]$RemoveLogs,

    [Parameter(Mandatory=$false)]
    [string]$InstallDir
)

# =============================================================================
# Configuration
# =============================================================================

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
if (-not $InstallDir) {
    $InstallDir = Split-Path -Parent $ScriptDir
}

$NssmPath = Join-Path $InstallDir "tools\nssm.exe"
$LogDir = "$env:PROGRAMDATA\ContPaq-proPDF\logs"

$AIServiceName = "ContPaqProPDFAIService"
$BridgeServiceName = "ContPaqProPDFBridge"

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

function Remove-AIService {
    <#
    .SYNOPSIS
        Remove AI Service.
    #>
    if (-not (Test-ServiceExists -Name $AIServiceName)) {
        Write-Log "AI Service not installed"
        return $true
    }

    Write-Log "Removing AI Service: $AIServiceName"

    # Try NSSM first
    if (Test-Path $NssmPath) {
        & $NssmPath stop $AIServiceName 2>$null
        Start-Sleep -Seconds 2
        & $NssmPath remove $AIServiceName confirm 2>$null
    }
    else {
        # Fallback to sc.exe
        Stop-Service -Name $AIServiceName -Force -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 2
        sc.exe delete $AIServiceName 2>$null
    }

    Start-Sleep -Seconds 2

    if (Test-ServiceExists -Name $AIServiceName) {
        Write-Log "Failed to remove AI Service. Restart may be required." "WARN"
        return $false
    }

    Write-Log "AI Service removed" "SUCCESS"
    return $true
}

function Remove-BridgeService {
    <#
    .SYNOPSIS
        Remove Windows Bridge Service.
    #>
    if (-not (Test-ServiceExists -Name $BridgeServiceName)) {
        Write-Log "Windows Bridge not installed"
        return $true
    }

    Write-Log "Removing Windows Bridge: $BridgeServiceName"

    # Stop service
    Stop-Service -Name $BridgeServiceName -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2

    # Remove service
    sc.exe delete $BridgeServiceName 2>$null

    Start-Sleep -Seconds 2

    if (Test-ServiceExists -Name $BridgeServiceName) {
        Write-Log "Failed to remove Windows Bridge. Restart may be required." "WARN"
        return $false
    }

    Write-Log "Windows Bridge removed" "SUCCESS"
    return $true
}

# =============================================================================
# Main Script
# =============================================================================

Write-Log "ContPaq-proPDF Service Uninstaller"
Write-Log "================================"
Write-Log ""

# Check admin rights
$isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole(
    [Security.Principal.WindowsBuiltInRole]::Administrator
)
if (-not $isAdmin) {
    Write-Log "This script requires Administrator privileges." "ERROR"
    exit 1
}

# Remove services
$aiRemoved = Remove-AIService
$bridgeRemoved = Remove-BridgeService

# Remove logs if requested
if ($RemoveLogs) {
    Write-Log ""
    if (Test-Path $LogDir) {
        Write-Log "Removing log directory: $LogDir"
        Remove-Item -Path $LogDir -Recurse -Force -ErrorAction SilentlyContinue
        Write-Log "Logs removed"
    }
}
else {
    Write-Log ""
    Write-Log "Log files preserved at: $LogDir"
    Write-Log "Run with -RemoveLogs to delete them."
}

Write-Log ""
Write-Log "================================"
if ($aiRemoved -and $bridgeRemoved) {
    Write-Log "Services uninstalled successfully" "SUCCESS"
    exit 0
}
else {
    Write-Log "Some services may require restart to fully remove" "WARN"
    exit 0
}
