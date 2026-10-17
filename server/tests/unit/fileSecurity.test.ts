import { describe, it } from "node:test";
import assert from "node:assert/strict";
import crypto from "crypto";
import {
  ALLOWED_MIME_TYPES,
  MAX_FILE_SIZE_BYTES,
  generateSignedToken,
  verifySignedToken,
} from "../../src/modules/files/fileConfig.js";

describe("File Security & Signed Download Tokens (HIPAA §164.312(b))", () => {
  it("should permit only medical and document MIME types", () => {
    const isAllowed = (mime: string) => ALLOWED_MIME_TYPES.includes(mime);

    // Allowed types
    assert.ok(isAllowed("application/pdf"));
    assert.ok(isAllowed("image/jpeg"));
    assert.ok(isAllowed("image/png"));
    assert.ok(isAllowed("image/webp"));
    assert.ok(isAllowed("application/dicom"));
    assert.ok(isAllowed("text/plain"));
    assert.ok(isAllowed("application/vnd.openxmlformats-officedocument.wordprocessingml.document"));

    // Dangerous / executable types rejected
    assert.ok(!isAllowed("application/x-msdownload"));
    assert.ok(!isAllowed("application/javascript"));
    assert.ok(!isAllowed("text/html"));
    assert.ok(!isAllowed("application/x-sh"));
    assert.ok(!isAllowed("application/octet-stream"));
  });

  it("should enforce a strict 10MB maximum file size quota", () => {
    assert.equal(MAX_FILE_SIZE_BYTES, 10 * 1024 * 1024);

    const validateSize = (bytes: number) => bytes <= MAX_FILE_SIZE_BYTES;

    assert.ok(validateSize(500 * 1024), "500KB should pass");
    assert.ok(validateSize(9.9 * 1024 * 1024), "9.9MB should pass");
    assert.ok(validateSize(10 * 1024 * 1024), "Exact 10MB should pass");
    assert.ok(!validateSize(10 * 1024 * 1024 + 1), "10MB + 1 byte must fail");
    assert.ok(!validateSize(25 * 1024 * 1024), "25MB must fail");
  });

  it("should accurately compute SHA-256 binary checksums for document integrity", () => {
    const sampleBinary = Buffer.from("CareFlow Synthetic Medical Record - Patient Confidential", "utf-8");
    const checksum = crypto.createHash("sha256").update(sampleBinary).digest("hex");

    assert.equal(checksum.length, 64);
    assert.match(checksum, /^[a-f0-9]{64}$/);

    // Verify determinism
    const rehashed = crypto.createHash("sha256").update(sampleBinary).digest("hex");
    assert.equal(checksum, rehashed);

    // Verify tampering alters the checksum
    const tampered = Buffer.from("CareFlow Synthetic Medical Record - Patient TAMPERED", "utf-8");
    const tamperedChecksum = crypto.createHash("sha256").update(tampered).digest("hex");
    assert.notEqual(checksum, tamperedChecksum);
  });

  it("should issue valid HMAC signed download tokens that verify correctly", () => {
    const fileId = "file-9988";
    const userId = "usr-doctor-davis";
    const organizationId = "org-careflow-central";

    const token = generateSignedToken(fileId, userId, organizationId, 900);
    assert.ok(typeof token === "string");
    assert.ok(token.split(".").length === 3, "Token must be a valid JWT with 3 parts");

    const decoded = verifySignedToken(token);
    assert.equal(decoded.fileId, fileId);
    assert.equal(decoded.userId, userId);
    assert.equal(decoded.organizationId, organizationId);
    assert.ok(decoded.exp > Math.floor(Date.now() / 1000));
  });

  it("should reject tampered or corrupted download tokens", () => {
    const token = generateSignedToken("file-1", "user-1", "org-1", 900);
    const tampered = token.slice(0, -6) + "XXXXXX";

    assert.throws(() => {
      verifySignedToken(tampered);
    });
  });
});
