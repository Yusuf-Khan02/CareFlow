import React, { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { bedService } from "../../services/bedService";
import { BedDouble, X, AlertCircle } from "../common/Icons";
import { useToast } from "../common";
import type { BedItem, BedStatus } from "../../types";
import "./UpdateBedStatusModal.css";

interface UpdateBedStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  bed: BedItem | null;
  onSuccess?: () => void;
}

export const UpdateBedStatusModal: React.FC<UpdateBedStatusModalProps> = ({
  isOpen,
  onClose,
  bed,
  onSuccess,
}) => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const [status, setStatus] = useState<BedStatus>("Available");
  const [errorMsg, setErrorMsg] = useState<string>("");

  useEffect(() => {
    if (bed) {
      setStatus(bed.status);
    }
  }, [bed, isOpen]);

  const updateMutation = useMutation({
    mutationFn: () => {
      if (!bed) throw new Error("No bed selected");
      return bedService.updateBedStatus(bed.id, status);
    },
    onSuccess: (updated) => {
      showToast(
        `Bed ${updated.bedNumber} status updated to '${status}'`,
        "success"
      );
      queryClient.invalidateQueries({ queryKey: ["wardsSummary"] });
      queryClient.invalidateQueries({ queryKey: ["beds"] });
      queryClient.invalidateQueries({ queryKey: ["availableBeds"] });
      if (onSuccess) onSuccess();
      handleClose();
    },
    onError: (err: any) => {
      setErrorMsg(err.message || "Failed to update bed status");
    },
  });

  const handleClose = () => {
    setErrorMsg("");
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    updateMutation.mutate();
  };

  if (!isOpen || !bed) return null;

  return (
    <div className="status-modal-overlay" onClick={handleClose}>
      <div className="status-modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="status-modal-header">
          <div className="header-icon-box status-icon">
            <BedDouble size={22} color="#0d9488" />
          </div>
          <div>
            <h2 className="status-modal-title">Update Bed Operational Status</h2>
            <p className="status-modal-subtitle">
              Manage terminal cleaning, maintenance, or availability release
            </p>
          </div>
          <button className="status-close-btn" onClick={handleClose} type="button">
            <X size={18} />
          </button>
        </div>

        {errorMsg && (
          <div className="status-error-banner">
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="status-modal-form">
          <div className="status-bed-info">
            <span className="info-bed-name">
              {bed.wardCode} - {bed.bedNumber}
            </span>
            <span className="info-room-sub">
              {bed.wardName} • Room {bed.roomNumber} ({bed.bedType})
            </span>
          </div>

          <div className="form-group">
            <label className="form-label">Operational Status</label>
            <div className="status-options-grid">
              <label
                className={`status-option ${status === "Available" ? "selected option-avail" : ""}`}
              >
                <input
                  type="radio"
                  name="bedStatus"
                  value="Available"
                  checked={status === "Available"}
                  onChange={() => setStatus("Available")}
                  disabled={bed.status === "Occupied"}
                />
                <span className="opt-title">🟢 Available</span>
                <span className="opt-desc">Ready for new inpatient admission</span>
              </label>

              <label
                className={`status-option ${status === "Cleaning" ? "selected option-clean" : ""}`}
              >
                <input
                  type="radio"
                  name="bedStatus"
                  value="Cleaning"
                  checked={status === "Cleaning"}
                  onChange={() => setStatus("Cleaning")}
                />
                <span className="opt-title">🧹 Cleaning</span>
                <span className="opt-desc">Sanitization / terminal disinfection in progress</span>
              </label>

              <label
                className={`status-option ${status === "Maintenance" ? "selected option-maint" : ""}`}
              >
                <input
                  type="radio"
                  name="bedStatus"
                  value="Maintenance"
                  checked={status === "Maintenance"}
                  onChange={() => setStatus("Maintenance")}
                />
                <span className="opt-title">🔧 Maintenance</span>
                <span className="opt-desc">Out of service for biomedical repairs</span>
              </label>

              <label
                className={`status-option ${status === "Reserved" ? "selected option-res" : ""}`}
              >
                <input
                  type="radio"
                  name="bedStatus"
                  value="Reserved"
                  checked={status === "Reserved"}
                  onChange={() => setStatus("Reserved")}
                />
                <span className="opt-title">🔵 Reserved</span>
                <span className="opt-desc">Holding for planned ER / surgical arrival</span>
              </label>
            </div>
          </div>

          <div className="status-modal-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={handleClose}
              disabled={updateMutation.isPending}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? "Updating..." : "Save Status"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
