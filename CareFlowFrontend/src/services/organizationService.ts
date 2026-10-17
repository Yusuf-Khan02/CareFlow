import { apiRequest } from "./apiClient";
import type { Organization } from "../types";

export const organizationService = {
  /**
   * List all registered hospital organizations / tenants
   */
  async getOrganizations(): Promise<Organization[]> {
    try {
      const response = await apiRequest<Organization[]>("/organizations");
      return response.data || response;
    } catch {
      return [
        {
          id: "org-careflow-central",
          name: "CareFlow Central Hospital",
          code: "CF-CENTRAL",
          address: "100 Hospital Way, Medical District, Metropolis",
          phone: "+1 (555) 019-2834",
          email: "contact@careflow-central.org",
          status: "Active",
          taxId: "CF-TAX-2026-991",
          licenseNumber: "HOSP-LIC-2026-A1",
          stats: {
            usersCount: 3,
            departmentsCount: 5,
            patientsCount: 6,
            auditLogsCount: 5,
          },
        },
        {
          id: "org-careflow-west",
          name: "CareFlow West Metro Pavilion",
          code: "CF-WEST",
          address: "450 West Health Blvd, West Suburbs",
          phone: "+1 (555) 092-4819",
          email: "info@careflow-west.org",
          status: "Active",
          taxId: "CF-TAX-2026-882",
          licenseNumber: "HOSP-LIC-2026-B4",
          stats: {
            usersCount: 1,
            departmentsCount: 1,
            patientsCount: 2,
            auditLogsCount: 3,
          },
        },
      ];
    }
  },

  /**
   * Get organization by ID or Code
   */
  async getOrganizationById(idOrCode: string): Promise<Organization> {
    try {
      const response = await apiRequest<Organization>(`/organizations/${idOrCode}`);
      return response.data || response;
    } catch (err) {
      throw err;
    }
  },
};

export default organizationService;
