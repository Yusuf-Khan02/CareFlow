import { z } from "zod";

export const appointmentTypes = [
  "Consultation",
  "Follow-up",
  "Emergency",
  "Routine Checkup",
] as const;

export const appointmentStatuses = [
  "Scheduled",
  "Confirmed",
  "Checked-in",
  "In-Progress",
  "Completed",
  "Cancelled",
  "No-Show",
] as const;

export const createAppointmentSchema = z.object({
  patientId: z.number().int().positive("Valid patient ID is required"),
  doctorId: z.number().int().positive("Valid doctor ID is required"),
  departmentId: z.string().optional(),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in format YYYY-MM-DD"),
  time: z.string().min(1, "Time slot is required (e.g. 10:30 AM)"),
  type: z.enum(appointmentTypes).default("Consultation"),
  notes: z.string().max(1000).optional().nullable(),
});

export const updateAppointmentSchema = z.object({
  doctorId: z.number().int().positive().optional(),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in format YYYY-MM-DD")
    .optional(),
  time: z.string().min(1).optional(),
  type: z.enum(appointmentTypes).optional(),
  status: z.enum(appointmentStatuses).optional(),
  notes: z.string().max(1000).optional().nullable(),
});

export const updateAppointmentStatusSchema = z.object({
  status: z.enum(appointmentStatuses, {
    errorMap: () => ({
      message: `Status must be one of: ${appointmentStatuses.join(", ")}`,
    }),
  }),
  notes: z.string().max(500).optional(),
});

export const cancelAppointmentSchema = z.object({
  reason: z.string().max(500).optional(),
});

export const getAppointmentsQuerySchema = z.object({
  date: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  doctorId: z.coerce.number().int().positive().optional(),
  patientId: z.coerce.number().int().positive().optional(),
  departmentId: z.string().optional(),
  status: z.string().optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(50),
});

export const appointmentIdParamSchema = z.object({
  id: z.string().min(1, "Appointment ID is required"),
});

export const availableSlotsQuerySchema = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be formatted as YYYY-MM-DD"),
});
