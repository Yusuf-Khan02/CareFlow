import type { Request, Response, NextFunction } from "express";
import { patientService } from "./patientService.js";

/**
 * GET /api/v1/patients
 * List patients with pagination, search, status, and department filters.
 */
export const getPatients = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const query = {
      ...req.query,
      organizationId: (req.query.organizationId as string) || req.organizationId,
    };
    const result = await patientService.listPatients(query as any);
    res.json({
      success: true,
      data: result.patients,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/patients/:id
 * Retrieve single patient details with vitals, appointments, and encounters.
 */
export const getPatientById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const patientId = Number(req.params.id);
    const patient = await patientService.getPatientById(patientId);
    res.json({
      success: true,
      data: patient,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/patients
 * Register a new synthetic patient record.
 */
export const createPatient = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const patient = await patientService.createPatient(req.body);
    res.status(201).json({
      success: true,
      message: "Patient registered successfully",
      data: patient,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/v1/patients/:id
 * Update an existing patient record.
 */
export const updatePatient = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const patientId = Number(req.params.id);
    const patient = await patientService.updatePatient(patientId, req.body);
    res.json({
      success: true,
      message: "Patient updated successfully",
      data: patient,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/v1/patients/:id
 * Delete a patient record.
 */
export const deletePatient = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const patientId = Number(req.params.id);
    const result = await patientService.deletePatient(patientId);
    res.json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};
