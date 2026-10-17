import { useNavigate } from "react-router-dom";
import "./ModulePlaceholder.css";

export const Laboratory = () => {
  const navigate = useNavigate();

  return (
    <div className="module-placeholder-page" id="page-laboratory">
      <div className="module-header">
        <div>
          <h1 className="module-title">Laboratory & Diagnostic Tests</h1>
          <p className="module-subtitle">Process lab orders, track sample collection, record biochemical results, and review ranges.</p>
        </div>
        <div className="module-header-badge">
          <span className="phase-badge">Phase 9 Module</span>
        </div>
      </div>

      <div className="placeholder-banner-card">
        <div className="placeholder-icon-circle">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 2v7.527a2 2 0 0 1-.211.896L4.72 20.55a1 1 0 0 0 .9 1.45h12.76a1 1 0 0 0 .9-1.45l-5.069-10.127A2 2 0 0 1 14 9.527V2" />
            <path d="M8.5 2h7" />
            <path d="M7 16h10" />
          </svg>
        </div>
        <div className="placeholder-content">
          <h3>Diagnostic Orders & Results Workflow Coming in Phase 9</h3>
          <p>
            Features will include automated test catalogs (CBC, Lipid Panel, Troponin-I, Liver Function), barcode sample tracking, reference range validation, and critical alert dispatching.
          </p>
          <div className="placeholder-tags">
            <span className="tech-tag">Test Catalog</span>
            <span className="tech-tag">Sample Tracking</span>
            <span className="tech-tag">Verified Result Entry</span>
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

export default Laboratory;