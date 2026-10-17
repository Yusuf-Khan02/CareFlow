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
| 3 | Backend Foundation | ⬜ Not Started | ░░░░░░░░░░░░░░░░░░░░░ 0% |
| 4 | Database & API Integration | ⬜ Not Started | ░░░░░░░░░░░░░░░░░░░░░ 0% |
| 5 | Authentication & Authorization | ⬜ Not Started | ░░░░░░░░░░░░░░░░░░░░░ 0% |
| 6 | Appointments | ⬜ Not Started | ░░░░░░░░░░░░░░░░░░░░░ 0% |
| 7 | Queue Management | ⬜ Not Started | ░░░░░░░░░░░░░░░░░░░░░ 0% |
| 8 | Consultation & Prescriptions | ⬜ Not Started | ░░░░░░░░░░░░░░░░░░░░░ 0% |
| 9 | Laboratory | ⬜ Not Started | ░░░░░░░░░░░░░░░░░░░░░ 0% |
| 10 | Pharmacy & Inventory | ⬜ Not Started | ░░░░░░░░░░░░░░░░░░░░░ 0% |
| 11 | Beds & Admissions | ⬜ Not Started | ░░░░░░░░░░░░░░░░░░░░░ 0% |
| 12 | Billing & Reports | ⬜ Not Started | ░░░░░░░░░░░░░░░░░░░░░ 0% |
| 13 | Multi-Tenancy & Security | ⬜ Not Started | ░░░░░░░░░░░░░░░░░░░░░ 0% |
| 14 | Real-Time & Background Jobs | ⬜ Not Started | ░░░░░░░░░░░░░░░░░░░░░ 0% |
| 15 | Files & Optional AI | ⬜ Not Started | ░░░░░░░░░░░░░░░░░░░░░ 0% |
| 16 | Testing & Polish | ⬜ Not Started | ░░░░░░░░░░░░░░░░░░░░░ 0% |
| 17 | Docker & Deployment | ⬜ Not Started | ░░░░░░░░░░░░░░░░░░░░░ 0% |

**Overall Progress: ~18%** — Phase 0, 1, and 2 completed; Next: Phase 3 (Backend Foundation).

---

## 📝 Change Log

| Date | Phase | What Changed |
|------|-------|-------------|
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
- Mongoose
- Zod or another schema-validation library
- Centralized error handling
- Structured logging

### Database and infrastructure
- MongoDB Atlas for a learning environment, with synthetic data
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

## 8. Database Design — Initial Entities

The exact schemas will be designed when each module is implemented. The following is a planning inventory, not a requirement to create all collections immediately.

| Entity/collection | Purpose |
|---|---|
| organizations | Hospital/tenant records |
| users | Login identities and account status |
| roles/permissions | Authorization rules, if not embedded/configured |
| staffProfiles | Staff-specific details |
| patients | Demographic/contact data and patient identifier |
| departments | Hospital departments and specialties |
| doctorSchedules | Availability and schedule exceptions |
| appointments | Bookings, status, and schedule references |
| queueEntries | Tokens and queue state |
| encounters | Visits and consultation workflow |
| clinicalNotes | Clinical documentation, if separated from encounters |
| prescriptions | Prescribed medication instructions |
| labOrders | Requested laboratory tests |
| labResults | Result values, notes, and review state |
| medicines | Medicine/product catalogue |
| inventoryBatches | Stock, batch, expiry, and supplier references |
| inventoryMovements | Receipts, dispensing, and adjustments |
| wards/rooms/beds | Bed and location inventory |
| admissions | Admission, transfer, and discharge records |
| invoices | Billable items and totals |
| payments | Payment records and reconciliation state |
| documents | Metadata for private stored files |
| notifications | In-app notification state |
| auditLogs | Important user/system actions |
| backgroundJobs | Usually managed by the queue library rather than a custom collection |

