import { Router } from "express";
import validateRequest from "../../middleware/validateRequest.js";
import {
  getAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointment,
  updateAppointmentStatus,
  cancelAppointment,
  getDoctorAvailableSlots,
} from "./appointmentController.js";
import {
  createAppointmentSchema,
  updateAppointmentSchema,
  updateAppointmentStatusSchema,
  cancelAppointmentSchema,
  getAppointmentsQuerySchema,
  appointmentIdParamSchema,
  availableSlotsQuerySchema,
} from "./appointmentValidation.js";

const router = Router();

// GET /api/v1/appointments - List appointments
router.get(
  "/",
  validateRequest({ query: getAppointmentsQuerySchema }),
  getAppointments
);

// GET /api/v1/appointments/slots/:doctorId - Query doctor's available slots on date
router.get(
  "/slots/:doctorId",
  validateRequest({ query: availableSlotsQuerySchema }),
  getDoctorAvailableSlots
);

// POST /api/v1/appointments - Book appointment
router.post(
  "/",
  validateRequest({ body: createAppointmentSchema }),
  createAppointment
);

// GET /api/v1/appointments/:id - Single appointment
router.get(
  "/:id",
  validateRequest({ params: appointmentIdParamSchema }),
  getAppointmentById
);

// PUT /api/v1/appointments/:id - Reschedule or update appointment
router.put(
  "/:id",
  validateRequest({
    params: appointmentIdParamSchema,
    body: updateAppointmentSchema,
  }),
  updateAppointment
);

// PATCH /api/v1/appointments/:id/status - Update appointment status
router.patch(
  "/:id/status",
  validateRequest({
    params: appointmentIdParamSchema,
    body: updateAppointmentStatusSchema,
  }),
  updateAppointmentStatus
);

// PATCH /api/v1/appointments/:id/cancel - Cancel appointment
router.patch(
  "/:id/cancel",
  validateRequest({
    params: appointmentIdParamSchema,
    body: cancelAppointmentSchema,
  }),
  cancelAppointment
);

export default router;
