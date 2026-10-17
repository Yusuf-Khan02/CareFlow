export type PatientStatus = "Active" | "Critical" | "Discharged";

export type BloodGroup = "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-";

export interface EmergencyContact {
  name: string;
  relation: string;
  phone: string;
}

export interface PatientVitals {
  bloodPressure: string;
  heartRate: number;
  temperature: string;
  spO2: number;
  weight?: number;
  recordedAt: string;
}

export type AppointmentStatus =
  | "Scheduled"
  | "Confirmed"
  | "Checked-in"
  | "In-Progress"
  | "Completed"
  | "Cancelled"
  | "No-Show";

export type AppointmentType =
  | "Consultation"
  | "Follow-up"
  | "Emergency"
  | "Routine Checkup";

export interface AppointmentRecord {
  id: string;
  doctorName: string;
  department: string;
  date: string;
  time: string;
  type: AppointmentType;
  status: AppointmentStatus;
}

export interface Appointment {
  id: string;
  patientId: number;
  patientName: string;
  patientMrn: string;
  patientPhone: string;
  patientGender?: string;
  patientAge?: number;
  doctorId: number;
  doctorName: string;
  doctorSpecialty?: string;
  doctorRoom?: string;
  departmentId: string;
  department: string;
  date: string;
  time: string;
  type: AppointmentType;
  status: AppointmentStatus;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DoctorSlot {
  time: string;
  isAvailable: boolean;
  isBooked: boolean;
  bookedStatus?: string | null;
}

export interface DoctorSlotsResponse {
  doctorId: number;
  doctorName: string;
  department: string;
  date: string;
  day: string;
  isAvailableDay: boolean;
  workingHours: string;
  totalSlots: number;
  availableSlotsCount: number;
  slots: DoctorSlot[];
}

export interface CreateAppointmentPayload {
  patientId: number;
  doctorId: number;
  departmentId?: string;
  date: string;
  time: string;
  type: AppointmentType;
  notes?: string | null;
}

export interface UpdateAppointmentPayload {
  doctorId?: number;
  date?: string;
  time?: string;
  type?: AppointmentType;
  status?: AppointmentStatus;
  notes?: string | null;
}

export interface VisitRecord {
  id: string;
  date: string;
  doctorName: string;
  department: string;
  chiefComplaint: string;
  diagnosis: string;
  treatment: string;
  notes?: string;
}

export interface Patient {
  id: number;
  mrn: string; // Medical Record Number (e.g. CF-2026-001)
  name: string;
  age: number;
  gender: "Male" | "Female" | "Other";
  phone: string;
  email: string;
  address: string;
  department: string;
  status: PatientStatus;
  bloodGroup: BloodGroup;
  emergencyContact: EmergencyContact;
  allergies: string[];
  vitals: PatientVitals;
  admissionDate: string;
  doctorAssigned: string;
  appointments: AppointmentRecord[];
  visits: VisitRecord[];
}

export type DoctorStatus = "On Duty" | "In Consultation" | "On Leave" | "Off Duty";

export interface DaySchedule {
  day: string;
  shifts: string;
  isAvailable: boolean;
  slotsRemaining: number;
}

export interface Doctor {
  id: number;
  name: string;
  title: string;
  qualification: string;
  specialty: string;
  department: string;
  experienceYears: number;
  room: string;
  email: string;
  phone: string;
  status: DoctorStatus;
  rating: number;
  consultationFee: number;
  bio: string;
  schedule: DaySchedule[];
}

export type UserRole =
  | "Admin"
  | "Hospital Admin"
  | "Doctor"
  | "Nurse"
  | "Receptionist"
  | "LabTech"
  | "Pharmacist"
  | "Patient"
  | "Staff";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  status: "Active" | "Suspended" | "Inactive";
  organizationId?: string | null;
  doctorProfile?: {
    id: number;
    name: string;
    specialty: string;
    status: string;
    room: string;
  } | null;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken?: string;
}

export type QueueStatus =
  | "Waiting"
  | "Called"
  | "In-Consultation"
  | "Completed"
  | "Skipped";

export type QueuePriority = "Normal" | "Urgent" | "Emergency";

export interface QueueToken {
  id: string;
  tokenNumber: string;
  patientId: number;
  patientName: string;
  patientMrn: string;
  patientGender: string;
  patientAge: number;
  patientPhone: string;
  doctorId: number | null;
  doctorName: string;
  doctorSpecialty: string;
  doctorRoom: string;
  departmentId: string;
  department: string;
  status: QueueStatus;
  priority: QueuePriority;
  calledAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  appointmentId?: string | null;
  estimatedWaitMinutes: number;
}

