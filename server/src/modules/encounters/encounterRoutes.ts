import { Router } from "express";
import validateRequest from "../../middleware/validateRequest.js";
import {
  getConsultations,
  getConsultationById,
  createConsultation,
  updateConsultation,
  completeConsultation,
} from "./encounterController.js";
import {
  createConsultationSchema,
  updateConsultationSchema,
  getConsultationsQuerySchema,
  consultationIdParamSchema,
} from "./encounterValidation.js";

const router = Router();

// GET /api/v1/consultations
router.get(
  "/",
  validateRequest({ query: getConsultationsQuerySchema }),
  getConsultations
);

// POST /api/v1/consultations
router.post(
  "/",
  validateRequest({ body: createConsultationSchema }),
  createConsultation
);

// GET /api/v1/consultations/:id
router.get(
  "/:id",
  validateRequest({ params: consultationIdParamSchema }),
  getConsultationById
);

// PUT /api/v1/consultations/:id
router.put(
  "/:id",
  validateRequest({
    params: consultationIdParamSchema,
    body: updateConsultationSchema,
  }),
  updateConsultation
);

// PATCH /api/v1/consultations/:id/complete
router.patch(
  "/:id/complete",
  validateRequest({ params: consultationIdParamSchema }),
  completeConsultation
);

export default router;
