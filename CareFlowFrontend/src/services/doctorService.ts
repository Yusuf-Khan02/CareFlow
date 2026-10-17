import { apiRequest, ApiError } from "./apiClient";
import type { Doctor } from "../types";
import { getStoredDoctors } from "../data/mockData";

export interface GetDoctorsParams {
  search?: string;
  department?: string;
  status?: string;
  specialty?: string;
}

export const doctorService = {
  /**
   * Fetch doctors list with filters.
   */
  async getDoctors(params: GetDoctorsParams = {}): Promise<Doctor[]> {
    try {
      const queryParams = new URLSearchParams();
      if (params.search) queryParams.set("search", params.search);
      if (params.department) queryParams.set("department", params.department);
      if (params.status) queryParams.set("status", params.status);
      if (params.specialty) queryParams.set("specialty", params.specialty);

      const qs = queryParams.toString();
      const endpoint = `/doctors${qs ? `?${qs}` : ""}`;
      const response = await apiRequest<Doctor[]>(endpoint);
      return response.data;
    } catch (err: any) {
      if (err instanceof ApiError && err.code === "NETWORK_ERROR") {
        console.warn("CareFlow Backend unreachable; serving local doctor directory.");
        let doctors = getStoredDoctors();
        if (params.search) {
          const q = params.search.toLowerCase();
          doctors = doctors.filter(
            (d) =>
              d.name.toLowerCase().includes(q) ||
              d.specialty.toLowerCase().includes(q) ||
              d.qualification.toLowerCase().includes(q)
          );
        }
        if (params.department) {
          doctors = doctors.filter(
            (d) => d.department.toLowerCase() === params.department!.toLowerCase()
          );
        }
        if (params.status) {
          doctors = doctors.filter(
            (d) => d.status.toLowerCase() === params.status!.toLowerCase()
          );
        }
        return doctors;
      }
      throw err;
    }
  },

  /**
   * Fetch single doctor profile by ID with weekly schedule.
   */
  async getDoctorById(id: number): Promise<Doctor> {
    try {
      const response = await apiRequest<Doctor>(`/doctors/${id}`);
      return response.data;
    } catch (err: any) {
      if (err instanceof ApiError && err.code === "NETWORK_ERROR") {
        console.warn("CareFlow Backend unreachable; fetching doctor from local store.");
        const docs = getStoredDoctors();
        const found = docs.find((d) => d.id === id);
        if (!found) throw new Error(`Physician #${id} not found`);
        return found;
      }
      throw err;
    }
  },

  /**
   * Create doctor profile.
   */
  async createDoctor(data: Partial<Doctor>): Promise<Doctor> {
    const response = await apiRequest<Doctor>("/doctors", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return response.data;
  },

  /**
   * Update doctor profile.
   */
  async updateDoctor(id: number, data: Partial<Doctor>): Promise<Doctor> {
    const response = await apiRequest<Doctor>(`/doctors/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
    return response.data;
  },
};

export default doctorService;
