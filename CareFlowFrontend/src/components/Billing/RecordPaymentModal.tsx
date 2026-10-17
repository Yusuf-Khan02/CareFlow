import React, { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { billingService } from "../../services/billingService";
import { CreditCard, X, AlertCircle, DollarSign, CheckCircle2 } from "../common/Icons";
import { useToast } from "../common";
import type { Invoice, PaymentMethod, RecordPaymentPayload } from "../../types";
import "./RecordPaymentModal.css";

interface RecordPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice | null;
  onSuccess?: () => void;
}

export const RecordPaymentModal: React.FC<RecordPaymentModalProps> = ({
  isOpen,
  onClose,
  invoice,
  onSuccess,
}) => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const [amount, setAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("Credit Card");
  const [referenceNumber, setReferenceNumber] = useState<string>("");
  const [receivedBy, setReceivedBy] = useState<string>("Hospital Cashier");
  const [notes, setNotes] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string>("");

  useEffect(() => {
    if (invoice) {
      setAmount(invoice.balanceDue > 0 ? invoice.balanceDue : 0);
      setReferenceNumber("");
      setNotes("");
      setErrorMsg("");
    }
  }, [invoice, isOpen]);

  const paymentMutation = useMutation({
    mutationFn: (payload: RecordPaymentPayload) => billingService.recordPayment(payload),
    onSuccess: (data) => {
      showToast(
        `Payment receipt ${data.payment.receiptNumber} generated for $${data.payment.amount}!`,
        "success"
      );
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["billingMetrics"] });
      queryClient.invalidateQueries({ queryKey: ["reportsOverview"] });
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      if (onSuccess) onSuccess();
      onClose();
    },
    onError: (err: any) => {
      setErrorMsg(err.message || "Failed to record payment transaction.");
    },
  });

  if (!isOpen || !invoice) return null;

  const remainingAfterPayment = Math.max(0, invoice.balanceDue - (amount || 0));
  const willBeFullyPaid = remainingAfterPayment <= 0.01;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    const payNum = Number(amount);
    if (!payNum || payNum <= 0) {
      setErrorMsg("Payment amount must be greater than $0.00");
      return;
    }

    if (payNum > invoice.balanceDue + 0.05) {
      setErrorMsg(
        `Payment amount ($${payNum}) cannot exceed outstanding balance due ($${invoice.balanceDue.toFixed(2)})`
      );
      return;
    }

    paymentMutation.mutate({
      invoiceId: invoice.id,
      amount: payNum,
      paymentMethod,
      referenceNumber: referenceNumber.trim() || undefined,
      receivedBy: receivedBy.trim() || "Hospital Cashier",
      notes: notes.trim() || undefined,
    });
  };

  const setPercentage = (pct: number) => {
    const val = Math.round(invoice.balanceDue * pct * 100) / 100;
    setAmount(val);
  };

  return (
    <div className="billing-modal-backdrop" onClick={onClose}>
      <div
        className="billing-modal-container payment-record-modal"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="billing-modal-header">
          <div className="billing-modal-header-left">
            <div className="billing-modal-icon-badge payment-badge">
              <CreditCard size={20} color="#10b981" />
            </div>
            <div>
              <h2 className="billing-modal-title">Record Payment Receipt</h2>
              <p className="billing-modal-subtitle">
                Collect patient deposit, co-pay, or full balance reconciliation
              </p>
            </div>
          </div>
          <button className="billing-modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="billing-modal-form">
          {errorMsg && (
            <div className="billing-modal-alert billing-modal-alert-error">
              <AlertCircle size={18} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Invoice Summary Banner */}
          <div className="invoice-context-card">
            <div className="context-col">
              <span className="context-label">Invoice Ref</span>
              <span className="context-value highlight">{invoice.invoiceNumber}</span>
            </div>
            <div className="context-col">
              <span className="context-label">Patient</span>
              <span className="context-value">
                {invoice.patient?.name || `Patient #${invoice.patientId}`}
              </span>
              <span className="context-sub">{invoice.patient?.mrn}</span>
            </div>
            <div className="context-col">
              <span className="context-label">Total Invoiced</span>
              <span className="context-value">${invoice.totalAmount.toFixed(2)}</span>
            </div>
            <div className="context-col balance-col">
              <span className="context-label">Outstanding Balance</span>
              <span className="context-value balance">${invoice.balanceDue.toFixed(2)}</span>
            </div>
          </div>

          {/* Amount Input & Quick Buttons */}
          <div className="billing-form-group">
            <div className="amount-label-row">
              <label className="billing-form-label">
                Payment Amount ($) <span className="billing-required">*</span>
              </label>
              <div className="quick-pct-group">
                <button
                  type="button"
                  className="quick-pct-btn"
                  onClick={() => setPercentage(0.5)}
                >
                  50%
                </button>
                <button
                  type="button"
                  className="quick-pct-btn highlight-btn"
                  onClick={() => setPercentage(1.0)}
                >
                  Full Balance (${invoice.balanceDue.toFixed(2)})
                </button>
              </div>
            </div>
            <div className="amount-input-wrapper">
              <span className="currency-prefix">$</span>
              <input
                type="number"
                min="0.01"
                step="0.01"
                max={invoice.balanceDue + 0.05}
                className="billing-form-input amount-input"
                value={amount}
                onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                required
              />
            </div>
          </div>

          {/* Payment Method & Reference */}
          <div className="payment-grid-2">
            <div className="billing-form-group">
              <label className="billing-form-label">Payment Method</label>
              <select
                className="billing-form-select"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
              >
                <option value="Credit Card">Credit Card</option>
                <option value="Debit Card">Debit Card</option>
                <option value="UPI / Net Banking">UPI / Net Banking / QR</option>
                <option value="Cash">Cash Counter</option>
                <option value="Insurance / TPA">Insurance / TPA Claim</option>
                <option value="Cheque">Bank Cheque / DD</option>
              </select>
            </div>

            <div className="billing-form-group">
              <label className="billing-form-label">Transaction / Reference #</label>
              <input
                type="text"
                className="billing-form-input"
                placeholder="e.g. AUTH-98214 / UPI-ICICI-0091"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
              />
            </div>
          </div>

          {/* Cashier & Memo */}
          <div className="payment-grid-2">
            <div className="billing-form-group">
              <label className="billing-form-label">Received By (Staff / Cashier)</label>
              <input
                type="text"
                className="billing-form-input"
                value={receivedBy}
                onChange={(e) => setReceivedBy(e.target.value)}
                required
              />
            </div>

            <div className="billing-form-group">
              <label className="billing-form-label">Receipt Memo / Notes</label>
              <input
                type="text"
                className="billing-form-input"
                placeholder="e.g. Settled at cashier desk wing A"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>

          {/* Resulting Balance Projection */}
          <div
            className={`payment-preview-card ${
              willBeFullyPaid ? "preview-paid" : "preview-partial"
            }`}
          >
            <div className="preview-icon">
              {willBeFullyPaid ? (
                <CheckCircle2 size={20} color="#10b981" />
              ) : (
                <DollarSign size={20} color="#f59e0b" />
              )}
            </div>
            <div className="preview-text">
              <span className="preview-title">
                {willBeFullyPaid
                  ? "Invoice will be marked as FULLY PAID"
                  : `Invoice will be marked as PARTIALLY PAID`}
              </span>
              <span className="preview-sub">
                Remaining outstanding balance after this transaction: $
                {remainingAfterPayment.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="billing-modal-actions">
            <button
              type="button"
              className="billing-btn-secondary"
              onClick={onClose}
              disabled={paymentMutation.isPending}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="billing-btn-primary payment-confirm-btn"
              disabled={paymentMutation.isPending || amount <= 0}
            >
              {paymentMutation.isPending
                ? "Processing Receipt..."
                : `Confirm Payment ($${(amount || 0).toFixed(2)})`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RecordPaymentModal;
