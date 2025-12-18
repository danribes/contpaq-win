# ContPaq-proPDF Architecture Summary Guide

**Project**: ContPaq-proPDF - AI-Powered Invoice Processing for ContPAQi
**Date**: December 2025

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture Decisions](#architecture-decisions)
3. [Technology Stack Choices](#technology-stack-choices)
4. [Design Patterns Used](#design-patterns-used)
5. [Development Methodology](#development-methodology)
6. [CI/CD Pipeline Decisions](#cicd-pipeline-decisions)
7. [Key Technical Decisions](#key-technical-decisions)
8. [Lessons Learned](#lessons-learned)

---

## Project Overview

ContPaq-proPDF is a Windows desktop application that automates invoice processing by:
- Extracting data from PDF invoices using AI
- Validating Mexican fiscal requirements (RFC, CFDI)
- Posting entries directly to ContPAQi accounting software

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Desktop App (Electron)                    │
│           React + TypeScript + Tailwind CSS                  │
│                        Port: N/A                             │
└─────────────────────────┬───────────────────────────────────┘
                          │ IPC / HTTP
          ┌───────────────┴───────────────┐
          ▼                               ▼
┌──────────────────────┐    ┌──────────────────────┐
│    AI Service        │    │   Windows Bridge     │
│    Python/FastAPI    │    │   .NET 8.0 / C#      │
│    Port: 8000        │    │   Port: 5000         │
│                      │    │                      │
│  - PDF Processing    │    │  - ContPAQi SDK      │
│  - OCR (Tesseract)   │    │  - COM Interop       │
│  - LayoutLMv3 AI     │    │  - Entry Creation    │
└──────────────────────┘    └──────────────────────┘
```

---

## Architecture Decisions

### 1. Three-Component Architecture

**Decision**: Separate the application into three distinct services.

**Reasoning**:
- **Isolation**: Each component can be developed, tested, and deployed independently
- **Technology Fit**: Use the best language/framework for each concern
  - Python excels at AI/ML with libraries like transformers, PyTorch
  - C# is required for ContPAQi SDK integration (COM interop)
  - Electron provides cross-platform desktop experience with web technologies
- **Scalability**: Services can be scaled independently if needed
- **Maintainability**: Teams can specialize in different components

### 2. Process Manager Pattern

**Decision**: Use a centralized ProcessManager in Electron to manage child processes.

**Reasoning**:
- **Lifecycle Control**: Start, stop, restart services from one place
- **Health Monitoring**: Centralized health checks with auto-restart
- **Graceful Shutdown**: Ensure all processes terminate cleanly on app close
- **Event-Driven**: Use EventEmitter to notify UI of status changes

```typescript
class ProcessManager extends EventEmitter {
  private aiServiceProcess: ChildProcess | null;
  private bridgeServiceProcess: ChildProcess | null;

  async startAll(): Promise<void>
  async stopAll(): Promise<void>
  // Auto-restart with exponential backoff
}
```

### 3. Local HTTP Communication

**Decision**: Services communicate via localhost HTTP APIs.

**Reasoning**:
- **Simplicity**: Standard HTTP/JSON is easy to debug and test
- **Language Agnostic**: Any technology can consume HTTP APIs
- **Tooling**: Can use curl, Postman, browser for manual testing
- **Future-Proof**: Could potentially run services remotely if needed

---

## Technology Stack Choices

### AI Service: Python + FastAPI

**Decision**: Use Python with FastAPI for the AI processing service.

**Reasoning**:
- **AI/ML Ecosystem**: Python has the best libraries (transformers, PyTorch, Tesseract)
- **FastAPI Performance**: Async support, automatic OpenAPI docs, type hints
- **PyInstaller**: Can bundle as single executable for distribution
- **Developer Velocity**: Rapid prototyping for ML workflows

**Key Libraries**:
| Library | Purpose | Reason |
|---------|---------|--------|
| FastAPI | Web framework | Fast, async, automatic docs |
| PyMuPDF | PDF processing | Handles both digital and scanned PDFs |
| pytesseract | OCR | Industry-standard, supports Spanish |
| transformers | AI models | LayoutLMv3 for document understanding |
| PyInstaller | Packaging | Single-file executable |

### Windows Bridge: .NET 8.0 + C#

**Decision**: Use .NET 8.0 with C# for ContPAQi integration.

**Reasoning**:
- **COM Interop**: C# has first-class COM support for ContPAQi SDK
- **Windows Native**: Full access to Windows APIs
- **Self-Contained**: Can publish as single-file executable
- **Modern C#**: Records, nullable reference types, top-level statements

### Desktop App: Electron + React + TypeScript

**Decision**: Use Electron with React and TypeScript.

**Reasoning**:
- **Web Technologies**: Leverage existing React expertise
- **Cross-Platform Potential**: Could port to macOS/Linux if needed
- **Rich UI**: Full access to HTML/CSS for complex UI
- **TypeScript**: Type safety catches errors at compile time
- **IPC**: Built-in secure communication between main/renderer

**UI Framework**: Tailwind CSS
- **Reasoning**: Utility-first approach speeds development, no custom CSS files, highly customizable

---

## Design Patterns Used

### 1. Repository Pattern (Database)

**Decision**: Use repository classes for data access.

```typescript
class InvoiceRepository {
  async create(invoice: Invoice): Promise<Invoice>
  async findById(id: string): Promise<Invoice | null>
  async findByState(state: InvoiceState): Promise<Invoice[]>
}
```

**Reasoning**:
- Abstracts database details from business logic
- Easy to mock for testing
- Single place to optimize queries

### 2. Service Interface Pattern (Windows Bridge)

**Decision**: Define interfaces for all services.

```csharp
public interface ISdkService {
    bool IsAvailable();
    bool Connect(string companyName);
    void Disconnect();
}
```

**Reasoning**:
- Enables dependency injection
- Allows mocking for unit tests
- Supports stub implementations during development

### 3. Singleton Pattern (Process Manager)

**Decision**: Single ProcessManager instance manages all services.

**Reasoning**:
- Only one instance should control child processes
- Prevents resource conflicts
- Centralized state management

### 4. BIO Tagging (AI Extraction)

**Decision**: Use BIO (Begin-Inside-Outside) tagging for entity extraction.

```python
# B-VENDOR_RFC = Beginning of vendor RFC field
# I-VENDOR_RFC = Inside/continuation of vendor RFC field
# O = Outside any field
```

**Reasoning**:
- Standard NLP approach for named entity recognition
- Works well with transformer models
- Handles multi-token entities correctly

### 5. Confidence Scoring (UI)

**Decision**: Three-tier confidence visualization (High/Medium/Low).

```typescript
// Green: >= 90% (High confidence)
// Orange: 70-89% (Medium confidence)
// Red: < 70% (Low confidence)
```

**Reasoning**:
- Intuitive traffic-light colors
- Users focus attention on low-confidence fields
- Thresholds based on typical ML model performance

---

## Development Methodology

### Test-Driven Development (TDD)

**Decision**: Mandatory TDD for all features.

**Reasoning**:
- Tests document expected behavior
- Catches regressions early
- Forces modular, testable code design
- Provides safety net for refactoring

**Workflow**:
1. **Red**: Write failing test first
2. **Green**: Write minimal code to pass
3. **Refactor**: Improve code quality

### TypeScript Strict Mode

**Decision**: Enable all strict TypeScript compiler options.

```json
{
  "compilerOptions": {
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noUncheckedIndexedAccess": true
  }
}
```

**Reasoning**:
- Catches null/undefined errors at compile time
- Enforces handling of edge cases
- Reduces runtime errors significantly
- Documents intent through types

### Spanish-First Localization

**Decision**: All user-facing text in Spanish.

**Reasoning**:
- Target market is Mexico
- ContPAQi is a Mexican accounting system
- Users expect Spanish interface
- i18n infrastructure allows future languages

---

## CI/CD Pipeline Decisions

### GitHub Actions with Windows Runner

**Decision**: Use GitHub Actions with `windows-latest` runner.

**Reasoning**:
- Native Windows build for Electron
- Inno Setup requires Windows
- .NET and Python work well on Windows runners
- Free for public repositories

### Multi-Stage Build

**Decision**: Build all components in a single workflow.

```yaml
jobs:
  build:
    steps:
      - Build AI Service (PyInstaller)
      - Build Windows Bridge (.NET publish)
      - Build Desktop App (Electron Builder)
      - Create Installer (Inno Setup)
```

**Reasoning**:
- All components versioned together
- Single artifact (installer) contains everything
- Consistent build environment

### Retry Logic with Exponential Backoff

**Decision**: Implement retry logic for network operations.

```powershell
$waitTime = [math]::Pow(2, $attempt)  # 2, 4, 8, 16 seconds
```

**Reasoning**:
- GitHub Actions runners have intermittent network issues
- External downloads (NSSM, Tesseract) may fail
- Exponential backoff prevents overwhelming servers
- Multiple fallback sources for critical dependencies

### Automatic Release Creation

**Decision**: Automatically create GitHub releases on version tags.

**Reasoning**:
- Consistent release process
- Installer automatically attached
- Release notes auto-generated
- Users can download from Releases page

---

## Key Technical Decisions

### 1. SQLite for Local Database

**Decision**: Use SQLite with better-sqlite3.

**Reasoning**:
- No separate database server needed
- Single file, easy to backup
- Synchronous API (simpler code)
- Sufficient performance for local app

### 2. LayoutLMv3 for Document Understanding

**Decision**: Use Microsoft's LayoutLMv3 model.

**Reasoning**:
- State-of-the-art for document AI
- Pre-trained on diverse documents
- Handles both text and layout information
- Available on Hugging Face

### 3. Lazy Model Loading

**Decision**: Load AI models on-demand, not at startup.

**Reasoning**:
- Faster application startup
- Memory only used when needed
- Health endpoint can indicate model status

### 4. NSSM for Service Management

**Decision**: Include NSSM for potential Windows service mode.

**Reasoning**:
- Standard tool for running apps as Windows services
- Easy to install/uninstall services
- Good logging and restart capabilities

### 5. Tesseract for OCR

**Decision**: Bundle Tesseract OCR with the installer.

**Reasoning**:
- Industry-standard OCR engine
- Supports Spanish language
- Free and open source
- Can be bundled with application

---

## Lessons Learned

### 1. Native Module Challenges

**Problem**: `canvas` npm package requires Cairo/GTK libraries not available on GitHub Actions.

**Solution**: Remove canvas from node_modules before electron-builder packaging.

```yaml
Remove-Item -Recurse -Force "node_modules/canvas"
```

**Learning**: Audit native dependencies early; some are optional.

### 2. TypeScript Strict Mode Reveals Issues

**Problem**: Enabling strict mode after development revealed many potential null pointer errors.

**Solution**: Fixed all issues systematically:
- Added null checks
- Used nullish coalescing (`??`)
- Captured values in closures before async operations

**Learning**: Enable strict mode from the start of the project.

### 3. External Downloads Are Unreliable

**Problem**: nssm.cc returned 503 during builds; Tesseract downloads timed out.

**Solution**:
- Multiple fallback sources
- Retry logic with exponential backoff
- Graceful degradation (placeholder files)

**Learning**: Never rely on a single external source in CI/CD.

### 4. Version Tag Management

**Problem**: Creating releases with wrong tags caused workflow failures.

**Solution**:
- Use semantic versioning (v0.1.0)
- Ensure tags point to correct commits
- Delete and recreate tags when needed

**Learning**: Document release process clearly.

### 5. Process Spawn Type Safety

**Problem**: TypeScript complained about `stdio` option types.

**Solution**: Explicit type annotation instead of `as const`:

```typescript
stdio: ['ignore', 'pipe', 'pipe'] as ['ignore', 'pipe', 'pipe']
```

**Learning**: Node.js types sometimes need explicit casting.

---

## Conclusion

The ContPaq-proPDF project demonstrates a well-architected multi-technology solution that:

1. **Separates concerns** into specialized services
2. **Uses the right tool** for each job (Python for AI, C# for Windows)
3. **Prioritizes quality** through TDD and strict typing
4. **Automates deployment** via GitHub Actions
5. **Handles edge cases** through retry logic and fallbacks

The decisions documented here should serve as a reference for maintaining and extending the application.

---

## Quick Reference

| Component | Technology | Port | Purpose |
|-----------|------------|------|---------|
| Desktop App | Electron/React | N/A | User interface |
| AI Service | Python/FastAPI | 8000 | PDF/OCR/AI extraction |
| Windows Bridge | .NET 8.0/C# | 5000 | ContPAQi SDK integration |
| Database | SQLite | N/A | Local data storage |
| Installer | Inno Setup | N/A | Windows installer |

| Pattern | Location | Purpose |
|---------|----------|---------|
| Process Manager | Electron main | Service lifecycle |
| Repository | Desktop/Database | Data access |
| Service Interface | Windows Bridge | Dependency injection |
| BIO Tagging | AI Service | Entity extraction |
| Event Emitter | Electron main | Status notifications |
