import { useNavigate } from "react-router-dom";
import "./NotFound.css";

export const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="notfound-page" id="page-not-found">
      <div className="notfound-card animate-fade-in">
        <div className="notfound-badge">404 ERROR</div>
        <div className="notfound-icon-box">
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
            <circle cx="12" cy="12" r="10" />
            <path d="m15 9-6 6" />
            <path d="m9 9 6 6" />
          </svg>
        </div>
        <h1 className="notfound-title">Clinical Page Not Found</h1>
        <p className="notfound-desc">
          The requested operational resource, department workspace, or patient record route cannot be found in the current hospital directory.
        </p>

        <div className="notfound-actions">
          <button
            type="button"
            className="notfound-btn-primary"
            onClick={() => navigate("/dashboard")}
            id="btn-notfound-dashboard"
          >
            ← Return to Operations Dashboard
          </button>
          <button
            type="button"
            className="notfound-btn-secondary"
            onClick={() => navigate("/patients")}
            id="btn-notfound-patients"
          >
            Search Patient Registry
          </button>
        </div>

        <div className="notfound-meta">
          <span>CareFlow Smart Hospital Operations • System Error Code: E_PAGE_NOT_FOUND</span>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
