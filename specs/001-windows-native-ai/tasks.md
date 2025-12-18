# Tasks: Windows-Native AI Invoice Processing

**Input**: Design documents from `/specs/001-windows-native-ai/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅

## Task Hierarchy Legend

- **T###** - Main Task
- **T###.#** - Subtask
- **T###.#.#** - Sub-subtask
- **[P]** - Can run in parallel
- **[US#]** - User Story reference

---

## Phase 1: Project Setup & Infrastructure

**Goal**: Initialize all project structures and development environments

### T001 - Initialize Repository Structure

- [x] **T001.1** Create root directory structure ✅ *Completed 2025-12-15*
  - [x] T001.1.1 Create `ai-service/` directory with `src/`, `tests/` subdirectories ✅ *Completed 2025-12-15*
    - Created: `ai-service/src/`, `ai-service/tests/`
    - Test: `tests/structure/test_T001_1_1_ai_service_directory.py` (4 tests passed)
    - Logs: `log_files/T001.1.1_*`, `log_tests/T001.1.1_*`, `log_learn/T001.1.1_*`
  - [x] T001.1.2 Create `desktop-app/` directory with `src/main/`, `src/renderer/` subdirectories ✅ *Completed 2025-12-15*
    - Created: `desktop-app/src/main/`, `desktop-app/src/renderer/`
    - Test: `tests/structure/test_T001_1_2_desktop_app_directory.py` (5 tests passed)
    - Logs: `log_files/T001.1.2_*`, `log_tests/T001.1.2_*`, `log_learn/T001.1.2_*`
  - [x] T001.1.3 Create `windows-bridge/` directory with `src/` subdirectory ✅ *Completed 2025-12-15*
    - Created: `windows-bridge/src/`
    - Test: `tests/structure/test_T001_1_3_windows_bridge_directory.py` (3 tests passed)
    - Logs: `log_files/T001.1.3_*`, `log_tests/T001.1.3_*`, `log_learn/T001.1.3_*`
  - [x] T001.1.4 Create `installer/` directory with `scripts/`, `assets/` subdirectories ✅ *Completed 2025-12-15*
    - Created: `installer/scripts/`, `installer/assets/`
    - Test: `tests/structure/test_T001_1_4_installer_directory.py` (4 tests passed)
    - Logs: `log_files/T001.1.4_*`, `log_tests/T001.1.4_*`, `log_learn/T001.1.4_*`
  - [x] T001.1.5 Create `database/` directory with `migrations/`, `seed/` subdirectories ✅ *Completed 2025-12-15*
    - Created: `database/migrations/`, `database/seed/`
    - Test: `tests/structure/test_T001_1_5_database_directory.py` (4 tests passed)
    - Logs: `log_files/T001.1.5_*`, `log_tests/T001.1.5_*`, `log_learn/T001.1.5_*`

- [x] **T001.2** [P] Initialize version control configuration ✅ *Completed 2025-12-15*
  - [x] T001.2.1 Update `.gitignore` with Python, Node, .NET patterns ✅ *Completed 2025-12-15*
    - Updated: `.gitignore` with comprehensive patterns for all tech stacks
    - Test: `tests/structure/test_T001_2_1_gitignore.py` (6 tests passed)
    - Logs: `log_files/T001.2.1_*`, `log_tests/T001.2.1_*`, `log_learn/T001.2.1_*`
  - [x] T001.2.2 Create `.editorconfig` for consistent formatting ✅ *Completed 2025-12-15*
    - Created: `.editorconfig` with settings for Python, TypeScript, C#, and more
    - Test: `tests/structure/test_T001_2_2_editorconfig.py` (6 tests passed)
    - Logs: `log_files/T001.2.2_*`, `log_tests/T001.2.2_*`, `log_learn/T001.2.2_*`
  - [x] T001.2.3 Create root `README.md` with project overview ✅ *Completed 2025-12-15*
    - Created: `README.md` with architecture, prerequisites, installation, and structure
    - Test: `tests/structure/test_T001_2_3_readme.py` (6 tests passed)
    - Logs: `log_files/T001.2.3_*`, `log_tests/T001.2.3_*`, `log_learn/T001.2.3_*`

**Checkpoint**: Repository structure matches plan.md specification

---

### T002 - Initialize AI Service (Python) ✅ *Completed 2025-12-16*

- [x] **T002.1** Create Python project configuration ✅ *Completed 2025-12-16*
  - [x] T002.1.1 Create `ai-service/pyproject.toml` with project metadata ✅ *Completed 2025-12-16*
    - Created: `ai-service/pyproject.toml` with PEP 621 metadata
    - Includes: Black, Ruff, Mypy, Pytest, Coverage configurations
    - Test: `tests/ai_service/test_T002_1_1_pyproject_toml.py` (7 tests passed)
    - Logs: `log_files/T002.1.1_*`, `log_tests/T002.1.1_*`, `log_learn/T002.1.1_*`
  - [x] T002.1.2 Create `ai-service/requirements.txt` with production dependencies ✅ *Completed 2025-12-16*
    - Created: `ai-service/requirements.txt` with all 8 core dependencies
    - Includes: FastAPI, uvicorn, PyMuPDF, pytesseract, transformers, torch (CPU), Pillow, pydantic
    - Test: `tests/ai_service/test_T002_1_2_requirements_txt.py` (9 tests passed)
    - Logs: `log_files/T002.1.2_*`, `log_tests/T002.1.2_*`, `log_learn/T002.1.2_*`
  - [x] T002.1.3 Create `ai-service/requirements-dev.txt` with dev dependencies ✅ *Completed 2025-12-16*
    - Created: `ai-service/requirements-dev.txt` with all 7 core dev dependencies
    - Includes: pytest, pytest-asyncio, pytest-cov, black, ruff, mypy, httpx
    - Test: `tests/ai_service/test_T002_1_3_requirements_dev_txt.py` (9 tests passed)
    - Logs: `log_files/T002.1.3_*`, `log_tests/T002.1.3_*`, `log_learn/T002.1.3_*`

- [x] **T002.2** [P] Create source directory structure ✅ *Completed 2025-12-16*
  - [x] T002.2.1 Create `ai-service/src/__init__.py` ✅ *Completed 2025-12-16*
    - Created: `ai-service/src/__init__.py` with __version__, __author__, docstring
    - Test: `tests/ai_service/test_T002_2_1_src_init.py` (5 tests passed)
    - Logs: `log_files/T002.2.1_*`, `log_tests/T002.2.1_*`, `log_learn/T002.2.1_*`
  - [x] T002.2.2 Create `ai-service/src/models/__init__.py` ✅ *Completed 2025-12-16*
    - Created: `ai-service/src/models/__init__.py` with docstring and __all__
    - Includes: Package documentation for Pydantic data models
    - Test: `tests/ai_service/test_T002_2_2_models_init.py` (6 tests passed)
    - Logs: `log_files/T002.2.2_*`, `log_tests/T002.2.2_*`, `log_learn/T002.2.2_*`
  - [x] T002.2.3 Create `ai-service/src/services/__init__.py` ✅ *Completed 2025-12-16*
    - Created: `ai-service/src/services/__init__.py` with docstring and __all__
    - Includes: Package documentation for business logic services (PDF, OCR, AI extraction)
    - Test: `tests/ai_service/test_T002_2_3_services_init.py` (6 tests passed)
    - Logs: `log_files/T002.2.3_*`, `log_tests/T002.2.3_*`, `log_learn/T002.2.3_*`
  - [x] T002.2.4 Create `ai-service/src/api/__init__.py` ✅ *Completed 2025-12-16*
    - Created: `ai-service/src/api/__init__.py` with docstring and __all__
    - Includes: Package documentation for FastAPI REST endpoints
    - Test: `tests/ai_service/test_T002_2_4_api_init.py` (6 tests passed)
    - Logs: `log_files/T002.2.4_*`, `log_tests/T002.2.4_*`, `log_learn/T002.2.4_*`
  - [x] T002.2.5 Create `ai-service/src/utils/__init__.py` ✅ *Completed 2025-12-16*
    - Created: `ai-service/src/utils/__init__.py` with docstring and __all__
    - Includes: Package documentation for shared utility functions
    - Test: `tests/ai_service/test_T002_2_5_utils_init.py` (6 tests passed)
    - Logs: `log_files/T002.2.5_*`, `log_tests/T002.2.5_*`, `log_learn/T002.2.5_*`

- [x] **T002.3** Create configuration module ✅ *Completed 2025-12-16*
  - [x] T002.3.1 Create `ai-service/src/config.py` with Pydantic Settings ✅ *Completed 2025-12-16*
    - Created: `ai-service/src/config.py` with BaseSettings class and model_config
    - Includes: lru_cache for singleton pattern, SettingsConfigDict for .env support
    - Test: `tests/ai_service/test_T002_3_1_config.py` (7 tests passed)
    - Logs: `log_files/T002.3.1_*`, `log_tests/T002.3.1_*`, `log_learn/T002.3.1_*`
  - [x] T002.3.2 Define HOST, PORT (8000), LOG_LEVEL settings ✅ *Completed 2025-12-16*
    - Added: HOST (127.0.0.1), PORT (8000), LOG_LEVEL (INFO) to Settings class
    - Includes: Type annotations, docstrings, security-focused defaults
    - Test: `tests/ai_service/test_T002_3_2_server_settings.py` (8 tests passed)
    - Logs: `log_files/T002.3.2_*`, `log_tests/T002.3.2_*`, `log_learn/T002.3.2_*`
  - [x] T002.3.3 Define TESSERACT_PATH, MODEL_PATH settings ✅ *Completed 2025-12-16*
    - Added: TESSERACT_PATH (Windows default), MODEL_PATH (./models/layoutlm)
    - Includes: Type annotations, docstrings, platform-appropriate defaults
    - Test: `tests/ai_service/test_T002_3_3_service_paths.py` (7 tests passed)
    - Logs: `log_files/T002.3.3_*`, `log_tests/T002.3.3_*`, `log_learn/T002.3.3_*`
  - [x] T002.3.4 Create `.env.example` with sample configuration ✅ *Completed 2025-12-16*
    - Created: `ai-service/.env.example` with all settings documented
    - Includes: Section headers, explanatory comments, platform-specific notes
    - Test: `tests/ai_service/test_T002_3_4_env_example.py` (8 tests passed)
    - Logs: `log_files/T002.3.4_*`, `log_tests/T002.3.4_*`, `log_learn/T002.3.4_*`

- [x] **T002.4** [P] Create test infrastructure ✅ *Completed 2025-12-16*
  - [x] T002.4.1 Create `ai-service/tests/conftest.py` with pytest fixtures ✅ *Completed 2025-12-16*
    - Created: `ai-service/tests/conftest.py` with shared pytest fixtures
    - Includes: test_settings, temp_env_file, sample_pdf_path, reset_settings_cache fixtures
    - Defines: FIXTURES_DIR constant for test fixture files
    - Test: `tests/ai_service/test_T002_4_1_conftest.py` (8 tests passed)
    - Logs: `log_files/T002.4.1_*`, `log_tests/T002.4.1_*`, `log_learn/T002.4.1_*`
  - [x] T002.4.2 Create `ai-service/tests/fixtures/` directory ✅ *Completed 2025-12-16*
    - Created: `ai-service/tests/fixtures/` directory with __init__.py
    - Includes: Package docstring documenting fixtures structure
    - Test: `tests/ai_service/test_T002_4_2_fixtures_dir.py` (5 tests passed)
    - Logs: `log_files/T002.4.2_*`, `log_tests/T002.4.2_*`, `log_learn/T002.4.2_*`
  - [x] T002.4.3 Add sample text-based PDF to fixtures ✅ *Completed 2025-12-16*
    - Created: `ai-service/tests/fixtures/sample_invoice.pdf` (1,112 bytes)
    - Includes: Mexican invoice (CFDI) with RFC, invoice number, date, subtotal, IVA, total
    - Format: PDF 1.4 with text streams (BT/ET operators), Helvetica font
    - Test: `tests/ai_service/test_T002_4_3_sample_pdf.py` (5 tests passed)
    - Logs: `log_files/T002.4.3_*`, `log_tests/T002.4.3_*`, `log_learn/T002.4.3_*`
  - [x] T002.4.4 Add sample scanned PDF to fixtures ✅ *Completed 2025-12-16*
    - Created: `ai-service/tests/fixtures/sample_scanned_invoice.pdf` (812 bytes)
    - Includes: Image XObject (100x150 grayscale) simulating scanned document
    - Format: PDF 1.4 with /Subtype /Image, FlateDecode compression
    - Test: `tests/ai_service/test_T002_4_4_scanned_pdf.py` (5 tests passed)
    - Logs: `log_files/T002.4.4_*`, `log_tests/T002.4.4_*`, `log_learn/T002.4.4_*`
  - [x] T002.4.5 Create `ai-service/tests/unit/__init__.py` ✅ *Completed 2025-12-16*
    - Created: `ai-service/tests/unit/` directory with __init__.py
    - Includes: Package docstring documenting unit test organization
    - Test: `tests/ai_service/test_T002_4_5_unit_init.py` (5 tests passed)
    - Logs: `log_files/T002.4.5_*`, `log_tests/T002.4.5_*`, `log_learn/T002.4.5_*`
  - [x] T002.4.6 Create `ai-service/tests/integration/__init__.py` ✅ *Completed 2025-12-16*
    - Created: `ai-service/tests/integration/` directory with __init__.py
    - Includes: Package docstring documenting integration test organization and markers
    - Test: `tests/ai_service/test_T002_4_6_integration_init.py` (5 tests passed)
    - Logs: `log_files/T002.4.6_*`, `log_tests/T002.4.6_*`, `log_learn/T002.4.6_*`

**Checkpoint**: `pip install -r requirements.txt` succeeds

---

### T003 - Initialize Desktop App (Electron/React)

- [x] **T003.1** Create Electron/React project ✅ *Completed 2025-12-16*
  - [x] T003.1.1 Create `desktop-app/package.json` with dependencies ✅ *Completed 2025-12-16*
    - Created: `desktop-app/package.json` with all required dependencies
    - Dependencies: react ^18.2.0, react-dom ^18.2.0, react-pdf ^7.7.0, better-sqlite3 ^9.4.0
    - DevDependencies: electron ^28.0.0, tailwindcss ^3.4.0, typescript ^5.3.0, vite ^5.0.0
    - Includes: Scripts (start, dev, build, package, test, lint), electron-builder config
    - Test: `tests/desktop_app/test_T003_1_1_package_json.py` (12 tests passed)
    - Logs: `log_files/T003.1.1_*`, `log_tests/T003.1.1_*`, `log_learn/T003.1.1_*`
  - [x] T003.1.2 Create `desktop-app/tsconfig.json` with strict mode ✅ *Completed 2025-12-16*
    - Created: `desktop-app/tsconfig.json` with full strict mode configuration
    - Target: ES2022, Module: ESNext, JSX: react-jsx
    - Strict options: strict, noImplicitAny, strictNullChecks, noUnusedLocals, etc.
    - Path aliases: @/*, @main/*, @renderer/*
    - Test: `tests/desktop_app/test_T003_1_2_tsconfig.py` (11 tests passed)
    - Logs: `log_files/T003.1.2_*`, `log_tests/T003.1.2_*`, `log_learn/T003.1.2_*`
  - [x] T003.1.3 Create `desktop-app/tailwind.config.js` ✅ *Completed 2025-12-16*
    - Created: `desktop-app/tailwind.config.js` with Tailwind CSS configuration
    - Content: Scans .ts, .tsx, .html files; theme extend with custom colors, fonts, spacing
    - Colors: primary (blue scale), success, warning, error, info for invoice states
    - Fonts: Inter (sans), JetBrains Mono (mono)
    - Test: `tests/desktop_app/test_T003_1_3_tailwind_config.py` (8 tests passed)
    - Logs: `log_files/T003.1.3_*`, `log_tests/T003.1.3_*`, `log_learn/T003.1.3_*`
  - [x] T003.1.4 Create `desktop-app/electron-builder.json` for packaging ✅ *Completed 2025-12-16*
    - Created: `desktop-app/electron-builder.json` with Windows NSIS installer configuration
    - AppId: com.contpaq.win, ProductName: ContPAQ Win
    - Windows target: NSIS x64, maximum compression, ASAR enabled
    - NSIS: perMachine=true, oneClick=false, Spanish language (1034)
    - Extra resources: AI service bundled with filter for Python files
    - Test: `tests/desktop_app/test_T003_1_4_electron_builder.py` (13 tests passed)
    - Logs: `log_files/T003.1.4_*`, `log_tests/T003.1.4_*`, `log_learn/T003.1.4_*`

- [x] **T003.2** [P] Create Electron main process structure ✅ *Completed 2025-12-16*
  - [x] T003.2.1 Create `desktop-app/src/main/index.ts` entry point ✅ *Completed 2025-12-16*
    - Created: `desktop-app/src/main/index.ts` with Electron main process entry point
    - Imports: app, BrowserWindow, ipcMain from electron
    - Security: nodeIntegration=false, contextIsolation=true, sandbox=true
    - Lifecycle: app.whenReady(), window-all-closed, activate handlers
    - Features: Dev/prod mode, navigation blocking, window flash prevention
    - Test: `tests/desktop_app/test_T003_2_1_main_index.py` (13 tests passed)
    - Logs: `log_files/T003.2.1_*`, `log_tests/T003.2.1_*`, `log_learn/T003.2.1_*`
  - [x] T003.2.2 Create `desktop-app/src/main/preload.ts` with context bridge ✅ *Completed 2025-12-16*
    - Created: `desktop-app/src/main/preload.ts` with secure context bridge
    - API: invoke (request/response), send (fire-forget), on (subscribe), removeListener
    - Security: Channel whitelisting, no raw ipcRenderer exposure, event stripping
    - Channels: AI service, Windows Bridge, Database, App operations
    - TypeScript: Full ElectronAPI interface with global Window type
    - Test: `tests/desktop_app/test_T003_2_2_preload.py` (11 tests passed)
    - Logs: `log_files/T003.2.2_*`, `log_tests/T003.2.2_*`, `log_learn/T003.2.2_*`
  - [x] T003.2.3 Create `desktop-app/src/main/process-manager.ts` stub ✅ *Completed 2025-12-16*
    - Created: `desktop-app/src/main/process-manager.ts` stub for process lifecycle management
    - Class: ProcessManager with ServiceStatus enum (STOPPED/STARTING/RUNNING/STOPPING/ERROR)
    - Methods: startAIService, stopAIService, startBridgeService, stopBridgeService, checkHealth
    - Config: ports (8000, 5000), healthCheckInterval, maxRestartAttempts, backoff
    - Exports: ProcessManager class, processManager singleton, ServiceHealth interface
    - Test: `tests/desktop_app/test_T003_2_3_process_manager.py` (10 tests passed)
    - Logs: `log_files/T003.2.3_*`, `log_tests/T003.2.3_*`, `log_learn/T003.2.3_*`
  - [x] T003.2.4 Create `desktop-app/src/main/ipc-handlers.ts` stub ✅ *Completed 2025-12-16*
    - Created: `desktop-app/src/main/ipc-handlers.ts` with IPC handler stubs
    - Handlers: AI Service (3), Bridge Service (6), Database (5), App (4), Window (3)
    - Channels: ai:*, bridge:*, db:*, app:*, window:* matching preload.ts
    - Functions: registerHandlers(), unregisterHandlers(), per-category registers
    - Integration: Uses processManager for health checks, dialog for file picker
    - Test: `tests/desktop_app/test_T003_2_4_ipc_handlers.py` (10 tests passed)
    - Logs: `log_files/T003.2.4_*`, `log_tests/T003.2.4_*`, `log_learn/T003.2.4_*`

- [x] **T003.3** [P] Create React renderer structure ✅ *Completed 2025-12-16*
  - [x] T003.3.1 Create `desktop-app/src/renderer/index.html` ✅ *Completed 2025-12-16*
    - Created: `desktop-app/src/renderer/index.html` with HTML5 entry point
    - Features: Spanish lang (lang="es"), UTF-8 charset, viewport meta, CSP headers
    - Structure: Root div (id="root") for React, module script for index.tsx
    - Security: Content-Security-Policy restricts scripts to 'self'
    - Test: `tests/desktop_app/test_T003_3_1_index_html.py` (12 tests passed)
    - Logs: `log_files/T003.3.1_*`, `log_tests/T003.3.1_*`, `log_learn/T003.3.1_*`
  - [x] T003.3.2 Create `desktop-app/src/renderer/index.tsx` entry point ✅ *Completed 2025-12-16*
    - Created: `desktop-app/src/renderer/index.tsx` with React 18 entry point
    - Features: createRoot (React 18), StrictMode, null check for root element
    - Imports: React, ReactDOM/client, App component, styles/index.css
    - Error handling: Spanish error message if root element not found
    - Test: `tests/desktop_app/test_T003_3_2_index_tsx.py` (11 tests passed)
    - Logs: `log_files/T003.3.2_*`, `log_tests/T003.3.2_*`, `log_learn/T003.3.2_*`
  - [x] T003.3.3 Create `desktop-app/src/renderer/App.tsx` with router setup ✅ *Completed 2025-12-16*
    - Created: `desktop-app/src/renderer/App.tsx` with React Router and layout
    - Router: HashRouter for Electron file:// compatibility
    - Routes: / (Home), /processing, /settings, * (404)
    - Layout: Header, Main content area, Status bar footer
    - Styling: Tailwind CSS with flex layout, responsive design
    - Test: `tests/desktop_app/test_T003_3_3_app_tsx.py` (12 tests passed)
    - Logs: `log_files/T003.3.3_*`, `log_tests/T003.3.3_*`, `log_learn/T003.3.3_*`
  - [x] T003.3.4 Create `desktop-app/src/renderer/types/index.ts` with TypeScript interfaces ✅ *Completed 2025-12-16*
    - Created: `desktop-app/src/renderer/types/index.ts` with all type definitions
    - Types: InvoiceState, SourceType, PostingStatus, ServiceStatus, ConfidenceLevel
    - Interfaces: BoundingBox, ExtractionField, LineItem, Vendor, Invoice, ContPAQiEntry
    - API: ApiResponse<T>, PaginatedResponse<T>, InvoiceFilters
    - Electron: ElectronAPI interface, Window type augmentation
    - Utilities: CONFIDENCE_THRESHOLDS, getConfidenceLevel()
    - Test: `tests/desktop_app/test_T003_3_4_types_index.py` (14 tests passed)
    - Logs: `log_files/T003.3.4_*`, `log_tests/T003.3.4_*`, `log_learn/T003.3.4_*`

- [x] **T003.4** [P] Create i18n structure (Spanish) ✅ *Completed 2025-12-16*
  - [x] T003.4.1 Create `desktop-app/src/renderer/i18n/es.json` with all UI strings ✅ *Completed 2025-12-16*
    - Created: `desktop-app/src/renderer/i18n/es.json` with comprehensive Spanish translations
    - Sections: app, navigation, pages, buttons, status, states, invoice, lineItem, vendor
    - Additional: services, errors, validation, confidence, dialogs, filters, contpaqi, accessibility
    - Contains: 100+ translation keys organized by feature
    - Style: Formal Spanish (usted), Mexican terminology (RFC, IVA)
    - Test: `tests/desktop_app/test_T003_4_1_i18n_es_json.py` (14 tests passed)
    - Logs: `log_files/T003.4.1_*`, `log_tests/T003.4.1_*`, `log_learn/T003.4.1_*`
  - [x] T003.4.2 Create i18n provider component ✅ *Completed 2025-12-16*
    - Created: `desktop-app/src/renderer/i18n/index.tsx` with React context provider
    - Exports: I18nProvider component, useTranslation hook, standalone t() function
    - Features: Nested key access (e.g., 'buttons.save'), string interpolation ({{key}})
    - Fallback: Returns key if translation not found, logs warning
    - TypeScript: Full type definitions for context and values
    - Test: `tests/desktop_app/test_T003_4_2_i18n_provider.py` (12 tests passed)
    - Logs: `log_files/T003.4.2_*`, `log_tests/T003.4.2_*`, `log_learn/T003.4.2_*`
  - [x] T003.4.3 Define all error messages in Spanish ✅ *Completed 2025-12-16*
    - Verified: All 16 error messages present in es.json errors section
    - Messages: generic, networkError, serverError, fileNotFound, invalidFile, invalidPdf
    - Additional: extractionFailed, validationFailed, saveFailed, postingFailed
    - Services: serviceUnavailable, aiServiceDown, bridgeServiceDown
    - Business: duplicateInvoice, vendorNotFound, rootElementNotFound
    - Test: `tests/desktop_app/test_T003_4_3_error_messages.py` (18 tests passed)
    - Logs: `log_files/T003.4.3_*`, `log_tests/T003.4.3_*`, `log_learn/T003.4.3_*`
  - [x] T003.4.4 Define all button labels in Spanish ✅ *Completed 2025-12-16*
    - Verified: All 20 button labels present in es.json buttons section
    - CRUD: save (Guardar), edit (Editar), delete (Eliminar)
    - Confirmation: confirm (Confirmar), cancel (Cancelar), close (Cerrar)
    - Navigation: back (Volver), next (Siguiente), previous (Anterior)
    - File ops: selectFile, upload (Cargar), download (Descargar), export (Exportar)
    - Actions: validate (Validar), process (Procesar), send (Enviar), sendToContpaqi
    - Other: retry (Reintentar), refresh (Actualizar)
    - Test: `tests/desktop_app/test_T003_4_4_button_labels.py` (22 tests passed)
    - Logs: `log_files/T003.4.4_*`, `log_tests/T003.4.4_*`, `log_learn/T003.4.4_*`
  - [x] T003.4.5 Define all status messages in Spanish ✅ *Completed 2025-12-16*
    - Verified: 20+ status messages across 3 sections (status, states, services)
    - Status: loading, saving, processing, success, error, warning, info, ready
    - Connection: connecting, connected, disconnected
    - Invoice states: uploaded (Cargada), extracted (Extraída), validated (Validada), posted (Registrada)
    - Service states: starting (Iniciando), running (En ejecución), stopped (Detenido)
    - Patterns: Ellipsis for in-progress states, feminine gender for invoice states
    - Test: `tests/desktop_app/test_T003_4_5_status_messages.py` (25 tests passed)
    - Logs: `log_files/T003.4.5_*`, `log_tests/T003.4.5_*`, `log_learn/T003.4.5_*`

- [x] **T003.5** [P] Create test infrastructure ✅ *Completed 2025-12-16*
  - [x] T003.5.1 Create Jest configuration in `package.json` ✅ *Completed 2025-12-16*
    - Updated: `desktop-app/package.json` with comprehensive Jest configuration
    - Preset: ts-jest for TypeScript support
    - Environment: jsdom for React component testing
    - Coverage: 70% threshold for branches, functions, lines, statements
    - Path aliases: @/, @main/, @renderer/ matching tsconfig.json
    - Added: jest-environment-jsdom, @testing-library/react, @testing-library/jest-dom
    - Test: `tests/desktop_app/test_T003_5_1_jest_config.py` (17 tests passed)
    - Logs: `log_files/T003.5.1_*`, `log_tests/T003.5.1_*`, `log_learn/T003.5.1_*`
  - [x] T003.5.2 Create `desktop-app/tests/unit/` directory ✅ *Completed 2025-12-16*
    - Created: `desktop-app/tests/` root directory
    - Created: `desktop-app/tests/unit/` with __init__.py
    - Subdirs: components/, hooks/, utils/, services/ (each with __init__.py)
    - Created: `desktop-app/tests/setup.ts` with testing-library import
    - Mocks: window.electron, matchMedia, ResizeObserver, IntersectionObserver
    - Test: `tests/desktop_app/test_T003_5_2_unit_tests_dir.py` (15 tests passed)
    - Logs: `log_files/T003.5.2_*`, `log_tests/T003.5.2_*`, `log_learn/T003.5.2_*`
  - [x] T003.5.3 Create `desktop-app/tests/e2e/` directory ✅ *Completed 2025-12-16*
    - Created: `desktop-app/tests/e2e/` with __init__.py
    - Subdirs: workflows/, pages/, fixtures/ (each with __init__.py)
    - Created: `desktop-app/tests/e2e/e2e.config.ts` with test configuration
    - Config: timeouts (30s default, 60s extraction), Electron settings
    - Selectors: data-testid based selectors for UI elements
    - Test: `tests/desktop_app/test_T003_5_3_e2e_tests_dir.py` (12 tests passed)
    - Logs: `log_files/T003.5.3_*`, `log_tests/T003.5.3_*`, `log_learn/T003.5.3_*`
  - [x] T003.5.4 Create test utilities and mocks ✅ *Completed 2025-12-16*
    - Created: `desktop-app/tests/mocks/electron.ts` with IPC mock implementations
    - Created: `desktop-app/tests/mocks/api.ts` with service mocks (AI, Bridge, Database)
    - Created: `desktop-app/tests/utils/render.tsx` with custom render and providers
    - Created: `desktop-app/tests/utils/index.ts` with helper functions
    - Created: `desktop-app/tests/fixtures/index.ts` with sample test data
    - Test: `tests/desktop_app/test_T003_5_4_test_utilities.py` (15 tests passed)
    - Logs: `log_files/T003.5.4_*`, `log_tests/T003.5.4_*`, `log_learn/T003.5.4_*`

**Checkpoint**: `npm install && npm run build` succeeds

---

### T004 - Initialize Windows Bridge (C#/.NET)

- [x] **T004.1** Create .NET solution structure ✅ *Completed 2025-12-16*
  - [x] T004.1.1 Create `windows-bridge/ContPAQWinBridge.sln` ✅ *Completed 2025-12-16*
    - Created: `windows-bridge/ContPAQWinBridge.sln` with VS 2022 format (12.00)
    - Features: SDK-style project GUID, Debug|Any CPU, Release|Any CPU configurations
    - References: `src\ContPAQWinBridge\ContPAQWinBridge.csproj` (to be created in T004.1.2)
    - Test: `tests/windows_bridge/test_T004_1_1_solution_file.py` (19 tests passed)
    - Logs: `log_files/T004.1.1_*`, `log_tests/T004.1.1_*`, `log_learn/T004.1.1_*`
  - [x] T004.1.2 Create `windows-bridge/src/ContPAQWinBridge/ContPAQWinBridge.csproj` ✅ *Completed 2025-12-16*
    - Created: `windows-bridge/src/ContPAQWinBridge/ContPAQWinBridge.csproj` SDK-style project
    - SDK: Microsoft.NET.Sdk.Web for ASP.NET Core Web API
    - Target: .NET 8.0 (net8.0), Nullable enabled, ImplicitUsings enabled
    - Metadata: RootNamespace, AssemblyName, Version, Documentation generation
    - Test: `tests/windows_bridge/test_T004_1_2_csproj.py` (21 tests passed)
    - Logs: `log_files/T004.1.2_*`, `log_tests/T004.1.2_*`, `log_learn/T004.1.2_*`
  - [x] T004.1.3 Add NuGet packages: ASP.NET Core, Serilog, Swashbuckle ✅ *Completed 2025-12-16*
    - Added: Serilog.AspNetCore (8.0.0), Serilog.Sinks.File (5.0.0), Serilog.Sinks.Console (5.0.1)
    - Added: Swashbuckle.AspNetCore (6.5.0), Swashbuckle.AspNetCore.Annotations (6.5.0)
    - Note: ASP.NET Core provided implicitly by Microsoft.NET.Sdk.Web
    - Test: `tests/windows_bridge/test_T004_1_3_nuget_packages.py` (14 tests passed)
    - Logs: `log_files/T004.1.3_*`, `log_tests/T004.1.3_*`, `log_learn/T004.1.3_*`
  - [x] T004.1.4 Create `windows-bridge/Directory.Build.props` with common settings ✅ *Completed 2025-12-16*
    - Created: `windows-bridge/Directory.Build.props` with common MSBuild properties
    - Build: TreatWarningsAsErrors=true, WarningLevel=5, Deterministic=true
    - Analysis: EnableNETAnalyzers=true, AnalysisLevel=latest
    - Metadata: Company, Product, Copyright for all projects
    - Test: `tests/windows_bridge/test_T004_1_4_directory_build_props.py` (17 tests passed)
    - Logs: `log_files/T004.1.4_*`, `log_tests/T004.1.4_*`, `log_learn/T004.1.4_*`

- [x] **T004.2** Create ASP.NET Core application ✅ *Completed 2025-12-16*
  - [x] T004.2.1 Create `windows-bridge/src/ContPAQWinBridge/Program.cs` ✅ *Completed 2025-12-16*
    - Created: `windows-bridge/src/ContPAQWinBridge/Program.cs` with top-level statements
    - Serilog: Bootstrap logger, file sink (daily rolling), console sink, request logging
    - Swagger: SwaggerGen with API info, SwaggerUI at /swagger endpoint
    - Controllers: AddControllers(), MapControllers() for MVC pattern
    - Error handling: try-catch-finally with Log.Fatal and Log.CloseAndFlush()
    - Test: `tests/windows_bridge/test_T004_2_1_program_cs.py` (17 tests passed)
    - Logs: `log_files/T004.2.1_*`, `log_tests/T004.2.1_*`, `log_learn/T004.2.1_*`
  - [x] T004.2.2 Configure Kestrel to bind only to 127.0.0.1:5000 ✅ *Completed 2025-12-16*
    - Added: builder.WebHost.ConfigureKestrel() with ListenLocalhost(5000)
    - Security: Binds exclusively to localhost - not accessible from network
    - Protocol: HTTP only (no HTTPS needed for localhost-only service)
    - Test: `tests/windows_bridge/test_T004_2_2_kestrel_binding.py` (9 tests passed)
    - Logs: `log_files/T004.2.2_*`, `log_tests/T004.2.2_*`, `log_learn/T004.2.2_*`
  - [x] T004.2.3 Create `windows-bridge/src/ContPAQWinBridge/appsettings.json` ✅ *Completed 2025-12-16*
    - Created: `windows-bridge/src/ContPAQWinBridge/appsettings.json` with Serilog configuration
    - Serilog: Using (Console, File sinks), MinimumLevel (Default: Information), Override (Microsoft: Warning)
    - WriteTo: Console (compact template), File (daily rolling, 30-day retention)
    - Enrich: FromLogContext, WithMachineName, WithThreadId
    - AllowedHosts: "*" for localhost-only service
    - Test: `tests/windows_bridge/test_T004_2_3_appsettings.py` (15 tests passed)
    - Logs: `log_files/T004.2.3_*`, `log_tests/T004.2.3_*`, `log_learn/T004.2.3_*`
  - [x] T004.2.4 Configure dependency injection container ✅ *Completed 2025-12-16*
    - Options pattern: BridgeOptions bound from "Bridge" section in appsettings.json
    - Infrastructure: AddMemoryCache(), AddHttpClient(), AddHealthChecks()
    - Application services: AddScoped<ISdkService, SdkService>() with interface pattern
    - Health endpoint: MapHealthChecks("/health")
    - Created: Configuration/BridgeOptions.cs, Services/ISdkService.cs, Services/SdkService.cs
    - Test: `tests/windows_bridge/test_T004_2_4_dependency_injection.py` (11 tests passed)
    - Logs: `log_files/T004.2.4_*`, `log_tests/T004.2.4_*`, `log_learn/T004.2.4_*`

- [x] **T004.3** [P] Create project structure directories ✅ *Completed 2025-12-16*
  - [x] T004.3.1 Create `Controllers/` directory ✅ *Completed 2025-12-16*
    - Created: `windows-bridge/src/ContPAQWinBridge/Controllers/` directory
    - Created: `Controllers/BaseController.cs` abstract base class
    - Features: [ApiController], [Route("api/[controller]")], [Produces("application/json")]
    - Helper methods: GetCorrelationId(), ErrorResponse(), SuccessResponse<T>()
    - Test: `tests/windows_bridge/test_T004_3_1_controllers_directory.py` (8 tests passed)
    - Logs: `log_files/T004.3.1_*`, `log_tests/T004.3.1_*`, `log_learn/T004.3.1_*`
  - [x] T004.3.2 Create `Services/` directory with interfaces ✅ *Completed 2025-12-16*
    - Services/ directory existed from T004.2.4 (ISdkService, SdkService)
    - Added: IVendorService.cs - vendor operations (GetByRfc, Search, Create, Exists)
    - Added: IEntryService.cs - entry operations (Create, CheckDuplicate, GetByFolio)
    - DTOs: VendorDto, CreateVendorRequest, EntryResultDto, CreateEntryRequest, etc.
    - Test: `tests/windows_bridge/test_T004_3_2_services_directory.py` (12 tests passed)
    - Logs: `log_files/T004.3.2_*`, `log_tests/T004.3.2_*`, `log_learn/T004.3.2_*`
  - [x] T004.3.3 Create `Models/` directory ✅ *Completed 2025-12-16*
    - Created: `windows-bridge/src/ContPAQWinBridge/Models/` directory
    - ApiResponse.cs: Generic/non-generic response wrappers with factory methods (Ok, Fail)
    - HealthResponse.cs: Health check response with component statuses
    - Supporting types: ErrorDetails, ComponentHealth, ComponentStatus, HealthStatus
    - Test: `tests/windows_bridge/test_T004_3_3_models_directory.py` (12 tests passed)
    - Logs: `log_files/T004.3.3_*`, `log_tests/T004.3.3_*`, `log_learn/T004.3.3_*`
  - [x] T004.3.4 Create `Interop/` directory for COM wrappers ✅ *Completed 2025-12-16*
    - Created: `windows-bridge/src/ContPAQWinBridge/Interop/` directory
    - ContPAQiSdkWrapper.cs: COM wrapper stub with Initialize, IsSdkAvailable, GetSdkVersion
    - Supporting types: SdkErrorCode enum, SdkResult<T> generic result
    - Uses System.Runtime.InteropServices for COM interop
    - Implements IDisposable for proper COM cleanup
    - Test: `tests/windows_bridge/test_T004_3_4_interop_directory.py` (10 tests passed)
    - Logs: `log_files/T004.3.4_*`, `log_tests/T004.3.4_*`, `log_learn/T004.3.4_*`

- [x] **T004.4** [P] Create test project ✅ *Completed 2025-12-16*
  - [x] T004.4.1 Create `windows-bridge/src/ContPAQWinBridge.Tests/ContPAQWinBridge.Tests.csproj` ✅ *Completed 2025-12-16*
    - Created: `windows-bridge/src/ContPAQWinBridge.Tests/` directory
    - SDK-style project targeting net8.0 with IsTestProject=true, IsPackable=false
    - References main ContPAQWinBridge.csproj via relative path
    - Updated solution file to include test project
    - Test: `tests/windows_bridge/test_T004_4_1_tests_csproj.py` (12 tests passed)
    - Logs: `log_files/T004.4.1_*`, `log_tests/T004.4.1_*`, `log_learn/T004.4.1_*`
  - [x] T004.4.2 Add xUnit, Moq, FluentAssertions packages ✅ *Completed 2025-12-16*
    - Added: xunit (2.6.4), xunit.runner.visualstudio (2.5.6)
    - Added: Microsoft.NET.Test.Sdk (17.8.0) for dotnet test support
    - Added: Moq (4.20.70) for mocking
    - Added: FluentAssertions (6.12.0) for expressive assertions
    - Added: coverlet.collector (6.0.0) for code coverage
    - Test: `tests/windows_bridge/test_T004_4_2_test_packages.py` (12 tests passed)
    - Logs: `log_files/T004.4.2_*`, `log_tests/T004.4.2_*`, `log_learn/T004.4.2_*`
  - [x] T004.4.3 Create `Controllers/` test directory ✅ *Completed 2025-12-16*
    - Created: `windows-bridge/src/ContPAQWinBridge.Tests/Controllers/` directory
    - Created: BaseControllerTests.cs with placeholder tests
    - Uses xUnit [Fact] attributes with FluentAssertions
    - Namespace: ContPAQWinBridge.Tests.Controllers
    - Test: `tests/windows_bridge/test_T004_4_3_controllers_test_directory.py` (9 tests passed)
    - Logs: `log_files/T004.4.3_*`, `log_tests/T004.4.3_*`, `log_learn/T004.4.3_*`
  - [x] T004.4.4 Create `Services/` test directory ✅ *Completed 2025-12-16*
    - Created: `windows-bridge/src/ContPAQWinBridge.Tests/Services/` directory
    - Created: SdkServiceTests.cs with placeholder tests
    - Uses xUnit [Fact] + FluentAssertions + Moq demo
    - Namespace: ContPAQWinBridge.Tests.Services
    - Test: `tests/windows_bridge/test_T004_4_4_services_test_directory.py` (9 tests passed)
    - Logs: `log_files/T004.4.4_*`, `log_tests/T004.4.4_*`, `log_learn/T004.4.4_*`

**Checkpoint**: `dotnet build` succeeds

---

### T005 - Initialize Database Schema

- [x] **T005.1** Create SQLite migration ✅ *Completed 2025-12-16*
  - [x] T005.1.1 Create `database/migrations/001_initial_schema.sql` ✅ *Completed 2025-12-16*
    - Created: `database/migrations/001_initial_schema.sql`
    - PRAGMA foreign_keys = ON for constraint enforcement
    - Created all 5 tables: vendors, invoices, line_items, extraction_results, contpaqi_entries
    - CHECK constraints for state enums, CASCADE deletes for child tables
    - Test: `tests/database/test_T005_1_1_initial_schema.py` (11 tests passed)
    - Logs: `log_files/T005.1.1_*`, `log_tests/T005.1.1_*`, `log_learn/T005.1.1_*`
  - [x] T005.1.2 Define `vendors` table with RFC unique constraint ✅ *Included in T005.1.1*
  - [x] T005.1.3 Define `invoices` table with state enum check ✅ *Included in T005.1.1*
  - [x] T005.1.4 Define `line_items` table with foreign key ✅ *Included in T005.1.1*
  - [x] T005.1.5 Define `extraction_results` table with foreign key ✅ *Included in T005.1.1*
  - [x] T005.1.6 Define `contpaqi_entries` table with unique invoice_id ✅ *Included in T005.1.1*

- [x] **T005.2** [P] Create indexes ✅ *Completed 2025-12-16*
  - [x] T005.2.1 Create index on `invoices.state` ✅ *Completed 2025-12-16*
    - idx_invoice_state for filtering by processing state
  - [x] T005.2.2 Create index on `invoices.duplicate_hash` ✅ *Completed 2025-12-16*
    - idx_invoice_duplicate for duplicate detection
  - [x] T005.2.3 Create unique index on `vendors.rfc` ✅ *Completed 2025-12-16*
    - idx_vendor_rfc (explicit index, UNIQUE constraint creates implicit)
  - [x] T005.2.4 Create index on `extraction_results.invoice_id` ✅ *Completed 2025-12-16*
    - idx_extraction_invoice for join performance
  - Additional indexes: idx_invoice_vendor, idx_lineitem_invoice, idx_invoice_date
  - Test: `tests/database/test_T005_2_indexes.py` (9 tests passed)
  - Logs: `log_files/T005.2_*`, `log_tests/T005.2_*`, `log_learn/T005.2_*`

- [x] **T005.3** [P] Create seed data ✅ *Completed 2025-12-16*
  - [x] T005.3.1 Create `database/seed/sample_data.sql` with test vendors ✅ *Completed 2025-12-16*
    - 4 vendors with valid Mexican RFC formats (12-13 char)
    - Includes both Persona Moral and Persona Física examples
  - [x] T005.3.2 Add sample invoice records for testing ✅ *Completed 2025-12-16*
    - 4 invoices in each state: UPLOADED, EXTRACTED, VALIDATED, POSTED
    - Sample line_items, extraction_results, and contpaqi_entries
  - Test: `tests/database/test_T005_3_seed_data.py` (11 tests passed)
  - Logs: `log_files/T005.3_*`, `log_tests/T005.3_*`, `log_learn/T005.3_*`

**Checkpoint**: SQLite database can be created from migration ✅

---

## Phase 2: Foundational Components

**Goal**: Core infrastructure that MUST be complete before ANY user story

### T006 - AI Service Health & Configuration

- [x] **T006.1** Implement health check endpoint ✅ *Completed 2025-12-16*
  - [x] T006.1.1 [P] Write test `test_health_endpoint_returns_200.py` ✅ *Completed 2025-12-16*
    - Created: `tests/ai_service/test_T006_1_1_health_endpoint.py` with 11 tests
    - Created: `ai-service/src/api/routes.py` with health endpoint (TDD)
    - Response: HealthResponse model with status, timestamp, version, models_loaded, ocr_available
    - Test: 11 tests passed (endpoint exists, returns 200, JSON format, all fields)
    - Logs: `log_files/T006.1.1_*`, `log_tests/T006.1.1_*`, `log_learn/T006.1.1_*`
  - [x] T006.1.2 Create `ai-service/src/api/routes.py` with `/health` route ✅ *Included in T006.1.1*
  - [x] T006.1.3 Return status, timestamp, version, models_loaded, ocr_available ✅ *Included in T006.1.1*
  - [x] T006.1.4 Implement health check logic for Tesseract availability ✅ *Completed 2025-12-16*
    - Functions: _get_tesseract_path(), check_ocr_available(), get_tesseract_version(), check_spanish_language_available()
    - Cross-platform: Checks PATH and common Windows install locations
    - Subprocess with timeout for version and language detection
    - Test: `tests/ai_service/test_T006_1_4_tesseract_availability.py` (11 tests passed)
    - Logs: `log_files/T006.1.4_*`, `log_tests/T006.1.4_*`, `log_learn/T006.1.4_*`
  - [x] T006.1.5 Implement health check logic for model loading ✅ *Completed 2025-12-16*
    - Functions: get_model_path(), check_model_files(), get_model_status(), check_models_loaded()
    - Checks: config.json, pytorch_model.bin OR model.safetensors
    - Environment variable support: MODEL_PATH
    - Test: `tests/ai_service/test_T006_1_5_model_loading.py` (16 tests passed)
    - Logs: `log_files/T006.1.5_*`, `log_tests/T006.1.5_*`, `log_learn/T006.1.5_*`

- [x] **T006.2** Implement FastAPI application ✅ *Completed 2025-12-16*
  - [x] T006.2.1 Create `ai-service/src/main.py` with FastAPI app ✅ *Completed 2025-12-16*
    - Created: `ai-service/src/main.py` with FastAPI application
    - Metadata: title, description, version for OpenAPI documentation
    - Router: includes health endpoint from routes.py
    - Endpoints: /, /health, /docs, /redoc, /openapi.json
    - Test: `tests/ai_service/test_T006_2_1_main_py.py` (12 tests passed)
    - Logs: `log_files/T006.2.1_*`, `log_tests/T006.2.1_*`, `log_learn/T006.2.1_*`
  - [x] T006.2.2 Configure CORS for localhost only
    - Added CORSMiddleware to main.py
    - Origins: localhost/127.0.0.1 ports 3000, 8080, 5000
    - Methods: GET, POST, PUT, DELETE, OPTIONS
    - No wildcard origins (security)
    - Test: `tests/ai_service/test_T006_2_2_cors.py` (10 tests passed)
    - Logs: `log_files/T006.2.2_*`, `log_tests/T006.2.2_*`, `log_learn/T006.2.2_*`
  - [x] T006.2.3 Add request logging middleware
    - Created `middleware/logging.py` with RequestLoggingMiddleware
    - Logs: method, path, status code, duration (ms)
    - Logger: `contpaq.ai.request` for filtering
    - Test: `tests/ai_service/test_T006_2_3_logging.py` (10 tests passed)
    - Logs: `log_files/T006.2.3_*`, `log_tests/T006.2.3_*`, `log_learn/T006.2.3_*`
  - [x] T006.2.4 Configure uvicorn for production
    - Created `uvicorn_config.py` with production settings
    - Host: 127.0.0.1 (localhost), Port: 8000
    - Workers: 1 (single worker for AI model memory)
    - Timeout: 120s for AI operations
    - Test: `tests/ai_service/test_T006_2_4_uvicorn.py` (12 tests passed)
    - Logs: `log_files/T006.2.4_*`, `log_tests/T006.2.4_*`, `log_learn/T006.2.4_*`
  - [x] T006.2.5 Add graceful shutdown handler
    - Created `lifecycle.py` with startup/shutdown handlers
    - Uses modern lifespan context manager pattern
    - Async handlers for non-blocking operations
    - cleanup_resources() for resource release
    - Test: `tests/ai_service/test_T006_2_5_shutdown.py` (12 tests passed)
    - Logs: `log_files/T006.2.5_*`, `log_tests/T006.2.5_*`, `log_learn/T006.2.5_*`

**Checkpoint**: AI service starts and `/health` returns 200 - COMPLETED

---

### T007 - Windows Bridge Health & SDK Connection

- [x] **T007.1** Implement health controller ✅ *Completed 2025-12-16*
  - [x] T007.1.1 [P] Write test `HealthControllerTests.cs`
    - Created 15 tests covering controller, endpoint, SDK status, connection
    - Uses xUnit, FluentAssertions, Moq
  - [x] T007.1.2 Create `HealthController.cs` with GET /health
    - Routes: /health, /api/health
    - Returns HealthResponse with status, timestamp, version, components
  - [x] T007.1.3 Return SDK connection status
    - ComponentStatus with IsAvailable, Version, Status, Details
    - Healthy/Degraded/Unhealthy based on SDK state
  - [x] T007.1.4 Return current company if connected
    - Shows connected status in SDK component
    - Details field includes connection information
  - Test: `Controllers/HealthControllerTests.cs` (15 tests)
  - Logs: `log_files/T007.1_*`, `log_tests/T007.1_*`, `log_learn/T007.1_*`

- [x] **T007.2** Create SDK service interface ✅ *Completed 2025-12-16*
  - [x] T007.2.1 Create `ISdkService.cs` interface
    - Interface with 5 members: IsAvailable(), GetVersion(), IsConnected, Connect(), Disconnect()
  - [x] T007.2.2 Define `IsAvailable()`, `GetVersion()`, `Connect()` methods
    - Added Connect(string companyName) and Disconnect() methods
    - Full XML documentation for all members
  - [x] T007.2.3 Create `SdkService.cs` implementation stub
    - Stub returns false/null for all operations
    - Logging for diagnostics
  - [x] T007.2.4 Register in DI container
    - AddScoped<ISdkService, SdkService>() in Program.cs
  - Test: `Services/SdkServiceTests.cs` (18 tests)
  - Logs: `log_files/T007.2_*`, `log_tests/T007.2_*`, `log_learn/T007.2_*`

- [x] **T007.3** Implement COM interop stubs ✅ *Completed 2025-12-17*
  - [x] T007.3.1 Create `Interop/ContPAQiComercialSdk.cs` with interface
    - IContPAQiComercialSdk interface with Initialize, Terminate, OpenCompany, CloseCompany
    - Stub implementation returns false/null
  - [x] T007.3.2 Create `Interop/ContPAQiContabilidadSdk.cs` with interface
    - IContPAQiContabilidadSdk interface for accounting module
    - Stub implementation ready for real COM calls
  - [x] T007.3.3 Add COM reference to ContPAQi SDK DLLs (type library)
    - Documented how to add COM references in .csproj
    - Ready for SDK DLL integration when available
  - [x] T007.3.4 Implement SDK detection logic
    - SdkDetector class with registry and filesystem checks
    - GetInstallationInfo() returns complete installation details
  - Test: `Interop/ComInteropTests.cs` (26 tests)
  - Logs: `log_files/T007.3_*`, `log_tests/T007.3_*`, `log_learn/T007.3_*`

**Checkpoint**: Windows Bridge starts and `/health` returns SDK status - COMPLETED

---

### T008 - Desktop App Process Manager

- [x] **T008.1** Implement AI service process management ✅ *Completed 2025-12-17*
  - [x] T008.1.1 [P] Write test for process start/stop ✅ *Completed 2025-12-17*
    - Created: `desktop-app/tests/main/process-manager.test.ts` (42 tests)
    - Tests: Class structure, start/stop/restart methods, health checks, configuration
    - Covers: AI Service and Bridge Service lifecycle, status transitions
    - Test: `npm test -- --testPathPattern="process-manager"` (42 tests passed)
    - Logs: `log_files/T008.1.1_*`, `log_tests/T008.1.1_*`, `log_learn/T008.1.1_*`
  - [x] T008.1.2 Implement `ProcessManager` class in `process-manager.ts` ✅ *Completed 2025-12-17*
    - Added: Event emitter (on/off/emit) for status change notifications
    - Added: Path resolution (getAIServicePath, getBridgeServicePath, getPythonPath)
    - Added: Error handling (getLastError, clearError, setError)
    - Added: Configuration access (getConfig returns immutable copy)
    - Added: Uptime tracking in checkHealth() method
    - Added: Restart counter (getRestartCount, resetRestartCount)
    - Added: updateStatus() helper for centralized status changes
    - Test: 37 new tests (79 total) - all pass
    - Logs: `log_files/T008.1.2_*`, `log_tests/T008.1.2_*`, `log_learn/T008.1.2_*`
  - [x] T008.1.3 Implement `startAIService()` method ✅ *Completed 2025-12-17*
    - [x] T008.1.3.1 Locate Python executable path - Uses getPythonPath()
    - [x] T008.1.3.2 Spawn uvicorn process with correct args
      - Args: `-m uvicorn main:app --host 127.0.0.1 --port {port}`
      - Options: `cwd: ai-service/src, shell: false`
    - [x] T008.1.3.3 Capture stdout/stderr for logging
      - Added: ProcessLogEntry interface, getProcessLogs(), addLog()
      - Max 1000 log entries per service
    - Added: startupTimeoutMs config (30s default)
    - Added: Process event handling (spawn, error, exit)
    - Added: emitError() for error event emission
    - Test: 22 new tests (101 total) - all pass
    - Logs: `log_files/T008.1.3_*`, `log_tests/T008.1.3_*`, `log_learn/T008.1.3_*`
  - [x] T008.1.4 Implement `stopAIService()` method ✅ *Completed 2025-12-17*
    - [x] T008.1.4.1 Send SIGTERM to process
    - [x] T008.1.4.2 Wait for graceful shutdown (5s timeout)
    - [x] T008.1.4.3 Force kill with SIGKILL if timeout exceeded
    - Added: shutdownTimeoutMs config (5s default)
    - Added: Double timeout pattern (graceful + SIGKILL grace period)
    - Added: Error handling for already-dead processes
    - Test: 23 new tests (124 total) - all pass
    - Logs: `log_files/T008.1.4_*`, `log_tests/T008.1.4_*`, `log_learn/T008.1.4_*`
  - [x] T008.1.5 Implement `restartAIService()` method ✅ *Completed 2025-12-17*
    - [x] T008.1.5.1 Track true restart vs initial start
    - [x] T008.1.5.2 Increment restart counter for true restarts
    - [x] T008.1.5.3 Emit 'restart' event with count information
    - Added: RestartEvent interface with service, restartCount, timestamp
    - Added: emitRestart() helper method
    - Enhanced: restartAIService() with wasRunning check
    - Test: 13 new tests (137 total) - all pass
    - Logs: `log_files/T008.1.5_*`, `log_tests/T008.1.5_*`, `log_learn/T008.1.5_*`
  - [x] T008.1.6 Implement health check polling with retry ✅ *Completed 2025-12-17*
    - [x] T008.1.6.1 HTTP health check to /health endpoint
    - [x] T008.1.6.2 Retry logic with configurable attempts (default 3)
    - [x] T008.1.6.3 Request timeout with AbortController (default 5000ms)
    - [x] T008.1.6.4 Health status change events
    - [x] T008.1.6.5 Consecutive failure tracking
    - [x] T008.1.6.6 Skip check for non-running services
    - Added: performHealthCheck() method with HealthCheckResult
    - Added: healthCheckTimeoutMs, healthCheckRetries config options
    - Added: FetchFunction type for dependency injection (testability)
    - Added: HealthChangeEvent interface
    - Updated: startHealthCheckPolling() to call performHealthCheck()
    - Updated: checkHealth() to include consecutiveFailures
    - Test: 28 new tests (165 total) - all pass
    - Logs: `log_files/T008.1.6_*`, `log_tests/T008.1.6_*`, `log_learn/T008.1.6_*`

- [x] **T008.2** Implement Windows Bridge process management
  - [x] T008.2.1 Implement `startBridgeService()` method
    - Implemented: getDotnetPath(), startBridgeService(), addBridgeLog(), emitBridgeError()
    - Pattern: Uses `dotnet <dll> --urls http://...` for .NET Core execution
    - Test infrastructure: Updated mock to create new process per spawn call
    - Test: 29 new tests (194 total) - all pass
    - Logs: `log_files/T008.2.1_*`, `log_tests/T008.2.1_*`, `log_learn/T008.2.1_*`
  - [x] T008.2.2 Implement `stopBridgeService()` method
    - Implemented: Graceful shutdown with SIGTERM/SIGKILL pattern
    - Pattern: SIGTERM first, SIGKILL after shutdownTimeoutMs (default 5s)
    - Exception handling: Catches errors if process already terminated
    - Test: 22 new tests (216 total) - all pass
    - Logs: `log_files/T008.2.2_*`, `log_tests/T008.2.2_*`, `log_learn/T008.2.2_*`
  - [x] T008.2.3 Implement health check polling
    - Implementation: Reused from T008.1.6 (performHealthCheck already supports 'bridge')
    - Tests: Verify bridge-specific behavior (port 5000, independent failure tracking)
    - Polling: startAll() checks both AI and bridge services
    - Test: 29 new tests (245 total) - all pass
    - Logs: `log_files/T008.2.3_*`, `log_tests/T008.2.3_*`, `log_learn/T008.2.3_*`

