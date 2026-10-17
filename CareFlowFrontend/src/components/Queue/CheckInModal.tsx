import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queueService } from "../../services/queueService";
import { appointmentService } from "../../services/appointmentService";
import { patientService } from "../../services/patientService";
import { doctorService } from "../../services/doctorService";
import type { QueuePriority, QueueToken, CreateTokenPayload } from "../../types";
import { useToast } from "../common";
import "./CheckInModal.css";

interface CheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (issuedToken: QueueToken) => void;
  initialPrintToken?: QueueToken | null;
}

export const CheckInModal: React.FC<CheckInModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialPrintToken,
}) => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<"appointment" | "walkin" | "slip">(
    initialPrintToken ? "slip" : "appointment"
  );
  const [issuedSlip, setIssuedSlip] = useState<QueueToken | null>(
    initialPrintToken || null
  );

  // Filter state for scheduled appointments
  const [aptSearch, setAptSearch] = useState("");
  const [selectedPriority, setSelectedPriority] = useState<QueuePriority>("Normal");

  // Walk-in form state
  const [walkInPatientId, setWalkInPatientId] = useState<number>(0);
  const [walkInDept, setWalkInDept] = useState<string>("");
  const [walkInDoctorId, setWalkInDoctorId] = useState<number>(0);

  // Sync initialPrintToken if provided
  React.useEffect(() => {
    if (initialPrintToken) {
      setIssuedSlip(initialPrintToken);
      setActiveTab("slip");
    } else {
      setActiveTab("appointment");
      setIssuedSlip(null);
    }
  }, [initialPrintToken, isOpen]);

  // Query Scheduled/Confirmed Appointments
  const { data: aptData, isLoading: isLoadingApts } = useQuery({
    queryKey: ["appointments", "pending-checkin"],
    queryFn: () => appointmentService.getAppointments({ limit: 50 }),
    enabled: isOpen && activeTab === "appointment",
  });

  // Query Patients & Doctors for walk-in
  const { data: patientsData } = useQuery({
    queryKey: ["patients", "all"],
    queryFn: () => patientService.getPatients({ limit: 100 }),
    enabled: isOpen && activeTab === "walkin",
  });

  const { data: doctorsData } = useQuery({
    queryKey: ["doctors", "all"],
    queryFn: () => doctorService.getDoctors(),
    enabled: isOpen,
  });

  const appointments = (aptData?.appointments || []).filter(
    (a) => a.status === "Scheduled" || a.status === "Confirmed"
  );
  const patients = patientsData?.patients || [];
  const doctors = doctorsData || [];
  const departments = Array.from(new Set(doctors.map((d) => d.department)));

  const filteredDoctors = walkInDept
    ? doctors.filter((d) => d.department.toLowerCase() === walkInDept.toLowerCase())
    : doctors;

  // Check-In Mutation
  const tokenMutation = useMutation({
    mutationFn: (payload: CreateTokenPayload) => queueService.createToken(payload),
    onSuccess: (token) => {
      showToast(`Token ${token.tokenNumber} issued for ${token.patientName}!`, "success");
      queryClient.invalidateQueries({ queryKey: ["queue"] });
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      setIssuedSlip(token);
      setActiveTab("slip");
      if (onSuccess) onSuccess(token);
    },
    onError: (err: any) => {
      showToast(err.message || "Failed to generate queue token", "error");
    },
  });

  if (!isOpen) return null;

  // Filtered appointments by search
  const displayedApts = appointments.filter((a) => {
    if (!aptSearch.trim()) return true;
    const q = aptSearch.toLowerCase();
    return (
      a.patientName.toLowerCase().includes(q) ||
      a.patientMrn.toLowerCase().includes(q) ||
      a.doctorName.toLowerCase().includes(q)
    );
  });

  const handleCheckInAppointment = (apt: any) => {
    tokenMutation.mutate({
      patientId: apt.patientId,
      doctorId: apt.doctorId,
      departmentId: apt.departmentId,
      priority: selectedPriority,
      appointmentId: apt.id,
    });
  };

  const handleWalkInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!walkInPatientId) {
      showToast("Please select a patient", "warning");
      return;
    }

    const doc = doctors.find((d) => d.id === walkInDoctorId);

    tokenMutation.mutate({
      patientId: walkInPatientId,
      doctorId: walkInDoctorId || null,
      departmentId: doc?.department || walkInDept || undefined,
      priority: selectedPriority,
    });
  };

  return (
    <div className="modal-backdrop-checkin" onClick={onClose}>
      <div
        className="modal-content-checkin"
        onClick={(e) => e.stopPropagation()}
        id="checkin-reception-modal"
      >
        {/* Header */}
        <div className="modal-header-checkin">
          <div>
            <h2 style={{ margin: 0, fontSize: "18px", fontWeight: 800 }}>
              {activeTab === "slip"
                ? "Official Queue Token Slip"
                : "Reception Desk Arrival & Token Issuance"}
            </h2>
            <p style={{ margin: "2px 0 0 0", fontSize: "12.5px", color: "var(--text-secondary)" }}>
              {activeTab === "slip"
                ? "CareFlow Medical Center • Outpatient Waiting Room"
                : "Confirm patient arrival, generate priority tokens, or register walk-ins."}
            </p>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Tab switcher (hide if viewing slip) */}
        {activeTab !== "slip" && (
          <div className="checkin-tab-bar">
            <button
              type="button"
              className={`checkin-tab-btn ${activeTab === "appointment" ? "active" : ""}`}
              onClick={() => setActiveTab("appointment")}
            >
              📅 Scheduled Appointment Check-in ({appointments.length})
            </button>
            <button
              type="button"
              className={`checkin-tab-btn ${activeTab === "walkin" ? "active" : ""}`}
              onClick={() => setActiveTab("walkin")}
            >
              🚶 Walk-in Arrival & Direct Token
            </button>
          </div>
        )}

        {/* Modal Body */}
        <div className="modal-body-checkin">
          {/* TAB 1: SCHEDULED APPOINTMENT CHECK-IN */}
          {activeTab === "appointment" && (
            <>
              {/* Priority Selector */}
              <div>
                <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)" }}>
                  Arrival Priority Classification:
                </label>
                <div className="priority-pills-row">
                  <button
                    type="button"
                    className={`priority-pill-btn normal ${
                      selectedPriority === "Normal" ? "selected" : ""
                    }`}
                    onClick={() => setSelectedPriority("Normal")}
                  >
                    🟢 Normal Priority
                  </button>
                  <button
                    type="button"
                    className={`priority-pill-btn urgent ${
                      selectedPriority === "Urgent" ? "selected" : ""
                    }`}
                    onClick={() => setSelectedPriority("Urgent")}
                  >
                    🟡 Urgent (Senior/Child/Pain)
                  </button>
                  <button
                    type="button"
                    className={`priority-pill-btn emergency ${
                      selectedPriority === "Emergency" ? "selected" : ""
                    }`}
                    onClick={() => setSelectedPriority("Emergency")}
                  >
                    🚨 Emergency Priority
                  </button>
                </div>
              </div>

              {/* Search Appointments */}
              <div>
                <input
                  type="text"
                  className="form-field-input"
                  placeholder="Filter appointments by patient name or MRN..."
                  value={aptSearch}
                  onChange={(e) => setAptSearch(e.target.value)}
                />
              </div>

              {/* Appointments List */}
              <div className="checkin-apt-list">
                {isLoadingApts ? (
                  <p style={{ textAlign: "center", color: "var(--text-secondary)", fontSize: "13px" }}>
                    Loading appointments...
                  </p>
                ) : displayedApts.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "24px 10px", color: "var(--text-muted)" }}>
                    <p style={{ margin: 0, fontWeight: 600 }}>No pending appointments for check-in.</p>
                    <small>All scheduled patients have either checked in or you can register a walk-in above.</small>
                  </div>
                ) : (
                  displayedApts.map((apt) => (
                    <div key={apt.id} className="checkin-apt-card">
                      <div className="apt-left-meta">
                        <h4>{apt.patientName}</h4>
                        <div className="apt-left-sub">
                          <span className="mrn-chip">{apt.patientMrn}</span>
                          <span>•</span>
                          <span>⏰ {apt.time} ({apt.date})</span>
                          <span>•</span>
                          <span>🩺 {apt.doctorName} ({apt.department})</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        className="btn-issue-token"
                        onClick={() => handleCheckInAppointment(apt)}
                        disabled={tokenMutation.isPending}
                      >
                        {tokenMutation.isPending ? "Issuing..." : "Confirm Arrival & Issue Token →"}
                      </button>
                    </div>
                  ))
                )}
              </div>
            </>
          )}

          {/* TAB 2: WALK-IN REGISTRATION */}
          {activeTab === "walkin" && (
            <form onSubmit={handleWalkInSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div className="form-field-group">
                <label className="form-field-label">
                  <span>Select Patient Record</span>
                  <span className="required-dot">*</span>
                </label>
                <select
                  className="form-field-select"
                  value={walkInPatientId}
                  onChange={(e) => setWalkInPatientId(Number(e.target.value))}
                  required
                >
                  <option value={0} disabled>
                    -- Choose Registered Patient --
                  </option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.mrn}) — {p.gender}, {p.age}y | {p.phone}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-grid-2col">
                <div className="form-field-group">
                  <label className="form-field-label">
                    <span>Clinical Department</span>
                  </label>
                  <select
                    className="form-field-select"
                    value={walkInDept}
                    onChange={(e) => {
                      setWalkInDept(e.target.value);
                      setWalkInDoctorId(0);
                    }}
                  >
                    <option value="">All Departments</option>
                    {departments.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-field-group">
                  <label className="form-field-label">
                    <span>Assign Physician</span>
                  </label>
                  <select
                    className="form-field-select"
                    value={walkInDoctorId}
                    onChange={(e) => setWalkInDoctorId(Number(e.target.value))}
                  >
                    <option value={0}>Next Available Doctor in Department</option>
                    {filteredDoctors.map((doc) => (
                      <option key={doc.id} value={doc.id}>
                        {doc.name} ({doc.room})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)" }}>
                  Priority Level:
                </label>
                <div className="priority-pills-row">
                  <button
                    type="button"
                    className={`priority-pill-btn normal ${
                      selectedPriority === "Normal" ? "selected" : ""
                    }`}
                    onClick={() => setSelectedPriority("Normal")}
                  >
                    🟢 Normal
                  </button>
                  <button
                    type="button"
                    className={`priority-pill-btn urgent ${
                      selectedPriority === "Urgent" ? "selected" : ""
                    }`}
                    onClick={() => setSelectedPriority("Urgent")}
                  >
                    🟡 Urgent
                  </button>
                  <button
                    type="button"
                    className={`priority-pill-btn emergency ${
                      selectedPriority === "Emergency" ? "selected" : ""
                    }`}
                    onClick={() => setSelectedPriority("Emergency")}
                  >
                    🚨 Emergency
                  </button>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
                <button type="button" className="btn-secondary" onClick={onClose}>
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary-booking"
                  disabled={tokenMutation.isPending || walkInPatientId === 0}
                >
                  {tokenMutation.isPending ? "Generating Token..." : "Issue Walk-In Token →"}
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: PRINTABLE TOKEN SLIP */}
          {activeTab === "slip" && issuedSlip && (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div className="token-slip-card" id="printable-token-slip">
                <div className="slip-header">
                  <h3 className="slip-hospital-title">🏥 CareFlow Medical Center</h3>
                  <p className="slip-dept-subtitle">
                    {issuedSlip.department} • {issuedSlip.doctorRoom}
                  </p>
                </div>

                <div>
                  <span style={{ fontSize: "12px", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                    YOUR QUEUE TOKEN NUMBER
                  </span>
                  <div className="slip-token-number">{issuedSlip.tokenNumber}</div>
                  <span
                    className="slip-priority-tag"
                    style={{
                      backgroundColor:
                        issuedSlip.priority === "Emergency"
                          ? "#fef2f2"
                          : issuedSlip.priority === "Urgent"
                          ? "#fefce8"
                          : "#ecfdf5",
                      color:
                        issuedSlip.priority === "Emergency"
                          ? "#dc2626"
                          : issuedSlip.priority === "Urgent"
                          ? "#ca8a04"
                          : "#059669",
                      border: "1px solid currentColor",
                    }}
                  >
                    {issuedSlip.priority} PRIORITY
                  </span>
                </div>

                <div className="slip-details-grid">
                  <div>
                    <strong>PATIENT NAME</strong>
                    <span>{issuedSlip.patientName}</span>
                  </div>
                  <div>
                    <strong>RECORD (MRN)</strong>
                    <span>{issuedSlip.patientMrn}</span>
                  </div>
                  <div>
                    <strong>ATTENDING PHYSICIAN</strong>
                    <span>{issuedSlip.doctorName}</span>
                  </div>
                  <div>
                    <strong>ESTIMATED WAIT</strong>
                    <span>~{issuedSlip.estimatedWaitMinutes || 12} minutes</span>
                  </div>
                </div>

                <div className="slip-barcode-mock">
                  || | | ||| | || |||| | ||
                </div>

                <small style={{ color: "#94a3b8", fontSize: "11px" }}>
                  Please watch the waiting room screen or listen for your token announcement.
                </small>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", gap: "12px" }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => {
                    setActiveTab("appointment");
                    setIssuedSlip(null);
                  }}
                >
                  ← Issue Another Token
                </button>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => window.print()}
                  >
                    🖨️ Print Token Slip
                  </button>
                  <button
                    type="button"
                    className="btn-primary-booking"
                    onClick={onClose}
                  >
                    Done / Return to Queue Board
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
