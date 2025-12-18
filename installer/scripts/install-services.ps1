<#
.SYNOPSIS
    Installs and starts ContPAQ-Win services.

.DESCRIPTION
    This script registers and starts the AI service and Windows Bridge
    as Windows services. It should be run after the main installation.

    Services installed:
    - ContPAQWinAIService (AI Service via NSSM)
    - ContPAQWinBridge (Windows Bridge as native service)

.PARAMETER InstallDir
    Installation directory. Default: Script location's parent.

.EXAMPLE
    .\install-services.ps1

.NOTES
    Requires Administrator privileges.
    Must be run from the application installation directory.
#>

param(
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
$LogDir = "$env:PROGRAMDATA\ContPAQ-Win\logs"

# AI Service configuration
$AIServiceName = "ContPAQWinAIService"
$AIServiceExe = Join-Path $InstallDir "ai-service\contpaq-ai-service.exe"
$AIServiceHost = "127.0.0.1"
$AIServicePort = "8000"

# Windows Bridge configuration
$BridgeServiceName = "ContPAQWinBridge"
$BridgeServiceExe = Join-Path $InstallDir "windows-bridge\ContPAQWinBridge.exe"

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

function Install-AIService {
    <#
    .SYNOPSIS
        Install AI Service using NSSM.
    #>
    Write-Log "Installing AI Service: $AIServiceName"

    if (-not (Test-Path $NssmPath)) {
        Write-Log "NSSM not found: $NssmPath" "ERROR"
        return $false
    }

    if (-not (Test-Path $AIServiceExe)) {
        Write-Log "AI Service executable not found: $AIServiceExe" "ERROR"
        return $false
    }

    # Remove existing service if present
    if (Test-ServiceExists -Name $AIServiceName) {
        Write-Log "Removing existing AI Service..."
        & $NssmPath stop $AIServiceName 2>$null
        Start-Sleep -Seconds 2
        & $NssmPath remove $AIServiceName confirm 2>$null
        Start-Sleep -Seconds 2
    }

    # Install service
    & $NssmPath install $AIServiceName $AIServiceExe

    # Configure service
    & $NssmPath set $AIServiceName AppDirectory (Split-Path -Parent $AIServiceExe)
    & $NssmPath set $AIServiceName AppParameters "--host $AIServiceHost --port $AIServicePort"
    & $NssmPath set $AIServiceName Description "ContPAQ-Win AI Service - Document processing with LayoutLMv3"
    & $NssmPath set $AIServiceName DisplayName "ContPAQ-Win AI Service"
    & $NssmPath set $AIServiceName Start SERVICE_AUTO_START

    # Restart configuration
    & $NssmPath set $AIServiceName AppExit Default Restart
    & $NssmPath set $AIServiceName AppRestartDelay 5000
    & $NssmPath set $AIServiceName AppThrottle 60000

    # Logging
    & $NssmPath set $AIServiceName AppStdout "$LogDir\ai-service-stdout.log"
    & $NssmPath set $AIServiceName AppStderr "$LogDir\ai-service-stderr.log"
    & $NssmPath set $AIServiceName AppStdoutCreationDisposition 4
    & $NssmPath set $AIServiceName AppStderrCreationDisposition 4
    & $NssmPath set $AIServiceName AppRotateFiles 1
    & $NssmPath set $AIServiceName AppRotateOnline 1
    & $NssmPath set $AIServiceName AppRotateBytes 10485760

    Write-Log "AI Service installed" "SUCCESS"
    return $true
}

function Install-BridgeService {
    <#
    .SYNOPSIS
        Install Windows Bridge as native Windows Service.
    #>
    Write-Log "Installing Windows Bridge: $BridgeServiceName"

    if (-not (Test-Path $BridgeServiceExe)) {
        Write-Log "Windows Bridge executable not found: $BridgeServiceExe" "ERROR"
        return $false
    }

    # Remove existing service if present
    if (Test-ServiceExists -Name $BridgeServiceName) {
        Write-Log "Removing existing Windows Bridge service..."
        Stop-Service -Name $BridgeServiceName -Force -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 2
        sc.exe delete $BridgeServiceName 2>$null
        Start-Sleep -Seconds 2
    }

    # Install service using New-Service
    $serviceParams = @{
        Name = $BridgeServiceName
        BinaryPathName = $BridgeServiceExe
        DisplayName = "ContPAQ-Win Windows Bridge"
        Description = "API bridge for ContPAQi SDK integration"
        StartupType = "Automatic"
    }

    try {
        New-Service @serviceParams -ErrorAction Stop
    }
    catch {
        Write-Log "Failed to create service: $_" "ERROR"
        return $false
    }

    # Configure failure recovery
    sc.exe failure $BridgeServiceName reset= 86400 actions= restart/5000/restart/5000/restart/5000

    Write-Log "Windows Bridge installed" "SUCCESS"
    return $true
}

function Start-Services {
    <#
    .SYNOPSIS
        Start all ContPAQ-Win services.
    #>
    Write-Log "Starting services..."

    # Start AI Service
    if (Test-ServiceExists -Name $AIServiceName) {
        Write-Log "Starting $AIServiceName..."
        Start-Service -Name $AIServiceName -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 3
    }

    # Start Windows Bridge
    if (Test-ServiceExists -Name $BridgeServiceName) {
        Write-Log "Starting $BridgeServiceName..."
        Start-Service -Name $BridgeServiceName -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 3
    }

    # Verify services are running
    $aiStatus = (Get-Service -Name $AIServiceName -ErrorAction SilentlyContinue).Status
    $bridgeStatus = (Get-Service -Name $BridgeServiceName -ErrorAction SilentlyContinue).Status

    Write-Log "AI Service status: $aiStatus"
    Write-Log "Windows Bridge status: $bridgeStatus"

    return ($aiStatus -eq "Running" -and $bridgeStatus -eq "Running")
}

# =============================================================================
# Main Script
# =============================================================================

Write-Log "ContPAQ-Win Service Installer"
Write-Log "=============================="
Write-Log ""
Write-Log "Install directory: $InstallDir"
Write-Log ""

# Check admin rights
$isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole(
    [Security.Principal.WindowsBuiltInRole]::Administrator
)
if (-not $isAdmin) {
    Write-Log "This script requires Administrator privileges." "ERROR"
    exit 1
}

# Create log directory
if (-not (Test-Path $LogDir)) {
    New-Item -ItemType Directory -Path $LogDir -Force | Out-Null
    Write-Log "Created log directory: $LogDir"
}

# Install services
$aiSuccess = Install-AIService
$bridgeSuccess = Install-BridgeService

if (-not $aiSuccess -or -not $bridgeSuccess) {
    Write-Log "One or more services failed to install" "ERROR"
    exit 1
}

# Start services
Write-Log ""
$started = Start-Services

Write-Log ""
Write-Log "=============================="
if ($started) {
    Write-Log "Services installed and started successfully" "SUCCESS"
    exit 0
}
else {
    Write-Log "Services installed but may not be running" "WARN"
    Write-Log "Check logs at: $LogDir"
    exit 0
}