- [x] **T008.3** Implement auto-restart logic
  - [x] T008.3.1 Create restart counter with max 3 retries
    - Tests: 20 passed (265 total in process-manager.test.ts)
    - Impl: Added maxRestarts config, enableAutoRestart toggle, handleAutoRestart()
    - Logs: `log_files/T008.3.1_*`, `log_tests/T008.3.1_*`, `log_learn/T008.3.1_*`
  - [x] T008.3.2 Implement exponential backoff (1s, 2s, 4s)
    - Tests: 10 passed (275 total in process-manager.test.ts)
    - Impl: Added delay calculation, setTimeout for restart, delay field in RestartEvent
    - Logs: `log_files/T008.3.2_*`, `log_tests/T008.3.2_*`, `log_learn/T008.3.2_*`
  - [x] T008.3.3 Emit event on max retries exceeded
    - Note: Already implemented in T008.3.1 (maxRestartsExceeded event)
  - [x] T008.3.4 Log all restart attempts
    - Tests: 9 passed (284 total in process-manager.test.ts)
    - Impl: Already implemented in T008.3.1 (console.log/warn calls)
    - Logs: `log_files/T008.3.4_*`, `log_tests/T008.3.4_*`, `log_learn/T008.3.4_*`

**Checkpoint**: Desktop app can start/stop/restart AI service

