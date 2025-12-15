# ContPAQ-Win

Windows-native AI-powered invoice processing for ContPAQi accounting software.

## Overview

ContPAQ-Win is a desktop application that automates invoice data extraction using AI and posts documents directly to ContPAQi. Unlike cloud-based solutions, it runs entirely on Windows without requiring Docker or WSL.

### Key Features

- **AI-Powered Extraction**: Uses LayoutLMv3 for intelligent field extraction from invoices
- **OCR Support**: Handles both text-based and scanned PDF invoices via Tesseract
- **ContPAQi Integration**: Direct posting to ContPAQi via COM SDK
- **Confidence Visualization**: Color-coded confidence scores (green/orange/red)
- **Offline Operation**: Works without internet connection after initial setup
- **Spanish UI**: Full Spanish language interface

## Architecture

ContPAQ-Win uses a multi-process architecture:

```
┌─────────────────────────────────────────────────────────────────┐
│                        Desktop App                               │
│                    (Electron + React)                            │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Upload     │  │   Review &   │  │    Post      │          │
│  │   Invoice    │  │   Correct    │  │   Document   │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
         │                    │                    │
         │ HTTP/REST          │                    │ HTTP/REST
         ▼                    ▼                    ▼
┌─────────────────────┐              ┌─────────────────────┐
│    AI Service       │              │   Windows Bridge    │
│  (Python/FastAPI)   │              │    (C#/.NET)        │
│                     │              │                     │
│  - PDF Processing   │              │  - ContPAQi SDK     │
│  - OCR (Tesseract)  │              │  - COM Interop      │
│  - LayoutLMv3       │              │  - Document Posting │
└─────────────────────┘              └─────────────────────┘
```

### Components

| Component | Technology | Purpose |
|-----------|------------|---------|
| Desktop App | Electron + React + TypeScript | User interface |
| AI Service | Python + FastAPI | Invoice processing & AI |
| Windows Bridge | C# + .NET | ContPAQi SDK integration |
| Database | SQLite | Local data storage |
| Installer | NSSM + PowerShell | Service management |

## Prerequisites

### System Requirements

- **OS**: Windows 10/11 (64-bit)
- **RAM**: 8 GB minimum, 16 GB recommended
- **Storage**: 2 GB for application + space for invoices
- **ContPAQi**: Version 2022 or later installed

### Development Requirements

- **Python**: 3.11+
- **Node.js**: 20 LTS+
- **.NET**: 8.0 SDK
- **Git**: 2.40+

## Installation

### For Users

1. Download the latest release from the Releases page
2. Extract to your preferred location (e.g., `C:\ContPAQWin`)
3. Run `install.ps1` as Administrator
4. Launch ContPAQ-Win from the desktop shortcut

### For Developers

```bash
# Clone the repository
git clone https://github.com/danribes/contpaq-win.git
cd contpaq-win

# Set up AI Service (Python)
cd ai-service
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
pip install -r requirements-dev.txt

# Set up Desktop App (Node.js)
cd ../desktop-app
npm install

# Set up Windows Bridge (.NET)
cd ../windows-bridge
dotnet restore
dotnet build
```

## Project Structure

```
contpaq-win/
├── ai-service/          # Python AI service
│   ├── src/             # Source code
│   └── tests/           # Test files
├── desktop-app/         # Electron/React application
│   └── src/
│       ├── main/        # Electron main process
│       └── renderer/    # React UI
├── windows-bridge/      # C#/.NET ContPAQi bridge
│   └── src/
├── database/            # SQLite database
│   ├── migrations/      # Schema migrations
│   └── seed/            # Test data
├── installer/           # Installation scripts
│   ├── scripts/         # PowerShell scripts
│   └── assets/          # NSSM, icons, etc.
├── specs/               # Feature specifications
└── tests/               # Cross-component tests
```

## Development

### Running Tests

```bash
# All tests
pytest

# Specific component
pytest tests/structure/
pytest ai-service/tests/
```

### Code Style

- **Python**: Black + Ruff (PEP 8)
- **TypeScript**: ESLint + Prettier
- **C#**: .NET conventions

EditorConfig is configured for consistent formatting across editors.

## License

Proprietary - All rights reserved.

## Support

For issues and feature requests, please use the GitHub Issues page.
