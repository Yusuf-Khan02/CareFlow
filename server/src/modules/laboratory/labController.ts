import type { Request, Response, NextFunction } from "express";
import { labService } from "./labService.js";
import {
  createLabOrderSchema,
  updateLabOrderStatusSchema,
  enterLabResultsSchema,
  getLabOrdersQuerySchema,
  labOrderIdParamSchema,
} from "./labValidation.js";

export const labController = {
  /**
   * Get standard diagnostic test catalogue.
   */
  getCatalog(req: Request, res: Response, next: NextFunction) {
    try {
      const catalog = labService.getCatalog();
      res.status(200).json({
        success: true,
        data: catalog,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * List lab orders with metrics.
   */
  async listOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const query = getLabOrdersQuerySchema.parse(req.query);
      const result = await labService.listOrders(query);

      res.status(200).json({
        success: true,
        data: result.orders,
        metrics: result.metrics,
        pagination: result.pagination,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Get single lab order by ID.
   */
  async getOrderById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = labOrderIdParamSchema.parse({ id: req.params.id as string });
      const order = await labService.getOrderById(id);

      res.status(200).json({
        success: true,
        data: order,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Create new lab order.
   */
  async createOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const payload = createLabOrderSchema.parse(req.body);
      const created = await labService.createOrder(payload);

      res.status(201).json({
        success: true,
        message: "Diagnostic lab order created successfully",
        data: created,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Update lab order status.
   */
  async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = labOrderIdParamSchema.parse({ id: req.params.id as string });
      const payload = updateLabOrderStatusSchema.parse(req.body);
      const updated = await labService.updateOrderStatus(id, payload);

      res.status(200).json({
        success: true,
        message: `Lab order status updated to '${updated.status}'`,
        data: updated,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Enter verified biochemical results for order.
   */
  async enterResults(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = labOrderIdParamSchema.parse({ id: req.params.id as string });
      const payload = enterLabResultsSchema.parse(req.body);
      const updated = await labService.enterResults(id, payload);

      res.status(200).json({
        success: true,
        message: "Lab test results recorded and verified successfully",
        data: updated,
      });
    } catch (err) {
      next(err);
    }
  },
};