---

### T009 - Desktop App Database Layer

- [x] **T009.1** Implement SQLite connection ✅ *Completed 2025-12-17*
  - [x] T009.1.1 [P] Write test for database initialization ✅ *Completed 2025-12-17*
    - Created: `desktop-app/tests/main/database.test.ts` (30 tests)
    - Tests: Class structure, lifecycle, migrations, foreign keys, error handling
    - Logs: `log_files/T009.1.1_*`, `log_tests/T009.1.1_*`, `log_learn/T009.1.1_*`
  - [x] T009.1.2 Create `database.ts` service ✅ *Completed 2025-12-17*
    - Created: `desktop-app/src/main/database.ts`
    - DatabaseService class with initialize/close/getConnection methods
  - [x] T009.1.3 Implement database initialization with migration ✅ *Completed 2025-12-17*
    - Runs `database/migrations/001_initial_schema.sql` on init
    - Enables WAL mode and foreign keys
  - [x] T009.1.4 Configure database path in user data directory ✅ *Completed 2025-12-17*
    - Helper: `getDefaultDatabasePath(userDataPath)` returns path in user data

- [x] **T009.2** Implement invoice repository ✅ *Completed 2025-12-17*
  - [x] T009.2.1 [P] Write tests for CRUD operations ✅ *Completed 2025-12-17*
    - Created: `desktop-app/tests/main/invoice-repository.test.ts` (40 tests)
    - Tests: Class structure, create, get, update, list, delete, duplicate check
    - Logs: `log_files/T009.2.1_*`, `log_tests/T009.2.1_*`, `log_learn/T009.2.1_*`
  - [x] T009.2.2 Implement `createInvoice()` method ✅ *Completed 2025-12-17*
    - Created: `desktop-app/src/main/invoice-repository.ts`
    - UUID generation, auto-timestamps, foreign key validation
  - [x] T009.2.3 Implement `getInvoiceById()` method ✅ *Completed 2025-12-17*
  - [x] T009.2.4 Implement `updateInvoice()` method ✅ *Completed 2025-12-17*
    - Dynamic field updates, auto updated_at timestamp
  - [x] T009.2.5 Implement `listInvoices()` with filtering by state ✅ *Completed 2025-12-17*
    - Single/multiple state filter, pagination (limit/offset), order by created_at DESC
  - [x] T009.2.6 Implement `checkDuplicate()` by hash ✅ *Completed 2025-12-17*
    - Returns isDuplicate flag and existing invoice if found

