import { Router } from "express";
import { pharmacyController } from "./pharmacyController.js";

const router = Router();

// Medicines / Formulary
router.get("/medicines", pharmacyController.listMedicines);
router.get("/medicines/:id", pharmacyController.getMedicineById);
router.post("/medicines", pharmacyController.createMedicine);

// Stock Operations
router.post("/receive", pharmacyController.receiveStock);
router.post("/dispense", pharmacyController.dispenseStock);
router.get("/low-stock", pharmacyController.getLowStockAlerts);
router.get("/prescriptions/pending", pharmacyController.getPendingPrescriptions);
router.get("/movements", pharmacyController.getMovements);

// Direct shortcut endpoints for /api/v1/medicines and /api/v1/inventory
router.get("/", pharmacyController.listMedicines);
router.get("/:id", pharmacyController.getMedicineById);
router.post("/", pharmacyController.createMedicine);

export default router;
