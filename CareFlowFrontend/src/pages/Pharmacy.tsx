import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { pharmacyService, FORMULARY_CATEGORIES } from "../services/pharmacyService";
import { ReceiveStockModal } from "../components/Pharmacy/ReceiveStockModal";
import { DispenseMedicationModal } from "../components/Pharmacy/DispenseMedicationModal";
import { AddMedicineModal } from "../components/Pharmacy/AddMedicineModal";
import {
  Pill,
  Package,
  Boxes,
  ArrowUpRight,
  ArrowDownRight,
  Search,
  Plus,
  AlertTriangle,
  AlertCircle,
  Clock,
  CheckCircle2,
  RotateCcw,
} from "../components/common/Icons";
import { EmptyState, PageLoader } from "../components/common";
import type {
  Medicine,
  PendingPrescriptionItem,
} from "../types";
import "./Pharmacy.css";

type PharmacyTab = "Formulary" | "Prescriptions" | "Ledger" | "Alerts";

export const Pharmacy: React.FC = () => {

  // Navigation & Filter State
  const [activeTab, setActiveTab] = useState<PharmacyTab>("Formulary");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [stockStatusFilter, setStockStatusFilter] = useState<
    "all" | "low" | "out_of_stock" | "normal"
  >("all");
  const [search, setSearch] = useState<string>("");
  const [expandedMedId, setExpandedMedId] = useState<string | null>(null);

  // Modals State
  const [isReceiveModalOpen, setIsReceiveModalOpen] = useState(false);
  const [isDispenseModalOpen, setIsDispenseModalOpen] = useState(false);
  const [isAddMedModalOpen, setIsAddMedModalOpen] = useState(false);

  // Target item for modals
  const [targetMedicineId, setTargetMedicineId] = useState<string | undefined>();
  const [targetRx, setTargetRx] = useState<PendingPrescriptionItem | null>(null);

  // TanStack Query for Medicines / Formulary
  const {
    data: pharmacyData,
    isLoading: isMedicinesLoading,
    refetch: refetchMedicines,
  } = useQuery({
    queryKey: [
      "medicines",
      {
        category: selectedCategory !== "all" ? selectedCategory : undefined,
        stockStatus: stockStatusFilter !== "all" ? stockStatusFilter : undefined,
        search: search.trim() || undefined,
      },
    ],
    queryFn: () =>
      pharmacyService.getMedicines({
        category: selectedCategory !== "all" ? selectedCategory : undefined,
        stockStatus: stockStatusFilter !== "all" ? stockStatusFilter : undefined,
        search: search.trim() || undefined,
      }),
    refetchInterval: 10000,
  });

  // Query for Pending e-Prescriptions
  const { data: pendingRx = [], isLoading: isRxLoading } = useQuery({
    queryKey: ["pendingPrescriptions"],
    queryFn: () => pharmacyService.getPendingPrescriptions(),
    refetchInterval: 8000,
  });

  // Query for Movement Ledger
  const { data: movements = [], isLoading: isMovementsLoading } = useQuery({
    queryKey: ["pharmacyMovements"],
    queryFn: () => pharmacyService.getMovements(50),
    refetchInterval: 12000,
  });

  // Query for Low Stock Alerts
  const { data: lowStockAlerts = [], isLoading: isAlertsLoading } = useQuery({
    queryKey: ["lowStockAlerts"],
    queryFn: () => pharmacyService.getLowStockAlerts(),
  });

  const medicines: Medicine[] = pharmacyData?.medicines || [];
  const metrics = pharmacyData?.metrics || {
    totalFormulary: 0,
    inStockCount: 0,
    lowStockCount: 0,
    outOfStockCount: 0,
    totalUnitsInStock: 0,
    stockValueGross: 0,
  };

  // Handlers
  const handleOpenReceive = (medId?: string) => {
    setTargetMedicineId(medId);
    setIsReceiveModalOpen(true);
  };

  const handleOpenDispense = (medId?: string, rxItem?: PendingPrescriptionItem) => {
    setTargetMedicineId(medId);
    setTargetRx(rxItem || null);
    setIsDispenseModalOpen(true);
  };

  const toggleExpand = (medId: string) => {
    setExpandedMedId((prev) => (prev === medId ? null : medId));
  };

  return (
    <div className="pharmacy-container" id="page-pharmacy">
      {/* 1. Executive Header Banner */}
      <div className="pharmacy-header">
        <div className="pharmacy-title-group">
          <h1>
            <Pill size={28} color="#0d9488" />
            Pharmacy & Medication Inventory
          </h1>
          <p>
            Central formulary management, FEFO batch-deduction dispensing, e-prescription fulfillment, and automated replenishment.
          </p>
        </div>

        <div className="pharmacy-actions">
          <button
            type="button"
            className="btn-action btn-receive"
            onClick={() => handleOpenReceive()}
          >
            <ArrowUpRight size={17} />
            Receive Stock
          </button>
          <button
            type="button"
            className="btn-action btn-dispense"
            onClick={() => handleOpenDispense()}
          >
            <ArrowDownRight size={17} />
            Dispense (FEFO)
          </button>
          <button
            type="button"
            className="btn-action btn-add-med"
            onClick={() => setIsAddMedModalOpen(true)}
          >
            <Plus size={17} />
            Add Medicine
          </button>
        </div>
      </div>

      {/* 2. Department Metrics Cards */}
      <div className="pharmacy-metrics-grid">
        {/* Total Formulary */}
        <div className="metric-card">
          <div className="metric-icon-box icon-teal">
            <Boxes size={22} color="#0d9488" />
          </div>
          <div className="metric-content">
            <span className="metric-label">Hospital Formulary</span>
            <span className="metric-value">{metrics.totalFormulary}</span>
            <span className="metric-sub">{metrics.inStockCount} items in stock</span>
          </div>
        </div>

        {/* Total Inventory Units */}
        <div className="metric-card">
          <div className="metric-icon-box icon-blue">
            <Package size={22} color="#0284c7" />
          </div>
          <div className="metric-content">
            <span className="metric-label">Total Units on Hand</span>
            <span className="metric-value">
              {metrics.totalUnitsInStock.toLocaleString()}
            </span>
            <span className="metric-sub">Across all storage lots</span>
          </div>
        </div>

        {/* Low Stock Warnings */}
        <div
          className={`metric-card ${metrics.lowStockCount > 0 ? "border-amber" : ""}`}
          onClick={() => {
            setActiveTab("Alerts");
          }}
          style={{ cursor: "pointer" }}
        >
          <div className="metric-icon-box icon-amber">
            <AlertTriangle size={22} color="#d97706" />
          </div>
          <div className="metric-content">
            <span className="metric-label">Low Stock Warnings</span>
            <span className="metric-value text-amber">
              {metrics.lowStockCount}
            </span>
            <span className="metric-sub">Below min reorder threshold</span>
          </div>
        </div>

        {/* Depleted / Out of Stock */}
        <div
          className={`metric-card ${metrics.outOfStockCount > 0 ? "border-rose" : ""}`}
        >
          <div className="metric-icon-box icon-rose">
            <AlertCircle size={22} color="#e11d48" />
          </div>
          <div className="metric-content">
            <span className="metric-label">Depleted / Stockout</span>
            <span className="metric-value text-rose">
              {metrics.outOfStockCount}
            </span>
            <span className="metric-sub">Requires supplier PO</span>
          </div>
        </div>

        {/* Inventory Gross Value */}
        <div className="metric-card">
          <div className="metric-icon-box icon-emerald">
            <CheckCircle2 size={22} color="#059669" />
          </div>
          <div className="metric-content">
            <span className="metric-label">Gross Formulary Value</span>
            <span className="metric-value text-emerald">
              ${metrics.stockValueGross.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
            <span className="metric-sub">At current retail unit price</span>
          </div>
        </div>
      </div>

      {/* 3. Tabbed Navigation */}
      <div className="pharmacy-tabs-bar">
        <div className="tabs-list">
          <button
            type="button"
            className={`tab-btn ${activeTab === "Formulary" ? "active" : ""}`}
            onClick={() => setActiveTab("Formulary")}
          >
            <Boxes size={16} />
            Formulary Catalogue
            <span className="tab-pill">{metrics.totalFormulary}</span>
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === "Prescriptions" ? "active" : ""}`}
            onClick={() => setActiveTab("Prescriptions")}
          >
            <Pill size={16} />
            e-Prescription Queue
            <span className="tab-pill pill-cyan">{pendingRx.length}</span>
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === "Ledger" ? "active" : ""}`}
            onClick={() => setActiveTab("Ledger")}
          >
            <Clock size={16} />
            Stock Movements Ledger
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === "Alerts" ? "active" : ""}`}
            onClick={() => setActiveTab("Alerts")}
          >
            <AlertTriangle size={16} />
            Reorder & Expiry Alerts
            {lowStockAlerts.length > 0 && (
              <span className="tab-pill pill-amber">{lowStockAlerts.length}</span>
            )}
          </button>
        </div>

        {activeTab === "Formulary" && (
          <div className="pharmacy-filter-controls">
            {/* Search */}
            <div className="search-box">
              <Search size={15} color="#94a3b8" />
              <input
                type="text"
                placeholder="Search medication, generic, SKU..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button
                  type="button"
                  className="clear-search"
                  onClick={() => setSearch("")}
                >
                  ×
                </button>
              )}
            </div>

            {/* Category Dropdown */}
            <select
              className="filter-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {FORMULARY_CATEGORIES.map((cat) => (
                <option
                  key={cat}
                  value={cat === "All Categories" ? "all" : cat}
                >
                  {cat}
                </option>
              ))}
            </select>

            {/* Stock Status Dropdown */}
            <select
              className="filter-select"
              value={stockStatusFilter}
              onChange={(e) =>
                setStockStatusFilter(
                  e.target.value as "all" | "low" | "out_of_stock" | "normal"
                )
              }
            >
              <option value="all">All Stock Levels</option>
              <option value="normal">In Stock (Healthy)</option>
              <option value="low">Low Stock Warning</option>
              <option value="out_of_stock">Depleted / Out of Stock</option>
            </select>

            <button
              type="button"
              className="refresh-btn"
              onClick={() => refetchMedicines()}
              title="Refresh inventory"
            >
              <RotateCcw size={15} />
            </button>
          </div>
        )}
      </div>

      {/* 4. Tab Content Area */}
      <div className="tab-content-area">
        {/* ================= TAB 1: FORMULARY ================= */}
        {activeTab === "Formulary" && (
          <div className="formulary-view">
            {isMedicinesLoading ? (
              <PageLoader message="Loading medication catalogue..." />
            ) : medicines.length === 0 ? (
              <EmptyState
                icon={<Pill size={40} color="#64748b" />}
                title="No Medications Match Filter"
                description="Try clearing search filters or add a new drug entity into the formulary."
                actionText="Add Medicine"
                onAction={() => setIsAddMedModalOpen(true)}
              />
            ) : (
              <div className="medicines-table-wrapper">
                <table className="pharmacy-table">
                  <thead>
                    <tr>
                      <th style={{ width: "32px" }}></th>
                      <th>Medication & SKU</th>
                      <th>Category</th>
                      <th>Form & Strength</th>
                      <th>Unit Retail / Cost</th>
                      <th>Stock Level</th>
                      <th>Batches & Expiry</th>
                      <th>Status</th>
                      <th style={{ textAlign: "right" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {medicines.map((med) => {
                      const isExpanded = expandedMedId === med.id;
                      const hasBatches = (med.batches || []).length > 0;

                      return (
                        <React.Fragment key={med.id}>
                          <tr className={`med-row ${isExpanded ? "expanded" : ""}`}>
                            <td className="cell-expand">
                              {hasBatches && (
                                <button
                                  type="button"
                                  className="btn-expander"
                                  onClick={() => toggleExpand(med.id)}
                                  title="Toggle batch lot details"
                                >
                                  {isExpanded ? "▼" : "▶"}
                                </button>
                              )}
                            </td>
                            <td>
                              <div className="med-primary-info">
                                <span className="med-name">{med.name}</span>
                                <span className="med-brand">
                                  {med.brandName} •{" "}
                                  <span className="sku-tag">{med.sku}</span>
                                </span>
                              </div>
                            </td>
                            <td>
                              <span className="category-badge">{med.category}</span>
                            </td>
                            <td>
                              <div className="form-strength">
                                <span className="form-tag">{med.dosageForm}</span>
                                <span className="strength-tag">{med.strength}</span>
                              </div>
                            </td>
                            <td>
                              <div className="price-info">
                                <span className="retail-price">
                                  ${med.unitPrice.toFixed(2)}
                                </span>
                                <span className="cost-price">
                                  Cost: ${med.costPrice.toFixed(2)}
                                </span>
                              </div>
                            </td>
                            <td>
                              <div className="stock-level-cell">
                                <div className="stock-count-row">
                                  <span
                                    className={`stock-num ${
                                      med.isOutOfStock
                                        ? "text-rose"
                                        : med.isLowStock
                                        ? "text-amber"
                                        : "text-emerald"
                                    }`}
                                  >
                                    {med.currentStock}
                                  </span>
                                  <span className="stock-min">
                                    Min: {med.minStockLevel}
                                  </span>
                                </div>
                                <div className="stock-bar-track">
                                  <div
                                    className={`stock-bar-fill ${
                                      med.isOutOfStock
                                        ? "fill-rose"
                                        : med.isLowStock
                                        ? "fill-amber"
                                        : "fill-emerald"
                                    }`}
                                    style={{
                                      width: `${Math.min(
                                        100,
                                        Math.max(
                                          5,
                                          (med.currentStock /
                                            (med.minStockLevel * 2 || 100)) *
                                            100
                                        )
                                      )}%`,
                                    }}
                                  ></div>
                                </div>
                              </div>
                            </td>
                            <td>
                              <div className="expiry-cell">
                                <span className="batches-count">
                                  {med.activeBatchesCount} Active{" "}
                                  {med.activeBatchesCount === 1 ? "Lot" : "Lots"}
                                </span>
                                {med.earliestExpiry ? (
                                  <span className="earliest-date">
                                    Next: {med.earliestExpiry}
                                  </span>
                                ) : (
                                  <span className="no-expiry">—</span>
                                )}
                              </div>
                            </td>
                            <td>
                              {med.isOutOfStock ? (
                                <span className="badge-status badge-depleted">
                                  Depleted
                                </span>
                              ) : med.isLowStock ? (
                                <span className="badge-status badge-low">
                                  Low Stock
                                </span>
                              ) : (
                                <span className="badge-status badge-healthy">
                                  Healthy
                                </span>
                              )}
                            </td>
                            <td>
                              <div className="row-actions">
                                <button
                                  type="button"
                                  className="btn-tbl btn-tbl-receive"
                                  onClick={() => handleOpenReceive(med.id)}
                                  title="Receive new stock shipment"
                                >
                                  + Stock
                                </button>
                                <button
                                  type="button"
                                  className="btn-tbl btn-tbl-dispense"
                                  onClick={() => handleOpenDispense(med.id)}
                                  disabled={med.currentStock === 0}
                                  title={
                                    med.currentStock === 0
                                      ? "Cannot dispense: Stock is 0"
                                      : "Dispense medication via FEFO"
                                  }
                                >
                                  Dispense
                                </button>
                              </div>
                            </td>
                          </tr>

                          {/* Expanded Batch Sub-Table */}
                          {isExpanded && (
                            <tr className="batches-subrow">
                              <td colSpan={9}>
                                <div className="batches-subcontainer">
                                  <div className="subcontainer-header">
                                    <h4>
                                      Active Batches & Expiration Lots for{" "}
                                      <strong>{med.name}</strong>
                                    </h4>
                                    <span className="storage-condition">
                                      Storage: {med.storageConditions} | Mfr:{" "}
                                      {med.manufacturer}
                                    </span>
                                  </div>

                                  <table className="sub-batches-table">
                                    <thead>
                                      <tr>
                                        <th>Lot / Batch #</th>
                                        <th>Purchase Date</th>
                                        <th>Expiry Date (FEFO)</th>
                                        <th>Supplier</th>
                                        <th>Received</th>
                                        <th>Remaining</th>
                                        <th>Status</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {(med.batches || []).map((batch) => (
                                        <tr key={batch.id}>
                                          <td className="batch-code-col">
                                            <strong>{batch.batchNumber}</strong>
                                          </td>
                                          <td>{batch.purchaseDate}</td>
                                          <td>
                                            <span className="expiry-tag">
                                              {batch.expiryDate}
                                            </span>
                                          </td>
                                          <td>{batch.supplierName}</td>
                                          <td>{batch.quantityReceived} units</td>
                                          <td>
                                            <span className="remaining-bold">
                                              {batch.quantityRemaining} units
                                            </span>
                                          </td>
                                          <td>
                                            <span
                                              className={`batch-tag ${
                                                batch.status === "ACTIVE"
                                                  ? "tag-active"
                                                  : batch.status === "EXPIRED"
                                                  ? "tag-expired"
                                                  : "tag-depleted"
                                              }`}
                                            >
                                              {batch.status}
                                            </span>
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 2: e-PRESCRIPTIONS QUEUE ================= */}
        {activeTab === "Prescriptions" && (
          <div className="rx-queue-view">
            <div className="view-intro-banner">
              <div>
                <h3>Physician e-Prescriptions Dispensing Queue</h3>
                <p>
                  Active prescriptions ordered during clinical encounters. Verify drug-allergy contraindications and click Dispense to fulfill via FEFO.
                </p>
              </div>
              <span className="counter-chip">
                {pendingRx.length} Prescriptions Pending
              </span>
            </div>

            {isRxLoading ? (
              <PageLoader message="Fetching pending prescriptions..." />
            ) : pendingRx.length === 0 ? (
              <EmptyState
                icon={<CheckCircle2 size={40} color="#10b981" />}
                title="Prescription Queue is Cleared"
                description="All clinical prescriptions have been dispensed by the pharmacy department."
              />
            ) : (
              <div className="rx-cards-grid">
                {pendingRx.map((rx) => {
                  // Find if we have this medicine in formulary
                  const matchedMed = medicines.find(
                    (m) =>
                      rx.medicationName
                        .toLowerCase()
                        .includes(m.name.toLowerCase()) ||
                      m.name
                        .toLowerCase()
                        .includes(rx.medicationName.toLowerCase())
                  );

                  return (
                    <div key={rx.id} className="rx-card">
                      <div className="rx-card-top">
                        <div className="patient-meta">
                          <span className="patient-name">{rx.patientName}</span>
                          <span className="patient-mrn">{rx.patientMrn}</span>
                        </div>
                        <span className="rx-date">{rx.date}</span>
                      </div>

                      <div className="rx-medication-details">
                        <div className="rx-drug-name">
                          <Pill size={16} color="#0d9488" />
                          <span>{rx.medicationName}</span>
                        </div>
                        <div className="rx-posology">
                          <span>Dosage: <strong>{rx.dosage}</strong></span>
                          <span>Route: <strong>{rx.route}</strong></span>
                          <span>Freq: <strong>{rx.frequency}</strong></span>
                          <span>Duration: <strong>{rx.duration}</strong></span>
                        </div>
                        {rx.instructions && (
                          <div className="rx-instructions">
                            "{rx.instructions}"
                          </div>
                        )}
                      </div>

                      <div className="rx-doctor-meta">
                        <span>Ordered by: <strong>{rx.doctorName}</strong> ({rx.doctorSpecialty})</span>
                      </div>

                      <div className="rx-card-footer">
                        {matchedMed ? (
                          <span
                            className={`stock-avail ${
                              matchedMed.currentStock > 0
                                ? "avail-yes"
                                : "avail-no"
                            }`}
                          >
                            In Stock: {matchedMed.currentStock} units
                          </span>
                        ) : (
                          <span className="stock-avail avail-warn">
                            Formulary Check Required
                          </span>
                        )}

                        <button
                          type="button"
                          className="btn-fulfill-rx"
                          onClick={() =>
                            handleOpenDispense(matchedMed?.id, rx)
                          }
                        >
                          <ArrowDownRight size={15} />
                          Fulfill & Dispense
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 3: MOVEMENTS LEDGER ================= */}
        {activeTab === "Ledger" && (
          <div className="ledger-view">
            <div className="view-intro-banner">
              <div>
                <h3>Immutable Inventory Movement Ledger</h3>
                <p>
                  Audit trail recording all inward shipments, dispensing deductions, and stock adjustments for GxP compliance.
                </p>
              </div>
              <span className="counter-chip">
                Showing Last {movements.length} Movements
              </span>
            </div>

            {isMovementsLoading ? (
              <PageLoader message="Loading movement ledger..." />
            ) : movements.length === 0 ? (
              <EmptyState
                icon={<Clock size={40} color="#64748b" />}
                title="No Ledger Records Found"
                description="Movement records will appear automatically when batches are received or dispensed."
              />
            ) : (
              <div className="ledger-table-wrapper">
                <table className="pharmacy-table">
                  <thead>
                    <tr>
                      <th>Timestamp</th>
                      <th>Transaction Type</th>
                      <th>Medication & SKU</th>
                      <th>Batch / Lot</th>
                      <th>Quantity</th>
                      <th>Reference / Rx</th>
                      <th>Authorized By</th>
                      <th>Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {movements.map((mov) => {
                      const isReceive = mov.type === "RECEIVE";
                      return (
                        <tr key={mov.id}>
                          <td className="timestamp-col">
                            {new Date(mov.createdAt).toLocaleString()}
                          </td>
                          <td>
                            <span
                              className={`mov-type-badge ${
                                isReceive ? "type-receive" : "type-dispense"
                              }`}
                            >
                              {isReceive ? "▲ RECEIVE" : "▼ DISPENSE"}
                            </span>
                          </td>
                          <td>
                            <div className="med-primary-info">
                              <span className="med-name">
                                {mov.medicineName || "Medication"}
                              </span>
                              {mov.medicineSku && (
                                <span className="sku-tag">{mov.medicineSku}</span>
                              )}
                            </div>
                          </td>
                          <td>
                            <span className="batch-code-col">
                              {mov.batchNumber}
                            </span>
                          </td>
                          <td>
                            <span
                              className={`mov-qty ${
                                mov.quantity > 0 ? "text-emerald" : "text-sky"
                              }`}
                            >
                              {mov.quantity > 0
                                ? `+${mov.quantity}`
                                : mov.quantity}{" "}
                              units
                            </span>
                          </td>
                          <td>
                            <span className="ref-tag">{mov.reference}</span>
                          </td>
                          <td>{mov.performedBy}</td>
                          <td className="notes-col">{mov.notes || "—"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 4: REORDER & EXPIRY ALERTS ================= */}
        {activeTab === "Alerts" && (
          <div className="alerts-view">
            <div className="view-intro-banner banner-warning">
              <div>
                <h3>Stock Reorder & Critical Threshold Alerts</h3>
                <p>
                  Formulary drugs that have dropped below minimum stock safety levels or have depleted completely.
                </p>
              </div>
              <span className="counter-chip chip-amber">
                {lowStockAlerts.length} Action Items
              </span>
            </div>

            {isAlertsLoading ? (
              <PageLoader message="Analyzing stock minimum thresholds..." />
            ) : lowStockAlerts.length === 0 ? (
              <EmptyState
                icon={<CheckCircle2 size={40} color="#10b981" />}
                title="All Inventory Levels are Healthy"
                description="No medications currently breach minimum threshold limits."
              />
            ) : (
              <div className="alerts-grid">
                {lowStockAlerts.map((med) => {
                  const deficit = Math.max(
                    0,
                    med.minStockLevel * 2 - med.currentStock
                  );
                  return (
                    <div
                      key={med.id}
                      className={`alert-card ${
                        med.isOutOfStock ? "card-depleted" : "card-low"
                      }`}
                    >
                      <div className="alert-card-header">
                        <div className="alert-title-box">
                          <span className="med-sku">{med.sku}</span>
                          <h4 className="alert-med-name">{med.name}</h4>
                          <span className="alert-brand">
                            {med.brandName} • {med.strength} ({med.dosageForm})
                          </span>
                        </div>
                        <span
                          className={`alert-status-badge ${
                            med.isOutOfStock ? "badge-depleted" : "badge-low"
                          }`}
                        >
                          {med.isOutOfStock ? "OUT OF STOCK" : "LOW STOCK"}
                        </span>
                      </div>

                      <div className="alert-stats-box">
                        <div className="stat-item">
                          <span className="stat-label">Current Stock:</span>
                          <span
                            className={`stat-value ${
                              med.isOutOfStock ? "text-rose" : "text-amber"
                            }`}
                          >
                            {med.currentStock} units
                          </span>
                        </div>
                        <div className="stat-item">
                          <span className="stat-label">Min Threshold:</span>
                          <span className="stat-value">{med.minStockLevel} units</span>
                        </div>
                        <div className="stat-item">
                          <span className="stat-label">Suggested PO:</span>
                          <span className="stat-value text-emerald">
                            +{deficit} units
                          </span>
                        </div>
                      </div>

                      <div className="alert-card-footer">
                        <span className="supplier-hint">
                          Mfr: {med.manufacturer || "Hospital Vendor"}
                        </span>
                        <button
                          type="button"
                          className="btn-create-po"
                          onClick={() => handleOpenReceive(med.id)}
                        >
                          <ArrowUpRight size={14} />
                          Receive Stock Shipment
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 5. Modals */}
      <ReceiveStockModal
        isOpen={isReceiveModalOpen}
        onClose={() => setIsReceiveModalOpen(false)}
        defaultMedicineId={targetMedicineId}
        medicines={medicines}
      />

      <DispenseMedicationModal
        isOpen={isDispenseModalOpen}
        onClose={() => setIsDispenseModalOpen(false)}
        medicines={medicines}
        defaultMedicineId={targetMedicineId}
        defaultPrescriptionId={targetRx?.id}
        defaultPatientName={targetRx?.patientName}
      />

      <AddMedicineModal
        isOpen={isAddMedModalOpen}
        onClose={() => setIsAddMedModalOpen(false)}
      />
    </div>
  );
};

export default Pharmacy;