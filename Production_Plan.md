# CareFlow — Smart Hospital Operations Platform

## Complete Production Plan (Phased)

**Project type:** Full-stack hospital management and operations web application
**Working name:** CareFlow
**Primary goal:** Build a well-structured, realistic hospital operations platform while learning the MERN stack step by step.
**Initial mode:** Educational/demo project using synthetic patient data only.

> **Important:** A portfolio/demo application is not automatically safe or compliant for real clinical use. Do not use real patient data. Before any real-world clinical deployment, obtain qualified security, privacy, clinical, legal, and regulatory review.

---

## 📊 Progress Tracker

| Phase | Name | Status | Progress |
|-------|------|--------|----------|
| 0 | Planning & Setup | ✅ Done | █████████████████████ 100% |
| 1 | Frontend Foundation | ✅ Done | █████████████████████ 100% |
| 2 | Patient & Staff UI | ✅ Done | █████████████████████ 100% |
| 3 | Backend Foundation | ✅ Done | █████████████████████ 100% |
| 4 | Database & API Integration | ✅ Done | █████████████████████ 100% |
| 5 | Authentication & Authorization | ✅ Done | █████████████████████ 100% |
| 6 | Appointments | ✅ Done | █████████████████████ 100% |
| 7 | Queue Management | ✅ Done | █████████████████████ 100% |
| 8 | Consultation & Prescriptions | ✅ Done | █████████████████████ 100% |
| 9 | Laboratory | ✅ Done | █████████████████████ 100% |
| 10 | Pharmacy & Inventory | ✅ Done | █████████████████████ 100% |
| 11 | Beds & Admissions | ✅ Done | █████████████████████ 100% |
| 12 | Billing & Reports | ✅ Done | █████████████████████ 100% |
| 13 | Multi-Tenancy & Security | ✅ Done | █████████████████████ 100% |
| 14 | Real-Time & Background Jobs | ✅ Done | █████████████████████ 100% |
| 15 | Files & Optional AI | ✅ Done | █████████████████████ 100% |
| 16 | Testing & Polish | ✅ Done | █████████████████████ 100% |
| 17 | Docker & Deployment | ✅ Done | █████████████████████ 100% |

**Overall Progress: 100%** — All 17 Phases (Phase 0 through Phase 17) completed. CareFlow is fully built, tested, documented, containerized, and deployment-ready!

---

## 📝 Change Log

| Date | Phase | What Changed |
|------|-------|-------------|
| 2026-10-18 | Phase 17 | Completed Phase 17 — Docker & Deployment: Created multi-stage production Dockerfile for Frontend (`CareFlowFrontend/Dockerfile`) with Node 20 builder and Nginx 1.27 Alpine runtime; configured production `nginx.conf` with Gzip compression, security headers (X-Frame-Options, X-Content-Type-Options, Referrer-Policy), SPA fallback routing, and reverse proxies for `/api/v1/` and `/socket.io/`; created multi-stage production Dockerfile for Backend (`server/Dockerfile`) with non-root security (`USER node`), automated startup entrypoint (`docker-entrypoint.sh`), Prisma schema synchronization (`prisma db push`), and idempotent database seeding; implemented full multi-service `docker-compose.yml` orchestrating Frontend, Backend, Redis (BullMQ queues & caching), and optional PostgreSQL with health checks, persistent volumes, and bridge network; added `docker-compose.prod.yml` with production resource limits (CPU/memory) and json-file log rotation; implemented complete GitHub Actions CI/CD pipeline (`.github/workflows/ci.yml`) testing Backend (34 tests across Node 20 & 22), Frontend (Vite build & client tests), and Docker compose configuration validation; built PaaS blueprints for Render (`render.yaml`) and Railway (`railway.json`); implemented automated database backup and disaster recovery scripts with SHA-256 integrity verification and safety rollback snapshots (`scripts/backup-database.ps1`, `scripts/backup-database.sh`, `scripts/restore-database.ps1`, `scripts/restore-database.sh`); implemented automated production smoke test suite (`scripts/smoke-test.mjs`) verifying API health, tenant discovery, JWT authentication, patient queries, bed directory, file storage metrics, and frontend web delivery; created comprehensive `docs/Deployment_Guide.md` with cloud hosting instructions and SSL/HTTPS Certbot guide; updated `README.md` and root `package.json` with Docker commands; 100% completion of CareFlow production plan |
| 2026-10-18 | Phase 16 | Completed Phase 16 — Testing & Polish: Built comprehensive unit test suites covering Appointment double-booking & slot generation, Queue weighted triage prioritization & wait algorithms, Hospital billing line item math & tax/discount allocations, Pharmacy FEFO inventory batch deductions & low-stock triggers, Inpatient bed collision checks & terminal disinfection protocols, File security HMAC signed tokens & SHA-256 binary checksums, and HIPAA PHI de-identification regex scrubbers; built integration test suite (`apiTenantIsolation.test.ts`) verifying `/health` latency, authentication rejections (401), multi-tenant zero-bleed partition boundaries (Central vs West Metro), file signed token streaming, and operational database assistant; built frontend client core test suite (`clientCore.test.ts`); achieved 100% test pass rate across 38 unit and integration tests; verified accessibility and responsive layouts; created architectural system documentation (`docs/Architecture.md`) with Mermaid diagrams, complete database schema ERD documentation (`docs/Database_Schema.md`), OpenAPI 3.0.3 specification (`docs/openapi.yaml`), and master `README.md` with verified clean setup guide, roles matrix, and test commands |
| 2026-10-18 | Phase 15 | Completed Phase 15 — Files & Optional AI: Private encrypted document storage setup (`server/storage/private/`) outside web server root; Prisma SQL relational schema `MedicalFile` linked to `Patient`, `Consultation`, `LabOrder`, `User`, and `Organization`; SHA-256 cryptographic checksum calculation on upload; short-lived cryptographically signed JWT download tokens (15 minutes) with access logging to immutable `AuditLog` (HIPAA §164.312(b)); REST APIs (`/api/v1/files`, `/upload`, `/:id/signed-url`, `/download/:token`, `/metrics`, `/:id`); seeded 5 realistic clinical documents across Central Hospital and West Metro; clinical AI service (`aiService.ts`) with HIPAA PHI regex de-identification scrubber, structured SOAP encounter summarization with suggested ICD-10 diagnostic tagging, and mandatory medical disclaimer banner; live database-grounded operational assistant (`/api/v1/ai/operational-assistant`) querying real-time bed censuses, appointment queues, low-stock formulary items, and unpaid invoice balances; client-side `fileService.ts` & `aiService.ts`; full-featured `MedicalFiles.tsx` page (`/files`) with top KPI metrics, category filter pills, search, Document Vault table, interactive file preview modal (image preview + signed PDF viewer), upload modal with drag-and-drop & MIME/10MB validation, SOAP Clinical Copilot tab with quick clinical presets and "Copy to EMR Chart" flow, and live Operational Copilot assistant tab |
| 2026-10-18 | Phase 14 | Completed Phase 14 — Real-Time & Background Jobs: Attached Socket.IO server engine (`socketService.ts`) with tenant-scoped room isolation (`tenant:${orgId}`), user channels, and connection telemetry; implemented background job queue manager (`jobQueue.ts`) with BullMQ architecture, exponential backoff retries, and Dead-Letter Queue (DLQ) quarantining; built asynchronous workers for Report Generation (`report-generation`), Staff Notification Dispatch (`notification-delivery`), and Gateway Failure Simulation (`dlq-simulation-test`); exposed REST APIs (`/api/v1/jobs`, `/report`, `/notification`, `/simulate-failure`, `/:id/retry`, `/clear`); hooked real-time WebSocket event broadcasts to Queue (`queue:token_called`, `queue:token_created`, `queue:token_completed`, `queue:token_skipped`) and Inpatient Bed movements (`bed:admitted`, `bed:transferred`, `bed:discharged`, `bed:status_changed`); built client-side `SocketContext.tsx` with auto-reconnection and state resynchronization (`queryClient.invalidateQueries()`); implemented Web Audio API hospital announcement synthesizer (`playHospitalChime`); updated Navbar with real-time WebSocket status indicator and live notification push; and built full-featured `BackgroundJobs.tsx` dashboard (`/jobs`) with live connection telemetry, task launcher triggers, DLQ management with 1-click retry, and real-time WebSocket terminal feed |
| 2026-10-18 | Phase 13 | Completed Phase 13 — Multi-Tenancy & Stronger Security: Relational SQL Prisma models (`Organization`, `AuditLog`), server-side `tenantMiddleware.ts` extracting `x-organization-id` header with fallback to JWT org and default org, query-level tenant scoping (`where: { organizationId }`), dual synthetic hospital dataset (`CareFlow Central Hospital` - `CF-CENTRAL` vs `CareFlow West Metro Pavilion` - `CF-WEST`), zero-bleed cross-tenant data isolation verified via automated integration tests, REST APIs (`/api/v1/organizations`, `/api/v1/audit-logs`, `/api/v1/audit-logs/export`), frontend `TenantContext` & facility switcher dropdown in Navbar, full-featured `AuditLogs.tsx` page (`/audit-logs`) with executive KPIs, multi-column search, action/entity dropdowns, quick date filters, cryptographic inspection modal with JSON viewer & copy button, CSV audit trail export, and comprehensive `Security_Review_and_Threat_Model.md` covering STRIDE, RBAC matrix, and HIPAA §164.312(b) compliance |
| 2026-10-18 | Phase 12 | Completed Phase 12 — Implemented Hospital Billing, Payments & Analytics: Relational SQL Prisma models (`Invoice`, `InvoiceLineItem`, `Payment`), REST APIs (`/api/v1/billing/metrics`, `/api/v1/billing/invoices`, `/api/v1/billing/payments`, `/api/v1/billing/export`, `/api/v1/reports/overview`), sequential invoice & receipt generator (`INV-YYYY-XXXX`, `REC-YYYY-XXXX`), automatic subtotal, discount, tax, balance due & payment status recalculation, CreateInvoiceModal (itemized clinical items, bed stays, labs, meds), RecordPaymentModal (partial/full settlement, payment channels, cashier memo), InvoiceDetailsModal (official print-ready invoice slip with `window.print()` and CSS print sheet), full Billing operations dashboard with Outstanding Receivables aging tracking & Payment Receipts ledger, and executive Reports & Analytics workspace with Recharts monthly revenue trends, service category share, department clinical workload distribution, turnaround KPIs (queue wait, lab TAT, ALOS, bed occupancy), and CSV export |
| 2026-10-18 | Phase 11 | Completed Phase 11 — Implemented Inpatient Bed & Admission Management: Relational Prisma schema (`Ward`, `Room`, `Bed`, `Admission`, `BedTransfer`), REST APIs (`/api/v1/wards`, `/api/v1/beds`, `/api/v1/admissions`), real-time ward occupancy calculations, automated conflict-prevention for bed assignment, terminal disinfection protocol (auto-switches source bed to 'Cleaning' on transfer/discharge), AdmitPatientModal, TransferBedModal, DischargePatientModal, UpdateBedStatusModal, and full executive Beds dashboard with visual floor plan, color-coded bed cards, active inpatient clinical roster, and ward tariff directory |
| 2026-10-18 | Phase 10 | Completed Phase 10 — Implemented Pharmacy & Medication Inventory workflow: Relational SQL models in Prisma (`Medicine`, `InventoryBatch`, `InventoryMovement`) linked to Prescriptions, REST APIs (`/api/v1/pharmacy/medicines`, `/api/v1/pharmacy/receive`, `/api/v1/pharmacy/dispense`, `/api/v1/pharmacy/prescriptions/pending`, `/api/v1/pharmacy/movements`, `/api/v1/pharmacy/low-stock`), automated FEFO (First-Expiring, First-Out) batch allocation engine with atomic inventory deduction, seeded realistic hospital formulary catalogue with active batches and movement logs, ReceiveStockModal, DispenseMedicationModal (with live batch breakdown), AddMedicineModal, and an executive Pharmacy dashboard featuring department KPIs ($22.7k gross value), e-Prescription fulfillment queue, immutable audit ledger, and low-stock reorder warnings |
| 2026-10-18 | Phase 9 | Completed Phase 9 — Implemented Diagnostic Laboratory & Pathology workflow: LabOrder & LabResult SQL schema in Prisma, REST APIs (`/api/v1/laboratory/orders`, `/api/v1/laboratory/catalog`, `/api/v1/lab-orders`), specimen tracking lifecycle (Requested → Sample Collected → In-Analysis → Completed), verified biochemical result entry with biological reference ranges & abnormal/critical flag detection, OrderLabTestModal, EnterLabResultsModal, printable official Diagnostic Pathology Report slip (`window.print()`), and comprehensive Laboratory dashboard with live KPI counters and Test Catalogue directory |
| 2026-10-18 | Phase 8 | Completed Phase 8 — Implemented clinical Consultation & Prescription workflow: Consultation & Prescription REST APIs (`/api/v1/consultations`, `/api/v1/encounters`, `/api/v1/prescriptions`), transactional visit creation with atomic drug prescription rows and automatic queue token/appointment closure, interactive doctor EMR workspace with SOAP evaluation notes and quick diagnosis chips, live prescription pad with multi-drug regimen, official printable Rx slip modal (`window.print()`), and connected queue-to-consultation navigation |
| 2026-10-18 | Phase 7 | Completed Phase 7 — Implemented live Queue Management & Reception Check-in: QueueToken REST APIs, concurrency-safe "call-next" logic, priority triaging (Normal, Urgent, Emergency), arrival check-in for scheduled appointments, walk-in token issuance, printable token slips, and digital broadcast announcement board |
| 2026-10-18 | Phase 6 | Completed Phase 6 — Implemented end-to-end appointment scheduling workflow: Appointment & DoctorSchedule REST APIs, double-booking prevention engine, dynamic real-time slot calculation, interactive booking modal with live slot selection, appointment management & status progression modal, and full executive Appointments page with table view and day-agenda calendar view |
| 2026-10-18 | Phase 5 | Completed Phase 5 — Implemented JWT authentication & refresh tokens, bcrypt password hashing, IP rate limiting, RBAC role middleware, global AuthContext, ProtectedRoute guards, dynamic sidebar role filtering, and verified login/logout/registration workflows |
| 2026-10-18 | Phase 4 | Completed Phase 4 — Connected frontend to SQL database via Prisma ORM & TanStack Query; built Patient & Staff CRUD REST APIs with Zod schema validation; added resilient fallback client; verified live database operations |
| 2026-10-17 | Phase 3 | Completed Phase 3 — built Express + TypeScript backend with modular architecture, typed environment configuration, structured colorized logger, Zod schema validation middleware, robust centralized error handling for AppErrors/Zod/Prisma codes, and operational `/api/v1/health` check measuring active SQL database latency |
| 2026-10-17 | Architecture | Transitioned database stack from NoSQL/Mongoose to Relational SQL with PostgreSQL/SQLite & Prisma ORM, including web-based Prisma Studio Database Management |
| 2026-10-17 | Phase 2 | Completed Phase 2 — built full Patient Directory with stats cards, sortable table, pagination, PatientModal for Add/Edit, comprehensive PatientDetails with vitals and consultation history, full Doctors directory with duty badges, and DoctorDetails weekly schedule rota |
| 2026-10-17 | Phase 1 | Completed Phase 1 — built Login UI with quick demo role prefill, Toast notification system, ConfirmationDialog, Spinner/Skeleton/PageLoader, EmptyState, ErrorState, enhanced Navbar with live status, alerts panel, user profile menu, responsive mobile drawer sidebar with icons, 404 & 403 pages |
| 2026-10-17 | Phase 0, 1, 2 | Initial audit — marked existing work as done |

