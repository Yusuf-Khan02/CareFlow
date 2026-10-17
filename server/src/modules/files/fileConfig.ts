import path from "path";
import jwt from "jsonwebtoken";
import ENV from "../../config/env.js";

export const STORAGE_DIR = path.resolve(process.cwd(), "storage", "private");

export const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "text/plain",
  "application/dicom",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

export interface SignedFileTokenPayload {
  fileId: string;
  userId: string;
  organizationId: string;
  exp: number; // unix timestamp
}

/**
 * Generate a cryptographically signed, short-lived download token (15 mins)
 */
export const generateSignedToken = (
  fileId: string,
  userId: string,
  organizationId: string,
  expiresInSeconds = 900 // 15 minutes
): string => {
  return jwt.sign(
    {
      fileId,
      userId,
      organizationId,
    },
    ENV.JWT_SECRET,
    {
      expiresIn: expiresInSeconds,
    }
  );
};

/**
 * Verify a short-lived download token
 */
export const verifySignedToken = (token: string): SignedFileTokenPayload => {
  return jwt.verify(token, ENV.JWT_SECRET) as SignedFileTokenPayload;
};
