import { Router } from "express";
import { getHealth } from "./healthController.js";

const router = Router();

// GET /api/v1/health & GET /health
router.get("/", getHealth);

export default router;
