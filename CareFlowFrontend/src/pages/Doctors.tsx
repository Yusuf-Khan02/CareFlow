import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import type { DoctorStatus } from "../types";
import { doctorService } from "../services";
import { Spinner, ErrorState, EmptyState } from "../components/common";
import "./Doctors.css";

export const Doctors = () => {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("");
  const [status, setStatus] = useState<string>("");

  const {
    data: doctors = [],
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["doctors", { search, department, status }],
    queryFn: () => doctorService.getDoctors({ search, department, status }),
  });

  const filteredDoctors = useMemo(() => {
    return doctors.filter((doc) => {
      const q = search.toLowerCase();
      const matchesSearch =
        doc.name.toLowerCase().includes(q) ||
        doc.specialty.toLowerCase().includes(q) ||
        doc.qualification.toLowerCase().includes(q);

      const matchesDept =
        department === "" ||
        doc.department.toLowerCase() === department.toLowerCase();

      const matchesStatus =
        status === "" || doc.status.toLowerCase() === status.toLowerCase();

      return matchesSearch && matchesDept && matchesStatus;
    });
  }, [doctors, search, department, status]);

  const onDutyCount = doctors.filter((d) => d.status === "On Duty").length;
  const inConsultCount = doctors.filter((d) => d.status === "In Consultation").length;
  const onLeaveCount = doctors.filter((d) => d.status === "On Leave").length;

  return (
    <div className="doctors-page" id="doctors-directory-page">
      {/* Page Header */}
      <div className="doctors-header">
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h1 className="doctors-title">Medical Staff & Specialists Directory</h1>
            {isFetching && (
              <span
                style={{
                  fontSize: "12px",
                  color: "var(--color-primary)",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                  background: "rgba(14, 165, 233, 0.1)",
                  padding: "2px 8px",
                  borderRadius: "12px",
                }}
              >
                ● Syncing Staff DB...
              </span>
            )}
          </div>
          <p className="doctors-subtitle">
            Browse attending physicians, clinical credentials, daily duty statuses, and consultation schedules.
          </p>
        </div>

        <button
          type="button"
          className="doctors-action-btn"
          onClick={() => navigate("/appointments")}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect width="18" height="18" x="3" y="4" rx="2" />
            <path d="M16 2v4" />
            <path d="M8 2v4" />
            <path d="M3 10h18" />
          </svg>
          <span>View Master Rota</span>
        </button>
      </div>

      {/* Doctor Stats Cards */}
      <div className="doctors-stats-bar">
        <div className="doc-stat-card">
          <span className="doc-stat-label">TOTAL PHYSICIANS</span>
          <span className="doc-stat-val">{doctors.length}</span>
          <span className="doc-stat-sub">Across 6 departments</span>
        </div>
        <div className="doc-stat-card card-on-duty">
          <span className="doc-stat-label">ON DUTY NOW</span>
          <span className="doc-stat-val">{onDutyCount}</span>
          <span className="doc-stat-sub">Available for intake</span>
        </div>
        <div className="doc-stat-card card-consult">
          <span className="doc-stat-label">IN CONSULTATION</span>
          <span className="doc-stat-val">{inConsultCount}</span>
          <span className="doc-stat-sub">Actively with patients</span>
        </div>
        <div className="doc-stat-card card-leave">
          <span className="doc-stat-label">ON LEAVE</span>
          <span className="doc-stat-val">{onLeaveCount}</span>
          <span className="doc-stat-sub">Off clinic shift</span>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="doctors-search-bar">
        <div className="doc-search-input-box">
          <svg className="doc-search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" x2="16.65" y1="21" y2="16.65" />
          </svg>
          <input
            type="text"
            className="doc-search-input"
            placeholder="Search by physician name, specialty, or qualifications..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            id="input-doctor-search"
          />
          {search && (
            <button
              type="button"
              className="clear-search-btn"
              onClick={() => setSearch("")}
            >
              ✕
            </button>
          )}
        </div>

        <div className="doc-filters-group">
          <select
            className="doc-filter-select"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
          >
            <option value="">All Specialties</option>
            <option value="Cardiology">Cardiology</option>
            <option value="Neurology">Neurology</option>
            <option value="Gastro">Gastroenterology</option>
            <option value="Orthology">Orthopedics</option>
            <option value="General Physician">Internal Medicine</option>
            <option value="Pediatrics">Pediatrics</option>
          </select>

          <select
            className="doc-filter-select"
            value={status}
            onChange={(e) => setStatus(e.target.value as DoctorStatus)}
          >
            <option value="">All Duty Status</option>
            <option value="On Duty">On Duty</option>
            <option value="In Consultation">In Consultation</option>
            <option value="On Leave">On Leave</option>
          </select>
        </div>
      </div>

      {/* Content State: Loading, Error, Empty, or Cards Grid */}
      {isLoading ? (
        <div style={{ padding: "80px 0", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
          <Spinner size="lg" color="primary" />
          <p style={{ color: "var(--color-text-secondary)", fontSize: "14px" }}>Loading clinicians from SQL database...</p>
        </div>
      ) : isError ? (
        <ErrorState
          title="Failed to Load Clinicians"
          message={error?.message || "Could not retrieve doctor directory from API."}
          onRetry={() => refetch()}
        />
      ) : filteredDoctors.length === 0 ? (
        <EmptyState
          title="No Clinicians Found"
          description="No physicians match your search criteria. Try modifying your search or filters."
          actionText="Reset Filters"
          onAction={() => {
            setSearch("");
            setDepartment("");
            setStatus("");
          }}
        />
      ) : (
        <div className="doctors-cards-grid">
          {filteredDoctors.map((doc) => (
            <div
              key={doc.id}
              className="doctor-card animate-fade-in"
              id={`doctor-card-${doc.id}`}
            >
              <div className="doctor-card-top">
                <div className="doctor-avatar-circle">
                  <span>{doc.name.replace("Dr. ", "").charAt(0)}</span>
                  <span
                    className={`doctor-status-indicator status-indicator-${doc.status.toLowerCase().replace(/\s+/g, "-")}`}
                    title={doc.status}
                  />
                </div>

                <div className="doctor-top-meta">
                  <span className={`doctor-duty-badge duty-${doc.status.toLowerCase().replace(/\s+/g, "-")}`}>
                    {doc.status}
                  </span>
                  <div className="doctor-rating">
                    <span>★</span>
                    <strong>{doc.rating.toFixed(1)}</strong>
                  </div>
                </div>
              </div>

              <div className="doctor-card-body">
                <h3 className="doctor-name">{doc.name}</h3>
                <span className="doctor-title">{doc.title}</span>
                <span className="doctor-qualification">{doc.qualification}</span>

                <div className="doctor-details-pills">
                  <span className="pill-item">🏥 {doc.room}</span>
                  <span className="pill-item">⏳ {doc.experienceYears} yrs exp</span>
                  <span className="pill-item">💳 ₹{doc.consultationFee}</span>
                </div>

                <p className="doctor-bio-excerpt">{doc.bio}</p>
              </div>

              <div className="doctor-card-footer">
                <button
                  type="button"
                  className="view-schedule-btn"
                  onClick={() => navigate(`/doctors/${doc.id}`)}
                  id={`btn-view-doctor-${doc.id}`}
                >
                  View Profile & Schedule →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Doctors;