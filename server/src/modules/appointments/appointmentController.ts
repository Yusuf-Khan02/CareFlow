import type { Request, Response, NextFunction } from "express";
import { appointmentService } from "./appointmentService.js";

/**
 * GET /api/v1/appointments
 * List appointments with filters.
 */
export const getAppointments = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await appointmentService.listAppointments(req.query as any);
    res.json({
      success: true,
      data: result.appointments,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/appointments/:id
 * Retrieve single appointment record.
 */
export const getAppointmentById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const appointment = await appointmentService.getAppointmentById(req.params.id as string);
    res.json({
      success: true,
      data: appointment,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/appointments
 * Book a new clinical appointment.
 */
export const createAppointment = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const newAppointment = await appointmentService.createAppointment(req.body);
    res.status(201).json({
      success: true,
      message: "Appointment booked successfully",
      data: newAppointment,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/v1/appointments/:id
 * Reschedule or update appointment details.
 */
export const updateAppointment = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const updated = await appointmentService.updateAppointment(req.params.id as string, req.body);
    res.json({
      success: true,
      message: "Appointment updated successfully",
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/v1/appointments/:id/status
 * Transition appointment status (Scheduled -> Confirmed -> Checked-in -> In-Progress -> Completed).
 */
export const updateAppointmentStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { status, notes } = req.body;
    const updated = await appointmentService.updateAppointmentStatus(
      req.params.id as string,
      status,
      notes
    );
    res.json({
      success: true,
      message: `Appointment status updated to ${status}`,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/v1/appointments/:id/cancel
 * Cancel an appointment with optional reason.
 */
export const cancelAppointment = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { reason } = req.body || {};
    const updated = await appointmentService.cancelAppointment(req.params.id as string, reason);
    res.json({
      success: true,
      message: "Appointment cancelled successfully",
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/appointments/slots/:doctorId
 * Query real-time available consultation slots for a doctor on a specific date.
 */
export const getDoctorAvailableSlots = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const doctorId = Number(req.params.doctorId);
    const date = req.query.date as string;
    const slotsData = await appointmentService.getDoctorAvailableSlots(doctorId, date);
    res.json({
      success: true,
      data: slotsData,
    });
  } catch (error) {
    next(error);
  }
};
