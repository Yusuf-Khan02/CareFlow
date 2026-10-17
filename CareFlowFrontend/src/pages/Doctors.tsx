import { useNavigate } from "react-router-dom";
import "./ModulePlaceholder.css";

export const Doctors = () => {
  const navigate = useNavigate();

  return (
    <div className="module-placeholder-page" id="page-doctors">
      <div className="module-header">
        <div>
          <h1 className="module-title">Doctors & Clinical Staff Directory</h1>
          <p className="module-subtitle">View staff profiles, specialties, active duty rosters, and consultation availability.</p>
        </div>
        <div className="module-header-badge">
          <span className="phase-badge">Phase 2.5 Module</span>
        </div>
      </div>

      <div className="placeholder-banner-card">
        <div className="placeholder-icon-circle">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3" />
            <path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4" />
            <circle cx="20" cy="10" r="2" />
          </svg>
        </div>
        <div className="placeholder-content">
          <h3>Staff Directory & Shift Management Coming in Phase 2</h3>
          <p>
            This section will feature clinician profiles across Cardiology, Neurology, Pediatrics, and Orthopedics, weekly rota management, and consultation schedule configurations.
          </p>
          <div className="placeholder-tags">
            <span className="tech-tag">Department Rostering</span>
            <span className="tech-tag">Doctor Profile Cards</span>
            <span className="tech-tag">Workload Analytics</span>
          </div>
          <button
            type="button"
            className="placeholder-cta-btn"
            onClick={() => navigate("/patients")}
          >
            ← View Patient Directory
          </button>
        </div>
      </div>
    </div>
  );
};

export default Doctors;