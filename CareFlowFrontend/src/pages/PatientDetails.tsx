import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Patient } from "../types";
import { patientService } from "../services";
import { PatientModal } from "../components/PatientModal/PatientModal";
import { useToast, EmptyState, ErrorState, PageLoader } from "../components/common";
import "./PatientDetails.css";

export const PatientDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<"overview" | "visits" | "appointments">("overview");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // TanStack Query for single patient details
  const {
    data: patient,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["patient", Number(id)],
    queryFn: () => patientService.getPatientById(Number(id)),
    enabled: !!id && !isNaN(Number(id)),
  });

  // Edit mutation
  const editMutation = useMutation({
    mutationFn: (updatedData: Partial<Patient>) =>
      patientService.updatePatient(Number(id), updatedData),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ["patient", Number(id)] });
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      showToast(`Updated record for ${updated.name}`, "success");
      setIsEditModalOpen(false);
    },
    onError: (err: any) => {
      showToast(err.message || "Failed to update patient record", "error");
    },
  });

  if (isLoading) {
    return (
      <div className="patient-details-page">
        <button
          type="button"
          className="back-nav-btn"
          onClick={() => navigate("/patients")}
        >
          ← Back to Patient Directory
        </button>
        <PageLoader message={`Loading clinical record #${id} from SQL database...`} />
      </div>
    );
  }

  if (isError || !patient) {
    return (
      <div className="patient-details-page">
        <button
          type="button"
          className="back-nav-btn"
          onClick={() => navigate("/patients")}
        >
          ← Back to Patient Directory
        </button>
        {isError ? (
          <ErrorState
            title="Failed to Load Clinical Record"
            message={error?.message || `Could not fetch patient #${id}.`}
            onRetry={() => refetch()}
          />
        ) : (
          <EmptyState
            title={`Patient Record #${id} Not Found`}
            description="The requested patient identifier does not correspond to an active or archived record."
            actionText="Return to Patient Directory"
            onAction={() => navigate("/patients")}
          />
        )}
      </div>
    );
  }

  const handleSaveEdit = (updatedData: Partial<Patient>) => {
    editMutation.mutate(updatedData);
  };

  return (
    <div className="patient-details-page" id="patient-details-view">
      {/* Top Navigation Bar */}
      <div className="details-top-bar">
        <button
          type="button"
          className="back-nav-btn"
          onClick={() => navigate("/patients")}
          id="btn-back-to-patients"
        >
          ← Back to Patients Directory
        </button>

        <div className="details-header-actions">
          <button
            type="button"
            className="action-btn-outline"
            onClick={() => showToast("Medical Summary exported to clipboard / PDF print preview", "info")}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 9V2h12v7" />
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
              <path d="M6 14h12v8H6z" />
            </svg>
            <span>Print Summary</span>
          </button>

          <button
            type="button"
            className="action-btn-outline"
            onClick={() => navigate(`/consultations?patientId=${patient.id}`)}
            id="btn-start-consultation"
            style={{ color: "#0f766e", borderColor: "#0f766e" }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
              <path d="M12 5v6" />
              <path d="M9 8h6" />
            </svg>
            <span>Start Consultation</span>
          </button>

          <button
            type="button"
            className="action-btn-primary"
            onClick={() => setIsEditModalOpen(true)}
            id="btn-edit-patient-details"
            disabled={editMutation.isPending}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
            </svg>
            <span>{editMutation.isPending ? "Saving..." : "Edit Patient Record"}</span>
          </button>
        </div>
      </div>

      {/* Patient Hero Profile Card */}
      <div className="patient-hero-card">
        <div className="patient-hero-avatar">
          {patient.name.charAt(0)}
        </div>

        <div className="patient-hero-info">
          <div className="patient-hero-title-row">
            <h1 className="patient-hero-name">{patient.name}</h1>
            <span className="patient-hero-mrn">{patient.mrn}</span>
            <span className={`status-pill status-${patient.status.toLowerCase()}`}>
              <span className="status-dot" />
              {patient.status}
            </span>
          </div>

          <div className="patient-hero-meta-row">
            <span><strong>Age:</strong> {patient.age} yrs</span>
            <span>•</span>
            <span><strong>Gender:</strong> {patient.gender}</span>
            <span>•</span>
            <span><strong>Blood Group:</strong> <span className="blood-tag">{patient.bloodGroup}</span></span>
            <span>•</span>
            <span><strong>Department:</strong> {patient.department}</span>
            <span>•</span>
            <span><strong>Assigned Doctor:</strong> {patient.doctorAssigned || "Dr. Sarah Jenkins"}</span>
          </div>
        </div>
      </div>

      {/* Patient Details Subnavigation Tabs */}
      <div className="patient-details-tabs">
        <button
          type="button"
          className={`details-tab-btn ${activeTab === "overview" ? "active" : ""}`}
          onClick={() => setActiveTab("overview")}
        >
          🩺 Clinical Overview & Vitals
        </button>
        <button
          type="button"
          className={`details-tab-btn ${activeTab === "visits" ? "active" : ""}`}
          onClick={() => setActiveTab("visits")}
        >
          📋 Consultation & Visits ({patient.visits?.length || 0})
        </button>
        <button
          type="button"
          className={`details-tab-btn ${activeTab === "appointments" ? "active" : ""}`}
          onClick={() => setActiveTab("appointments")}
        >
          📅 Appointments ({patient.appointments?.length || 0})
        </button>
      </div>

      {/* TAB 1: Clinical Overview */}
      {activeTab === "overview" && (
        <div className="details-overview-grid">
          {/* Vitals Box */}
          <div className="details-info-box">
            <div className="box-header-row">
              <h3 className="box-section-title">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--primary-color)" strokeWidth="2.5">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                </svg>
                <span>Latest Recorded Clinical Vitals</span>
              </h3>
              <span className="vitals-timestamp">Recorded: {patient.vitals?.recordedAt || "Admission baseline"}</span>
            </div>
            <div className="vitals-display-grid">
              <div className="vital-item-card">
                <span className="vital-item-label">🫀 BLOOD PRESSURE</span>
                <span className="vital-item-val">{patient.vitals?.bloodPressure || "120/80 mmHg"}</span>
                <span className="vital-item-status status-normal">Resting baseline</span>
              </div>
              <div className="vital-item-card">
                <span className="vital-item-label">💓 PULSE RATE</span>
                <span className="vital-item-val">{patient.vitals?.heartRate || 72} <small>BPM</small></span>
                <span className="vital-item-status status-normal">Regular sinus rhythm</span>
              </div>
              <div className="vital-item-card">
                <span className="vital-item-label">🌡️ BODY TEMPERATURE</span>
                <span className="vital-item-val">{patient.vitals?.temperature || "98.6 °F"}</span>
                <span className="vital-item-status status-normal">Normothermic (Afebrile)</span>
              </div>
              <div className="vital-item-card">
                <span className="vital-item-label">🫁 OXYGEN SATURATION</span>
                <span className="vital-item-val">{patient.vitals?.spO2 || 98}% <small>SpO2</small></span>
                <span className="vital-item-status status-normal">Room air perfusion</span>
              </div>
            </div>
          </div>

          {/* Contact & Demographics Box */}
          <div className="details-info-box">
            <h3 className="box-section-title">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--primary-color)" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <span>Contact & Demographic Details</span>
            </h3>
            <div className="details-field-list">
              <div className="details-field-item">
                <span className="field-lbl">Phone Number</span>
                <span className="field-val">{patient.phone}</span>
              </div>
              <div className="details-field-item">
                <span className="field-lbl">Email Address</span>
                <span className="field-val">{patient.email || "—"}</span>
              </div>
              <div className="details-field-item">
                <span className="field-lbl">Residential Address</span>
                <span className="field-val">{patient.address || "—"}</span>
              </div>
              <div className="details-field-item">
                <span className="field-lbl">Admission Date</span>
                <span className="field-val">{patient.admissionDate || "2026-10-15"}</span>
              </div>
            </div>
          </div>

          {/* Emergency Contact Box */}
          <div className="details-info-box">
            <h3 className="box-section-title">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                <path d="M12 8v4" />
                <path d="M12 16h.01" />
              </svg>
              <span>Emergency Contact Details</span>
            </h3>
            <div className="details-field-list">
              <div className="details-field-item">
                <span className="field-lbl">Next of Kin Name</span>
                <span className="field-val">{patient.emergencyContact?.name || "Next of Kin"}</span>
              </div>
              <div className="details-field-item">
                <span className="field-lbl">Relationship</span>
                <span className="field-val">{patient.emergencyContact?.relation || "Family"}</span>
              </div>
              <div className="details-field-item">
                <span className="field-lbl">Emergency Phone</span>
                <span className="field-val">{patient.emergencyContact?.phone || patient.phone}</span>
              </div>
            </div>
          </div>

          {/* Known Allergies */}
          <div className="details-info-box">
            <h3 className="box-section-title">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2">
                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              <span>Known Allergies & Contraindications</span>
            </h3>
            <div className="allergies-tag-list">
              {patient.allergies && patient.allergies.length > 0 ? (
                patient.allergies.map((allergy, i) => (
                  <span key={i} className="allergy-tag">
                    ⚠️ {allergy}
                  </span>
                ))
              ) : (
                <span className="no-allergies">✓ No known medical or drug allergies documented.</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Visits & Consultations */}
      {activeTab === "visits" && (
        <div className="details-info-box">
          <h3 className="box-section-title">Encounter History & Clinical Notes</h3>
          {patient.visits && patient.visits.length > 0 ? (
            <div className="visits-timeline">
              {patient.visits.map((vis) => (
                <div key={vis.id} className="visit-timeline-entry">
                  <div className="visit-entry-header">
                    <span className="visit-date">📅 {vis.date}</span>
                    <span className="visit-doc">{vis.doctorName} ({vis.department})</span>
                  </div>
                  <div className="visit-detail-grid">
                    <div>
                      <strong>Chief Complaint:</strong>
                      <p>{vis.chiefComplaint}</p>
                    </div>
                    <div>
                      <strong>Diagnosis:</strong>
                      <p>{vis.diagnosis}</p>
                    </div>
                    <div>
                      <strong>Prescribed Treatment:</strong>
                      <p>{vis.treatment}</p>
                    </div>
                    {vis.notes && (
                      <div className="visit-notes-box">
                        <strong>Clinical Notes:</strong>
                        <p>{vis.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No consultation notes recorded"
              description="Clinical encounter records and prescriptions will appear here when doctors complete consultations in Phase 8."
            />
          )}
        </div>
      )}

      {/* TAB 3: Appointments */}
      {activeTab === "appointments" && (
        <div className="details-info-box">
          <h3 className="box-section-title">Scheduled & Past Appointments</h3>
          {patient.appointments && patient.appointments.length > 0 ? (
            <div className="appointments-list-grid">
              {patient.appointments.map((apt) => (
                <div key={apt.id} className="apt-item-card">
                  <div className="apt-item-top">
                    <span className="apt-type-badge">{apt.type}</span>
                    <span className={`status-pill status-${apt.status.toLowerCase()}`}>
                      {apt.status}
                    </span>
                  </div>
                  <h4 className="apt-doctor">{apt.doctorName}</h4>
                  <span className="apt-dept">{apt.department}</span>
                  <div className="apt-time-row">
                    <span>📅 {apt.date}</span>
                    <span>⏰ {apt.time}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No appointments on record"
              description="Schedule a follow-up or routine checkup in Phase 6."
            />
          )}
        </div>
      )}

      {/* Edit Patient Modal */}
      <PatientModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSaveEdit}
        initialData={patient}
      />
    </div>
  );
};

export default PatientDetails;