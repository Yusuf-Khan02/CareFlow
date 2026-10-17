import { apiRequest, ApiError } from "./apiClient";
import type {
  Appointment,
  AppointmentStatus,
  DoctorSlotsResponse,
  CreateAppointmentPayload,
  UpdateAppointmentPayload,
} from "../types";
import {
  getStoredAppointments,
  saveStoredAppointments,
  getStoredDoctors,
  getStoredPatients,
} from "../data/mockData";

export interface GetAppointmentsParams {
  date?: string;
  startDate?: string;
  endDate?: string;
  doctorId?: number;
  patientId?: number;
  departmentId?: string;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface AppointmentsListResult {
  appointments: Appointment[];
  total: number;
  page: number;
  totalPages: number;
  isFallback?: boolean;
}

export const appointmentService = {
  /**
   * Fetch appointments with search and filters.
   */
  async getAppointments(
    params: GetAppointmentsParams = {}
  ): Promise<AppointmentsListResult> {
    try {
      const queryParams = new URLSearchParams();
      if (params.date) queryParams.set("date", params.date);
      if (params.startDate) queryParams.set("startDate", params.startDate);
      if (params.endDate) queryParams.set("endDate", params.endDate);
      if (params.doctorId) queryParams.set("doctorId", String(params.doctorId));
      if (params.patientId) queryParams.set("patientId", String(params.patientId));
      if (params.departmentId) queryParams.set("departmentId", params.departmentId);
      if (params.status) queryParams.set("status", params.status);
      if (params.search) queryParams.set("search", params.search);
      if (params.page) queryParams.set("page", String(params.page));
      if (params.limit) queryParams.set("limit", String(params.limit));

      const qs = queryParams.toString();
      const endpoint = `/appointments${qs ? `?${qs}` : ""}`;
      const response = await apiRequest<Appointment[]>(endpoint);

      return {
        appointments: response.data,
        total: response.pagination?.total ?? response.data.length,
        page: response.pagination?.page ?? 1,
        totalPages: response.pagination?.totalPages ?? 1,
        isFallback: false,
      };
    } catch (err: any) {
      if (err instanceof ApiError && err.code === "NETWORK_ERROR") {
        console.warn("CareFlow Backend unreachable; serving local appointments store.");
        let stored = getStoredAppointments();

        if (params.date) {
          stored = stored.filter((a) => a.date === params.date);
        }
        if (params.doctorId) {
          stored = stored.filter((a) => a.doctorId === params.doctorId);
        }
        if (params.departmentId) {
          stored = stored.filter(
            (a) =>
              a.department.toLowerCase() === params.departmentId!.toLowerCase() ||
              a.departmentId === params.departmentId
          );
        }
        if (params.status && params.status !== "all" && params.status !== "All") {
          stored = stored.filter(
            (a) => a.status.toLowerCase() === params.status!.toLowerCase()
          );
        }
        if (params.search) {
          const q = params.search.toLowerCase();
          stored = stored.filter(
            (a) =>
              a.patientName.toLowerCase().includes(q) ||
              a.patientMrn.toLowerCase().includes(q) ||
              a.doctorName.toLowerCase().includes(q) ||
              a.department.toLowerCase().includes(q)
          );
        }

        return {
          appointments: stored,
          total: stored.length,
          page: 1,
          totalPages: 1,
          isFallback: true,
        };
      }
      throw err;
    }
  },

  /**
   * Get single appointment record by UUID.
   */
  async getAppointmentById(id: string): Promise<Appointment> {
    try {
      const response = await apiRequest<Appointment>(`/appointments/${id}`);
      return response.data;
    } catch (err: any) {
      if (err instanceof ApiError && err.code === "NETWORK_ERROR") {
        const stored = getStoredAppointments();
        const found = stored.find((a) => a.id === id);
        if (found) return found;
      }
      throw err;
    }
  },

  /**
   * Book a new clinical appointment.
   */
  async createAppointment(payload: CreateAppointmentPayload): Promise<Appointment> {
    try {
      const response = await apiRequest<Appointment>("/appointments", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      return response.data;
    } catch (err: any) {
      if (err instanceof ApiError && err.code === "NETWORK_ERROR") {
        const stored = getStoredAppointments();
        const patients = getStoredPatients();
        const doctors = getStoredDoctors();

        const patient = patients.find((p) => p.id === payload.patientId);
        const doctor = doctors.find((d) => d.id === payload.doctorId);

        // Conflict check
        const conflict = stored.find(
          (a) =>
            a.doctorId === payload.doctorId &&
            a.date === payload.date &&
            a.time === payload.time &&
            a.status !== "Cancelled"
        );
        if (conflict) {
          throw new Error(
            `Doctor ${doctor?.name || "assigned"} already has an appointment booked at ${payload.time} on ${payload.date}.`
          );
        }

        const newApt: Appointment = {
          id: `apt-local-${Date.now()}`,
          patientId: payload.patientId,
          patientName: patient?.name || "Patient",
          patientMrn: patient?.mrn || "CF-2026-999",
          patientPhone: patient?.phone || "",
          patientGender: patient?.gender,
          patientAge: patient?.age,
          doctorId: payload.doctorId,
          doctorName: doctor?.name || "Physician",
          doctorSpecialty: doctor?.specialty,
          doctorRoom: doctor?.room,
          departmentId: payload.departmentId || doctor?.department || "General Clinic",
          department: doctor?.department || "General Clinic",
          date: payload.date,
          time: payload.time,
          type: payload.type,
          status: "Scheduled",
          notes: payload.notes || null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        saveStoredAppointments([newApt, ...stored]);
        return newApt;
      }
      throw err;
    }
  },

  /**
   * Update or reschedule an existing appointment.
   */
  async updateAppointment(
    id: string,
    payload: UpdateAppointmentPayload
  ): Promise<Appointment> {
    try {
      const response = await apiRequest<Appointment>(`/appointments/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      return response.data;
    } catch (err: any) {
      if (err instanceof ApiError && err.code === "NETWORK_ERROR") {
        const stored = getStoredAppointments();
        const index = stored.findIndex((a) => a.id === id);
        if (index === -1) throw new Error("Appointment not found");

        const updated: Appointment = {
          ...stored[index],
          ...payload,
          updatedAt: new Date().toISOString(),
        };
        stored[index] = updated;
        saveStoredAppointments(stored);
        return updated;
      }
      throw err;
    }
  },

  /**
   * Update appointment workflow status (e.g. Confirmed, Checked-in, In-Progress, Completed).
   */
  async updateAppointmentStatus(
    id: string,
    status: AppointmentStatus,
    notes?: string
  ): Promise<Appointment> {
    try {
      const response = await apiRequest<Appointment>(`/appointments/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status, notes }),
      });
      return response.data;
    } catch (err: any) {
      if (err instanceof ApiError && err.code === "NETWORK_ERROR") {
        const stored = getStoredAppointments();
        const index = stored.findIndex((a) => a.id === id);
        if (index === -1) throw new Error("Appointment not found");

        stored[index] = {
          ...stored[index],
          status,
          notes: notes ? `${stored[index].notes || ""} | ${notes}` : stored[index].notes,
          updatedAt: new Date().toISOString(),
        };
        saveStoredAppointments(stored);
        return stored[index];
      }
      throw err;
    }
  },

