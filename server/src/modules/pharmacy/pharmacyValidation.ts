import { z } from "zod";

export const createMedicineSchema = z.object({
  sku: z.string().trim().min(3, "SKU identifier is required"),
  name: z.string().trim().min(2, "Generic medicine name is required"),
  brandName: z.string().trim().min(2, "Brand name is required"),
  category: z.string().trim().min(2, "Category is required"),
  dosageForm: z.string().trim().min(2, "Dosage form (Tablet, Syrup, etc.) is required"),
  strength: z.string().trim().min(1, "Strength (e.g. 500mg) is required"),
  unitPrice: z.number().positive("Unit retail dispensing price must be greater than 0"),
  costPrice: z.number().positive("Unit cost purchase price must be greater than 0"),
  minStockLevel: z.number().int().nonnegative().default(50),
  prescriptionRequired: z.boolean().default(true),
  storageConditions: z.string().trim().optional().nullable(),
  manufacturer: z.string().trim().optional().nullable(),
});

export const receiveStockSchema = z.object({
  medicineId: z.string().min(1, "Medicine ID is required"),
  batchNumber: z.string().trim().min(2, "Batch number is required"),
  quantityReceived: z.number().int().positive("Received quantity must be at least 1"),
  expiryDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Expiry date must be in YYYY-MM-DD format"),
  purchaseDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Purchase date must be in YYYY-MM-DD format")
    .default(() => new Date().toISOString().split("T")[0]),
  supplierName: z.string().trim().optional().nullable(),
  costPerUnit: z.number().positive().optional(),
  notes: z.string().trim().optional().nullable(),
});

export const dispenseStockSchema = z.object({
  medicineId: z.string().min(1, "Medicine ID is required"),
  quantity: z.number().int().positive("Dispensing quantity must be at least 1"),
  prescriptionId: z.string().optional().nullable(),
  patientName: z.string().trim().optional().nullable(),
  performedBy: z.string().trim().default("Staff Pharmacist"),
  notes: z.string().trim().optional().nullable(),
});

export const getMedicinesQuerySchema = z.object({
  category: z.string().optional(),
  stockStatus: z.enum(["all", "low", "out_of_stock", "normal"]).default("all"),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(50),
});

export const medicineIdParamSchema = z.object({
  id: z.string().min(1, "Medicine ID is required"),
});
