import { Router } from "express";
import { auditController } from "./auditController.js";

export const auditRoutes = Router();

auditRoutes.get("/", auditController.getAuditLogs);
auditRoutes.post("/", auditController.logEvent);
auditRoutes.get("/export", auditController.exportAuditLogsCSV);

export default auditRoutes;
