import { useNavigate } from "react-router-dom";
import "./AccessDenied.css";

export const AccessDenied = () => {
  const navigate = useNavigate();

  return (
    <div className="access-denied-page" id="page-access-denied">
      <div className="access-denied-card animate-fade-in">
        <div className="access-badge">403 FORBIDDEN</div>
        <div className="access-icon-box">
          <svg
            width="64"
            height="64"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>
        <h1 className="access-title">Access Denied (403)</h1>
        <p className="access-desc">
          Your current clinical role does not possess authorization privileges to view this department workspace or execute this sensitive medical action.
        </p>

        <div className="role-security-box">
          <div className="security-box-header">
            <span>Security Principle</span>
            <span className="security-pill">Least Privilege RBAC</span>
          </div>
          <p className="security-box-text">
            Sensitive operations such as prescribing medication, billing adjustments, and platform-level configurations require specific role assignments.
          </p>
        </div>

        <div className="access-actions">
          <button
            type="button"
            className="access-btn-primary"
            onClick={() => navigate("/dashboard")}
            id="btn-access-dashboard"
          >
            ← Back to Authorized Dashboard
          </button>
          <button
            type="button"
            className="access-btn-secondary"
            onClick={() => navigate("/login")}
            id="btn-access-switch-role"
          >
            Switch Role at Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccessDenied;
