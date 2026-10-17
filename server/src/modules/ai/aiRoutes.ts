import { Router } from "express";
import { aiController } from "./aiController.js";
import { authenticate, authorizeRoles } from "../../middleware/authMiddleware.js";

const router = Router();

/**
 * AI Clinical Encounter Summarizer (Doctors, Nurses, Admins)
 */
router.post(
  "/summarize-encounter",
  authenticate,
  authorizeRoles("Admin", "Hospital Admin", "Doctor", "Nurse"),
  aiController.summarizeEncounter
);

/**
 * Operational Analytics Hospital Copilot (All authenticated staff)
 */
router.post(
  "/operational-assistant",
  authenticate,
  aiController.operationalAssistant
);

/**
 * Diagnostic Lab Result Trend Evaluator
 */
router.post(
  "/evaluate-lab",
  authenticate,
  authorizeRoles("Admin", "Hospital Admin", "Doctor", "LabTech"),
  aiController.evaluateLabTrends
);

export default router;
