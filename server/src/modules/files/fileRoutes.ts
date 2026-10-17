import { Router } from "express";
import multer from "multer";
import { fileController } from "./fileController.js";
import { authenticate, authorizeRoles } from "../../middleware/authMiddleware.js";
import { ALLOWED_MIME_TYPES, MAX_FILE_SIZE_BYTES } from "./fileConfig.js";
import { BadRequestError } from "../../utils/errors.js";

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE_BYTES },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new BadRequestError(
          `Unsupported file format '${file.mimetype}'. Allowed formats: PDF, PNG, JPEG, WEBP, TXT, DICOM, DOCX`
        )
      );
    }
  },
});

/**
 * Storage metrics
 */
router.get("/metrics", authenticate, fileController.getMetrics);

/**
 * List files with filters
 */
router.get("/", authenticate, fileController.listFiles);

/**
 * Upload private medical file
 */
router.post(
  "/upload",
  authenticate,
  upload.single("file"),
  fileController.uploadFile
);

/**
 * Generate short-lived signed download URL (15 mins)
 */
router.get("/:id/signed-url", authenticate, fileController.getSignedUrl);

/**
 * Secure stream download using signed token (Token-authenticated)
 */
router.get("/download/:token", fileController.downloadFile);

/**
 * Delete medical file (Admin & Doctor clearance)
 */
router.delete(
  "/:id",
  authenticate,
  authorizeRoles("Admin", "Hospital Admin", "Doctor"),
  fileController.deleteFile
);

export default router;
