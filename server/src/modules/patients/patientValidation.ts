import { z } from "zod";

export const patientIdParamSchema = z.object({
  id: z.coerce
    .number({ invalid_type_error: "Patient ID must be a numeric integer" })
    .int()
    .positive("Patient ID must be greater than 0"),
});

export const getPatientsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20).optional(),
  search: z.string().trim().optional(),
  department: z.string().trim().optional(),
  organizationId: z.string().trim().optional(),
  status: z.enum(["Active", "Critical", "Discharged"]).optional(),
  sortBy: z.enum(["name", "age", "mrn", "admissionDate", "createdAt"]).default("createdAt").optional(),
  sortOrder: z.enum(["asc", "desc"]).default("desc").optional(),
});

export const emergencyContactSchema = z.object({
  name: z.string().trim().min(1, "Emergency contact name is required"),
  relation: z.string().trim().min(1, "Relationship is required"),
  phone: z.string().trim().min(5, "Emergency phone is required"),
});

export const patientVitalsInputSchema = z.object({
  bloodPressure: z.string().trim().default("120/80 mmHg"),
  heartRate: z.coerce.number().int().default(72),
  temperature: z.string().trim().default("98.6 °F"),
  spO2: z.coerce.number().int().default(98),
});

export const createPatientSchema = z.object({
  name: z.string().trim().min(2, "Patient name must be at least 2 characters"),
  age: z.coerce.number().int().min(0, "Age must be at least 0").max(130, "Age cannot exceed 130"),
  gender: z.enum(["Male", "Female", "Other"]),
  phone: z.string().trim().min(5, "Phone number is required"),
  email: z.string().trim().email("Invalid email address").optional().or(z.literal("")),
  address: z.string().trim().optional().or(z.literal("")),
  departmentId: z.string().trim().optional(),
  department: z.string().trim().optional(),
  status: z.enum(["Active", "Critical", "Discharged"]).default("Active"),
  bloodGroup: z.enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]).default("O+"),
  emergencyContact: emergencyContactSchema.optional(),
  emergencyName: z.string().trim().optional(),
  emergencyRelation: z.string().trim().optional(),
  emergencyPhone: z.string().trim().optional(),
  allergies: z.union([z.array(z.string()), z.string()]).optional(),
  doctorAssignedId: z.coerce.number().int().optional(),
  doctorAssigned: z.string().trim().optional(),
  admissionDate: z.string().trim().optional(),
  organizationId: z.string().trim().optional(),
  vitals: patientVitalsInputSchema.optional(),
});

export const updatePatientSchema = createPatientSchema.partial();
