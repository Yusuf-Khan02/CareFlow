import { apiRequest, ApiError } from "./apiClient";
import type { Patient } from "../types";
import { getStoredPatients, saveStoredPatients } from "../data/mockData";

export interface GetPatientsParams {
  page?: number;
  limit?: number;
  search?: string;
  department?: string;
  status?: string;
}

export interface PatientsListResult {
  patients: Patient[];
  total: number;
  page: number;
  limit: number;
  isFallback?: boolean;
}

export const patientService = {
  /**
   * Fetch patients list with filters and search.
   */
  async getPatients(params: GetPatientsParams = {}): Promise<PatientsListResult> {
    try {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.set("page", String(params.page));
      if (params.limit) queryParams.set("limit", String(params.limit));
      if (params.search) queryParams.set("search", params.search);
      if (params.department) queryParams.set("department", params.department);
      if (params.status) queryParams.set("status", params.status);

      const qs = queryParams.toString();
      const endpoint = `/patients${qs ? `?${qs}` : ""}`;
      const response = await apiRequest<Patient[]>(endpoint);

      return {
        patients: response.data,
        total: response.pagination?.total ?? response.data.length,
        page: response.pagination?.page ?? 1,
        limit: response.pagination?.limit ?? 20,
        isFallback: false,
      };
    } catch (err: any) {
      if (err instanceof ApiError && err.code === "NETWORK_ERROR") {
        console.warn("CareFlow Backend unreachable; serving local patient store.", err.message);
        const stored = getStoredPatients();
        let filtered = stored;

        if (params.search) {
          const q = params.search.toLowerCase();
          filtered = filtered.filter(
            (p) =>
              p.name.toLowerCase().includes(q) ||
              p.mrn.toLowerCase().includes(q) ||
              p.phone.includes(q)
          );
        }
        if (params.department) {
          filtered = filtered.filter(
            (p) => p.department.toLowerCase() === params.department!.toLowerCase()
          );
        }
        if (params.status) {
          filtered = filtered.filter(
            (p) => p.status.toLowerCase() === params.status!.toLowerCase()
          );
        }

        return {
          patients: filtered,
          total: filtered.length,
          page: 1,
          limit: filtered.length,
          isFallback: true,
        };
      }
      throw err;
    }
  },

  /**
   * Fetch single patient by ID.
   */
  async getPatientById(id: number): Promise<Patient> {
    try {
      const response = await apiRequest<Patient>(`/patients/${id}`);
      return response.data;
    } catch (err: any) {
      if (err instanceof ApiError && err.code === "NETWORK_ERROR") {
        console.warn("CareFlow Backend unreachable; looking up patient in local store.", id);
        const stored = getStoredPatients();
        const found = stored.find((p) => p.id === id);
        if (!found) {
          throw new Error(`Patient #${id} not found in offline store`);
        }
        return found;
      }
      throw err;
    }
  },

  /**
   * Register a new patient.
   */
  async createPatient(patientData: Partial<Patient>): Promise<Patient> {
    try {
      const response = await apiRequest<Patient>("/patients", {
        method: "POST",
        body: JSON.stringify(patientData),
      });
      return response.data;
    } catch (err: any) {
      if (err instanceof ApiError && err.code === "NETWORK_ERROR") {
        console.warn("CareFlow Backend unreachable; storing patient in local store.");
        const stored = getStoredPatients();
        const nextId = stored.length > 0 ? Math.max(...stored.map((p) => p.id)) + 1 : 1;
        const newPatient: Patient = {
          id: nextId,
          mrn: `CF-2026-${String(nextId).padStart(3, "0")}`,
          name: patientData.name || "Unknown Patient",
          age: patientData.age || 30,
          gender: patientData.gender || "Male",
          phone: patientData.phone || "",
          email: patientData.email || "",
          address: patientData.address || "",
          department: patientData.department || "General Physician",
          status: patientData.status || "Active",
          bloodGroup: patientData.bloodGroup || "O+",
          emergencyContact: patientData.emergencyContact || {
            name: "Next of Kin",
            relation: "Family",
            phone: patientData.phone || "",
          },
          allergies: patientData.allergies || ["None known"],
          vitals: patientData.vitals || {
            bloodPressure: "120/80 mmHg",
            heartRate: 72,
            temperature: "98.6 °F",
            spO2: 98,
            recordedAt: "Just now",
          },
          admissionDate: new Date().toISOString().split("T")[0],
          doctorAssigned: patientData.doctorAssigned || "Dr. Sarah Jenkins",
          appointments: [],
          visits: [],
        };
        const updated = [newPatient, ...stored];
        saveStoredPatients(updated);
        return newPatient;
      }
      throw err;
    }
  },

  /**
   * Update existing patient.
   */
  async updatePatient(id: number, patientData: Partial<Patient>): Promise<Patient> {
    try {
      const response = await apiRequest<Patient>(`/patients/${id}`, {
        method: "PUT",
        body: JSON.stringify(patientData),
      });
      return response.data;
    } catch (err: any) {
      if (err instanceof ApiError && err.code === "NETWORK_ERROR") {
        console.warn("CareFlow Backend unreachable; updating patient in local store.");
        const stored = getStoredPatients();
        const index = stored.findIndex((p) => p.id === id);
        if (index === -1) throw new Error(`Patient #${id} not found.`);
        const updatedPatient = { ...stored[index], ...patientData } as Patient;
        stored[index] = updatedPatient;
        saveStoredPatients(stored);
        return updatedPatient;
      }
      throw err;
    }
  },

  /**
   * Delete patient record.
   */
  async deletePatient(id: number): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiRequest<{ success: boolean; message: string }>(`/patients/${id}`, {
        method: "DELETE",
      });
      return response.data;
    } catch (err: any) {
      if (err instanceof ApiError && err.code === "NETWORK_ERROR") {
        console.warn("CareFlow Backend unreachable; deleting patient from local store.");
        const stored = getStoredPatients();
        const filtered = stored.filter((p) => p.id !== id);
        saveStoredPatients(filtered);
        return { success: true, message: `Patient #${id} deleted from offline store.` };
      }
      throw err;
    }
  },
};

export default patientService;
