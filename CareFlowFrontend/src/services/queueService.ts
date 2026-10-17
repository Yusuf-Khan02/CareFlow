import { apiRequest, ApiError } from "./apiClient";
import type {
  QueueToken,
  QueueMetrics,
  CreateTokenPayload,
} from "../types";
import { getStoredPatients, getStoredDoctors } from "../data/mockData";

export interface GetQueueParams {
  doctorId?: number;
  departmentId?: string;
  status?: string;
  priority?: string;
  search?: string;
}

export interface QueueListResponse {
  tokens: QueueToken[];
  metrics: QueueMetrics;
  total: number;
}

const QUEUE_STORAGE_KEY = "careflow_queue_tokens_data";

export const getStoredQueueTokens = (): QueueToken[] => {
  try {
    const raw = localStorage.getItem(QUEUE_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
};

export const saveStoredQueueTokens = (tokens: QueueToken[]): void => {
  try {
    localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(tokens));
  } catch (err) {
    console.error("Failed to save queue tokens to localStorage", err);
  }
};

export const queueService = {
  /**
   * Fetch live queue tokens and real-time operational waiting metrics.
   */
  async getQueue(params: GetQueueParams = {}): Promise<QueueListResponse> {
    try {
      const queryParams = new URLSearchParams();
      if (params.doctorId) queryParams.set("doctorId", String(params.doctorId));
      if (params.departmentId) queryParams.set("departmentId", params.departmentId);
      if (params.status) queryParams.set("status", params.status);
      if (params.priority) queryParams.set("priority", params.priority);
      if (params.search) queryParams.set("search", params.search);

      const qs = queryParams.toString();
      const endpoint = `/queue${qs ? `?${qs}` : ""}`;
      const response = await apiRequest<QueueToken[]>(endpoint);

      const metrics: QueueMetrics = (response as any).metrics || {
        totalWaiting: response.data.filter((t) => t.status === "Waiting").length,
        totalCalled: response.data.filter((t) => t.status === "Called").length,
        totalInConsult: response.data.filter((t) => t.status === "In-Consultation").length,
        totalCompleted: response.data.filter((t) => t.status === "Completed").length,
        totalSkipped: response.data.filter((t) => t.status === "Skipped").length,
        avgWaitMinutes: 15,
        currentCalling: response.data.find((t) => t.status === "Called") || null,
      };

      return {
        tokens: response.data,
        metrics,
        total: (response as any).total ?? response.data.length,
      };
    } catch (err: any) {
      if (err instanceof ApiError && err.code === "NETWORK_ERROR") {
        console.warn("CareFlow Backend unreachable; serving local queue store.");
        let stored = getStoredQueueTokens();

        if (params.doctorId) {
          stored = stored.filter((t) => t.doctorId === params.doctorId);
        }
        if (params.departmentId) {
          stored = stored.filter(
            (t) =>
              t.department.toLowerCase() === params.departmentId!.toLowerCase() ||
              t.departmentId === params.departmentId
          );
        }
        if (params.status && params.status !== "all") {
          stored = stored.filter((t) => t.status.toLowerCase() === params.status!.toLowerCase());
        }
        if (params.priority && params.priority !== "all") {
          stored = stored.filter((t) => t.priority.toLowerCase() === params.priority!.toLowerCase());
        }
        if (params.search) {
          const q = params.search.toLowerCase();
          stored = stored.filter(
            (t) =>
              t.tokenNumber.toLowerCase().includes(q) ||
              t.patientName.toLowerCase().includes(q) ||
              t.patientMrn.toLowerCase().includes(q) ||
              t.doctorName.toLowerCase().includes(q)
          );
        }

        const totalWaiting = stored.filter((t) => t.status === "Waiting").length;
        const totalCalled = stored.filter((t) => t.status === "Called").length;
        const totalInConsult = stored.filter((t) => t.status === "In-Consultation").length;
        const totalCompleted = stored.filter((t) => t.status === "Completed").length;
        const totalSkipped = stored.filter((t) => t.status === "Skipped").length;

        return {
          tokens: stored,
          total: stored.length,
          metrics: {
            totalWaiting,
            totalCalled,
            totalInConsult,
            totalCompleted,
            totalSkipped,
            avgWaitMinutes: totalWaiting * 12,
            currentCalling: stored.find((t) => t.status === "Called") || null,
          },
        };
      }
      throw err;
    }
  },

  /**
   * Issue a new Queue Token (Arrival Check-in or Walk-in registration).
   */
  async createToken(payload: CreateTokenPayload): Promise<QueueToken> {
    try {
      const response = await apiRequest<QueueToken>("/queue", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      return response.data;
    } catch (err: any) {
      if (err instanceof ApiError && err.code === "NETWORK_ERROR") {
        const stored = getStoredQueueTokens();
        const patients = getStoredPatients();
        const doctors = getStoredDoctors();

        const patient = patients.find((p) => p.id === payload.patientId);
        const doctor = doctors.find((d) => d.id === payload.doctorId);

        const prefix =
          payload.priority === "Emergency"
            ? "EM"
            : (doctor?.department || "A").substring(0, 2).toUpperCase();

        const newToken: QueueToken = {
          id: `tok-local-${Date.now()}`,
          tokenNumber: `${prefix}-${100 + stored.length + 1}`,
          patientId: payload.patientId,
          patientName: patient?.name || "Patient",
          patientMrn: patient?.mrn || "CF-2026-999",
          patientGender: patient?.gender || "Male",
          patientAge: patient?.age || 35,
          patientPhone: patient?.phone || "",
          doctorId: payload.doctorId || null,
          doctorName: doctor?.name || "Available Physician",
          doctorSpecialty: doctor?.specialty || "",
          doctorRoom: doctor?.room || "Consultation Suite",
          departmentId: doctor?.department || "General Clinic",
          department: doctor?.department || "General Clinic",
          status: "Waiting",
          priority: payload.priority || "Normal",
          calledAt: null,
          completedAt: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          estimatedWaitMinutes: (stored.filter((t) => t.status === "Waiting").length + 1) * 12,
        };

        saveStoredQueueTokens([...stored, newToken]);
        return newToken;
      }
      throw err;
    }
  },

  /**
   * Concurrency-safe Call Next patient for a doctor or department.
   */
  async callNext(doctorId?: number, departmentId?: string): Promise<QueueToken> {
    const response = await apiRequest<QueueToken>("/queue/call-next", {
      method: "POST",
      body: JSON.stringify({ doctorId, departmentId }),
    });
    return response.data;
  },

  /**
   * Directly call a specific patient token.
   */
  async callToken(id: string, doctorId?: number): Promise<QueueToken> {
    const response = await apiRequest<QueueToken>(`/queue/${id}/call`, {
      method: "PATCH",
      body: JSON.stringify({ doctorId }),
    });
    return response.data;
  },

  /**
   * Mark token as in-consultation.
   */
  async startConsultation(id: string): Promise<QueueToken> {
    const response = await apiRequest<QueueToken>(`/queue/${id}/start`, {
      method: "PATCH",
    });
    return response.data;
  },

  /**
   * Mark token encounter as completed.
   */
  async completeToken(id: string): Promise<QueueToken> {
    const response = await apiRequest<QueueToken>(`/queue/${id}/complete`, {
      method: "PATCH",
    });
    return response.data;
  },

  /**
   * Skip a waiting or called patient.
   */
  async skipToken(id: string): Promise<QueueToken> {
    const response = await apiRequest<QueueToken>(`/queue/${id}/skip`, {
      method: "PATCH",
    });
    return response.data;
  },

  /**
   * Return a skipped patient back to the waiting line.
   */
  async returnToWaiting(id: string): Promise<QueueToken> {
    const response = await apiRequest<QueueToken>(`/queue/${id}/recall`, {
      method: "PATCH",
    });
    return response.data;
  },
};
