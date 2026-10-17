import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { bedService } from "../../services/bedService";
import { LogOut, X, AlertCircle } from "../common/Icons";
import { useToast } from "../common";
import type { AdmissionRecord, DischargePatientPayload } from "../../types";
import "./DischargePatientModal.css";

interface DischargePatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  admission: AdmissionRecord | null;
  onSuccess?: () => void;
}

export const DischargePatientModal: React.FC<DischargePatientModalProps> = ({
  isOpen,
  onClose,
  admission,
  onSuccess,
}) => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const [dischargeReason, setDischargeReason] = useState<
    "Recovered" | "Transferred" | "AMA" | "Deceased" | "Home with Support"
  >("Recovered");
  const [dischargeSummary, setDischargeSummary] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string>("");

  const dischargeMutation = useMutation({
    mutationFn: (payload: DischargePatientPayload) => {
      if (!admission) throw new Error("No admission selected");
      return bedService.dischargePatient(admission.id, payload);
    },
    onSuccess: (updated) => {
      showToast(
        `Successfully discharged patient from Bed ${updated.bedNumber}`,
        "success"
      );
      queryClient.invalidateQueries({ queryKey: ["wardsSummary"] });
      queryClient.invalidateQueries({ queryKey: ["beds"] });
      queryClient.invalidateQueries({ queryKey: ["admissions"] });
      queryClient.invalidateQueries({ queryKey: ["availableBeds"] });
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      if (onSuccess) onSuccess();
      handleClose();
    },
    onError: (err: any) => {
      setErrorMsg(err.message || "Failed to discharge patient");
    },
  });

  const handleClose = () => {
    setDischargeSummary("");
    setErrorMsg("");
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!admission) {
      setErrorMsg("No active admission selected.");
      return;
    }
    if (!dischargeSummary.trim()) {
      setErrorMsg("Clinical discharge summary and follow-up plan are required.");
      return;
    }

    const payload: DischargePatientPayload = {
      dischargeReason,
      dischargeSummary: dischargeSummary.trim(),
    };

    dischargeMutation.mutate(payload);
  };

  if (!isOpen || !admission) return null;

  return (
    <div className="discharge-modal-overlay" onClick={handleClose}>
      <div className="discharge-modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="discharge-modal-header">
          <div className="header-icon-box discharge-icon">
            <LogOut size={22} color="#f43f5e" />
          </div>
          <div>
            <h2 className="discharge-modal-title">Patient Discharge Protocol</h2>
            <p className="discharge-modal-subtitle">
              Formal inpatient discharge, final summary, and bed sanitation release
            </p>
          </div>
          <button className="discharge-close-btn" onClick={handleClose} type="button">
            <X size={18} />
          </button>
        </div>

        {errorMsg && (
          <div className="discharge-error-banner">
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="discharge-modal-form">
          {/* Stay Recap Card */}
          <div className="discharge-summary-card">
            <div className="summary-col">
              <span className="summary-label">Patient:</span>
              <span className="summary-val">{admission.patientName}</span>
              <span className="summary-sub">MRN: {admission.patientMrn} • {admission.diagnosis}</span>
            </div>
            <div className="summary-col">
              <span className="summary-label">Stay Details:</span>
              <span className="summary-val text-emerald">
                {admission.daysAdmitted} Days Inpatient
              </span>
              <span className="summary-sub">Bed: {admission.wardCode} - {admission.bedNumber}</span>
            </div>
          </div>

          {/* Discharge Reason */}
          <div className="form-group">
            <label className="form-label">
              Discharge Disposition <span className="req">*</span>
            </label>
            <select
              className="form-select"
              value={dischargeReason}
              onChange={(e) =>
                setDischargeReason(
                  e.target.value as "Recovered" | "Transferred" | "AMA" | "Deceased" | "Home with Support"
                )
              }
              disabled={dischargeMutation.isPending}
            >
              <option value="Recovered">Recovered / Treatment Completed</option>
              <option value="Home with Support">Discharged Home with Outpatient Support</option>
              <option value="Transferred">Transferred to Specialized Facility / Rehab</option>
              <option value="AMA">Against Medical Advice (AMA)</option>
              <option value="Deceased">Deceased</option>
            </select>
          </div>

          {/* Discharge Summary */}
          <div className="form-group">
            <label className="form-label">
              Clinical Discharge Summary & Orders <span className="req">*</span>
            </label>
            <textarea
              className="form-textarea"
              rows={4}
              placeholder="e.g. Hemodynamically stable, oral antibiotics prescribed for 5 days, outpatient follow-up scheduled with Dr. Sharma in 10 days"
              value={dischargeSummary}
              onChange={(e) => setDischargeSummary(e.target.value)}
              disabled={dischargeMutation.isPending}
            />
          </div>

          <div className="discharge-bed-notice">
            <span className="notice-icon">🧹</span>
            <span>
              Bed <strong>{admission.bedNumber}</strong> will automatically be switched to <strong>"Cleaning"</strong> status for terminal sanitization.
            </span>
          </div>

          <div className="discharge-modal-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={handleClose}
              disabled={dischargeMutation.isPending}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-discharge-confirm"
              disabled={dischargeMutation.isPending}
            >
              {dischargeMutation.isPending ? "Discharging..." : "Complete Discharge"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
