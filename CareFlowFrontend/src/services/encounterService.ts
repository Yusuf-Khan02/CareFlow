import { apiRequest, ApiError } from "./apiClient";
import type {
  Consultation,
  CreateConsultationPayload,
  UpdateConsultationPayload,
} from "../types";

export interface GetConsultationsParams {
  patientId?: number;
  doctorId?: number;
  appointmentId?: string;
  date?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface ConsultationListResponse {
  consultations: Consultation[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const CONSULTATIONS_STORAGE_KEY = "careflow_consultations_data";

export const getStoredConsultations = (): Consultation[] => {
  try {
    const raw = localStorage.getItem(CONSULTATIONS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const saveStoredConsultations = (data: Consultation[]): void => {
  try {
    localStorage.setItem(CONSULTATIONS_STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error("Failed to cache consultations", err);
  }
};

export const encounterService = {
  /**
   * List clinical consultation encounters with filters and search.
   */
  async getConsultations(params: GetConsultationsParams = {}): Promise<ConsultationListResponse> {
    try {
      const qp = new URLSearchParams();
      if (params.patientId) qp.set("patientId", String(params.patientId));
      if (params.doctorId) qp.set("doctorId", String(params.doctorId));
      if (params.appointmentId) qp.set("appointmentId", params.appointmentId);
      if (params.date) qp.set("date", params.date);
      if (params.search) qp.set("search", params.search);
      if (params.page) qp.set("page", String(params.page));
      if (params.limit) qp.set("limit", String(params.limit));

      const qs = qp.toString();
      const endpoint = `/consultations${qs ? `?${qs}` : ""}`;
      const response = await apiRequest<{
        consultations?: Consultation[];
        pagination?: { total: number; page: number; limit: number; totalPages: number };
      }>(endpoint);

      const items = (response as any).data || (response as any).consultations || (Array.isArray(response) ? response : []);
      const pagination = (response as any).pagination || {
        total: items.length,
        page: params.page || 1,
        limit: params.limit || 50,
        totalPages: 1,
      };

      saveStoredConsultations(items);
      return {
        consultations: items,
        total: pagination.total,
        page: pagination.page,
        limit: pagination.limit,
        totalPages: pagination.totalPages,
      };
    } catch (err) {
      console.warn("Falling back to local consultation storage", err);
      const stored = getStoredConsultations();
      let filtered = [...stored];

      if (params.patientId) {
        filtered = filtered.filter((c) => c.patientId === params.patientId);
      }
      if (params.doctorId) {
        filtered = filtered.filter((c) => c.doctorId === params.doctorId);
      }
      if (params.search) {
        const s = params.search.toLowerCase();
        filtered = filtered.filter(
          (c) =>
            c.patientName.toLowerCase().includes(s) ||
            c.diagnosis.toLowerCase().includes(s) ||
            c.chiefComplaint.toLowerCase().includes(s) ||
            c.patientMrn.toLowerCase().includes(s)
        );
      }

      return {
        consultations: filtered,
        total: filtered.length,
        page: 1,
        limit: filtered.length || 10,
        totalPages: 1,
      };
    }
  },

  /**
   * Get single consultation by ID.
   */
  async getConsultationById(id: number): Promise<Consultation> {
    try {
      const response = await apiRequest<Consultation>(`/consultations/${id}`);
      return (response as any).data || response;
    } catch (err) {
      const stored = getStoredConsultations();
      const found = stored.find((c) => c.id === id);
      if (found) return found;
      throw err;
    }
  },

  /**
   * Create consultation encounter with clinical notes, diagnoses, and prescriptions.
   */
  async createConsultation(payload: CreateConsultationPayload): Promise<Consultation> {
    try {
      const response = await apiRequest<Consultation>("/consultations", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      const created = (response as any).data || response;
      const stored = getStoredConsultations();
      saveStoredConsultations([created, ...stored.filter((c) => c.id !== created.id)]);
      return created;
    } catch (err) {
      if (err instanceof ApiError) throw err;
      throw new Error("Unable to save consultation encounter to server.");
    }
  },

  /**
   * Update clinical notes or diagnosis.
   */
  async updateConsultation(id: number, payload: UpdateConsultationPayload): Promise<Consultation> {
    try {
      const response = await apiRequest<Consultation>(`/consultations/${id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
      const updated = (response as any).data || response;
      const stored = getStoredConsultations();
      saveStoredConsultations(stored.map((c) => (c.id === id ? updated : c)));
      return updated;
    } catch (err) {
      if (err instanceof ApiError) throw err;
      throw new Error("Unable to update consultation encounter.");
    }
  },
};
