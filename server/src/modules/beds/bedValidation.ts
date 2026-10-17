import { z } from "zod";

export const admitPatientSchema = z.object({
  patientId: z.coerce.number().int().positive("Valid patient ID is required"),
  doctorId: z.coerce.number().int().positive("Valid admitting doctor ID is required"),
  bedId: z.string().min(1, "Target bed ID is required"),
  admissionType: z.enum(["Emergency", "Elective", "Urgent", "Transfer"]).default("Elective"),
  diagnosis: z.string().trim().min(2, "Admitting diagnosis is required"),
  condition: z.enum(["Stable", "Serious", "Critical", "Guarded"]).default("Stable"),
  notes: z.string().trim().optional().nullable(),
});

export const transferBedSchema = z.object({
  toBedId: z.string().min(1, "Target destination bed ID is required"),
  reason: z.string().trim().min(3, "Clinical or operational reason for transfer is required"),
  transferredBy: z.string().trim().min(2, "Authorizing staff name is required").default("Staff Nurse"),
});

export const dischargePatientSchema = z.object({
  dischargeReason: z.enum(["Recovered", "Transferred", "AMA", "Deceased", "Home with Support"]).default("Recovered"),
  dischargeSummary: z.string().trim().min(3, "Clinical discharge summary notes are required"),
});

export const updateBedStatusSchema = z.object({
  status: z.enum(["Available", "Occupied", "Cleaning", "Maintenance", "Reserved"]),
});

export const getBedsQuerySchema = z.object({
  wardId: z.string().optional(),
  status: z.string().optional(),
  search: z.string().optional(),
});

export const getAdmissionsQuerySchema = z.object({
  status: z.enum(["Admitted", "Transferred", "Discharged", "all"]).default("Admitted"),
  wardId: z.string().optional(),
  search: z.string().optional(),
});

export const bedIdParamSchema = z.object({
  id: z.string().min(1, "Bed ID is required"),
});

export const admissionIdParamSchema = z.object({
  id: z.string().min(1, "Admission ID is required"),
});
