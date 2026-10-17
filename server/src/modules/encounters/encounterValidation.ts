import { z } from "zod";

export const prescriptionItemSchema = z.object({
  medicationName: z.string().trim().min(1, "Medication name is required"),
  dosage: z.string().trim().min(1, "Dosage is required (e.g. 500mg)"),
  route: z.string().trim().default("Oral"),
  frequency: z.string().trim().min(1, "Frequency is required (e.g. Twice daily)"),
  duration: z.string().trim().min(1, "Duration is required (e.g. 5 days)"),
  instructions: z.string().trim().optional().nullable(),
});

export const createConsultationSchema = z.object({
  patientId: z.number().int().positive("Valid patient ID is required"),
  doctorId: z.number().int().positive("Valid doctor ID is required"),
  appointmentId: z.string().optional().nullable(),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD")
    .optional(),
  chiefComplaint: z.string().trim().min(2, "Chief complaint is required"),
  diagnosis: z.string().trim().min(2, "Clinical diagnosis is required"),
  treatment: z.string().trim().min(2, "Treatment plan is required"),
  clinicalNotes: z.string().trim().optional().nullable(),
  prescriptions: z.array(prescriptionItemSchema).optional(),
});

export const updateConsultationSchema = z.object({
  chiefComplaint: z.string().trim().min(2).optional(),
  diagnosis: z.string().trim().min(2).optional(),
  treatment: z.string().trim().min(2).optional(),
  clinicalNotes: z.string().trim().optional().nullable(),
});

export const getConsultationsQuerySchema = z.object({
  patientId: z.coerce.number().int().positive().optional(),
  doctorId: z.coerce.number().int().positive().optional(),
  appointmentId: z.string().optional(),
  date: z.string().optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(50),
});

export const consultationIdParamSchema = z.object({
  id: z.string().min(1, "Consultation ID is required"),
});

export const createPrescriptionSchema = z.object({
  patientId: z.number().int().positive("Patient ID is required"),
  doctorId: z.number().int().positive("Doctor ID is required"),
  consultationId: z.string().optional().nullable(),
  medicationName: z.string().trim().min(1, "Medication name is required"),
  dosage: z.string().trim().min(1, "Dosage is required"),
  route: z.string().trim().default("Oral"),
  frequency: z.string().trim().min(1, "Frequency is required"),
  duration: z.string().trim().min(1, "Duration is required"),
  instructions: z.string().trim().optional().nullable(),
});

export const getPrescriptionsQuerySchema = z.object({
  patientId: z.coerce.number().int().positive().optional(),
  doctorId: z.coerce.number().int().positive().optional(),
  consultationId: z.string().optional(),
  status: z.string().optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(50),
});

export const prescriptionIdParamSchema = z.object({
  id: z.string().min(1, "Prescription ID is required"),
});
