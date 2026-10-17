import React, { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { pharmacyService } from "../../services/pharmacyService";
import { Package, X, AlertCircle } from "../common/Icons";
import { useToast } from "../common";
import type { Medicine, ReceiveStockPayload } from "../../types";
import "./ReceiveStockModal.css";

interface ReceiveStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMedicineId?: string;
  medicines: Medicine[];
  onSuccess?: () => void;
}

export const ReceiveStockModal: React.FC<ReceiveStockModalProps> = ({
  isOpen,
  onClose,
  defaultMedicineId,
  medicines,
  onSuccess,
}) => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const [medicineId, setMedicineId] = useState<string>(defaultMedicineId || "");
  const [batchNumber, setBatchNumber] = useState<string>("");
  const [quantityReceived, setQuantityReceived] = useState<number | "">("");
  const [expiryDate, setExpiryDate] = useState<string>("");
  const [purchaseDate, setPurchaseDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [supplierName, setSupplierName] = useState<string>("");
  const [costPerUnit, setCostPerUnit] = useState<number | "">("");
  const [notes, setNotes] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string>("");

  useEffect(() => {
    if (defaultMedicineId) {
      setMedicineId(defaultMedicineId);
      const selected = medicines.find((m) => m.id === defaultMedicineId);
      if (selected) {
        setCostPerUnit(selected.costPrice);
      }
    } else if (medicines.length > 0 && !medicineId) {
      setMedicineId(medicines[0].id);
      setCostPerUnit(medicines[0].costPrice);
    }
  }, [defaultMedicineId, medicines, isOpen]);

  const handleMedicineChange = (id: string) => {
    setMedicineId(id);
    const selected = medicines.find((m) => m.id === id);
    if (selected) {
      setCostPerUnit(selected.costPrice);
    }
  };

  const receiveMutation = useMutation({
    mutationFn: (payload: ReceiveStockPayload) => pharmacyService.receiveStock(payload),
    onSuccess: (updatedMed) => {
      showToast(
        `Successfully received ${quantityReceived} units for ${updatedMed.name} (Batch: ${batchNumber})`,
        "success"
      );
      queryClient.invalidateQueries({ queryKey: ["medicines"] });
      queryClient.invalidateQueries({ queryKey: ["pharmacyMovements"] });
      queryClient.invalidateQueries({ queryKey: ["lowStockAlerts"] });
      if (onSuccess) onSuccess();
      handleClose();
    },
    onError: (err: any) => {
      setErrorMsg(err.message || "Failed to log incoming stock shipment");
    },
  });

  const handleClose = () => {
    setBatchNumber("");
    setQuantityReceived("");
    setExpiryDate("");
    setSupplierName("");
    setNotes("");
    setErrorMsg("");
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!medicineId) {
      setErrorMsg("Please select a medication from the formulary.");
      return;
    }
    if (!batchNumber.trim()) {
      setErrorMsg("Batch / Lot number is required for regulatory traceability.");
      return;
    }
    if (!quantityReceived || Number(quantityReceived) <= 0) {
      setErrorMsg("Quantity received must be at least 1 unit.");
      return;
    }
    if (!expiryDate) {
      setErrorMsg("Batch expiration date is mandatory.");
      return;
    }

    const payload: ReceiveStockPayload = {
      medicineId,
      batchNumber: batchNumber.trim().toUpperCase(),
      quantityReceived: Number(quantityReceived),
      expiryDate,
      purchaseDate,
      supplierName: supplierName.trim() || "Hospital Central Depot",
      costPerUnit: costPerUnit ? Number(costPerUnit) : undefined,
      notes: notes.trim() || undefined,
    };

    receiveMutation.mutate(payload);
  };

  if (!isOpen) return null;

  const selectedMed = medicines.find((m) => m.id === medicineId);

  return (
    <div className="receive-modal-overlay" onClick={handleClose}>
      <div className="receive-modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="receive-modal-header">
          <div className="header-icon-box">
            <Package size={22} color="#0d9488" />
          </div>
          <div>
            <h2 className="receive-modal-title">Receive Stock Shipment</h2>
            <p className="receive-modal-subtitle">
              Record verified shipment batch into hospital central pharmacy
            </p>
          </div>
          <button className="receive-close-btn" onClick={handleClose} type="button">
            <X size={18} />
          </button>
        </div>

        {errorMsg && (
          <div className="receive-error-banner">
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="receive-modal-form">
          {/* Medicine Selector */}
          <div className="form-group">
            <label className="form-label">
              Formulary Medication <span className="req">*</span>
            </label>
            <select
              className="form-select"
              value={medicineId}
              onChange={(e) => handleMedicineChange(e.target.value)}
              disabled={receiveMutation.isPending}
            >
              {medicines.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.strength}) — {m.brandName} [Stock: {m.currentStock}]
                </option>
              ))}
            </select>
            {selectedMed && (
              <div className="med-info-chip">
                <span>SKU: <strong>{selectedMed.sku}</strong></span>
                <span>Category: <strong>{selectedMed.category}</strong></span>
                <span>Current In-Stock: <strong>{selectedMed.currentStock}</strong></span>
              </div>
            )}
          </div>

          <div className="form-grid-2">
            {/* Batch / Lot */}
            <div className="form-group">
              <label className="form-label">
                Batch / Lot Number <span className="req">*</span>
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. AMX-2024-009"
                value={batchNumber}
                onChange={(e) => setBatchNumber(e.target.value)}
                disabled={receiveMutation.isPending}
              />
            </div>

            {/* Quantity */}
            <div className="form-group">
              <label className="form-label">
                Quantity Received (Units) <span className="req">*</span>
              </label>
              <input
                type="number"
                min="1"
                step="1"
                className="form-input"
                placeholder="e.g. 500"
                value={quantityReceived}
                onChange={(e) =>
                  setQuantityReceived(e.target.value === "" ? "" : Number(e.target.value))
                }
                disabled={receiveMutation.isPending}
              />
            </div>
          </div>

          <div className="form-grid-2">
            {/* Expiry Date */}
            <div className="form-group">
              <label className="form-label">
                Expiry Date <span className="req">*</span>
              </label>
              <input
                type="date"
                className="form-input"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                disabled={receiveMutation.isPending}
              />
            </div>

            {/* Purchase Date */}
            <div className="form-group">
              <label className="form-label">Purchase / Inward Date</label>
              <input
                type="date"
                className="form-input"
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
                disabled={receiveMutation.isPending}
              />
            </div>
          </div>

          <div className="form-grid-2">
            {/* Supplier */}
            <div className="form-group">
              <label className="form-label">Supplier / Distributor</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Apex Medical Logistics"
                value={supplierName}
                onChange={(e) => setSupplierName(e.target.value)}
                disabled={receiveMutation.isPending}
              />
            </div>

            {/* Cost Per Unit */}
            <div className="form-group">
              <label className="form-label">Unit Cost Price ($)</label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                className="form-input"
                placeholder="e.g. 4.50"
                value={costPerUnit}
                onChange={(e) =>
                  setCostPerUnit(e.target.value === "" ? "" : Number(e.target.value))
                }
                disabled={receiveMutation.isPending}
              />
            </div>
          </div>

          {/* Notes */}
          <div className="form-group">
            <label className="form-label">Shipment Notes / Invoice Reference</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. PO-8921 / Cold chain verified at 4°C"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={receiveMutation.isPending}
            />
          </div>

          {/* Actions */}
          <div className="receive-modal-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={handleClose}
              disabled={receiveMutation.isPending}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={receiveMutation.isPending}
            >
              {receiveMutation.isPending ? "Recording Batch..." : "Confirm & Receive Stock"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
