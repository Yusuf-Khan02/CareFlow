import { Router } from "express";
import { bedController } from "./bedController.js";

// 1. Bed Router (mounted at /api/v1/beds)
export const bedRoutes = Router();

// Wards & Summary shortcuts
bedRoutes.get("/wards", bedController.getWardsSummary);
bedRoutes.get("/summary", bedController.getWardsSummary);

// Beds CRUD / Availability
bedRoutes.get("/", bedController.getBeds);
bedRoutes.get("/available", bedController.getAvailableBeds);
bedRoutes.patch("/:id/status", bedController.updateBedStatus);

// Admission shortcuts under /beds
bedRoutes.post("/admit", bedController.admitPatient);
bedRoutes.get("/admissions", bedController.getAdmissions);
bedRoutes.get("/admissions/:id", bedController.getAdmissionById);
bedRoutes.post("/admissions", bedController.admitPatient);
bedRoutes.post("/admissions/:id/transfer", bedController.transferPatient);
bedRoutes.post("/admissions/:id/discharge", bedController.dischargePatient);

// 2. Ward Router (mounted at /api/v1/wards)
export const wardRoutes = Router();
wardRoutes.get("/", bedController.getWardsSummary);
wardRoutes.get("/summary", bedController.getWardsSummary);

// 3. Admission Router (mounted at /api/v1/admissions)
export const admissionRoutes = Router();
admissionRoutes.get("/", bedController.getAdmissions);
admissionRoutes.post("/", bedController.admitPatient);
admissionRoutes.get("/:id", bedController.getAdmissionById);
admissionRoutes.post("/:id/transfer", bedController.transferPatient);
admissionRoutes.post("/:id/discharge", bedController.dischargePatient);

export default bedRoutes;
