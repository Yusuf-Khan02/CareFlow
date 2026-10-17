import { Server as SocketIOServer, Socket } from "socket.io";
import type { Server as HTTPServer } from "http";
import jwt from "jsonwebtoken";
import ENV from "../config/env.js";
import logger from "../utils/logger.js";

let io: SocketIOServer | null = null;

export interface SocketUser {
  id: string;
  name: string;
  email: string;
  role: string;
  organizationId: string;
}

/**
 * Initialize Socket.IO Server attached to Express HTTP Server
 */
export const initSocketServer = (httpServer: HTTPServer): SocketIOServer => {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: [ENV.CORS_ORIGIN, "http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"],
      credentials: true,
      methods: ["GET", "POST", "PATCH", "DELETE"],
    },
    pingTimeout: 30000,
    pingInterval: 15000,
  });

  // Authentication Middleware
  io.use((socket: Socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.replace("Bearer ", "");
      const requestedOrgId =
        socket.handshake.auth?.organizationId ||
        (socket.handshake.headers?.["x-organization-id"] as string) ||
        "org-careflow-central";

      if (token) {
        try {
          const decoded = jwt.verify(token, ENV.JWT_SECRET) as any;
          socket.data.user = {
            id: decoded.id || decoded.userId,
            name: decoded.name || "Staff Member",
            email: decoded.email,
            role: decoded.role,
            organizationId: decoded.organizationId || requestedOrgId,
          } as SocketUser;
          socket.data.organizationId = socket.data.user.organizationId;
        } catch {
          // If token verification fails, allow guest access with requested tenant
          socket.data.user = null;
          socket.data.organizationId = requestedOrgId;
        }
      } else {
        // Guest connection (e.g. Waiting Room display screen)
        socket.data.user = null;
        socket.data.organizationId = requestedOrgId;
      }

      next();
    } catch (err: any) {
      logger.warn(`Socket.IO auth warning: ${err.message}`);
      next();
    }
  });

  // Client Connection Handler
  io.on("connection", (socket: Socket) => {
    const orgId = socket.data.organizationId || "org-careflow-central";
    const user = socket.data.user;

    // Join tenant room for cross-tenant isolation
    socket.join(`tenant:${orgId}`);

    // If authenticated user, join personal room and role room
    if (user?.id) {
      socket.join(`user:${user.id}`);
      if (user.role) {
        socket.join(`role:${user.role}`);
      }
    }

    logger.info(
      `[Socket.IO] Client connected (${socket.id}) - Tenant: ${orgId} - User: ${
        user ? `${user.name} (${user.role})` : "Guest/Display"
      }`
    );

    // Acknowledge connection
    socket.emit("connection_acknowledged", {
      socketId: socket.id,
      organizationId: orgId,
      authenticated: !!user,
      serverTime: new Date().toISOString(),
    });

    // Facility / Tenant Switching Event
    socket.on("switch_tenant", (newOrgId: string) => {
      if (!newOrgId) return;
      const previousOrgId = socket.data.organizationId;
      if (previousOrgId) {
        socket.leave(`tenant:${previousOrgId}`);
      }
      socket.data.organizationId = newOrgId;
      socket.join(`tenant:${newOrgId}`);
      logger.info(`[Socket.IO] Socket ${socket.id} switched tenant to ${newOrgId}`);
      socket.emit("tenant_switched", { organizationId: newOrgId });
    });

    // Department Queue Subscription
    socket.on("subscribe_queue", (departmentId?: string) => {
      const room = departmentId ? `queue:${departmentId}` : `queue:${orgId}`;
      socket.join(room);
      socket.emit("subscribed", { room });
    });

    // Disconnect Handler
    socket.on("disconnect", (reason) => {
      logger.info(`[Socket.IO] Client disconnected (${socket.id}): ${reason}`);
    });
  });

  logger.info("[Socket.IO] Real-time engine initialized successfully.");
  return io;
};

/**
 * Get active Socket.IO server instance
 */
export const getIO = (): SocketIOServer | null => {
  return io;
};

// ============================================================================
// REAL-TIME BROADCAST HELPERS
// ============================================================================

/**
 * Broadcast Queue Events strictly to the target tenant
 */
export const broadcastQueueUpdate = (
  tenantId: string,
  event: "token_created" | "token_called" | "token_completed" | "token_skipped" | "token_recalled",
  tokenData: any
) => {
  if (!io) return;
  const targetRoom = `tenant:${tenantId || "org-careflow-central"}`;
  io.to(targetRoom).emit(`queue:${event}`, {
    event,
    data: tokenData,
    timestamp: new Date().toISOString(),
  });
  logger.info(`[Socket.IO] Broadcast queue:${event} to ${targetRoom}`);
};

/**
 * Broadcast Inpatient Bed & Ward Events
 */
export const broadcastBedUpdate = (
  tenantId: string,
  event: "admitted" | "transferred" | "discharged" | "status_changed",
  bedData: any
) => {
  if (!io) return;
  const targetRoom = `tenant:${tenantId || "org-careflow-central"}`;
  io.to(targetRoom).emit(`bed:${event}`, {
    event,
    data: bedData,
    timestamp: new Date().toISOString(),
  });
  logger.info(`[Socket.IO] Broadcast bed:${event} to ${targetRoom}`);
};

/**
 * Broadcast Emergency & Clinical Notifications
 */
export const broadcastNotification = (
  tenantId: string,
  notification: {
    id: string;
    title: string;
    description: string;
    type: "urgent" | "warning" | "info";
    targetUserId?: string;
    targetRole?: string;
  }
) => {
  if (!io) return;
  if (notification.targetUserId) {
    io.to(`user:${notification.targetUserId}`).emit("notification:new", notification);
  } else if (notification.targetRole) {
    io.to(`role:${notification.targetRole}`).emit("notification:new", notification);
  } else {
    io.to(`tenant:${tenantId || "org-careflow-central"}`).emit("notification:new", notification);
  }
};

/**
 * Broadcast Job Queue Lifecycle Events (Progress, Completion, Failure, DLQ)
 */
export const broadcastJobEvent = (
  event: "job:created" | "job:progress" | "job:completed" | "job:failed" | "job:dead_letter",
  jobData: any
) => {
  if (!io) return;
  io.emit(event, {
    event,
    job: jobData,
    timestamp: new Date().toISOString(),
  });
};

export default {
  initSocketServer,
  getIO,
  broadcastQueueUpdate,
  broadcastBedUpdate,
  broadcastNotification,
  broadcastJobEvent,
};
