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

- [ ] **T001.1** Create root directory structure
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
  - [ ] T001.1.5 Create `database/` directory with `migrations/`, `seed/` subdirectories

- [ ] **T001.2** [P] Initialize version control configuration
  - [ ] T001.2.1 Update `.gitignore` with Python, Node, .NET patterns
  - [ ] T001.2.2 Create `.editorconfig` for consistent formatting
  - [ ] T001.2.3 Create root `README.md` with project overview

**Checkpoint**: Repository structure matches plan.md specification

---

### T002 - Initialize AI Service (Python)

- [ ] **T002.1** Create Python project configuration
  - [ ] T002.1.1 Create `ai-service/pyproject.toml` with project metadata
  - [ ] T002.1.2 Create `ai-service/requirements.txt` with production dependencies
    - FastAPI==0.109.0
    - uvicorn==0.27.0
    - PyMuPDF==1.23.8
    - pytesseract==0.3.10
    - transformers==4.36.0
    - torch==2.1.2 (CPU only)
    - Pillow==10.2.0
    - pydantic==2.5.3
  - [ ] T002.1.3 Create `ai-service/requirements-dev.txt` with dev dependencies
    - pytest==7.4.4
    - pytest-asyncio==0.23.3
    - pytest-cov==4.1.0
    - black==23.12.1
    - ruff==0.1.11
    - mypy==1.8.0
    - httpx==0.26.0 (for testing)

- [ ] **T002.2** [P] Create source directory structure
  - [ ] T002.2.1 Create `ai-service/src/__init__.py`
  - [ ] T002.2.2 Create `ai-service/src/models/__init__.py`
  - [ ] T002.2.3 Create `ai-service/src/services/__init__.py`
  - [ ] T002.2.4 Create `ai-service/src/api/__init__.py`
  - [ ] T002.2.5 Create `ai-service/src/utils/__init__.py`

- [ ] **T002.3** Create configuration module
  - [ ] T002.3.1 Create `ai-service/src/config.py` with Pydantic Settings
  - [ ] T002.3.2 Define HOST, PORT (8000), LOG_LEVEL settings
  - [ ] T002.3.3 Define TESSERACT_PATH, MODEL_PATH settings
  - [ ] T002.3.4 Create `.env.example` with sample configuration

- [ ] **T002.4** [P] Create test infrastructure
  - [ ] T002.4.1 Create `ai-service/tests/conftest.py` with pytest fixtures
  - [ ] T002.4.2 Create `ai-service/tests/fixtures/` directory
  - [ ] T002.4.3 Add sample text-based PDF to fixtures
  - [ ] T002.4.4 Add sample scanned PDF to fixtures
  - [ ] T002.4.5 Create `ai-service/tests/unit/__init__.py`
  - [ ] T002.4.6 Create `ai-service/tests/integration/__init__.py`

**Checkpoint**: `pip install -r requirements.txt` succeeds

---

### T003 - Initialize Desktop App (Electron/React)

- [ ] **T003.1** Create Electron/React project
  - [ ] T003.1.1 Create `desktop-app/package.json` with dependencies
    - electron: ^28.0.0
    - react: ^18.2.0
    - react-dom: ^18.2.0
    - react-pdf: ^7.7.0
    - better-sqlite3: ^9.4.0
    - tailwindcss: ^3.4.0
  - [ ] T003.1.2 Create `desktop-app/tsconfig.json` with strict mode
  - [ ] T003.1.3 Create `desktop-app/tailwind.config.js`
  - [ ] T003.1.4 Create `desktop-app/electron-builder.json` for packaging

- [ ] **T003.2** [P] Create Electron main process structure
  - [ ] T003.2.1 Create `desktop-app/src/main/index.ts` entry point
  - [ ] T003.2.2 Create `desktop-app/src/main/preload.ts` with context bridge
  - [ ] T003.2.3 Create `desktop-app/src/main/process-manager.ts` stub
  - [ ] T003.2.4 Create `desktop-app/src/main/ipc-handlers.ts` stub

- [ ] **T003.3** [P] Create React renderer structure
  - [ ] T003.3.1 Create `desktop-app/src/renderer/index.html`
  - [ ] T003.3.2 Create `desktop-app/src/renderer/index.tsx` entry point
  - [ ] T003.3.3 Create `desktop-app/src/renderer/App.tsx` with router setup
  - [ ] T003.3.4 Create `desktop-app/src/renderer/types/index.ts` with TypeScript interfaces

