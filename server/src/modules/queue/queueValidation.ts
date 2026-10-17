import { z } from "zod";

export const queueStatuses = [
  "Waiting",
  "Called",
  "In-Consultation",
  "Completed",
  "Skipped",
] as const;

export const queuePriorities = ["Normal", "Urgent", "Emergency"] as const;

export const createQueueTokenSchema = z.object({
  patientId: z.number().int().positive("Valid patient ID is required"),
  doctorId: z.number().int().positive().optional().nullable(),
  departmentId: z.string().optional(),
  priority: z.enum(queuePriorities).default("Normal"),
  appointmentId: z.string().optional().nullable(),
});

export const callNextSchema = z.object({
  doctorId: z.number().int().positive().optional(),
  departmentId: z.string().optional(),
});

export const updateTokenStatusSchema = z.object({
  status: z.enum(queueStatuses, {
    errorMap: () => ({
      message: `Status must be one of: ${queueStatuses.join(", ")}`,
    }),
  }),
});

export const getQueueQuerySchema = z.object({
  doctorId: z.coerce.number().int().positive().optional(),
  departmentId: z.string().optional(),
  status: z.string().optional(),
  priority: z.string().optional(),
  search: z.string().optional(),
  date: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(50),
});

export const tokenIdParamSchema = z.object({
  id: z.string().min(1, "Token ID is required"),
});
