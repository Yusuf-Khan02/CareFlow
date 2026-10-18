import express from "express";
import cors from "cors";
import ENV from "./config/env.js";
import requestLogger from "./middleware/requestLogger.js";
import { notFoundHandler, errorHandler } from "./middleware/errorHandler.js";
import healthRoutes from "./modules/health/healthRoutes.js";
import authRoutes from "./modules/auth/authRoutes.js";
import patientRoutes from "./modules/patients/patientRoutes.js";
import doctorRoutes from "./modules/doctors/doctorRoutes.js";
import departmentRoutes from "./modules/departments/departmentRoutes.js";
import appointmentRoutes from "./modules/appointments/appointmentRoutes.js";
import queueRoutes from "./modules/queue/queueRoutes.js";
import encounterRoutes from "./modules/encounters/encounterRoutes.js";
import prescriptionRoutes from "./modules/encounters/prescriptionRoutes.js";
import labRoutes from "./modules/laboratory/labRoutes.js";
import pharmacyRoutes from "./modules/pharmacy/pharmacyRoutes.js";
import bedRoutes, { wardRoutes, admissionRoutes } from "./modules/beds/bedRoutes.js";
import billingRoutes, { reportRoutes } from "./modules/billing/billingRoutes.js";
import organizationRoutes from "./modules/organizations/organizationRoutes.js";
import auditRoutes from "./modules/audit/auditRoutes.js";
import jobRoutes from "./modules/jobs/jobRoutes.js";
import fileRoutes from "./modules/files/fileRoutes.js";
import aiRoutes from "./modules/ai/aiRoutes.js";
import tenantMiddleware from "./middleware/tenantMiddleware.js";

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
          origin.endsWith(".onrender.com") ||
          origin.endsWith(".vercel.app") ||
          origin === "http://localhost:5173" ||
          origin === "http://localhost:3000"
        ) {
          return callback(null, true);
        }
        return callback(new Error("Not allowed by CORS"));
      },
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "x-organization-id", "x-client-timestamp"],
    })
  );

  // 2. Request Parsers
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));

  // 3. Request Logging & Tenant Context
  app.use(requestLogger);
  app.use(tenantMiddleware);

  // 3.5. URL Normalization Middleware (Fixes double slashes and missing /api/v1 prefixes)
  app.use((req, _res, next) => {
    // Collapse any leading or internal double slashes: e.g. //auth/login -> /auth/login
    if (req.url.includes("//")) {
      req.url = req.url.replace(/\/+/g, "/");
    }
    // Transparently support routes called without /api/v1 prefix (e.g. /auth/login -> /api/v1/auth/login)
    const prefix = ENV.API_PREFIX; // "/api/v1"
    if (!req.url.startsWith(prefix) && req.url !== "/" && !req.url.startsWith("/socket.io")) {
      req.url = `${prefix}${req.url.startsWith("/") ? "" : "/"}${req.url}`;
    }
    next();
  });

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
  app.use(`${ENV.API_PREFIX}/auth`, authRoutes);
  app.use(`${ENV.API_PREFIX}/organizations`, organizationRoutes);
  app.use(`${ENV.API_PREFIX}/audit-logs`, auditRoutes);
  app.use(`${ENV.API_PREFIX}/patients`, patientRoutes);
  app.use(`${ENV.API_PREFIX}/doctors`, doctorRoutes);
  app.use(`${ENV.API_PREFIX}/departments`, departmentRoutes);
  app.use(`${ENV.API_PREFIX}/appointments`, appointmentRoutes);
  app.use(`${ENV.API_PREFIX}/queue`, queueRoutes);
  app.use(`${ENV.API_PREFIX}/consultations`, encounterRoutes);
  app.use(`${ENV.API_PREFIX}/encounters`, encounterRoutes);
  app.use(`${ENV.API_PREFIX}/prescriptions`, prescriptionRoutes);
  app.use(`${ENV.API_PREFIX}/laboratory`, labRoutes);
  app.use(`${ENV.API_PREFIX}/lab-orders`, labRoutes);
  app.use(`${ENV.API_PREFIX}/pharmacy`, pharmacyRoutes);
  app.use(`${ENV.API_PREFIX}/medicines`, pharmacyRoutes);
  app.use(`${ENV.API_PREFIX}/inventory`, pharmacyRoutes);
  app.use(`${ENV.API_PREFIX}/beds`, bedRoutes);
  app.use(`${ENV.API_PREFIX}/wards`, wardRoutes);
  app.use(`${ENV.API_PREFIX}/admissions`, admissionRoutes);
  app.use(`${ENV.API_PREFIX}/billing`, billingRoutes);
  app.use(`${ENV.API_PREFIX}/invoices`, billingRoutes);
  app.use(`${ENV.API_PREFIX}/payments`, billingRoutes);
  app.use(`${ENV.API_PREFIX}/reports`, reportRoutes);
  app.use(`${ENV.API_PREFIX}/jobs`, jobRoutes);
  app.use(`${ENV.API_PREFIX}/files`, fileRoutes);
  app.use(`${ENV.API_PREFIX}/ai`, aiRoutes);

  // 6. 404 & Centralized Error Handlers (must be last)
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};

export default createApp;