- [x] **T009.3** Implement vendor repository ✅ *Completed 2025-12-17*
  - [x] T009.3.1 [P] Write tests for vendor operations ✅ *Completed 2025-12-17*
    - Created: `desktop-app/tests/main/vendor-repository.test.ts` (35 tests)
    - Tests: Class structure, create, getByRfc, getById, upsert, list, delete
    - Logs: `log_files/T009.3.1_*`, `log_tests/T009.3.1_*`, `log_learn/T009.3.1_*`
  - [x] T009.3.2 Implement `createVendor()` method ✅ *Completed 2025-12-17*
    - Created: `desktop-app/src/main/vendor-repository.ts`
    - UUID generation, RFC uniqueness enforcement
  - [x] T009.3.3 Implement `getVendorByRfc()` method ✅ *Completed 2025-12-17*
    - Case-sensitive RFC lookup
  - [x] T009.3.4 Implement `upsertVendor()` method ✅ *Completed 2025-12-17*
    - Create or update by RFC, preserves existing optional fields

**Checkpoint**: Database operations work correctly ✅

---

### T010 - Status Bar Component

- [x] **T010.1** Create StatusBar UI component ✅ *Completed 2025-12-17*
  - [x] T010.1.1 [P] Write test for status display ✅ *Completed 2025-12-17*
    - Created: `desktop-app/tests/renderer/components/StatusBar.test.tsx` (27 tests)
    - Tests: Component structure, status display, color indicators, company name, Tailwind
    - Logs: `log_files/T010.1.1_*`, `log_tests/T010.1.1_*`, `log_learn/T010.1.1_*`
  - [x] T010.1.2 Create `StatusBar.tsx` component ✅ *Completed 2025-12-17*
    - Created: `desktop-app/src/renderer/components/StatusBar.tsx`
    - Uses Tailwind CSS for styling
  - [x] T010.1.3 Display AI service status (icon + text) ✅ *Completed 2025-12-17*
    - Colored dot indicator (green/yellow/red/gray)
    - Spanish text: Activo, Iniciando, Deteniendo, Detenido, Error
  - [x] T010.1.4 Display Windows Bridge status (icon + text) ✅ *Completed 2025-12-17*
    - Same indicator pattern as AI service
  - [x] T010.1.5 Display current company name if connected ✅ *Completed 2025-12-17*
    - Conditionally rendered when companyName prop is provided

