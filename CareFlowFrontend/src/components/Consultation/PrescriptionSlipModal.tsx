import React from "react";
import { Printer, X, ShieldCheck, HeartPulse, AlertTriangle, FileText } from "../common/Icons";
import type { Consultation } from "../../types";
import "./PrescriptionSlipModal.css";

interface PrescriptionSlipModalProps {
  consultation: Consultation | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PrescriptionSlipModal: React.FC<PrescriptionSlipModalProps> = ({
  consultation,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !consultation) return null;

  const handlePrint = () => {
    window.print();
  };

  const rxNumber = `RX-${String(consultation.id).padStart(6, "0")}`;
  const formattedDate = new Date(consultation.date || consultation.createdAt).toLocaleDateString(
    "en-US",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  );

  return (
    <div className="rx-modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="rx-modal-wrapper" onClick={(e) => e.stopPropagation()}>
        {/* Top bar (Screen Only) */}
        <div className="rx-modal-topbar">
          <div className="rx-topbar-title">
            <FileText size={18} color="#0f766e" />
            <span>Official Prescription Record — {rxNumber}</span>
          </div>
          <div className="rx-topbar-actions">
            <button
              type="button"
              className="rx-btn rx-btn-primary"
              onClick={handlePrint}
              id="print-rx-btn"
            >
              <Printer size={15} />
              <span>Print Slip</span>
            </button>
            <button
              type="button"
              className="rx-btn rx-btn-secondary"
              onClick={onClose}
              id="close-rx-modal-btn"
            >
              <X size={15} />
              <span>Close</span>
            </button>
          </div>
        </div>

        {/* Modal Printable Body */}
        <div className="rx-modal-body">
          <div className="rx-document">
            {/* Header */}
            <div className="rx-doc-header">
              <div className="rx-doc-hospital">
                <div className="rx-doc-logo-mark">CF</div>
                <div>
                  <h2 className="rx-doc-hospital-name">CAREFLOW HEALTHCARE</h2>
                  <p className="rx-doc-hospital-sub">
                    Department of Outpatient Medicine & Specialist Consultations
                    <br />
                    108 Health Boulevard, Medical District • Tel: +1 (800) 555-CARE
                  </p>
                </div>
              </div>
              <div className="rx-doc-doctor-meta">
                <h3 className="rx-doc-doctor-name">{consultation.doctorName}</h3>
                <p className="rx-doc-doctor-spec">{consultation.doctorSpecialty}</p>
                <p className="rx-doc-doctor-room">{consultation.doctorRoom}</p>
              </div>
            </div>

            {/* Patient Info Strip */}
            <div className="rx-patient-band">
              <div className="rx-patient-item">
                <span className="rx-label">Patient Name</span>
                <span className="rx-value">{consultation.patientName}</span>
              </div>
              <div className="rx-patient-item">
                <span className="rx-label">MRN / ID</span>
                <span className="rx-value">{consultation.patientMrn}</span>
              </div>
              <div className="rx-patient-item">
                <span className="rx-label">Age / Gender</span>
                <span className="rx-value">
                  {consultation.patientAge} Yrs / {consultation.patientGender}
                </span>
              </div>
              <div className="rx-patient-item">
                <span className="rx-label">Date Issued</span>
                <span className="rx-value">{formattedDate}</span>
              </div>
              <div className="rx-patient-item">
                <span className="rx-label">Contact</span>
                <span className="rx-value">{consultation.patientPhone || "N/A"}</span>
              </div>
              <div className="rx-patient-item">
                <span className="rx-label">Blood Group</span>
                <span className="rx-value">{consultation.patientBloodGroup || "O+"}</span>
              </div>
              <div className="rx-patient-item" style={{ gridColumn: "span 2" }}>
                <span className="rx-label">Known Allergies</span>
                <span className="rx-alert-chip">
                  <AlertTriangle size={12} style={{ display: "inline", marginRight: "4px" }} />
                  {consultation.allergies || "No Known Drug Allergies (NKDA)"}
                </span>
              </div>
            </div>

            {/* Vitals Strip */}
            {consultation.latestVitals && (
              <div className="rx-vitals-strip">
                <div className="rx-vital-item">
                  <HeartPulse size={14} />
                  <span>Vitals:</span>
                </div>
                {consultation.latestVitals.bp && (
                  <div className="rx-vital-item">
                    BP: <span>{consultation.latestVitals.bp} mmHg</span>
                  </div>
                )}
                {consultation.latestVitals.pulse && (
                  <div className="rx-vital-item">
                    Pulse: <span>{consultation.latestVitals.pulse} bpm</span>
                  </div>
                )}
                {consultation.latestVitals.temp && (
                  <div className="rx-vital-item">
                    Temp: <span>{consultation.latestVitals.temp} °F</span>
                  </div>
                )}
                {consultation.latestVitals.spo2 && (
                  <div className="rx-vital-item">
                    SpO2: <span>{consultation.latestVitals.spo2}%</span>
                  </div>
                )}
                {consultation.latestVitals.weight && (
                  <div className="rx-vital-item">
                    Weight: <span>{consultation.latestVitals.weight} kg</span>
                  </div>
                )}
              </div>
            )}

            {/* Clinical Impression */}
            <div className="rx-clinical-section">
              <div className="rx-info-box">
                <h4 className="rx-info-title">Chief Complaint</h4>
                <p className="rx-info-text">{consultation.chiefComplaint || "None recorded"}</p>
              </div>
              <div className="rx-info-box">
                <h4 className="rx-info-title">Clinical Diagnosis</h4>
                <p className="rx-info-text" style={{ fontWeight: 600, color: "#0f766e" }}>
                  {consultation.diagnosis || "Under Evaluation"}
                </p>
              </div>
            </div>

            {/* Classical Prescription Symbol & Table */}
            <div className="rx-medications-section">
              <div className="rx-symbol-header">
                <span className="rx-symbol">℞</span>
                <span className="rx-symbol-label">Prescription Medications</span>
              </div>

              {consultation.prescriptions && consultation.prescriptions.length > 0 ? (
                <table className="rx-table">
                  <thead>
                    <tr>
                      <th style={{ width: "30px" }}>#</th>
                      <th>Medication & Strength</th>
                      <th>Route</th>
                      <th>Dosage & Frequency</th>
                      <th>Duration</th>
                      <th>Instructions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {consultation.prescriptions.map((rx, idx) => (
                      <tr key={rx.id || idx}>
                        <td>{idx + 1}</td>
                        <td>
                          <div className="rx-med-name">{rx.medicationName}</div>
                          <div style={{ fontSize: "0.75rem", color: "#64748b" }}>{rx.dosage}</div>
                        </td>
                        <td>
                          <span className="rx-badge">{rx.route || "Oral"}</span>
                        </td>
                        <td style={{ fontWeight: 600, color: "#0f766e" }}>{rx.frequency}</td>
                        <td>{rx.duration}</td>
                        <td>
                          <div className="rx-med-instructions">
                            {rx.instructions || "As directed by physician"}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div style={{ padding: "1rem", color: "#64748b", fontStyle: "italic" }}>
                  No pharmacological drugs prescribed for this encounter.
                </div>
              )}
            </div>

            {/* Treatment & Advice */}
            {(consultation.treatment || consultation.clinicalNotes) && (
              <div className="rx-advice-section">
                <h4 className="rx-info-title">Physician's Instructions & Care Advice</h4>
                {consultation.treatment && (
                  <p className="rx-advice-text">
                    <strong>Treatment Plan:</strong> {consultation.treatment}
                  </p>
                )}
                {consultation.clinicalNotes && (
                  <p className="rx-advice-text" style={{ marginTop: "0.5rem" }}>
                    <strong>Clinical Notes:</strong> {consultation.clinicalNotes}
                  </p>
                )}
              </div>
            )}

            {/* Footer */}
            <div className="rx-doc-footer">
              <div className="rx-footer-notice">
                <p style={{ margin: "0 0 0.25rem 0" }}>
                  <strong>Notice:</strong> This electronic prescription is generated by CareFlow EMR.
                  Please complete the full course of treatment unless instructed otherwise.
                </p>
                <p style={{ margin: 0 }}>
                  Emergency Helpline: 911 / 112 • Valid across all state-registered pharmacies.
                </p>
              </div>

              <div className="rx-doctor-sign-box">
                <div className="rx-sign-line"></div>
                <div className="rx-sign-doctor">{consultation.doctorName}</div>
                <div className="rx-sign-verified">
                  <ShieldCheck size={12} style={{ display: "inline", marginRight: "3px" }} />
                  Digitally Authorized & Signed
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
