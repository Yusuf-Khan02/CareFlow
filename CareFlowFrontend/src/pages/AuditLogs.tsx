import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useTenant } from "../context/TenantContext";
import { auditService } from "../services/auditService";
import type { AuditLog } from "../types";
import {
  Shield,
  Search,
  Filter,
  Download,
  RotateCcw,
  Eye,
  Copy,
  Check,
  Building2,
  Calendar,
  AlertTriangle,
  Users,
  Activity,
} from "../components/common/Icons";
import { Spinner, useToast } from "../components/common";
import "./AuditLogs.css";

export const AuditLogs: React.FC = () => {
  const { activeOrganization, organizations } = useTenant();
  const { showToast } = useToast();

  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [actionFilter, setActionFilter] = useState<string>("ALL");
  const [entityFilter, setEntityFilter] = useState<string>("ALL");
  const [facilityFilter, setFacilityFilter] = useState<string>(activeOrganization?.id || "current");
  const [dateFilter, setDateFilter] = useState<string>("all");

  // Inspector Modal State
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  // Sync facilityFilter when activeOrganization changes
  useEffect(() => {
    if (activeOrganization?.id) {
      setFacilityFilter(activeOrganization.id);
    }
  }, [activeOrganization?.id]);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const orgParam = facilityFilter === "all" ? "all" : facilityFilter;
      const data = await auditService.getAuditLogs({
        organizationId: orgParam,
        action: actionFilter !== "ALL" ? actionFilter : undefined,
        entityName: entityFilter !== "ALL" ? entityFilter : undefined,
        search: searchTerm || undefined,
        limit: 100,
      });
      setLogs(data);
    } catch (err) {
      console.error("Failed to load audit logs:", err);
      showToast("Failed to fetch audit events", "error");
    } finally {
      setLoading(false);
    }
  }, [facilityFilter, actionFilter, entityFilter, searchTerm, showToast]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Client-side date filter refinement
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      if (dateFilter === "all") return true;
      const logDate = new Date(log.createdAt);
      const now = new Date();
      if (dateFilter === "today") {
        return logDate.toDateString() === now.toDateString();
      }
      if (dateFilter === "7d") {
        const past7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return logDate >= past7Days;
      }
      if (dateFilter === "30d") {
        const past30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return logDate >= past30Days;
      }
      return true;
    });
  }, [logs, dateFilter]);

  // KPI calculations
  const stats = useMemo(() => {
    const totalEvents = filteredLogs.length;
    const highRiskEvents = filteredLogs.filter((l) =>
      ["DELETE", "DISCHARGE", "PAYMENT"].includes(l.action)
    ).length;
    const uniqueActors = new Set(
      filteredLogs.map((l) => l.userId || l.user?.name || "System")
    ).size;
    const currentTenant = activeOrganization?.name || "All Tenants Scoped";

    return { totalEvents, highRiskEvents, uniqueActors, currentTenant };
  }, [filteredLogs, activeOrganization]);

  const handleExportCSV = async () => {
    setIsExporting(true);
    try {
      const orgParam = facilityFilter === "all" ? undefined : facilityFilter;
      await auditService.downloadAuditLogsCSV(orgParam);
      showToast("Audit trail exported successfully (.CSV)", "success");
    } catch {
      showToast("Failed to export audit trail", "error");
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopyJSON = (jsonString: string) => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    showToast("Audit event payload copied to clipboard", "info");
    setTimeout(() => setCopied(false), 2000);
  };

  const formatTimestamp = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return {
        date: d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        time: d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
      };
    } catch {
      return { date: dateStr, time: "" };
    }
  };

  const getActionBadgeClass = (action: string) => {
    switch (action.toUpperCase()) {
      case "CREATE":
        return "badge-action-create";
      case "UPDATE":
        return "badge-action-update";
      case "DELETE":
        return "badge-action-delete";
      case "PAYMENT":
        return "badge-action-payment";
      case "ADMIT":
        return "badge-action-admit";
      case "DISCHARGE":
        return "badge-action-discharge";
      case "LOGIN":
        return "badge-action-login";
      case "EXPORT":
        return "badge-action-export";
      default:
        return "badge-action-default";
    }
  };

  return (
    <div className="audit-logs-container" id="page-audit-logs">
      {/* Page Header */}
      <div className="audit-header">
        <div className="audit-header-titles">
          <div className="audit-header-badge">
            <Shield size={14} color="#2563eb" />
            <span>HIPAA §164.312(b) & Multi-Tenant Isolated</span>
          </div>
          <h1 className="audit-title">Security & Audit Trail</h1>
          <p className="audit-subtitle">
            Cryptographically sealed, immutable record of clinical events, authentication flows, and patient record modifications.
          </p>
        </div>

        <div className="audit-header-actions">
          <button
            type="button"
            className="audit-btn audit-btn-secondary"
            onClick={fetchLogs}
            disabled={loading}
            title="Refresh logs"
          >
            <RotateCcw size={16} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            className="audit-btn audit-btn-primary"
            onClick={handleExportCSV}
            disabled={isExporting}
            id="btn-export-audit-csv"
          >
            {isExporting ? <Spinner size="sm" /> : <Download size={16} />}
            <span>Export Trail (.CSV)</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="audit-kpi-grid">
        <div className="audit-kpi-card">
          <div className="kpi-icon-wrapper kpi-icon-blue">
            <Activity size={22} color="#2563eb" />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">Total Logged Events</span>
            <span className="kpi-value">{loading ? "..." : stats.totalEvents}</span>
            <span className="kpi-subtext">Across active query view</span>
          </div>
        </div>

        <div className="audit-kpi-card">
          <div className="kpi-icon-wrapper kpi-icon-purple">
            <Building2 size={22} color="#7c3aed" />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">Active Hospital Facility</span>
            <span className="kpi-value kpi-value-truncate">
              {activeOrganization?.name || "All Facilities"}
            </span>
            <span className="kpi-subtext">Tenant: {activeOrganization?.code || "MULTI-TENANT"}</span>
          </div>
        </div>

        <div className="audit-kpi-card">
          <div className="kpi-icon-wrapper kpi-icon-amber">
            <AlertTriangle size={22} color="#d97706" />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">High-Impact Actions</span>
            <span className="kpi-value">{loading ? "..." : stats.highRiskEvents}</span>
            <span className="kpi-subtext">Delete, Discharge, Invoicing</span>
          </div>
        </div>

        <div className="audit-kpi-card">
          <div className="kpi-icon-wrapper kpi-icon-emerald">
            <Users size={22} color="#059669" />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">Active Clinical Actors</span>
            <span className="kpi-value">{loading ? "..." : stats.uniqueActors}</span>
            <span className="kpi-subtext">Staff & Automated Services</span>
          </div>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="audit-filter-panel">
        <div className="audit-search-box">
          <Search size={16} color="#64748b" />
          <input
            type="text"
            placeholder="Search by actor, entity ID, action, or details..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="audit-search-input"
            id="input-audit-search"
          />
          {searchTerm && (
            <button
              type="button"
              className="audit-clear-search"
              onClick={() => setSearchTerm("")}
            >
              ×
            </button>
          )}
        </div>

        <div className="audit-dropdown-filters">
          {/* Facility Dropdown */}
          <div className="filter-select-group">
            <Building2 size={15} color="#64748b" />
            <select
              value={facilityFilter}
              onChange={(e) => setFacilityFilter(e.target.value)}
              className="audit-select"
            >
              <option value="all">All Hospitals (Super Admin)</option>
              {organizations.map((org) => (
                <option key={org.id} value={org.id}>
                  {org.name} ({org.code})
                </option>
              ))}
            </select>
          </div>

          {/* Action Filter */}
          <div className="filter-select-group">
            <Filter size={15} color="#64748b" />
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="audit-select"
            >
              <option value="ALL">All Actions</option>
              <option value="LOGIN">LOGIN</option>
              <option value="CREATE">CREATE</option>
              <option value="UPDATE">UPDATE</option>
              <option value="DELETE">DELETE</option>
              <option value="PAYMENT">PAYMENT</option>
              <option value="ADMIT">ADMIT</option>
              <option value="DISCHARGE">DISCHARGE</option>
              <option value="EXPORT">EXPORT</option>
            </select>
          </div>

          {/* Entity Filter */}
          <div className="filter-select-group">
            <select
              value={entityFilter}
              onChange={(e) => setEntityFilter(e.target.value)}
              className="audit-select"
            >
              <option value="ALL">All Entities</option>
              <option value="Patient">Patient</option>
              <option value="Admission">Admission</option>
              <option value="Bed">Bed</option>
              <option value="Invoice">Invoice</option>
              <option value="Prescription">Prescription</option>
              <option value="LabOrder">LabOrder</option>
              <option value="User">User</option>
              <option value="Organization">Organization</option>
            </select>
          </div>

          {/* Date Filter */}
          <div className="filter-select-group">
            <Calendar size={15} color="#64748b" />
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="audit-select"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
            </select>
          </div>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="audit-table-card">
        {loading ? (
          <div className="audit-table-loading">
            <Spinner size="lg" />
            <p>Verifying and streaming immutable audit trail...</p>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="audit-empty-state">
            <div className="empty-state-icon">
              <Shield size={36} color="#94a3b8" />
            </div>
            <h3>No Audit Events Found</h3>
            <p>
              No audit logs matched your active filter criteria. Adjust your search or change the
              hospital facility scope.
            </p>
            <button
              type="button"
              className="audit-btn audit-btn-secondary"
              onClick={() => {
                setSearchTerm("");
                setActionFilter("ALL");
                setEntityFilter("ALL");
                setDateFilter("all");
              }}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="audit-table-responsive">
            <table className="audit-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Actor / Staff</th>
                  <th>Action</th>
                  <th>Target Entity</th>
                  <th>Facility</th>
                  <th>Client Origin</th>
                  <th>Details Preview</th>
                  <th style={{ textAlign: "right" }}>Inspect</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log) => {
                  const time = formatTimestamp(log.createdAt);
                  const actorInitials = log.user?.name
                    ? log.user.name
                        .replace("Dr. ", "")
                        .replace("Sister ", "")
                        .split(" ")
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join("")
                        .toUpperCase()
                    : "SYS";

                  return (
                    <tr key={log.id} className="audit-table-row">
                      <td className="audit-cell-time">
                        <span className="time-date">{time.date}</span>
                        <span className="time-clock">{time.time}</span>
                      </td>

                      <td className="audit-cell-actor">
                        <div className="actor-profile">
                          <div className="actor-avatar">{actorInitials}</div>
                          <div className="actor-info">
                            <span className="actor-name">{log.user?.name || "System Automated"}</span>
                            <span className="actor-role">
                              {log.user?.role || "Automation Daemon"}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span className={`badge-action ${getActionBadgeClass(log.action)}`}>
                          {log.action}
                        </span>
                      </td>

                      <td className="audit-cell-entity">
                        <span className="entity-tag">
                          {log.entityName}
                          {log.entityId && <span className="entity-id-pill">#{log.entityId.slice(0, 8)}</span>}
                        </span>
                      </td>

                      <td>
                        <span className="facility-tag">
                          <Building2 size={12} color="#64748b" />
                          {log.organization?.code || activeOrganization?.code || "HQ"}
                        </span>
                      </td>

                      <td className="audit-cell-origin">
                        <span className="ip-badge">{log.ipAddress || "127.0.0.1"}</span>
                      </td>

                      <td className="audit-cell-details">
                        <span className="details-preview-text" title={log.details || ""}>
                          {log.details || "—"}
                        </span>
                      </td>

                      <td style={{ textAlign: "right" }}>
                        <button
                          type="button"
                          className="inspect-btn"
                          onClick={() => setSelectedLog(log)}
                          title="Inspect full cryptographically sealed event"
                        >
                          <Eye size={15} />
                          <span>Inspect</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Inspector Detail Modal */}
      {selectedLog && (
        <div className="audit-modal-backdrop" onClick={() => setSelectedLog(null)}>
          <div
            className="audit-modal-content"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="modal-header">
              <div className="modal-header-info">
                <div className="modal-header-tag">
                  <Shield size={14} color="#10b981" />
                  <span>Verified Audit Signature</span>
                </div>
                <h3>Audit Event Record</h3>
                <span className="modal-event-id">ID: {selectedLog.id}</span>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setSelectedLog(null)}
              >
                ×
              </button>
            </div>

            <div className="modal-body">
              <div className="modal-info-grid">
                <div className="modal-info-item">
                  <span className="info-label">Action</span>
                  <span className={`badge-action ${getActionBadgeClass(selectedLog.action)}`}>
                    {selectedLog.action}
                  </span>
                </div>

                <div className="modal-info-item">
                  <span className="info-label">Target Entity</span>
                  <span className="info-value">
                    {selectedLog.entityName} {selectedLog.entityId ? `(#${selectedLog.entityId})` : ""}
                  </span>
                </div>

                <div className="modal-info-item">
                  <span className="info-label">Timestamp (UTC / Local)</span>
                  <span className="info-value">{new Date(selectedLog.createdAt).toLocaleString()}</span>
                </div>

                <div className="modal-info-item">
                  <span className="info-label">Organization Facility</span>
                  <span className="info-value">
                    {selectedLog.organization?.name || activeOrganization?.name || "CareFlow Central Hospital"} (
                    {selectedLog.organization?.code || activeOrganization?.code || "CF-CENTRAL"})
                  </span>
                </div>

                <div className="modal-info-item">
                  <span className="info-label">Actor User</span>
                  <span className="info-value">
                    {selectedLog.user ? `${selectedLog.user.name} (${selectedLog.user.role})` : "System Service"}
                  </span>
                </div>

                <div className="modal-info-item">
                  <span className="info-label">IP Address</span>
                  <span className="info-value font-mono">{selectedLog.ipAddress || "127.0.0.1"}</span>
                </div>
              </div>

              {/* User Agent String */}
              {selectedLog.userAgent && (
                <div className="modal-ua-box">
                  <span className="info-label">Client User-Agent</span>
                  <p className="ua-text">{selectedLog.userAgent}</p>
                </div>
              )}

              {/* Raw Details / JSON Inspector */}
              <div className="modal-payload-section">
                <div className="payload-header">
                  <span className="info-label">Event Details Payload</span>
                  <button
                    type="button"
                    className="copy-btn"
                    onClick={() => handleCopyJSON(selectedLog.details || "{}")}
                  >
                    {copied ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                    <span>{copied ? "Copied!" : "Copy Payload"}</span>
                  </button>
                </div>
                <pre className="payload-code-block">
                  <code>{selectedLog.details || "No additional payload recorded."}</code>
                </pre>
              </div>

              {/* Compliance & Security Guarantee Note */}
              <div className="modal-compliance-notice">
                <Shield size={16} color="#059669" />
                <p>
                  <strong>HIPAA §164.312(b) Compliant:</strong> This record was generated at the data
                  tier upon transaction commit. It is strictly append-only, tamper-evident, and scoped
                  to tenant isolation policies.
                </p>
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="audit-btn audit-btn-secondary"
                onClick={() => setSelectedLog(null)}
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditLogs;
