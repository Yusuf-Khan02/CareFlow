# CareFlow — Smart Hospital Operations & Clinical EMR Platform

[![Build Status](https://img.shields.io/badge/Build-Passing-emerald.svg)](https://github.com/CareFlow)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7+-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.2+-cyan.svg)](https://react.dev/)
[![Prisma](https://img.shields.io/badge/Prisma-6.4+-indigo.svg)](https://www.prisma.io/)
[![Security](https://img.shields.io/badge/HIPAA-§164.312(b)%20Audited-green.svg)](https://www.hhs.gov/hipaa)
[![Socket.IO](https://img.shields.io/badge/Real--Time-Socket.IO%204.8-orange.svg)](https://socket.io/)

**CareFlow** is a comprehensive, production-grade hospital operations and clinical Electronic Medical Record (EMR) platform. Built with a modern TypeScript stack, it unifies outpatient triage, inpatient bed logistics, diagnostic pathology, pharmacy inventory with FEFO batch allocation, financial billing with aging receivables, real-time clinical event broadcasting, BullMQ background jobs with dead-letter queue recovery, HIPAA-compliant private file storage, and privacy-preserving clinical AI assistance.

> ⚠️ **Educational & Portfolio Disclaimer:** CareFlow is designed as an advanced educational and clinical engineering demonstrator using synthetic patient data only. Before any real-world healthcare deployment, conduct independent security, regulatory, legal, and clinical audits.

---

## 🏛️ Architecture Overview

```
                                      +-----------------------------------+
                                      |     Client Layer (React 19)       |
                                      |  Tenant Context | Auth | Sockets  |
                                      +-----------------+-----------------+
                                                        |
                                                        v
                                      +-----------------------------------+
                                      |  Gateway & Security Middleware    |
                                      |  Rate Limit | Tenant | JWT RBAC   |
                                      +-----------------+-----------------+
                                                        |
                  +-------------------------------------+-------------------------------------+
                  |                                     |                                     |
                  v                                     v                                     v
       +--------------------+                +--------------------+                +--------------------+
       |  Clinical Engines  |                | Real-Time & Jobs   |                | Private Security   |
       |  Queue | EMR | Lab |                | Socket.IO Broadcast|                | HMAC File Vault    |
       |  Pharmacy | Beds   |                | BullMQ Queue & DLQ |                | HIPAA AI Redaction |
       +----------+---------+                +----------+---------+                +----------+---------+
                  |                                     |                                     |
                  +-------------------------------------+-------------------------------------+
                                                        |
                                                        v
                                      +-----------------------------------+
                                      |  Prisma ORM (SQLite / PostgreSQL) |
                                      |  25 Relational Models + Auditing  |
                                      +-----------------------------------+
```

Detailed technical design and diagrams are documented in [`docs/Architecture.md`](file:///c:/Users/yusuf/Documents/CareFlow/docs/Architecture.md) and [`docs/Database_Schema.md`](file:///c:/Users/yusuf/Documents/CareFlow/docs/Database_Schema.md).

---

## ✨ Feature Modules

### 1. Multi-Tenancy & Partition Boundary
- **Facility Switcher**: Live switching between independent facilities (*CareFlow Central Hospital* vs *CareFlow West Metro Pavilion*).
- **Zero Cross-Bleed**: Server-side query scoping (`where: { organizationId }`) guarantees data isolation verified through automated test suites.

### 2. Outpatient Scheduling & Queue Triage
- **Slot Conflict Prevention**: Automatic double-booking detection for physicians with 30-minute interval calculation.
- **Priority Triaging**: Weighted calling queue (*Emergency* > *Urgent* > *Normal*) with dynamic wait time estimation.
- **Broadcast Announcements**: Real-time WebSocket token calls paired with an electronic chime synthesized via the Web Audio API.

### 3. Consultation EMR & Diagnostic Pathology
- **SOAP Doctor Workspace**: Clinical note taking (Subjective, Objective, Assessment, Plan) with integrated vitals tracking.
- **e-Prescription Pad**: Multi-medication regimen generation with automatic queue closure.
- **Laboratory Pathology**: Diagnostic order tracking (*Requested* → *Sample Collected* → *In-Analysis* → *Completed*) with biological reference range verification and critical value flags.

### 4. Pharmacy & Medication Inventory
- **FEFO Allocation**: First-Expiring, First-Out automatic stock deduction preventing medication wastage.
- **Batch Tracking**: Lot numbers, expiry dates, supplier traceability, and atomic movement audit logs.
- **Formulary Alerts**: Real-time warnings for low-stock and depleted pharmaceuticals.

### 5. Inpatient Beds & Admissions
- **Interactive Floor Plan**: Visual bed map color-coded by status (*Available*, *Occupied*, *Cleaning*, *Maintenance*).
- **Admission Lifecycle**: Admission numbers, attending physician assignment, and bed transfer audit trails.
- **Terminal Disinfection**: Automated transfer to *Cleaning* status upon patient discharge.

### 6. Hospital Billing & Financial Analytics
- **Sequential Invoicing**: Automated subtotal, healthcare tax, discounts, and balance due computation.
- **Receipt Ledger**: Partial and full payment settlements with cashier audit tracking.
- **Executive Analytics**: Recharts visualizations for monthly collections, departmental workload distribution, and CSV export.

### 7. Real-Time Streaming & Background Jobs
- **Socket.IO Engine**: Clustered event bus isolated into `tenant:${orgId}` rooms.
- **BullMQ Architecture**: Background workers for complex report generation and staff notification dispatch.
- **Dead-Letter Queue (DLQ)**: Quarantine for permanently failed tasks with 1-click administrative retry.

### 8. HIPAA Private File Storage & Clinical AI Copilot
- **Private Binary Vault**: Non-public disk root (`server/storage/private/`) with MIME whitelist and 10MB limit.
- **HMAC Signed Tokens**: 15-minute cryptographically signed download URLs with access logging in `AuditLog`.
- **SHA-256 Checksums**: Tamper-evident document integrity verification.
- **HIPAA Scrubbed AI Copilot**: Regex engine redacts Patient Names, Phones, and MRNs before synthesizing SOAP documentation and suggesting ICD-10 codes.
- **Operational Assistant**: Live database-grounded query engine providing verified telemetry on bed censuses, pharmacy depletion, and revenue.

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js**: v20.x or v22.x
- **npm**: v10.x or higher

### 1. Quick Launch with Docker Compose (Recommended)
Launch the entire platform (Frontend, Backend API, WebSocket, Redis, and Persistent Storage) with a single command:
```bash
docker compose up --build -d
```
* Access Frontend: `http://localhost` (or `http://localhost:5173`)
* Access Backend API: `http://localhost:5000/api/v1/health`
* Run Automated Smoke Test: `npm run test:smoke`

### 2. Manual Local Development

#### Prerequisites
- **Node.js**: v20.x or v22.x
- **npm**: v10.x or higher

#### Backend Setup
```bash
cd server
npm install
npx prisma db push
npm run db:seed
npm run dev
```
*Backend will start on `http://localhost:5000` with WebSocket support.*

#### Frontend Setup
In a separate terminal:
```bash
cd CareFlowFrontend
npm install
npm run dev
```
*Frontend will open on `http://localhost:5173`.*

---

## 🚀 Deployment & Operations

CareFlow includes production deployment configurations and automated recovery utilities:
- **Comprehensive Deployment Guide**: [`docs/Deployment_Guide.md`](file:///c:/Users/yusuf/Documents/CareFlow/docs/Deployment_Guide.md)
- **Render.com Blueprint**: [`render.yaml`](file:///c:/Users/yusuf/Documents/CareFlow/render.yaml)
- **Railway.app Configuration**: [`railway.json`](file:///c:/Users/yusuf/Documents/CareFlow/railway.json)
- **GitHub Actions CI/CD Pipeline**: [`.github/workflows/ci.yml`](file:///c:/Users/yusuf/Documents/CareFlow/.github/workflows/ci.yml)
- **Automated Database Backup (SHA-256 Verified)**:
  ```bash
  npm run db:backup
  # Or on Linux: ./scripts/backup-database.sh
  ```
- **Automated Production Smoke Test**:
  ```bash
  npm run test:smoke
  ```

---

## 👥 Demo Accounts & Roles Matrix

| Email | Password | Role | Organization Access |
|-------|----------|------|---------------------|
| `admin@careflow.demo` | `CareFlow@2026` | Admin | Full Access (Central & West Metro) |
| `doctor@careflow.demo` | `CareFlow@2026` | Doctor | EMR, Consultations, Labs, Prescriptions |
| `nurse@careflow.demo` | `CareFlow@2026` | Nurse | Queue, Triage, Beds, Admissions |
| `pharmacist@careflow.demo` | `CareFlow@2026` | Pharmacist | Pharmacy, Formulary, Dispensation |
| `labtech@careflow.demo` | `CareFlow@2026` | LabTech | Laboratory, Result Verification |
| `receptionist@careflow.demo` | `CareFlow@2026` | Receptionist | Check-in, Appointments, Billing |

---

## 🧪 Automated Test Suites

### Backend Unit & Integration Tests (100% Pass Rate)
```bash
cd server
npm test
```
Runs 34 tests across 8 suites:
- `appointmentLogic.test.ts`: Slot math & double-booking collision detection.
- `queueTriage.test.ts`: Weighted triage prioritization & wait estimation.
- `billingCalculations.test.ts`: Line item math, discounts, tax, and settlements.
- `pharmacyFefo.test.ts`: FEFO batch sorting and multi-batch deductions.
- `bedManagement.test.ts`: Ward occupancy & terminal disinfection protocol.
- `fileSecurity.test.ts`: SHA-256 hashing & 15-min HMAC signed download tokens.
- `aiHipaaScrubber.test.ts`: PHI de-identification & clinical disclaimers.
- `apiTenantIsolation.test.ts`: Multi-tenant zero-bleed partition integration tests.

### Frontend Client Core Tests
```bash
cd CareFlowFrontend
npm test
```
Runs tests for header generation, FormData multipart boundaries, byte formatting, and currency computations.

---

## 📖 API Documentation & Specifications

- **OpenAPI 3.0.3 Specification**: [`docs/openapi.yaml`](file:///c:/Users/yusuf/Documents/CareFlow/docs/openapi.yaml)
- **Architecture & System Design**: [`docs/Architecture.md`](file:///c:/Users/yusuf/Documents/CareFlow/docs/Architecture.md)
- **Database Schema & ERD**: [`docs/Database_Schema.md`](file:///c:/Users/yusuf/Documents/CareFlow/docs/Database_Schema.md)
- **Security Review & Threat Model**: [`Security_Review_and_Threat_Model.md`](file:///c:/Users/yusuf/Documents/CareFlow/Security_Review_and_Threat_Model.md)

---

## 📄 License
This project is licensed under the MIT License — see the LICENSE file for details.
