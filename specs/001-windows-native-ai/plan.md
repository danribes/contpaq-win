# Implementation Plan: Windows-Native AI Invoice Processing

**Branch**: `001-windows-native-ai` | **Date**: 2025-12-15 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-windows-native-ai/spec.md`

## Summary

Build a Windows-native invoice processing application that eliminates Docker dependency while maintaining full AI-powered extraction functionality. The system uses a multi-process architecture with Electron/React desktop UI, Python/FastAPI AI service, and C#/.NET Windows Bridge for ContPAQi SDK integration. Key features include OCR support for scanned PDFs, confidence-based UX with color-coded fields, Spanish-only interface, and duplicate detection with user override.

## Technical Context

**Language/Version**:
- Python 3.11+ (AI Service)
- TypeScript 5.x (Desktop App)
- C# .NET 8.0 (Windows Bridge)

**Primary Dependencies**:
- FastAPI, PyMuPDF, pytesseract, transformers (LayoutLMv3)
- Electron 28+, React 18, Tailwind CSS, react-pdf
- ASP.NET Core 8.0, ContPAQi SDK (COM interop)

**Storage**: SQLite (local), File system (PDFs)

**Testing**:
- pytest (Python)
- Jest + React Testing Library (TypeScript)
- xUnit (C#)

**Target Platform**: Windows 10 (21H2+) / Windows 11, x64 only

**Project Type**: Multi-component desktop application

**Performance Goals**:
- Startup: <45 seconds to ready state
- Extraction: <30 seconds per text-based PDF, <60 seconds for scanned
- SDK calls: <5 seconds for posting

**Constraints**:
- Offline-capable after installation
- localhost-only network binding (127.0.0.1)
- No Docker/WSL/container dependencies
- <500MB installer size (excluding models)

**Scale/Scope**: Single-user desktop application, ~100 invoices/day typical workload

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Windows-Native First | ✅ PASS | All components run natively, NSSM for service management |
| II. Process Architecture | ✅ PASS | Electron + C# Bridge + Python Service on localhost |
| III. Test-First Development | ✅ PASS | TDD workflow defined for all components |
| IV. Confidence-Based UX | ✅ PASS | Green/Orange/Red thresholds implemented |
| V. Security by Default | ✅ PASS | localhost binding, RFC validation, CFDI compliance |

## Project Structure

### Documentation (this feature)

```text
specs/001-windows-native-ai/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Technology decisions
├── data-model.md        # Database schema and entities
├── quickstart.md        # User guide (Spanish)
├── contracts/           # API specifications
│   ├── ai-service-api.yaml
│   └── windows-bridge-api.yaml
├── checklists/
│   └── requirements.md  # Spec quality checklist
└── tasks.md             # Implementation tasks (next step)
```

### Source Code (repository root)

```text
ai-service/
├── src/
│   ├── main.py                 # FastAPI application entry
│   ├── config.py               # Configuration management
│   ├── models/
│   │   ├── __init__.py
│   │   ├── extraction.py       # Pydantic models for extraction
│   │   └── validation.py       # Validation request/response models
│   ├── services/
│   │   ├── __init__.py
│   │   ├── pdf_extractor.py    # PDF text extraction (PyMuPDF)
│   │   ├── ocr_service.py      # Tesseract OCR wrapper
│   │   ├── ai_extractor.py     # LayoutLMv3 inference
│   │   └── validators.py       # RFC and CFDI validation
│   ├── api/
│   │   ├── __init__.py
│   │   ├── routes.py           # API route definitions
│   │   └── middleware.py       # Request logging, CORS
│   └── utils/
│       ├── __init__.py
│       └── confidence.py       # Confidence score utilities
├── tests/
│   ├── conftest.py
│   ├── unit/
│   ├── integration/
│   └── fixtures/               # Sample PDFs for testing
├── requirements.txt
├── requirements-dev.txt
└── pyproject.toml