- [ ] **T003.4** [P] Create i18n structure (Spanish)
  - [ ] T003.4.1 Create `desktop-app/src/renderer/i18n/es.json` with all UI strings
  - [ ] T003.4.2 Create i18n provider component
  - [ ] T003.4.3 Define all error messages in Spanish
  - [ ] T003.4.4 Define all button labels in Spanish
  - [ ] T003.4.5 Define all status messages in Spanish

- [ ] **T003.5** [P] Create test infrastructure
  - [ ] T003.5.1 Create Jest configuration in `package.json`
  - [ ] T003.5.2 Create `desktop-app/tests/unit/` directory
  - [ ] T003.5.3 Create `desktop-app/tests/e2e/` directory
  - [ ] T003.5.4 Create test utilities and mocks

**Checkpoint**: `npm install && npm run build` succeeds

---

### T004 - Initialize Windows Bridge (C#/.NET)

- [ ] **T004.1** Create .NET solution structure
  - [ ] T004.1.1 Create `windows-bridge/ContPAQWinBridge.sln`
  - [ ] T004.1.2 Create `windows-bridge/src/ContPAQWinBridge/ContPAQWinBridge.csproj`
  - [ ] T004.1.3 Add NuGet packages: ASP.NET Core, Serilog, Swashbuckle
  - [ ] T004.1.4 Create `windows-bridge/Directory.Build.props` with common settings

- [ ] **T004.2** Create ASP.NET Core application
  - [ ] T004.2.1 Create `windows-bridge/src/ContPAQWinBridge/Program.cs`
  - [ ] T004.2.2 Configure Kestrel to bind only to 127.0.0.1:5000
  - [ ] T004.2.3 Create `windows-bridge/src/ContPAQWinBridge/appsettings.json`
  - [ ] T004.2.4 Configure dependency injection container

- [ ] **T004.3** [P] Create project structure directories
  - [ ] T004.3.1 Create `Controllers/` directory
  - [ ] T004.3.2 Create `Services/` directory with interfaces
  - [ ] T004.3.3 Create `Models/` directory
  - [ ] T004.3.4 Create `Interop/` directory for COM wrappers

- [ ] **T004.4** [P] Create test project
  - [ ] T004.4.1 Create `windows-bridge/src/ContPAQWinBridge.Tests/ContPAQWinBridge.Tests.csproj`
  - [ ] T004.4.2 Add xUnit, Moq, FluentAssertions packages
  - [ ] T004.4.3 Create `Controllers/` test directory
  - [ ] T004.4.4 Create `Services/` test directory

**Checkpoint**: `dotnet build` succeeds

---

### T005 - Initialize Database Schema

- [ ] **T005.1** Create SQLite migration
  - [ ] T005.1.1 Create `database/migrations/001_initial_schema.sql`
  - [ ] T005.1.2 Define `vendors` table with RFC unique constraint
  - [ ] T005.1.3 Define `invoices` table with state enum check
  - [ ] T005.1.4 Define `line_items` table with foreign key
  - [ ] T005.1.5 Define `extraction_results` table with foreign key
  - [ ] T005.1.6 Define `contpaqi_entries` table with unique invoice_id

- [ ] **T005.2** [P] Create indexes
  - [ ] T005.2.1 Create index on `invoices.state`
  - [ ] T005.2.2 Create index on `invoices.duplicate_hash`
  - [ ] T005.2.3 Create unique index on `vendors.rfc`
  - [ ] T005.2.4 Create index on `extraction_results.invoice_id`

- [ ] **T005.3** [P] Create seed data
  - [ ] T005.3.1 Create `database/seed/sample_data.sql` with test vendors
  - [ ] T005.3.2 Add sample invoice records for testing

**Checkpoint**: SQLite database can be created from migration

---

## Phase 2: Foundational Components

**Goal**: Core infrastructure that MUST be complete before ANY user story

### T006 - AI Service Health & Configuration

- [ ] **T006.1** Implement health check endpoint
  - [ ] T006.1.1 [P] Write test `test_health_endpoint_returns_200.py`
  - [ ] T006.1.2 Create `ai-service/src/api/routes.py` with `/health` route
  - [ ] T006.1.3 Return status, timestamp, version, models_loaded, ocr_available
  - [ ] T006.1.4 Implement health check logic for Tesseract availability
  - [ ] T006.1.5 Implement health check logic for model loading