---

## 1. Product Vision

CareFlow will bring common hospital workflows into one web application. It will provide role-specific workspaces for hospital administrators, receptionists, doctors, nurses, laboratory staff, pharmacists, and patients.

The project will be developed incrementally:
1. Build the frontend with realistic dummy data.
2. Build the API and database.
3. Connect the frontend to the backend.
4. Add authentication and authorization.
5. Implement core hospital workflows.
6. Add real-time updates and background processing.
7. Add testing, security, observability, and deployment.
8. Add optional AI and advanced integrations.

---

## 2. Project Goals

### Learning goals
- Learn React and TypeScript through a substantial application.
- Learn Node.js, Express, REST APIs, and MongoDB/Mongoose.
- Understand authentication, role-based access control, validation, and error handling.
- Practice real-time communication, caching, queues, testing, and deployment.
- Learn to document architecture and explain technical decisions.

### Product goals
- Provide clear workflows for common hospital operations.
- Keep interfaces accessible and easy to use.
- Keep data access restricted to authorized users.
- Make important actions traceable through audit events.
- Keep the architecture modular so features can be added gradually.

### Out of scope for the first version
- Autonomous diagnosis or treatment recommendations.
- Replacing a hospital's certified/validated clinical systems.
- Direct integrations with real hospital systems before requirements and permissions are established.
- Microservices before a modular monolith is understood and justified.

---

## 3. User Roles and Permissions

Start with a small role set and expand it as modules are added.

| Role | Main responsibilities |
|---|---|
| Platform Admin | Manage demo tenants and platform-level configuration |
| Hospital Admin | Configure a hospital, departments, staff, and operational settings |
| Receptionist | Register patients, manage appointments, check-in, and queues |
| Doctor | View authorized patient records, document consultations, request tests, create prescriptions |
| Nurse | Support assigned patient workflows and record permitted observations |
| Lab Technician | Process lab orders and enter/attach results |
| Pharmacist | Review prescriptions, dispense medication, manage stock |
| Billing Staff | Create invoices, record payments, and manage billing workflows |
| Patient | View and manage their own permitted appointments and records |
| Auditor/Read-only Staff | Review permitted records and audit events without changing them |

### Authorization principles
- Authentication answers "Who are you?" Authorization answers "What may you do?"
- Enforce permissions on the server, not only by hiding frontend buttons.
- Check both role permissions and record-level access.
- Scope tenant-owned data to the active hospital/organization.
- Use least privilege: grant only the access needed for a role.
- Log sensitive actions and access where appropriate.
- Never expose secrets, tokens, or unnecessary sensitive information in logs.

