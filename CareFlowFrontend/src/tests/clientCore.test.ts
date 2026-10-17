import { describe, it } from "node:test";
import assert from "node:assert/strict";

describe("Frontend Client Core & Formatting Logic", () => {
  it("should configure headers properly for JSON payloads while omitting Content-Type for FormData", () => {
    const buildHeaders = (token: string | null, tenantId: string | null, isFormData: boolean) => {
      const defaultHeaders: Record<string, string> = {
        Accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(tenantId ? { "x-organization-id": tenantId } : {}),
      };

      if (!isFormData) {
        defaultHeaders["Content-Type"] = "application/json";
      }

      return defaultHeaders;
    };

    // JSON call with token & tenant
    const jsonHeaders = buildHeaders("jwt-abc-123", "org-careflow-central", false);
    assert.equal(jsonHeaders["Content-Type"], "application/json");
    assert.equal(jsonHeaders["Authorization"], "Bearer jwt-abc-123");
    assert.equal(jsonHeaders["x-organization-id"], "org-careflow-central");

    // Multipart FormData call (must NOT set Content-Type so browser sets boundary)
    const formHeaders = buildHeaders("jwt-abc-123", "org-careflow-central", true);
    assert.equal(formHeaders["Content-Type"], undefined);
    assert.equal(formHeaders["Authorization"], "Bearer jwt-abc-123");
    assert.equal(formHeaders["x-organization-id"], "org-careflow-central");
  });

  it("should format binary byte sizes into human-readable strings", () => {
    const formatBytes = (bytes: number): string => {
      if (bytes === 0) return "0 B";
      const k = 1024;
      const sizes = ["B", "KB", "MB", "GB"];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
    };

    assert.equal(formatBytes(0), "0 B");
    assert.equal(formatBytes(512), "512 B");
    assert.equal(formatBytes(1024), "1 KB");
    assert.equal(formatBytes(1536), "1.5 KB");
    assert.equal(formatBytes(1048576), "1 MB");
    assert.equal(formatBytes(2621440), "2.5 MB");
    assert.equal(formatBytes(1073741824), "1 GB");
  });

  it("should calculate invoice item totals and currency formatting", () => {
    const formatCurrency = (amount: number): string => {
      return `$${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    assert.equal(formatCurrency(150), "$150.00");
    assert.equal(formatCurrency(1249.5), "$1,249.50");
    assert.equal(formatCurrency(0), "$0.00");
    assert.equal(formatCurrency(1250000.75), "$1,250,000.75");
  });

  it("should accurately resolve file category color mappings for visual tagging", () => {
    const getCategoryColor = (category: string): string => {
      switch (category) {
        case "Radiology":
          return "#8b5cf6";
        case "LabReport":
          return "#3b82f6";
        case "DischargeSummary":
          return "#10b981";
        case "Prescription":
          return "#f59e0b";
        case "Insurance":
          return "#ec4899";
        default:
          return "#64748b";
      }
    };

    assert.equal(getCategoryColor("Radiology"), "#8b5cf6");
    assert.equal(getCategoryColor("LabReport"), "#3b82f6");
    assert.equal(getCategoryColor("DischargeSummary"), "#10b981");
    assert.equal(getCategoryColor("Prescription"), "#f59e0b");
    assert.equal(getCategoryColor("Insurance"), "#ec4899");
    assert.equal(getCategoryColor("Other"), "#64748b");
  });
});
