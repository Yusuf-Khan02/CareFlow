import type { Request, Response, NextFunction } from "express";
import { pharmacyService } from "./pharmacyService.js";
import {
  createMedicineSchema,
  receiveStockSchema,
  dispenseStockSchema,
  getMedicinesQuerySchema,
  medicineIdParamSchema,
} from "./pharmacyValidation.js";

export const pharmacyController = {
  /**
   * List formulary medicines with stock levels & metrics.
   */
  async listMedicines(req: Request, res: Response, next: NextFunction) {
    try {
      const query = getMedicinesQuerySchema.parse(req.query);
      const result = await pharmacyService.listMedicines(query);

      res.status(200).json({
        success: true,
        data: result.medicines,
        metrics: result.metrics,
        pagination: result.pagination,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Get single medicine details with active batches and movement history.
   */
  async getMedicineById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = medicineIdParamSchema.parse({ id: req.params.id as string });
      const medicine = await pharmacyService.getMedicineById(id);

      res.status(200).json({
        success: true,
        data: medicine,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Add new medicine to formulary.
   */
  async createMedicine(req: Request, res: Response, next: NextFunction) {
    try {
      const payload = createMedicineSchema.parse(req.body);
      const created = await pharmacyService.createMedicine(payload);

      res.status(201).json({
        success: true,
        message: "Medicine added to hospital formulary successfully",
        data: created,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Receive inventory batch shipment.
   */
  async receiveStock(req: Request, res: Response, next: NextFunction) {
    try {
      const payload = receiveStockSchema.parse(req.body);
      const updated = await pharmacyService.receiveStock(payload);

      res.status(200).json({
        success: true,
        message: `Received ${payload.quantityReceived} units for ${updated.name}`,
        data: updated,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Dispense medication using FEFO batch deduction.
   */
  async dispenseStock(req: Request, res: Response, next: NextFunction) {
    try {
      const payload = dispenseStockSchema.parse(req.body);
      const updated = await pharmacyService.dispenseStock(payload);

      res.status(200).json({
        success: true,
        message: `Dispensed ${payload.quantity} units of ${updated.name}`,
        data: updated,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Get low-stock reorder alerts.
   */
  async getLowStockAlerts(_req: Request, res: Response, next: NextFunction) {
    try {
      const alerts = await pharmacyService.getLowStockAlerts();
      res.status(200).json({
        success: true,
        data: alerts,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Get pending prescriptions for pharmacy queue.
   */
  async getPendingPrescriptions(_req: Request, res: Response, next: NextFunction) {
    try {
      const prescriptions = await pharmacyService.getPendingPrescriptions();
      res.status(200).json({
        success: true,
        data: prescriptions,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Get audit ledger of inventory movements.
   */
  async getMovements(req: Request, res: Response, next: NextFunction) {
    try {
      const limit = req.query.limit ? Number(req.query.limit) : 50;
      const movements = await pharmacyService.getRecentMovements(limit);

      res.status(200).json({
        success: true,
        data: movements,
      });
    } catch (err) {
      next(err);
    }
  },
};