desktop-app/
├── src/
│   ├── main/                   # Electron main process
│   │   ├── index.ts
│   │   ├── process-manager.ts  # AI service lifecycle
│   │   ├── ipc-handlers.ts     # IPC communication
│   │   └── preload.ts
│   ├── renderer/               # React application
│   │   ├── App.tsx
│   │   ├── components/
│   │   │   ├── InvoiceForm/
│   │   │   │   ├── InvoiceForm.tsx
│   │   │   │   ├── FieldInput.tsx
│   │   │   │   ├── ConfidenceIndicator.tsx
│   │   │   │   └── LineItemsTable.tsx
│   │   │   ├── PDFViewer/
│   │   │   │   ├── PDFViewer.tsx
│   │   │   │   └── BoundingBoxOverlay.tsx
│   │   │   ├── StatusBar/
│   │   │   │   └── StatusBar.tsx
│   │   │   └── common/
│   │   │       ├── Button.tsx
│   │   │       └── Modal.tsx
│   │   ├── pages/
│   │   │   ├── HomePage.tsx
│   │   │   ├── ProcessingPage.tsx
│   │   │   └── SettingsPage.tsx
│   │   ├── services/
│   │   │   ├── ai-service.ts   # AI service API client
│   │   │   ├── bridge-service.ts # Windows Bridge API client
│   │   │   └── database.ts     # SQLite operations
│   │   ├── hooks/
│   │   │   ├── useInvoice.ts
│   │   │   └── useServiceStatus.ts
│   │   ├── i18n/
│   │   │   └── es.json         # Spanish strings
│   │   └── types/
│   │       └── index.ts        # TypeScript type definitions
│   └── shared/
│       └── constants.ts
├── tests/
│   ├── unit/
│   └── e2e/
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── electron-builder.json

windows-bridge/
├── src/
│   ├── ContPAQWinBridge/
│   │   ├── Program.cs
│   │   ├── Startup.cs
│   │   ├── Controllers/
│   │   │   ├── HealthController.cs
│   │   │   ├── CompaniesController.cs
│   │   │   ├── VendorsController.cs
│   │   │   └── EntriesController.cs
│   │   ├── Services/
│   │   │   ├── ISdkService.cs
│   │   │   ├── SdkService.cs
│   │   │   ├── IVendorService.cs
│   │   │   ├── VendorService.cs
│   │   │   ├── IEntryService.cs
│   │   │   └── EntryService.cs
│   │   ├── Models/
│   │   │   ├── Vendor.cs
│   │   │   ├── Entry.cs
│   │   │   └── ApiResponses.cs
│   │   └── Interop/
│   │       ├── ContPAQiComercialSdk.cs
│   │       └── ContPAQiContabilidadSdk.cs
│   └── ContPAQWinBridge.Tests/
│       ├── Controllers/
│       └── Services/
├── ContPAQWinBridge.sln
└── Directory.Build.props

installer/
├── contpaq-win.iss              # Inno Setup script
├── scripts/
│   ├── install-prerequisites.ps1
│   ├── register-service.ps1
│   └── unregister-service.ps1
├── assets/
│   ├── icon.ico
│   └── license.rtf
└── nssm/
    └── nssm.exe                 # Service manager

database/
├── migrations/
│   └── 001_initial_schema.sql
└── seed/
    └── sample_data.sql
```

**Structure Decision**: Multi-component architecture with three separate projects (ai-service, desktop-app, windows-bridge) plus installer. Each component is independently buildable and testable, communicating via HTTP REST on localhost.

## Complexity Tracking

> No constitution violations requiring justification.

| Decision | Rationale | Alternative Considered |
|----------|-----------|----------------------|
| Three separate services | Separation of concerns, language-appropriate tools | Single monolithic .NET app - would lose Python ML ecosystem |
| SQLite instead of file-based JSON | Query support, ACID guarantees, standard tooling | JSON files - no query capability |
| NSSM for Python service | Proven, no code changes needed | pywin32 - requires significant code changes |
