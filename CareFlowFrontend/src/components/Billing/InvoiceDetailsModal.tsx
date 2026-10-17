import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { billingService } from "../../services/billingService";
import { Printer, CreditCard, X, CheckCircle2, Building2 } from "../common/Icons";
import { useToast } from "../common";
import type { Invoice } from "../../types";
import "./InvoiceDetailsModal.css";

interface InvoiceDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice | null;
  onOpenPayment?: (inv: Invoice) => void;
}

export const InvoiceDetailsModal: React.FC<InvoiceDetailsModalProps> = ({
  isOpen,
  onClose,
  invoice,
  onOpenPayment,
}) => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [cancelReason, setCancelReason] = useState("");
  const [showCancelPrompt, setShowCancelPrompt] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const cancelMutation = useMutation({
    mutationFn: (id: string) => billingService.cancelInvoice(id, cancelReason),
    onSuccess: (updated) => {
      showToast(`Invoice ${updated.invoiceNumber} has been cancelled`, "info");
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["billingMetrics"] });
      queryClient.invalidateQueries({ queryKey: ["reportsOverview"] });
      setShowCancelPrompt(false);
      onClose();
    },
    onError: (err: any) => {
      setErrorMsg(err.message || "Failed to cancel invoice.");
    },
  });

  if (!isOpen || !invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "Paid":
        return "status-paid";
      case "Partially Paid":
        return "status-partial";
      case "Issued":
        return "status-issued";
      case "Cancelled":
        return "status-cancelled";
      default:
        return "status-draft";
    }
  };

  return (
    <div className="billing-modal-backdrop" onClick={onClose}>
      <div
        className="billing-modal-container invoice-details-modal"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Toolbar (Hidden during print) */}
        <div className="invoice-modal-toolbar no-print">
          <div className="toolbar-left">
            <span className={`invoice-badge ${getStatusBadgeClass(invoice.status)}`}>
              {invoice.status}
            </span>
            <span className="invoice-header-number">{invoice.invoiceNumber}</span>
          </div>

          <div className="toolbar-actions">
            <button className="toolbar-btn print-btn" onClick={handlePrint} title="Print official invoice">
              <Printer size={16} /> Print Slip
            </button>
            {invoice.status !== "Paid" && invoice.status !== "Cancelled" && onOpenPayment && (
              <button
                className="toolbar-btn pay-btn"
                onClick={() => {
                  onClose();
                  onOpenPayment(invoice);
                }}
              >
                <CreditCard size={16} /> Record Payment
              </button>
            )}
            <button className="billing-modal-close" onClick={onClose}>
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Printable Invoice Document */}
        <div className="printable-invoice-paper" id="careflow-printable-invoice">
          {/* Hospital Official Header */}
          <div className="invoice-doc-header">
            <div className="hospital-brand">
              <div className="hospital-logo-mark">
                <Building2 size={24} color="#2563eb" />
              </div>
              <div>
                <h1 className="hospital-title">CareFlow Hospital</h1>
                <p className="hospital-sub">Center for Advanced Healthcare & Clinical Excellence</p>
                <p className="hospital-meta">
                  100 Hospital Way, Medical District • Tel: +1 (555) 019-2834 • Tax ID: CF-TAX-2026-991
                </p>
              </div>
            </div>

            <div className="invoice-header-meta">
              <div className="doc-type-title">HOSPITAL INVOICE</div>
              <div className="meta-line">
                <span className="meta-label">Invoice No:</span>
                <span className="meta-val font-mono">{invoice.invoiceNumber}</span>
              </div>
              <div className="meta-line">
                <span className="meta-label">Date Issued:</span>
                <span className="meta-val">{invoice.issueDate}</span>
              </div>
              <div className="meta-line">
                <span className="meta-label">Due Date:</span>
                <span className="meta-val">{invoice.dueDate}</span>
              </div>
              <div className="meta-line">
                <span className="meta-label">Terms:</span>
                <span className="meta-val">{invoice.paymentTerms}</span>
              </div>
            </div>
          </div>

          <div className="invoice-doc-divider"></div>

          {/* Patient and Encounter Details */}
          <div className="patient-doc-grid">
            <div className="patient-info-box">
              <span className="box-section-title">BILL TO (PATIENT)</span>
              <div className="patient-main-name">
                {invoice.patient?.name || `Patient #${invoice.patientId}`}
              </div>
              <div className="patient-detail-row">
                <span className="detail-tag">MRN:</span>
                <span className="detail-val font-mono">{invoice.patient?.mrn || "N/A"}</span>
              </div>
              {invoice.patient?.phone && (
                <div className="patient-detail-row">
                  <span className="detail-tag">Phone:</span>
                  <span className="detail-val">{invoice.patient.phone}</span>
                </div>
              )}
              {invoice.patient?.gender && (
                <div className="patient-detail-row">
                  <span className="detail-tag">Demographics:</span>
                  <span className="detail-val">
                    {invoice.patient.gender} • {invoice.patient.age || "—"} yrs
                  </span>
                </div>
              )}
            </div>

            <div className="encounter-info-box">
              <span className="box-section-title">ENCOUNTER / ADMISSION CONTEXT</span>
              {invoice.admission ? (
                <>
                  <div className="encounter-name">
                    {invoice.admission.ward?.name} (Bed {invoice.admission.bed?.bedNumber})
                  </div>
                  <div className="patient-detail-row">
                    <span className="detail-tag">Attending:</span>
                    <span className="detail-val">
                      {invoice.admission.doctor?.name} ({invoice.admission.doctor?.specialty})
                    </span>
                  </div>
                </>
              ) : invoice.consultation ? (
                <>
                  <div className="encounter-name">Outpatient Clinical Encounter</div>
                  <div className="patient-detail-row">
                    <span className="detail-tag">Consultant:</span>
                    <span className="detail-val">
                      {invoice.consultation.doctor?.name} ({invoice.consultation.doctor?.specialty})
                    </span>
                  </div>
                </>
              ) : (
                <div className="encounter-name text-muted">Direct Outpatient Services & Pharmacy</div>
              )}
              <div className="patient-detail-row">
                <span className="detail-tag">Payment Status:</span>
                <span className={`invoice-inline-status ${getStatusBadgeClass(invoice.status)}`}>
                  {invoice.status.toUpperCase()}
                </span>
              </div>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="invoice-doc-table-wrapper">
            <table className="invoice-doc-table">
              <thead>
                <tr>
                  <th style={{ width: "5%" }}>#</th>
                  <th style={{ width: "20%" }}>Category</th>
                  <th style={{ width: "45%" }}>Description of Service / Medication</th>
                  <th style={{ width: "10%" }} className="text-center">Qty</th>
                  <th style={{ width: "10%" }} className="text-right">Unit Price</th>
                  <th style={{ width: "10%" }} className="text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items && invoice.items.length > 0 ? (
                  invoice.items.map((item, idx) => (
                    <tr key={item.id || idx}>
                      <td className="text-muted">{idx + 1}</td>
                      <td>
                        <span className="item-type-chip">{item.itemType}</span>
                      </td>
                      <td className="item-description-cell">{item.description}</td>
                      <td className="text-center">{item.quantity}</td>
                      <td className="text-right">${item.unitPrice.toFixed(2)}</td>
                      <td className="text-right font-semibold">${item.amount.toFixed(2)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center text-muted py-4">
                      No line items recorded for this invoice.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Bottom Financial Totals & Payment History */}
          <div className="invoice-doc-footer-grid">
            <div className="invoice-history-col">
              <span className="box-section-title">PAYMENT RECEIPTS RECORDED</span>
              {invoice.payments && invoice.payments.length > 0 ? (
                <div className="payments-receipt-list">
                  {invoice.payments.map((p) => (
                    <div key={p.id} className="payment-receipt-pill">
                      <div className="receipt-pill-left">
                        <CheckCircle2 size={16} color="#10b981" />
                        <div>
                          <span className="receipt-num font-mono">{p.receiptNumber}</span>
                          <span className="receipt-meta">
                            {p.paymentMethod} {p.referenceNumber ? `• Ref: ${p.referenceNumber}` : ""}
                          </span>
                        </div>
                      </div>
                      <div className="receipt-pill-right">
                        <span className="receipt-amount">+${p.amount.toFixed(2)}</span>
                        <span className="receipt-date">
                          {new Date(p.paidAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-payments-text">No payment receipts logged against this invoice yet.</p>
              )}

              {invoice.notes && (
                <div className="invoice-doc-notes">
                  <span className="notes-tag">Notes / Clinical Instructions:</span>
                  <p className="notes-body">{invoice.notes}</p>
                </div>
              )}
            </div>

            <div className="invoice-doc-totals-box">
              <div className="doc-total-row">
                <span>Subtotal:</span>
                <span>${invoice.subtotal.toFixed(2)}</span>
              </div>
              {invoice.discount > 0 && (
                <div className="doc-total-row text-success">
                  <span>Discount:</span>
                  <span>-${invoice.discount.toFixed(2)}</span>
                </div>
              )}
              {invoice.taxAmount > 0 && (
                <div className="doc-total-row">
                  <span>Tax ({invoice.taxRate}%):</span>
                  <span>+${invoice.taxAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="doc-total-divider"></div>
              <div className="doc-total-row grand-total">
                <span>Total Amount:</span>
                <span>${invoice.totalAmount.toFixed(2)}</span>
              </div>
              <div className="doc-total-row paid-total">
                <span>Total Paid:</span>
                <span>${invoice.paidAmount.toFixed(2)}</span>
              </div>
              <div className="doc-total-divider"></div>
              <div className="doc-total-row balance-total">
                <span>Balance Due:</span>
                <span>${invoice.balanceDue.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Legal / Signoff Notice */}
          <div className="invoice-doc-legal">
            <div className="legal-left">
              <p>Thank you for choosing CareFlow Hospital. All payments are subject to hospital audit.</p>
              <p className="legal-dim">This is a verified computer-generated document. No signature required.</p>
            </div>
            <div className="legal-stamp">
              <div className="seal-circle">
                <span>CAREFLOW</span>
                <span>AUTHORIZED</span>
                <span>ACCOUNTS</span>
              </div>
            </div>
          </div>
        </div>

        {/* Cancellation Confirmation Prompt (if clicked) */}
        {showCancelPrompt && (
          <div className="cancel-prompt-container no-print">
            <div className="cancel-prompt-inner">
              <h4 className="cancel-prompt-title">Cancel Invoice {invoice.invoiceNumber}?</h4>
              <p className="cancel-prompt-sub">
                This will void the invoice. Only unpaid invoices with zero recorded payments can be cancelled.
              </p>
              <input
                type="text"
                placeholder="Reason for cancellation (e.g. Billed in error, insurance changed)..."
                className="billing-form-input"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
              />
              {errorMsg && <p className="cancel-error">{errorMsg}</p>}
              <div className="cancel-prompt-actions">
                <button
                  className="billing-btn-secondary"
                  onClick={() => setShowCancelPrompt(false)}
                >
                  Back
                </button>
                <button
                  className="cancel-confirm-btn"
                  onClick={() => cancelMutation.mutate(invoice.id)}
                  disabled={cancelMutation.isPending}
                >
                  {cancelMutation.isPending ? "Cancelling..." : "Confirm Cancellation"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Actions Footer (Hidden in print) */}
        <div className="billing-modal-actions no-print">
          {invoice.status !== "Cancelled" && invoice.paidAmount === 0 && !showCancelPrompt && (
            <button
              type="button"
              className="invoice-void-btn"
              onClick={() => setShowCancelPrompt(true)}
            >
              Void / Cancel Invoice
            </button>
          )}
          <button type="button" className="billing-btn-secondary" onClick={onClose}>
            Close
          </button>
          <button type="button" className="billing-btn-primary" onClick={handlePrint}>
            <Printer size={16} /> Print Official Invoice Slip
          </button>
        </div>
      </div>
    </div>
  );
};

export default InvoiceDetailsModal;
