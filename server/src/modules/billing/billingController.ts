import type { Request, Response, NextFunction } from "express";
import { billingService } from "./billingService.js";
import {
  createInvoiceSchema,
  recordPaymentSchema,
  getInvoicesQuerySchema,
  invoiceIdParamSchema,
} from "./billingValidation.js";

export const billingController = {
  /**
   * GET /api/v1/billing/metrics
   */
  async getBillingMetrics(req: Request, res: Response, next: NextFunction) {
    try {
      const metrics = await billingService.getBillingMetrics();
      res.status(200).json({
        success: true,
        data: metrics,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/v1/billing/invoices
   */
  async getInvoices(req: Request, res: Response, next: NextFunction) {
    try {
      const query = getInvoicesQuerySchema.parse(req.query);
      const result = await billingService.getInvoices(query);
      res.status(200).json({
        success: true,
        data: result.invoices,
        meta: {
          total: result.total,
          limit: result.limit,
          offset: result.offset,
        },
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/v1/billing/invoices/:id
   */
  async getInvoiceById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = invoiceIdParamSchema.parse({ id: req.params.id as string });
      const invoice = await billingService.getInvoiceById(id);
      res.status(200).json({
        success: true,
        data: invoice,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/v1/billing/invoices
   */
  async createInvoice(req: Request, res: Response, next: NextFunction) {
    try {
      const data = createInvoiceSchema.parse(req.body);
      const invoice = await billingService.createInvoice(data);
      res.status(201).json({
        success: true,
        data: invoice,
        message: `Invoice ${invoice.invoiceNumber} generated successfully`,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/v1/billing/payments (or /api/v1/billing/invoices/:id/payments)
   */
  async recordPayment(req: Request, res: Response, next: NextFunction) {
    try {
      const invoiceId = (req.params.id as string) || (req.body.invoiceId as string);
      const data = recordPaymentSchema.parse({
        ...req.body,
        invoiceId,
      });

      const result = await billingService.recordPayment(data);
      res.status(201).json({
        success: true,
        data: result,
        message: `Payment receipt ${result.payment.receiptNumber} recorded for $${result.payment.amount}`,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/v1/billing/invoices/:id/cancel
   */
  async cancelInvoice(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = invoiceIdParamSchema.parse({ id: req.params.id as string });
      const reason = req.body?.reason as string | undefined;
      const cancelled = await billingService.cancelInvoice(id, reason);
      res.status(200).json({
        success: true,
        data: cancelled,
        message: `Invoice ${cancelled.invoiceNumber} has been cancelled`,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/v1/billing/payments
   */
  async getPayments(req: Request, res: Response, next: NextFunction) {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
      const payments = await billingService.getPayments(limit);
      res.status(200).json({
        success: true,
        data: payments,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/v1/reports/overview (and /api/v1/billing/reports)
   */
  async getReportsOverview(req: Request, res: Response, next: NextFunction) {
    try {
      const reports = await billingService.getReportsOverview();
      res.status(200).json({
        success: true,
        data: reports,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/v1/billing/export (and /api/v1/reports/export)
   */
  async exportInvoicesCSV(req: Request, res: Response, next: NextFunction) {
    try {
      const csv = await billingService.exportInvoicesCSV();
      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="careflow_invoices_${new Date().toISOString().split("T")[0]}.csv"`
      );
      res.status(200).send(csv);
    } catch (err) {
      next(err);
    }
  },
};

export default billingController;
