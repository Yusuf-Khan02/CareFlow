import type { Request, Response, NextFunction } from "express";
import { encounterService } from "./encounterService.js";

/**
 * GET /api/v1/consultations
 * List patient consultations and encounter notes.
 */
export const getConsultations = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await encounterService.listConsultations(req.query as any);
    res.json({
      success: true,
      data: result.consultations,
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
 * GET /api/v1/consultations/:id
 * Retrieve single consultation encounter by UUID.
 */
export const getConsultationById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const consultation = await encounterService.getConsultationById(req.params.id as string);
    res.json({
      success: true,
      data: consultation,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/consultations
 * Create clinical encounter, record SOAP notes, and generate prescriptions.
 */
export const createConsultation = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const newConsultation = await encounterService.createConsultation(req.body);
    res.status(201).json({
      success: true,
      message: "Consultation documented and signed successfully",
      data: newConsultation,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/v1/consultations/:id
 * Update clinical encounter notes.
 */
export const updateConsultation = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const updated = await encounterService.updateConsultation(
      req.params.id as string,
      req.body
    );
    res.json({
      success: true,
      message: "Consultation updated successfully",
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/v1/consultations/:id/complete
 * Mark consultation complete.
 */
export const completeConsultation = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const consultation = await encounterService.getConsultationById(req.params.id as string);
    res.json({
      success: true,
      message: "Consultation marked completed",
      data: consultation,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/prescriptions
 * List prescriptions with filters.
 */
export const getPrescriptions = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const prescriptions = await encounterService.listPrescriptions(req.query as any);
    res.json({
      success: true,
      data: prescriptions,
      total: prescriptions.length,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/prescriptions
 * Issue a standalone or consultation prescription.
 */
export const createPrescription = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const prescription = await encounterService.createPrescription(req.body);
    res.status(201).json({
      success: true,
      message: "Prescription issued successfully",
      data: prescription,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/v1/prescriptions/:id/cancel
 * Cancel an issued prescription.
 */
export const cancelPrescription = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const cancelled = await encounterService.cancelPrescription(req.params.id as string);
    res.json({
      success: true,
      message: "Prescription cancelled",
      data: cancelled,
    });
  } catch (error) {
    next(error);
  }
};