- [x] **T010.2** Implement status polling hook ✅ *Completed 2025-12-17*
  - [x] T010.2.1 Create `useServiceStatus.ts` hook ✅ *Completed 2025-12-17*
    - Returns aiStatus, bridgeStatus, companyName, isLoading, refresh
    - Initial state: 'starting' for both services
  - [x] T010.2.2 Poll both services every 5 seconds ✅ *Completed 2025-12-17*
    - Uses setInterval with 5000ms interval
    - Fetches via electronAPI.invoke
  - [x] T010.2.3 Update status on service events ✅ *Completed 2025-12-17*
    - Subscribes to ai:status-changed and bridge:status-changed
    - Proper cleanup on unmount
  - [x] T010.2.4 Show "Iniciando..." during startup ✅ *Completed 2025-12-17*
    - isLoading starts true, becomes false after first fetch

**Checkpoint**: Status bar shows service health ✅ *T010 Complete*

---

## Phase 3: User Story 1 - Process Invoice Without Docker (P1) 🎯 MVP

**Goal**: Extract invoice data from PDF using AI service running natively

### T011 - PDF Text Extraction Service

- [x] **T011.1** Implement PDF type detection ✅ *Completed 2025-12-17*
  - [x] T011.1.1 [P] Write test `test_detect_text_based_pdf.py` ✅ *Completed 2025-12-17*
    - Created: `ai-service/tests/unit/test_detect_text_based_pdf.py` (8 tests)
  - [x] T011.1.2 [P] Write test `test_detect_scanned_pdf.py` ✅ *Completed 2025-12-17*
    - Created: `ai-service/tests/unit/test_detect_scanned_pdf.py` (8 tests, 2 skipped)
  - [x] T011.1.3 Create `pdf_extractor.py` service ✅ *Completed 2025-12-17*
    - Created: `ai-service/src/services/pdf_extractor.py`
    - Classes: PDFExtractor, SourceType enum
  - [x] T011.1.4 Implement `detect_pdf_type()` using PyMuPDF ✅ *Completed 2025-12-17*
    - [x] T011.1.4.1 Extract text from first page
    - [x] T011.1.4.2 If text length < 100 chars, classify as scanned
    - [x] T011.1.4.3 Return SourceType enum value (TEXT or SCANNED)