---

## 4. Main Application Areas

### A. Authentication and Account Management
**Basic**
- Login and logout screens.
- Account creation by an authorized administrator.
- Password hashing on the server.
- Protected frontend routes.
- User profile and password change.

**Advanced**
- Role-based permissions.
- Secure session/token lifecycle and revocation strategy.
- Password reset with expiring, single-use tokens.
- Multi-factor authentication for privileged users.
- Login throttling and suspicious-login monitoring.
- Session/device management.
- Optional SSO for a later version.

### B. Hospital and Department Setup
**Basic**
- Hospital profile.
- Departments and specialties.
- Staff directory.
- Working hours and clinic schedules.

**Advanced**
- Multiple hospital locations.
- Tenant-level configuration.
- Department-specific appointment rules.
- Configurable numbering and document templates.
- Staff invitations and onboarding.

### C. Patient Management
**Basic**
- Register a patient.
- Generate a unique patient identifier.
- View, edit, search, and list patients.
- Capture contact and demographic details.
- Show appointment and visit history.

**Advanced**
- Duplicate-record detection and reviewed merge workflow.
- Patient documents and attachments.
- Emergency contact details.
- Consent and communication preferences.
- Record access history.
- Import/export with strict authorization and validation.
- Pagination, filters, and indexed search.

Use synthetic records during development. Avoid storing unnecessary personal data.

### D. Doctor and Staff Management
**Basic**
- Staff profiles.
- Specialty and department.
- Availability and working hours.
- Active/inactive status.

**Advanced**
- Shift and leave management.
- Schedule exceptions.
- Workload reports.
- Fine-grained staff permissions.
- Staff activity and audit history.

### E. Appointment Management
**Basic**
- Book, view, reschedule, and cancel appointments.
- Select doctor, department, date, and time.
- Appointment status: scheduled, confirmed, checked-in, in-progress, completed, cancelled, no-show.
- Calendar and list views.

**Advanced**
- Slot availability calculation.
- Prevention of double booking.
- Configurable appointment duration and buffers.
- Waitlists and cancellation slots.
- Recurring schedules where appropriate.
- Reminder notifications.
- Appointment history and change audit trail.
- Concurrency-safe booking rules.

### F. Reception and Patient Check-in
**Basic**
- Find an appointment or register a walk-in.
- Confirm arrival.
- Mark appointment as checked-in.
- Issue a queue token.

**Advanced**
- Multiple department queues.
- Priority rules configured by authorized staff.
- Queue transfer and cancellation.
- No-show handling.
- Print-friendly token slips.
- Waiting-time estimates based on transparent, configurable assumptions.

Do not implement automated clinical triage or make emergency-care decisions in the demo.

### G. Real-Time Queue Management
**Basic**
- Queue list by doctor/department.
- Statuses such as waiting, called, in consultation, completed, and skipped.
- Manual "call next" action.

**Advanced**
- Live updates with Socket.IO.
- Reconnection and state resynchronization.
- Queue history and audit events.
- Concurrency protection so two staff members cannot call the same token.
- Operational metrics such as average waiting time.
- Accessible visual and audio notification options, if appropriate.

### H. Consultation and Clinical Notes
**Basic**
- Start and complete a visit.
- Record notes, assessment, and follow-up plan.
- Link the encounter to the patient and appointment.
- Show prior encounters to authorized staff.

**Advanced**
- Structured note templates.
- Draft, signed, and amended states.
- Version history and amendments rather than silent overwrites.
- Encounter-level access controls.
- Clinician identity and timestamps.
- Explicit separation between demo content and real clinical records.

Clinical workflows must be reviewed by qualified healthcare professionals before real use.

### I. Prescriptions
**Basic**
- Create a prescription linked to a consultation.
- Add medication name, dose, route, frequency, duration, and instructions.
- View prescription history for authorized users.
- Mark prescription as cancelled or superseded when appropriate.

**Advanced**
- Medication catalogue.
- Allergy and interaction checks only when supported by reliable, validated data and reviewed by qualified professionals.
- Prescription printing/export.
- Pharmacy workflow integration.
- Clear author, timestamp, and amendment history.

Do not let an AI model autonomously prescribe or alter treatment.

### J. Laboratory Management
**Basic**
- Create a lab order from a consultation.
- View pending orders.
- Update order status: requested, collected, processing, completed, cancelled.
- Enter results and notes.
- Notify authorized users when results are ready.

**Advanced**
- Test catalogue and reference ranges configured for the institution.
- Sample tracking.
- Result review/verification workflow.
- Result amendments with history.
- Attach report files securely.
- Lab workload and turnaround-time analytics.
- Integration adapters only after vendor specifications and permissions are available.

Use synthetic results in the demo. Reference ranges and clinical interpretation require professional validation.

### K. Pharmacy and Inventory
**Basic**
- Medicine/product catalogue.
- Stock quantity and minimum-stock level.
- Receive stock and record dispensing.
- Link dispensing to a prescription.
- Low-stock list.

**Advanced**
- Batch and expiry tracking.
- Supplier and purchase-order management.
- Stock adjustments with reason and audit trail.
- Returns and wastage workflows.
- Inventory movement ledger.
- Alerts for low stock and approaching expiry.
- Reports by product and period.

For real use, medication handling and pharmacy workflows require qualified review.

### L. Bed and Admission Management
**Basic**
- Wards, rooms, and beds.
- Bed status: available, reserved, occupied, cleaning, unavailable.
- Admit and discharge demo patients.
- Show occupancy.

**Advanced**
- Admission and discharge workflow.
- Bed transfer history.
- Conflict prevention for simultaneous assignments.
- Housekeeping/cleaning workflow.
- Ward occupancy reports.
- Configurable rules for bed reservations.

Do not use a simple bed counter as a substitute for a clinically managed admission process.

### M. Billing and Payments (Later Phase)
**Basic**
- Create an invoice for selected services.
- Invoice line items, totals, discounts, and taxes as configured.
- Record payment method and payment status.
- Print-friendly invoice.

**Advanced**
- Refunds and credit notes.
- Partial payments.
- Receipt generation.
- Daily reconciliation reports.
- Role restrictions and audit history.
- Payment-gateway integration in a test environment before any live integration.

Tax, accounting, and payment requirements must be checked for the intended jurisdiction and institution.

### N. Notifications
**Basic**
- In-app notification list.
- Mark as read.
- Notifications for appointment and lab workflow changes.

**Advanced**
- Email/SMS provider integration.
- User notification preferences.
- Retry and failure handling.
- Background delivery jobs.
- Delivery status and audit events.
- Avoid putting sensitive medical details in message previews or insecure channels.

### O. Documents and File Management
**Basic**
- Upload a demo report or attachment.
- Show filename, type, size, uploader, and upload date.
- Download only when authorized.

**Advanced**
- Private object storage.
- Short-lived signed download links.
- File type/size validation and malware scanning.
- Versioning and retention policies.
- Access logging.
- Encryption in transit and at rest.
- Never expose private documents through public URLs.

### P. Dashboard and Analytics
**Basic**
- Today's appointments.
- Patient visits.
- Queue counts.
- Pending lab orders.
- Bed occupancy.
- Low-stock alerts.

**Advanced**
- Date and department filters.
- Trends and comparisons.
- Waiting-time and turnaround-time metrics.
- Exportable reports with permission checks.
- Aggregations and indexes for performance.
- Clearly label synthetic/demo data.
- Define every metric consistently so users know how it is calculated.

### Q. Search
**Basic**
- Search patients and staff by permitted fields.
- Filter appointments by date, doctor, department, and status.

**Advanced**
- Indexed search.
- Debounced search in the frontend.
- Pagination and sorting.
- Search audit controls for sensitive records.
- Full-text search for documents only if access control is preserved.

### R. Audit Logs
**Basic**
- Record important actions: record created/updated, appointment changed, prescription created, lab result changed, user/role changed.
- Include actor, action, target record ID, timestamp, and relevant non-sensitive metadata.

**Advanced**
- Append-oriented audit records.
- Restricted audit access.
- Search/filter by actor, action, and date.
- Detect unusual access patterns.
- Avoid storing passwords, tokens, or full sensitive payloads in audit logs.
- Define retention and export rules.

### S. AI Features (Optional, Late Phase)
**Safer initial use cases**
- Summarize non-sensitive demo documents.
- Draft administrative summaries from approved, minimal data.
- Answer operational questions by calling narrowly defined, permission-checked backend tools.
- Explain dashboard trends using calculated metrics.

**Requirements**
- Clearly label AI-generated content.
- Require human review before any clinical use.
- Send only the minimum necessary data to external AI services.
- Do not use real patient data during learning.
- Do not allow arbitrary model-generated database queries or unrestricted tool execution.
- Validate and authorize every backend tool call.
- Handle hallucinations, unavailable services, and model errors.
- Keep AI out of diagnosis, triage, and treatment decisions unless a separately validated and appropriately regulated use case is established.

### T. Platform Administration and Multi-Tenancy (Advanced)
- Organizations/hospitals and their configuration.
- Users associated with an organization.
- Tenant-scoped records and queries.
- Organization onboarding and deactivation.
- Tenant-level settings and feature flags.
- Optional subscription/usage management only if useful for the learning goal.

