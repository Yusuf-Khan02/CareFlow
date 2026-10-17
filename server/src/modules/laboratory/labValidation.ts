import { z } from "zod";

export const labResultItemSchema = z.object({
  parameterName: z.string().trim().min(1, "Parameter name is required"),
  measuredValue: z.string().trim().min(1, "Measured value is required"),
  unit: z.string().trim().default(""),
  referenceRange: z.string().trim().default(""),
  status: z.enum(["Normal", "Low", "High", "Critical"]).default("Normal"),
  technicianNotes: z.string().trim().optional().nullable(),
  verifiedBy: z.string().trim().optional().nullable(),
});

export const createLabOrderSchema = z.object({
  patientId: z.number().int().positive("Valid patient ID is required"),
  doctorId: z.number().int().positive("Valid doctor ID is required"),
  consultationId: z.string().optional().nullable(),
  testCategory: z.string().trim().min(2, "Test category is required"),
  testName: z.string().trim().min(2, "Test name is required"),
  priority: z.enum(["Routine", "Urgent", "STAT"]).default("Routine"),
  clinicalNotes: z.string().trim().optional().nullable(),
});

export const updateLabOrderStatusSchema = z.object({
  status: z.enum(["Requested", "Sample Collected", "In-Analysis", "Completed", "Cancelled"]),
});

export const enterLabResultsSchema = z.object({
  results: z.array(labResultItemSchema).min(1, "At least one result parameter is required"),
  verifiedBy: z.string().trim().optional().nullable(),
  technicianNotes: z.string().trim().optional().nullable(),
});

export const getLabOrdersQuerySchema = z.object({
  patientId: z.coerce.number().int().positive().optional(),
  doctorId: z.coerce.number().int().positive().optional(),
  consultationId: z.string().optional(),
  status: z.string().optional(),
  priority: z.string().optional(),
  category: z.string().optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(50),
});

export const labOrderIdParamSchema = z.object({
  id: z.string().min(1, "Lab Order ID is required"),
});
