import { Router } from "express";
import validateRequest from "../../middleware/validateRequest.js";
import {
  getDoctors,
  getDoctorById,
  createDoctor,
  updateDoctor,
  getDoctorSchedule,
  updateDoctorSchedule,
} from "./doctorController.js";
import {
  doctorIdParamSchema,
  getDoctorsQuerySchema,
  createDoctorSchema,
  updateDoctorSchema,
  updateDoctorScheduleSchema,
} from "./doctorValidation.js";

const router = Router();

// GET /api/v1/doctors
router.get(
  "/",
  validateRequest({ query: getDoctorsQuerySchema }),
  getDoctors
);

// POST /api/v1/doctors
router.post(
  "/",
  validateRequest({ body: createDoctorSchema }),
  createDoctor
);

// GET /api/v1/doctors/:id
router.get(
  "/:id",
  validateRequest({ params: doctorIdParamSchema }),
  getDoctorById
);

// PUT /api/v1/doctors/:id
router.put(
  "/:id",
  validateRequest({
    params: doctorIdParamSchema,
    body: updateDoctorSchema,
  }),
  updateDoctor
);

// GET /api/v1/doctors/:id/schedule
router.get(
  "/:id/schedule",
  validateRequest({ params: doctorIdParamSchema }),
  getDoctorSchedule
);

// PUT /api/v1/doctors/:id/schedule
router.put(
  "/:id/schedule",
  validateRequest({
    params: doctorIdParamSchema,
    body: updateDoctorScheduleSchema,
  }),
  updateDoctorSchedule
);

export default router;

