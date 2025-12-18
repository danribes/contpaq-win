<#
.SYNOPSIS
    Downloads Tesseract OCR binaries for bundling with the Electron app.

.DESCRIPTION
    This script downloads Tesseract OCR for Windows along with the required
    language data files (Spanish and English) for invoice OCR processing.

.PARAMETER OutputDir
    Directory to save Tesseract files. Default: ../resources/tesseract

.PARAMETER Version
    Tesseract version to download. Default: 5.3.3

.EXAMPLE
    .\download-tesseract.ps1

.EXAMPLE
    .\download-tesseract.ps1 -Version "5.3.3" -OutputDir "C:\tesseract"

.NOTES
    Requires PowerShell 5.0 or later.
    Downloads from GitHub releases (UB-Mannheim builds).
#>

param(
    [Parameter(Mandatory=$false)]
    [string]$OutputDir,

    [Parameter(Mandatory=$false)]
    [string]$Version = "5.3.3"
)

# =============================================================================
# Configuration
# =============================================================================

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
if (-not $OutputDir) {
    $OutputDir = Join-Path (Split-Path -Parent $ScriptDir) "resources\tesseract"
}

# Tesseract download URL (UB-Mannheim builds for Windows)
$TesseractBaseUrl = "https://github.com/UB-Mannheim/tesseract/releases/download"
$TesseractExeUrl = "$TesseractBaseUrl/v$Version/tesseract-ocr-w64-setup-$Version.exe"

# Language data URLs (tessdata_fast for smaller size)
$TessdataUrl = "https://github.com/tesseract-ocr/tessdata_fast/raw/main"

# Languages to download
$Languages = @("eng", "spa")

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

function Download-File {
    param([string]$Url, [string]$OutFile)

    Write-Log "Downloading: $Url"
    try {
        $ProgressPreference = 'SilentlyContinue'
        Invoke-WebRequest -Uri $Url -OutFile $OutFile -UseBasicParsing
        return $true
    }
    catch {
        Write-Log "Failed to download: $Url - $_" "ERROR"
        return $false
    }
}

function Extract-Tesseract {
    param([string]$InstallerPath, [string]$ExtractDir)

    Write-Log "Extracting Tesseract installer..."

    # Use 7z if available, otherwise try innoextract
    $7zPath = "C:\Program Files\7-Zip\7z.exe"

    if (Test-Path $7zPath) {
        & $7zPath x $InstallerPath -o"$ExtractDir" -y | Out-Null
    }
    elseif (Get-Command "innoextract" -ErrorAction SilentlyContinue) {
        innoextract -d $ExtractDir $InstallerPath
    }
    else {
        Write-Log "Neither 7-Zip nor innoextract found. Manual extraction required." "WARN"
        Write-Log "Please install Tesseract and copy files to: $ExtractDir" "WARN"
        return $false
    }

    return $true
}

# =============================================================================
# Main Script
# =============================================================================

Write-Log "Tesseract OCR Downloader for ContPAQ-Win"
Write-Log "========================================"
Write-Log ""
Write-Log "Version: $Version"
Write-Log "Output: $OutputDir"
Write-Log ""

# Create output directory
if (-not (Test-Path $OutputDir)) {
    New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null
    Write-Log "Created directory: $OutputDir"
}

# Create tessdata subdirectory for language files
$TessdataDir = Join-Path $OutputDir "tessdata"
if (-not (Test-Path $TessdataDir)) {
    New-Item -ItemType Directory -Path $TessdataDir -Force | Out-Null
}

# Download language data files
Write-Log ""
Write-Log "Downloading language data files..."

foreach ($lang in $Languages) {
    $langFile = "$lang.traineddata"
    $langPath = Join-Path $TessdataDir $langFile
    $langUrl = "$TessdataUrl/$langFile"

    if (Test-Path $langPath) {
        Write-Log "  Already exists: $langFile"
    }
    else {
        if (Download-File -Url $langUrl -OutFile $langPath) {
            Write-Log "  Downloaded: $langFile" "SUCCESS"
        }
    }
}

# Download OSD (orientation and script detection) data
$osdFile = "osd.traineddata"
$osdPath = Join-Path $TessdataDir $osdFile
$osdUrl = "$TessdataUrl/$osdFile"

if (-not (Test-Path $osdPath)) {
    if (Download-File -Url $osdUrl -OutFile $osdPath) {
        Write-Log "  Downloaded: $osdFile" "SUCCESS"
    }
}

Write-Log ""
Write-Log "========================================"

# Check if tesseract.exe already exists
$tesseractExe = Join-Path $OutputDir "tesseract.exe"
if (Test-Path $tesseractExe) {
    Write-Log "Tesseract executable already exists" "SUCCESS"
    Write-Log ""
    Write-Log "Output directory: $OutputDir"
    exit 0
}

Write-Log ""
Write-Log "NOTE: Tesseract executable not found."
Write-Log ""
Write-Log "To complete setup, either:"
Write-Log ""
Write-Log "1. Download and install Tesseract from:"
Write-Log "   https://github.com/UB-Mannheim/tesseract/releases"
Write-Log ""
Write-Log "2. Copy the following files to: $OutputDir"
Write-Log "   - tesseract.exe"
Write-Log "   - All DLL files from the Tesseract installation"
Write-Log ""
Write-Log "3. Or install via winget:"
Write-Log "   winget install UB-Mannheim.TesseractOCR"
Write-Log ""
Write-Log "After installation, copy from:"
Write-Log '   C:\Program Files\Tesseract-OCR\'
Write-Log ""
Write-Log "Language data has been downloaded to: $TessdataDir"
Write-Log ""
