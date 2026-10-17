import { useNavigate } from "react-router-dom";
import "./ModulePlaceholder.css";

export const Queue = () => {
  const navigate = useNavigate();

  return (
    <div className="module-placeholder-page" id="page-queue">
      <div className="module-header">
        <div>
          <h1 className="module-title">Live Patient Queue & Check-in</h1>
          <p className="module-subtitle">Manage token issuance, department waiting lines, call-next audio signals, and status tracking.</p>
        </div>
        <div className="module-header-badge">
          <span className="phase-badge">Phase 7 Module</span>
        </div>
      </div>

      <div className="placeholder-banner-card">
        <div className="placeholder-icon-circle">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="8" x2="21" y1="6" y2="6" />
            <line x1="8" x2="21" y1="12" y2="12" />
            <line x1="8" x2="21" y1="18" y2="18" />
            <line x1="3" x2="3.01" y1="6" y2="6" />
            <line x1="3" x2="3.01" y1="12" y2="12" />
            <line x1="3" x2="3.01" y1="18" y2="18" />
          </svg>
        </div>
        <div className="placeholder-content">
          <h3>Real-Time Token Flow & Department Queues Coming in Phase 7</h3>
          <p>
            Features will provide live token generation, multi-counter calling, waiting time estimates, doctor room assignments, and Socket.IO real-time synchronized status boards.
          </p>
          <div className="placeholder-tags">
            <span className="tech-tag">Token Slip Print</span>
            <span className="tech-tag">Call Next Action</span>
            <span className="tech-tag">Wait-Time Metrics</span>
          </div>
          <button
            type="button"
            className="placeholder-cta-btn"
            onClick={() => navigate("/dashboard")}
          >
            ← View Queue Widget on Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default Queue;