- [ ] **T006.2** Implement FastAPI application
  - [ ] T006.2.1 Create `ai-service/src/main.py` with FastAPI app
  - [ ] T006.2.2 Configure CORS for localhost only
  - [ ] T006.2.3 Add request logging middleware
  - [ ] T006.2.4 Configure uvicorn for production
  - [ ] T006.2.5 Add graceful shutdown handler

**Checkpoint**: AI service starts and `/health` returns 200

---

### T007 - Windows Bridge Health & SDK Connection

- [ ] **T007.1** Implement health controller
  - [ ] T007.1.1 [P] Write test `HealthControllerTests.cs`
  - [ ] T007.1.2 Create `HealthController.cs` with GET /health
  - [ ] T007.1.3 Return SDK connection status
  - [ ] T007.1.4 Return current company if connected

- [ ] **T007.2** Create SDK service interface
  - [ ] T007.2.1 Create `ISdkService.cs` interface
  - [ ] T007.2.2 Define `IsAvailable()`, `GetVersion()`, `Connect()` methods
  - [ ] T007.2.3 Create `SdkService.cs` implementation stub
  - [ ] T007.2.4 Register in DI container

- [ ] **T007.3** Implement COM interop stubs
  - [ ] T007.3.1 Create `Interop/ContPAQiComercialSdk.cs` with interface
  - [ ] T007.3.2 Create `Interop/ContPAQiContabilidadSdk.cs` with interface
  - [ ] T007.3.3 Add COM reference to ContPAQi SDK DLLs (type library)
  - [ ] T007.3.4 Implement SDK detection logic

**Checkpoint**: Windows Bridge starts and `/health` returns SDK status

---

### T008 - Desktop App Process Manager

- [ ] **T008.1** Implement AI service process management
  - [ ] T008.1.1 [P] Write test for process start/stop
  - [ ] T008.1.2 Implement `ProcessManager` class in `process-manager.ts`
  - [ ] T008.1.3 Implement `startAIService()` method
    - [ ] T008.1.3.1 Locate Python executable path
    - [ ] T008.1.3.2 Spawn uvicorn process with correct args
    - [ ] T008.1.3.3 Capture stdout/stderr for logging
  - [ ] T008.1.4 Implement `stopAIService()` method
    - [ ] T008.1.4.1 Send SIGTERM to process
    - [ ] T008.1.4.2 Wait for graceful shutdown (5s timeout)
    - [ ] T008.1.4.3 Force kill if timeout exceeded
  - [ ] T008.1.5 Implement `restartAIService()` method
  - [ ] T008.1.6 Implement health check polling with retry

- [ ] **T008.2** Implement Windows Bridge process management
  - [ ] T008.2.1 Implement `startBridgeService()` method
  - [ ] T008.2.2 Implement `stopBridgeService()` method
  - [ ] T008.2.3 Implement health check polling

- [ ] **T008.3** Implement auto-restart logic
  - [ ] T008.3.1 Create restart counter with max 3 retries
  - [ ] T008.3.2 Implement exponential backoff (1s, 2s, 4s)
  - [ ] T008.3.3 Emit event on max retries exceeded
  - [ ] T008.3.4 Log all restart attempts

**Checkpoint**: Desktop app can start/stop/restart AI service

---

### T009 - Desktop App Database Layer

- [ ] **T009.1** Implement SQLite connection
  - [ ] T009.1.1 [P] Write test for database initialization
  - [ ] T009.1.2 Create `database.ts` service
  - [ ] T009.1.3 Implement database initialization with migration
  - [ ] T009.1.4 Configure database path in user data directory

- [ ] **T009.2** Implement invoice repository
  - [ ] T009.2.1 [P] Write tests for CRUD operations
  - [ ] T009.2.2 Implement `createInvoice()` method
  - [ ] T009.2.3 Implement `getInvoiceById()` method
  - [ ] T009.2.4 Implement `updateInvoice()` method
  - [ ] T009.2.5 Implement `listInvoices()` with filtering by state
  - [ ] T009.2.6 Implement `checkDuplicate()` by hash

- [ ] **T009.3** Implement vendor repository
  - [ ] T009.3.1 [P] Write tests for vendor operations
  - [ ] T009.3.2 Implement `createVendor()` method
  - [ ] T009.3.3 Implement `getVendorByRfc()` method
  - [ ] T009.3.4 Implement `upsertVendor()` method