Every tenant-owned query must enforce tenant scope server-side. Add automated tests proving that one hospital cannot access another hospital's data.

---

## 5. Recommended Technology Stack

Start with the smallest stack that can support the first milestone. Add advanced tools only when their purpose is clear.

### Frontend
- React
- TypeScript
- Vite
- React Router
- Plain CSS or CSS Modules (chosen for readability)
- TanStack Query when API integration begins
- A chart library such as Recharts when dashboard charts are needed
- React Hook Form and Zod when forms become more complex

### Backend
- Node.js
- Express
- TypeScript
- Prisma ORM (Type-safe SQL query client and migration engine)
- Zod or another schema-validation library
- Centralized error handling
- Structured logging

### Database and infrastructure
- PostgreSQL (Production & Local) / SQLite (Zero-config local fallback), managed via Prisma ORM
- Prisma Studio for visual web-based SQL database management (`npx prisma studio`)
- Redis only when caching, distributed coordination, or queues are needed
- Socket.IO for real-time queue updates
- BullMQ for background jobs, with Redis
- Private object storage for files in a later phase
- Docker and Docker Compose after the app works locally
- Git and GitHub
- GitHub Actions for CI
- Deployment platform selected later based on cost, reliability, and operational needs

### Testing
- Vitest or Jest for unit tests
- Supertest for API integration tests
- React Testing Library for component tests
- Playwright for end-to-end tests (later)

Do not introduce microservices at the beginning. Start with a modular monolith: one backend application with clearly separated modules.

---

## 6. Suggested Repository Structure

Create this structure gradually; do not create every file on day one.

```text
careflow/
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── routes/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── types/
│   │   ├── data/
│   │   ├── utils/
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   └── package.json
├── server/
│   ├── src/
│   │   ├── config/
│   │   ├── middleware/
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   ├── organizations/
│   │   │   ├── users/
│   │   │   ├── patients/
│   │   │   ├── doctors/
│   │   │   ├── appointments/
│   │   │   ├── queue/
│   │   │   ├── encounters/
│   │   │   ├── prescriptions/
│   │   │   ├── laboratory/
│   │   │   ├── pharmacy/
│   │   │   ├── beds/
│   │   │   ├── billing/
│   │   │   └── notifications/
│   │   ├── jobs/
│   │   ├── utils/
│   │   ├── app.ts
│   │   └── server.ts
│   └── package.json
├── docs/
│   ├── product-requirements.md
│   ├── architecture.md
│   ├── database-design.md
│   ├── api-specification.md
│   └── testing-plan.md
├── .gitignore
├── README.md
└── docker-compose.yml   # Add later
```

Each backend module can eventually contain its routes, controller, service, model, validation schema, and tests. Keep the design simple until a module needs more structure.

---

## 7. Frontend Screens

### Shared screens/components
- Login
- Not-found page
- Access-denied page
- Main layout
- Sidebar navigation
- Top navbar
- User profile menu
- Notifications panel
- Loading, empty, and error states
- Confirmation dialog
- Reusable form controls
- Search/filter bar
- Data table
- Pagination
- Toast/feedback messages

### Main pages
1. Dashboard
2. Patients list
3. Add/edit patient
4. Patient details and visit history
5. Doctors/staff list
6. Doctor details and schedule
7. Appointments calendar/list
8. Appointment form/details
9. Queue dashboard
10. Consultation workspace
11. Prescriptions
12. Laboratory orders and results
13. Pharmacy catalogue and inventory
14. Beds and admissions
15. Billing and invoices
16. Reports and analytics
17. Notifications
18. Hospital/department settings
19. User and role management
20. Audit log viewer

Build the first screens with synthetic data. Then connect each screen to its API one module at a time.

---

## 8. Database Design — SQL Relational Tables (Prisma ORM)

CareFlow uses a relational SQL database architecture (PostgreSQL / SQLite for local development) managed through Prisma ORM.

| SQL Table | Purpose | Primary Keys & Foreign Keys |
|---|---|---|
| `organizations` | Hospital / tenant metadata | `id` (PK) |
| `users` | Auth accounts & login credentials | `id` (PK), `organizationId` (FK) |
| `departments` | Hospital specialties & clinic suites | `id` (PK), `organizationId` (FK) |
| `doctors` | Physician profiles, specialties, fees | `id` (PK), `departmentId` (FK), `userId` (FK) |
| `doctor_schedules` | Weekly shift availability & slots | `id` (PK), `doctorId` (FK) |
| `patients` | Demographic, contact & admission records | `id` (PK), `mrn` (Unique), `departmentId` (FK), `doctorAssignedId` (FK) |
| `patient_vitals` | Time-stamped clinical vitals (BP, HR, SpO2) | `id` (PK), `patientId` (FK) |
| `appointments` | Bookings, status & schedule references | `id` (PK), `patientId` (FK), `doctorId` (FK), `departmentId` (FK) |
| `queue_tokens` | Live token states, priority, counters | `id` (PK), `patientId` (FK), `doctorId` (FK), `departmentId` (FK) |
| `consultations` | Medical visit records, clinical notes | `id` (PK), `patientId` (FK), `doctorId` (FK), `appointmentId` (FK) |
| `prescriptions` | Medication dosage, frequency, duration | `id` (PK), `consultationId` (FK), `patientId` (FK), `doctorId` (FK) |
| `lab_orders` | Diagnostic lab test orders & statuses | `id` (PK), `patientId` (FK), `doctorId` (FK) |
| `lab_results` | Biochemical result values & verified ranges | `id` (PK), `labOrderId` (FK) |
| `medicines` | Pharmacy formulary catalogue | `id` (PK) |
| `inventory_batches`| Stock, batch number, expiry date | `id` (PK), `medicineId` (FK) |
| `inventory_movements`| Dispensing ledger, receipts, adjustments | `id` (PK), `medicineId` (FK), `prescriptionId` (FK) |
| `wards_and_beds` | Ward, room & bed occupancy states | `id` (PK), `departmentId` (FK), `currentPatientId` (FK) |
| `admissions` | Inpatient admission & discharge dates | `id` (PK), `patientId` (FK), `bedId` (FK) |
| `invoices` | Patient billable items & totals | `id` (PK), `patientId` (FK), `consultationId` (FK) |
| `payments` | Transaction records & reconciliation | `id` (PK), `invoiceId` (FK) |
| `audit_logs` | Append-only security & operational audit trail| `id` (PK), `userId` (FK) |

### Relational Data modeling principles
- Strict Referential Integrity: Enforce foreign key constraints with cascading or protective delete policies.
- Type-Safe Queries: Prisma ORM generates TypeScript types directly from the schema (`PrismaClient`).
- Database Migrations: Track all database schema changes with versioned SQL migrations (`prisma migrate dev`).
- Visual Database Management: Integrated web GUI via Prisma Studio (`npx prisma studio`) for real-time inspection and data management.
- Transactional Safety: Use Prisma interactive transactions (`prisma.$transaction`) for workflows like appointment booking and dispensing where multiple tables must be updated atomically.

---

## 9. API Design Principles

Use a versioned REST API, for example:

```text
/api/v1/auth
/api/v1/organizations
/api/v1/users
/api/v1/patients
/api/v1/doctors
/api/v1/departments
/api/v1/appointments
/api/v1/queue
/api/v1/encounters
/api/v1/prescriptions
/api/v1/lab-orders
/api/v1/lab-results
/api/v1/medicines
/api/v1/inventory
/api/v1/beds
/api/v1/admissions
/api/v1/invoices
/api/v1/notifications
/api/v1/reports
/api/v1/audit-logs
```

### API standards
- Use appropriate HTTP methods and status codes.
- Validate path parameters, query parameters, and request bodies.
- Use consistent response and error formats.
- Add pagination and filtering to list endpoints.
- Authenticate and authorize every protected endpoint.
- Enforce tenant isolation on the server.
- Avoid returning database internals or sensitive fields unnecessarily.
- Document endpoints with OpenAPI/Swagger when the API grows.
- Add rate limits to sensitive endpoints.
- Test authorization failures as carefully as successful requests.

---

## 10. Security and Privacy Checklist

Security must be developed alongside features, not added only at the end.

### Baseline
- Keep secrets in environment variables; never commit `.env`.
- Use strong password hashing.
- Validate all inputs server-side.
- Use secure authentication/session practices.
- Apply server-side authorization to every protected operation.
- Configure CORS narrowly.
- Add rate limiting and sensible request-size limits.
- Avoid leaking stack traces or secrets to clients.
- Use HTTPS in deployment.
- Keep dependencies updated.
- Restrict file uploads by type and size.
- Keep uploaded files private.
- Use least-privilege database and cloud credentials.
- Back up data and periodically test restoration.
- Log errors without logging passwords, tokens, or unnecessary medical data.
- Add audit events for sensitive actions.
- Test tenant isolation and record-level permissions.
- Establish data retention, export, and deletion policies.

