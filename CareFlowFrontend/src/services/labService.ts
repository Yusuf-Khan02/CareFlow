import { apiRequest, ApiError } from "./apiClient";
import type {
  LabOrder,
  LabMetrics,
  LabCatalogTest,
  CreateLabOrderPayload,
  EnterLabResultsPayload,
  LabOrderStatus,
} from "../types";

export interface GetLabOrdersParams {
  patientId?: number;
  doctorId?: number;
  consultationId?: string;
  status?: string;
  priority?: string;
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface LabOrderListResponse {
  orders: LabOrder[];
  metrics: LabMetrics;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const LAB_CATALOG: LabCatalogTest[] = [
  {
    category: "Hematology",
    testName: "Complete Blood Count (CBC)",
    turnaroundHours: 2,
    sampleType: "Whole Blood (EDTA)",
    description: "Evaluates overall health and detects anemia, infection, and leukemia.",
    defaultParameters: [
      { name: "Hemoglobin", unit: "g/dL", referenceRange: "13.5 - 17.5" },
      { name: "White Blood Cells (WBC)", unit: "x10^3/uL", referenceRange: "4.5 - 11.0" },
      { name: "Platelet Count", unit: "x10^3/uL", referenceRange: "150 - 450" },
      { name: "Hematocrit (HCT)", unit: "%", referenceRange: "41.0 - 50.0" },
    ],
  },
  {
    category: "Biochemistry",
    testName: "Lipid Profile Panel",
    turnaroundHours: 4,
    sampleType: "Serum (SST)",
    description: "Measures concentrations of specific lipids to evaluate cardiovascular disease risk.",
    defaultParameters: [
      { name: "Total Cholesterol", unit: "mg/dL", referenceRange: "< 200" },
      { name: "HDL Cholesterol", unit: "mg/dL", referenceRange: "> 40" },
      { name: "LDL Cholesterol", unit: "mg/dL", referenceRange: "< 100" },
      { name: "Triglycerides", unit: "mg/dL", referenceRange: "< 150" },
    ],
  },
  {
    category: "Biochemistry",
    testName: "Comprehensive Metabolic Panel (CMP)",
    turnaroundHours: 4,
    sampleType: "Serum (SST)",
    description: "Evaluates chemical balance, glucose, kidney function, and electrolytes.",
    defaultParameters: [
      { name: "Fasting Blood Glucose", unit: "mg/dL", referenceRange: "70 - 99" },
      { name: "Serum Creatinine", unit: "mg/dL", referenceRange: "0.7 - 1.3" },
      { name: "Blood Urea Nitrogen (BUN)", unit: "mg/dL", referenceRange: "7 - 20" },
      { name: "Serum Sodium (Na+)", unit: "mEq/L", referenceRange: "135 - 145" },
      { name: "Serum Potassium (K+)", unit: "mEq/L", referenceRange: "3.5 - 5.0" },
    ],
  },
  {
    category: "Biochemistry",
    testName: "Liver Function Tests (LFT)",
    turnaroundHours: 4,
    sampleType: "Serum (SST)",
    description: "Evaluates inflammation, damage, or disease in liver function and biliary systems.",
    defaultParameters: [
      { name: "ALT (Alanine Aminotransferase)", unit: "U/L", referenceRange: "7 - 56" },
      { name: "AST (Aspartate Aminotransferase)", unit: "U/L", referenceRange: "10 - 40" },
      { name: "Total Bilirubin", unit: "mg/dL", referenceRange: "0.2 - 1.2" },
      { name: "Alkaline Phosphatase (ALP)", unit: "U/L", referenceRange: "44 - 147" },
    ],
  },
  {
    category: "Endocrinology",
    testName: "Thyroid Stimulating Hormone (TSH & FT4)",
    turnaroundHours: 6,
    sampleType: "Serum (SST)",
    description: "Evaluates thyroid gland function and monitors treatment.",
    defaultParameters: [
      { name: "TSH (Ultrasensitive)", unit: "uIU/mL", referenceRange: "0.4 - 4.0" },
      { name: "Free T4", unit: "ng/dL", referenceRange: "0.8 - 1.8" },
    ],
  },
  {
    category: "Cardiology",
    testName: "Cardiac Troponin-I & CK-MB",
    turnaroundHours: 1,
    sampleType: "Plasma / Heparin",
    description: "Critical emergency diagnostic marker for myocardial injury or acute coronary syndrome.",
    defaultParameters: [
      { name: "Troponin-I High-Sensitivity", unit: "ng/mL", referenceRange: "< 0.04" },
      { name: "CK-MB", unit: "ng/mL", referenceRange: "0.0 - 5.0" },
    ],
  },
];

const LAB_ORDERS_STORAGE_KEY = "careflow_lab_orders_data";

export const getStoredLabOrders = (): LabOrder[] => {
  try {
    const raw = localStorage.getItem(LAB_ORDERS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const saveStoredLabOrders = (orders: LabOrder[]): void => {
  try {
    localStorage.setItem(LAB_ORDERS_STORAGE_KEY, JSON.stringify(orders));
  } catch (err) {
    console.error("Failed to cache lab orders", err);
  }
};

export const labService = {
  /**
   * Fetch lab orders list with search, status filters and department metrics.
   */
  async getLabOrders(params: GetLabOrdersParams = {}): Promise<LabOrderListResponse> {
    try {
      const qp = new URLSearchParams();
      if (params.patientId) qp.set("patientId", String(params.patientId));
      if (params.doctorId) qp.set("doctorId", String(params.doctorId));
      if (params.consultationId) qp.set("consultationId", params.consultationId);
      if (params.status && params.status !== "all") qp.set("status", params.status);
      if (params.priority && params.priority !== "all") qp.set("priority", params.priority);
      if (params.category && params.category !== "all") qp.set("category", params.category);
      if (params.search) qp.set("search", params.search);
      if (params.page) qp.set("page", String(params.page));
      if (params.limit) qp.set("limit", String(params.limit));

      const qs = qp.toString();
      const endpoint = `/laboratory/orders${qs ? `?${qs}` : ""}`;
      const response = await apiRequest<{
        data: LabOrder[];
        metrics: LabMetrics;
        pagination: { total: number; page: number; limit: number; totalPages: number };
      }>(endpoint);

      const orders = (response as any).data || [];
      const metrics: LabMetrics = (response as any).metrics || {
        totalOrders: orders.length,
        pendingCollection: orders.filter((o: any) => o.status === "Requested").length,
        inAnalysis: orders.filter((o: any) => o.status === "Sample Collected" || o.status === "In-Analysis").length,
        completed: orders.filter((o: any) => o.status === "Completed").length,
        criticalCount: orders.filter((o: any) => o.results?.some((r: any) => r.status === "Critical")).length,
      };

      const pagination = (response as any).pagination || {
        total: orders.length,
        page: params.page || 1,
        limit: params.limit || 50,
        totalPages: 1,
      };

      saveStoredLabOrders(orders);

      return {
        orders,
        metrics,
        total: pagination.total,
        page: pagination.page,
        limit: pagination.limit,
        totalPages: pagination.totalPages,
      };
    } catch (err) {
      console.warn("Falling back to cached lab orders data", err);
      const stored = getStoredLabOrders();
      let filtered = [...stored];

      if (params.status && params.status !== "all") {
        filtered = filtered.filter((o) => o.status === params.status);
      }
      if (params.priority && params.priority !== "all") {
        filtered = filtered.filter((o) => o.priority === params.priority);
      }
      if (params.category && params.category !== "all") {
        filtered = filtered.filter((o) => o.testCategory === params.category);
      }
      if (params.search) {
        const q = params.search.toLowerCase();
        filtered = filtered.filter(
          (o) =>
            o.orderNumber.toLowerCase().includes(q) ||
            o.patientName.toLowerCase().includes(q) ||
            o.testName.toLowerCase().includes(q)
        );
      }

      return {
        orders: filtered,
        metrics: {
          totalOrders: stored.length,
          pendingCollection: stored.filter((o) => o.status === "Requested").length,
          inAnalysis: stored.filter((o) => o.status === "Sample Collected" || o.status === "In-Analysis").length,
          completed: stored.filter((o) => o.status === "Completed").length,
          criticalCount: stored.filter((o) => o.results?.some((r) => r.status === "Critical")).length,
        },
        total: filtered.length,
        page: 1,
        limit: filtered.length || 50,
        totalPages: 1,
      };
    }
  },

  /**
   * Get single lab order by ID with verified results.
   */
  async getLabOrderById(id: string): Promise<LabOrder> {
    try {
      const response = await apiRequest<LabOrder>(`/laboratory/orders/${id}`);
      return (response as any).data || response;
    } catch (err) {
      const stored = getStoredLabOrders();
      const found = stored.find((o) => o.id === id);
      if (found) return found;
      throw err;
    }
  },

  /**
   * Order a new lab diagnostic test.
   */
  async createLabOrder(payload: CreateLabOrderPayload): Promise<LabOrder> {
    try {
      const response = await apiRequest<LabOrder>("/laboratory/orders", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      const created = (response as any).data || response;
      const stored = getStoredLabOrders();
      saveStoredLabOrders([created, ...stored]);
      return created;
    } catch (err) {
      if (err instanceof ApiError) throw err;
      throw new Error("Unable to create lab order.");
    }
  },

  /**
   * Update lab order status (e.g. Sample Collected, In-Analysis).
   */
  async updateOrderStatus(id: string, status: LabOrderStatus): Promise<LabOrder> {
    try {
      const response = await apiRequest<LabOrder>(`/laboratory/orders/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      const updated = (response as any).data || response;
      const stored = getStoredLabOrders();
      saveStoredLabOrders(stored.map((o) => (o.id === id ? updated : o)));
      return updated;
    } catch (err) {
      if (err instanceof ApiError) throw err;
      throw new Error("Failed to update lab order status.");
    }
  },

  /**
   * Record and verify biochemical lab results for an order.
   */
  async enterResults(id: string, payload: EnterLabResultsPayload): Promise<LabOrder> {
    try {
      const response = await apiRequest<LabOrder>(`/laboratory/orders/${id}/results`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      const updated = (response as any).data || response;
      const stored = getStoredLabOrders();
      saveStoredLabOrders(stored.map((o) => (o.id === id ? updated : o)));
      return updated;
    } catch (err) {
      if (err instanceof ApiError) throw err;
      throw new Error("Failed to save lab results.");
    }
  },

  /**
   * Fetch standard diagnostic test catalog.
   */
  async getCatalog(): Promise<LabCatalogTest[]> {
    try {
      const response = await apiRequest<LabCatalogTest[]>("/laboratory/catalog");
      return (response as any).data || (Array.isArray(response) ? response : []);
    } catch {
      return [];
    }
  },
};
