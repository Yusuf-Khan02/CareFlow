import { apiRequest, ApiError } from "./apiClient";
import type { Prescription, PrescriptionItemInput } from "../types";

export interface GetPrescriptionsParams {
  patientId?: number;
  doctorId?: number;
  consultationId?: number;
  status?: string;
  search?: string;
}

export const prescriptionService = {
  /**
   * Fetch prescriptions with optional patient, doctor, or status filtering.
   */
  async getPrescriptions(params: GetPrescriptionsParams = {}): Promise<Prescription[]> {
    try {
      const qp = new URLSearchParams();
      if (params.patientId) qp.set("patientId", String(params.patientId));
      if (params.doctorId) qp.set("doctorId", String(params.doctorId));
      if (params.consultationId) qp.set("consultationId", String(params.consultationId));
      if (params.status) qp.set("status", params.status);
      if (params.search) qp.set("search", params.search);

      const qs = qp.toString();
      const endpoint = `/prescriptions${qs ? `?${qs}` : ""}`;
      const response = await apiRequest<Prescription[]>(endpoint);
      return (response as any).data || (Array.isArray(response) ? response : []);
    } catch (err) {
      console.warn("Failed to fetch prescriptions from server", err);
      return [];
    }
  },

  /**
   * Create a single prescription record.
   */
  async createPrescription(
    payload: PrescriptionItemInput & { patientId: number; doctorId: number; consultationId?: number }
  ): Promise<Prescription> {
    try {
      const response = await apiRequest<Prescription>("/prescriptions", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      return (response as any).data || response;
    } catch (err) {
      if (err instanceof ApiError) throw err;
      throw new Error("Failed to create prescription.");
    }
  },

  /**
   * Cancel or discontinue an active prescription.
   */
  async cancelPrescription(id: number): Promise<Prescription> {
    try {
      const response = await apiRequest<Prescription>(`/prescriptions/${id}/cancel`, {
        method: "PATCH",
      });
      return (response as any).data || response;
    } catch (err) {
      if (err instanceof ApiError) throw err;
      throw new Error("Failed to cancel prescription.");
    }
  },
};
