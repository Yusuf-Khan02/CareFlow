import { z } from "zod";

export const doctorIdParamSchema = z.object({
  id: z.coerce
    .number({ invalid_type_error: "Doctor ID must be a numeric integer" })
    .int()
    .positive("Doctor ID must be greater than 0"),
});

export const getDoctorsQuerySchema = z.object({
  search: z.string().trim().optional(),
  department: z.string().trim().optional(),
  status: z.enum(["On Duty", "In Consultation", "On Leave", "Off Duty"]).optional(),
  specialty: z.string().trim().optional(),
});

export const dayScheduleInputSchema = z.object({
  day: z.string().trim(),
  shifts: z.string().trim(),
  isAvailable: z.boolean().default(true),
  slotsRemaining: z.coerce.number().int().default(6),
});

export const createDoctorSchema = z.object({
  name: z.string().trim().min(2, "Doctor name must be at least 2 characters"),
  title: z.string().trim().min(2, "Clinical title is required"),
  qualification: z.string().trim().min(2, "Medical qualifications are required"),
  specialty: z.string().trim().min(2, "Medical specialty is required"),
  departmentId: z.string().trim().optional(),
  department: z.string().trim().optional(),
  room: z.string().trim().min(1, "Consultation room is required"),
  email: z.string().trim().email("Valid institutional email is required"),
  phone: z.string().trim().min(5, "Contact phone is required"),
  status: z.enum(["On Duty", "In Consultation", "On Leave", "Off Duty"]).default("On Duty"),
  rating: z.coerce.number().min(0).max(5).default(5.0),
  consultationFee: z.coerce.number().min(0).default(500.0),
  experienceYears: z.coerce.number().int().min(0).default(5),
  bio: z.string().trim().optional(),
  schedule: z.array(dayScheduleInputSchema).optional(),
});

export const updateDoctorSchema = createDoctorSchema.partial();

export const updateDoctorScheduleSchema = z.object({
  schedule: z.array(dayScheduleInputSchema).min(1, "At least one day schedule is required"),
});