**Checkpoint**: Database operations work correctly

---

### T010 - Status Bar Component

- [ ] **T010.1** Create StatusBar UI component
  - [ ] T010.1.1 [P] Write test for status display
  - [ ] T010.1.2 Create `StatusBar.tsx` component
  - [ ] T010.1.3 Display AI service status (icon + text)
  - [ ] T010.1.4 Display Windows Bridge status (icon + text)
  - [ ] T010.1.5 Display current company name if connected

- [ ] **T010.2** Implement status polling hook
  - [ ] T010.2.1 Create `useServiceStatus.ts` hook
  - [ ] T010.2.2 Poll both services every 5 seconds
  - [ ] T010.2.3 Update status on service events
  - [ ] T010.2.4 Show "Iniciando..." during startup

**Checkpoint**: Status bar shows service health

---

## Phase 3: User Story 1 - Process Invoice Without Docker (P1) 🎯 MVP

**Goal**: Extract invoice data from PDF using AI service running natively

### T011 - PDF Text Extraction Service

- [ ] **T011.1** Implement PDF type detection
  - [ ] T011.1.1 [P] Write test `test_detect_text_based_pdf.py`
  - [ ] T011.1.2 [P] Write test `test_detect_scanned_pdf.py`
  - [ ] T011.1.3 Create `pdf_extractor.py` service
  - [ ] T011.1.4 Implement `detect_pdf_type()` using PyMuPDF
    - [ ] T011.1.4.1 Extract text from first page
    - [ ] T011.1.4.2 If text length < 100 chars, classify as scanned
    - [ ] T011.1.4.3 Return SourceType enum value

- [ ] **T011.2** Implement text extraction
  - [ ] T011.2.1 [P] Write test `test_extract_text_with_positions.py`
  - [ ] T011.2.2 Implement `extract_text()` method
    - [ ] T011.2.2.1 Open PDF with PyMuPDF
    - [ ] T011.2.2.2 Extract text blocks with coordinates
    - [ ] T011.2.2.3 Return structured text data with bounding boxes
  - [ ] T011.2.3 Handle multi-page PDFs
  - [ ] T011.2.4 Handle password-protected PDFs (raise error)

**Checkpoint**: Text extracted from text-based PDF

---

### T012 - OCR Service for Scanned PDFs

- [ ] **T012.1** Implement Tesseract wrapper
  - [ ] T012.1.1 [P] Write test `test_ocr_extraction.py`
  - [ ] T012.1.2 Create `ocr_service.py`
  - [ ] T012.1.3 Implement `extract_with_ocr()` method
    - [ ] T012.1.3.1 Convert PDF page to image (300 DPI)
    - [ ] T012.1.3.2 Run Tesseract with Spanish language
    - [ ] T012.1.3.3 Extract text with bounding boxes
    - [ ] T012.1.3.4 Calculate confidence per text block

- [ ] **T012.2** Implement image preprocessing
  - [ ] T012.2.1 [P] Write test `test_image_preprocessing.py`
  - [ ] T012.2.2 Implement deskewing for rotated scans
  - [ ] T012.2.3 Implement contrast enhancement
  - [ ] T012.2.4 Implement noise reduction

**Checkpoint**: Text extracted from scanned PDF

---

### T013 - AI Field Extraction Service

- [ ] **T013.1** Create Pydantic models
  - [ ] T013.1.1 Create `extraction.py` models file
  - [ ] T013.1.2 Define `BoundingBox` model
  - [ ] T013.1.3 Define `ExtractionField` model with confidence
  - [ ] T013.1.4 Define `LineItemExtraction` model
  - [ ] T013.1.5 Define `InvoiceExtraction` response model

- [ ] **T013.2** Implement LayoutLMv3 inference
  - [ ] T013.2.1 [P] Write test `test_layoutlm_inference.py`
  - [ ] T013.2.2 Create `ai_extractor.py` service
  - [ ] T013.2.3 Load LayoutLMv3 model on startup
  - [ ] T013.2.4 Implement `extract_fields()` method
    - [ ] T013.2.4.1 Prepare input tokens from text + layout
    - [ ] T013.2.4.2 Run model inference
    - [ ] T013.2.4.3 Parse model output to structured fields
    - [ ] T013.2.4.4 Calculate confidence scores per field
  - [ ] T013.2.5 Implement field mapping to Mexican invoice schema
    - [ ] T013.2.5.1 Map vendor_rfc field
    - [ ] T013.2.5.2 Map vendor_name field
    - [ ] T013.2.5.3 Map invoice_number field
    - [ ] T013.2.5.4 Map invoice_date field
    - [ ] T013.2.5.5 Map subtotal, iva_amount, total fields

