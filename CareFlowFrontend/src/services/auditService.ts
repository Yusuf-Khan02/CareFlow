import { apiRequest } from "./apiClient";
import type { AuditLog } from "../types";

export interface GetAuditLogsParams {
  search?: string;
  organizationId?: string;
  action?: string;
  entityName?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

export const auditService = {
  /**
   * Get immutable audit events with filtering
   */
  async getAuditLogs(params: GetAuditLogsParams = {}): Promise<AuditLog[]> {
    const query = new URLSearchParams();
    if (params.search) query.set("search", params.search);
    if (params.organizationId && params.organizationId !== "all") {
      query.set("organizationId", params.organizationId);
    }
    if (params.action && params.action !== "ALL") query.set("action", params.action);
    if (params.entityName && params.entityName !== "ALL") query.set("entityName", params.entityName);
    if (params.startDate) query.set("startDate", params.startDate);
    if (params.endDate) query.set("endDate", params.endDate);
    if (params.limit) query.set("limit", String(params.limit));
    if (params.offset) query.set("offset", String(params.offset));

    try {
      const qs = query.toString();
      const response = await apiRequest<AuditLog[]>(`/audit-logs${qs ? `?${qs}` : ""}`);
      return response.data || response;
    } catch {
      return [];
    }
  },

  /**
   * Download Audit Trail CSV
   */
  async downloadAuditLogsCSV(organizationId?: string): Promise<void> {
    try {
      const token = localStorage.getItem("careflow_token");
      const tenantId = organizationId || localStorage.getItem("careflow_tenant_id") || "";

      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;
      if (tenantId) headers["x-organization-id"] = tenantId;

      const url = `http://localhost:5000/api/v1/audit-logs/export${
        organizationId && organizationId !== "all" ? `?organizationId=${organizationId}` : ""
      }`;

      const res = await fetch(url, { headers });
      if (!res.ok) throw new Error("Failed to export audit logs CSV");

      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = `careflow_audit_trail_${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(blobUrl);
      document.body.removeChild(a);
    } catch (err) {
      console.error("Export audit CSV error:", err);
      throw err;
    }
  },
};

export default auditService;
