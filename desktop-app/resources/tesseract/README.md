# Tesseract OCR Resources

This directory contains Tesseract OCR binaries and language data for the
ContPAQ-Win desktop application.

## Setup Instructions

### Automatic Download (Language Data Only)

Run the download script to get language data files:

```powershell
cd desktop-app\scripts
.\download-tesseract.ps1
```

This downloads:
- `spa.traineddata` - Spanish language model
- `eng.traineddata` - English language model (fallback)
- `osd.traineddata` - Orientation and script detection

### Manual Setup (Full Tesseract Installation)

1. **Download Tesseract** from:
   https://github.com/UB-Mannheim/tesseract/releases

   Or install via winget:
   ```powershell
   winget install UB-Mannheim.TesseractOCR
   ```

2. **Copy files** from `C:\Program Files\Tesseract-OCR\` to this directory:
   - `tesseract.exe`
   - All `.dll` files
   - `tessdata\` folder (or use the downloaded language files)

## Directory Structure

After setup, this directory should contain:

```
tesseract/
├── tesseract.exe           # Main executable
├── *.dll                   # Required DLL files
├── tessdata/
│   ├── spa.traineddata     # Spanish language
│   ├── eng.traineddata     # English language
│   └── osd.traineddata     # Script detection
└── README.md               # This file
```

## Required Files for Bundling

**Minimum files needed:**
- `tesseract.exe`
- `leptonica-*.dll`
- `libarchive-*.dll`
- `libcurl-*.dll`
- `tessdata/spa.traineddata`
- `tessdata/eng.traineddata`

## Version Information

- **Tesseract Version**: 5.3.3 (recommended)
- **Language Data**: tessdata_fast (smaller, faster models)

## Notes

- The download script only downloads language data files
- Binary files must be copied manually due to licensing
- During development, the system-installed Tesseract is used
- In the packaged app, the bundled Tesseract from this directory is used
