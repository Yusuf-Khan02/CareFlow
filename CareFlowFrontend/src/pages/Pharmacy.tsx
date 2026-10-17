import { useNavigate } from "react-router-dom";
import "./ModulePlaceholder.css";

export const Pharmacy = () => {
  const navigate = useNavigate();

  return (
    <div className="module-placeholder-page" id="page-pharmacy">
      <div className="module-header">
        <div>
          <h1 className="module-title">Pharmacy & Medication Inventory</h1>
          <p className="module-subtitle">Dispense e-prescriptions, track batch expiry, monitor stock minimums, and manage reorders.</p>
        </div>
        <div className="module-header-badge">
          <span className="phase-badge">Phase 10 Module</span>
        </div>
      </div>

      <div className="placeholder-banner-card">
        <div className="placeholder-icon-circle">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z" />
            <path d="m8.5 8.5 7 7" />
          </svg>
        </div>
        <div className="placeholder-content">
          <h3>Formulary & Stock Dispensing Engine Coming in Phase 10</h3>
          <p>
            Features will connect physician prescriptions directly to pharmacy dispensing, ledger movements, lot batch numbering, expiry warnings, and automated supplier replenishment alerts.
          </p>
          <div className="placeholder-tags">
            <span className="tech-tag">Prescription Linked</span>
            <span className="tech-tag">Batch & Expiry Ledger</span>
            <span className="tech-tag">Low-Stock Warnings</span>
          </div>
          <button
            type="button"
            className="placeholder-cta-btn"
            onClick={() => navigate("/dashboard")}
          >
            ← Return to Operations Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default Pharmacy;