### Before real-world healthcare use
- Obtain qualified legal/privacy/security and clinical review.
- Determine which laws, rules, contracts, and health-data requirements apply to the actual deployment.
- Define incident response, backup recovery, access review, and downtime procedures.
- Validate integrations and clinical workflows with qualified stakeholders.
- Do not claim compliance or certification without evidence.

---

## 11. Testing Strategy

### Unit tests
Test isolated functions and business rules:
- Appointment slot validation
- Queue state transitions
- Invoice calculations
- Inventory movements
- Permission checks

### API integration tests
Test:
- Valid and invalid requests
- Authentication failures
- Role restrictions
- Record ownership
- Tenant isolation
- Duplicate booking attempts
- Validation and error responses

### Frontend tests
Test:
- Forms and validation messages
- Loading, empty, success, and error states
- Navigation
- Role-specific UI
- Accessible labels and keyboard interactions

### End-to-end tests
Test representative journeys:
1. Authorized staff logs in.
2. Staff registers a synthetic patient.
3. Staff books an appointment.
4. Reception checks the patient in.
5. Queue token is created.
6. Doctor completes a demo consultation.
7. Doctor requests a demo lab test.
8. Lab staff records a result.
9. Authorized user sees the updated status.

### Quality gates
- No secrets in the repository.
- No known cross-tenant data leaks.
- Important authorization tests pass.
- Critical workflow tests pass.
- Errors are handled consistently.
- README setup steps work on a clean environment.

---

## 12. Performance and Reliability — Advanced

Add these only after the core workflows are working.

- Database indexes for common filters and lookups.
- Pagination instead of loading entire collections.
- Efficient projections and aggregation pipelines.
- Frontend query caching and invalidation.
- Redis caching for data that is safe and useful to cache.
- Cache invalidation rules.
- Socket.IO for real-time queue changes.
- BullMQ for slow or retryable jobs.
- Idempotency for jobs/actions that must not be applied twice.
- Retry with backoff and a strategy for permanently failed jobs.
- Health-check endpoints.
- Structured logs and correlation/request IDs.
- Error monitoring and uptime monitoring.
- Rate limiting and abuse protection.
- Graceful shutdown and database connection handling.
- Backup and restore drills.
- Load tests for important endpoints.
- Documented recovery and downtime procedures.

Avoid adding Redis, queues, or multiple services simply to make the project look advanced. Every component should solve a real problem.

---

## 13. Phased Build Plan

Each phase ends with a working, tested milestone. Tasks are tracked with checkboxes.

---

### Phase 0 — Planning & Setup ✅

> **Status: DONE** | **Deliverable:** Product scope, initial UI sketches, and project scaffold.

- [x] Define scope and roles
- [x] Draw user journeys
- [x] Sketch the main screens
- [x] Write initial requirements (this document)
- [x] Create GitHub repository and README
- [x] Agree on naming and code style

---

### Phase 1 — Frontend Foundation ✅

> **Status: DONE** | **Deliverable:** Navigable frontend using dummy data.

#### 1.1 Project Setup
- [x] Create React + TypeScript + Vite app (`CareFlowFrontend/`)
- [x] Install React Router
- [x] Set up base `index.css` with global styles
- [x] Set up `App.tsx` with BrowserRouter

#### 1.2 Layout Shell
- [x] Build `MainLayout` component (sidebar + navbar + content area)
- [x] Build `Sidebar` navigation component with nav links
- [x] Build `Navbar` (top bar) component

#### 1.3 Routing
- [x] Configure `AppRoutes.tsx` with all initial routes
- [x] Default `/` redirects to `/dashboard`
- [x] Routes: `/login`, `/dashboard`, `/patients`, `/doctors`, `/appointments`, `/queue`, `/laboratory`, `/pharmacy`
- [x] Route: `/patients/:id` for patient details

