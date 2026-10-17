import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../common";
import "./Navbar.css";

interface NavbarProps {
  onToggleMobileSidebar?: () => void;
}

interface Notification {
  id: string;
  title: string;
  description: string;
  time: string;
  type: "urgent" | "warning" | "info";
  read: boolean;
}

const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: "1",
    title: "Critical Lab Alert",
    description: "Arjun Mehta (Cardiology) - Troponin level elevated (0.08 ng/mL).",
    time: "5 mins ago",
    type: "urgent",
    read: false,
  },
  {
    id: "2",
    title: "Pharmacy Low Stock",
    description: "Amoxicillin 500mg down to 12 boxes. Auto-reorder suggested.",
    time: "24 mins ago",
    type: "warning",
    read: false,
  },
  {
    id: "3",
    title: "Patient Check-in",
    description: "Priya Singh checked in for Orthology consultation. Token #A-104 issued.",
    time: "42 mins ago",
    type: "info",
    read: false,
  },
  {
    id: "4",
    title: "Ward Bed Cleaned",
    description: "Ward B, Bed #04 marked clean and ready for admission.",
    time: "1 hour ago",
    type: "info",
    read: true,
  },
];

export const Navbar = ({ onToggleMobileSidebar }: NavbarProps) => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<"all" | "urgent" | "unread">("all");

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    showToast("All notifications marked as read", "success");
  };

  const handleToggleRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: !n.read } : n))
    );
  };

  const handleSignOut = () => {
    setIsProfileOpen(false);
    showToast("Signed out successfully. Returning to login.", "info");
    navigate("/login");
  };

  const filteredNotifs = notifications.filter((n) => {
    if (activeFilter === "urgent") return n.type === "urgent";
    if (activeFilter === "unread") return !n.read;
    return true;
  });

  return (
    <header className="navbar" id="careflow-top-navbar">
      <div className="navbar-left">
        {/* Mobile Sidebar Hamburger Toggle */}
        <button
          type="button"
          className="mobile-menu-btn"
          onClick={onToggleMobileSidebar}
          aria-label="Toggle navigation menu"
          id="btn-mobile-sidebar-toggle"
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="4" x2="20" y1="12" y2="12" />
            <line x1="4" x2="20" y1="6" y2="6" />
            <line x1="4" x2="20" y1="18" y2="18" />
          </svg>
        </button>

        <div className="navbar-headings">
          <h2 className="navbar-title">Hospital Operations</h2>
          <span className="navbar-subtitle">CareFlow Medical Center • General Clinic</span>
        </div>
      </div>

      <div className="navbar-right">
        {/* Status Pill */}
        <div className="navbar-status-pill">
          <span className="status-dot-pulsing" />
          <span className="status-text">System Live</span>
        </div>

        {/* Notification Bell & Dropdown */}
        <div className="navbar-dropdown-wrapper" ref={notifRef}>
          <button
            type="button"
            className={`navbar-icon-btn ${isNotifOpen ? "active" : ""}`}
            onClick={() => {
              setIsNotifOpen((prev) => !prev);
              setIsProfileOpen(false);
            }}
            aria-label="Notifications"
            id="btn-notifications-toggle"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
              <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
            </svg>
            {unreadCount > 0 && (
              <span className="notif-badge">{unreadCount}</span>
            )}
          </button>

          {isNotifOpen && (
            <div className="dropdown-panel notif-panel animate-scale-up" id="notifications-panel">
              <div className="notif-panel-header">
                <div className="notif-header-title">
                  <h4>Alerts & Notifications</h4>
                  {unreadCount > 0 && (
                    <span className="notif-counter-pill">{unreadCount} unread</span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    className="notif-mark-read-btn"
                    onClick={handleMarkAllRead}
                  >
                    Mark all read
                  </button>
                )}
              </div>

              {/* Notification Filter Tabs */}
              <div className="notif-filter-tabs">
                <button
                  type="button"
                  className={`notif-tab ${activeFilter === "all" ? "active" : ""}`}
                  onClick={() => setActiveFilter("all")}
                >
                  All ({notifications.length})
                </button>
                <button
                  type="button"
                  className={`notif-tab ${activeFilter === "urgent" ? "active" : ""}`}
                  onClick={() => setActiveFilter("urgent")}
                >
                  Urgent ({notifications.filter((n) => n.type === "urgent").length})
                </button>
                <button
                  type="button"
                  className={`notif-tab ${activeFilter === "unread" ? "active" : ""}`}
                  onClick={() => setActiveFilter("unread")}
                >
                  Unread ({unreadCount})
                </button>
              </div>

              {/* Notifications List */}
              <div className="notif-list">
                {filteredNotifs.length === 0 ? (
                  <div className="notif-empty">
                    <p>No notifications match this filter.</p>
                  </div>
                ) : (
                  filteredNotifs.map((item) => (
                    <div
                      key={item.id}
                      className={`notif-item notif-${item.type} ${!item.read ? "unread" : ""}`}
                      onClick={() => handleToggleRead(item.id)}
                    >
                      <div className="notif-item-indicator" />
                      <div className="notif-item-content">
                        <div className="notif-item-top">
                          <span className="notif-item-title">{item.title}</span>
                          <span className="notif-item-time">{item.time}</span>
                        </div>
                        <p className="notif-item-desc">{item.description}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="notif-footer">
                <button
                  type="button"
                  className="notif-view-all-btn"
                  onClick={() => {
                    setIsNotifOpen(false);
                    showToast("Navigating to notification center", "info");
                  }}
                >
                  View All Operational Logs →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Menu */}
        <div className="navbar-dropdown-wrapper" ref={profileRef}>
          <button
            type="button"
            className="user-profile-button"
            onClick={() => {
              setIsProfileOpen((prev) => !prev);
              setIsNotifOpen(false);
            }}
            aria-label="User Profile"
            id="btn-user-profile-toggle"
          >
            <div className="user-avatar">
              <span>AD</span>
              <span className="avatar-online-dot" />
            </div>
            <div className="user-info-text">
              <span className="user-name">Dr. A. Davis</span>
              <span className="user-role">Hospital Admin</span>
            </div>
            <svg
              className={`user-chevron ${isProfileOpen ? "rotated" : ""}`}
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          {isProfileOpen && (
            <div className="dropdown-panel profile-panel animate-scale-up" id="user-profile-panel">
              <div className="profile-panel-header">
                <div className="profile-avatar-lg">AD</div>
                <div className="profile-details">
                  <h4 className="profile-display-name">Dr. Alexander Davis</h4>
                  <p className="profile-email">admin@careflow.demo</p>
                  <span className="profile-badge">Platform Administrator</span>
                </div>
              </div>

              <div className="profile-section-divider" />

              <div className="profile-menu-items">
                <button
                  type="button"
                  className="profile-menu-item"
                  onClick={() => {
                    setIsProfileOpen(false);
                    showToast("Profile Settings (Phase 13)", "info");
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                  </svg>
                  <span>Account Settings</span>
                </button>

                <button
                  type="button"
                  className="profile-menu-item"
                  onClick={() => {
                    setIsProfileOpen(false);
                    showToast("Hospital Department Config (Phase 13)", "info");
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    <polyline points="9 22 9 12 15 12 15 22" />
                  </svg>
                  <span>Hospital Profile & Branches</span>
                </button>
              </div>

              <div className="profile-section-divider" />

              <div className="profile-menu-items">
                <button
                  type="button"
                  className="profile-menu-item profile-sign-out-btn"
                  onClick={handleSignOut}
                  id="btn-profile-signout"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" x2="9" y1="12" y2="12" />
                  </svg>
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;