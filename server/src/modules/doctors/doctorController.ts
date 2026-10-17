import type { Request, Response, NextFunction } from "express";
import { doctorService } from "./doctorService.js";

/**
 * GET /api/v1/doctors
 * List doctors and clinical staff with filters.
 */
export const getDoctors = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const doctors = await doctorService.listDoctors(req.query as any);
    res.json({
      success: true,
      data: doctors,
      count: doctors.length,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/doctors/:id
 * Retrieve physician details with weekly rota schedule.
 */
export const getDoctorById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const doctorId = Number(req.params.id);
    const doctor = await doctorService.getDoctorById(doctorId);
    res.json({
      success: true,
      data: doctor,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/doctors
 * Create a new clinical staff profile.
 */
export const createDoctor = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const doctor = await doctorService.createDoctor(req.body);
    res.status(201).json({
      success: true,
      message: "Doctor profile created successfully",
      data: doctor,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/v1/doctors/:id
 * Update an existing doctor profile and schedule.
 */
export const updateDoctor = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const doctorId = Number(req.params.id);
    const doctor = await doctorService.updateDoctor(doctorId, req.body);
    res.json({
      success: true,
      message: "Doctor profile updated successfully",
      data: doctor,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/doctors/:id/schedule
 * Retrieve doctor's weekly rota schedule.
 */
export const getDoctorSchedule = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const doctorId = Number(req.params.id);
    const scheduleData = await doctorService.getDoctorSchedule(doctorId);
    res.json({
      success: true,
      data: scheduleData,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/v1/doctors/:id/schedule
 * Update doctor's weekly rota schedule.
 */
export const updateDoctorSchedule = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const doctorId = Number(req.params.id);
    const updated = await doctorService.updateDoctorSchedule(
      doctorId,
      req.body.schedule
    );
    res.json({
      success: true,
      message: "Doctor schedule updated successfully",
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};
