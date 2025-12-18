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
| Windows Bridge | C# + .NET 8 | ContPAQi SDK integration |
| Database | SQLite | Local data storage |
| Installer | Inno Setup | Windows installer |

## System Requirements

### Minimum Requirements

- **OS**: Windows 10/11 (64-bit)
- **RAM**: 8 GB minimum, 16 GB recommended
- **Storage**: 2 GB for application + space for invoices
- **ContPAQi**: Version 2022 or later installed

### Prerequisites (Auto-installed)

- .NET 8.0 Desktop Runtime
- Visual C++ Redistributable 2022

## Installation

> **Note**: ContPAQ-Win is currently in development. Pre-built installers will be available on the [Releases](https://github.com/danribes/contpaq-win/releases) page once the first stable version is ready. For now, you can build and install locally following the instructions below.

### Install from Source (Current Method)

Since pre-built releases are not yet available, follow these steps to build and install:

1. **Clone the repository** and ensure you have all [Development Prerequisites](#prerequisites)
2. **Build the installer** by running from the repository root:
   ```powershell
   .\build.ps1
   ```
3. **Run the generated installer**:
   ```powershell
   # The installer will be at:
   installer\output\ContPAQ-Win-0.1.0-Setup.exe
   ```
4. **Run the installer as Administrator** and follow the installation wizard
5. **Launch ContPAQ-Win** from the desktop shortcut or Start Menu

For detailed build options, see [Building the Installer](#building-the-installer) below.

### Quick Install (When Releases Available)

Once stable releases are published:

1. Download `ContPAQ-Win-X.X.X-Setup.exe` from the [Releases](https://github.com/danribes/contpaq-win/releases) page
2. Run the installer as Administrator
3. Follow the installation wizard
4. Launch ContPAQ-Win from the desktop shortcut or Start Menu

### What the Installer Does

The installer will:
- Install prerequisites (.NET 8.0, VC++ Redistributable) if needed
- Install the Electron desktop application
- Install AI Service and Windows Bridge as Windows services
- Install Tesseract OCR for scanned document support
- Create desktop and Start Menu shortcuts

### Installation Directory

Default: `C:\Program Files\ContPAQ-Win`

```
ContPAQ-Win/
├── ContPAQ Win.exe      # Main desktop application
├── ai-service/          # AI document processing service
├── windows-bridge/      # ContPAQi SDK bridge
├── tesseract/           # OCR engine
├── tools/               # NSSM service manager
├── scripts/             # Service management scripts
└── logs/                # Application logs
```

### Windows Services

Two services are installed and started automatically:

| Service | Port | Purpose |
|---------|------|---------|
| ContPAQWinAIService | 8000 | AI-powered document processing |
| ContPAQWinBridge | 5000 | ContPAQi SDK integration |

Both services:
- Start automatically with Windows
- Auto-restart on failure
- Listen only on localhost (127.0.0.1)

### Log Files

Logs are stored in:
- `%LOCALAPPDATA%\ContPAQ-Win\Logs\` - Application logs (JSON format)
- `%PROGRAMDATA%\ContPAQ-Win\logs\` - Service stdout/stderr logs

### Uninstallation

1. Use Windows Settings > Apps > ContPAQ-Win > Uninstall, or
2. Run the uninstaller from Start Menu > ContPAQ-Win > Uninstall

The uninstaller will stop and remove both Windows services.

## Development Setup

### Prerequisites

- **Python**: 3.11+
- **Node.js**: 20 LTS+
- **.NET**: 8.0 SDK
- **Git**: 2.40+
- **Inno Setup**: 6.x (for building installer)

### Clone and Setup

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
cd ../windows-bridge/src
dotnet restore
dotnet build
```

### Running in Development

```bash
# Terminal 1: AI Service
cd ai-service
.venv\Scripts\activate
uvicorn main:app --reload --host 127.0.0.1 --port 8000

# Terminal 2: Windows Bridge
cd windows-bridge/src/ContPAQWinBridge
dotnet run

# Terminal 3: Desktop App
cd desktop-app
npm run dev
```

### Building for Production

```bash
# Build AI Service executable
cd ai-service
pyinstaller --onefile --name contpaq-ai-service src/main.py

# Build Windows Bridge
cd windows-bridge/src
dotnet publish -c Release -r win-x64 --self-contained true

# Build Electron app
cd desktop-app
npm run build
npm run package
```

### Building the Installer

#### Option 1: Automated Build Script (Recommended)

Run the PowerShell build script from the repository root:

```powershell
.\build.ps1
```

The script will:
- Check for all required tools
- Build all components (AI Service, Windows Bridge, Desktop App)
- Compile the Inno Setup installer

Options:
```powershell
.\build.ps1 -Clean              # Clean rebuild
.\build.ps1 -SkipAIService      # Skip AI Service build
.\build.ps1 -SkipInstaller      # Only build components, not installer
```

#### Option 2: Manual Build

1. **Install Inno Setup 6.x** from [jrsoftware.org](https://jrsoftware.org/isinfo.php)
2. **Build all components** (see Building for Production above)
3. **Run the Inno Setup compiler**:
   ```powershell
   cd installer
   iscc contpaq-win.iss
   ```

The installer will be created at `installer/output/ContPAQ-Win-X.X.X-Setup.exe`

## Project Structure

```
contpaq-win/
├── ai-service/          # Python AI service
│   ├── src/             # Source code
│   │   ├── api/         # FastAPI routes
│   │   ├── services/    # Business logic
│   │   └── utils/       # Utilities (logging, validation)
│   └── tests/           # Test files
├── desktop-app/         # Electron/React application
│   └── src/
│       ├── main/        # Electron main process
│       └── renderer/    # React UI components
├── windows-bridge/      # C#/.NET ContPAQi bridge
│   └── src/
│       ├── ContPAQWinBridge/        # Main project
│       └── ContPAQWinBridge.Tests/  # Tests
├── database/            # SQLite database
│   ├── migrations/      # Schema migrations
│   └── seed/            # Test data
├── installer/           # Installation files
│   ├── contpaq-win.iss  # Inno Setup script
│   └── scripts/         # Service install scripts
├── specs/               # Feature specifications
└── tests/               # Cross-component tests
```

## Testing

### Run All Tests

```bash
# Python tests
cd ai-service
pytest

# Node.js tests
cd desktop-app
npm test

# .NET tests
cd windows-bridge/src
dotnet test
```

### Run Specific Tests

```bash
# Python - specific module
pytest tests/ai_service/test_T031_1_1_json_logging.py -v

# Node.js - specific test file
npm test -- --testPathPattern="HomePage"

# .NET - specific test class
dotnet test --filter "FullyQualifiedName~LoggingConfigurationTests"
```

## Troubleshooting

### Services Not Starting

1. Check service status:
   ```powershell
   Get-Service ContPAQWinAIService, ContPAQWinBridge
   ```

2. Check logs:
   - `%PROGRAMDATA%\ContPAQ-Win\logs\ai-service-stderr.log`
   - `%LOCALAPPDATA%\ContPAQ-Win\Logs\windows-bridge-*.log`

3. Restart services:
   ```powershell
   Restart-Service ContPAQWinAIService, ContPAQWinBridge
   ```

### ContPAQi Not Detected

- Ensure ContPAQi is installed (version 2022+)
- Check installation path: `C:\Program Files (x86)\Compac` or `C:\Program Files\Compac`
- The application will work but posting to ContPAQi will be unavailable

### Port Conflicts

If ports 5000 or 8000 are in use:
1. Stop conflicting services
2. Or modify ports in service configuration

## Code Style

- **Python**: Black + Ruff (PEP 8)
- **TypeScript**: ESLint + Prettier
- **C#**: .NET conventions

EditorConfig is configured for consistent formatting across editors.

## License

Proprietary - All rights reserved.

## Support

For issues and feature requests, please use the [GitHub Issues](https://github.com/danribes/contpaq-win/issues) page.
