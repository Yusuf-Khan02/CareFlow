import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { bedService } from "../../services/bedService";
import { ArrowRightLeft, X, AlertCircle } from "../common/Icons";
import { useToast } from "../common";
import type {
  AdmissionRecord,
  TransferBedPayload,
  AvailableBedOption,
} from "../../types";
import "./TransferBedModal.css";

interface TransferBedModalProps {
  isOpen: boolean;
  onClose: () => void;
  admission: AdmissionRecord | null;
  onSuccess?: () => void;
}

export const TransferBedModal: React.FC<TransferBedModalProps> = ({
  isOpen,
  onClose,
  admission,
  onSuccess,
}) => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const [toBedId, setToBedId] = useState<string>("");
  const [reason, setReason] = useState<string>("");
  const [transferredBy, setTransferredBy] = useState<string>("Charge Nurse");
  const [errorMsg, setErrorMsg] = useState<string>("");

  // Fetch Available Beds
  const { data: availableBeds = [] } = useQuery({
    queryKey: ["availableBeds"],
    queryFn: () => bedService.getAvailableBeds(),
    enabled: isOpen,
  });

  useEffect(() => {
    if (availableBeds.length > 0 && !toBedId) {
      setToBedId(availableBeds[0].id);
    }
  }, [availableBeds, toBedId]);

  const transferMutation = useMutation({
    mutationFn: (payload: TransferBedPayload) => {
      if (!admission) throw new Error("No admission selected");
      return bedService.transferPatient(admission.id, payload);
    },
    onSuccess: (updated) => {
      showToast(
        `Successfully transferred patient to Bed ${updated.bedNumber}`,
        "success"
      );
      queryClient.invalidateQueries({ queryKey: ["wardsSummary"] });
      queryClient.invalidateQueries({ queryKey: ["beds"] });
      queryClient.invalidateQueries({ queryKey: ["admissions"] });
      queryClient.invalidateQueries({ queryKey: ["availableBeds"] });
      if (onSuccess) onSuccess();
      handleClose();
    },
    onError: (err: any) => {
      setErrorMsg(err.message || "Failed to transfer patient");
    },
  });

  const handleClose = () => {
    setReason("");
    setErrorMsg("");
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!admission) {
      setErrorMsg("No active admission provided.");
      return;
    }
    if (!toBedId) {
      setErrorMsg("Please select a target destination bed.");
      return;
    }
    if (!reason.trim()) {
      setErrorMsg("Clinical or operational reason for transfer is required.");
      return;
    }

    const payload: TransferBedPayload = {
      toBedId,
      reason: reason.trim(),
      transferredBy: transferredBy.trim() || "Charge Nurse",
    };

    transferMutation.mutate(payload);
  };

  if (!isOpen || !admission) return null;

  return (
    <div className="transfer-modal-overlay" onClick={handleClose}>
      <div className="transfer-modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="transfer-modal-header">
          <div className="header-icon-box transfer-icon">
            <ArrowRightLeft size={22} color="#0284c7" />
          </div>
          <div>
            <h2 className="transfer-modal-title">Internal Bed Transfer</h2>
            <p className="transfer-modal-subtitle">
              Relocate patient to another ward or specialized inpatient suite
            </p>
          </div>
          <button className="transfer-close-btn" onClick={handleClose} type="button">
            <X size={18} />
          </button>
        </div>

        {errorMsg && (
          <div className="transfer-error-banner">
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="transfer-modal-form">
          {/* Patient & Source Bed Summary */}
          <div className="transfer-summary-card">
            <div className="summary-col">
              <span className="summary-label">Patient Name:</span>
              <span className="summary-val">{admission.patientName}</span>
              <span className="summary-sub">{admission.patientMrn} • {admission.diagnosis}</span>
            </div>
            <div className="summary-col">
              <span className="summary-label">Current Placement:</span>
              <span className="summary-val text-amber">
                {admission.wardCode} - {admission.bedNumber}
              </span>
              <span className="summary-sub">{admission.wardName}</span>
            </div>
          </div>

          {/* Destination Bed Selector */}
          <div className="form-group">
            <label className="form-label">
              Destination Bed <span className="req">*</span>
            </label>
            <select
              className="form-select"
              value={toBedId}
              onChange={(e) => setToBedId(e.target.value)}
              disabled={transferMutation.isPending}
            >
              {availableBeds.length === 0 ? (
                <option value="" disabled>No available beds ready</option>
              ) : (
                availableBeds
                  .filter((b) => b.id !== admission.bedId)
                  .map((b: AvailableBedOption) => (
                    <option key={b.id} value={b.id}>
                      {b.label} — ${b.dailyRate}/day
                    </option>
                  ))
              )}
            </select>
            <span className="transfer-hint">
              * Note: The source bed ({admission.bedNumber}) will automatically transition to "Cleaning" status.
            </span>
          </div>

          <div className="form-group">
            <label className="form-label">
              Reason for Transfer <span className="req">*</span>
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. ICU step-down to General Ward / Patient requested private room"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={transferMutation.isPending}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Authorized Staff Member</label>
            <input
              type="text"
              className="form-input"
              value={transferredBy}
              onChange={(e) => setTransferredBy(e.target.value)}
              disabled={transferMutation.isPending}
            />
          </div>

          <div className="transfer-modal-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={handleClose}
              disabled={transferMutation.isPending}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-transfer-confirm"
              disabled={transferMutation.isPending || availableBeds.length === 0}
            >
              {transferMutation.isPending ? "Transferring..." : "Confirm Bed Transfer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