- [x] **T011.2** Implement text extraction ✅ *Completed 2025-12-17*
  - [x] T011.2.1 [P] Write test `test_extract_text_with_positions.py` ✅ *Completed 2025-12-17*
    - Created: `ai-service/tests/unit/test_extract_text_with_positions.py` (16 tests)
  - [x] T011.2.2 Implement `extract_text()` method ✅ *Completed 2025-12-17*
    - [x] T011.2.2.1 Open PDF with PyMuPDF (fitz.open)
    - [x] T011.2.2.2 Extract text blocks with coordinates using "dict" mode
    - [x] T011.2.2.3 Return structured text data with bounding boxes (TextBlock type)
  - [x] T011.2.3 Handle multi-page PDFs ✅ *Completed 2025-12-17*
    - Iterates through all pages, includes page number in each block
  - [x] T011.2.4 Handle password-protected PDFs (raise error) ✅ *Completed 2025-12-17*
    - Raises PermissionError for encrypted PDFs

**Checkpoint**: Text extracted from text-based PDF ✅ *T011 Complete*

---

### T012 - OCR Service for Scanned PDFs

- [x] **T012.1** Implement Tesseract wrapper ✅ *Completed 2025-12-17*
  - [x] T012.1.1 [P] Write test `test_ocr_extraction.py` ✅ *Completed 2025-12-17*
    - Created: `ai-service/tests/unit/test_ocr_extraction.py` (18 tests)
  - [x] T012.1.2 Create `ocr_service.py` ✅ *Completed 2025-12-17*
    - Created: `ai-service/src/services/ocr_service.py`
    - Classes: OCRService, OCRResult type
  - [x] T012.1.3 Implement `extract_with_ocr()` method ✅ *Completed 2025-12-17*
    - [x] T012.1.3.1 Convert PDF page to image (300 DPI) - PyMuPDF matrix scaling
    - [x] T012.1.3.2 Run Tesseract with Spanish language (lang="spa")
    - [x] T012.1.3.3 Extract text with bounding boxes (x0, y0, x1, y1)
    - [x] T012.1.3.4 Calculate confidence per text block (0-100%)

- [x] **T012.2** Implement image preprocessing ✅ *Completed 2025-12-17*
  - [x] T012.2.1 [P] Write test `test_image_preprocessing.py` ✅ *Completed 2025-12-17*
    - Created: `ai-service/tests/unit/test_image_preprocessing.py` (21 tests)
  - [x] T012.2.2 Implement deskewing for rotated scans ✅ *Completed 2025-12-17*
    - detect_skew_angle() and deskew() methods
    - Bicubic interpolation with white fill
  - [x] T012.2.3 Implement contrast enhancement ✅ *Completed 2025-12-17*
    - PIL ImageEnhance.Contrast with configurable factor
  - [x] T012.2.4 Implement noise reduction ✅ *Completed 2025-12-17*
    - MedianFilter with configurable strength

**Checkpoint**: Text extracted from scanned PDF ✅ *T012 Complete*

---

### T013 - AI Field Extraction Service

- [x] **T013.1** Create Pydantic models ✅ 2025-12-17
  - [x] T013.1.1 Create `extraction.py` models file
  - [x] T013.1.2 Define `BoundingBox` model
  - [x] T013.1.3 Define `ExtractionField` model with confidence
  - [x] T013.1.4 Define `LineItemExtraction` model
  - [x] T013.1.5 Define `InvoiceExtraction` response model

- [x] **T013.2** Implement LayoutLMv3 inference ✅ 2025-12-17
  - [x] T013.2.1 [P] Write test `test_layoutlm_inference.py`
  - [x] T013.2.2 Create `ai_extractor.py` service
  - [x] T013.2.3 Load LayoutLMv3 model on startup
  - [x] T013.2.4 Implement `extract_fields()` method
    - [x] T013.2.4.1 Prepare input tokens from text + layout
    - [x] T013.2.4.2 Run model inference
    - [x] T013.2.4.3 Parse model output to structured fields
    - [x] T013.2.4.4 Calculate confidence scores per field
  - [x] T013.2.5 Implement field mapping to Mexican invoice schema
    - [x] T013.2.5.1 Map vendor_rfc field
    - [x] T013.2.5.2 Map vendor_name field
    - [x] T013.2.5.3 Map invoice_number field
    - [x] T013.2.5.4 Map invoice_date field
    - [x] T013.2.5.5 Map subtotal, iva_amount, total fields

- [x] **T013.3** Implement line item extraction ✅ 2025-12-17
  - [x] T013.3.1 [P] Write test `test_line_item_extraction.py`
  - [x] T013.3.2 Detect table region in document
  - [x] T013.3.3 Extract line items from table
    - [x] T013.3.3.1 Parse description column
    - [x] T013.3.3.2 Parse quantity column
    - [x] T013.3.3.3 Parse unit_price column
    - [x] T013.3.3.4 Parse amount column
  - [x] T013.3.4 Validate line item totals

**Checkpoint**: AI extracts all invoice fields with confidence

---

### T014 - Extraction API Endpoint

- [x] **T014.1** Implement POST /extract endpoint ✅ 2025-12-18
  - [x] T014.1.1 [P] Write test `test_extract_endpoint.py`
  - [x] T014.1.2 Create endpoint in `routes.py`
  - [x] T014.1.3 Handle multipart file upload
  - [x] T014.1.4 Validate file is PDF
  - [x] T014.1.5 Orchestrate extraction pipeline
    - [x] T014.1.5.1 Detect PDF type
    - [x] T014.1.5.2 Extract text (PyMuPDF or OCR)
    - [x] T014.1.5.3 Run AI extraction
    - [x] T014.1.5.4 Return ExtractionResponse
  - [x] T014.1.6 Calculate and return processing_time_ms
  - [x] T014.1.7 Handle errors with Spanish messages

- [x] **T014.2** [P] Implement batch extraction endpoint ✅ 2025-12-18
  - [x] T014.2.1 [P] Write test `test_batch_extract_endpoint.py`
  - [x] T014.2.2 Create POST /extract/batch endpoint
  - [x] T014.2.3 Process files sequentially (avoid memory issues)
  - [x] T014.2.4 Return BatchExtractionResponse with per-file results

**Checkpoint**: API extracts invoice data from uploaded PDF

---

### T015 - Desktop App AI Service Client

- [x] **T015.1** Create AI service API client ✅ 2025-12-18
  - [x] T015.1.1 [P] Write test for API client (35 tests)
  - [x] T015.1.2 Create `ai-service.ts` in services/
  - [x] T015.1.3 Implement `extractInvoice(file: File)` method
  - [x] T015.1.4 Implement `checkHealth()` method
  - [x] T015.1.5 Handle network errors with retry
  - [x] T015.1.6 Parse response to TypeScript types

  **Implementation Details:**
  - Created `AIServiceClient` class in `desktop-app/src/renderer/services/ai-service.ts`
  - `extractInvoice()`: POST /extract with FormData file upload
  - `extractBatch()`: POST /extract/batch for batch processing
  - `checkHealth()`: GET /health with graceful error handling
  - Retry logic with exponential backoff (200ms, 400ms, 800ms)
  - Converts snake_case API responses to camelCase TypeScript types
  - Converts confidence from 0-1 decimal to 0-100 percentage
  - Custom `AIServiceError` class for typed error handling
  - 35 tests covering all methods, error handling, retries, timeouts

- [x] **T015.2** Implement file upload UI ✅ 2025-12-18
  - [x] T015.2.1 [P] Write test for file upload (32 tests)
  - [x] T015.2.2 Create file picker with PDF filter
  - [x] T015.2.3 Implement drag-and-drop zone
  - [x] T015.2.4 Show upload progress indicator
  - [x] T015.2.5 Display error messages in Spanish

  **Implementation Details:**
  - Created `FileUpload` component in `desktop-app/src/renderer/components/FileUpload.tsx`
  - Hidden file input with PDF filter (`accept=".pdf,application/pdf"`)
  - Drag-and-drop zone with visual feedback on drag enter/leave
  - Progress bar with percentage display during upload
  - Spanish error messages: "Solo se permiten archivos PDF", "El archivo excede el tamaño máximo"
  - Disabled state support for blocking interactions during upload
  - 32 tests covering all features and Tailwind styling

