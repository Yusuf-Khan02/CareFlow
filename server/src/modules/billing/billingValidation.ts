import { z } from "zod";

export const lineItemTypeEnum = z.enum([
  "Consultation",
  "Inpatient Bed Stay",
  "Laboratory Test",
  "Pharmacy Medication",
  "Nursing Procedure",
  "Other",
]);

export const paymentMethodEnum = z.enum([
  "Cash",
  "Credit Card",
  "Debit Card",
  "UPI / Net Banking",
  "Insurance / TPA",
  "Cheque",
]);

export const invoiceStatusEnum = z.enum([
  "All",
  "Draft",
  "Issued",
  "Partially Paid",
  "Paid",
  "Cancelled",
  "Refunded",
]);

export const createInvoiceLineItemSchema = z.object({
  itemType: lineItemTypeEnum.default("Other"),
  description: z.string().min(1, "Description is required"),
  quantity: z.coerce.number().int().positive("Quantity must be at least 1").default(1),
  unitPrice: z.coerce.number().min(0, "Unit price must be non-negative"),
});

export const createInvoiceSchema = z.object({
  patientId: z.coerce.number().int().positive("Valid patient ID is required"),
  consultationId: z.string().optional().nullable(),
  admissionId: z.string().optional().nullable(),
  issueDate: z.string().optional(),
  dueDate: z.string().optional(),
  discount: z.coerce.number().min(0).default(0),
  taxRate: z.coerce.number().min(0).max(100).default(0),
  paymentTerms: z.string().default("Net 15 Days"),
  notes: z.string().optional().nullable(),
  items: z.array(createInvoiceLineItemSchema).min(1, "At least one billing line item is required"),
});

export const recordPaymentSchema = z.object({
  invoiceId: z.string().min(1, "Invoice ID is required"),
  amount: z.coerce.number().positive("Payment amount must be greater than zero"),
  paymentMethod: paymentMethodEnum.default("Cash"),
  referenceNumber: z.string().optional().nullable(),
  receivedBy: z.string().optional().default("Hospital Cashier"),
  notes: z.string().optional().nullable(),
});

export const getInvoicesQuerySchema = z.object({
  search: z.string().optional(),
  status: invoiceStatusEnum.optional(),
  patientId: z.coerce.number().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  limit: z.coerce.number().optional().default(50),
  offset: z.coerce.number().optional().default(0),
});

export const invoiceIdParamSchema = z.object({
  id: z.string().min(1, "Invoice identifier is required"),
});

export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>;
export type RecordPaymentInput = z.infer<typeof recordPaymentSchema>;
export type GetInvoicesQuery = z.infer<typeof getInvoicesQuerySchema>;