### Data modeling principles
- Use stable IDs and references where appropriate.
- Store timestamps consistently; display them in the hospital's configured timezone.
- Add indexes based on real query patterns.
- Validate data on the server.
- Use explicit status enums and documented state transitions.
- Avoid embedding large files in MongoDB documents.
- Use transactions or other concurrency-safe approaches where a workflow needs multiple related changes to succeed together.
- Define tenant scope and access rules before multi-tenant modules are exposed.
- Avoid collecting fields that the application does not need.

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

### Phase 3 — Backend Foundation ⬜

> **Status: NOT STARTED** | **Deliverable:** Running API that the frontend can call.

#### 3.1 Server Setup
- [ ] Create `server/` directory with Express + TypeScript
- [ ] Configure `tsconfig.json` for server
- [ ] Install dependencies: express, cors, dotenv, mongoose
- [ ] Create `server.ts` entry point
- [ ] Create `app.ts` with Express setup

#### 3.2 Core Middleware
- [ ] Add health-check route (`GET /api/v1/health`)
- [ ] Configure environment variables (`.env` + `.env.example`)
- [ ] Add centralized error handler middleware
- [ ] Add request validation middleware (Zod)
- [ ] Add structured logging (winston or pino)
- [ ] Add API versioning (`/api/v1/`)
- [ ] Add CORS configuration
- [ ] Add request-size limits

#### 3.3 Project Config
- [ ] Add `.gitignore` for server (node_modules, .env, dist)
- [ ] Add `npm` scripts: `dev`, `build`, `start`
- [ ] Add nodemon or tsx for dev hot-reloading

---

### Phase 4 — Database & API Integration ⬜

> **Status: NOT STARTED** | **Deliverable:** Data persists in MongoDB and appears in the UI.

#### 4.1 Database Connection
- [ ] Connect to MongoDB Atlas (synthetic data only)
- [ ] Create connection utility with retry logic
- [ ] Add connection error handling

#### 4.2 Core Models
- [ ] Create `User` model (email, passwordHash, role, status)
- [ ] Create `Patient` model (name, age, gender, phone, department, status, patientId)
- [ ] Create `Department` model (name, description, head)
- [ ] Create `StaffProfile` model (userId, specialty, department, availability)

#### 4.3 Patient CRUD API
- [ ] `POST /api/v1/patients` — create patient
- [ ] `GET /api/v1/patients` — list patients (with pagination, search, filters)
- [ ] `GET /api/v1/patients/:id` — get single patient
- [ ] `PUT /api/v1/patients/:id` — update patient
- [ ] `DELETE /api/v1/patients/:id` — soft-delete patient
- [ ] Input validation with Zod schemas

#### 4.4 Staff CRUD API
- [ ] `POST /api/v1/doctors` — create staff profile
- [ ] `GET /api/v1/doctors` — list doctors/staff
- [ ] `GET /api/v1/doctors/:id` — get single doctor
- [ ] `PUT /api/v1/doctors/:id` — update doctor

#### 4.5 Frontend-Backend Integration
- [ ] Install TanStack Query in frontend
- [ ] Create API service layer (`services/api.ts`)
- [ ] Connect Patient list page to `GET /api/v1/patients`
- [ ] Connect Patient details page to `GET /api/v1/patients/:id`
- [ ] Connect Add Patient form to `POST /api/v1/patients`
- [ ] Connect Edit Patient form to `PUT /api/v1/patients/:id`
- [ ] Add loading, empty, success, and error states to all connected pages
- [ ] Seed database with synthetic patient data

---

### Phase 5 — Authentication & Authorization ⬜

> **Status: NOT STARTED** | **Deliverable:** Authenticated users with enforced permissions.

#### 5.1 Auth Backend
- [ ] Implement user registration (admin-only)
- [ ] Implement login endpoint (`POST /api/v1/auth/login`)
- [ ] Password hashing with bcrypt
- [ ] JWT token generation and verification
- [ ] Refresh token strategy
- [ ] Logout / token invalidation

