import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { billingService } from "../services/billingService";
import { CreateInvoiceModal } from "../components/Billing/CreateInvoiceModal";
import { RecordPaymentModal } from "../components/Billing/RecordPaymentModal";
import { InvoiceDetailsModal } from "../components/Billing/InvoiceDetailsModal";
import {
  CreditCard,
  DollarSign,
  Receipt,
  Download,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  FileText,
  Printer,
} from "../components/common/Icons";
import { EmptyState, PageLoader, useToast } from "../components/common";
import type { Invoice } from "../types";
import "./Billing.css";

type BillingTab = "Invoices" | "Receivables" | "Receipts";

export const Billing: React.FC = () => {
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<BillingTab>("Invoices");
  const [search, setSearch] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("All");

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  // 1. Fetch Metrics
  const { data: metrics } = useQuery({
    queryKey: ["billingMetrics"],
    queryFn: () => billingService.getBillingMetrics(),
    refetchInterval: 15000,
  });

  // 2. Fetch Invoices
  const {
    data: invoices = [],
    isLoading: isInvoicesLoading,
    refetch: refetchInvoices,
  } = useQuery({
    queryKey: ["invoices", search, statusFilter],
    queryFn: () =>
      billingService.getInvoices({
        search: search.trim() || undefined,
        status: statusFilter !== "All" ? statusFilter : undefined,
      }),
    refetchInterval: 15000,
  });

  // 3. Fetch Payments
  const { data: payments = [], isLoading: isPaymentsLoading } = useQuery({
    queryKey: ["payments"],
    queryFn: () => billingService.getPayments(50),
    enabled: activeTab === "Receipts",
  });

  // Filtered receivables
  const receivablesInvoices = invoices.filter(
    (inv) => inv.balanceDue > 0 && inv.status !== "Cancelled"
  );

  const handleOpenPayment = (inv: Invoice) => {
    setSelectedInvoice(inv);
    setIsPaymentOpen(true);
  };

  const handleOpenDetails = (inv: Invoice) => {
    setSelectedInvoice(inv);
    setIsDetailsOpen(true);
  };

  const handleExportCSV = async () => {
    try {
      showToast("Preparing invoices CSV report export...", "info");
      await billingService.downloadInvoicesCSV();
      showToast("Invoices CSV downloaded successfully!", "success");
    } catch {
      showToast("Failed to download CSV export.", "error");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Paid":
        return <span className="bill-badge badge-paid">Paid</span>;
      case "Partially Paid":
        return <span className="bill-badge badge-partial">Partially Paid</span>;
      case "Issued":
        return <span className="bill-badge badge-issued">Issued</span>;
      case "Cancelled":
        return <span className="bill-badge badge-cancelled">Cancelled</span>;
      default:
        return <span className="bill-badge badge-draft">{status}</span>;
    }
  };

  return (
    <div className="billing-page-container">
      {/* Page Header */}
      <div className="billing-page-header">
        <div className="header-text-block">
          <div className="header-tag">
            <CreditCard size={14} color="#60a5fa" />
            <span>FINANCIAL & PATIENT ACCOUNTS</span>
          </div>
          <h1 className="billing-title">Billing & Revenue Operations</h1>
          <p className="billing-subtitle">
            Manage hospital invoices, co-pay settlements, automated line items & aging receivables
          </p>
        </div>

        <div className="header-action-group">
          <button className="billing-sec-action-btn" onClick={handleExportCSV}>
            <Download size={16} /> Export (.CSV)
          </button>
          <button
            className="billing-pri-action-btn"
            onClick={() => setIsCreateOpen(true)}
          >
            <Plus size={18} /> Generate Invoice
          </button>
        </div>
      </div>

      {/* KPI Stat Cards Grid */}
      <div className="billing-stats-grid">
        <div className="billing-stat-card">
          <div className="stat-card-icon icon-blue">
            <DollarSign size={24} />
          </div>
          <div className="stat-card-content">
            <span className="stat-label">Total Invoiced</span>
            <div className="stat-value-row">
              <span className="stat-number">
                ${metrics ? metrics.totalInvoiced.toLocaleString("en-US", { minimumFractionDigits: 2 }) : "0.00"}
              </span>
            </div>
            <span className="stat-hint text-blue">
              Across {metrics?.totalInvoices || 0} active hospital bills
            </span>
          </div>
        </div>

        <div className="billing-stat-card">
          <div className="stat-card-icon icon-green">
            <CheckCircle2 size={24} />
          </div>
          <div className="stat-card-content">
            <span className="stat-label">Gross Collected</span>
            <div className="stat-value-row">
              <span className="stat-number text-green">
                ${metrics ? metrics.totalCollected.toLocaleString("en-US", { minimumFractionDigits: 2 }) : "0.00"}
              </span>
            </div>
            <span className="stat-hint text-green">
              {metrics?.collectionRate || 0}% collection efficiency
            </span>
          </div>
        </div>

        <div className="billing-stat-card">
          <div className="stat-card-icon icon-amber">
            <Clock size={24} />
          </div>
          <div className="stat-card-content">
            <span className="stat-label">Outstanding Receivables</span>
            <div className="stat-value-row">
              <span className="stat-number text-amber">
                ${metrics ? metrics.totalReceivables.toLocaleString("en-US", { minimumFractionDigits: 2 }) : "0.00"}
              </span>
            </div>
            <span className="stat-hint text-amber">
              {metrics?.statusCounts["Partially Paid"] || 0} partial •{" "}
              {metrics?.statusCounts.Issued || 0} pending payment
            </span>
          </div>
        </div>

        <div className="billing-stat-card">
          <div className="stat-card-icon icon-purple">
            <Receipt size={24} />
          </div>
          <div className="stat-card-content">
            <span className="stat-label">Receipts Reconciled</span>
            <div className="stat-value-row">
              <span className="stat-number">
                {metrics?.totalPaymentsCount || 0}
              </span>
            </div>
            <span className="stat-hint text-purple">
              Digital & cashier transactions logged
            </span>
          </div>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="billing-tabs-container">
        <div className="billing-tabs-list">
          <button
            className={`billing-tab-btn ${activeTab === "Invoices" ? "active" : ""}`}
            onClick={() => setActiveTab("Invoices")}
          >
            <FileText size={16} /> All Invoices ({invoices.length})
          </button>
          <button
            className={`billing-tab-btn ${activeTab === "Receivables" ? "active" : ""}`}
            onClick={() => setActiveTab("Receivables")}
          >
            <Clock size={16} /> Outstanding Receivables ({receivablesInvoices.length})
          </button>
          <button
            className={`billing-tab-btn ${activeTab === "Receipts" ? "active" : ""}`}
            onClick={() => setActiveTab("Receipts")}
          >
            <Receipt size={16} /> Payment Receipts Ledger
          </button>
        </div>

        {/* Search & Filters */}
        {activeTab !== "Receipts" && (
          <div className="billing-filter-bar">
            <div className="search-input-box">
              <Search size={16} color="#94a3b8" />
              <input
                type="text"
                placeholder="Search by invoice #, patient name, MRN..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button className="clear-search-btn" onClick={() => setSearch("")}>
                  ×
                </button>
              )}
            </div>

            <div className="filter-select-box">
              <Filter size={15} color="#94a3b8" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="All">All Statuses</option>
                <option value="Issued">Issued (Unpaid)</option>
                <option value="Partially Paid">Partially Paid</option>
                <option value="Paid">Fully Paid</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* TAB 1: ALL INVOICES */}
      {activeTab === "Invoices" && (
        <div className="billing-content-panel">
          {isInvoicesLoading ? (
            <PageLoader message="Loading hospital invoices..." />
          ) : invoices.length === 0 ? (
            <EmptyState
              title="No Invoices Found"
              description={
                search || statusFilter !== "All"
                  ? "No invoices match your current search criteria. Try adjusting your filters."
                  : "No hospital invoices have been generated yet. Create the first patient invoice."
              }
              actionText="Generate Invoice"
              onAction={() => setIsCreateOpen(true)}
            />
          ) : (
            <div className="billing-table-card">
              <table className="billing-table">
                <thead>
                  <tr>
                    <th>Invoice #</th>
                    <th>Patient Details</th>
                    <th>Issue Date</th>
                    <th>Due Date</th>
                    <th>Line Items</th>
                    <th className="text-right">Total ($)</th>
                    <th className="text-right">Balance Due ($)</th>
                    <th className="text-center">Status</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((inv) => (
                    <tr
                      key={inv.id}
                      className="billing-table-row clickable"
                      onClick={() => handleOpenDetails(inv)}
                    >
                      <td className="font-mono font-bold text-blue">
                        {inv.invoiceNumber}
                      </td>
                      <td>
                        <div className="patient-cell-name">
                          {inv.patient?.name || `Patient #${inv.patientId}`}
                        </div>
                        <div className="patient-cell-mrn">{inv.patient?.mrn}</div>
                      </td>
                      <td className="text-muted">{inv.issueDate}</td>
                      <td className="text-muted">{inv.dueDate}</td>
                      <td>
                        <span className="items-count-badge">
                          {inv.items?.length || 0} item{(inv.items?.length || 0) !== 1 ? "s" : ""}
                        </span>
                        {inv.items?.[0] && (
                          <span className="item-snippet-text">
                            {inv.items[0].description}
                          </span>
                        )}
                      </td>
                      <td className="text-right font-bold font-mono">
                        ${inv.totalAmount.toFixed(2)}
                      </td>
                      <td className="text-right font-bold font-mono">
                        <span
                          className={
                            inv.balanceDue > 0 ? "text-amber" : "text-green"
                          }
                        >
                          ${inv.balanceDue.toFixed(2)}
                        </span>
                      </td>
                      <td className="text-center">{getStatusBadge(inv.status)}</td>
                      <td className="text-right actions-cell" onClick={(e) => e.stopPropagation()}>
                        <button
                          className="table-action-icon-btn"
                          title="View / Print Invoice Slip"
                          onClick={() => handleOpenDetails(inv)}
                        >
                          <Printer size={16} />
                        </button>
                        {inv.status !== "Paid" && inv.status !== "Cancelled" && (
                          <button
                            className="table-action-pill-btn"
                            title="Record Payment"
                            onClick={() => handleOpenPayment(inv)}
                          >
                            <CreditCard size={14} /> Pay
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: OUTSTANDING RECEIVABLES */}
      {activeTab === "Receivables" && (
        <div className="billing-content-panel">
          {isInvoicesLoading ? (
            <PageLoader message="Filtering outstanding patient balances..." />
          ) : receivablesInvoices.length === 0 ? (
            <EmptyState
              title="Zero Aging Receivables"
              description="Excellent! All active patient invoices have been fully reconciled and settled."
            />
          ) : (
            <div className="billing-table-card">
              <table className="billing-table">
                <thead>
                  <tr>
                    <th>Invoice #</th>
                    <th>Patient Details</th>
                    <th>Due Date</th>
                    <th className="text-right">Total Billed</th>
                    <th className="text-right">Paid Amount</th>
                    <th className="text-right">Outstanding Due</th>
                    <th className="text-center">Status</th>
                    <th className="text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {receivablesInvoices.map((inv) => (
                    <tr
                      key={inv.id}
                      className="billing-table-row clickable"
                      onClick={() => handleOpenDetails(inv)}
                    >
                      <td className="font-mono font-bold text-blue">
                        {inv.invoiceNumber}
                      </td>
                      <td>
                        <div className="patient-cell-name">
                          {inv.patient?.name || `Patient #${inv.patientId}`}
                        </div>
                        <div className="patient-cell-mrn">
                          {inv.patient?.mrn} • {inv.patient?.phone || "No phone"}
                        </div>
                      </td>
                      <td className="text-amber font-semibold">{inv.dueDate}</td>
                      <td className="text-right font-mono">${inv.totalAmount.toFixed(2)}</td>
                      <td className="text-right font-mono text-green">
                        ${inv.paidAmount.toFixed(2)}
                      </td>
                      <td className="text-right font-mono font-bold text-amber">
                        ${inv.balanceDue.toFixed(2)}
                      </td>
                      <td className="text-center">{getStatusBadge(inv.status)}</td>
                      <td className="text-right actions-cell" onClick={(e) => e.stopPropagation()}>
                        <button
                          className="table-action-pill-btn"
                          onClick={() => handleOpenPayment(inv)}
                        >
                          <CreditCard size={14} /> Collect Payment
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: PAYMENT RECEIPTS LEDGER */}
      {activeTab === "Receipts" && (
        <div className="billing-content-panel">
          {isPaymentsLoading ? (
            <PageLoader message="Loading payment receipts ledger..." />
          ) : payments.length === 0 ? (
            <EmptyState
              title="No Payment Receipts Logged"
              description="No receipts have been generated yet. Record a payment against an invoice."
            />
          ) : (
            <div className="billing-table-card">
              <table className="billing-table">
                <thead>
                  <tr>
                    <th>Receipt #</th>
                    <th>Invoice Reference</th>
                    <th>Patient</th>
                    <th>Payment Method</th>
                    <th>Reference / Auth #</th>
                    <th>Cashier / Collector</th>
                    <th>Date & Time</th>
                    <th className="text-right">Amount Paid</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p) => (
                    <tr key={p.id} className="billing-table-row">
                      <td className="font-mono font-bold text-green">
                        {p.receiptNumber}
                      </td>
                      <td className="font-mono text-blue">
                        {p.invoice?.invoiceNumber || p.invoiceId}
                      </td>
                      <td>
                        <div className="patient-cell-name">
                          {p.invoice?.patient?.name || "Patient"}
                        </div>
                        <div className="patient-cell-mrn">{p.invoice?.patient?.mrn}</div>
                      </td>
                      <td>
                        <span className="pay-method-chip">{p.paymentMethod}</span>
                      </td>
                      <td className="text-muted font-mono">
                        {p.referenceNumber || "—"}
                      </td>
                      <td className="text-muted">{p.receivedBy}</td>
                      <td className="text-muted">
                        {new Date(p.paidAt).toLocaleString()}
                      </td>
                      <td className="text-right font-mono font-bold text-green">
                        +${p.amount.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <CreateInvoiceModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={() => refetchInvoices()}
      />

      <RecordPaymentModal
        isOpen={isPaymentOpen}
        onClose={() => {
          setIsPaymentOpen(false);
          setSelectedInvoice(null);
        }}
        invoice={selectedInvoice}
        onSuccess={() => refetchInvoices()}
      />

      <InvoiceDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => {
          setIsDetailsOpen(false);
          setSelectedInvoice(null);
        }}
        invoice={selectedInvoice}
        onOpenPayment={handleOpenPayment}
      />
    </div>
  );
};

export default Billing;