- [ ] **T013.3** Implement line item extraction
  - [ ] T013.3.1 [P] Write test `test_line_item_extraction.py`
  - [ ] T013.3.2 Detect table region in document
  - [ ] T013.3.3 Extract line items from table
    - [ ] T013.3.3.1 Parse description column
    - [ ] T013.3.3.2 Parse quantity column
    - [ ] T013.3.3.3 Parse unit_price column
    - [ ] T013.3.3.4 Parse amount column
  - [ ] T013.3.4 Validate line item totals

**Checkpoint**: AI extracts all invoice fields with confidence

---

### T014 - Extraction API Endpoint

- [ ] **T014.1** Implement POST /extract endpoint
  - [ ] T014.1.1 [P] Write test `test_extract_endpoint.py`
  - [ ] T014.1.2 Create endpoint in `routes.py`
  - [ ] T014.1.3 Handle multipart file upload
  - [ ] T014.1.4 Validate file is PDF
  - [ ] T014.1.5 Orchestrate extraction pipeline
    - [ ] T014.1.5.1 Detect PDF type
    - [ ] T014.1.5.2 Extract text (PyMuPDF or OCR)
    - [ ] T014.1.5.3 Run AI extraction
    - [ ] T014.1.5.4 Return ExtractionResponse
  - [ ] T014.1.6 Calculate and return processing_time_ms
  - [ ] T014.1.7 Handle errors with Spanish messages

- [ ] **T014.2** [P] Implement batch extraction endpoint
  - [ ] T014.2.1 [P] Write test `test_batch_extract_endpoint.py`
  - [ ] T014.2.2 Create POST /extract/batch endpoint
  - [ ] T014.2.3 Process files sequentially (avoid memory issues)
  - [ ] T014.2.4 Return BatchExtractionResponse with per-file results

**Checkpoint**: API extracts invoice data from uploaded PDF

---

### T015 - Desktop App AI Service Client

- [ ] **T015.1** Create AI service API client
  - [ ] T015.1.1 [P] Write test for API client
  - [ ] T015.1.2 Create `ai-service.ts` in services/
  - [ ] T015.1.3 Implement `extractInvoice(file: File)` method
  - [ ] T015.1.4 Implement `checkHealth()` method
  - [ ] T015.1.5 Handle network errors with retry
  - [ ] T015.1.6 Parse response to TypeScript types

- [ ] **T015.2** Implement file upload UI
  - [ ] T015.2.1 [P] Write test for file upload
  - [ ] T015.2.2 Create file picker with PDF filter
  - [ ] T015.2.3 Implement drag-and-drop zone
  - [ ] T015.2.4 Show upload progress indicator
  - [ ] T015.2.5 Display error messages in Spanish

**Checkpoint**: Desktop app can send PDF to AI service

---

### T016 - PDF Viewer Component

- [ ] **T016.1** Create PDF viewer
  - [ ] T016.1.1 [P] Write test for PDF rendering
  - [ ] T016.1.2 Create `PDFViewer.tsx` component
  - [ ] T016.1.3 Use react-pdf for rendering
  - [ ] T016.1.4 Implement zoom controls
  - [ ] T016.1.5 Implement page navigation

- [ ] **T016.2** Implement bounding box overlay
  - [ ] T016.2.1 [P] Write test for bbox overlay
  - [ ] T016.2.2 Create `BoundingBoxOverlay.tsx` component
  - [ ] T016.2.3 Render boxes at correct positions
  - [ ] T016.2.4 Color boxes by confidence level
    - [ ] T016.2.4.1 Green for ≥90%
    - [ ] T016.2.4.2 Orange for 70-89%
    - [ ] T016.2.4.3 Red for <70%
  - [ ] T016.2.5 Highlight active field on hover/selection

**Checkpoint**: PDF displays with extraction highlights

---

### T017 - Processing Page

