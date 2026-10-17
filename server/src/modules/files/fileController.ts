import type { Request, Response, NextFunction } from "express";
import fs from "fs";
import { fileService } from "./fileService.js";
import { BadRequestError } from "../../utils/errors.js";

export const fileController = {
  /**
   * POST /api/v1/files/upload
   * Upload private clinical document or radiology image
   */
  async uploadFile(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        throw new BadRequestError("No file uploaded");
      }

      const { category, patientId, consultationId, labOrderId, description } = req.body;
      const organizationId = req.organizationId || "org-careflow-central";

      const uploaded = await fileService.saveUploadedFile(
        {
          originalname: req.file.originalname,
          mimetype: req.file.mimetype,
          size: req.file.size,
          buffer: req.file.buffer,
        },
        {
          category,
          patientId: patientId ? Number(patientId) : undefined,
          consultationId,
          labOrderId,
          description,
        },
        {
          id: req.user?.id || "sys-admin",
          name: req.user?.name || "Staff Member",
        },
        organizationId
      );

      res.status(201).json({
        success: true,
        message: `File '${uploaded.originalName}' encrypted and stored in private clinical storage`,
        data: uploaded,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/v1/files
   * List files with filters
   */
  async listFiles(req: Request, res: Response, next: NextFunction) {
    try {
      const { patientId, category, search, limit, offset } = req.query;
      const organizationId = req.organizationId || (req.query.organizationId as string);

      const result = await fileService.listFiles({
        organizationId,
        patientId: patientId ? Number(patientId) : undefined,
        category: category as string,
        search: search as string,
        limit: limit ? Number(limit) : 50,
        offset: offset ? Number(offset) : 0,
      });

      res.status(200).json({
        success: true,
        data: result.files,
        total: result.total,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/v1/files/:id/signed-url
   * Generate short-lived signed download token
   */
  async getSignedUrl(req: Request, res: Response, next: NextFunction) {
    try {
      const fileId = req.params.id as string;
      const userId = req.user?.id || "sys-user";
      const organizationId = req.organizationId || "org-careflow-central";

      const signed = await fileService.generateSignedDownloadUrl(fileId, userId, organizationId);
      res.status(200).json({
        success: true,
        data: signed,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/v1/files/download/:token
   * Stream file from private storage with cryptographic signature check
   */
  async downloadFile(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.params.token as string;
      const fileInfo = await fileService.verifyAndStreamFile(
        token,
        req.ip,
        req.headers["user-agent"]
      );

      res.setHeader("Content-Type", fileInfo.mimeType);
      res.setHeader(
        "Content-Disposition",
        `inline; filename="${encodeURIComponent(fileInfo.originalName)}"`
      );
      res.setHeader("Content-Length", fileInfo.sizeBytes);

      const stream = fs.createReadStream(fileInfo.filePath);
      stream.pipe(res);
    } catch (err) {
      next(err);
    }
  },

  /**
   * DELETE /api/v1/files/:id
   * Securely delete file
   */
  async deleteFile(req: Request, res: Response, next: NextFunction) {
    try {
      const fileId = req.params.id as string;
      const organizationId = req.organizationId || "org-careflow-central";
      const userId = req.user?.id || "sys-user";

      const result = await fileService.deleteFile(fileId, organizationId, userId);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/v1/files/metrics
   * Storage usage metrics
   */
  async getMetrics(req: Request, res: Response, next: NextFunction) {
    try {
      const organizationId = req.organizationId || (req.query.organizationId as string);
      const metrics = await fileService.getStorageMetrics(organizationId);
      res.status(200).json({
        success: true,
        data: metrics,
      });
    } catch (err) {
      next(err);
    }
  },
};

export default fileController;