export interface QueueMetrics {
  totalWaiting: number;
  totalCalled: number;
  totalInConsult: number;
  totalCompleted: number;
  totalSkipped: number;
  avgWaitMinutes: number;
  currentCalling: QueueToken | null;
}

export interface CreateTokenPayload {
  patientId: number;
  doctorId?: number | null;
  departmentId?: string;
  priority?: QueuePriority;
  appointmentId?: string | null;
}

export type PrescriptionStatus = "Active" | "Completed" | "Discontinued" | "Cancelled";

export interface PrescriptionItemInput {
  medicationName: string;
  dosage: string;
  route?: string;
  frequency: string;
  duration: string;
  instructions?: string;
}

export interface Prescription {
  id: number;
  consultationId?: number | null;
  patientId: number;
  patientName?: string;
  patientMrn?: string;
  doctorId: number;
  doctorName?: string;
  medicationName: string;
  dosage: string;
  route: string;
  frequency: string;
  duration: string;
  instructions: string;
  status: PrescriptionStatus;
  date?: string;
  createdAt: string;
}

export interface Consultation {
  id: number;
  patientId: number;
  patientName: string;
  patientMrn: string;
  patientGender: string;
  patientAge: number;
  patientPhone: string;
  patientBloodGroup?: string;
  allergies?: string;
  latestVitals?: {
    bp?: string;
    pulse?: number;
    temp?: number;
    spo2?: number;
    weight?: number;
  } | null;
  doctorId: number;
  doctorName: string;
  doctorSpecialty: string;
  doctorRoom: string;
  appointmentId?: string | null;
  date: string;
  chiefComplaint: string;
  diagnosis: string;
  treatment: string;
  clinicalNotes: string;
  prescriptions: Prescription[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateConsultationPayload {
  patientId: number;
  doctorId: number;
  appointmentId?: string | null;
  date?: string;
  chiefComplaint: string;
  diagnosis: string;
  treatment?: string;
  clinicalNotes?: string;
  prescriptions?: PrescriptionItemInput[];
}

export interface UpdateConsultationPayload {
  chiefComplaint?: string;
  diagnosis?: string;
  treatment?: string;
  clinicalNotes?: string;
}

// ----------------------------------------------------
// LABORATORY & DIAGNOSTIC TESTS
// ----------------------------------------------------
export type LabOrderStatus = "Requested" | "Sample Collected" | "In-Analysis" | "Completed" | "Cancelled";
export type LabOrderPriority = "Routine" | "Urgent" | "STAT";
export type LabResultStatus = "Normal" | "Low" | "High" | "Critical";

export interface LabResultItem {
  id?: string;
  parameterName: string;
  measuredValue: string;
  unit: string;
  referenceRange: string;
  status: LabResultStatus;
  technicianNotes?: string | null;
  verifiedBy?: string | null;
  createdAt?: string;
}

export interface LabOrder {
  id: string;
  orderNumber: string;
  patientId: number;
  patientName: string;
  patientMrn: string;
  patientGender: string;
  patientAge: number;
  patientPhone: string;
  patientBloodGroup?: string;
  doctorId: number;
  doctorName: string;
  doctorSpecialty: string;
  doctorRoom: string;
  consultationId?: string | null;
  testCategory: string;
  testName: string;
  priority: LabOrderPriority;
  status: LabOrderStatus;
  clinicalNotes?: string;
  orderedAt: string;
  collectedAt?: string | null;
  completedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  results: LabResultItem[];
}

export interface LabMetrics {
  totalOrders: number;
  pendingCollection: number;
  inAnalysis: number;
  completed: number;
  criticalCount: number;
}

export interface CreateLabOrderPayload {
  patientId: number;
  doctorId: number;
  consultationId?: string | null;
  testCategory: string;
  testName: string;
  priority?: LabOrderPriority;
  clinicalNotes?: string | null;
}

export interface EnterLabResultsPayload {
  results: {
    parameterName: string;
    measuredValue: string;
    unit?: string;
    referenceRange?: string;
    status: LabResultStatus;
    technicianNotes?: string | null;
    verifiedBy?: string | null;
  }[];
  verifiedBy?: string | null;
  technicianNotes?: string | null;
}

export interface LabCatalogTest {
  category: string;
  testName: string;
  turnaroundHours: number;
  sampleType: string;
  description: string;
  defaultParameters: {
    name: string;
    unit: string;
    referenceRange: string;
  }[];
}

// ==========================================
// Pharmacy & Inventory Types
// ==========================================

export interface InventoryBatch {
  id: string;
  batchNumber: string;
  quantityReceived: number;
  quantityRemaining: number;
  expiryDate: string;
  purchaseDate: string;
  supplierName: string;
  costPerUnit: number;
  status: "ACTIVE" | "EXPIRED" | "DEPLETED";
}

export interface Medicine {
  id: string;
  sku: string;
  name: string;
  brandName: string;
  category: string;
  dosageForm: string;
  strength: string;
  unitPrice: number;
  costPrice: number;
  currentStock: number;
  minStockLevel: number;
  isLowStock: boolean;
  isOutOfStock: boolean;
  prescriptionRequired: boolean;
  storageConditions: string;
  manufacturer: string;
  createdAt: string;
  updatedAt: string;
  activeBatchesCount: number;
  earliestExpiry: string | null;
  batches?: InventoryBatch[];
}

export interface PharmacyMetrics {
  totalFormulary: number;
  inStockCount: number;
  lowStockCount: number;
  outOfStockCount: number;
  totalUnitsInStock: number;
  stockValueGross: number;
}

export interface CreateMedicinePayload {
  sku: string;
  name: string;
  brandName: string;
  category: string;
  dosageForm: string;
  strength: string;
  unitPrice: number;
  costPrice: number;
  minStockLevel?: number;
  prescriptionRequired?: boolean;
  storageConditions?: string;
  manufacturer?: string;
}

export interface ReceiveStockPayload {
  medicineId: string;
  batchNumber: string;
  quantityReceived: number;
  expiryDate: string;
  purchaseDate?: string;
  supplierName?: string;
  costPerUnit?: number;
  notes?: string;
}

export interface DispenseStockPayload {
  medicineId: string;
  quantity: number;
  prescriptionId?: string | null;
  patientName?: string | null;
  performedBy?: string;
  notes?: string;
}

export interface InventoryMovement {
  id: string;
  medicineId: string;
  medicineName?: string;
  medicineSku?: string;
  batchNumber?: string;
  type: "RECEIVE" | "DISPENSE" | "ADJUSTMENT" | "RETURN" | "DISPOSAL";
  quantity: number;
  reference: string;
  performedBy: string;
  notes: string;
  createdAt: string;
}

export interface PendingPrescriptionItem {
  id: string;
  medicationName: string;
  dosage: string;
  route: string;
  frequency: string;
  duration: string;
  instructions?: string | null;
  status: string;
  patientId: number;
  patientName: string;
  patientMrn: string;
  doctorId: number;
  doctorName: string;
  doctorSpecialty: string;
  date: string;
  createdAt: string;
}

// ==========================================
// Beds, Wards & Admissions Types
// ==========================================

export type BedStatus =
  | "Available"
  | "Occupied"
  | "Cleaning"
  | "Maintenance"
  | "Reserved";

export type AdmissionStatus = "Admitted" | "Transferred" | "Discharged";
export type AdmissionType = "Emergency" | "Elective" | "Urgent" | "Transfer";
export type PatientCondition = "Stable" | "Serious" | "Critical" | "Guarded";

export interface WardSummary {
  id: string;
  name: string;
  code: string;
  floor: string;
  gender: string;
  dailyRate: number;
  description?: string | null;
  totalBeds: number;
  occupiedBeds: number;
  availableBeds: number;
  cleaningBeds: number;
  maintenanceBeds: number;
  reservedBeds: number;
  occupancyRate: number;
  roomsCount: number;
}

export interface BedCurrentAdmission {
  id: string;
  admissionNumber: string;
  patientId: number;
  patientName: string;
  patientMrn: string;
  patientAge: number;
  patientGender: string;
  patientBloodGroup: string;
  doctorId: number;
  doctorName: string;
  doctorSpecialty: string;
  admittedAt: string;
  admissionType: AdmissionType;
  diagnosis: string;
  condition: PatientCondition;
  daysAdmitted: number;
}

export interface BedItem {
  id: string;
  bedNumber: string;
  bedType: string;
  status: BedStatus;
  wardId: string;
  wardName: string;
  wardCode: string;
  floor: string;
  dailyRate: number;
  roomId: string;
  roomNumber: string;
  roomType: string;
  amenities?: string | null;
  currentAdmission: BedCurrentAdmission | null;
}

export interface AvailableBedOption {
  id: string;
  bedNumber: string;
  bedType: string;
  wardId: string;
  wardName: string;
  wardCode: string;
  roomNumber: string;
  dailyRate: number;
  label: string;
}

export interface AdmissionRecord {
  id: string;
  admissionNumber: string;
  status: AdmissionStatus;
  admissionType: AdmissionType;
  diagnosis: string;
  condition: PatientCondition;
  notes?: string | null;
  admittedAt: string;
  dischargedAt?: string | null;
  dischargeReason?: string | null;
  dischargeSummary?: string | null;
  daysAdmitted: number;
  patientId: number;
  patientName: string;
  patientMrn: string;
  patientAge: number;
  patientGender: string;
  patientPhone: string;
  patientBloodGroup: string;
  doctorId: number;
  doctorName: string;
  doctorSpecialty: string;
  wardId: string;
  wardName: string;
  wardCode: string;
  bedId: string;
  bedNumber: string;
  roomNumber: string;
  dailyRate: number;
  transfers?: {
    id: string;
    fromBed?: { bedNumber: string };
    toBed?: { bedNumber: string };
    reason: string;
    transferredBy: string;
    transferredAt: string;
  }[];
}

export interface BedsMetrics {
  totalHospitalBeds: number;
  totalOccupied: number;
  totalAvailable: number;
  totalCleaning: number;
  totalMaintenance: number;
  totalReserved: number;
  overallOccupancyRate: number;
}

export interface AdmitPatientPayload {
  patientId: number;
  doctorId: number;
  bedId: string;
  admissionType?: AdmissionType;
  diagnosis: string;
  condition?: PatientCondition;
  notes?: string;
}

export interface TransferBedPayload {
  toBedId: string;
  reason: string;
  transferredBy?: string;
}

export interface DischargePatientPayload {
  dischargeReason?: "Recovered" | "Transferred" | "AMA" | "Deceased" | "Home with Support";
  dischargeSummary: string;
}

// ============================================================================
// PHASE 12 — BILLING, INVOICES, PAYMENTS & REPORTS
// ============================================================================

export type InvoiceStatus =
  | "Draft"
  | "Issued"
  | "Partially Paid"
  | "Paid"
  | "Cancelled"
  | "Refunded";

export type InvoiceLineItemType =
  | "Consultation"
  | "Inpatient Bed Stay"
  | "Laboratory Test"
  | "Pharmacy Medication"
  | "Nursing Procedure"
  | "Other";

export type PaymentMethod =
  | "Cash"
  | "Credit Card"
  | "Debit Card"
  | "UPI / Net Banking"
  | "Insurance / TPA"
  | "Cheque";

export interface InvoiceLineItem {
  id: string;
  invoiceId: string;
  itemType: InvoiceLineItemType;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  createdAt?: string;
}

export interface Payment {
  id: string;
  receiptNumber: string;
  invoiceId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  referenceNumber?: string | null;
  status: string;
  paidAt: string;
  receivedBy: string;
  notes?: string | null;
  invoice?: {
    id: string;
    invoiceNumber: string;
    totalAmount: number;
    balanceDue: number;
    status: InvoiceStatus;
    patient?: {
      id: number;
      mrn: string;
      name: string;
    };
  };
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  patientId: number;
  patient?: {
    id: number;
    mrn: string;
    name: string;
    phone?: string;
    email?: string;
    gender?: string;
    age?: number;
    address?: string;
  };
  consultationId?: string | null;
  consultation?: {
    id: string;
    doctor?: {
      id: number;
      name: string;
      specialty: string;
    };
  } | null;
  admissionId?: string | null;
  admission?: {
    id: string;
    ward?: {
      name: string;
      code: string;
    };
    bed?: {
      bedNumber: string;
    };
    doctor?: {
      name: string;
      specialty: string;
    };
  } | null;
  status: InvoiceStatus;
  issueDate: string;
  dueDate: string;
  subtotal: number;
  discount: number;
  taxRate: number;
  taxAmount: number;
  totalAmount: number;
  paidAmount: number;
  balanceDue: number;
  notes?: string | null;
  paymentTerms: string;
  createdAt: string;
  updatedAt: string;
  items: InvoiceLineItem[];
  payments: Payment[];
}

export interface BillingMetrics {
  totalInvoices: number;
  totalInvoiced: number;
  totalCollected: number;
  totalReceivables: number;
  collectionRate: number;
  totalPaymentsCount: number;
  statusCounts: {
    Draft: number;
    Issued: number;
    "Partially Paid": number;
    Paid: number;
    Cancelled: number;
    Refunded: number;
  };
}

export interface CreateInvoiceLineItemInput {
  itemType: InvoiceLineItemType;
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface CreateInvoicePayload {
  patientId: number;
  consultationId?: string | null;
  admissionId?: string | null;
  issueDate?: string;
  dueDate?: string;
  discount?: number;
  taxRate?: number;
  paymentTerms?: string;
  notes?: string;
  items: CreateInvoiceLineItemInput[];
}

export interface RecordPaymentPayload {
  invoiceId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  referenceNumber?: string;
  receivedBy?: string;
  notes?: string;
}

export interface ReportsOverview {
  financials: {
    grossInvoiced: number;
    grossCollected: number;
    grossReceivables: number;
    collectionRate: number;
  };
  categoryRevenue: {
    category: string;
    amount: number;
    percentage: number;
  }[];
  paymentMethods: {
    method: string;
    count: number;
    total: number;
  }[];
  monthlyTrend: {
    month: string;
    invoiced: number;
    collected: number;
    count: number;
  }[];
  departmentBreakdown: {
    id: string;
    name: string;
    code: string;
    doctorCount: number;
    appointments: number;
    consultations: number;
    estimatedRevenue: number;
  }[];
  turnaroundKPIs: {
    avgQueueWaitMinutes: number;
    avgLabTurnaroundMinutes: number;
    avgLengthOfStayDays: number;
    bedOccupancyRate: number;
    totalAppointments: number;
    totalConsultations: number;
    totalLabOrders: number;
    totalAdmissions: number;
    activeInpatients: number;
  };
}

// ============================================================================
// PHASE 13 — MULTI-TENANCY & AUDIT LOGS
// ============================================================================

export interface Organization {
  id: string;
  name: string;
  code: string;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  status: string;
  taxId?: string | null;
  licenseNumber?: string | null;
  createdAt?: string;
  stats?: {
    usersCount: number;
    departmentsCount: number;
    patientsCount: number;
    auditLogsCount: number;
  };
}

export interface AuditLog {
  id: string;
  userId?: string | null;
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
  } | null;
  organizationId?: string | null;
  organization?: {
    id: string;
    name: string;
    code: string;
  } | null;
  action: string;
  entityName: string;
  entityId?: string | null;
  details?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt: string;
}

// ============================================================================
// PHASE 14 — REAL-TIME & BACKGROUND JOBS
// ============================================================================

export type JobStatus = "waiting" | "active" | "completed" | "failed" | "dead_letter";

export interface BackgroundJob<T = any> {
  id: string;
  name: string;
  data: T;
  status: JobStatus;
  progress: number;
  attempts: number;
  maxAttempts: number;
  backoffMs: number;
  error?: string | null;
  result?: any;
  organizationId: string;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
}

export interface JobMetrics {
  total: number;
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  deadLetter: number;
}

export interface RealtimeEventItem {
  id: string;
  event: string;
  type: "queue" | "bed" | "notification" | "job";
  summary: string;
  timestamp: string;
  data?: any;
}

// ============================================================================
// PHASE 15 — FILES & CLINICAL AI COPILOT
// ============================================================================

export type FileCategory =
  | "LabResult"
  | "Radiology"
  | "ClinicalNote"
  | "DischargeSummary"
  | "Prescription"
  | "Insurance"
  | "Other";

export interface MedicalFile {
  id: string;
  originalName: string;
  storageKey: string;
  mimeType: string;
  sizeBytes: number;
  category: FileCategory;
  checksum?: string | null;
  downloadCount: number;
  patientId?: number | null;
  patient?: {
    id: number;
    name: string;
    mrn: string;
  } | null;
  consultationId?: string | null;
  labOrderId?: string | null;
  uploadedById: string;
  uploadedBy?: {
    id: string;
    name: string;
    role: string;
  } | null;
  organizationId: string;
  organization?: {
    id: string;
    name: string;
    code: string;
  } | null;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface FileStorageMetrics {
  totalFiles: number;
  totalBytes: number;
  totalMegaBytes: number;
  byCategory: Record<string, number>;
}

export interface ClinicalSummaryResult {
  executiveSummary: string;
  pertinentFindings: string[];
  clinicalChronology: string;
  medicationReconciliation: string;
  carePlanRecommendations: string[];
  suggestedICD10: Array<{ code: string; label: string }>;
  isAiGenerated: boolean;
  model: string;
  confidence: number;
  reviewStatus: string;
  disclaimer: string;
  generatedAt: string;
}

export interface OperationalCopilotResult {
  query: string;
  answer: string;
  metrics: Record<string, any>;
  isAiGenerated: boolean;
  model: string;
  disclaimer: string;
  timestamp: string;
}


