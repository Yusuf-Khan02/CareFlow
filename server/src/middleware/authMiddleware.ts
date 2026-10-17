import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import ENV from "../config/env.js";
import { UnauthorizedError, ForbiddenError } from "../utils/errors.js";
import prisma from "../config/db.js";

export interface AuthUserPayload {
  id: string;
  email: string;
  role: string;
  name: string;
  organizationId?: string | null;
}

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: AuthUserPayload;
    }
  }
}

/**
 * Middleware to verify JWT authentication on protected endpoints.
 */
export const authenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new UnauthorizedError("Authentication token is missing or malformed");
    }

    const token = authHeader.split(" ")[1];

    let decoded: any;
    try {
      decoded = jwt.verify(token, ENV.JWT_SECRET);
    } catch (err: any) {
      if (err.name === "TokenExpiredError") {
        throw new UnauthorizedError("Session expired. Please log in again.", {
          code: "TOKEN_EXPIRED",
        });
      }
      throw new UnauthorizedError("Invalid authentication credentials");
    }

    // Verify user exists and is active
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        role: true,
        name: true,
        status: true,
        organizationId: true,
      },
    });

    if (!user) {
      throw new UnauthorizedError("User account no longer exists");
    }

    if (user.status !== "Active") {
      throw new ForbiddenError(`Account is currently ${user.status.toLowerCase()}. Access denied.`);
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      organizationId: user.organizationId,
    };

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Role-based authorization middleware.
 * Ensures the authenticated user possesses one of the designated roles (or is Admin).
 */
export const authorizeRoles = (...allowedRoles: string[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new UnauthorizedError("Authentication required"));
    }

    // Admin has superuser clearance across all modules
    if (req.user.role === "Admin" || req.user.role === "Hospital Admin") {
      return next();
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new ForbiddenError(
          `Access restricted: requires [${allowedRoles.join(", ")}] role privilege. Current role: ${req.user.role}`
        )
      );
    }

    next();
  };
};

export default authenticate;
