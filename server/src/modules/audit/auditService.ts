import prisma from "../../config/db.js";
import type { GetAuditLogsQuery, LogEventInput } from "./auditValidation.js";

export const auditService = {
  /**
   * Log an immutable system audit record
   */
  async logEvent(data: LogEventInput & { ipAddress?: string; userAgent?: string }) {
    const detailsStr =
      typeof data.details === "object" ? JSON.stringify(data.details) : data.details || null;

    return prisma.auditLog.create({
      data: {
        userId: data.userId || null,
        organizationId: data.organizationId || "org-careflow-central",
        action: data.action.toUpperCase(),
        entityName: data.entityName,
        entityId: data.entityId ? String(data.entityId) : null,
        details: detailsStr,
        ipAddress: data.ipAddress || null,
        userAgent: data.userAgent || null,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        organization: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });
  },

  /**
   * Query audit logs with search, actor, entity, date range & tenant filtering
   */
  async getAuditLogs(query: GetAuditLogsQuery) {
    const {
      search,
      organizationId,
      action,
      entityName,
      userId,
      startDate,
      endDate,
      limit = 50,
      offset = 0,
    } = query;

    const where: any = {};

    if (organizationId && organizationId !== "all") {
      where.organizationId = organizationId;
    }

    if (action && action !== "ALL") {
      where.action = action;
    }

    if (entityName && entityName !== "ALL") {
      where.entityName = entityName;
    }

    if (userId) {
      where.userId = userId;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { action: { contains: q } },
        { entityName: { contains: q } },
        { entityId: { contains: q } },
        { details: { contains: q } },
        { ipAddress: { contains: q } },
        { user: { name: { contains: q } } },
        { user: { email: { contains: q } } },
      ];
    }

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
          organization: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
      }),
      prisma.auditLog.count({ where }),
    ]);

    return {
      logs,
      total,
      limit,
      offset,
    };
  },

  /**
   * Export audit trail as formatted CSV
   */
  async exportAuditLogsCSV(organizationId?: string): Promise<string> {
    const where: any = {};
    if (organizationId && organizationId !== "all") {
      where.organizationId = organizationId;
    }

    const logs = await prisma.auditLog.findMany({
      where,
      include: {
        user: { select: { name: true, role: true } },
        organization: { select: { name: true, code: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 1000,
    });

    const headers = [
      "Timestamp",
      "Organization Code",
      "Organization Name",
      "Actor Name",
      "Actor Role",
      "Action",
      "Entity",
      "Entity ID",
      "IP Address",
      "Details / Payload",
    ];

    const rows = logs.map((log) => [
      `"${log.createdAt.toISOString()}"`,
      `"${log.organization?.code || ""}"`,
      `"${log.organization?.name || ""}"`,
      `"${log.user?.name || "System Automated"}"`,
      `"${log.user?.role || "System"}"`,
      `"${log.action}"`,
      `"${log.entityName}"`,
      `"${log.entityId || ""}"`,
      `"${log.ipAddress || ""}"`,
      `"${(log.details || "").replace(/"/g, '""')}"`,
    ]);

    return [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");
  },
};

export default auditService;
