import { apiRequest, ApiError } from "./apiClient";
import type {
  Invoice,
  Payment,
  BillingMetrics,
  CreateInvoicePayload,
  RecordPaymentPayload,
} from "../types";

export interface GetInvoicesParams {
  status?: string;
  patientId?: number;
  startDate?: string;
  endDate?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export const billingService = {
  /**
   * Executive billing KPI metrics
   */
  async getBillingMetrics(): Promise<BillingMetrics> {
    try {
      const response = await apiRequest<any>("/billing/metrics");
      return response.data || response;
    } catch {
      return {
        totalInvoices: 4,
        totalInvoiced: 3665.0,
        totalCollected: 1715.0,
        totalReceivables: 1950.0,
        collectionRate: 46.8,
        totalPaymentsCount: 3,
        statusCounts: {
          Draft: 0,
          Issued: 1,
          "Partially Paid": 1,
          Paid: 2,
          Cancelled: 0,
          Refunded: 0,
        },
      };
    }
  },

  /**
   * List invoices with filtering & search
   */
  async getInvoices(params: GetInvoicesParams = {}): Promise<Invoice[]> {
    const query = new URLSearchParams();
    if (params.status && params.status !== "All") query.set("status", params.status);
    if (params.patientId) query.set("patientId", String(params.patientId));
    if (params.startDate) query.set("startDate", params.startDate);
    if (params.endDate) query.set("endDate", params.endDate);
    if (params.search) query.set("search", params.search);
    if (params.limit) query.set("limit", String(params.limit));
    if (params.offset) query.set("offset", String(params.offset));

    try {
      const qs = query.toString();
      const response = await apiRequest<any>(`/billing/invoices${qs ? `?${qs}` : ""}`);
      return response.data || response;
    } catch {
      return [];
    }
  },

  /**
   * Get single invoice details by ID or invoiceNumber
   */
  async getInvoiceById(id: string): Promise<Invoice> {
    try {
      const response = await apiRequest<any>(`/billing/invoices/${id}`);
      return response.data || response;
    } catch (err) {
      if (err instanceof ApiError) throw err;
      throw err;
    }
  },

  /**
   * Create a new invoice with multi-line items
   */
  async createInvoice(payload: CreateInvoicePayload): Promise<Invoice> {
    try {
      const response = await apiRequest<any>("/billing/invoices", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      return response.data || response;
    } catch (err) {
      if (err instanceof ApiError) throw err;
      throw err;
    }
  },

  /**
   * Record payment receipt against invoice
   */
  async recordPayment(payload: RecordPaymentPayload): Promise<{ payment: Payment; invoice: Invoice }> {
    try {
      const response = await apiRequest<any>(`/billing/invoices/${payload.invoiceId}/payments`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      return response.data || response;
    } catch (err) {
      if (err instanceof ApiError) throw err;
      throw err;
    }
  },

  /**
   * Cancel an unpaid invoice
   */
  async cancelInvoice(id: string, reason?: string): Promise<Invoice> {
    try {
      const response = await apiRequest<any>(`/billing/invoices/${id}/cancel`, {
        method: "POST",
        body: JSON.stringify({ reason }),
      });
      return response.data || response;
    } catch (err) {
      if (err instanceof ApiError) throw err;
      throw err;
    }
  },

  /**
   * List recent payment receipts
   */
  async getPayments(limit = 50): Promise<Payment[]> {
    try {
      const response = await apiRequest<any>(`/billing/payments?limit=${limit}`);
      return response.data || response;
    } catch {
      return [];
    }
  },

  /**
   * Export all invoices as CSV file download
   */
  async downloadInvoicesCSV(): Promise<void> {
    try {
      const token = localStorage.getItem("careflow_token");
      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch("http://localhost:5000/api/v1/billing/export", {
        headers,
      });

      if (!res.ok) throw new Error("Failed to export invoices CSV");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `careflow_billing_${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error("Export CSV error:", err);
      throw err;
    }
  },
};

export default billingService;
