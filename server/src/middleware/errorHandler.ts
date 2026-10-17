import type { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";
import { AppError } from "../utils/errors.js";
import logger from "../utils/logger.js";
import ENV from "../config/env.js";

export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  res.status(404).json({
    success: false,
    error: {
      message: `Cannot ${req.method} ${req.originalUrl} - Route not registered`,
      statusCode: 404,
      code: "ROUTE_NOT_FOUND",
    },
  });
};

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // 1. Zod Validation Errors
  if (err instanceof ZodError) {
    const formattedErrors = err.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
    }));

    return res.status(422).json({
      success: false,
      error: {
        message: "Request validation failed",
        statusCode: 422,
        code: "VALIDATION_ERROR",
        details: formattedErrors,
      },
    });
  }

  // 2. Prisma Database Known Request Errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      const target = Array.isArray(err.meta?.target)
        ? err.meta?.target.join(", ")
        : (err.meta?.target as string) || "field";

      return res.status(409).json({
        success: false,
        error: {
          message: `A record with this ${target} already exists in the database.`,
          statusCode: 409,
          code: "DUPLICATE_ENTRY",
        },
      });
    }

    if (err.code === "P2025") {
      return res.status(404).json({
        success: false,
        error: {
          message: "The requested record was not found in the database.",
          statusCode: 404,
          code: "RECORD_NOT_FOUND",
        },
      });
    }

    if (err.code === "P2003") {
      return res.status(400).json({
        success: false,
        error: {
          message: "Foreign key relational constraint failed.",
          statusCode: 400,
          code: "FOREIGN_KEY_VIOLATION",
        },
      });
    }
  }

  // 3. Custom Operational AppErrors
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        message: err.message,
        statusCode: err.statusCode,
        code: err.name,
        details: err.details,
      },
    });
  }

  // 4. Unexpected Server Faults
  logger.error(`Unhandled Exception on ${req.method} ${req.originalUrl}:`, err);

  const isDev = ENV.NODE_ENV === "development";
  return res.status(500).json({
    success: false,
    error: {
      message: isDev ? err.message : "Internal server operational error",
      statusCode: 500,
      code: "INTERNAL_SERVER_ERROR",
      ...(isDev && { stack: err.stack }),
    },
  });
};
