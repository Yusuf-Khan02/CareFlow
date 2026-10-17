import React, { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { labService, LAB_CATALOG } from "../../services/labService";
import { Microscope, Plus, Trash2, X, CheckCircle2 } from "../common/Icons";
import { useToast } from "../common";
import type { LabOrder, LabResultItem, LabResultStatus } from "../../types";
import "./EnterLabResultsModal.css";

interface EnterLabResultsModalProps {
  order: LabOrder | null;
  isOpen: boolean;
  onClose: () => void;
}

interface ResultRow extends LabResultItem {
  tempId: string;
}

export const EnterLabResultsModal: React.FC<EnterLabResultsModalProps> = ({
  order,
  isOpen,
  onClose,
}) => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const [rows, setRows] = useState<ResultRow[]>([]);
  const [technicianNotes, setTechnicianNotes] = useState("");
  const [verifiedBy, setVerifiedBy] = useState("Vikram Sen, Senior Lab Technologist");

  // When order changes, populate with existing results or template defaults from catalog
  useEffect(() => {
    if (!order) return;

    if (order.results && order.results.length > 0) {
      setRows(
        order.results.map((r, idx) => ({
          ...r,
          tempId: r.id || `row-${idx}`,
        }))
      );
      setVerifiedBy(order.results[0].verifiedBy || "Vikram Sen, Senior Lab Technologist");
      setTechnicianNotes(order.results[0].technicianNotes || "");
    } else {
      // Find matching catalog test
      const cat = LAB_CATALOG.find(
        (c: any) => c.testName.toLowerCase() === order.testName.toLowerCase()
      );
      if (cat && cat.defaultParameters.length > 0) {
        setRows(
          cat.defaultParameters.map((p: any, idx: number) => ({
            tempId: `default-${idx}`,
            parameterName: p.name,
            measuredValue: "",
            unit: p.unit,
            referenceRange: p.referenceRange,
            status: "Normal" as LabResultStatus,
          }))
        );
      } else {
        setRows([
          {
            tempId: "row-0",
            parameterName: "Primary Analyte",
            measuredValue: "",
            unit: "",
            referenceRange: "",
            status: "Normal",
          },
        ]);
      }
      setTechnicianNotes(order.clinicalNotes || "");
    }
  }, [order, isOpen]);

  const addRow = () => {
    setRows((prev) => [
      ...prev,
      {
        tempId: `row-${Date.now()}`,
        parameterName: "",
        measuredValue: "",
        unit: "",
        referenceRange: "",
        status: "Normal",
      },
    ]);
  };

  const removeRow = (tempId: string) => {
    setRows((prev) => prev.filter((r) => r.tempId !== tempId));
  };

  const updateRow = (tempId: string, field: keyof LabResultItem, val: string) => {
    setRows((prev) =>
      prev.map((r) => (r.tempId === tempId ? { ...r, [field]: val } : r))
    );
  };

  const enterResultsMutation = useMutation({
    mutationFn: (payload: { id: string; data: any }) =>
      labService.enterResults(payload.id, payload.data),
    onSuccess: (updated) => {
      showToast(`Results verified and recorded for ${updated.orderNumber}!`, "success");
      queryClient.invalidateQueries({ queryKey: ["labOrders"] });
      onClose();
    },
    onError: (err: any) => {
      showToast(err.message || "Failed to save lab results.", "error");
    },
  });

  if (!isOpen || !order) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validRows = rows.filter((r) => r.parameterName.trim() && r.measuredValue.trim());

    if (validRows.length === 0) {
      showToast("Please enter at least one measured parameter value.", "error");
      return;
    }

    enterResultsMutation.mutate({
      id: order.id,
      data: {
        results: validRows.map((r) => ({
          parameterName: r.parameterName.trim(),
          measuredValue: r.measuredValue.trim(),
          unit: r.unit.trim(),
          referenceRange: r.referenceRange.trim(),
          status: r.status,
          technicianNotes: r.technicianNotes || technicianNotes || undefined,
          verifiedBy: verifiedBy.trim() || undefined,
        })),
        verifiedBy: verifiedBy.trim(),
        technicianNotes: technicianNotes.trim(),
      },
    });
  };

  return (
    <div className="lab-modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="results-modal-wrapper" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="lab-modal-header">
          <div className="lab-modal-title">
            <Microscope size={20} color="#0f766e" />
            <span>Biochemical Results Entry & Verification</span>
          </div>
          <button type="button" className="lab-btn lab-btn-secondary" onClick={onClose} style={{ padding: "0.4rem" }}>
            <X size={16} />
          </button>
        </div>

        {/* Order Details Strip */}
        <div className="results-order-banner">
          <div className="results-banner-info">
            <span className="results-banner-order-no">{order.orderNumber}</span>
            <span className="results-banner-patient">
              {order.patientName} ({order.patientMrn}) • {order.patientAge}y {order.patientGender}
            </span>
          </div>
          <div>
            <strong style={{ color: "#0f766e" }}>{order.testName}</strong>
            <span style={{ fontSize: "0.75rem", color: "#64748b", marginLeft: "8px" }}>
              [{order.testCategory}]
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
          <div className="results-modal-scroll-body">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "0.8125rem", fontWeight: 700, color: "#334155" }}>
                Measured Test Parameters & Biological Ranges:
              </span>
              <button type="button" className="add-param-btn" onClick={addRow} style={{ margin: 0 }}>
                <Plus size={14} /> Add Parameter
              </button>
            </div>

            <table className="params-table">
              <thead>
                <tr>
                  <th style={{ width: "32%" }}>Analyte / Parameter</th>
                  <th style={{ width: "18%" }}>Measured Value</th>
                  <th style={{ width: "14%" }}>Unit</th>
                  <th style={{ width: "18%" }}>Reference Range</th>
                  <th style={{ width: "14%" }}>Flag Status</th>
                  <th style={{ width: "4%" }}></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.tempId}>
                    <td>
                      <input
                        type="text"
                        className="param-input"
                        placeholder="e.g. Hemoglobin"
                        value={r.parameterName}
                        onChange={(e) => updateRow(r.tempId, "parameterName", e.target.value)}
                        required
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        className="param-input"
                        placeholder="e.g. 14.2"
                        value={r.measuredValue}
                        onChange={(e) => updateRow(r.tempId, "measuredValue", e.target.value)}
                        required
                        style={{ fontWeight: 600 }}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        className="param-input"
                        placeholder="g/dL"
                        value={r.unit}
                        onChange={(e) => updateRow(r.tempId, "unit", e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        className="param-input"
                        placeholder="13.5 - 17.5"
                        value={r.referenceRange}
                        onChange={(e) => updateRow(r.tempId, "referenceRange", e.target.value)}
                      />
                    </td>
                    <td>
                      <select
                        className={`flag-select ${r.status}`}
                        value={r.status}
                        onChange={(e) =>
                          updateRow(r.tempId, "status", e.target.value as LabResultStatus)
                        }
                      >
                        <option value="Normal">🟢 Normal</option>
                        <option value="Low">🔵 Low</option>
                        <option value="High">🟡 High</option>
                        <option value="Critical">🔴 Critical</option>
                      </select>
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <button
                        type="button"
                        className="param-del-btn"
                        onClick={() => removeRow(r.tempId)}
                        title="Delete parameter"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Notes & Verification */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div className="lab-form-group">
                <label className="lab-form-label">Technologist Remarks / Microscopic Smear Notes:</label>
                <textarea
                  className="lab-form-textarea"
                  rows={2}
                  placeholder="e.g. Peripheral smear reveals normocytic normochromic RBCs..."
                  value={technicianNotes}
                  onChange={(e) => setTechnicianNotes(e.target.value)}
                />
              </div>

              <div className="lab-form-group">
                <label className="lab-form-label">Verified By (Medical Technologist / Pathologist):</label>
                <input
                  type="text"
                  className="lab-form-input"
                  value={verifiedBy}
                  onChange={(e) => setVerifiedBy(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          <div className="lab-modal-footer">
            <button type="button" className="lab-btn lab-btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="lab-btn lab-btn-primary"
              disabled={enterResultsMutation.isPending}
              id="submit-lab-results-btn"
            >
              <CheckCircle2 size={15} />
              <span>
                {enterResultsMutation.isPending
                  ? "Authorizing Report..."
                  : "Authorize & Complete Order"}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
