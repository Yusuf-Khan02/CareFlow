import { z } from "zod";

export const getAuditLogsQuerySchema = z.object({
  search: z.string().optional(),
  organizationId: z.string().optional(),
  action: z.string().optional(),
  entityName: z.string().optional(),
  userId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  limit: z.coerce.number().optional().default(50),
  offset: z.coerce.number().optional().default(0),
});

export const logEventSchema = z.object({
  action: z.string().min(1, "Action is required"),
  entityName: z.string().min(1, "Entity name is required"),
  entityId: z.string().optional().nullable(),
  details: z.union([z.string(), z.record(z.any())]).optional(),
  userId: z.string().optional(),
  organizationId: z.string().optional(),
});

export type GetAuditLogsQuery = z.infer<typeof getAuditLogsQuerySchema>;
export type LogEventInput = z.infer<typeof logEventSchema>;
