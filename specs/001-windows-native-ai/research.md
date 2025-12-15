# Research: Windows-Native AI Invoice Processing

**Feature**: 001-windows-native-ai
**Date**: 2025-12-15
**Status**: Complete

## Technology Decisions

### 1. Python Process Management on Windows

**Decision**: Use NSSM (Non-Sucking Service Manager) for Windows Service wrapper

**Rationale**:
- NSSM is battle-tested for running Python as Windows Service
- Provides automatic restart on failure with configurable retry limits
- Supports stdout/stderr logging out of the box
- No code changes required to existing FastAPI application
- Free and open-source (public domain)

**Alternatives Considered**:
- `pywin32` native Windows Service: More complex, requires code changes
- `sc.exe` direct: Limited restart capabilities, no logging
- Running as background process only: No auto-start on boot, harder to manage

### 2. OCR Engine for Scanned PDFs

**Decision**: Tesseract OCR 5.x with Windows binaries

**Rationale**:
- Industry-standard OCR with excellent accuracy
- Pre-built Windows binaries available (UB Mannheim builds)
- Supports Spanish language pack for Mexican invoices
- Can be bundled with installer (~40MB)
- pytesseract provides clean Python interface

**Alternatives Considered**:
- Windows OCR API (Windows.Media.Ocr): Limited language support, requires UWP
- Amazon Textract: Requires internet, violates offline requirement
- EasyOCR: Larger model size (~700MB), slower inference

### 3. PDF Text Extraction

**Decision**: PyMuPDF (fitz) for text-based PDFs, Tesseract for scanned

**Rationale**:
- PyMuPDF is fastest Python PDF library
- Extracts text with position information (for bounding boxes)
- Detects if PDF is text-based or image-based
- Small footprint, pure Python bindings to MuPDF

**Alternatives Considered**:
- pdfplumber: Slower, less accurate positioning
- PyPDF2: No position extraction
- pdf2image + OCR for all: Unnecessary overhead for text PDFs

### 4. AI Model for Field Extraction

**Decision**: LayoutLMv3 fine-tuned for Mexican CFDI invoices

**Rationale**:
- Document understanding model that uses both text and layout
- Can be run locally on CPU (no GPU required)
- Pre-trained on document extraction tasks
- Supports fine-tuning for specific document types

**Alternatives Considered**:
- GPT-4 Vision API: Requires internet, high latency, cost per call
- Custom regex parsing: Brittle, fails on layout variations
- TATR (Table Transformer): Good for tables only, not header fields

### 5. Desktop Application Framework

**Decision**: Electron with React 18 and TypeScript

**Rationale**:
- Proven stack from original contpaqi project
- Cross-platform potential (future macOS support)
- Rich ecosystem for PDF viewing (react-pdf)
- Native Node.js for process management

**Alternatives Considered**:
- Tauri: Smaller bundle but less mature ecosystem
- .NET MAUI: Would require rewriting entire UI
- Pure WPF: Windows-only, different skill set

### 6. ContPAQi SDK Integration

**Decision**: C# ASP.NET Core wrapper exposing REST API on localhost:5000

**Rationale**:
- ContPAQi SDK is COM-based, best accessed from .NET
- REST API allows language-agnostic integration
- Existing windows-bridge code from original project can be adapted
- .NET 8.0 provides modern async/await patterns

**Alternatives Considered**:
- Python COM interop (pywin32): Unreliable with complex COM objects
- Direct Electron→COM: Node.js COM bindings are poorly maintained
- Embedding .NET in Electron: Complex, hard to debug

### 7. Inter-Process Communication

**Decision**: HTTP REST on localhost (127.0.0.1)

**Rationale**:
- Simple, well-understood protocol
- Easy to debug with standard tools (curl, Postman)
- No special libraries required
- Ports: AI Service (8000), Windows Bridge (5000)

**Alternatives Considered**:
- Named Pipes: More complex, Windows-specific
- gRPC: Overkill for local communication
- WebSockets: Unnecessary for request/response pattern

### 8. Local Data Storage

**Decision**: SQLite for invoice metadata, file system for PDFs

**Rationale**:
- SQLite requires no server, perfect for desktop app
- Single file database, easy to backup
- Excellent Python and TypeScript support
- PDFs stored in user's Documents folder

**Alternatives Considered**:
- IndexedDB only: Limited query capabilities
- PostgreSQL: Overkill, requires separate installation
- JSON files: No query support, scaling issues

### 9. Installer Technology

**Decision**: Inno Setup 6.x

**Rationale**:
- Free, open-source, widely used
- Excellent silent installation support
- Can bundle Python, .NET prerequisites
- Scriptable for complex installation logic
- Already used in original contpaqi project

**Alternatives Considered**:
- WiX Toolset: Steeper learning curve
- NSIS: Less modern, harder scripting
- MSIX: Requires Windows Store or sideloading config

### 10. Duplicate Invoice Detection

**Decision**: SHA-256 hash of (RFC + Invoice Number + Date) stored in SQLite

**Rationale**:
- Fast lookup via indexed hash column
- Deterministic identification
- Works across sessions
- No false positives from layout differences

**Alternatives Considered**:
- Full PDF hash: Different scans of same invoice would differ
- Fuzzy matching: Too complex, potential false positives
- ContPAQi query only: Slower, requires SDK connection

## Best Practices Applied

### Python AI Service
- Use Pydantic for all request/response models
- Async endpoints for non-blocking I/O
- Structured logging with correlation IDs
- Health check endpoint at `/health`
- Graceful shutdown handling

### TypeScript Desktop
- React hooks for all state management
- Tailwind CSS utility classes only
- TypeScript strict mode enabled
- Error boundaries for graceful degradation
- i18n ready (Spanish strings in separate file)

### C# Windows Bridge
- Dependency injection throughout
- IDisposable pattern for COM objects
- Async/await for SDK calls
- Structured logging with Serilog
- Health check endpoint at `/health`

### Security
- All services bind to 127.0.0.1 only
- No credentials in source code
- Environment variables for configuration
- Input validation on all endpoints
- SQL parameterized queries only

## Open Questions (Resolved)

| Question | Resolution |
|----------|------------|
| ContPAQi versions? | 2022 and later (per clarification) |
| Scanned PDF support? | Yes, via Tesseract OCR (per clarification) |
| UI Language? | Spanish only (per clarification) |
| Duplicate handling? | Warn and allow override (per clarification) |
| Invoice states? | Uploaded→Extracted→Validated→Posted (per clarification) |
