import { Router } from "express";
import validateRequest from "../../middleware/validateRequest.js";
import {
  getPatients,
  getPatientById,
  createPatient,
  updatePatient,
  deletePatient,
} from "./patientController.js";
import {
  patientIdParamSchema,
  getPatientsQuerySchema,
  createPatientSchema,
  updatePatientSchema,
} from "./patientValidation.js";

const router = Router();

// GET /api/v1/patients
router.get(
  "/",
  validateRequest({ query: getPatientsQuerySchema }),
  getPatients
);

// POST /api/v1/patients
router.post(
  "/",
  validateRequest({ body: createPatientSchema }),
  createPatient
);

// GET /api/v1/patients/:id
router.get(
  "/:id",
  validateRequest({ params: patientIdParamSchema }),
  getPatientById
);

// PUT /api/v1/patients/:id
router.put(
  "/:id",
  validateRequest({
    params: patientIdParamSchema,
    body: updatePatientSchema,
  }),
  updatePatient
);

// DELETE /api/v1/patients/:id
router.delete(
  "/:id",
  validateRequest({ params: patientIdParamSchema }),
  deletePatient
);

export default router;