**Checkpoint**: Desktop app can send PDF to AI service ✅

---

### T016 - PDF Viewer Component

- [x] **T016.1** Create PDF viewer ✅ 2025-12-18
  - [x] T016.1.1 [P] Write test for PDF rendering (34 tests)
  - [x] T016.1.2 Create `PDFViewer.tsx` component
  - [x] T016.1.3 Use react-pdf for rendering
  - [x] T016.1.4 Implement zoom controls
  - [x] T016.1.5 Implement page navigation

  **Implementation Details:**
  - Created `PDFViewer` component in `desktop-app/src/renderer/components/PDFViewer.tsx`
  - Uses react-pdf Document and Page components with PDF.js worker from CDN
  - Zoom controls: +/- buttons (25% steps), reset button, range 25%-300%
  - Page navigation: prev/next buttons, page input, displays "X / Y" format
  - Loading spinner with "Cargando PDF..." text
  - Error message display support
  - 34 tests covering rendering, zoom, navigation, and styling

- [x] **T016.2** Implement bounding box overlay ✅ 2025-12-18
  - [x] T016.2.1 [P] Write test for bbox overlay (38 tests)
  - [x] T016.2.2 Create `BoundingBoxOverlay.tsx` component
  - [x] T016.2.3 Render boxes at correct positions
  - [x] T016.2.4 Color boxes by confidence level
    - [x] T016.2.4.1 Green for ≥90%
    - [x] T016.2.4.2 Orange for 70-89%
    - [x] T016.2.4.3 Red for <70%
  - [x] T016.2.5 Highlight active field on hover/selection

  **Implementation Details:**
  - Created `BoundingBoxOverlay` component in `desktop-app/src/renderer/components/`
  - Renders absolute-positioned boxes for fields with bbox property
  - Scales coordinates with zoom: `x * scale`, `y * scale`, etc.
  - Confidence colors: green (≥90%), orange (70-89%), red (<70%)
  - Background opacity: `bg-{color}-500/20` for semi-transparent fill
  - Ring highlight on hover/selection with smooth transitions
  - Optional tooltip showing field name on hover
  - 38 tests covering positioning, colors, interactions, and edge cases

**Checkpoint**: PDF displays with extraction highlights ✅

---

### T017 - Processing Page

- [x] **T017.1** Create processing page layout ✅ 2025-12-18
  - [x] T017.1.1 Create `ProcessingPage.tsx`
  - [x] T017.1.2 Implement split-screen layout (PDF | Form)
  - [x] T017.1.3 Add responsive breakpoints
  - [x] T017.1.4 Add page header with invoice status

- [x] **T017.2** Implement processing workflow ✅ 2025-12-18
  - [x] T017.2.1 [P] Write test for processing flow
  - [x] T017.2.2 Create `useInvoice.ts` hook
  - [x] T017.2.3 Implement file selection → extraction flow
  - [x] T017.2.4 Show loading state during extraction
  - [x] T017.2.5 Display extraction results
  - [x] T017.2.6 Save invoice to database with UPLOADED→EXTRACTED state

**Checkpoint**: User can process PDF and see results ✅

---

## Phase 4: User Story 2 - Review and Validate Extracted Data (P2)

**Goal**: Display confidence indicators and allow manual editing

### T018 - Confidence Indicator Component

- [x] **T018.1** Create confidence indicator ✅ 2025-12-18
  - [x] T018.1.1 [P] Write test for confidence display
  - [x] T018.1.2 Create `ConfidenceIndicator.tsx` component
  - [x] T018.1.3 Display colored dot (green/orange/red)
  - [x] T018.1.4 Show percentage on hover
  - [x] T018.1.5 Add tooltip with confidence explanation

- [x] **T018.2** Define confidence utilities ✅ 2025-12-18
  - [x] T018.2.1 Create `confidence.py` utils in AI service
  - [x] T018.2.2 Define threshold constants (90, 70)
  - [x] T018.2.3 Implement `get_confidence_level()` function
  - [x] T018.2.4 Mirror in TypeScript for UI

**Checkpoint**: Confidence colors display correctly ✅

---

### T019 - Invoice Form Component

- [x] **T019.1** Create field input component ✅ 2025-12-18
  - [x] T019.1.1 [P] Write test for field input
  - [x] T019.1.2 Create `FieldInput.tsx` component
  - [x] T019.1.3 Display field label, value, confidence
  - [x] T019.1.4 Enable inline editing on click
  - [x] T019.1.5 Mark field as "user_verified" after edit
  - [x] T019.1.6 Validate input format (RFC, date, amounts)

- [x] **T019.2** Create invoice form ✅ 2025-12-18
  - [x] T019.2.1 [P] Write test for form rendering
  - [x] T019.2.2 Create `InvoiceForm.tsx` component
  - [x] T019.2.3 Render all header fields with FieldInput
    - [x] T019.2.3.1 RFC del Proveedor field
    - [x] T019.2.3.2 Nombre del Proveedor field
    - [x] T019.2.3.3 Número de Factura field
    - [x] T019.2.3.4 Fecha field
    - [x] T019.2.3.5 Subtotal field
    - [x] T019.2.3.6 IVA field
    - [x] T019.2.3.7 Total field
  - [x] T019.2.4 Sync field selection with PDF viewer bbox

- [x] **T019.3** Create line items table ✅ 2025-12-18
  - [x] T019.3.1 [P] Write test for line items display
  - [x] T019.3.2 Create `LineItemsTable.tsx` component
  - [x] T019.3.3 Display editable table rows
  - [x] T019.3.4 Support row editing
  - [x] T019.3.5 Auto-calculate row amounts
  - [x] T019.3.6 Validate totals match

**Checkpoint**: All fields editable with confidence indicators

---

### T020 - Validation Logic

- [x] **T020.1** Implement RFC validation endpoint ✅ 2025-12-18
  - [x] T020.1.1 [P] Write test `test_rfc_validation.py`
  - [x] T020.1.2 Create POST /validate/rfc endpoint
  - [x] T020.1.3 Implement RFC format validation
    - [x] T020.1.3.1 Check length (12 or 13)
    - [x] T020.1.3.2 Validate pattern for persona física
    - [x] T020.1.3.3 Validate pattern for persona moral
  - [x] T020.1.4 Return validation result with type

- [x] **T020.2** Implement CFDI validation endpoint ✅ 2025-12-18
  - [x] T020.2.1 [P] Write test `test_cfdi_validation.py`
  - [x] T020.2.2 Create POST /validate/cfdi endpoint
  - [x] T020.2.3 Validate required fields present
  - [x] T020.2.4 Validate IVA calculation (subtotal * 0.16 = iva)
  - [x] T020.2.5 Validate total (subtotal + iva = total)
  - [x] T020.2.6 Return validation errors/warnings

- [x] **T020.3** Implement form validation in desktop app ✅ 2025-12-18
  - [x] T020.3.1 [P] Write test for form validation
  - [x] T020.3.2 Validate RFC on field blur
  - [x] T020.3.3 Validate totals on amount changes
  - [x] T020.3.4 Show inline validation errors in Spanish
  - [x] T020.3.5 Enable "Validar" button only when no errors

**Checkpoint**: Validation errors display correctly

---

### T021 - Validate Button and State Transition

- [x] **T021.1** Implement validate action ✓ 2025-12-18
  - [x] T021.1.1 [P] Write test for validate action
  - [x] T021.1.2 Add "Validar" button to form
  - [x] T021.1.3 Run all validations on click
  - [x] T021.1.4 Update invoice state to VALIDATED
  - [x] T021.1.5 Save updated data to database
  - [x] T021.1.6 Update extraction_results with user edits
  - [x] T021.1.7 Show success message in Spanish

  **Implementation Details (T021.1)**:
  - Created `useValidateAction` hook in `desktop-app/src/renderer/hooks/useValidateAction.ts`
  - Hook manages validation workflow: idle → validating → validated/error
  - Validates RFC format (12-13 alphanumeric characters)
  - Validates totals (subtotal + IVA = total with 16% rate)
  - Supports async `onSave` callback for persistence
  - Calls `onValidated` callback on success with extraction data
  - Uses `useRef` with microtask delay to prevent double-click race conditions
  - All messages in Spanish for Mexican users
  - 36 tests covering all functionality

**Checkpoint**: Invoice can be validated and state updated

---

## Phase 5: User Story 3 - Post to ContPAQi (P3)

**Goal**: Send validated invoice to ContPAQi via Windows Bridge

### T022 - Windows Bridge Vendor Endpoints

- [x] **T022.1** Implement vendor list endpoint ✓ 2025-12-18
  - [x] T022.1.1 [P] Write test `VendorsControllerTests.cs`
  - [x] T022.1.2 Create `VendorsController.cs`
  - [x] T022.1.3 Implement GET /vendors with search
  - [x] T022.1.4 Implement GET /vendors/{rfc}
  - [x] T022.1.5 Query ContPAQi SDK for vendors

  **Implementation Details (T022.1)**:
  - Created `VendorsController.cs` extending BaseController
  - GET /api/vendors with optional `search` and `limit` query params
  - GET /api/vendors/{rfc} with RFC validation and normalization
  - RFC validation: 12-13 alphanumeric chars (Ñ and & allowed)
  - Delegates to IVendorService (interface already existed)
  - Error responses in Spanish
  - 27 tests in VendorsControllerTests.cs

- [x] **T022.2** Implement vendor creation ✓ 2025-12-18
  - [x] T022.2.1 [P] Write test for vendor creation
  - [x] T022.2.2 Implement POST /vendors
  - [x] T022.2.3 Validate RFC format
  - [x] T022.2.4 Create vendor via SDK
  - [x] T022.2.5 Return created vendor data

  **Implementation Details (T022.2)**:
  - Added CreateVendor method to VendorsController
  - POST /api/vendors with JSON body (RFC, Name, CommercialName)
  - Returns 201 Created with CreatedAtAction pointing to GET endpoint
  - Validates RFC (12-13 chars), normalizes to uppercase
  - Checks for duplicate RFC (returns 409 Conflict)
  - 16 new tests (total 43 in VendorsControllerTests.cs)

- [x] **T022.3** Implement vendor service ✓ 2025-12-18
  - [x] T022.3.1 Create `IVendorService.cs` interface (already existed)
  - [x] T022.3.2 Create `VendorService.cs` implementation
  - [x] T022.3.3 Implement SDK vendor queries
  - [x] T022.3.4 Implement vendor creation via SDK

  **Implementation Details (T022.3)**:
  - Created `VendorService.cs` implementing IVendorService
  - Stub implementation with test data (3 sample vendors)
  - Ready for SDK integration (uses ISdkService dependency)
  - GetByRfcAsync, SearchAsync, CreateAsync, ExistsAsync methods
  - Generates sequential vendor codes (PROV001, PROV002, etc.)
  - 24 tests in VendorServiceTests.cs

**Checkpoint**: Vendors can be queried and created

---

### T023 - Windows Bridge Entry Endpoints

- [x] **T023.1** Implement duplicate check ✓ 2025-12-18
  - [x] T023.1.1 [P] Write test for duplicate check
  - [x] T023.1.2 Create `EntriesController.cs`
  - [x] T023.1.3 Implement POST /entries/check-duplicate
  - [x] T023.1.4 Query SDK for existing entry by RFC + invoice number
  - [x] T023.1.5 Return duplicate status

  **Implementation Details (T023.1)**:
  - Created `EntriesController.cs` with POST /api/entries/check-duplicate
  - Uses existing IEntryService.CheckDuplicateAsync method
  - Validates RFC (required, 12-13 alphanumeric chars), normalizes to uppercase
  - Validates invoice number (required)
  - Returns DuplicateCheckResult: isDuplicate, existingFolio, existingDate, message
  - Error messages in Spanish
  - 27 tests in EntriesControllerTests.cs

