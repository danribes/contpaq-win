<!--
Sync Impact Report
==================
Version change: 0.0.0 → 1.0.0
Added sections:
  - Core Principles (5 principles)
  - Windows Platform Requirements
  - Development Workflow
  - Governance
Templates requiring updates:
  - .specify/templates/plan-template.md ✅ (no changes needed - generic)
  - .specify/templates/spec-template.md ✅ (no changes needed - generic)
  - .specify/templates/tasks-template.md ✅ (no changes needed - generic)
Follow-up TODOs: None
-->

# ContPAQ-Win Constitution

## Core Principles

### I. Windows-Native First

All components MUST run natively on Windows without Docker containers or virtualization layers.

- The AI processing layer MUST run as a native Windows service or background process
- No Docker, WSL, or container runtime dependencies allowed in production
- All dependencies MUST be installable via standard Windows mechanisms (MSI, pip, nuget)
- The system MUST work on Windows 10/11 with standard user permissions (no admin required for operation)

**Rationale**: Eliminates Docker Desktop licensing costs, reduces system requirements, simplifies deployment for end users who are accountants—not developers.

### II. Process Architecture

The system follows a multi-process architecture with native Windows IPC.

- **Desktop UI (Electron/React)**: Manages user interface and process lifecycle
- **Windows Bridge (C#/.NET)**: Integrates with ContPAQi SDK via COM interop
- **AI Service (Python/FastAPI)**: Runs as Windows Service or managed process on port 8000
- Processes communicate via HTTP on localhost (127.0.0.1 only)
- Electron MUST manage Python process lifecycle (start, monitor, restart, stop)

**Rationale**: Maintains the proven layered architecture while replacing Docker with native process management.

### III. Test-First Development (NON-NEGOTIABLE)

All features MUST follow TDD methodology.

- Tests MUST be written before implementation
- Tests MUST fail before implementation begins (Red phase)
- Implementation MUST make tests pass (Green phase)
- Code MUST be refactored while keeping tests green (Refactor phase)
- Test naming convention: `test_task###_#_description.py`

**Rationale**: Ensures reliability for financial software where errors have real business consequences.

### IV. Confidence-Based UX

Extraction results MUST display confidence levels with visual feedback.

- Green (≥90%): High confidence, likely correct
- Orange (70-89%): Medium confidence, review recommended
- Red (<70%): Low confidence, manual verification required
- All AI-extracted fields MUST include confidence scores
- Users MUST be able to override any AI-suggested value

**Rationale**: Human-in-the-loop validation is critical for accounting accuracy and regulatory compliance.

### V. Security by Default

All components MUST follow security best practices.

- Windows Bridge MUST bind only to 127.0.0.1 (localhost)
- No network services exposed to external interfaces
- API keys and secrets MUST be stored in environment variables or Windows Credential Manager
- Mexican RFC validation MUST be enforced (13 chars for individuals, 12 for companies)
- CFDI compliance checks MUST be performed before posting to ContPAQi

**Rationale**: Financial data requires strict security; Mexican tax regulations require RFC and CFDI compliance.

## Windows Platform Requirements

### Supported Environments

- **OS**: Windows 10 (21H2+) and Windows 11
- **Architecture**: x64 only (ARM64 not supported due to ContPAQi SDK limitations)
- **Runtime Dependencies**:
  - .NET 8.0 Runtime
  - Python 3.11+ (embedded or system-installed)
  - Visual C++ Redistributable 2022
  - ContPAQi Comercial or Contabilidad (user-provided license)

### Service Management

- Python AI service MUST be manageable via Windows Services (sc.exe) or NSSM
- Service MUST support: start, stop, restart, status check
- Service MUST auto-restart on failure (max 3 retries, then alert user)
- Health check endpoint MUST be available at `GET /health`

### Installer Requirements

- Single MSI or Inno Setup installer
- MUST NOT require Docker Desktop
- MUST validate Python and .NET prerequisites
- MUST register Windows Service during installation
- MUST support silent installation for enterprise deployment

## Development Workflow

### Language-Specific Standards

**Python (AI Service)**:
- Formatter: Black (88-char lines)
- Linter: ruff, mypy for type checking
- Models: Pydantic for validation
- Async: Required for all I/O operations

**TypeScript/React (Desktop App)**:
- React 18 with hooks only (no class components)
- Strict null checking enabled
- Tailwind CSS for styling (no custom CSS)
- ESLint + Prettier for formatting

**C# (Windows Bridge)**:
- .NET 8.0, async/await throughout
- Nullable reference types enabled
- Constructor injection via DI container
- xUnit for testing

### Build Commands

```bash
# Python AI Service
pip install -r requirements.txt
pytest tests/
python -m black src/
python -m ruff src/

# TypeScript Desktop
npm install
npm run dev
npm test
npm run build

# C# Windows Bridge
dotnet restore
dotnet build
dotnet test
dotnet publish -c Release
```

## Governance

This constitution governs all development decisions for ContPAQ-Win.

- All pull requests MUST verify compliance with these principles
- Deviations MUST be documented in Complexity Tracking section of plan.md
- Constitution amendments require:
  1. Written proposal with rationale
  2. Impact analysis on existing code
  3. Migration plan if breaking changes
  4. Version bump following semver

Use `CLAUDE.md` for runtime development guidance and context.

**Version**: 1.0.0 | **Ratified**: 2025-12-15 | **Last Amended**: 2025-12-15
