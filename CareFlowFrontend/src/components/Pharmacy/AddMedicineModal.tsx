import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { pharmacyService, FORMULARY_CATEGORIES } from "../../services/pharmacyService";
import { Plus, X, AlertCircle } from "../common/Icons";
import { useToast } from "../common";
import type { CreateMedicinePayload } from "../../types";
import "./AddMedicineModal.css";

interface AddMedicineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const DOSAGE_FORMS = [
  "Tablet",
  "Capsule",
  "Syrup",
  "Suspension",
  "Injection",
  "Inhaler",
  "Topical Cream",
  "Eye Drops",
  "Ointment",
  "Suppository",
];

export const AddMedicineModal: React.FC<AddMedicineModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const [sku, setSku] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [brandName, setBrandName] = useState<string>("");
  const [category, setCategory] = useState<string>("Antibiotic");
  const [dosageForm, setDosageForm] = useState<string>("Tablet");
  const [strength, setStrength] = useState<string>("");
  const [unitPrice, setUnitPrice] = useState<number | "">("");
  const [costPrice, setCostPrice] = useState<number | "">("");
  const [minStockLevel, setMinStockLevel] = useState<number>(50);
  const [prescriptionRequired, setPrescriptionRequired] = useState<boolean>(true);
  const [storageConditions, setStorageConditions] = useState<string>(
    "Store below 25°C in a dry place"
  );
  const [manufacturer, setManufacturer] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string>("");

  const createMutation = useMutation({
    mutationFn: (payload: CreateMedicinePayload) =>
      pharmacyService.createMedicine(payload),
    onSuccess: (created) => {
      showToast(`Added ${created.name} (${created.brandName}) to Formulary`, "success");
      queryClient.invalidateQueries({ queryKey: ["medicines"] });
      if (onSuccess) onSuccess();
      handleClose();
    },
    onError: (err: any) => {
      setErrorMsg(err.message || "Failed to add medication to formulary");
    },
  });

  const handleClose = () => {
    setSku("");
    setName("");
    setBrandName("");
    setStrength("");
    setUnitPrice("");
    setCostPrice("");
    setManufacturer("");
    setErrorMsg("");
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!sku.trim()) {
      setErrorMsg("SKU identifier is required.");
      return;
    }
    if (!name.trim()) {
      setErrorMsg("Generic medicine name is required.");
      return;
    }
    if (!brandName.trim()) {
      setErrorMsg("Brand / Trade name is required.");
      return;
    }
    if (!strength.trim()) {
      setErrorMsg("Strength (e.g. 500mg) is required.");
      return;
    }
    if (!unitPrice || Number(unitPrice) <= 0) {
      setErrorMsg("Unit retail price must be greater than 0.");
      return;
    }
    if (!costPrice || Number(costPrice) <= 0) {
      setErrorMsg("Unit cost price must be greater than 0.");
      return;
    }

    const payload: CreateMedicinePayload = {
      sku: sku.trim().toUpperCase(),
      name: name.trim(),
      brandName: brandName.trim(),
      category,
      dosageForm,
      strength: strength.trim(),
      unitPrice: Number(unitPrice),
      costPrice: Number(costPrice),
      minStockLevel: Number(minStockLevel) || 50,
      prescriptionRequired,
      storageConditions: storageConditions.trim() || undefined,
      manufacturer: manufacturer.trim() || undefined,
    };

    createMutation.mutate(payload);
  };

  if (!isOpen) return null;

  const validCategories = FORMULARY_CATEGORIES.filter(
    (c) => c !== "All Categories"
  );

  return (
    <div className="add-med-overlay" onClick={handleClose}>
      <div className="add-med-container" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="add-med-header">
          <div className="header-icon-box add-icon">
            <Plus size={22} color="#10b981" />
          </div>
          <div>
            <h2 className="add-med-title">Register Formulary Medicine</h2>
            <p className="add-med-subtitle">
              Add new approved pharmaceutical entity into hospital catalog
            </p>
          </div>
          <button className="add-med-close-btn" onClick={handleClose} type="button">
            <X size={18} />
          </button>
        </div>

        {errorMsg && (
          <div className="add-med-error-banner">
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="add-med-form">
          <div className="form-grid-3">
            {/* SKU */}
            <div className="form-group">
              <label className="form-label">
                SKU / NDC Code <span className="req">*</span>
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. MED-GAS-004"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                disabled={createMutation.isPending}
              />
            </div>

            {/* Generic Name */}
            <div className="form-group">
              <label className="form-label">
                Generic Name <span className="req">*</span>
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Omeprazole"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={createMutation.isPending}
              />
            </div>

            {/* Brand Name */}
            <div className="form-group">
              <label className="form-label">
                Brand Name <span className="req">*</span>
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Prilosec"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                disabled={createMutation.isPending}
              />
            </div>
          </div>

          <div className="form-grid-3">
            {/* Category */}
            <div className="form-group">
              <label className="form-label">Therapeutic Category</label>
              <select
                className="form-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                disabled={createMutation.isPending}
              >
                {validCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Dosage Form */}
            <div className="form-group">
              <label className="form-label">Dosage Form</label>
              <select
                className="form-select"
                value={dosageForm}
                onChange={(e) => setDosageForm(e.target.value)}
                disabled={createMutation.isPending}
              >
                {DOSAGE_FORMS.map((form) => (
                  <option key={form} value={form}>
                    {form}
                  </option>
                ))}
              </select>
            </div>

            {/* Strength */}
            <div className="form-group">
              <label className="form-label">
                Strength <span className="req">*</span>
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. 20mg or 500mg"
                value={strength}
                onChange={(e) => setStrength(e.target.value)}
                disabled={createMutation.isPending}
              />
            </div>
          </div>

          <div className="form-grid-3">
            {/* Retail Unit Price */}
            <div className="form-group">
              <label className="form-label">
                Retail Price ($) <span className="req">*</span>
              </label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                className="form-input"
                placeholder="e.g. 6.50"
                value={unitPrice}
                onChange={(e) =>
                  setUnitPrice(e.target.value === "" ? "" : Number(e.target.value))
                }
                disabled={createMutation.isPending}
              />
            </div>

            {/* Cost Price */}
            <div className="form-group">
              <label className="form-label">
                Cost Price ($) <span className="req">*</span>
              </label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                className="form-input"
                placeholder="e.g. 2.40"
                value={costPrice}
                onChange={(e) =>
                  setCostPrice(e.target.value === "" ? "" : Number(e.target.value))
                }
                disabled={createMutation.isPending}
              />
            </div>

            {/* Min Stock Level */}
            <div className="form-group">
              <label className="form-label">Min Stock Threshold</label>
              <input
                type="number"
                min="0"
                step="1"
                className="form-input"
                value={minStockLevel}
                onChange={(e) => setMinStockLevel(Number(e.target.value))}
                disabled={createMutation.isPending}
              />
            </div>
          </div>

          <div className="form-grid-2">
            {/* Manufacturer */}
            <div className="form-group">
              <label className="form-label">Manufacturer / Supplier</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. AstraZeneca / Sun Pharma"
                value={manufacturer}
                onChange={(e) => setManufacturer(e.target.value)}
                disabled={createMutation.isPending}
              />
            </div>

            {/* Storage Conditions */}
            <div className="form-group">
              <label className="form-label">Storage Conditions</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Store below 25°C in dry place"
                value={storageConditions}
                onChange={(e) => setStorageConditions(e.target.value)}
                disabled={createMutation.isPending}
              />
            </div>
          </div>

          {/* Rx Required Checkbox */}
          <div className="rx-toggle-row">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={prescriptionRequired}
                onChange={(e) => setPrescriptionRequired(e.target.checked)}
                disabled={createMutation.isPending}
              />
              <span className="checkbox-custom"></span>
              <span className="checkbox-text">
                Prescription Required (Schedule / Restricted Medication)
              </span>
            </label>
          </div>

          {/* Actions */}
          <div className="add-med-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={handleClose}
              disabled={createMutation.isPending}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-add-confirm"
              disabled={createMutation.isPending}
            >
              <Plus size={16} />
              {createMutation.isPending
                ? "Registering..."
                : "Add to Hospital Formulary"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