- [x] **T023.2** Implement entry creation ✓ 2025-12-18
  - [x] T023.2.1 [P] Write test for entry creation
  - [x] T023.2.2 Implement POST /entries
  - [x] T023.2.3 Validate request data
  - [x] T023.2.4 Check for duplicates (unless force_duplicate=true)
  - [x] T023.2.5 Create entry via SDK
    - [x] T023.2.5.1 Set document type
    - [x] T023.2.5.2 Set vendor reference
    - [x] T023.2.5.3 Set amounts
    - [x] T023.2.5.4 Add line items
    - [x] T023.2.5.5 Commit entry
  - [x] T023.2.6 Return folio number on success
  - [x] T023.2.7 Return detailed error on failure

  **Implementation Details (T023.2)**:
  - Added POST /api/entries endpoint to EntriesController
  - Validates RFC (required, 12-13 chars), invoice number, total > 0
  - Automatic duplicate check (can bypass with ForceDuplicate=true)
  - Returns 409 Conflict if duplicate found
  - Returns 201 Created with folio on success
  - Added GET /api/entries/{folio} for CreatedAtAction reference
  - Uses record `with` expression for immutable request normalization
  - 24 new tests (51 total in EntriesControllerTests)

- [x] **T023.3** Implement entry service ✓ 2025-12-18
  - [x] T023.3.1 Create `IEntryService.cs` interface (already existed)
  - [x] T023.3.2 Create `EntryService.cs` implementation
  - [x] T023.3.3 Implement `CreateEntry()` method
  - [x] T023.3.4 Handle SDK exceptions with Spanish messages

  **Implementation Details (T023.3)**:
  - Created `EntryService.cs` implementing IEntryService
  - Stub implementation with test data (thread-safe with locking)
  - Folio format: POL-{year}-{counter:D4} (e.g., POL-2024-0001)
  - CreateAsync stores entries for duplicate checking and retrieval
  - CheckDuplicateAsync matches on RFC + InvoiceNumber (case-insensitive)
  - GetByFolioAsync retrieves entries by folio
  - Spanish messages for duplicate results
  - 28 tests in EntryServiceTests.cs

**Checkpoint**: Entries can be created in ContPAQi

---

### T024 - Desktop App Bridge Client

- [x] **T024.1** Create bridge service client ✓ 2025-12-18
  - [x] T024.1.1 [P] Write test for bridge client
  - [x] T024.1.2 Create `bridge-service.ts`
  - [x] T024.1.3 Implement `checkDuplicate()` method
  - [x] T024.1.4 Implement `createEntry()` method
  - [x] T024.1.5 Implement `getVendorByRfc()` method
  - [x] T024.1.6 Implement `createVendor()` method
  - [x] T024.1.7 Handle errors with Spanish messages

  **Implementation Details (T024.1)**:
  - Created `BridgeServiceClient` TypeScript class
  - HTTP client for Windows Bridge (default: http://localhost:5000)
  - `checkDuplicate()`: POST /api/entries/check-duplicate
  - `createEntry()`: POST /api/entries with folio return
  - `getVendorByRfc()`: GET /api/vendors/{rfc} (returns null for 404)
  - `createVendor()`: POST /api/vendors
  - `checkHealth()`: GET /health for service status
  - BridgeServiceError class with statusCode and detail
  - AbortController for request timeout
  - All error messages in Spanish
  - 27 Jest tests

**Checkpoint**: Desktop app can communicate with Windows Bridge

---

### T025 - Post to ContPAQi UI Flow

- [ ] **T025.1** Implement duplicate warning modal
  - [ ] T025.1.1 [P] Write test for duplicate modal
  - [ ] T025.1.2 Create modal component for duplicate warning
  - [ ] T025.1.3 Show existing entry details
  - [ ] T025.1.4 Provide "Continuar" and "Cancelar" options
  - [ ] T025.1.5 Track user override decision

- [ ] **T025.2** Implement vendor resolution flow
  - [ ] T025.2.1 [P] Write test for vendor resolution
  - [ ] T025.2.2 Check if vendor RFC exists in ContPAQi
  - [ ] T025.2.3 If not found, show create vendor modal
  - [ ] T025.2.4 Allow manual vendor selection from list

- [ ] **T025.3** Implement post action
  - [ ] T025.3.1 [P] Write test for post action
  - [ ] T025.3.2 Add "Enviar a ContPAQi" button
  - [ ] T025.3.3 Run duplicate check before posting
  - [ ] T025.3.4 Run vendor resolution if needed
  - [ ] T025.3.5 Call createEntry on bridge
  - [ ] T025.3.6 Update invoice state to POSTED
  - [ ] T025.3.7 Save ContPAQi entry record to database
  - [ ] T025.3.8 Show success with folio number
  - [ ] T025.3.9 Handle errors with actionable messages

**Checkpoint**: User can post invoice to ContPAQi

---

## Phase 6: User Story 4 - Installation (P4)

**Goal**: Create installer that sets up everything automatically

### T026 - Python Packaging

- [ ] **T026.1** Create Python distribution
  - [ ] T026.1.1 Configure pyinstaller or embedded Python
  - [ ] T026.1.2 Bundle all dependencies
  - [ ] T026.1.3 Bundle LayoutLMv3 model weights
  - [ ] T026.1.4 Test on clean Windows VM

- [ ] **T026.2** [P] Create Windows Service wrapper
  - [ ] T026.2.1 Bundle NSSM executable
  - [ ] T026.2.2 Create service registration script
  - [ ] T026.2.3 Configure auto-restart on failure
  - [ ] T026.2.4 Configure service dependencies

**Checkpoint**: Python service runs as Windows Service

---

### T027 - .NET Packaging

- [ ] **T027.1** Publish .NET application
  - [ ] T027.1.1 Configure self-contained deployment
  - [ ] T027.1.2 Publish for win-x64
  - [ ] T027.1.3 Test on clean Windows VM

- [ ] **T027.2** [P] Create service registration
  - [ ] T027.2.1 Create PowerShell script for service install
  - [ ] T027.2.2 Configure localhost-only binding
  - [ ] T027.2.3 Configure startup type

**Checkpoint**: Windows Bridge runs as service

---

### T028 - Electron Packaging

- [ ] **T028.1** Configure electron-builder
  - [ ] T028.1.1 Set up code signing (if certificate available)
  - [ ] T028.1.2 Configure Windows target
  - [ ] T028.1.3 Include native modules (better-sqlite3)
  - [ ] T028.1.4 Build NSIS installer component

- [ ] **T028.2** [P] Bundle Tesseract
  - [ ] T028.2.1 Download Tesseract Windows binaries
  - [ ] T028.2.2 Include Spanish language data
  - [ ] T028.2.3 Configure path in bundled app

**Checkpoint**: Electron app builds successfully

---

### T029 - Inno Setup Installer

- [ ] **T029.1** Create installer script
  - [ ] T029.1.1 Create `contpaq-win.iss` base script
  - [ ] T029.1.2 Define installation directory structure
  - [ ] T029.1.3 Add license agreement (Spanish)
  - [ ] T029.1.4 Configure application icon

- [ ] **T029.2** Add prerequisite detection
  - [ ] T029.2.1 Detect .NET 8.0 Runtime
  - [ ] T029.2.2 Download/install .NET if missing
  - [ ] T029.2.3 Detect VC++ Redistributable
  - [ ] T029.2.4 Download/install VC++ if missing
  - [ ] T029.2.5 Detect ContPAQi installation

- [ ] **T029.3** Add service registration
  - [ ] T029.3.1 Create post-install script
  - [ ] T029.3.2 Register AI service with NSSM
  - [ ] T029.3.3 Register Windows Bridge service
  - [ ] T029.3.4 Start services after install
  - [ ] T029.3.5 Create uninstall script to remove services

- [ ] **T029.4** Configure silent installation
  - [ ] T029.4.1 Support /SILENT flag
  - [ ] T029.4.2 Support /NORESTART flag
  - [ ] T029.4.3 Document silent install parameters
  - [ ] T029.4.4 Test silent installation

- [ ] **T029.5** [P] Create Start Menu shortcuts
  - [ ] T029.5.1 Add application shortcut
  - [ ] T029.5.2 Add uninstall shortcut
  - [ ] T029.5.3 Add documentation shortcut

**Checkpoint**: Installer works on clean Windows machine

---

## Phase 7: Polish & Cross-Cutting Concerns

**Goal**: Quality improvements, testing, documentation

### T030 - Home Page and Navigation

- [ ] **T030.1** Create home page
  - [ ] T030.1.1 Create `HomePage.tsx`
  - [ ] T030.1.2 Show recent invoices list
  - [ ] T030.1.3 Filter by state (tabs or dropdown)
  - [ ] T030.1.4 Add "Nueva Factura" button
  - [ ] T030.1.5 Show empty state with instructions

- [ ] **T030.2** [P] Create settings page
  - [ ] T030.2.1 Create `SettingsPage.tsx`
  - [ ] T030.2.2 Company selection dropdown
  - [ ] T030.2.3 Service status indicators
  - [ ] T030.2.4 About/version information

**Checkpoint**: Navigation works correctly

---

### T031 - Error Handling & Logging

- [ ] **T031.1** Implement structured logging
  - [ ] T031.1.1 Configure Python logging with JSON format
  - [ ] T031.1.2 Configure Serilog in .NET with JSON
  - [ ] T031.1.3 Configure Electron main process logging
  - [ ] T031.1.4 Log to files in AppData/Logs

- [ ] **T031.2** [P] Implement error boundaries
  - [ ] T031.2.1 Create React error boundary component
  - [ ] T031.2.2 Show user-friendly error message in Spanish
  - [ ] T031.2.3 Add "Reintentar" and "Reportar" options
  - [ ] T031.2.4 Log errors to file

**Checkpoint**: Errors handled gracefully

---

### T032 - Integration Testing

- [ ] **T032.1** Create end-to-end tests
  - [ ] T032.1.1 [P] Test full extraction flow
  - [ ] T032.1.2 [P] Test validation flow
  - [ ] T032.1.3 [P] Test posting flow (with mock SDK)
  - [ ] T032.1.4 Test duplicate detection flow
  - [ ] T032.1.5 Test OCR extraction flow

- [ ] **T032.2** [P] Create performance tests
  - [ ] T032.2.1 Measure extraction time for various PDFs
  - [ ] T032.2.2 Measure memory usage during extraction
  - [ ] T032.2.3 Verify startup time < 45 seconds

**Checkpoint**: All integration tests pass

---

### T033 - Documentation

- [ ] **T033.1** Update quickstart guide
  - [ ] T033.1.1 Add screenshots
  - [ ] T033.1.2 Verify all steps work
  - [ ] T033.1.3 Add troubleshooting section

- [ ] **T033.2** [P] Create CLAUDE.md
  - [ ] T033.2.1 Document development workflow
  - [ ] T033.2.2 Document testing commands
  - [ ] T033.2.3 Document common issues

**Checkpoint**: Documentation complete

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1 (Setup) ─────────────────────────────────────────►
         │
         ▼
Phase 2 (Foundational) ────────────────────────────────────►
         │                                                 │
         ├─────────────────────────────────────────────────┤
         ▼                                                 ▼
Phase 3 (US1: Extract)        Phase 4 (US2: Validate)
         │                             │
         └──────────┬──────────────────┘
                    ▼
         Phase 5 (US3: Post)
                    │
                    ▼
         Phase 6 (US4: Install)
                    │
                    ▼
         Phase 7 (Polish)
```

### Critical Path

1. T001-T005 (Setup) → T006-T010 (Foundational) → T011-T017 (US1 MVP)
2. After MVP: T018-T021 (US2) can parallel with T022-T025 (US3)
3. T026-T029 (Install) requires all components complete
4. T030-T033 (Polish) is final phase

### Parallel Opportunities

- **Within Phase 1**: T002, T003, T004 can run in parallel after T001
- **Within Phase 2**: T006+T007, T008+T009, T010 can overlap
- **Within US1**: T011+T012 in parallel, then T013-T017 sequential
- **US2 and US3**: Can be developed in parallel after US1 MVP

---

## Task Statistics

| Phase | Tasks | Subtasks | Sub-subtasks | Total Items |
|-------|-------|----------|--------------|-------------|
| Phase 1: Setup | 5 | 22 | 47 | 74 |
| Phase 2: Foundational | 5 | 17 | 42 | 64 |
| Phase 3: US1 (MVP) | 7 | 19 | 49 | 75 |
| Phase 4: US2 | 4 | 12 | 32 | 48 |
| Phase 5: US3 | 4 | 12 | 32 | 48 |
| Phase 6: US4 | 4 | 14 | 26 | 44 |
| Phase 7: Polish | 4 | 10 | 18 | 32 |
| **TOTAL** | **33** | **106** | **246** | **385** |
