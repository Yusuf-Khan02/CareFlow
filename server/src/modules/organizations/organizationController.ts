import type { Request, Response, NextFunction } from "express";
import { organizationService } from "./organizationService.js";

export const organizationController = {
  /**
   * GET /api/v1/organizations
   */
  async listOrganizations(req: Request, res: Response, next: NextFunction) {
    try {
      const orgs = await organizationService.listOrganizations();
      res.status(200).json({
        success: true,
        data: orgs,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/v1/organizations/:id
   */
  async getOrganizationById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const org = await organizationService.getOrganizationById(id);
      res.status(200).json({
        success: true,
        data: org,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/v1/organizations
   */
  async createOrganization(req: Request, res: Response, next: NextFunction) {
    try {
      const org = await organizationService.createOrganization(req.body);
      res.status(201).json({
        success: true,
        data: org,
        message: `Tenant hospital '${org.name}' created successfully`,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * PUT /api/v1/organizations/:id
   */
  async updateOrganization(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const updated = await organizationService.updateOrganization(id, req.body);
      res.status(200).json({
        success: true,
        data: updated,
        message: `Organization '${updated.name}' updated successfully`,
      });
    } catch (err) {
      next(err);
    }
  },
};

export default organizationController;
