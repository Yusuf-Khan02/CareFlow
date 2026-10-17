import { Router } from "express";
import { labController } from "./labController.js";

const router = Router();

// Test Catalogue
router.get("/catalog", labController.getCatalog);

// Lab Orders
router.get("/orders", labController.listOrders);
router.get("/orders/:id", labController.getOrderById);
router.post("/orders", labController.createOrder);
router.patch("/orders/:id/status", labController.updateStatus);
router.post("/orders/:id/results", labController.enterResults);

// Direct shortcuts for /api/v1/lab-orders
router.get("/", labController.listOrders);
router.get("/:id", labController.getOrderById);
router.post("/", labController.createOrder);
router.patch("/:id/status", labController.updateStatus);
router.post("/:id/results", labController.enterResults);

export default router;
