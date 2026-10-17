import React from "react";
import { Printer, X, ShieldCheck, FileSpreadsheet, AlertTriangle } from "../common/Icons";
import type { LabOrder } from "../../types";
import "./LabReportModal.css";

interface LabReportModalProps {
  order: LabOrder | null;
  isOpen: boolean;
  onClose: () => void;
}

export const LabReportModal: React.FC<LabReportModalProps> = ({
  order,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  const formattedCompleted = order.completedAt
    ? new Date(order.completedAt).toLocaleString("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "Preliminary";

  const formattedOrdered = new Date(order.orderedAt).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  const verifiedSigner =
    order.results && order.results.length > 0 && order.results[0].verifiedBy
      ? order.results[0].verifiedBy
      : "Vikram Sen, Senior Lab Technologist";

  return (
    <div className="lab-modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="report-modal-wrapper" onClick={(e) => e.stopPropagation()}>
        {/* Screen Top Bar */}
        <div className="report-modal-topbar">
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: 600 }}>
            <FileSpreadsheet size={18} color="#0f766e" />
            <span>Official Diagnostic Pathology Report — {order.orderNumber}</span>
          </div>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button
              type="button"
              className="lab-btn lab-btn-primary"
              onClick={handlePrint}
              id="print-lab-report-btn"
            >
              <Printer size={15} />
              <span>Print Report</span>
            </button>
            <button
              type="button"
              className="lab-btn lab-btn-secondary"
              onClick={onClose}
              id="close-lab-report-btn"
            >
              <X size={15} />
              <span>Close</span>
            </button>
          </div>
        </div>

        {/* Printable Report Document */}
        <div className="report-modal-body">
          <div className="report-document">
            {/* Header */}
            <div className="report-doc-header">
              <div className="report-hospital-brand">
                <div className="report-logo-badge">CF</div>
                <div>
                  <h2 className="report-hospital-title">CAREFLOW CENTRAL LABORATORIES</h2>
                  <p className="report-hospital-subtitle">
                    Department of Pathology & Laboratory Medicine • CAP & ISO 15189 Accredited
                    <br />
                    108 Health Boulevard, Medical District • Tel: +1 (800) 555-CARE (Ext 4420)
                  </p>
                </div>
              </div>
              <div className="report-order-meta">
                <div className="report-order-badge">{order.orderNumber}</div>
                <div className="report-order-date">
                  Ordered: {formattedOrdered}
                  <br />
                  Reported: {formattedCompleted}
                </div>
              </div>
            </div>

            {/* Patient Grid */}
            <div className="report-patient-grid">
              <div className="report-grid-item">
                <span className="report-grid-label">Patient Name</span>
                <span className="report-grid-value">{order.patientName}</span>
              </div>
              <div className="report-grid-item">
                <span className="report-grid-label">Medical Record (MRN)</span>
                <span className="report-grid-value">{order.patientMrn}</span>
              </div>
              <div className="report-grid-item">
                <span className="report-grid-label">Age / Gender</span>
                <span className="report-grid-value">
                  {order.patientAge} Yrs / {order.patientGender}
                </span>
              </div>
              <div className="report-grid-item">
                <span className="report-grid-label">Blood Group</span>
                <span className="report-grid-value">{order.patientBloodGroup || "O+"}</span>
              </div>
              <div className="report-grid-item" style={{ gridColumn: "span 2" }}>
                <span className="report-grid-label">Referring Clinician</span>
                <span className="report-grid-value">
                  {order.doctorName} ({order.doctorSpecialty})
                </span>
              </div>
              <div className="report-grid-item" style={{ gridColumn: "span 2" }}>
                <span className="report-grid-label">Clinical Indication</span>
                <span className="report-grid-value">
                  {order.clinicalNotes || "Routine diagnostic evaluation"}
                </span>
              </div>
            </div>

            {/* Test Header */}
            <div className="report-test-title-bar">
              <span className="report-test-name">
                Investigation: {order.testName} [{order.testCategory}]
              </span>
              <span
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  color: order.priority === "STAT" ? "#dc2626" : "#0f766e",
                }}
              >
                Priority: {order.priority}
              </span>
            </div>

            {/* Results Table */}
            <table className="report-results-table">
              <thead>
                <tr>
                  <th style={{ width: "35%" }}>Test Parameter / Analyte</th>
                  <th style={{ width: "20%" }}>Observed Value</th>
                  <th style={{ width: "15%" }}>Unit</th>
                  <th style={{ width: "20%" }}>Reference Range</th>
                  <th style={{ width: "10%" }}>Flag</th>
                </tr>
              </thead>
              <tbody>
                {order.results && order.results.length > 0 ? (
                  order.results.map((r, idx) => (
                    <tr key={r.id || idx}>
                      <td style={{ fontWeight: 600, color: "#1e293b" }}>{r.parameterName}</td>
                      <td
                        style={{
                          fontWeight: 700,
                          fontSize: "0.9rem",
                          color:
                            r.status === "Critical"
                              ? "#dc2626"
                              : r.status === "High"
                              ? "#b45309"
                              : r.status === "Low"
                              ? "#0284c7"
                              : "#0f766e",
                        }}
                      >
                        {r.measuredValue}
                      </td>
                      <td style={{ color: "#64748b" }}>{r.unit}</td>
                      <td style={{ color: "#475569" }}>{r.referenceRange}</td>
                      <td>
                        <span className={`flag-badge ${r.status.toLowerCase()}`}>
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} style={{ textAlign: "center", padding: "1.5rem", color: "#64748b" }}>
                      Specimen is currently {order.status}. Verified findings pending laboratory release.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Notes / Remarks */}
            {order.results?.some((r) => r.technicianNotes) && (
              <div className="report-remarks-box">
                <strong>Technologist Remarks:</strong>
                <p style={{ margin: "0.25rem 0 0 0", color: "#334155" }}>
                  {order.results.find((r) => r.technicianNotes)?.technicianNotes}
                </p>
              </div>
            )}

            {/* Critical alert banner if critical results */}
            {order.results?.some((r) => r.status === "Critical") && (
              <div
                style={{
                  background: "#fef2f2",
                  border: "1px solid #fecaca",
                  borderRadius: "6px",
                  padding: "0.75rem 1rem",
                  marginBottom: "1.25rem",
                  color: "#991b1b",
                  fontSize: "0.8125rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                <AlertTriangle size={16} />
                <strong>
                  CRITICAL VALUE ALERT: Immediate clinical action indicated. Findings telephoned to attending physician.
                </strong>
              </div>
            )}

            {/* Signatures */}
            <div className="report-footer-signatures">
              <div className="report-signature-block">
                <div className="report-sign-line"></div>
                <div className="report-signer-name">{verifiedSigner}</div>
                <div className="report-signer-title">Certified Medical Laboratory Technologist</div>
              </div>

              <div style={{ textAlign: "center" }}>
                <ShieldCheck size={28} color="#0f766e" style={{ margin: "0 auto 4px" }} />
                <div style={{ fontSize: "0.6875rem", color: "#0f766e", fontWeight: 700 }}>
                  AUTHENTICATED & RELEASED
                </div>
              </div>

              <div className="report-signature-block">
                <div className="report-sign-line"></div>
                <div className="report-signer-name">Dr. Ananya Sen, MD</div>
                <div className="report-signer-title">Consultant Clinical Pathologist</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