#### 5.2 Auth Middleware
- [ ] `authMiddleware` — verify JWT on protected routes
- [ ] `roleMiddleware` — check user role permissions
- [ ] Apply to all protected API routes

#### 5.3 Frontend Auth
- [ ] Build proper Login page (form, validation, error display)
- [ ] Auth context/provider for storing user state
- [ ] Protected route wrapper component
- [ ] Redirect unauthenticated users to `/login`
- [ ] Store token securely (httpOnly cookie preferred)
- [ ] Auto-logout on token expiry
- [ ] Show/hide sidebar items based on user role

#### 5.4 Security Hardening
- [ ] Login throttling / rate limiting
- [ ] Password reset with expiring tokens
- [ ] Test forbidden access paths (wrong role, wrong tenant)
- [ ] Seed demo users with different roles

---

### Phase 6 — Appointments ⬜

> **Status: NOT STARTED** | **Deliverable:** End-to-end appointment workflow.

#### 6.1 Appointment Backend
- [ ] Create `Appointment` model
- [ ] `POST /api/v1/appointments` — book appointment
- [ ] `GET /api/v1/appointments` — list (with filters: date, doctor, department, status)
- [ ] `GET /api/v1/appointments/:id` — get single
- [ ] `PUT /api/v1/appointments/:id` — reschedule/update
- [ ] `PATCH /api/v1/appointments/:id/cancel` — cancel
- [ ] `PATCH /api/v1/appointments/:id/status` — update status
- [ ] Double-booking prevention logic
- [ ] Status transitions: scheduled → confirmed → checked-in → in-progress → completed

#### 6.2 Doctor Schedule Backend
- [ ] Create `DoctorSchedule` model
- [ ] `GET /api/v1/doctors/:id/schedule` — get availability
- [ ] `PUT /api/v1/doctors/:id/schedule` — update schedule
- [ ] Slot availability calculation

#### 6.3 Appointment Frontend
- [ ] Build full `Appointments` page (calendar/list view)
- [ ] Build appointment booking form (select doctor, department, date, time)
- [ ] Build appointment details view
- [ ] Appointment status badges
- [ ] Reschedule and cancel actions
- [ ] Connect to backend APIs

---

### Phase 7 — Queue Management ⬜

> **Status: NOT STARTED** | **Deliverable:** Working queue workflow with synthetic data.

