import fs from "fs";
import path from "path";
import crypto from "crypto";
import prisma from "../../config/db.js";
import { STORAGE_DIR, generateSignedToken, verifySignedToken } from "./fileConfig.js";
import { NotFoundError, ForbiddenError, BadRequestError } from "../../utils/errors.js";
import { auditService } from "../audit/auditService.js";

export interface UploadFileMetadata {
  category?: string;
  patientId?: number;
  consultationId?: string;
  labOrderId?: string;
  description?: string;
}

export const fileService = {
  /**
   * Save an uploaded file to private storage and record in database
   */
  async saveUploadedFile(
    file: {
      originalname: string;
      mimetype: string;
      size: number;
      buffer: Buffer;
    },
    meta: UploadFileMetadata,
    user: { id: string; name: string },
    organizationId: string
  ) {
    if (!file || !file.buffer) {
      throw new BadRequestError("No file buffer provided for upload");
    }

    // Ensure storage directory exists
    if (!fs.existsSync(STORAGE_DIR)) {
      fs.mkdirSync(STORAGE_DIR, { recursive: true });
    }

    const ext = path.extname(file.originalname) || "";
    const storageKey = `${crypto.randomUUID()}${ext}`;
    const destinationPath = path.join(STORAGE_DIR, storageKey);

    // Compute SHA-256 checksum for cryptographic data integrity
    const checksum = crypto.createHash("sha256").update(file.buffer).digest("hex");

    // Write file to private disk
    await fs.promises.writeFile(destinationPath, file.buffer);

    // Record metadata in database
    const medicalFile = await prisma.medicalFile.create({
      data: {
        originalName: file.originalname,
        storageKey,
        mimeType: file.mimetype,
        sizeBytes: file.size,
        category: meta.category || "ClinicalNote",
        checksum,
        patientId: meta.patientId ? Number(meta.patientId) : null,
        consultationId: meta.consultationId || null,
        labOrderId: meta.labOrderId || null,
        description: meta.description || null,
        uploadedById: user.id,
        organizationId,
      },
      include: {
        patient: {
          select: { id: true, name: true, mrn: true },
        },
        uploadedBy: {
          select: { id: true, name: true, role: true },
        },
      },
    });

    // Record immutable audit event
    await auditService.logEvent({
      userId: user.id,
      organizationId,
      action: "CREATE",
      entityName: "MedicalFile",
      entityId: medicalFile.id,
      details: JSON.stringify({
        originalName: medicalFile.originalName,
        category: medicalFile.category,
        sizeBytes: medicalFile.sizeBytes,
        checksum: medicalFile.checksum,
        patientId: medicalFile.patientId,
      }),
    });

    return medicalFile;
  },

  /**
   * List files with tenant scoping and multi-column filtering
   */
  async listFiles(filters: {
    organizationId?: string;
    patientId?: number;
    category?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }) {
    const where: any = {};

    if (filters.organizationId && filters.organizationId !== "all") {
      where.organizationId = filters.organizationId;
    }
    if (filters.patientId) {
      where.patientId = Number(filters.patientId);
    }
    if (filters.category && filters.category !== "ALL") {
      where.category = filters.category;
    }
    if (filters.search) {
      where.OR = [
        { originalName: { contains: filters.search } },
        { description: { contains: filters.search } },
      ];
    }

    const [files, total] = await Promise.all([
      prisma.medicalFile.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: filters.limit || 50,
        skip: filters.offset || 0,
        include: {
          patient: {
            select: { id: true, name: true, mrn: true },
          },
          uploadedBy: {
            select: { id: true, name: true, role: true },
          },
          organization: {
            select: { id: true, name: true, code: true },
          },
        },
      }),
      prisma.medicalFile.count({ where }),
    ]);

    return { files, total };
  },

  /**
   * Get single file record by ID
   */
  async getFileById(id: string, organizationId?: string) {
    const file = await prisma.medicalFile.findUnique({
      where: { id },
      include: {
        patient: { select: { id: true, name: true, mrn: true } },
        uploadedBy: { select: { id: true, name: true, role: true } },
        organization: { select: { id: true, name: true, code: true } },
      },
    });

    if (!file) {
      throw new NotFoundError(`Medical file #${id} not found`);
    }

    if (organizationId && organizationId !== "all" && file.organizationId !== organizationId) {
      throw new ForbiddenError("Cross-tenant file access prohibited");
    }

    return file;
  },

  /**
   * Generate a secure, short-lived signed download URL
   */
  async generateSignedDownloadUrl(fileId: string, userId: string, organizationId: string) {
    const file = await this.getFileById(fileId, organizationId);
    const token = generateSignedToken(file.id, userId, file.organizationId, 900); // 15 mins

    return {
      fileId: file.id,
      originalName: file.originalName,
      signedUrl: `/api/v1/files/download/${token}`,
      token,
      expiresInSeconds: 900,
    };
  },

  /**
   * Verify signed token and stream private file content with audit logging
   */
  async verifyAndStreamFile(token: string, ipAddress?: string, userAgent?: string) {
    let payload;
    try {
      payload = verifySignedToken(token);
    } catch {
      throw new ForbiddenError("Invalid or expired download signature");
    }

    const file = await prisma.medicalFile.findUnique({
      where: { id: payload.fileId },
    });

    if (!file) {
      throw new NotFoundError("Requested medical file record no longer exists");
    }

    const filePath = path.join(STORAGE_DIR, file.storageKey);
    if (!fs.existsSync(filePath)) {
      throw new NotFoundError("File binary asset missing from private storage disk");
    }

    // Increment download counter
    await prisma.medicalFile.update({
      where: { id: file.id },
      data: { downloadCount: { increment: 1 } },
    });

    // Audit log access event for HIPAA compliance
    await auditService.logEvent({
      userId: payload.userId,
      organizationId: file.organizationId,
      action: "EXPORT",
      entityName: "MedicalFile",
      entityId: file.id,
      details: JSON.stringify({
        originalName: file.originalName,
        category: file.category,
        downloadCount: file.downloadCount + 1,
        downloadType: "SignedURL",
      }),
      ipAddress,
      userAgent,
    });

    return {
      filePath,
      originalName: file.originalName,
      mimeType: file.mimeType,
      sizeBytes: file.sizeBytes,
    };
  },

  /**
   * Delete file from disk and database with audit logging
   */
  async deleteFile(id: string, organizationId: string, userId: string) {
    const file = await this.getFileById(id, organizationId);

    const filePath = path.join(STORAGE_DIR, file.storageKey);
    if (fs.existsSync(filePath)) {
      try {
        await fs.promises.unlink(filePath);
      } catch (err) {
        console.warn(`Failed to delete disk file ${filePath}:`, err);
      }
    }

    await prisma.medicalFile.delete({
      where: { id },
    });

    // Record audit deletion
    await auditService.logEvent({
      userId,
      organizationId: file.organizationId,
      action: "DELETE",
      entityName: "MedicalFile",
      entityId: id,
      details: JSON.stringify({
        originalName: file.originalName,
        category: file.category,
        checksum: file.checksum,
      }),
    });

    return { success: true, message: `Medical file '${file.originalName}' deleted.` };
  },

  /**
   * Compute private storage metrics
   */
  async getStorageMetrics(organizationId?: string) {
    const where: any = {};
    if (organizationId && organizationId !== "all") {
      where.organizationId = organizationId;
    }

    const files = await prisma.medicalFile.findMany({
      where,
      select: { category: true, sizeBytes: true },
    });

    const totalFiles = files.length;
    const totalBytes = files.reduce((acc, f) => acc + f.sizeBytes, 0);

    const byCategory: Record<string, number> = {};
    files.forEach((f) => {
      byCategory[f.category] = (byCategory[f.category] || 0) + 1;
    });

    return {
      totalFiles,
      totalBytes,
      totalMegaBytes: Number((totalBytes / (1024 * 1024)).toFixed(2)),
      byCategory,
    };
  },
};

export default fileService;