- [ ] **T017.1** Create processing page layout
  - [ ] T017.1.1 Create `ProcessingPage.tsx`
  - [ ] T017.1.2 Implement split-screen layout (PDF | Form)
  - [ ] T017.1.3 Add responsive breakpoints
  - [ ] T017.1.4 Add page header with invoice status

- [ ] **T017.2** Implement processing workflow
  - [ ] T017.2.1 [P] Write test for processing flow
  - [ ] T017.2.2 Create `useInvoice.ts` hook
  - [ ] T017.2.3 Implement file selection → extraction flow
  - [ ] T017.2.4 Show loading state during extraction
  - [ ] T017.2.5 Display extraction results
  - [ ] T017.2.6 Save invoice to database with UPLOADED→EXTRACTED state

**Checkpoint**: User can process PDF and see results

---

## Phase 4: User Story 2 - Review and Validate Extracted Data (P2)

**Goal**: Display confidence indicators and allow manual editing

### T018 - Confidence Indicator Component

- [ ] **T018.1** Create confidence indicator
  - [ ] T018.1.1 [P] Write test for confidence display
  - [ ] T018.1.2 Create `ConfidenceIndicator.tsx` component
  - [ ] T018.1.3 Display colored dot (green/orange/red)
  - [ ] T018.1.4 Show percentage on hover
  - [ ] T018.1.5 Add tooltip with confidence explanation

- [ ] **T018.2** Define confidence utilities
  - [ ] T018.2.1 Create `confidence.py` utils in AI service
  - [ ] T018.2.2 Define threshold constants (90, 70)
  - [ ] T018.2.3 Implement `get_confidence_level()` function
  - [ ] T018.2.4 Mirror in TypeScript for UI

**Checkpoint**: Confidence colors display correctly

---

### T019 - Invoice Form Component

- [ ] **T019.1** Create field input component
  - [ ] T019.1.1 [P] Write test for field input
  - [ ] T019.1.2 Create `FieldInput.tsx` component
  - [ ] T019.1.3 Display field label, value, confidence
  - [ ] T019.1.4 Enable inline editing on click
  - [ ] T019.1.5 Mark field as "user_verified" after edit
  - [ ] T019.1.6 Validate input format (RFC, date, amounts)

- [ ] **T019.2** Create invoice form
  - [ ] T019.2.1 [P] Write test for form rendering
  - [ ] T019.2.2 Create `InvoiceForm.tsx` component
  - [ ] T019.2.3 Render all header fields with FieldInput
    - [ ] T019.2.3.1 RFC del Proveedor field
    - [ ] T019.2.3.2 Nombre del Proveedor field
    - [ ] T019.2.3.3 Número de Factura field
    - [ ] T019.2.3.4 Fecha field
    - [ ] T019.2.3.5 Subtotal field
    - [ ] T019.2.3.6 IVA field
    - [ ] T019.2.3.7 Total field
  - [ ] T019.2.4 Sync field selection with PDF viewer bbox

- [ ] **T019.3** Create line items table
  - [ ] T019.3.1 [P] Write test for line items display
  - [ ] T019.3.2 Create `LineItemsTable.tsx` component
  - [ ] T019.3.3 Display editable table rows
  - [ ] T019.3.4 Support row editing
  - [ ] T019.3.5 Auto-calculate row amounts
  - [ ] T019.3.6 Validate totals match

**Checkpoint**: All fields editable with confidence indicators

---

### T020 - Validation Logic

- [ ] **T020.1** Implement RFC validation endpoint
  - [ ] T020.1.1 [P] Write test `test_rfc_validation.py`
  - [ ] T020.1.2 Create POST /validate/rfc endpoint
  - [ ] T020.1.3 Implement RFC format validation
    - [ ] T020.1.3.1 Check length (12 or 13)
    - [ ] T020.1.3.2 Validate pattern for persona física
    - [ ] T020.1.3.3 Validate pattern for persona moral
  - [ ] T020.1.4 Return validation result with type

- [ ] **T020.2** Implement CFDI validation endpoint
  - [ ] T020.2.1 [P] Write test `test_cfdi_validation.py`
  - [ ] T020.2.2 Create POST /validate/cfdi endpoint
  - [ ] T020.2.3 Validate required fields present
  - [ ] T020.2.4 Validate IVA calculation (subtotal * 0.16 = iva)
  - [ ] T020.2.5 Validate total (subtotal + iva = total)
  - [ ] T020.2.6 Return validation errors/warnings