#### 7.1 Queue Backend
- [ ] Create `QueueEntry` model
- [ ] `POST /api/v1/queue` — create queue token (check-in)
- [ ] `GET /api/v1/queue` — list by doctor/department
- [ ] `PATCH /api/v1/queue/:id/call` — call next patient
- [ ] `PATCH /api/v1/queue/:id/complete` — mark completed
- [ ] `PATCH /api/v1/queue/:id/skip` — skip patient
- [ ] Queue status transitions: waiting → called → in-consultation → completed/skipped
- [ ] Concurrency protection (two staff can't call the same token)

#### 7.2 Queue Frontend
- [ ] Build full `Queue` dashboard page
- [ ] Queue list by doctor/department
- [ ] Call-next action button
- [ ] Status indicators and transitions
- [ ] Token display
- [ ] Connect to backend APIs

#### 7.3 Reception Check-in
- [ ] Build check-in workflow (find appointment → confirm arrival → issue token)
- [ ] Walk-in registration flow

---

### Phase 8 — Consultation & Prescriptions ⬜

> **Status: NOT STARTED** | **Deliverable:** Appointment-to-consultation workflow.

#### 8.1 Consultation Backend
- [ ] Create `Encounter` model
- [ ] Create `ClinicalNote` model (if separate)
- [ ] `POST /api/v1/encounters` — start visit
- [ ] `PUT /api/v1/encounters/:id` — update notes
- [ ] `PATCH /api/v1/encounters/:id/complete` — complete visit
- [ ] `GET /api/v1/encounters` — list by patient/doctor
- [ ] Link encounter to patient + appointment

#### 8.2 Prescription Backend
- [ ] Create `Prescription` model
- [ ] `POST /api/v1/prescriptions` — create (linked to encounter)
- [ ] `GET /api/v1/prescriptions` — list by patient/encounter
- [ ] `PATCH /api/v1/prescriptions/:id/cancel` — cancel prescription
- [ ] Fields: medication, dose, route, frequency, duration, instructions

#### 8.3 Consultation Frontend
- [ ] Build `Consultation` workspace page
- [ ] Notes editor (assessment, plan, follow-up)
- [ ] View prior encounters
- [ ] Create prescription form within consultation
- [ ] View prescription history
- [ ] Authorization checks (only assigned doctor)

---

### Phase 9 — Laboratory ⬜

> **Status: NOT STARTED** | **Deliverable:** Demo lab workflow.

#### 9.1 Lab Backend
- [ ] Create `LabOrder` model
- [ ] Create `LabResult` model
- [ ] `POST /api/v1/lab-orders` — create order from consultation
- [ ] `GET /api/v1/lab-orders` — list pending/completed
- [ ] `PATCH /api/v1/lab-orders/:id/status` — update status
- [ ] `POST /api/v1/lab-results` — enter results
- [ ] `PUT /api/v1/lab-results/:id` — update/amend results
- [ ] Status transitions: requested → collected → processing → completed/cancelled

#### 9.2 Lab Frontend
- [ ] Build full `Laboratory` page
- [ ] Pending orders list
- [ ] Results entry form
- [ ] Result review/verification workflow
- [ ] Test catalogue browser
- [ ] Notifications for completed results

---

### Phase 10 — Pharmacy & Inventory ⬜

> **Status: NOT STARTED** | **Deliverable:** Demo pharmacy workflow.

#### 10.1 Pharmacy Backend
- [ ] Create `Medicine` model (catalogue)
- [ ] Create `InventoryBatch` model
- [ ] Create `InventoryMovement` model
- [ ] `GET /api/v1/medicines` — browse catalogue
- [ ] `POST /api/v1/inventory/receive` — receive stock
- [ ] `POST /api/v1/inventory/dispense` — dispense (linked to prescription)
- [ ] `GET /api/v1/inventory/low-stock` — low-stock alerts
- [ ] Stock quantity and minimum-level tracking

#### 10.2 Pharmacy Frontend
- [ ] Build full `Pharmacy` page
- [ ] Medicine catalogue browser
- [ ] Stock levels display
- [ ] Receive stock form
- [ ] Dispense medication form (linked to prescription)
- [ ] Low-stock alerts panel
- [ ] Batch/expiry tracking display

---

### Phase 11 — Beds & Admissions ⬜

> **Status: NOT STARTED** | **Deliverable:** Bed-management workflow.

#### 11.1 Backend
- [ ] Create `Ward`, `Room`, `Bed` models
- [ ] Create `Admission` model
- [ ] Bed CRUD and status management
- [ ] Admission, transfer, and discharge endpoints
- [ ] Bed status transitions: available → reserved → occupied → cleaning → available
- [ ] Conflict prevention for simultaneous assignments

#### 11.2 Frontend
- [ ] Build `Beds` page with ward/room/bed layout
- [ ] Bed status visual indicators
- [ ] Admission form
- [ ] Transfer and discharge actions
- [ ] Occupancy dashboard/summary

---

### Phase 12 — Billing & Reports ⬜

> **Status: NOT STARTED** | **Deliverable:** Demo billing and analytics.

#### 12.1 Billing Backend
- [ ] Create `Invoice` model
- [ ] Create `Payment` model
- [ ] Invoice CRUD with line items, totals, discounts, taxes
- [ ] Payment recording
- [ ] Invoice status: draft → issued → paid → cancelled

#### 12.2 Billing Frontend
- [ ] Build `Billing` page
- [ ] Create invoice form
- [ ] Invoice details view
- [ ] Record payment form
- [ ] Print-friendly invoice layout

#### 12.3 Reports & Analytics
- [ ] Build `Reports` page
- [ ] Operational charts (patient visits trends, revenue, occupancy)
- [ ] Date and department filters
- [ ] Exportable reports (CSV/PDF)
- [ ] Waiting-time and turnaround-time metrics

---

### Phase 13 — Multi-Tenancy & Stronger Security ⬜

> **Status: NOT STARTED** | **Deliverable:** Demonstrable separation between two synthetic hospitals.

- [ ] Create `Organization` model
- [ ] Associate all records with an organization
- [ ] Tenant-scoped queries on every endpoint
- [ ] Tenant isolation tests (hospital A can't see hospital B's data)
- [ ] Build `AuditLog` viewer page
- [ ] Audit log search/filter (actor, action, date)
- [ ] Security review and threat model document
- [ ] Seed two demo hospitals with separate data

---

### Phase 14 — Real-Time & Background Jobs ⬜

> **Status: NOT STARTED** | **Deliverable:** Real-time updates and reliable asynchronous work.

- [ ] Add Socket.IO to server
- [ ] Real-time queue updates (token called, completed, etc.)
- [ ] Client-side Socket.IO integration with reconnection
- [ ] State resynchronization after reconnect
- [ ] Add Redis for caching + queue backend
- [ ] Add BullMQ for background jobs
- [ ] Notification delivery job
- [ ] Report generation job
- [ ] Retries, idempotency, failure handling
- [ ] Dead-letter queue for permanently failed jobs

---

### Phase 15 — Files & Optional AI ⬜

> **Status: NOT STARTED** | **Deliverable:** Optional advanced features with explicit limitations.

#### 15.1 File Management
- [ ] Private file storage setup (cloud or local)
- [ ] Secure upload endpoint (type/size validation)
- [ ] Secure download with short-lived signed URLs
- [ ] File metadata storage (filename, type, size, uploader, date)
- [ ] Access logging for downloads
- [ ] Attach files to lab results, encounters, patients

#### 15.2 AI Features (Optional)
- [ ] AI summarization for synthetic demo documents
- [ ] Controlled operational analytics assistant
- [ ] Clearly label all AI-generated content
- [ ] Human-review flow before any action
- [ ] Error handling for unavailable AI services
- [ ] Minimum-data principle for external API calls

---

### Phase 16 — Testing & Polish ⬜

> **Status: NOT STARTED** | **Deliverable:** Tested, documented application.

#### 16.1 Testing
- [ ] Unit tests for business logic (slots, queue transitions, billing calculations)
- [ ] API integration tests (valid/invalid requests, auth failures, tenant isolation)
- [ ] Frontend component tests (forms, states, navigation)
- [ ] End-to-end tests for critical workflows (Playwright)

#### 16.2 Polish
- [ ] Accessibility pass (labels, keyboard nav, contrast)
- [ ] Responsive layout review (mobile, tablet, desktop)
- [ ] All pages have loading, empty, error states
- [ ] Consistent toast/feedback messages
- [ ] Performance review (bundle size, query optimization)

#### 16.3 Documentation
- [ ] Architecture diagram
- [ ] API documentation (OpenAPI/Swagger)
- [ ] Database model documentation
- [ ] Screenshots for README
- [ ] Setup instructions verified on clean environment

---

### Phase 17 — Docker & Deployment ⬜

> **Status: NOT STARTED** | **Deliverable:** Deployed demo with synthetic data.

- [ ] Dockerize frontend (production build + nginx)
- [ ] Dockerize backend (Node.js)
- [ ] Create `docker-compose.yml` (app + MongoDB + Redis)
- [ ] Set up GitHub Actions CI (lint, test, build)
- [ ] Deploy to hosting platform (Render / Railway / AWS / etc.)
- [ ] Configure HTTPS
- [ ] Configure environment secrets in production
- [ ] Set up logging and error monitoring
- [ ] Set up backup and verify restoration
- [ ] Smoke tests on deployed environment
- [ ] Final README with demo URL, screenshots, and limitations

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
