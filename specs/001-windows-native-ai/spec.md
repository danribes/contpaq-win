# Feature Specification: Windows-Native AI Invoice Processing

**Feature Branch**: `001-windows-native-ai`
**Created**: 2025-12-15
**Status**: Draft
**Input**: User description: "Windows-native ContPAQi clone with AI invoice processing running natively without Docker"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Process Invoice Without Docker (Priority: P1)

As an accountant, I want to process PDF invoices using AI extraction on my Windows computer without needing Docker Desktop installed, so that I can save on licensing costs and reduce system complexity.

**Why this priority**: This is the core value proposition—eliminating Docker dependency while maintaining full AI-powered invoice extraction functionality. Without this, the product has no differentiation from the existing solution.

**Independent Test**: Can be fully tested by installing the application on a clean Windows 10/11 machine (without Docker) and successfully extracting invoice data from a sample PDF.

**Acceptance Scenarios**:

1. **Given** a Windows 10/11 machine without Docker installed, **When** I install ContPAQ-Win and open a PDF invoice, **Then** the AI service extracts vendor name, RFC, date, line items, subtotal, IVA, and total with confidence scores displayed.

2. **Given** the AI service is not running, **When** I launch the desktop application, **Then** the application automatically starts the AI service and displays a "Ready" status within 30 seconds.

3. **Given** the AI service crashes unexpectedly, **When** the application detects the failure, **Then** it automatically restarts the service and notifies me with a non-blocking alert.

---

### User Story 2 - Review and Validate Extracted Data (Priority: P2)

As an accountant, I want to review AI-extracted invoice data with visual confidence indicators, so that I can quickly verify accuracy and correct any errors before posting to ContPAQi.

**Why this priority**: Human-in-the-loop validation is essential for accounting accuracy. This builds on US1 by adding the review workflow that makes the extraction useful in practice.

**Independent Test**: Can be fully tested by loading a processed invoice and verifying that all extracted fields display confidence colors, and that manual edits persist correctly.

**Acceptance Scenarios**:

1. **Given** an invoice has been processed with AI extraction, **When** I view the results, **Then** each field displays a confidence indicator (green ≥90%, orange 70-89%, red <70%).

2. **Given** a field shows low confidence (red), **When** I click on the field, **Then** I can manually edit the value and the system marks it as "User Verified."

3. **Given** I have edited multiple fields, **When** I click "Save," **Then** all my corrections persist and the invoice is ready for posting.

---

### User Story 3 - Post Validated Invoice to ContPAQi (Priority: P3)

As an accountant, I want to post validated invoice data directly to ContPAQi Comercial or Contabilidad, so that I don't have to manually re-enter the data.

**Why this priority**: This completes the end-to-end workflow. Without posting capability, users would still need manual data entry, negating much of the time savings.

**Independent Test**: Can be fully tested by validating an invoice and posting it to a test ContPAQi company, then verifying the entry appears correctly in ContPAQi.

**Acceptance Scenarios**:

1. **Given** I have a validated invoice with all required fields, **When** I click "Post to ContPAQi," **Then** the system creates the corresponding entry in ContPAQi and displays a success confirmation with the folio number.

2. **Given** the ContPAQi SDK is not accessible (license issue or not installed), **When** I attempt to post, **Then** the system displays a clear error message explaining the issue and suggests resolution steps.

3. **Given** the RFC doesn't exist in ContPAQi's vendor catalog, **When** I attempt to post, **Then** the system offers to create a new vendor record or lets me select an existing vendor.

---

### User Story 4 - Install Application on Clean Windows Machine (Priority: P4)

As an IT administrator, I want to install ContPAQ-Win using a standard Windows installer without additional runtime dependencies, so that I can deploy it easily across the organization.

**Why this priority**: Enterprise deployment requires simple, reliable installation. This enables broader adoption but is not needed for the core product to function.

**Independent Test**: Can be fully tested by running the installer on a clean Windows machine and verifying the application launches successfully.

**Acceptance Scenarios**:

