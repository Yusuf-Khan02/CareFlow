import { Router } from "express";
import validateRequest from "../../middleware/validateRequest.js";
import {
  getPrescriptions,
  createPrescription,
  cancelPrescription,
} from "./encounterController.js";
import {
  createPrescriptionSchema,
  getPrescriptionsQuerySchema,
  prescriptionIdParamSchema,
} from "./encounterValidation.js";

const router = Router();

// GET /api/v1/prescriptions
router.get(
  "/",
  validateRequest({ query: getPrescriptionsQuerySchema }),
  getPrescriptions
);

// POST /api/v1/prescriptions
router.post(
  "/",
  validateRequest({ body: createPrescriptionSchema }),
  createPrescription
);

// PATCH /api/v1/prescriptions/:id/cancel
router.patch(
  "/:id/cancel",
  validateRequest({ params: prescriptionIdParamSchema }),
  cancelPrescription
);

export default router;
