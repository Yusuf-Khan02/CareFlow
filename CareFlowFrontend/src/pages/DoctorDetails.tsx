import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { doctorService } from "../services";
import { useToast, EmptyState, ErrorState, PageLoader } from "../components/common";
import "./DoctorDetails.css";

export const DoctorDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [selectedDay, setSelectedDay] = useState<string>("Monday");

  const {
    data: doctor,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["doctor", Number(id)],
    queryFn: () => doctorService.getDoctorById(Number(id)),
    enabled: !!id && !isNaN(Number(id)),
  });

  if (isLoading) {
    return (
      <div className="doctor-details-page">
        <button
          type="button"
          className="back-nav-btn"
          onClick={() => navigate("/doctors")}
        >
          ← Back to Staff Directory
        </button>
        <PageLoader message={`Loading physician profile #${id} from SQL database...`} />
      </div>
    );
  }

  if (isError || !doctor) {
    return (
      <div className="doctor-details-page">
        <button
          type="button"
          className="back-nav-btn"
          onClick={() => navigate("/doctors")}
        >
          ← Back to Staff Directory
        </button>
        {isError ? (
          <ErrorState
            title="Failed to Load Physician Profile"
            message={error?.message || `Could not fetch doctor #${id}.`}
            onRetry={() => refetch()}
          />
        ) : (
          <EmptyState
            title={`Physician #${id} Not Found`}
            description="The requested staff profile does not exist in the active clinical directory."
            actionText="Return to Doctors Directory"
            onAction={() => navigate("/doctors")}
          />
        )}
      </div>
    );
  }

  const handleBookSlot = (day: string, shift: string) => {
    showToast(
      `Selected consultation with ${doctor.name} on ${day} (${shift}). Slot booking engine connects in Phase 6.`,
      "success"
    );
  };

  return (
    <div className="doctor-details-page" id="doctor-details-view">
      {/* Top Navigation */}
      <div className="details-top-bar">
        <button
          type="button"
          className="back-nav-btn"
          onClick={() => navigate("/doctors")}
          id="btn-back-to-doctors"
        >
          ← Back to Doctors & Staff
        </button>

        <div className="details-header-actions">
          <button
            type="button"
            className="action-btn-outline"
            onClick={() => showToast("Physician profile link copied", "info")}
          >
            <span>Share Profile</span>
          </button>
        </div>
      </div>

      {/* Doctor Hero Card */}
      <div className="doctor-hero-card">
        <div className="doctor-hero-avatar">
          {doctor.name.replace("Dr. ", "").charAt(0)}
        </div>

        <div className="doctor-hero-info">
          <div className="doctor-hero-title-row">
            <h1 className="doctor-hero-name">{doctor.name}</h1>
            <span className={`doctor-duty-badge duty-${doctor.status.toLowerCase().replace(/\s+/g, "-")}`}>
              {doctor.status}
            </span>
            <div className="doctor-rating-pill">
              <span>★</span>
              <strong>{doctor.rating.toFixed(1)} / 5.0</strong>
            </div>
          </div>

          <h3 className="doctor-hero-specialty">{doctor.title}</h3>
          <p className="doctor-hero-qualification">{doctor.qualification}</p>

          <div className="doctor-hero-meta-grid">
            <div className="doc-meta-item">
              <span className="doc-meta-label">DEPARTMENT</span>
              <span className="doc-meta-val">{doctor.department}</span>
            </div>
            <div className="doc-meta-item">
              <span className="doc-meta-label">CLINIC SUITE</span>
              <span className="doc-meta-val">{doctor.room}</span>
            </div>
            <div className="doc-meta-item">
              <span className="doc-meta-label">EXPERIENCE</span>
              <span className="doc-meta-val">{doctor.experienceYears} Years</span>
            </div>
            <div className="doc-meta-item">
              <span className="doc-meta-label">FEE</span>
              <span className="doc-meta-val">₹{doctor.consultationFee}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="doctor-layout-two-col">
        {/* Left Column: Weekly Schedule & Rota */}
        <div className="doctor-content-box">
          <div className="box-header-row">
            <div>
              <h3 className="box-title">Weekly Clinic Rota & Slot Availability</h3>
              <p className="box-subtitle">Select a day to view consultation hours and real-time open slots.</p>
            </div>
          </div>

          <div className="schedule-table-card">
            {doctor.schedule.map((item) => (
              <div
                key={item.day}
                className={`schedule-day-row ${selectedDay === item.day ? "selected" : ""} ${!item.isAvailable ? "unavailable" : ""}`}
                onClick={() => item.isAvailable && setSelectedDay(item.day)}
              >
                <div className="day-name-col">
                  <strong>{item.day}</strong>
                  {item.isAvailable ? (
                    <span className="day-open-tag">Available</span>
                  ) : (
                    <span className="day-off-tag">Off Shift</span>
                  )}
                </div>

                <div className="day-shift-col">
                  <span>{item.shifts}</span>
                </div>

                <div className="day-slots-col">
                  {item.isAvailable ? (
                    <div className="slots-action-wrapper">
                      <span className="slots-badge">{item.slotsRemaining} Slots Open</span>
                      <button
                        type="button"
                        className="slot-book-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleBookSlot(item.day, item.shifts);
                        }}
                      >
                        Book
                      </button>
                    </div>
                  ) : (
                    <span className="slots-closed">Closed</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Bio & Clinical Credentials */}
        <div className="doctor-sidebar-col">
          <div className="doctor-content-box">
            <h3 className="box-title">Professional Background</h3>
            <p className="doctor-bio-text">{doctor.bio}</p>

            <div className="doc-contact-section">
              <span className="contact-section-label">DIRECT HOSPITAL CONTACT</span>
              <div className="contact-detail-row">
                <span>📧 Work Email:</span>
                <strong>{doctor.email}</strong>
              </div>
              <div className="contact-detail-row">
                <span>📞 Extension:</span>
                <strong>{doctor.phone}</strong>
              </div>
            </div>

            <div className="operational-notice-box">
              <div className="notice-icon">ℹ️</div>
              <p>
                Appointment bookings are scheduled according to department buffers. Token arrival checks occur 15 minutes prior to slot time.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDetails;