  /**
   * Cancel an appointment.
   */
  async cancelAppointment(id: string, reason?: string): Promise<Appointment> {
    try {
      const response = await apiRequest<Appointment>(`/appointments/${id}/cancel`, {
        method: "PATCH",
        body: JSON.stringify({ reason }),
      });
      return response.data;
    } catch (err: any) {

      if (err instanceof ApiError && err.code === "NETWORK_ERROR") {
        const stored = getStoredAppointments();
        const index = stored.findIndex((a) => a.id === id);
        if (index === -1) throw new Error("Appointment not found");

        stored[index] = {
          ...stored[index],
          status: "Cancelled",
          notes: reason ? `${stored[index].notes || ""} | Cancelled: ${reason}` : stored[index].notes,
          updatedAt: new Date().toISOString(),
        };
        saveStoredAppointments(stored);
        return stored[index];
      }
      throw err;
    }
  },

  /**
   * Fetch doctor's real-time slot availability for a specific date.
   */
  async getDoctorAvailableSlots(
    doctorId: number,
    date: string
  ): Promise<DoctorSlotsResponse> {
    try {
      const response = await apiRequest<DoctorSlotsResponse>(
        `/appointments/slots/${doctorId}?date=${date}`
      );
      return response.data;
    } catch (err: any) {
      if (err instanceof ApiError && err.code === "NETWORK_ERROR") {
        const doctors = getStoredDoctors();
        const doctor = doctors.find((d) => d.id === doctorId);
        const stored = getStoredAppointments();

        const standardSlots = [
          "09:00 AM",
          "09:30 AM",
          "10:00 AM",
          "10:30 AM",
          "11:00 AM",
          "11:30 AM",
          "02:00 PM",
          "02:30 PM",
          "03:00 PM",
          "03:30 PM",
          "04:00 PM",
        ];

        const bookedForDoctor = stored.filter(
          (a) => a.doctorId === doctorId && a.date === date && a.status !== "Cancelled"
        );
        const bookedTimes = new Set(bookedForDoctor.map((b) => b.time));

        const slots = standardSlots.map((time) => {
          const isBooked = bookedTimes.has(time);
          return {
            time,
            isAvailable: !isBooked,
            isBooked,
            bookedStatus: isBooked ? "Scheduled" : null,
          };
        });

        return {
          doctorId,
          doctorName: doctor?.name || "Physician",
          department: doctor?.department || "General Clinic",
          date,
          day: "Scheduled Day",
          isAvailableDay: true,
          workingHours: "09:00 AM - 05:00 PM",
          totalSlots: slots.length,
          availableSlotsCount: slots.filter((s) => s.isAvailable).length,
          slots,
        };
      }
      throw err;
    }
  },
};
