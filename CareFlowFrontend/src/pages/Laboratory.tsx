import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { labService, LAB_CATALOG } from "../services/labService";
import { OrderLabTestModal } from "../components/Laboratory/OrderLabTestModal";
import { EnterLabResultsModal } from "../components/Laboratory/EnterLabResultsModal";
import { LabReportModal } from "../components/Laboratory/LabReportModal";
import {
  FlaskConical,
  Microscope,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Search,
  Plus,
  FileSpreadsheet,
  Printer,
} from "../components/common/Icons";
import { useToast, EmptyState, PageLoader } from "../components/common";
import type { LabOrder, LabOrderStatus, LabCatalogTest } from "../types";
import "./Laboratory.css";

export const Laboratory: React.FC = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  // Navigation & Filter State
  const [activeTab, setActiveTab] = useState<"All" | "Requested" | "In-Analysis" | "Completed" | "Catalog">("All");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedPriority, setSelectedPriority] = useState<string>("all");
  const [search, setSearch] = useState<string>("");

  // Modals State
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [resultsModalOrder, setResultsModalOrder] = useState<LabOrder | null>(null);
  const [reportModalOrder, setReportModalOrder] = useState<LabOrder | null>(null);

  // TanStack Query for Lab Orders
  const { data: labData, isLoading } = useQuery({
    queryKey: [
      "labOrders",
      {
        status:
          activeTab === "Requested"
            ? "Requested"
            : activeTab === "In-Analysis"
            ? "In-Analysis"
            : activeTab === "Completed"
            ? "Completed"
            : undefined,
        category: selectedCategory !== "all" ? selectedCategory : undefined,
        priority: selectedPriority !== "all" ? selectedPriority : undefined,
        search: search.trim() || undefined,
      },
    ],
    queryFn: () =>
      labService.getLabOrders({
        status:
          activeTab === "Requested"
            ? "Requested"
            : activeTab === "In-Analysis"
            ? "In-Analysis"
            : activeTab === "Completed"
            ? "Completed"
            : undefined,
        category: selectedCategory !== "all" ? selectedCategory : undefined,
        priority: selectedPriority !== "all" ? selectedPriority : undefined,
        search: search.trim() || undefined,
      }),
    refetchInterval: 8000,
  });

  const orders = labData?.orders || [];
  const metrics = labData?.metrics || {
    totalOrders: 0,
    pendingCollection: 0,
    inAnalysis: 0,
    completed: 0,
    criticalCount: 0,
  };

  // Status Mutation (Collect Sample, Start Analysis)
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: LabOrderStatus }) =>
      labService.updateOrderStatus(id, status),
    onSuccess: (updated: LabOrder) => {
      showToast(`Order ${updated.orderNumber} updated to '${updated.status}'`, "success");
      queryClient.invalidateQueries({ queryKey: ["labOrders"] });
    },
    onError: (err: any) => {
      showToast(err.message || "Failed to update order status.", "error");
    },
  });

  return (
    <div className="laboratory-container" id="page-laboratory">
      {/* 1. Header Banner */}
      <div className="lab-header">
        <div className="lab-title-group">
          <h1>
            <FlaskConical size={26} color="#0f766e" />
            <span>Diagnostic Laboratory & Pathology</span>
          </h1>
          <p>
            Track specimen collection, automate diagnostic workflows, record verified biochemical results, and alert on critical values.
          </p>
        </div>

        <div className="lab-header-actions">
          <button
            type="button"
            className="btn-order-test"
            onClick={() => setIsOrderModalOpen(true)}
            id="btn-order-lab-test"
          >
            <Plus size={16} />
            <span>Order Diagnostic Test</span>
          </button>
        </div>
      </div>

      {/* 2. Department Metrics Row */}
      <div className="lab-metrics-grid">
        <div className="lab-metric-card">
          <div className="lab-metric-icon total">
            <FlaskConical size={22} />
          </div>
          <div className="lab-metric-info">
            <span className="lab-metric-value">{metrics.totalOrders}</span>
            <span className="lab-metric-label">Total Lab Orders</span>
          </div>
        </div>

        <div className="lab-metric-card">
          <div className="lab-metric-icon pending">
            <Clock size={22} />
          </div>
          <div className="lab-metric-info">
            <span className="lab-metric-value">{metrics.pendingCollection}</span>
            <span className="lab-metric-label">Pending Collection</span>
          </div>
        </div>

        <div className="lab-metric-card">
          <div className="lab-metric-icon analysis">
            <Microscope size={22} />
          </div>
          <div className="lab-metric-info">
            <span className="lab-metric-value">{metrics.inAnalysis}</span>
            <span className="lab-metric-label">In Processing</span>
          </div>
        </div>

        <div className="lab-metric-card">
          <div className="lab-metric-icon completed">
            <CheckCircle2 size={22} />
          </div>
          <div className="lab-metric-info">
            <span className="lab-metric-value">{metrics.completed}</span>
            <span className="lab-metric-label">Completed Reports</span>
          </div>
        </div>

        <div className="lab-metric-card">
          <div className="lab-metric-icon critical">
            <AlertTriangle size={22} />
          </div>
          <div className="lab-metric-info">
            <span className="lab-metric-value">{metrics.criticalCount}</span>
            <span className="lab-metric-label">Critical Alerts</span>
          </div>
        </div>
      </div>

      {/* 3. Control Panel & Filters */}
      <div className="lab-control-panel">
        <div className="lab-tabs-row">
          <div className="lab-tabs">
            <button
              type="button"
              className={`lab-tab-btn ${activeTab === "All" ? "active" : ""}`}
              onClick={() => setActiveTab("All")}
            >
              All Investigations ({metrics.totalOrders})
            </button>
            <button
              type="button"
              className={`lab-tab-btn ${activeTab === "Requested" ? "active" : ""}`}
              onClick={() => setActiveTab("Requested")}
            >
              Sample Collection ({metrics.pendingCollection})
            </button>
            <button
              type="button"
              className={`lab-tab-btn ${activeTab === "In-Analysis" ? "active" : ""}`}
              onClick={() => setActiveTab("In-Analysis")}
            >
              In Analysis ({metrics.inAnalysis})
            </button>
            <button
              type="button"
              className={`lab-tab-btn ${activeTab === "Completed" ? "active" : ""}`}
              onClick={() => setActiveTab("Completed")}
            >
              Verified Reports ({metrics.completed})
            </button>
            <button
              type="button"
              className={`lab-tab-btn ${activeTab === "Catalog" ? "active" : ""}`}
              onClick={() => setActiveTab("Catalog")}
            >
              <FileSpreadsheet size={15} />
              Test Catalogue ({LAB_CATALOG.length})
            </button>
          </div>
        </div>

        {activeTab !== "Catalog" && (
          <div className="lab-filters-row">
            <div className="lab-search-box">
              <Search
                size={16}
                color="#94a3b8"
                style={{ position: "absolute", left: "0.75rem", top: "0.6rem" }}
              />
              <input
                type="text"
                className="lab-search-input"
                placeholder="Search by Order #, Patient, MRN, or Test..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                id="search-lab-input"
              />
            </div>

            <div className="lab-filter-selects">
              <select
                className="lab-filter-select"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="all">All Test Categories</option>
                <option value="Hematology">Hematology</option>
                <option value="Biochemistry">Biochemistry</option>
                <option value="Endocrinology">Endocrinology</option>
                <option value="Cardiology">Cardiology</option>
                <option value="Urinalysis">Urinalysis</option>
              </select>

              <select
                className="lab-filter-select"
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
              >
                <option value="all">All Urgency Priorities</option>
                <option value="STAT">🚨 STAT (Emergency)</option>
                <option value="Urgent">🟡 Urgent</option>
                <option value="Routine">🟢 Routine</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* 4. Content Area: Table vs Catalogue */}
      {activeTab === "Catalog" ? (
        /* Test Catalogue Browser */
        <div className="catalog-grid">
          {LAB_CATALOG.map((catTest: LabCatalogTest) => (
            <div key={catTest.testName} className="catalog-card">
              <div>
                <div className="catalog-card-header">
                  <span className="catalog-cat-badge">{catTest.category}</span>
                  <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 600 }}>
                    ~{catTest.turnaroundHours}h TAT
                  </span>
                </div>
                <h3 className="catalog-test-title">{catTest.testName}</h3>
                <p className="catalog-test-desc">{catTest.description}</p>

                <div className="catalog-params-pill-box">
                  <strong>Standard Measured Analytes ({catTest.defaultParameters.length}):</strong>
                  <div className="catalog-param-chips">
                    {catTest.defaultParameters.map((p: any) => (
                      <span key={p.name} className="catalog-param-chip">
                        {p.name} ({p.referenceRange} {p.unit})
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #f1f5f9", paddingTop: "0.75rem" }}>
                <span style={{ fontSize: "0.75rem", color: "#475569" }}>
                  Sample: <strong>{catTest.sampleType}</strong>
                </span>
                <button
                  type="button"
                  className="btn-table-action results"
                  onClick={() => setIsOrderModalOpen(true)}
                >
                  <Plus size={13} /> Order Test
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : isLoading ? (
        <PageLoader message="Loading diagnostic laboratory investigations..." />
      ) : orders.length === 0 ? (
        <EmptyState
          title={`No ${activeTab !== "All" ? activeTab : ""} Lab Orders Found`}
          description="There are currently no diagnostic investigation orders matching your filter criteria."
          actionText="Order Diagnostic Test"
          onAction={() => setIsOrderModalOpen(true)}
        />
      ) : (
        /* Orders Table */
        <div className="lab-table-card">
          <div style={{ overflowX: "auto" }}>
            <table className="lab-orders-table">
              <thead>
                <tr>
                  <th style={{ width: "13%" }}>Order ID</th>
                  <th style={{ width: "20%" }}>Patient Demographics</th>
                  <th style={{ width: "22%" }}>Investigation & Panel</th>
                  <th style={{ width: "10%" }}>Priority</th>
                  <th style={{ width: "13%" }}>Status</th>
                  <th style={{ width: "22%" }}>Actions & Verification</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((ord: LabOrder) => {
                  const hasCritical = ord.results?.some((r: any) => r.status === "Critical");
                  const hasAbnormal = ord.results?.some(
                    (r: any) => r.status === "High" || r.status === "Low"
                  );

                  return (
                    <tr key={ord.id}>
                      {/* Order Number */}
                      <td>
                        <span className="order-num-pill">{ord.orderNumber}</span>
                        <div style={{ fontSize: "0.7rem", color: "#64748b", marginTop: "4px" }}>
                          {new Date(ord.orderedAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </td>

                      {/* Patient */}
                      <td>
                        <div className="order-patient-block">
                          <span className="order-patient-name">{ord.patientName}</span>
                          <span className="order-patient-meta">
                            {ord.patientMrn} • {ord.patientAge}y {ord.patientGender} • {ord.patientBloodGroup || "O+"}
                          </span>
                        </div>
                      </td>

                      {/* Test Details */}
                      <td>
                        <div className="order-test-block">
                          <span className="order-test-name">{ord.testName}</span>
                          <span className="order-test-cat">{ord.testCategory}</span>
                          <span style={{ fontSize: "0.72rem", color: "#64748b" }}>
                            Dr: {ord.doctorName}
                          </span>
                        </div>
                      </td>

                      {/* Priority */}
                      <td>
                        <span className={`lab-priority-tag ${ord.priority.toLowerCase()}`}>
                          {ord.priority === "STAT" ? "🚨 STAT" : ord.priority}
                        </span>
                      </td>

                      {/* Status */}
                      <td>
                        <span
                          className={`lab-status-badge ${ord.status
                            .toLowerCase()
                            .replace(" ", "-")}`}
                        >
                          {ord.status === "Completed" && <CheckCircle2 size={13} />}
                          {ord.status === "Sample Collected" && <Clock size={13} />}
                          {ord.status}
                        </span>
                        {hasCritical && (
                          <div style={{ marginTop: "4px" }}>
                            <span
                              style={{
                                fontSize: "0.7rem",
                                color: "#b91c1c",
                                fontWeight: 700,
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "2px",
                              }}
                            >
                              <AlertTriangle size={12} /> CRITICAL
                            </span>
                          </div>
                        )}
                        {!hasCritical && hasAbnormal && (
                          <div style={{ marginTop: "4px" }}>
                            <span style={{ fontSize: "0.7rem", color: "#b45309", fontWeight: 600 }}>
                              Abnormal Value
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td>
                        <div className="lab-actions-cell">
                          {ord.status === "Requested" && (
                            <button
                              type="button"
                              className="btn-table-action collect"
                              onClick={() =>
                                updateStatusMutation.mutate({
                                  id: ord.id,
                                  status: "Sample Collected",
                                })
                              }
                              disabled={updateStatusMutation.isPending}
                            >
                              🧪 Collect Sample
                            </button>
                          )}

                          {ord.status === "Sample Collected" && (
                            <>
                              <button
                                type="button"
                                className="btn-table-action analyze"
                                onClick={() =>
                                  updateStatusMutation.mutate({
                                    id: ord.id,
                                    status: "In-Analysis",
                                  })
                                }
                                disabled={updateStatusMutation.isPending}
                              >
                                🔬 Start Analysis
                              </button>
                              <button
                                type="button"
                                className="btn-table-action results"
                                onClick={() => setResultsModalOrder(ord)}
                              >
                                📝 Enter Results
                              </button>
                            </>
                          )}

                          {ord.status === "In-Analysis" && (
                            <button
                              type="button"
                              className="btn-table-action results"
                              onClick={() => setResultsModalOrder(ord)}
                            >
                              📝 Enter Results
                            </button>
                          )}

                          {ord.status === "Completed" && (
                            <>
                              <button
                                type="button"
                                className="btn-table-action report"
                                onClick={() => setReportModalOrder(ord)}
                                id={`view-report-${ord.orderNumber}`}
                              >
                                <Printer size={13} /> View Report
                              </button>
                              <button
                                type="button"
                                className="btn-table-action results"
                                onClick={() => setResultsModalOrder(ord)}
                                title="Edit or append parameters"
                              >
                                ✏️ Edit
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. Modals */}
      <OrderLabTestModal
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
      />

      <EnterLabResultsModal
        order={resultsModalOrder}
        isOpen={Boolean(resultsModalOrder)}
        onClose={() => setResultsModalOrder(null)}
      />

      <LabReportModal
        order={reportModalOrder}
        isOpen={Boolean(reportModalOrder)}
        onClose={() => setReportModalOrder(null)}
      />
    </div>
  );
};

export default Laboratory;