import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import type { UserRole } from "../../types";
import "./sidebar.css";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

interface NavItem {
  to: string;
  label: string;
  roles?: UserRole[];
  icon: (active: boolean) => React.ReactNode;
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  {
    to: "/dashboard",
    label: "Dashboard",
    icon: () => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="7" height="9" x="3" y="3" rx="1" />
        <rect width="7" height="5" x="14" y="3" rx="1" />
        <rect width="7" height="9" x="14" y="12" rx="1" />
        <rect width="7" height="5" x="3" y="16" rx="1" />
      </svg>
    ),
  },
  {
    to: "/patients",
    label: "Patients",
    badge: "6 Active",
    roles: ["Admin", "Hospital Admin", "Doctor", "Nurse", "Receptionist"],
    icon: () => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    to: "/doctors",
    label: "Doctors & Staff",
    roles: ["Admin", "Hospital Admin", "Doctor", "Nurse", "Receptionist", "Patient"],
    icon: () => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3" />
        <path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4" />
        <circle cx="20" cy="10" r="2" />
      </svg>
    ),
  },
  {
    to: "/appointments",
    label: "Appointments",
    icon: () => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 2v4" />
        <path d="M16 2v4" />
        <rect width="18" height="18" x="3" y="4" rx="2" />
        <path d="M3 10h18" />
        <path d="M8 14h.01" />
        <path d="M12 14h.01" />
        <path d="M16 14h.01" />
        <path d="M8 18h.01" />
        <path d="M12 18h.01" />
      </svg>
    ),
  },
  {
    to: "/queue",
    label: "Queue & Check-in",
    badge: "12 Waiting",
    roles: ["Admin", "Hospital Admin", "Doctor", "Nurse", "Receptionist"],
    icon: () => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="8" x2="21" y1="6" y2="6" />
        <line x1="8" x2="21" y1="12" y2="12" />
        <line x1="8" x2="21" y1="18" y2="18" />
        <line x1="3" x2="3.01" y1="6" y2="6" />
        <line x1="3" x2="3.01" y1="12" y2="12" />
        <line x1="3" x2="3.01" y1="18" y2="18" />
      </svg>
    ),
  },
  {
    to: "/consultations",
    label: "Consultations & EMR",
    roles: ["Admin", "Hospital Admin", "Doctor", "Nurse"],
    icon: () => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
        <path d="M12 5v6" />
        <path d="M9 8h6" />
      </svg>
    ),
  },
  {
    to: "/laboratory",
    label: "Laboratory",
    roles: ["Admin", "Hospital Admin", "Doctor", "LabTech", "Nurse"],
    icon: () => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 2v7.527a2 2 0 0 1-.211.896L4.72 20.55a1 1 0 0 0 .9 1.45h12.76a1 1 0 0 0 .9-1.45l-5.069-10.127A2 2 0 0 1 14 9.527V2" />
        <path d="M8.5 2h7" />
        <path d="M7 16h10" />
      </svg>
    ),
  },
  {
    to: "/pharmacy",
    label: "Pharmacy",
    roles: ["Admin", "Hospital Admin", "Doctor", "Pharmacist"],
    icon: () => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z" />
        <path d="m8.5 8.5 7 7" />
      </svg>
    ),
  },
  {
    to: "/beds",
    label: "Beds & Wards",
    badge: "16 Beds",
    roles: ["Admin", "Hospital Admin", "Doctor", "Nurse", "Receptionist"],
    icon: () => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 20v-8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v8" />
        <path d="M4 10V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4" />
        <path d="M12 4v6" />
        <path d="M2 18h20" />
      </svg>
    ),
  },
  {
    to: "/billing",
    label: "Billing & Invoices",
    roles: ["Admin", "Hospital Admin", "Doctor", "Receptionist"],
    icon: () => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="20" height="14" x="2" y="5" rx="2" />
        <line x1="2" x2="22" y1="10" y2="10" />
      </svg>
    ),
  },
  {
    to: "/reports",
    label: "Reports & Analytics",
    roles: ["Admin", "Hospital Admin", "Doctor"],
    icon: () => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 3v18h18" />
        <path d="M18 17V9" />
        <path d="M13 17V5" />
        <path d="M8 17v-3" />
      </svg>
    ),
  },
  {
    to: "/audit-logs",
    label: "Audit Logs & Security",
    roles: ["Admin", "Hospital Admin", "Doctor"],
    badge: "SOC2",
    icon: () => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    ),
  },
  {
    to: "/jobs",
    label: "Background Jobs",
    roles: ["Admin", "Hospital Admin", "Doctor"],
    badge: "BullMQ",
    icon: () => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
    ),
  },
  {
    to: "/files",
    label: "Files & Clinical AI",
    roles: ["Admin", "Hospital Admin", "Doctor", "Nurse", "LabTech"],
    badge: "AI Vault",
    icon: () => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <path d="M12 18v-4" />
        <path d="m9 15 3-3 3 3" />
      </svg>
    ),
  },
];

export const Sidebar = ({ isOpen = false, onClose }: SidebarProps) => {
  const { user, hasRole } = useAuth();

  const visibleNavItems = NAV_ITEMS.filter((item) => {
    if (!item.roles || item.roles.length === 0) return true;
    if (!user) return true;
    return hasRole(...item.roles);
  });

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="sidebar-mobile-backdrop"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside className={`sidebar ${isOpen ? "sidebar-mobile-open" : ""}`} id="careflow-sidebar">
        {/* Brand Header */}
        <div className="sidebar-brand-wrapper">
          <div className="sidebar-brand">
            <div className="brand-icon-box">
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                <path d="M12 5v6" />
                <path d="M9 8h6" />
              </svg>
            </div>
            <div className="brand-text">
              <span className="brand-name">CareFlow</span>
              <span className="brand-tagline">Operations OS</span>
            </div>
          </div>

          {/* Mobile close button */}
          <button
            type="button"
            className="sidebar-close-btn"
            onClick={onClose}
            aria-label="Close navigation sidebar"
          >
            ✕
          </button>
        </div>

        {/* Section Label */}
        <div className="sidebar-section-title">CLINICAL WORKSPACES</div>

        {/* Navigation Links */}
        <nav className="sidebar-nav">
          {visibleNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                isActive ? "sidebar-link active" : "sidebar-link"
              }
              id={`nav-link-${item.to.replace("/", "")}`}
            >
              {({ isActive }) => (
                <>
                  <span className="sidebar-link-icon">{item.icon(isActive)}</span>
                  <span className="sidebar-link-label">{item.label}</span>
                  {item.badge && (
                    <span className="sidebar-link-badge">{item.badge}</span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Bottom Hospital Workspace Badge */}
        <div className="sidebar-footer">
          <div className="sidebar-hospital-card">
            <div className="hospital-card-top">
              <span className="hospital-badge-status">
                {user ? `● ${user.role}` : "● Guest"}
              </span>
              <span className="hospital-version">v0.1.0</span>
            </div>
            <h5 className="hospital-card-name">
              {user?.name || "Metropolitan General"}
            </h5>
            <p className="hospital-card-desc">
              {user ? `Active Workspace • ${user.email}` : "Synthetic Clinical Mode"}
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;