import express from "express";
import cors from "cors";
import ENV from "./config/env.js";
import requestLogger from "./middleware/requestLogger.js";
import { notFoundHandler, errorHandler } from "./middleware/errorHandler.js";
import healthRoutes from "./modules/health/healthRoutes.js";

export const createApp = (): express.Application => {
  const app = express();

  // 1. CORS Configuration
  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (e.g. mobile apps, curl, Postman)
        if (!origin) return callback(null, true);
        if (
          ENV.NODE_ENV === "development" ||
          origin === ENV.CORS_ORIGIN ||
          origin === "http://localhost:5173" ||
          origin === "http://localhost:3000"
        ) {
          return callback(null, true);
        }
        return callback(new Error("Not allowed by CORS"));
      },
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    })
  );

  // 2. Request Parsers
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));

  // 3. Request Logging
  app.use(requestLogger);

  // 4. Base Routes
  app.get("/", (_req, res) => {
    res.json({
      success: true,
      message: "CareFlow Smart Hospital Operations Platform API",
      documentation: "/api/v1/health",
      version: "1.0.0",
    });
  });

  // 5. Mount Submodules
  app.use("/health", healthRoutes);
  app.use(`${ENV.API_PREFIX}/health`, healthRoutes);

  // 6. 404 & Centralized Error Handlers (must be last)
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};

export default createApp;
