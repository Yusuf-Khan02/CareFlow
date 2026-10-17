import type { Request, Response, NextFunction } from "express";
import { bedService } from "./bedService.js";
import {
  admitPatientSchema,
  transferBedSchema,
  dischargePatientSchema,
  updateBedStatusSchema,
  getBedsQuerySchema,
  getAdmissionsQuerySchema,
  bedIdParamSchema,
  admissionIdParamSchema,
} from "./bedValidation.js";
import { broadcastBedUpdate } from "../../realtime/socketService.js";

export const bedController = {
  /**
   * GET /api/v1/wards (or /api/v1/beds/wards)
   * Get ward statistics and hospital occupancy summary.
   */
  async getWardsSummary(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await bedService.getWardsSummary();
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/v1/beds
   * List beds with ward, room, and current occupant info.
   */
  async getBeds(req: Request, res: Response, next: NextFunction) {
    try {
      const query = getBedsQuerySchema.parse(req.query);
      const beds = await bedService.getBeds(query);
      res.status(200).json({
        success: true,
        data: beds,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/v1/beds/available
   * Quick list of available beds for admission/transfer selectors.
   */
  async getAvailableBeds(req: Request, res: Response, next: NextFunction) {
    try {
      const wardId = req.query.wardId as string | undefined;
      const beds = await bedService.getAvailableBeds(wardId);
      res.status(200).json({
        success: true,
        data: beds,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/v1/admissions (or /api/v1/beds/admit)
   * Admit patient into an available bed.
   */
  async admitPatient(req: Request, res: Response, next: NextFunction) {
    try {
      const data = admitPatientSchema.parse(req.body);
      const admission = await bedService.admitPatient(data);
      const orgId = req.organizationId || "org-careflow-central";
      broadcastBedUpdate(orgId, "admitted", admission);

      res.status(201).json({
        success: true,
        data: admission,
        message: `Patient admitted successfully to bed ${admission.bed?.bedNumber}`,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/v1/admissions/:id/transfer
   * Transfer patient to another available bed.
   */
  async transferPatient(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = admissionIdParamSchema.parse({ id: req.params.id as string });
      const data = transferBedSchema.parse(req.body);
      const updated = await bedService.transferPatient(id, data);
      const orgId = req.organizationId || "org-careflow-central";
      broadcastBedUpdate(orgId, "transferred", updated);

      res.status(200).json({
        success: true,
        data: updated,
        message: `Patient transferred successfully to ${updated.bed?.bedNumber}`,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/v1/admissions/:id/discharge
   * Discharge patient from hospital.
   */
  async dischargePatient(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = admissionIdParamSchema.parse({ id: req.params.id as string });
      const data = dischargePatientSchema.parse(req.body);
      const updated = await bedService.dischargePatient(id, data);
      const orgId = req.organizationId || "org-careflow-central";
      broadcastBedUpdate(orgId, "discharged", updated);

      res.status(200).json({
        success: true,
        data: updated,
        message: "Patient discharged successfully. Bed marked for cleaning.",
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * PATCH /api/v1/beds/:id/status
   * Direct bed status update (Available, Cleaning, Maintenance, Reserved).
   */
  async updateBedStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = bedIdParamSchema.parse({ id: req.params.id as string });
      const { status } = updateBedStatusSchema.parse(req.body);
      const updated = await bedService.updateBedStatus(id, status);
      const orgId = req.organizationId || "org-careflow-central";
      broadcastBedUpdate(orgId, "status_changed", updated);

      res.status(200).json({
        success: true,
        data: updated,
        message: `Bed ${updated.bedNumber} status updated to ${status}`,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/v1/admissions
   * List inpatient admissions (Admitted, Discharged, Transferred).
   */
  async getAdmissions(req: Request, res: Response, next: NextFunction) {
    try {
      const query = getAdmissionsQuerySchema.parse(req.query);
      const admissions = await bedService.getAdmissions(query);
      res.status(200).json({
        success: true,
        data: admissions,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/v1/admissions/:id
   * Get single admission with stay history.
   */
  async getAdmissionById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = admissionIdParamSchema.parse({ id: req.params.id as string });
      const admission = await bedService.getAdmissionById(id);
      res.status(200).json({
        success: true,
        data: admission,
      });
    } catch (err) {
      next(err);
    }
  },
};
