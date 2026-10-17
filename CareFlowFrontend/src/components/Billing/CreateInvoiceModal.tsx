import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { billingService } from "../../services/billingService";
import { patientService } from "../../services/patientService";
import { Plus, Trash2, X, AlertCircle, FileText } from "../common/Icons";
import { useToast } from "../common";
import type {
  CreateInvoicePayload,
  CreateInvoiceLineItemInput,
  InvoiceLineItemType,
  Patient,
} from "../../types";
import "./CreateInvoiceModal.css";

interface CreateInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultPatientId?: number;
  onSuccess?: () => void;
}

const DEFAULT_LINE_ITEM: CreateInvoiceLineItemInput = {
  itemType: "Consultation",
  description: "Specialist Clinical Consultation Fee",
  quantity: 1,
  unitPrice: 75.0,
};

export const CreateInvoiceModal: React.FC<CreateInvoiceModalProps> = ({
  isOpen,
  onClose,
  defaultPatientId,
  onSuccess,
}) => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const [patientId, setPatientId] = useState<number | "">(defaultPatientId || "");
  const [issueDate, setIssueDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [dueDate, setDueDate] = useState<string>(
    new Date(Date.now() + 15 * 86400000).toISOString().split("T")[0]
  );
  const [paymentTerms, setPaymentTerms] = useState<string>("Net 15 Days");
  const [discount, setDiscount] = useState<number>(0);
  const [taxRate, setTaxRate] = useState<number>(0);
  const [notes, setNotes] = useState<string>("");
  const [items, setItems] = useState<CreateInvoiceLineItemInput[]>([DEFAULT_LINE_ITEM]);
  const [errorMsg, setErrorMsg] = useState<string>("");

  // Fetch Patients
  const { data: patientData } = useQuery({
    queryKey: ["patients"],
    queryFn: () => patientService.getPatients(),
    enabled: isOpen,
  });
  const patients: Patient[] = patientData?.patients || [];

  // Calculations
  const subtotal = items.reduce(
    (acc, curr) => acc + (curr.quantity || 0) * (curr.unitPrice || 0),
    0
  );
  const validDiscount = Math.min(subtotal, Math.max(0, discount || 0));
  const taxableBase = Math.max(0, subtotal - validDiscount);
  const taxAmount = (taxableBase * (taxRate || 0)) / 100;
  const grandTotal = taxableBase + taxAmount;

  // Add Item
  const handleAddItem = (preset?: Partial<CreateInvoiceLineItemInput>) => {
    setItems((prev) => [
      ...prev,
      {
        itemType: preset?.itemType || "Other",
        description: preset?.description || "",
        quantity: preset?.quantity || 1,
        unitPrice: preset?.unitPrice || 0,
      },
    ]);
  };

  // Remove Item
  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) {
      showToast("Invoice must contain at least one line item", "error");
      return;
    }
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  // Update Item
  const handleUpdateItem = (
    index: number,
    field: keyof CreateInvoiceLineItemInput,
    value: any
  ) => {
    setItems((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;
        return {
          ...item,
          [field]:
            field === "quantity" || field === "unitPrice"
              ? Math.max(0, parseFloat(value) || 0)
              : value,
        };
      })
    );
  };

  // Mutation
  const createMutation = useMutation({
    mutationFn: (payload: CreateInvoicePayload) => billingService.createInvoice(payload),
    onSuccess: (data) => {
      showToast(`Invoice ${data.invoiceNumber} created successfully!`, "success");
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["billingMetrics"] });
      queryClient.invalidateQueries({ queryKey: ["reportsOverview"] });
      if (onSuccess) onSuccess();
      handleClose();
    },
    onError: (err: any) => {
      setErrorMsg(err.message || "Failed to generate hospital invoice.");
    },
  });

  const handleClose = () => {
    setErrorMsg("");
    setDiscount(0);
    setTaxRate(0);
    setNotes("");
    setItems([DEFAULT_LINE_ITEM]);
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!patientId) {
      setErrorMsg("Please select a patient.");
      return;
    }

    if (items.length === 0) {
      setErrorMsg("At least one billable line item is required.");
      return;
    }

    const invalidItem = items.find(
      (item) => !item.description.trim() || item.quantity <= 0 || item.unitPrice < 0
    );
    if (invalidItem) {
      setErrorMsg("Please ensure all line items have a valid description, quantity, and unit price.");
      return;
    }

    createMutation.mutate({
      patientId: Number(patientId),
      issueDate,
      dueDate,
      paymentTerms,
      discount: Number(discount) || 0,
      taxRate: Number(taxRate) || 0,
      notes: notes.trim() || undefined,
      items,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="billing-modal-backdrop" onClick={handleClose}>
      <div
        className="billing-modal-container invoice-create-modal"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="billing-modal-header">
          <div className="billing-modal-header-left">
            <div className="billing-modal-icon-badge">
              <FileText size={20} color="#2563eb" />
            </div>
            <div>
              <h2 className="billing-modal-title">Create Hospital Invoice</h2>
              <p className="billing-modal-subtitle">
                Itemize clinical consultations, bed stays, diagnostics, medications & procedures
              </p>
            </div>
          </div>
          <button className="billing-modal-close" onClick={handleClose}>
            <X size={20} />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="billing-modal-form">
          {errorMsg && (
            <div className="billing-modal-alert billing-modal-alert-error">
              <AlertCircle size={18} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Top Form Grid */}
          <div className="invoice-meta-grid">
            <div className="billing-form-group span-2">
              <label className="billing-form-label">
                Patient <span className="billing-required">*</span>
              </label>
              <select
                className="billing-form-select"
                value={patientId}
                onChange={(e) => setPatientId(e.target.value ? Number(e.target.value) : "")}
                required
              >
                <option value="">-- Select Inpatient or Outpatient --</option>
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.mrn}) — {p.phone || "No phone"}
                  </option>
                ))}
              </select>
            </div>

            <div className="billing-form-group">
              <label className="billing-form-label">Issue Date</label>
              <input
                type="date"
                className="billing-form-input"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                required
              />
            </div>

            <div className="billing-form-group">
              <label className="billing-form-label">Payment Terms</label>
              <select
                className="billing-form-select"
                value={paymentTerms}
                onChange={(e) => setPaymentTerms(e.target.value)}
              >
                <option value="Immediate">Due Upon Receipt (Immediate)</option>
                <option value="Net 15 Days">Net 15 Days</option>
                <option value="Net 30 Days">Net 30 Days</option>
                <option value="TPA Insurance">TPA / Insurance Claim Pending</option>
              </select>
            </div>

            <div className="billing-form-group">
              <label className="billing-form-label">Due Date</label>
              <input
                type="date"
                className="billing-form-input"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Quick Item Presets */}
          <div className="invoice-quick-presets">
            <span className="preset-label">Quick Add:</span>
            <button
              type="button"
              className="preset-btn"
              onClick={() =>
                handleAddItem({
                  itemType: "Consultation",
                  description: "Senior Specialist Clinical Rounding",
                  quantity: 1,
                  unitPrice: 80.0,
                })
              }
            >
              + Consultation ($80)
            </button>
            <button
              type="button"
              className="preset-btn"
              onClick={() =>
                handleAddItem({
                  itemType: "Inpatient Bed Stay",
                  description: "Ward Semi-Private Inpatient Bed Stay",
                  quantity: 1,
                  unitPrice: 220.0,
                })
              }
            >
              + Bed Stay ($220)
            </button>
            <button
              type="button"
              className="preset-btn"
              onClick={() =>
                handleAddItem({
                  itemType: "Laboratory Test",
                  description: "Comprehensive Metabolic Panel (CMP)",
                  quantity: 1,
                  unitPrice: 95.0,
                })
              }
            >
              + Lab Test ($95)
            </button>
            <button
              type="button"
              className="preset-btn"
              onClick={() =>
                handleAddItem({
                  itemType: "Nursing Procedure",
                  description: "IV Cannulation & Medication Infusion Care",
                  quantity: 1,
                  unitPrice: 45.0,
                })
              }
            >
              + Nursing ($45)
            </button>
          </div>

          {/* Line Items Table */}
          <div className="invoice-items-section">
            <div className="invoice-items-header">
              <h3 className="section-title">Billable Line Items ({items.length})</h3>
              <button
                type="button"
                className="add-item-btn"
                onClick={() => handleAddItem()}
              >
                <Plus size={16} /> Add Custom Item
              </button>
            </div>

            <div className="invoice-table-wrapper">
              <table className="invoice-items-table">
                <thead>
                  <tr>
                    <th style={{ width: "22%" }}>Category</th>
                    <th style={{ width: "40%" }}>Item Description</th>
                    <th style={{ width: "12%" }}>Qty</th>
                    <th style={{ width: "14%" }}>Unit Price ($)</th>
                    <th style={{ width: "12%" }}>Line Total</th>
                    <th style={{ width: "6%" }}></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, idx) => (
                    <tr key={idx}>
                      <td>
                        <select
                          className="table-input"
                          value={item.itemType}
                          onChange={(e) =>
                            handleUpdateItem(idx, "itemType", e.target.value as InvoiceLineItemType)
                          }
                        >
                          <option value="Consultation">Consultation</option>
                          <option value="Inpatient Bed Stay">Inpatient Bed Stay</option>
                          <option value="Laboratory Test">Laboratory Test</option>
                          <option value="Pharmacy Medication">Pharmacy Medication</option>
                          <option value="Nursing Procedure">Nursing Procedure</option>
                          <option value="Other">Other</option>
                        </select>
                      </td>
                      <td>
                        <input
                          type="text"
                          className="table-input"
                          placeholder="e.g. ICU Bed Stay / Troponin Panel"
                          value={item.description}
                          onChange={(e) => handleUpdateItem(idx, "description", e.target.value)}
                          required
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          className="table-input number-input"
                          min="1"
                          step="1"
                          value={item.quantity}
                          onChange={(e) => handleUpdateItem(idx, "quantity", e.target.value)}
                          required
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          className="table-input number-input"
                          min="0"
                          step="0.01"
                          value={item.unitPrice}
                          onChange={(e) => handleUpdateItem(idx, "unitPrice", e.target.value)}
                          required
                        />
                      </td>
                      <td className="item-line-total">
                        ${((item.quantity || 0) * (item.unitPrice || 0)).toFixed(2)}
                      </td>
                      <td className="text-center">
                        <button
                          type="button"
                          className="row-delete-btn"
                          title="Remove item"
                          onClick={() => handleRemoveItem(idx)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Bottom Financial Breakdown & Notes */}
          <div className="invoice-bottom-grid">
            <div className="invoice-notes-col">
              <label className="billing-form-label">Billing Remarks & Instructions</label>
              <textarea
                className="billing-form-textarea"
                rows={4}
                placeholder="e.g. Inpatient co-pay, insurance policy claim reference number, or post-operative reconciliation notes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <div className="invoice-summary-card">
              <div className="summary-row">
                <span className="summary-label">Subtotal</span>
                <span className="summary-value">${subtotal.toFixed(2)}</span>
              </div>

              <div className="summary-row">
                <span className="summary-label">Discount ($)</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className="summary-input"
                  value={discount}
                  onChange={(e) => setDiscount(Math.max(0, parseFloat(e.target.value) || 0))}
                />
              </div>

              <div className="summary-row">
                <span className="summary-label">Tax Rate (%)</span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  className="summary-input"
                  value={taxRate}
                  onChange={(e) => setTaxRate(Math.max(0, parseFloat(e.target.value) || 0))}
                />
              </div>

              {taxAmount > 0 && (
                <div className="summary-row">
                  <span className="summary-label">Tax Amount</span>
                  <span className="summary-value">${taxAmount.toFixed(2)}</span>
                </div>
              )}

              <div className="summary-divider"></div>

              <div className="summary-row total-row">
                <span className="total-label">Grand Total</span>
                <span className="total-value">${grandTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="billing-modal-actions">
            <button
              type="button"
              className="billing-btn-secondary"
              onClick={handleClose}
              disabled={createMutation.isPending}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="billing-btn-primary"
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? "Generating Invoice..." : `Generate Invoice ($${grandTotal.toFixed(2)})`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateInvoiceModal;
