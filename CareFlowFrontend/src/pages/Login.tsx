import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast, Spinner } from "../components/common";
import "./Login.css";

interface DemoRole {
  role: string;
  email: string;
  name: string;
  badgeColor: string;
}

const DEMO_ROLES: DemoRole[] = [
  { role: "Hospital Admin", email: "admin@careflow.demo", name: "Dr. Alexander Davis", badgeColor: "#0f766e" },
  { role: "Senior Doctor", email: "dr.sharma@careflow.demo", name: "Dr. Rahul Sharma", badgeColor: "#2563eb" },
  { role: "Head Nurse", email: "nurse.patel@careflow.demo", name: "Sister Priya Patel", badgeColor: "#7c3aed" },
  { role: "Receptionist", email: "reception@careflow.demo", name: "Ananya Roy", badgeColor: "#d97706" },
  { role: "Lab Tech", email: "lab@careflow.demo", name: "Vikram Sen", badgeColor: "#059669" },
  { role: "Pharmacist", email: "pharmacy@careflow.demo", name: "Sunil Joshi", badgeColor: "#dc2626" },
];

export const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { showToast } = useToast();

  const [email, setEmail] = useState("admin@careflow.demo");
  const [password, setPassword] = useState("CareFlow@2026");
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState("Hospital Admin");
  const [isLoading, setIsLoading] = useState(false);

  const fromLocation = (location.state as any)?.from?.pathname || "/dashboard";

  const handleRoleSelect = (role: DemoRole) => {
    setSelectedRole(role.role);
    setEmail(role.email);
    setPassword("CareFlow@2026");
    showToast(`Loaded ${role.role} credentials (${role.name})`, "info", 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      showToast("Please enter your email and password", "warning");
      return;
    }

    setIsLoading(true);

    try {
      await login(email, password);
      showToast(`Welcome back! Session verified for ${selectedRole}.`, "success");
      navigate(fromLocation, { replace: true });
    } catch (err: any) {
      showToast(err.message || "Authentication failed. Please verify your credentials.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page" id="careflow-login-page">
      <div className="login-container">
        {/* Left Clinical Brand Showcase */}
        <div className="login-hero-panel">
          <div className="login-hero-overlay" />
          <div className="login-hero-content">
            <div className="login-brand-header">
              <div className="login-brand-icon">
                <svg
                  width="26"
                  height="26"
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
              <div>
                <h1 className="login-brand-title">CareFlow</h1>
                <span className="login-brand-sub">Smart Hospital Operations</span>
              </div>
            </div>

            <div className="login-hero-body">
              <h2 className="login-hero-heading">
                Integrated Healthcare Management, Made Seamless.
              </h2>
              <p className="login-hero-lead">
                Role-specific workspaces orchestrating patient registrations, live queues, consultations, digital prescriptions, lab orders, and pharmacy inventory in real time.
              </p>

              <div className="login-features-list">
                <div className="feature-pill">
                  <span className="feature-check">✓</span>
                  <span>Instant Patient Triage & Queue Tokens</span>
                </div>
                <div className="feature-pill">
                  <span className="feature-check">✓</span>
                  <span>Integrated Clinical Notes & Rx Workflow</span>
                </div>
                <div className="feature-pill">
                  <span className="feature-check">✓</span>
                  <span>Role-Based Access Control (RBAC)</span>
                </div>
                <div className="feature-pill">
                  <span className="feature-check">✓</span>
                  <span>Synthetic HIPAA/GDPR Compliance Sandbox</span>
                </div>
              </div>
            </div>

            <div className="login-hero-footer">
              <div className="security-badge">
                <span className="security-icon">🔒</span>
                <span>Demo Environment • Educational Synthetic Data</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Form Card */}
        <div className="login-form-panel">
          <div className="login-card">
            <div className="login-card-header">
              <h2 className="login-form-title">Sign In to Workspace</h2>
              <p className="login-form-subtitle">
                Access your hospital operational dashboard and medical records.
              </p>
            </div>

            {/* Quick Demo Role Selector */}
            <div className="demo-roles-section">
              <label className="demo-roles-label">
                QUICK DEMO ROLES (Click to autofill)
              </label>
              <div className="demo-roles-grid">
                {DEMO_ROLES.map((r) => (
                  <button
                    type="button"
                    key={r.role}
                    className={`demo-role-btn ${selectedRole === r.role ? "active" : ""}`}
                    onClick={() => handleRoleSelect(r)}
                  >
                    <span
                      className="demo-role-indicator"
                      style={{ backgroundColor: r.badgeColor }}
                    />
                    <span className="demo-role-name">{r.role}</span>
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="login-form">
              {/* Email Field */}
              <div className="login-form-group form-group">
                <label htmlFor="login-email" className="login-form-label form-label">
                  Work Email / Staff ID
                </label>
                <div className="login-input-icon-wrapper input-icon-wrapper">
                  <svg className="login-input-icon input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect width="20" height="16" x="2" y="4" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                  <input
                    id="login-email"
                    type="email"
                    className="login-form-input form-input"
                    placeholder="doctor@hospital.org"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="login-form-group form-group">
                <div className="login-form-label-row form-label-row">
                  <label htmlFor="login-password" className="login-form-label form-label">
                    Password
                  </label>
                  <button
                    type="button"
                    className="forgot-password-link"
                    onClick={() => showToast("Password reset available in Phase 5", "info")}
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="login-input-icon-wrapper input-icon-wrapper">
                  <svg className="login-input-icon input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  <input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    className="login-form-input form-input"
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? "👁️" : "👁️‍🗨️"}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="login-form-row-checkbox form-row-checkbox">
                <label className="login-checkbox-label checkbox-label">
                  <input type="checkbox" defaultChecked className="login-checkbox-input checkbox-input" />
                  <span>Remember this clinical terminal</span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="login-submit-btn"
                disabled={isLoading}
                id="btn-login-submit"
              >
                {isLoading ? (
                  <div className="btn-loading-content">
                    <Spinner size="sm" color="white" />
                    <span>Authenticating Workspace...</span>
                  </div>
                ) : (
                  <span>Sign In as {selectedRole} →</span>
                )}
              </button>
            </form>

            <div className="login-footer-notes">
              <p>
                Default demo pass: <span className="highlight-pass">CareFlow@2026</span>
              </p>
              <p className="login-security-notice">
                Protected healthcare operational portal. Unauthorized access is recorded in system audit logs.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;