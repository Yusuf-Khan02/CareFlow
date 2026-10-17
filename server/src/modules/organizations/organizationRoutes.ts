import { Router } from "express";
import { organizationController } from "./organizationController.js";

export const organizationRoutes = Router();

organizationRoutes.get("/", organizationController.listOrganizations);
organizationRoutes.post("/", organizationController.createOrganization);
organizationRoutes.get("/:id", organizationController.getOrganizationById);
organizationRoutes.put("/:id", organizationController.updateOrganization);

export default organizationRoutes;
