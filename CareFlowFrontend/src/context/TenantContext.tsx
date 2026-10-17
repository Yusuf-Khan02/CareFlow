import React, { createContext, useContext, useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { Organization } from "../types";
import { organizationService } from "../services/organizationService";

interface TenantContextType {
  activeOrganization: Organization | null;
  organizations: Organization[];
  isLoading: boolean;
  switchOrganization: (orgId: string) => void;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export const TenantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = useQueryClient();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [activeOrgId, setActiveOrgId] = useState<string>(() => {
    return localStorage.getItem("careflow_tenant_id") || "org-careflow-central";
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Fetch registered hospital facilities
  useEffect(() => {
    const fetchOrgs = async () => {
      try {
        const orgs = await organizationService.getOrganizations();
        setOrganizations(orgs);

        // Ensure active tenant is valid
        const found = orgs.find((o) => o.id === activeOrgId || o.code === activeOrgId);
        if (found) {
          localStorage.setItem("careflow_tenant_id", found.id);
          setActiveOrgId(found.id);
        } else if (orgs.length > 0) {
          localStorage.setItem("careflow_tenant_id", orgs[0].id);
          setActiveOrgId(orgs[0].id);
        }
      } catch (err) {
        console.warn("Failed to load organizations:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrgs();
  }, []);

  const switchOrganization = (orgId: string) => {
    const org = organizations.find((o) => o.id === orgId || o.code === orgId);
    if (!org) return;

    localStorage.setItem("careflow_tenant_id", org.id);
    setActiveOrgId(org.id);

    // Invalidate all queries so the entire app immediately renders the newly active facility's isolated data!
    queryClient.invalidateQueries();
  };

  const activeOrganization =
    organizations.find((o) => o.id === activeOrgId) || organizations[0] || null;

  const value: TenantContextType = {
    activeOrganization,
    organizations,
    isLoading,
    switchOrganization,
  };

  return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>;
};

export const useTenant = (): TenantContextType => {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error("useTenant must be used within a TenantProvider");
  }
  return context;
};

export default TenantContext;
