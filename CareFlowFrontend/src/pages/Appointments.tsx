import { useNavigate } from "react-router-dom";
import "./ModulePlaceholder.css";

export const Appointments = () => {
  const navigate = useNavigate();

  return (
    <div className="module-placeholder-page" id="page-appointments">
      <div className="module-header">
        <div>
          <h1 className="module-title">Appointments & Scheduling</h1>
          <p className="module-subtitle">Manage doctor schedules, outpatient bookings, and patient arrival statuses.</p>
        </div>
        <div className="module-header-badge">
          <span className="phase-badge">Phase 6 Module</span>
        </div>
      </div>

      <div className="placeholder-banner-card">
        <div className="placeholder-icon-circle">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8 2v4" />
            <path d="M16 2v4" />
            <rect width="18" height="18" x="3" y="4" rx="2" />
            <path d="M3 10h18" />
            <path d="M8 14h.01" />
            <path d="M12 14h.01" />
            <path d="M16 14h.01" />
          </svg>
        </div>
        <div className="placeholder-content">
          <h3>Full Calendar & Slot Management Coming in Phase 6</h3>
          <p>
            This section will include double-booking prevention, configurable consultation buffers, doctor shift availability, recurring schedules, and direct check-in workflows.
          </p>
          <div className="placeholder-tags">
            <span className="tech-tag">Calendar Grid View</span>
            <span className="tech-tag">Real-Time Slot Engine</span>
            <span className="tech-tag">Check-in Sync</span>
          </div>
          <button
            type="button"
            className="placeholder-cta-btn"
            onClick={() => navigate("/dashboard")}
          >
            ← View Today's Appointments on Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default Appointments;