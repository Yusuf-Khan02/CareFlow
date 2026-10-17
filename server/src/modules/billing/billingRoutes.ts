import { Router } from "express";
import { billingController } from "./billingController.js";

// 1. Billing Router (mounted at /api/v1/billing)
export const billingRoutes = Router();

// Metrics & Reports shortcuts
billingRoutes.get("/metrics", billingController.getBillingMetrics);
billingRoutes.get("/reports", billingController.getReportsOverview);
billingRoutes.get("/export", billingController.exportInvoicesCSV);

// Payments
billingRoutes.get("/payments", billingController.getPayments);
billingRoutes.post("/payments", billingController.recordPayment);

// Invoices CRUD & actions
billingRoutes.get("/invoices", billingController.getInvoices);
billingRoutes.post("/invoices", billingController.createInvoice);
billingRoutes.get("/invoices/:id", billingController.getInvoiceById);
billingRoutes.post("/invoices/:id/payments", billingController.recordPayment);
billingRoutes.post("/invoices/:id/cancel", billingController.cancelInvoice);

// Router root aliases
billingRoutes.get("/", billingController.getInvoices);
billingRoutes.post("/", billingController.createInvoice);
billingRoutes.get("/:id", billingController.getInvoiceById);

// 2. Reports Router (mounted at /api/v1/reports)
export const reportRoutes = Router();
reportRoutes.get("/", billingController.getReportsOverview);
reportRoutes.get("/overview", billingController.getReportsOverview);
reportRoutes.get("/export", billingController.exportInvoicesCSV);

export default billingRoutes;
