import type { Request, Response, NextFunction } from "express";
import { auditService } from "./auditService.js";
import { getAuditLogsQuerySchema, logEventSchema } from "./auditValidation.js";

export const auditController = {
  /**
   * GET /api/v1/audit-logs
   */
  async getAuditLogs(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = getAuditLogsQuerySchema.parse(req.query);
      const organizationId = parsed.organizationId || (req.query.organizationId as string) || req.organizationId;
      const result = await auditService.getAuditLogs({
        ...parsed,
        organizationId,
      });

      res.status(200).json({
        success: true,
        data: result.logs,
        meta: {
          total: result.total,
          limit: result.limit,
          offset: result.offset,
        },
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/v1/audit-logs
   */
  async logEvent(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = logEventSchema.parse(req.body);
      const ipAddress = req.ip || (req.headers["x-forwarded-for"] as string) || "127.0.0.1";
      const userAgent = req.headers["user-agent"] || "CareFlow-API";
      const organizationId = parsed.organizationId || req.organizationId;

      const log = await auditService.logEvent({
        ...parsed,
        organizationId,
        ipAddress,
        userAgent,
      });

      res.status(201).json({
        success: true,
        data: log,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/v1/audit-logs/export
   */
  async exportAuditLogsCSV(req: Request, res: Response, next: NextFunction) {
    try {
      const orgId = (req.query.organizationId as string) || req.organizationId;
      const csv = await auditService.exportAuditLogsCSV(orgId);

      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="careflow_audit_trail_${new Date().toISOString().split("T")[0]}.csv"`
      );
      res.status(200).send(csv);
    } catch (err) {
      next(err);
    }
  },
};

export default auditController;
