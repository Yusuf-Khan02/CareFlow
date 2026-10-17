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
  recordedAt: string;
}

export interface AppointmentRecord {
  id: string;
  doctorName: string;
  department: string;
  date: string;
  time: string;
  type: "Consultation" | "Follow-up" | "Emergency" | "Routine Checkup";
  status: "Scheduled" | "Completed" | "Cancelled" | "In-Progress";
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
