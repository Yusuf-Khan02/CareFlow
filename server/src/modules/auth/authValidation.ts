import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  role: z.enum([
    "Admin",
    "Doctor",
    "Nurse",
    "Receptionist",
    "LabTech",
    "Pharmacist",
    "Patient",
    "Staff",
  ]).default("Staff"),
  organizationId: z.string().trim().optional(),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required"),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(6, "Current password is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
});
