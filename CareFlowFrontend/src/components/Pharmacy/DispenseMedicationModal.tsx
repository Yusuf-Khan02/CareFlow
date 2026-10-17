import React, { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { pharmacyService } from "../../services/pharmacyService";
import { Pill, X, AlertCircle, ArrowDownRight, Clock } from "../common/Icons";
import { useToast } from "../common";
import type { Medicine, DispenseStockPayload } from "../../types";
import "./DispenseMedicationModal.css";

interface DispenseMedicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  medicines: Medicine[];
  defaultMedicineId?: string;
  defaultPrescriptionId?: string;
  defaultPatientName?: string;
  defaultQuantity?: number;
  onSuccess?: () => void;
}

export const DispenseMedicationModal: React.FC<DispenseMedicationModalProps> = ({
  isOpen,
  onClose,
  medicines,
  defaultMedicineId,
  defaultPrescriptionId,
  defaultPatientName,
  defaultQuantity,
  onSuccess,
}) => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const [medicineId, setMedicineId] = useState<string>(defaultMedicineId || "");
  const [quantity, setQuantity] = useState<number | "">(defaultQuantity || "");
  const [patientName, setPatientName] = useState<string>(defaultPatientName || "");
  const [prescriptionId, setPrescriptionId] = useState<string>(
    defaultPrescriptionId || ""
  );
  const [performedBy, setPerformedBy] = useState<string>("Staff Pharmacist");
  const [notes, setNotes] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string>("");

  useEffect(() => {
    if (defaultMedicineId) {
      setMedicineId(defaultMedicineId);
    } else if (medicines.length > 0 && !medicineId) {
      setMedicineId(medicines[0].id);
    }
    if (defaultPrescriptionId) setPrescriptionId(defaultPrescriptionId);
    if (defaultPatientName) setPatientName(defaultPatientName);
    if (defaultQuantity) setQuantity(defaultQuantity);
  }, [
    defaultMedicineId,
    defaultPrescriptionId,
    defaultPatientName,
    defaultQuantity,
    medicines,
    isOpen,
  ]);

  const selectedMed = medicines.find((m) => m.id === medicineId);

  const dispenseMutation = useMutation({
    mutationFn: (payload: DispenseStockPayload) =>
      pharmacyService.dispenseStock(payload),
    onSuccess: (updatedMed) => {
      showToast(
        `Dispensed ${quantity} units of ${updatedMed.name} via FEFO allocation`,
        "success"
      );
      queryClient.invalidateQueries({ queryKey: ["medicines"] });
      queryClient.invalidateQueries({ queryKey: ["pharmacyMovements"] });
      queryClient.invalidateQueries({ queryKey: ["pendingPrescriptions"] });
      queryClient.invalidateQueries({ queryKey: ["lowStockAlerts"] });
      if (onSuccess) onSuccess();
      handleClose();
    },
    onError: (err: any) => {
      setErrorMsg(err.message || "Failed to dispense medication");
    },
  });

  const handleClose = () => {
    setQuantity("");
    setNotes("");
    setErrorMsg("");
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!medicineId) {
      setErrorMsg("Please select a medication to dispense.");
      return;
    }
    if (!quantity || Number(quantity) <= 0) {
      setErrorMsg("Dispensing quantity must be at least 1 unit.");
      return;
    }
    if (selectedMed && Number(quantity) > selectedMed.currentStock) {
      setErrorMsg(
        `Insufficient stock! Requested: ${quantity}, Available in Central Pharmacy: ${selectedMed.currentStock}`
      );
      return;
    }

    const payload: DispenseStockPayload = {
      medicineId,
      quantity: Number(quantity),
      prescriptionId: prescriptionId.trim() || undefined,
      patientName: patientName.trim() || undefined,
      performedBy: performedBy.trim() || "Staff Pharmacist",
      notes: notes.trim() || undefined,
    };

    dispenseMutation.mutate(payload);
  };

  if (!isOpen) return null;

  const activeBatches = (selectedMed?.batches || []).filter(
    (b) => b.quantityRemaining > 0
  );

  return (
    <div className="dispense-modal-overlay" onClick={handleClose}>
      <div className="dispense-modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="dispense-modal-header">
          <div className="header-icon-box dispense-icon">
            <Pill size={22} color="#38bdf8" />
          </div>
          <div>
            <h2 className="dispense-modal-title">Dispense Medication (FEFO)</h2>
            <p className="dispense-modal-subtitle">
              First-Expiring First-Out automated batch allocation
            </p>
          </div>
          <button className="dispense-close-btn" onClick={handleClose} type="button">
            <X size={18} />
          </button>
        </div>

        {errorMsg && (
          <div className="dispense-error-banner">
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="dispense-modal-form">
          {/* Medicine Selection */}
          <div className="form-group">
            <label className="form-label">
              Medication <span className="req">*</span>
            </label>
            <select
              className="form-select"
              value={medicineId}
              onChange={(e) => setMedicineId(e.target.value)}
              disabled={dispenseMutation.isPending}
            >
              {medicines.map((m) => (
                <option
                  key={m.id}
                  value={m.id}
                  disabled={m.currentStock === 0}
                >
                  {m.name} ({m.strength}) — In Stock: {m.currentStock} {m.currentStock === 0 ? "(DEPLETED)" : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Active Batches FEFO Breakdown */}
          {selectedMed && (
            <div className="fefo-preview-box">
              <div className="fefo-preview-header">
                <span className="fefo-title">
                  <Clock size={14} color="#38bdf8" /> Active Batches (FEFO Order):
                </span>
                <span className="fefo-total">
                  Total Available: <strong>{selectedMed.currentStock} units</strong>
                </span>
              </div>
              {activeBatches.length > 0 ? (
                <div className="fefo-batches-list">
                  {activeBatches.map((b, idx) => (
                    <div key={b.id || idx} className="fefo-batch-pill">
                      <span className="batch-priority">#{idx + 1}</span>
                      <span className="batch-no">{b.batchNumber}</span>
                      <span className="batch-qty">{b.quantityRemaining} units</span>
                      <span className="batch-exp">Exp: {b.expiryDate}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="fefo-depleted-warning">
                  ⚠️ No active batches in inventory. Medication is out of stock.
                </div>
              )}
            </div>
          )}

          <div className="form-grid-2">
            {/* Quantity */}
            <div className="form-group">
              <label className="form-label">
                Quantity to Dispense <span className="req">*</span>
              </label>
              <input
                type="number"
                min="1"
                max={selectedMed ? selectedMed.currentStock : undefined}
                className="form-input"
                placeholder="e.g. 14"
                value={quantity}
                onChange={(e) =>
                  setQuantity(e.target.value === "" ? "" : Number(e.target.value))
                }
                disabled={dispenseMutation.isPending || !selectedMed || selectedMed.currentStock === 0}
              />
              {selectedMed && quantity && Number(quantity) > 0 && (
                <span className="unit-cost-preview">
                  Total Value: ${((Number(quantity) * selectedMed.unitPrice)).toFixed(2)} (${selectedMed.unitPrice.toFixed(2)}/unit)
                </span>
              )}
            </div>

            {/* Patient Name */}
            <div className="form-group">
              <label className="form-label">Patient Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Sarah Jenkins"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                disabled={dispenseMutation.isPending}
              />
            </div>
          </div>

          <div className="form-grid-2">
            {/* Prescription Reference */}
            <div className="form-group">
              <label className="form-label">Prescription / Order ID</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. RX-2024-001 or Direct"
                value={prescriptionId}
                onChange={(e) => setPrescriptionId(e.target.value)}
                disabled={dispenseMutation.isPending}
              />
            </div>

            {/* Performed By */}
            <div className="form-group">
              <label className="form-label">Dispensing Pharmacist</label>
              <input
                type="text"
                className="form-input"
                value={performedBy}
                onChange={(e) => setPerformedBy(e.target.value)}
                disabled={dispenseMutation.isPending}
              />
            </div>
          </div>

          {/* Notes */}
          <div className="form-group">
            <label className="form-label">Instructions / Consultation Notes</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Advised patient to take after meals with plenty of water"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={dispenseMutation.isPending}
            />
          </div>

          {/* Actions */}
          <div className="dispense-modal-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={handleClose}
              disabled={dispenseMutation.isPending}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-dispense-confirm"
              disabled={
                dispenseMutation.isPending ||
                !selectedMed ||
                selectedMed.currentStock === 0
              }
            >
              <ArrowDownRight size={16} />
              {dispenseMutation.isPending
                ? "Deducting Batches..."
                : "Confirm Dispensation"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
