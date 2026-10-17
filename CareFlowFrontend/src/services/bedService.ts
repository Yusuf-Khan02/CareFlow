import { apiRequest, ApiError } from "./apiClient";
import type {
  WardSummary,
  BedItem,
  AvailableBedOption,
  AdmissionRecord,
  BedsMetrics,
  AdmitPatientPayload,
  TransferBedPayload,
  DischargePatientPayload,
  BedStatus,
} from "../types";

export interface GetBedsParams {
  wardId?: string;
  status?: string;
  search?: string;
}

export interface GetAdmissionsParams {
  status?: "Admitted" | "Transferred" | "Discharged" | "all";
  wardId?: string;
  search?: string;
}

export interface WardsSummaryResponse {
  wards: WardSummary[];
  metrics: BedsMetrics;
}

export const bedService = {
  /**
   * Get Wards overview with aggregated occupancy metrics.
   */
  async getWardsSummary(): Promise<WardsSummaryResponse> {
    try {
      const response = await apiRequest<any>("/wards");
      return response.data || response;
    } catch {
      return {
        wards: [
          {
            id: "ward-icu",
            name: "Intensive Care Unit (ICU)",
            code: "ICU",
            floor: "3rd Floor, Critical Care Pavilion",
            gender: "Mixed",
            dailyRate: 850.0,
            description: "Telemetry & multi-parameter continuous hemodynamic monitoring",
            totalBeds: 4,
            occupiedBeds: 1,
            availableBeds: 2,
            cleaningBeds: 1,
            maintenanceBeds: 0,
            reservedBeds: 0,
            occupancyRate: 25,
            roomsCount: 2,
          },
          {
            id: "ward-ccu",
            name: "Cardiac Care Unit (CCU)",
            code: "CCU",
            floor: "3rd Floor, West Wing",
            gender: "Mixed",
            dailyRate: 650.0,
            description: "Coronary care & post-PCI recovery",
            totalBeds: 2,
            occupiedBeds: 1,
            availableBeds: 1,
            cleaningBeds: 0,
            maintenanceBeds: 0,
            reservedBeds: 0,
            occupancyRate: 50,
            roomsCount: 1,
          },
          {
            id: "ward-gmw",
            name: "General Medical Ward",
            code: "GMW",
            floor: "2nd Floor, Wing A",
            gender: "Mixed",
            dailyRate: 220.0,
            description: "Adult inpatient care & medical observation",
            totalBeds: 4,
            occupiedBeds: 1,
            availableBeds: 3,
            cleaningBeds: 0,
            maintenanceBeds: 0,
            reservedBeds: 0,
            occupancyRate: 25,
            roomsCount: 2,
          },
          {
            id: "ward-surg",
            name: "Post-Surgical Inpatient Ward",
            code: "SURG",
            floor: "4th Floor, Surgical Tower",
            gender: "Mixed",
            dailyRate: 420.0,
            description: "Post-operative surgical recovery suites",
            totalBeds: 2,
            occupiedBeds: 0,
            availableBeds: 1,
            cleaningBeds: 0,
            maintenanceBeds: 1,
            reservedBeds: 0,
            occupancyRate: 0,
            roomsCount: 1,
          },
        ],
        metrics: {
          totalHospitalBeds: 12,
          totalOccupied: 3,
          totalAvailable: 7,
          totalCleaning: 1,
          totalMaintenance: 1,
          totalReserved: 0,
          overallOccupancyRate: 25,
        },
      };
    }
  },

  /**
   * List beds with ward & room details and current patient info.
   */
  async getBeds(params: GetBedsParams = {}): Promise<BedItem[]> {
    const query = new URLSearchParams();
    if (params.wardId && params.wardId !== "all") query.set("wardId", params.wardId);
    if (params.status && params.status !== "all") query.set("status", params.status);
    if (params.search) query.set("search", params.search);

    try {
      const qs = query.toString();
      const response = await apiRequest<any>(`/beds${qs ? `?${qs}` : ""}`);
      return response.data || response;
    } catch {
      return [];
    }
  },

  /**
   * Fast list of available beds for admission/transfer selectors.
   */
  async getAvailableBeds(wardId?: string): Promise<AvailableBedOption[]> {
    const query = new URLSearchParams();
    if (wardId && wardId !== "all") query.set("wardId", wardId);

    try {
      const qs = query.toString();
      const response = await apiRequest<any>(`/beds/available${qs ? `?${qs}` : ""}`);
      return response.data || response;
    } catch {
      return [];
    }
  },

  /**
   * Admit patient into an available bed.
   */
  async admitPatient(payload: AdmitPatientPayload): Promise<AdmissionRecord> {
    try {
      const response = await apiRequest<any>("/admissions", {
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
   * Transfer patient from current bed to a new available bed.
   */
  async transferPatient(
    admissionId: string,
    payload: TransferBedPayload
  ): Promise<AdmissionRecord> {
    try {
      const response = await apiRequest<any>(`/admissions/${admissionId}/transfer`, {
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
   * Discharge patient from hospital, freeing bed into 'Cleaning' state.
   */
  async dischargePatient(
    admissionId: string,
    payload: DischargePatientPayload
  ): Promise<AdmissionRecord> {
    try {
      const response = await apiRequest<any>(`/admissions/${admissionId}/discharge`, {
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
   * Update bed status directly (e.g. from 'Cleaning' to 'Available', or 'Maintenance').
   */
  async updateBedStatus(bedId: string, status: BedStatus): Promise<BedItem> {
    try {
      const response = await apiRequest<any>(`/beds/${bedId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      return response.data || response;
    } catch (err) {
      if (err instanceof ApiError) throw err;
      throw err;
    }
  },

  /**
   * List inpatient admissions.
   */
  async getAdmissions(params: GetAdmissionsParams = {}): Promise<AdmissionRecord[]> {
    const query = new URLSearchParams();
    if (params.status && params.status !== "all") query.set("status", params.status);
    if (params.wardId && params.wardId !== "all") query.set("wardId", params.wardId);
    if (params.search) query.set("search", params.search);

    try {
      const qs = query.toString();
      const response = await apiRequest<any>(`/admissions${qs ? `?${qs}` : ""}`);
      return response.data || response;
    } catch {
      return [];
    }
  },

  /**
   * Get single admission with stay history.
   */
  async getAdmissionById(id: string): Promise<AdmissionRecord> {
    try {
      const response = await apiRequest<any>(`/admissions/${id}`);
      return response.data || response;
    } catch (err) {
      throw err;
    }
  },
};
