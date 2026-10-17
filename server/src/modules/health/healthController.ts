import type { Request, Response, NextFunction } from "express";
import prisma from "../../config/db.js";
import ENV from "../../config/env.js";

/**
 * Health check handler returning server metadata and verifying database connectivity.
 */
export const getHealth = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const dbStartTime = performance.now();
    let dbStatus: "connected" | "disconnected" = "connected";
    let dbLatencyMs = 0;
    let organizationCount = 0;

    try {
      organizationCount = await prisma.organization.count();
      dbLatencyMs = Math.round(performance.now() - dbStartTime);
    } catch {
      dbStatus = "disconnected";
    }

    const memoryUsage = process.memoryUsage();

    const response = {
      success: dbStatus === "connected",
      data: {
        service: "CareFlow Smart Hospital Operations Platform API",
        version: "1.0.0",
        environment: ENV.NODE_ENV,
        status: dbStatus === "connected" ? "healthy" : "degraded",
        uptimeSeconds: Math.floor(process.uptime()),
        timestamp: new Date().toISOString(),
        database: {
          status: dbStatus,
          provider: "SQL (Prisma ORM)",
          latencyMs: dbLatencyMs,
          organizationsConfigured: organizationCount,
        },
        system: {
          nodeVersion: process.version,
          platform: process.platform,
          memory: {
            rssMb: Math.round((memoryUsage.rss / 1024 / 1024) * 100) / 100,
            heapUsedMb: Math.round((memoryUsage.heapUsed / 1024 / 1024) * 100) / 100,
            heapTotalMb: Math.round((memoryUsage.heapTotal / 1024 / 1024) * 100) / 100,
          },
        },
      },
    };

    res.status(dbStatus === "connected" ? 200 : 503).json(response);
  } catch (error) {
    next(error);
  }
};