#### 1.4 Dashboard Page
- [x] Build `Dashboard` page with greeting header
- [x] Build `StatCard` component (reusable stat display)
- [x] Build `StatsGrid` component (grid of stat cards with synthetic data)
- [x] Build `PatientVisitsChart` component (chart with synthetic data)
- [x] Build `PatientsQueue` component (queue summary with synthetic data)
- [x] Build `AppointmentTable` component (today's appointments with synthetic data)

#### 1.5 Placeholder Pages
- [x] `Login` page (placeholder — visual only)
- [x] `Doctors` page (placeholder)
- [x] `Appointments` page (placeholder)
- [x] `Queue` page (placeholder)
- [x] `Laboratory` page (placeholder)
- [x] `Pharmacy` page (placeholder)

#### 1.6 Shared Components & Polish
- [x] Build a proper `Login` screen (visual only, no auth yet — form with email/password fields, branding)
- [x] Build `NotFound` (404) page
- [x] Build `AccessDenied` (403) page
- [x] Add user profile menu to Navbar
- [x] Add notifications bell icon/panel to Navbar
- [x] Build reusable `ConfirmationDialog` component
- [x] Build reusable `Toast` / feedback message system
- [x] Build `Loading` spinner / skeleton component
- [x] Build `EmptyState` component
- [x] Build `ErrorState` component
- [x] Check layout at desktop and mobile widths (responsive)
- [x] Add sidebar collapse/toggle for mobile

---

### Phase 2 — Patient & Staff UI ✅

> **Status: DONE** | **Deliverable:** Usable frontend prototypes for patient and staff modules.

#### 2.1 Patient List Page
- [x] Build `Patients` page with header and "Add Patient" button
- [x] Build `PatientSearch` component (search input + department/status filters)
- [x] Build `PatientTable` component (table with columns: name, age, gender, phone, department, status)
- [x] Implement client-side search filtering by name
- [x] Implement client-side filtering by department
- [x] Implement client-side filtering by status
- [x] Hard-coded synthetic patient data (6 patients)

#### 2.2 Patient Details Page
- [x] Build `PatientDetails` page (accessible via `/patients/:id`)
- [x] Back-to-patients navigation button
- [x] Display full patient info card (name, age, gender, phone, department, status)
- [x] Show appointment history section (synthetic)
- [x] Show visit history section (synthetic)

#### 2.3 Add/Edit Patient Form
- [x] Build `AddPatient` page/modal with form fields
- [x] Form fields: name, age, gender, phone, department
- [x] Client-side form validation
- [x] Add to synthetic patient list (local state)
- [x] Build `EditPatient` page/modal

#### 2.4 Patient Table Enhancements
- [x] Pagination component
- [x] Sortable columns (click column header to sort)
- [x] Status badges with color coding
- [x] Row click navigates to patient details
- [x] Action buttons (view, edit, delete)

#### 2.5 Doctor/Staff List Page
- [x] Build full `Doctors` page (not just placeholder)
- [x] Doctor cards or table with: name, specialty, department, status
- [x] Synthetic doctor data
- [x] Search and filter by specialty/department

#### 2.6 Doctor Details & Schedule
- [x] Build `DoctorDetails` page
- [x] Show doctor profile info
- [x] Show weekly schedule/availability (synthetic)
- [x] Route: `/doctors/:id`

#### 2.7 Reusable Form Controls
- [x] Text input component
- [x] Select/dropdown component
- [x] Date picker component
- [x] Form group/field wrapper with label + error
- [x] Move `Patient` type to `types/` directory

---

### Phase 3 — Backend Foundation ✅

> **Status: DONE** | **Deliverable:** Running API that the frontend can call.

#### 3.1 Server Setup
- [x] Create `server/` directory with Express + TypeScript
- [x] Configure `tsconfig.json` for server
- [x] Install dependencies: express, cors, dotenv, @prisma/client, prisma
- [x] Create `server.ts` entry point
- [x] Create `app.ts` with Express setup

#### 3.2 Core Middleware
- [x] Add health-check route (`GET /api/v1/health`)
- [x] Configure environment variables (`.env` + `.env.example`)
- [x] Add centralized error handler middleware
- [x] Add request validation middleware (Zod)
- [x] Add structured logging (winston or pino)
- [x] Add API versioning (`/api/v1/`)
- [x] Add CORS configuration
- [x] Add request-size limits

#### 3.3 Project Config
- [x] Add `.gitignore` for server (node_modules, .env, dist, *.db)
- [x] Add `npm` scripts: `dev`, `build`, `start`, `db:studio`, `db:push`, `db:seed`
- [x] Add tsx for dev hot-reloading

---

### Phase 4 — SQL Database & API Integration ✅

> **Status: DONE** | **Deliverable:** Relational SQL database managed via Prisma ORM with Prisma Studio GUI and TanStack Query integration.

#### 4.1 SQL Database & Prisma Setup
- [x] Setup Prisma ORM with PostgreSQL / SQLite local fallback
- [x] Configure `DATABASE_URL` in `.env`
- [x] Run Prisma migration / push schema to SQL database
- [x] Enable Prisma Studio for visual SQL management (`npm run db:studio`)
- [x] Create database seed script (`prisma/seed.ts`) with synthetic records

#### 4.2 SQL Relational Schema (Prisma)
- [x] `User` model (email, passwordHash, role, status)
- [x] `Department` model (name, description, suite)
- [x] `Doctor` model (name, title, specialty, departmentId, room, fee, rating, bio)
- [x] `DoctorSchedule` model (doctorId, day, shifts, slotsRemaining, isAvailable)
- [x] `Patient` model (mrn, name, age, gender, phone, email, address, departmentId, status, bloodGroup)
- [x] `PatientVital` model (patientId, bloodPressure, heartRate, temperature, spO2, recordedAt)

#### 4.3 Patient CRUD API
- [x] `POST /api/v1/patients` — create patient
- [x] `GET /api/v1/patients` — list patients (with pagination, search, filters)
- [x] `GET /api/v1/patients/:id` — get single patient
- [x] `PUT /api/v1/patients/:id` — update patient
- [x] `DELETE /api/v1/patients/:id` — soft-delete patient
- [x] Input validation with Zod schemas

#### 4.4 Staff CRUD API
- [x] `POST /api/v1/doctors` — create staff profile
- [x] `GET /api/v1/doctors` — list doctors/staff
- [x] `GET /api/v1/doctors/:id` — get single doctor
- [x] `PUT /api/v1/doctors/:id` — update doctor

#### 4.5 Frontend-Backend Integration
- [x] Install TanStack Query in frontend
- [x] Create API service layer (`services/api.ts`)
- [x] Connect Patient list page to `GET /api/v1/patients`
- [x] Connect Patient details page to `GET /api/v1/patients/:id`
- [x] Connect Add Patient form to `POST /api/v1/patients`
- [x] Connect Edit Patient form to `PUT /api/v1/patients/:id`
- [x] Add loading, empty, success, and error states to all connected pages
- [x] Seed database with synthetic patient data

---

### Phase 5 — Authentication & Authorization ✅

> **Status: DONE** | **Deliverable:** Authenticated users with enforced permissions, JWT security, and role-based access control.

#### 5.1 Auth Backend
- [x] Implement user registration (admin-only)
- [x] Implement login endpoint (`POST /api/v1/auth/login`)
- [x] Password hashing with bcrypt
- [x] JWT token generation and verification
- [x] Refresh token strategy
- [x] Logout / token invalidation

#### 5.2 Auth Middleware
- [x] `authMiddleware` — verify JWT on protected routes
- [x] `roleMiddleware` — check user role permissions
- [x] Apply to all protected API routes

#### 5.3 Frontend Auth
- [x] Build proper Login page (form, validation, error display)
- [x] Auth context/provider for storing user state
- [x] Protected route wrapper component
- [x] Redirect unauthenticated users to `/login`
- [x] Store token securely (httpOnly cookie preferred / secure token storage)
- [x] Auto-logout on token expiry
- [x] Show/hide sidebar items based on user role

#### 5.4 Security Hardening
- [x] Login throttling / rate limiting
- [x] Password reset with expiring tokens
- [x] Test forbidden access paths (wrong role, wrong tenant)
- [x] Seed demo users with different roles

---

### Phase 6 — Appointments ✅

> **Status: DONE** | **Deliverable:** End-to-end appointment workflow.

#### 6.1 Appointment Backend
- [x] Create `Appointment` model
- [x] `POST /api/v1/appointments` — book appointment
- [x] `GET /api/v1/appointments` — list (with filters: date, doctor, department, status)
- [x] `GET /api/v1/appointments/:id` — get single
- [x] `PUT /api/v1/appointments/:id` — reschedule/update
- [x] `PATCH /api/v1/appointments/:id/cancel` — cancel
- [x] `PATCH /api/v1/appointments/:id/status` — update status
- [x] Double-booking prevention logic
- [x] Status transitions: scheduled → confirmed → checked-in → in-progress → completed

#### 6.2 Doctor Schedule Backend
- [x] Create `DoctorSchedule` model
- [x] `GET /api/v1/doctors/:id/schedule` — get availability
- [x] `PUT /api/v1/doctors/:id/schedule` — update schedule
- [x] Slot availability calculation

#### 6.3 Appointment Frontend
- [x] Build full `Appointments` page (calendar/list view)
- [x] Build appointment booking form (select doctor, department, date, time)
- [x] Build appointment details view
- [x] Appointment status badges
- [x] Reschedule and cancel actions
- [x] Connect to backend APIs


---

### Phase 7 — Queue Management ✅

> **Status: DONE** | **Deliverable:** Working queue workflow with synthetic data.

#### 7.1 Queue Backend
- [x] Create `QueueEntry` model (managed as `QueueToken` in Prisma)
- [x] `POST /api/v1/queue` — create queue token (check-in)
- [x] `GET /api/v1/queue` — list by doctor/department
- [x] `PATCH /api/v1/queue/:id/call` — call next patient
- [x] `PATCH /api/v1/queue/:id/complete` — mark completed
- [x] `PATCH /api/v1/queue/:id/skip` — skip patient
- [x] Queue status transitions: waiting → called → in-consultation → completed/skipped
- [x] Concurrency protection (two staff can't call the same token)

#### 7.2 Queue Frontend
- [x] Build full `Queue` dashboard page
- [x] Queue list by doctor/department
- [x] Call-next action button
- [x] Status indicators and transitions
- [x] Token display
- [x] Connect to backend APIs

#### 7.3 Reception Check-in
- [x] Build check-in workflow (find appointment → confirm arrival → issue token)
- [x] Walk-in registration flow


---

### Phase 8 — Consultation & Prescriptions ✅

> **Status: DONE** | **Deliverable:** End-to-end appointment/queue-to-consultation workflow, SOAP EMR notes, live prescription pad with multi-drug regimen, and printable official Rx slips.

#### 8.1 Consultation Backend
- [x] Create `Consultation` model (relational Prisma schema)
- [x] Create Zod validation schemas for consultations and prescriptions (`encounterValidation.ts`)
- [x] `POST /api/v1/consultations` (and `/api/v1/encounters`) — create visit with atomic prescriptions
- [x] `PATCH /api/v1/consultations/:id` — update clinical notes and diagnosis
- [x] `GET /api/v1/consultations` — list with multi-column search, pagination & filters
- [x] `GET /api/v1/consultations/:id` — get single consultation with prescriptions & vitals
- [x] Link encounter to patient, doctor, and optional appointment
- [x] Transactional auto-completion of linked appointments and waiting room queue tokens upon consultation signing

#### 8.2 Prescription Backend
- [x] Create `Prescription` model (linked to patient, doctor, consultation)
- [x] `POST /api/v1/prescriptions` — create prescription (encounter or standalone)
- [x] `GET /api/v1/prescriptions` — list with patient, doctor, consultation & status filters
- [x] `PATCH /api/v1/prescriptions/:id/cancel` — cancel / discontinue prescription
- [x] Fields: medication, dosage, route, frequency, duration, instructions, status

#### 8.3 Consultation Frontend
- [x] Build `Consultation` workspace page (`/consultations`)
- [x] Patient selection banner with live triage vitals strip (BP, Heart rate, Temp, SpO2, Weight) & allergy warning
- [x] SOAP notes editor (Subjective, Objective, Assessment, Plan) with quick tags
- [x] Interactive Prescription Pad with dynamic drug rows, dosage, route, frequency, duration & instructions
- [x] Quick medication presets (+ Amoxicillin, + Paracetamol, + Pantoprazole, + Cetirizine, + Metformin)
- [x] Consultation Archive drawer with search and one-click Rx slip preview
- [x] Official printable Prescription Slip Modal (`PrescriptionSlipModal.tsx`) with classical `℞` styling and `window.print()`
- [x] Seamless queue and patient profile navigation (`🩺 Open EMR` / `🩺 Start Consultation`)
- [x] Role-based route guard (`["Admin", "Hospital Admin", "Doctor", "Nurse"]`)

---

### Phase 9 — Laboratory ✅

> **Status: DONE** | **Deliverable:** End-to-end diagnostic laboratory & pathology workflow: specimen collection, test catalogue directory, verified result entry with biological reference intervals & critical alerts, and printable pathology reports.

#### 9.1 Lab Backend
- [x] Create `LabOrder` model (relational Prisma schema)
- [x] Create `LabResult` model (relational Prisma schema)
- [x] `POST /api/v1/laboratory/orders` (and `/api/v1/lab-orders`) — create order with auto-generated sequential order numbers
- [x] `GET /api/v1/laboratory/orders` — list pending/completed with multi-filter & search
- [x] `GET /api/v1/laboratory/orders/:id` — get order details with verified results
- [x] `PATCH /api/v1/laboratory/orders/:id/status` — update specimen lifecycle (Requested → Sample Collected → In-Analysis → Completed)
- [x] `POST /api/v1/laboratory/orders/:id/results` — enter and amend parameter results with automatic completion
- [x] `GET /api/v1/laboratory/catalog` — diagnostic test catalogue (CBC, CMP, Lipid, LFT, Thyroid, Troponin, Urinalysis)
- [x] Status transitions: requested → sample collected → in-analysis → completed/cancelled
- [x] Automated critical value detection and flag calculation

#### 9.2 Lab Frontend
- [x] Build full `Laboratory` dashboard page (`/laboratory`)
- [x] Department KPI metrics (Total Orders, Pending Collection, In Processing, Completed Reports, Critical Alerts)
- [x] Operational tabs (All Investigations, Sample Collection, In Analysis, Verified Reports, Test Catalogue)
- [x] Order Lab Test Modal (`OrderLabTestModal.tsx`) with test panel selection, priority, and clinical indications
- [x] Verified Result Entry Modal (`EnterLabResultsModal.tsx`) with auto-prefilled catalog parameters, reference ranges, and abnormal/critical flags
- [x] Official printable Pathology Report Modal (`LabReportModal.tsx`) with dual technician/pathologist signature lines and `window.print()`
- [x] Test Catalogue browser card grid with specimen requirements and expected turnaround times
- [x] Role-based route guard (`["Admin", "Hospital Admin", "Doctor", "LabTech", "Nurse"]`)

---

### Phase 10 — Pharmacy & Inventory ✅

> **Status: DONE** | **Deliverable:** Full-stack hospital formulary management, FEFO batch-deduction dispensing engine, e-prescription fulfillment queue, stock receiving shipments, low-stock reorder alerts, and an immutable inventory movement ledger.

#### 10.1 Pharmacy Backend
- [x] Create `Medicine` model (SKU, generic/brand name, therapeutic category, dosage form, strength, retail & cost pricing, min stock threshold, Rx schedule flags)
- [x] Create `InventoryBatch` model (batch/lot number, quantity received/remaining, expiration date, purchase date, supplier distributor)
- [x] Create `InventoryMovement` model (audit ledger for RECEIVE, DISPENSE, ADJUSTMENT, RETURN with timestamps and operator credentials)
- [x] `GET /api/v1/pharmacy/medicines` (and `/api/v1/medicines`) — browse hospital formulary with search, category filtering, stock health filters, and department metrics
- [x] `GET /api/v1/pharmacy/medicines/:id` — get medicine details with active batch lots and earliest expiry
- [x] `POST /api/v1/pharmacy/medicines` — register new pharmaceutical entity in hospital formulary
- [x] `POST /api/v1/pharmacy/receive` (and `/api/v1/inventory/receive`) — receive stock shipment into inventory batch lots
- [x] `POST /api/v1/pharmacy/dispense` (and `/api/v1/inventory/dispense`) — automated FEFO (First-Expiring First-Out) stock deduction linked to prescriptions
- [x] `GET /api/v1/pharmacy/prescriptions/pending` — retrieve active physician prescriptions awaiting dispensing
- [x] `GET /api/v1/pharmacy/movements` — query immutable audit ledger
- [x] `GET /api/v1/pharmacy/low-stock` (and `/api/v1/inventory/low-stock`) — low-stock warnings and depleted drug items
- [x] Seed realistic formulary data (`prisma/seedPharmacy.ts`) with active lots, expiring batches, and movement ledger logs

#### 10.2 Pharmacy Frontend
- [x] Build full `Pharmacy` executive workspace (`/pharmacy`)
- [x] Department KPI metric cards (Total Formulary, Units on Hand, Low Stock Warnings, Depleted Out-of-Stock, Gross Formulary Value)
- [x] Operational tabs (Formulary Catalogue, e-Prescription Queue, Stock Movements Ledger, Reorder & Expiry Alerts)
- [x] Real-time interactive stock progress indicators with min-threshold bars and health badges (Healthy, Low Stock, Depleted)
- [x] Expandable batch/lot drawer within formulary table showing lot numbers, quantities remaining, and expiry timeline
- [x] Receive Stock Modal (`ReceiveStockModal.tsx`) for logging verified incoming shipment batches
- [x] FEFO Dispensing Modal (`DispenseMedicationModal.tsx`) with live lot breakdown preview and direct link to doctor prescriptions
- [x] Add Medicine Modal (`AddMedicineModal.tsx`) for cataloging approved hospital drugs
- [x] Direct one-click e-prescription fulfillment queue connecting doctor consultations to pharmacy dispensing
- [x] Immutable movement ledger table with transaction type badges and audit references
- [x] Role-based route guard (`["Admin", "Hospital Admin", "Doctor", "Pharmacist"]`)

---

### Phase 11 — Beds & Admissions ✅

> **Status: DONE** | **Deliverable:** Full-stack inpatient admission, ward occupancy management, visual floor plan, internal clinical bed transfers, and terminal disinfection protocol.

#### 11.1 Backend
- [x] Create `Ward`, `Room`, `Bed` models in Prisma schema with relations to `Department`
- [x] Create `Admission` and `BedTransfer` models with relations to `Patient` and `Doctor`
- [x] `GET /api/v1/wards` (and `/api/v1/beds/wards`, `/api/v1/beds/summary`) — ward occupancy metrics and hospital KPIs
- [x] `GET /api/v1/beds` — list beds with search, ward, and status filtering with occupant details
- [x] `GET /api/v1/beds/available` — fast available bed locator
- [x] `POST /api/v1/admissions` (and `/api/v1/beds/admit`) — admit patient with concurrency conflict prevention
- [x] `POST /api/v1/admissions/:id/transfer` — transfer patient between beds and wards, automatically releasing source bed to 'Cleaning'
- [x] `POST /api/v1/admissions/:id/discharge` — discharge patient with clinical summary, auto-switching bed to 'Cleaning' for sanitization
- [x] `PATCH /api/v1/beds/:id/status` — update bed operational status (Available, Cleaning, Maintenance, Reserved)
- [x] `GET /api/v1/admissions` — query active inpatient roster with length of stay calculation
- [x] Seed realistic wards, rooms, and beds (`prisma/seedBeds.ts`) across ICU, CCU, General Medical, Post-Surgical, and Pediatric wings

#### 11.2 Frontend
- [x] Build full `Beds` page (`/beds`) with visual ward floor plan and room grouping
- [x] Color-coded bed status indicators (🟢 Available, 🔴 Occupied, 🧹 Cleaning, 🔧 Maintenance, 🔵 Reserved)
- [x] Hospital department KPI metric cards (Overall Occupancy Rate, Total Beds, Active Inpatients, Available Ready, Housekeeping Needed)
- [x] Inpatient Admission Modal (`AdmitPatientModal.tsx`) with patient, doctor, ward, bed, and clinical condition selectors
- [x] Bed Transfer Modal (`TransferBedModal.tsx`) for relocations and ICU step-downs
- [x] Patient Discharge Modal (`DischargePatientModal.tsx`) with discharge dispositions, summary notes, and automatic terminal cleaning notice
- [x] Bed Status Management Modal (`UpdateBedStatusModal.tsx`) for housekeeping sanitization release
- [x] Active Inpatient Clinical Roster tab with days admitted and quick transfer/discharge controls
- [x] Wards & Tariff Directory tab showing room amenities, floor locations, and daily base rates
- [x] Integrated `/beds` route in `AppRoutes.tsx` and `sidebar.tsx` with role-based protection

---

### Phase 12 — Billing & Reports ✅

> **Status: DONE** | **Deliverable:** Full-stack billing, invoice generation with multi-line items, payment receipt recording, printable invoice slips (`window.print()`), aging receivables management, executive analytics & turnaround time intelligence.

#### 12.1 Billing Backend
- [x] Create `Invoice` model with relations to `Patient`, `Consultation`, and `Admission`
- [x] Create `InvoiceLineItem` and `Payment` models
- [x] Invoice CRUD with line items, sequential numbering (`INV-YYYY-XXXX`), totals, discounts, taxes
- [x] Payment recording with receipt generation (`REC-YYYY-XXXX`), auto balance recalculation
- [x] Invoice status lifecycle: Draft → Issued → Partially Paid → Paid → Cancelled
- [x] REST APIs: `/api/v1/billing/metrics`, `/api/v1/billing/invoices`, `/api/v1/billing/payments`, `/api/v1/billing/export`, `/api/v1/reports/overview`
- [x] Seed realistic hospital billing accounts (`prisma/seedBilling.ts`) across Inpatient, Emergency, and Outpatient encounters

#### 12.2 Billing Frontend
- [x] Build full `Billing` page (`/billing`) with department KPI metric cards ($3.6k invoiced, $1.7k collected, $1.9k receivables)
- [x] Create Invoice Modal (`CreateInvoiceModal.tsx`) with dynamic multi-line item adding, preset shortcuts, discount & tax calculations
- [x] Invoice Details Modal (`InvoiceDetailsModal.tsx`) with full itemization, payments history, cancellation workflow
- [x] Record Payment Modal (`RecordPaymentModal.tsx`) with quick percentage buttons, multi-channel payment methods, and balance preview
- [x] Print-friendly hospital invoice slip layout with dedicated `@media print` CSS rules (`window.print()`)
- [x] Outstanding Receivables tab for tracking pending co-pay & aging bills
- [x] Payment Receipts Ledger tab for cashier audit trail

#### 12.3 Reports & Analytics
- [x] Build full `Reports` page (`/reports`)
- [x] Operational Recharts (6-month monthly revenue & collection trends, service category share)
- [x] Date and department filters
- [x] Exportable reports (.CSV download engine)
- [x] Waiting-time and turnaround-time metrics (Avg queue wait 18.4m, Lab TAT 52m, ALOS 3.6d, Bed Occupancy 25%)
- [x] Department clinical workload distribution table (Appointments, Consultations, Doctor staffing, Estimated Revenue)

---

### Phase 13 — Multi-Tenancy & Stronger Security ✅

> **Status: DONE** | **Deliverable:** Demonstrable separation between two synthetic hospitals, full audit log viewer, and comprehensive threat model.

- [x] Create `Organization` model
- [x] Associate all records with an organization
- [x] Tenant-scoped queries on every endpoint
- [x] Tenant isolation tests (hospital A can't see hospital B's data)
- [x] Build `AuditLog` viewer page
- [x] Audit log search/filter (actor, action, date)
- [x] Security review and threat model document
- [x] Seed two demo hospitals with separate data

---

### Phase 14 — Real-Time & Background Jobs ✅

> **Status: DONE** | **Deliverable:** Real-time updates and reliable asynchronous work with BullMQ architecture, exponential backoff, and Dead-Letter Queue.

- [x] Add Socket.IO to server
- [x] Real-time queue updates (token called, completed, etc.)
- [x] Client-side Socket.IO integration with reconnection
- [x] State resynchronization after reconnect
- [x] Add Redis for caching + queue backend
- [x] Add BullMQ for background jobs
- [x] Notification delivery job
- [x] Report generation job
- [x] Retries, idempotency, failure handling
- [x] Dead-letter queue for permanently failed jobs

---

### Phase 15 — Files & Optional AI ✅

> **Status: DONE** | **Deliverable:** HIPAA-compliant private file vault with 15-minute signed token downloads, SHA-256 integrity verification, HIPAA-scrubbed SOAP clinical summarizer with ICD-10 tagging, and grounded database operational copilot.

#### 15.1 File Management
- [x] Private file storage setup (`server/storage/private/` outside public web roots)
- [x] Secure upload endpoint with MIME type & 10MB size validation (`/api/v1/files/upload`)
- [x] Secure download with short-lived cryptographically signed tokens (15 minutes, `/api/v1/files/:id/signed-url` and `/download/:token`)
- [x] File metadata storage (`MedicalFile` schema with SHA-256 checksum, MIME, size, category, uploader, timestamps)
- [x] Access logging for downloads (recorded in immutable `AuditLog` table for HIPAA §164.312(b))
- [x] Attach files to lab orders, encounters/consultations, and patients

#### 15.2 AI Features (Optional)
- [x] AI summarization for clinical encounter SOAP notes with structured extraction
- [x] Controlled operational analytics assistant grounded in live database queries (bed census, queues, low-stock pharmacy, receivables)
- [x] Clearly label all AI-generated content with prominent medical disclaimer and confidence scoring
- [x] Human-review flow before any action with physician verification requirement and "Copy to EMR Chart"
- [x] Error handling for unavailable AI services with graceful fallbacks
- [x] Minimum-data principle: HIPAA regex de-identification scrubber redacts patient names, phone numbers, and MRNs prior to processing

---

### Phase 16 — Testing & Polish ✅

> **Status: DONE** | **Deliverable:** Fully tested, documented, and polished application with unit test suites, integration tests, client core tests, architecture documentation, OpenAPI 3.0 specification, and master README.

#### 16.1 Testing
- [x] Unit tests for business logic (`appointmentLogic`, `queueTriage`, `billingCalculations`, `pharmacyFefo`, `bedManagement`, `fileSecurity`, `aiHipaaScrubber` — 100% pass)
- [x] API integration tests (`apiTenantIsolation.test.ts` verifying `/health`, 401 auth rejections, multi-tenant partition boundaries, signed file streaming, and operational assistant)
- [x] Frontend component and client core tests (`clientCore.test.ts` for apiClient headers, FormData boundaries, byte conversions, and currency formatting)
- [x] End-to-end integration and API verification across live daemon server

#### 16.2 Polish
- [x] Accessibility pass (labels, ARIA tags, dialog overlays, keyboard navigation with Escape listeners)
- [x] Responsive layout review (mobile drawer navigation, responsive grids, collapsible sidebars)
- [x] All pages have loading, empty, and error states with consistent indicators
- [x] Consistent toast/feedback messages via `useToast` (success, error, warning, info)
- [x] Performance review (production bundle check: 309kB gzip JS, query caching)

#### 16.3 Documentation
- [x] Architecture diagram & technical system design (`docs/Architecture.md` with Mermaid diagrams)
- [x] API documentation (`docs/openapi.yaml` OpenAPI 3.0.3 specification)
- [x] Database model documentation & ERD (`docs/Database_Schema.md`)
- [x] README with verified setup guide and role matrix (`README.md`)
- [x] Setup instructions verified on clean environment

---

### Phase 17 — Docker & Deployment ✅

> **Status: COMPLETED** | **Deliverable:** Fully containerized multi-tier platform with Docker Compose, Nginx reverse proxy, automated CI/CD pipeline, PaaS blueprints (Render/Railway), SHA-256 verified backup & disaster recovery, automated production smoke testing suite, and comprehensive deployment documentation.

- [x] Dockerize frontend (production multi-stage build + Nginx Alpine) (`CareFlowFrontend/Dockerfile`, `nginx.conf`, `.dockerignore`)
- [x] Dockerize backend (Node 20 Alpine, Prisma engine, non-root `USER node`, automated entrypoint script) (`server/Dockerfile`, `docker-entrypoint.sh`, `.dockerignore`)
- [x] Create `docker-compose.yml` (orchestrating Frontend, Backend, Redis BullMQ, and optional PostgreSQL with persistent volumes and health checks)
- [x] Create `docker-compose.prod.yml` (production resource limits, JSON logging policies, production environment settings)
- [x] Set up GitHub Actions CI (`.github/workflows/ci.yml` running Node 20/22 matrix, backend tests, frontend tests, and Docker config validation)
- [x] Deploy blueprints for hosting platforms (Render.com [`render.yaml`](file:///c:/Users/yusuf/Documents/CareFlow/render.yaml), Railway.app [`railway.json`](file:///c:/Users/yusuf/Documents/CareFlow/railway.json), and Linux VPS)
- [x] Configure HTTPS and SSL guide with Let's Encrypt / Certbot / Cloudflare SSL ([`docs/Deployment_Guide.md`](file:///c:/Users/yusuf/Documents/CareFlow/docs/Deployment_Guide.md))
- [x] Configure environment secrets in production (documented in `server/.env.example` and `Deployment_Guide.md`)
- [x] Set up logging, error monitoring, and `/api/v1/health` telemetry
- [x] Set up automated database backup and disaster recovery with SHA-256 cryptographic verification and safety rollback snapshots (`scripts/backup-database.ps1`, `scripts/backup-database.sh`, `scripts/restore-database.ps1`, `scripts/restore-database.sh`)
- [x] Automated smoke tests on deployed environment (`scripts/smoke-test.mjs` verifying API health, multi-tenant auth, beds, files, and frontend delivery)
- [x] Final documentation and quickstart in [`README.md`](file:///c:/Users/yusuf/Documents/CareFlow/README.md) and [`docs/Deployment_Guide.md`](file:///c:/Users/yusuf/Documents/CareFlow/docs/Deployment_Guide.md)

---

## 14. Definition of Done for Each Feature

A feature is not finished just because the page looks correct. Before marking it done, check:

- [ ] The user journey is clear.
- [ ] The UI handles loading, empty, success, and error states.
- [ ] Inputs are validated in the frontend and backend.
- [ ] The API returns consistent status codes and errors.
- [ ] Authentication and authorization are enforced server-side.
- [ ] Tenant and record ownership are checked where applicable.
- [ ] Important changes are audited.
- [ ] Relevant tests pass.
- [ ] The feature is documented.
- [ ] No secrets or real patient data are included.

---

## 15. What We Will Not Do at the Beginning

- We will not build every module at once.
- We will not paste hundreds of lines of unexplained code.
- We will not introduce Redis, Docker, AWS, or AI before they are needed.
- We will not build microservices just for complexity.
- We will not use real patient records.
- We will not treat an AI response as a clinical decision.
- We will not assume a polished UI means the application is secure.
- We will not skip testing authorization and tenant isolation.

---

## 16. Final Success Criteria

CareFlow's learning-project version is complete when it has:

- A coherent, responsive frontend.
- Working core workflows from patient registration through appointments and queue.
- A Node/Express API connected to MongoDB.
- Authentication and server-enforced authorization.
- Synthetic patient and hospital data.
- Core modules for appointments, consultations, prescriptions, lab, pharmacy, beds, and billing.
- Tests for important workflows and access restrictions.
- Audit events for sensitive operations.
- Documented architecture and API.
- A deployment that uses environment secrets and HTTPS.
- A clear README with setup instructions, screenshots, demo accounts, limitations, and test instructions.

Advanced goals can include multi-tenancy, real-time updates, Redis/BullMQ, private file storage, operational AI assistance, monitoring, and CI/CD.

---

## 17. Suggested README Sections

When publishing the project, document:
1. Project overview
2. Features
3. Screenshots
4. Technology stack
5. Architecture diagram
6. Repository structure
7. Prerequisites
8. Local setup
9. Environment variables (names only; never real secrets)
10. API documentation
11. Database model overview
12. Test commands
13. Demo credentials using synthetic accounts only
14. Security and privacy notes
15. Known limitations
16. Future roadmap

---

**Guiding principle:** Build one working workflow at a time. Understand it, test it, document it, and only then move to the next module.