1. **Given** a clean Windows 10/11 machine, **When** I run the ContPAQ-Win installer, **Then** the installer validates/installs all prerequisites (Python runtime, .NET, VC++ Redist) automatically.

2. **Given** the installation completes successfully, **When** I launch the application from the Start Menu, **Then** it starts without errors and the AI service initializes within 30 seconds.

3. **Given** I need to deploy to multiple machines, **When** I run the installer with `/SILENT` flag, **Then** it installs without user interaction using default settings.

---

### Edge Cases

- What happens when the PDF is corrupted or password-protected?
  - System displays an error message and skips the file, allowing the user to provide an unlocked version.

- What happens when the AI extraction returns all low-confidence results?
  - System flags the invoice for manual review and highlights all fields in red, but still allows the user to proceed with manual entry.

- What happens when ContPAQi is running during installation?
  - Installer detects the running process and prompts user to close it before proceeding.

- What happens when the machine has no internet connection?
  - All AI processing runs locally; the application works fully offline after installation.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST run AI invoice extraction natively on Windows without Docker, WSL, or any container runtime.
- **FR-002**: System MUST start the Python AI service automatically when the desktop application launches.
- **FR-003**: System MUST restart the AI service automatically if it crashes (max 3 retries before alerting user).
- **FR-004**: System MUST display confidence scores (0-100%) for each extracted field with color coding.
- **FR-005**: System MUST allow users to manually edit any AI-extracted field.
- **FR-006**: System MUST validate Mexican RFC format (13 characters for individuals, 12 for companies).
- **FR-007**: System MUST perform CFDI compliance validation before posting to ContPAQi.
- **FR-008**: System MUST integrate with ContPAQi SDK to create accounting entries.
- **FR-009**: System MUST work offline after initial installation (no internet required for operation).
- **FR-010**: System MUST provide a health check endpoint for the AI service at `/health`.
- **FR-011**: System MUST bind all network services to localhost only (127.0.0.1).
- **FR-012**: Installer MUST support silent installation for enterprise deployment.
- **FR-013**: System MUST support Windows 10 (21H2+) and Windows 11 on x64 architecture.

### Key Entities

- **Invoice**: A PDF document containing vendor information, line items, totals, and tax details. Key attributes: vendor RFC, vendor name, invoice date, invoice number, line items, subtotal, IVA amount, total amount, extraction confidence scores.

- **Vendor**: A business entity that issues invoices. Key attributes: RFC (tax ID), business name, address, contact information. Relationship: One vendor can have many invoices.

- **Line Item**: A single product or service entry on an invoice. Key attributes: description, quantity, unit price, amount. Relationship: One invoice has many line items.

- **Extraction Result**: The AI-processed output for an invoice. Key attributes: field name, extracted value, confidence score (0-100), bounding box coordinates for PDF highlighting.

- **ContPAQi Entry**: The accounting record created in ContPAQi. Key attributes: folio number, entry date, vendor reference, amounts, posting status.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can process an invoice from PDF upload to ContPAQi posting in under 5 minutes (compared to 15+ minutes for manual entry).

- **SC-002**: Application installs successfully on 95% of Windows 10/11 machines without manual intervention.

- **SC-003**: AI extraction achieves ≥85% accuracy on standard Mexican CFDI invoices (measured by fields not requiring user correction).

- **SC-004**: Application starts and is ready to process invoices within 45 seconds of launch.

- **SC-005**: System operates reliably for 8-hour workdays without requiring restart.

- **SC-006**: Installation package size is under 500MB (excluding ML models that can be downloaded separately).

- **SC-007**: 90% of users successfully complete their first invoice processing without consulting documentation.

## Assumptions

- Users have ContPAQi Comercial or Contabilidad already installed and licensed on their machine.
- Users have basic Windows computer skills (can run installers, navigate file system).
- PDF invoices follow standard Mexican CFDI format with machine-readable text (not scanned images).
- Target machines have at least 8GB RAM and 2GB free disk space.
- Python 3.11+ runtime can be embedded or installed silently as part of the installer.