- [ ] **T020.3** Implement form validation in desktop app
  - [ ] T020.3.1 [P] Write test for form validation
  - [ ] T020.3.2 Validate RFC on field blur
  - [ ] T020.3.3 Validate totals on amount changes
  - [ ] T020.3.4 Show inline validation errors in Spanish
  - [ ] T020.3.5 Enable "Validar" button only when no errors

**Checkpoint**: Validation errors display correctly

---

### T021 - Validate Button and State Transition

- [ ] **T021.1** Implement validate action
  - [ ] T021.1.1 [P] Write test for validate action
  - [ ] T021.1.2 Add "Validar" button to form
  - [ ] T021.1.3 Run all validations on click
  - [ ] T021.1.4 Update invoice state to VALIDATED
  - [ ] T021.1.5 Save updated data to database
  - [ ] T021.1.6 Update extraction_results with user edits
  - [ ] T021.1.7 Show success message in Spanish

**Checkpoint**: Invoice can be validated and state updated

---

## Phase 5: User Story 3 - Post to ContPAQi (P3)

**Goal**: Send validated invoice to ContPAQi via Windows Bridge

### T022 - Windows Bridge Vendor Endpoints

- [ ] **T022.1** Implement vendor list endpoint
  - [ ] T022.1.1 [P] Write test `VendorsControllerTests.cs`
  - [ ] T022.1.2 Create `VendorsController.cs`
  - [ ] T022.1.3 Implement GET /vendors with search
  - [ ] T022.1.4 Implement GET /vendors/{rfc}
  - [ ] T022.1.5 Query ContPAQi SDK for vendors

- [ ] **T022.2** Implement vendor creation
  - [ ] T022.2.1 [P] Write test for vendor creation
  - [ ] T022.2.2 Implement POST /vendors
  - [ ] T022.2.3 Validate RFC format
  - [ ] T022.2.4 Create vendor via SDK
  - [ ] T022.2.5 Return created vendor data

- [ ] **T022.3** Implement vendor service
  - [ ] T022.3.1 Create `IVendorService.cs` interface
  - [ ] T022.3.2 Create `VendorService.cs` implementation
  - [ ] T022.3.3 Implement SDK vendor queries
  - [ ] T022.3.4 Implement vendor creation via SDK

**Checkpoint**: Vendors can be queried and created

---

### T023 - Windows Bridge Entry Endpoints

- [ ] **T023.1** Implement duplicate check
  - [ ] T023.1.1 [P] Write test for duplicate check
  - [ ] T023.1.2 Create `EntriesController.cs`
  - [ ] T023.1.3 Implement POST /entries/check-duplicate
  - [ ] T023.1.4 Query SDK for existing entry by RFC + invoice number
  - [ ] T023.1.5 Return duplicate status

- [ ] **T023.2** Implement entry creation
  - [ ] T023.2.1 [P] Write test for entry creation
  - [ ] T023.2.2 Implement POST /entries
  - [ ] T023.2.3 Validate request data
  - [ ] T023.2.4 Check for duplicates (unless force_duplicate=true)
  - [ ] T023.2.5 Create entry via SDK
    - [ ] T023.2.5.1 Set document type
    - [ ] T023.2.5.2 Set vendor reference
    - [ ] T023.2.5.3 Set amounts
    - [ ] T023.2.5.4 Add line items
    - [ ] T023.2.5.5 Commit entry
  - [ ] T023.2.6 Return folio number on success
  - [ ] T023.2.7 Return detailed error on failure

- [ ] **T023.3** Implement entry service
  - [ ] T023.3.1 Create `IEntryService.cs` interface
  - [ ] T023.3.2 Create `EntryService.cs` implementation
  - [ ] T023.3.3 Implement `CreateEntry()` method
  - [ ] T023.3.4 Handle SDK exceptions with Spanish messages

**Checkpoint**: Entries can be created in ContPAQi

---

### T024 - Desktop App Bridge Client

- [ ] **T024.1** Create bridge service client
  - [ ] T024.1.1 [P] Write test for bridge client
  - [ ] T024.1.2 Create `bridge-service.ts`
  - [ ] T024.1.3 Implement `checkDuplicate()` method
  - [ ] T024.1.4 Implement `createEntry()` method
  - [ ] T024.1.5 Implement `getVendorByRfc()` method
  - [ ] T024.1.6 Implement `createVendor()` method
  - [ ] T024.1.7 Handle errors with Spanish messages

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
