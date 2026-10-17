import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import type { Patient } from "../types";
import { getStoredPatients, saveStoredPatients } from "../data/mockData";
import { PatientModal } from "../components/PatientModal/PatientModal";
import { useToast, EmptyState } from "../components/common";
import "./PatientDetails.css";

export const PatientDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [patient, setPatient] = useState<Patient | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "visits" | "appointments">("overview");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    const list = getStoredPatients();
    const found = list.find((p) => p.id === Number(id));
    setPatient(found || null);
  }, [id]);

  if (!patient) {
    return (
      <div className="patient-details-page">
        <button
          type="button"
          className="back-nav-btn"
          onClick={() => navigate("/patients")}
        >
          ← Back to Patient Directory
        </button>
        <EmptyState
          title={`Patient Record #${id} Not Found`}
          description="The requested patient identifier does not correspond to an active or archived record."
          actionText="Return to Patient Directory"
          onAction={() => navigate("/patients")}
        />
      </div>
    );
  }

  const handleSaveEdit = (updatedData: Partial<Patient>) => {
    const list = getStoredPatients();
    const updatedList = list.map((p) =>
      p.id === patient.id ? ({ ...p, ...updatedData } as Patient) : p
    );
    saveStoredPatients(updatedList);
    setPatient((prev) => (prev ? ({ ...prev, ...updatedData } as Patient) : null));
    showToast(`Updated record for ${patient.name}`, "success");
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
            className="action-btn-primary"
            onClick={() => setIsEditModalOpen(true)}
            id="btn-edit-patient-details"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
            </svg>
            <span>Edit Patient Record</span>
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
            <span><strong>Blood:</strong> <span className="blood-tag">{patient.bloodGroup}</span></span>
            <span>•</span>
            <span><strong>Department:</strong> {patient.department}</span>
            <span>•</span>
            <span><strong>Assigned Doctor:</strong> {patient.doctorAssigned || "Dr. Sarah Jenkins"}</span>
          </div>
        </div>
      </div>

      {/* Vitals Summary Grid */}
      <div className="vitals-grid">
        <div className="vital-card">
          <span className="vital-label">BLOOD PRESSURE</span>
          <div className="vital-value-row">
            <span className="vital-value">{patient.vitals?.bloodPressure || "120/80"}</span>
          </div>
          <span className="vital-sub">Recorded {patient.vitals?.recordedAt || "Today"}</span>
        </div>

        <div className="vital-card">
          <span className="vital-label">HEART RATE</span>
          <div className="vital-value-row">
            <span className="vital-value">{patient.vitals?.heartRate || 72}</span>
            <span className="vital-unit">BPM</span>
          </div>
          <span className="vital-sub">Normal resting range</span>
        </div>

        <div className="vital-card">
          <span className="vital-label">TEMPERATURE</span>
          <div className="vital-value-row">
            <span className="vital-value">{patient.vitals?.temperature || "98.6 °F"}</span>
          </div>
          <span className="vital-sub">Oral thermometer</span>
        </div>

        <div className="vital-card">
          <span className="vital-label">OXYGEN SATURATION (SpO2)</span>
          <div className="vital-value-row">
            <span className="vital-value">{patient.vitals?.spO2 || 99}%</span>
          </div>
          <span className="vital-sub">Pulse oximeter reading</span>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="details-tabs-bar">
        <button
          type="button"
          className={`details-tab ${activeTab === "overview" ? "active" : ""}`}
          onClick={() => setActiveTab("overview")}
        >
          Clinical Overview & Contact
        </button>
        <button
          type="button"
          className={`details-tab ${activeTab === "visits" ? "active" : ""}`}
          onClick={() => setActiveTab("visits")}
        >
          Consultation & Visit History ({patient.visits?.length || 0})
        </button>
        <button
          type="button"
          className={`details-tab ${activeTab === "appointments" ? "active" : ""}`}
          onClick={() => setActiveTab("appointments")}
        >
          Appointments ({patient.appointments?.length || 0})
        </button>
      </div>

      {/* Tab 1: Clinical Overview */}
      {activeTab === "overview" && (
        <div className="tab-pane-grid">
          {/* Contact Details Card */}
          <div className="details-info-box">
            <h3 className="box-section-title">Patient Contact & Demographics</h3>
            <div className="info-key-val-list">
              <div className="info-kv-row">
                <span className="kv-key">Primary Phone:</span>
                <span className="kv-val">{patient.phone}</span>
              </div>
              <div className="info-kv-row">
                <span className="kv-key">Email Address:</span>
                <span className="kv-val">{patient.email}</span>
              </div>
              <div className="info-kv-row">
                <span className="kv-key">Residential Address:</span>
                <span className="kv-val">{patient.address}</span>
              </div>
              <div className="info-kv-row">
                <span className="kv-key">Admission Date:</span>
                <span className="kv-val">{patient.admissionDate}</span>
              </div>
            </div>
          </div>

          {/* Emergency Contact & Medical Warnings */}
          <div className="details-info-box">
            <h3 className="box-section-title">Emergency Contact & Medical Alerts</h3>
            <div className="info-key-val-list">
              <div className="info-kv-row">
                <span className="kv-key">Contact Person:</span>
                <span className="kv-val font-semibold">
                  {patient.emergencyContact?.name} ({patient.emergencyContact?.relation})
                </span>
              </div>
              <div className="info-kv-row">
                <span className="kv-key">Emergency Phone:</span>
                <span className="kv-val">{patient.emergencyContact?.phone}</span>
              </div>
            </div>

            <div className="allergies-box-wrapper">
              <span className="allergies-header">DOCUMENTED ALLERGIES</span>
              <div className="allergies-tags-list">
                {patient.allergies?.map((allergy, i) => (
                  <span
                    key={i}
                    className={`allergy-chip ${allergy.toLowerCase().includes("none") ? "chip-safe" : "chip-warning"}`}
                  >
                    ⚠️ {allergy}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Consultation & Visit History */}
      {activeTab === "visits" && (
        <div className="details-info-box">
          <h3 className="box-section-title">Consultation & Visit Notes</h3>
          {patient.visits && patient.visits.length > 0 ? (
            <div className="visits-timeline">
              {patient.visits.map((vis) => (
                <div key={vis.id} className="visit-entry-card">
                  <div className="visit-entry-header">
                    <div>
                      <h4 className="visit-entry-doctor">{vis.doctorName}</h4>
                      <span className="visit-entry-dept">{vis.department}</span>
                    </div>
                    <span className="visit-entry-date">{vis.date}</span>
                  </div>

                  <div className="visit-body-section">
                    <p><strong>Chief Complaint:</strong> {vis.chiefComplaint}</p>
                    <p><strong>Clinical Assessment:</strong> {vis.diagnosis}</p>
                    <p><strong>Treatment & Rx Plan:</strong> {vis.treatment}</p>
                    {vis.notes && <p className="visit-notes"><em>Clinical Notes:</em> {vis.notes}</p>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No prior consultations recorded"
              description="Visits and encounter notes will appear here once consultations are initiated."
            />
          )}
        </div>
      )}

      {/* Tab 3: Appointments */}
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