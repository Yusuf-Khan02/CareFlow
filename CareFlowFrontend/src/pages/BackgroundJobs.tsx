import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useSocket } from "../context/SocketContext";
import { useTenant } from "../context/TenantContext";
import { jobService } from "../services/jobService";
import type { BackgroundJob, JobMetrics } from "../types";
import {
  Zap,
  Radio,
  RotateCcw,
  AlertTriangle,
  Check,
  Eye,
  Trash2,
  Copy,
  Building2,
  FileText,
  Bell,
} from "../components/common/Icons";
import { Spinner, useToast } from "../components/common";
import { playHospitalChime } from "../utils/audioChime";
import "./BackgroundJobs.css";

export const BackgroundJobs: React.FC = () => {
  const { isConnected, connectionStatus, latency, liveEvents, clearEvents } = useSocket();
  const { activeOrganization } = useTenant();
  const { showToast } = useToast();

  const [jobs, setJobs] = useState<BackgroundJob[]>([]);
  const [metrics, setMetrics] = useState<JobMetrics>({
    total: 0,
    waiting: 0,
    active: 0,
    completed: 0,
    failed: 0,
    deadLetter: 0,
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [triggeringJob, setTriggeringJob] = useState<string | null>(null);

  // Inspector modal
  const [selectedJob, setSelectedJob] = useState<BackgroundJob | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const fetchJobs = useCallback(async () => {
    try {
      const res = await jobService.getJobs({
        status: statusFilter !== "ALL" ? statusFilter : undefined,
        organizationId: activeOrganization?.id,
      });
      setJobs(res.data || []);
      if (res.metrics) setMetrics(res.metrics);
    } catch (err) {
      console.error("Failed to fetch jobs:", err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, activeOrganization?.id]);

  useEffect(() => {
    fetchJobs();
    const interval = setInterval(fetchJobs, 3000); // Poll as a fallback every 3s
    return () => clearInterval(interval);
  }, [fetchJobs]);

  const handleTriggerReport = async () => {
    setTriggeringJob("report");
    try {
      const job = await jobService.triggerReport(
        "MONTHLY_EXECUTIVE_SUMMARY",
        `Executive Hospital Audit — ${activeOrganization?.name || "CareFlow"}`
      );
      showToast(`Report job enqueued (#${job.id.slice(0, 8)})`, "info");
      fetchJobs();
    } catch {
      showToast("Failed to launch report job", "error");
    } finally {
      setTriggeringJob(null);
    }
  };

  const handleTriggerNotification = async () => {
    setTriggeringJob("notification");
    try {
      const job = await jobService.triggerNotification({
        title: "STAT Code Blue Simulation",
        description: "Emergency response team requested in ICU Wing B. Real-time drill in progress.",
        type: "urgent",
      });
      showToast(`Alert job enqueued (#${job.id.slice(0, 8)})`, "info");
      fetchJobs();
    } catch {
      showToast("Failed to launch notification job", "error");
    } finally {
      setTriggeringJob(null);
    }
  };

  const handleTriggerFailureSim = async () => {
    setTriggeringJob("failure");
    try {
      const job = await jobService.triggerFailureSimulation(
        "Payment Settlement Gateway Timeout (HTTP 504) — Retrying with exponential backoff"
      );
      showToast(`Failing job enqueued (#${job.id.slice(0, 8)}). Watch it retry then enter DLQ!`, "warning");
      fetchJobs();
    } catch {
      showToast("Failed to launch DLQ test job", "error");
    } finally {
      setTriggeringJob(null);
    }
  };

  const handleRetryJob = async (id: string) => {
    try {
      await jobService.retryJob(id);
      showToast(`Job #${id.slice(0, 8)} removed from DLQ and re-enqueued`, "success");
      fetchJobs();
    } catch {
      showToast("Failed to retry job", "error");
    }
  };

  const handleClearCompleted = async () => {
    try {
      const res = await jobService.clearCompleted();
      showToast(res.message, "info");
      fetchJobs();
    } catch {
      showToast("Failed to clear completed jobs", "error");
    }
  };

  const handleCopyJSON = (str: string) => {
    navigator.clipboard.writeText(str);
    setCopied(true);
    showToast("Job payload copied to clipboard", "info");
    setTimeout(() => setCopied(false), 2000);
  };

  const dlqJobs = useMemo(() => {
    return jobs.filter((j) => j.status === "dead_letter");
  }, [jobs]);

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "active":
        return "badge-status-active";
      case "completed":
        return "badge-status-completed";
      case "waiting":
        return "badge-status-waiting";
      case "failed":
        return "badge-status-failed";
      case "dead_letter":
        return "badge-status-dlq";
      default:
        return "badge-status-default";
    }
  };

  return (
    <div className="jobs-container" id="page-background-jobs">
      {/* Header */}
      <div className="jobs-header">
        <div className="jobs-header-titles">
          <div className="jobs-header-badge">
            <Radio size={14} color="#059669" />
            <span>BullMQ Architecture & WebSocket Streaming</span>
          </div>
          <h1 className="jobs-title">Real-Time & Background Jobs</h1>
          <p className="jobs-subtitle">
            Reliable asynchronous task orchestration, exponential backoff retries, Dead-Letter Queue (DLQ), and bidirectional WebSocket streams.
          </p>
        </div>

        <div className="jobs-header-actions">
          <button
            type="button"
            className="jobs-btn jobs-btn-chime"
            onClick={playHospitalChime}
            title="Test hospital chime synthesis"
          >
            <span>🔊 Test Chime</span>
          </button>

          <button
            type="button"
            className="jobs-btn jobs-btn-secondary"
            onClick={handleClearCompleted}
            disabled={metrics.completed === 0}
            title="Purge finished tasks"
          >
            <Trash2 size={15} />
            <span>Clear Completed</span>
          </button>

          <button
            type="button"
            className="jobs-btn jobs-btn-primary"
            onClick={fetchJobs}
            title="Refresh job queue"
          >
            <RotateCcw size={15} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Telemetry Bar */}
      <div className="telemetry-bar">
        <div className="telemetry-item">
          <span className="telemetry-label">Socket Connection</span>
          <div className="telemetry-val-group">
            <span
              className={`telemetry-dot ${
                isConnected
                  ? "dot-connected"
                  : connectionStatus === "reconnecting"
                  ? "dot-reconnecting"
                  : "dot-disconnected"
              }`}
            />
            <span className="telemetry-val">
              {isConnected ? "Connected" : connectionStatus === "reconnecting" ? "Reconnecting..." : "Offline"}
            </span>
          </div>
        </div>

        <div className="telemetry-item">
          <span className="telemetry-label">Round-Trip Latency</span>
          <span className="telemetry-val font-mono">{latency} ms</span>
        </div>

        <div className="telemetry-item">
          <span className="telemetry-label">Active Tenant Room</span>
          <span className="telemetry-val font-mono">
            tenant:{activeOrganization?.code || "CF-CENTRAL"}
          </span>
        </div>

        <div className="telemetry-item">
          <span className="telemetry-label">Channel Transport</span>
          <span className="telemetry-val">WebSocket (TLS 1.3)</span>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="jobs-kpi-grid">
        <div className="jobs-kpi-card">
          <div className="kpi-icon-wrapper kpi-icon-blue">
            <Zap size={22} color="#2563eb" />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">Total Jobs Enqueued</span>
            <span className="kpi-value">{metrics.total}</span>
            <span className="kpi-subtext">Cumulative task lifecycle</span>
          </div>
        </div>

        <div className="jobs-kpi-card">
          <div className="kpi-icon-wrapper kpi-icon-amber">
            <Radio size={22} color="#d97706" />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">Active / Waiting</span>
            <span className="kpi-value">{metrics.active + metrics.waiting}</span>
            <span className="kpi-subtext">
              {metrics.active} active running, {metrics.waiting} queued
            </span>
          </div>
        </div>

        <div className="jobs-kpi-card">
          <div className="kpi-icon-wrapper kpi-icon-emerald">
            <Check size={22} color="#059669" />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">Completed Jobs</span>
            <span className="kpi-value">{metrics.completed}</span>
            <span className="kpi-subtext">Payloads stored and ready</span>
          </div>
        </div>

        <div className={`jobs-kpi-card ${metrics.deadLetter > 0 ? "kpi-card-alert" : ""}`}>
          <div className="kpi-icon-wrapper kpi-icon-rose">
            <AlertTriangle size={22} color="#dc2626" />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">Dead-Letter Queue (DLQ)</span>
            <span className="kpi-value">{metrics.deadLetter}</span>
            <span className="kpi-subtext">Permanently failed tasks</span>
          </div>
        </div>
      </div>

      {/* Interactive Task Launchers Grid */}
      <div className="launchers-section">
        <h3 className="section-title">Trigger Asynchronous Workers</h3>
        <div className="launchers-grid">
          {/* Launcher 1: Report Generation */}
          <div className="launcher-card">
            <div className="launcher-header">
              <div className="launcher-icon icon-blue">
                <FileText size={20} color="#2563eb" />
              </div>
              <div className="launcher-info">
                <h4>Async Report Compilation</h4>
                <p>Heavy clinical & financial aggregation with real-time progress steps.</p>
              </div>
            </div>
            <button
              type="button"
              className="launcher-btn launcher-btn-blue"
              onClick={handleTriggerReport}
              disabled={triggeringJob === "report"}
            >
              {triggeringJob === "report" ? <Spinner size="sm" /> : <Zap size={15} />}
              <span>Compile Executive Report</span>
            </button>
          </div>

          {/* Launcher 2: Notification Broadcast */}
          <div className="launcher-card">
            <div className="launcher-header">
              <div className="launcher-icon icon-emerald">
                <Bell size={20} color="#059669" />
              </div>
              <div className="launcher-info">
                <h4>Dispatch Urgent Staff Notice</h4>
                <p>Broadcasts high-priority alert to all connected staff WebSocket clients.</p>
              </div>
            </div>
            <button
              type="button"
              className="launcher-btn launcher-btn-emerald"
              onClick={handleTriggerNotification}
              disabled={triggeringJob === "notification"}
            >
              {triggeringJob === "notification" ? <Spinner size="sm" /> : <Bell size={15} />}
              <span>Broadcast Staff Alert</span>
            </button>
          </div>

          {/* Launcher 3: DLQ Simulation */}
          <div className="launcher-card">
            <div className="launcher-header">
              <div className="launcher-icon icon-rose">
                <AlertTriangle size={20} color="#dc2626" />
              </div>
              <div className="launcher-info">
                <h4>Simulate Gateway Failure (DLQ)</h4>
                <p>Tests 3 automatic retries with exponential backoff then DLQ isolation.</p>
              </div>
            </div>
            <button
              type="button"
              className="launcher-btn launcher-btn-rose"
              onClick={handleTriggerFailureSim}
              disabled={triggeringJob === "failure"}
            >
              {triggeringJob === "failure" ? <Spinner size="sm" /> : <AlertTriangle size={15} />}
              <span>Trigger DLQ Test Job</span>
            </button>
          </div>
        </div>
      </div>

      {/* Dead-Letter Queue (DLQ) Management Section */}
      {dlqJobs.length > 0 && (
        <div className="dlq-section">
          <div className="dlq-header">
            <div className="dlq-badge">
              <AlertTriangle size={15} color="#dc2626" />
              <span>Dead-Letter Queue Isolation (DLQ)</span>
            </div>
            <span className="dlq-count-tag">{dlqJobs.length} Failed Tasks</span>
          </div>
          <p className="dlq-description">
            The following tasks exhausted all {dlqJobs[0]?.maxAttempts || 3} execution retries and were
            quarantined to prevent resource exhaustion. Inspect the error trace and manually retry
            once external dependencies recover.
          </p>

          <div className="dlq-list">
            {dlqJobs.map((job) => (
              <div key={job.id} className="dlq-card">
                <div className="dlq-card-info">
                  <div className="dlq-meta">
                    <span className="dlq-job-name">{job.name}</span>
                    <span className="font-mono dlq-id">#{job.id.slice(0, 8)}</span>
                    <span className="dlq-attempts-tag">
                      {job.attempts}/{job.maxAttempts} Attempts Failed
                    </span>
                  </div>
                  <p className="dlq-error-text">{job.error || "Execution terminated unexpectedly"}</p>
                </div>

                <div className="dlq-actions">
                  <button
                    type="button"
                    className="dlq-inspect-btn"
                    onClick={() => setSelectedJob(job)}
                  >
                    <Eye size={14} />
                    <span>Inspect</span>
                  </button>
                  <button
                    type="button"
                    className="dlq-retry-btn"
                    onClick={() => handleRetryJob(job.id)}
                  >
                    <RotateCcw size={14} />
                    <span>Retry Task</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Jobs Queue Table & Real-Time Terminal Split */}
      <div className="jobs-workspace-split">
        {/* Table Column */}
        <div className="jobs-table-card">
          <div className="table-header-bar">
            <h4>Background Task Ledger</h4>
            <div className="table-filter-group">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="jobs-select"
              >
                <option value="ALL">All Statuses</option>
                <option value="active">Active Running</option>
                <option value="waiting">Waiting / Queued</option>
                <option value="completed">Completed</option>
                <option value="dead_letter">Dead-Letter Queue</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="jobs-loading">
              <Spinner size="lg" />
              <p>Streaming background job state...</p>
            </div>
          ) : jobs.length === 0 ? (
            <div className="jobs-empty">
              <Zap size={36} color="#94a3b8" />
              <h4>No Jobs Found</h4>
              <p>Queue is empty. Trigger an asynchronous task above to observe real-time orchestration.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="jobs-table">
                <thead>
                  <tr>
                    <th>Job ID</th>
                    <th>Worker Name</th>
                    <th>Facility</th>
                    <th>Progress</th>
                    <th>Status</th>
                    <th>Attempts</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map((job) => (
                    <tr key={job.id} className="jobs-row">
                      <td className="font-mono text-muted">#{job.id.slice(0, 8)}</td>
                      <td>
                        <span className="job-name-cell">{job.name}</span>
                      </td>
                      <td>
                        <span className="facility-pill">
                          <Building2 size={12} color="#64748b" />
                          {job.organizationId === "org-careflow-west" ? "CF-WEST" : "CF-CENTRAL"}
                        </span>
                      </td>
                      <td className="progress-cell">
                        <div className="progress-bar-container">
                          <div
                            className={`progress-bar-fill ${
                              job.status === "completed"
                                ? "progress-completed"
                                : job.status === "dead_letter"
                                ? "progress-dlq"
                                : "progress-active"
                            }`}
                            style={{ width: `${job.progress}%` }}
                          />
                        </div>
                        <span className="progress-text">{job.progress}%</span>
                      </td>
                      <td>
                        <span className={`badge-status ${getStatusBadgeClass(job.status)}`}>
                          {job.status === "dead_letter" ? "DLQ" : job.status}
                        </span>
                      </td>
                      <td className="font-mono">
                        {job.attempts}/{job.maxAttempts}
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <button
                          type="button"
                          className="table-inspect-btn"
                          onClick={() => setSelectedJob(job)}
                          title="Inspect Job Payload & Result"
                        >
                          <Eye size={14} />
                          <span>Inspect</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Real-Time Live Event Stream Terminal */}
        <div className="terminal-card">
          <div className="terminal-header">
            <div className="terminal-title-group">
              <span className="terminal-dot" />
              <h5>WebSocket Event Stream</h5>
            </div>
            <button
              type="button"
              className="terminal-clear-btn"
              onClick={clearEvents}
              title="Clear event stream"
            >
              Clear
            </button>
          </div>

          <div className="terminal-body">
            {liveEvents.length === 0 ? (
              <div className="terminal-empty">
                Listening for real-time WebSocket frames... (Queue calls, bed changes, background tasks)
              </div>
            ) : (
              liveEvents.map((item) => (
                <div key={item.id} className={`terminal-entry terminal-entry-${item.type}`}>
                  <span className="entry-time">{item.timestamp}</span>
                  <span className="entry-event">[{item.event}]</span>
                  <span className="entry-summary">{item.summary}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Job Details Modal */}
      {selectedJob && (
        <div className="job-modal-backdrop" onClick={() => setSelectedJob(null)}>
          <div
            className="job-modal-content"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="modal-header">
              <div className="modal-header-info">
                <span className="font-mono text-muted">ID: {selectedJob.id}</span>
                <h3>Job Task: {selectedJob.name}</h3>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setSelectedJob(null)}
              >
                ×
              </button>
            </div>

            <div className="modal-body">
              <div className="modal-grid">
                <div className="modal-grid-item">
                  <span className="grid-label">Status</span>
                  <span className={`badge-status ${getStatusBadgeClass(selectedJob.status)}`}>
                    {selectedJob.status}
                  </span>
                </div>

                <div className="modal-grid-item">
                  <span className="grid-label">Progress</span>
                  <span className="grid-val font-mono">{selectedJob.progress}%</span>
                </div>

                <div className="modal-grid-item">
                  <span className="grid-label">Attempts Made</span>
                  <span className="grid-val font-mono">
                    {selectedJob.attempts} of {selectedJob.maxAttempts} max
                  </span>
                </div>

                <div className="modal-grid-item">
                  <span className="grid-label">Tenant Scope</span>
                  <span className="grid-val font-mono">{selectedJob.organizationId}</span>
                </div>

                <div className="modal-grid-item">
                  <span className="grid-label">Enqueued At</span>
                  <span className="grid-val">{new Date(selectedJob.createdAt).toLocaleString()}</span>
                </div>

                {selectedJob.completedAt && (
                  <div className="modal-grid-item">
                    <span className="grid-label">Completed At</span>
                    <span className="grid-val">{new Date(selectedJob.completedAt).toLocaleString()}</span>
                  </div>
                )}
              </div>

              {selectedJob.error && (
                <div className="modal-error-box">
                  <span className="error-title">Failure Reason / Trace</span>
                  <p className="error-desc font-mono">{selectedJob.error}</p>
                </div>
              )}

              {/* Data & Result Payloads */}
              <div className="modal-payload-group">
                <div className="payload-header">
                  <span className="payload-title">Input Data & Result Output</span>
                  <button
                    type="button"
                    className="copy-btn"
                    onClick={() =>
                      handleCopyJSON(
                        JSON.stringify({ data: selectedJob.data, result: selectedJob.result }, null, 2)
                      )
                    }
                  >
                    {copied ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                    <span>{copied ? "Copied" : "Copy JSON"}</span>
                  </button>
                </div>
                <pre className="payload-box">
                  <code>
                    {JSON.stringify(
                      {
                        data: selectedJob.data,
                        result: selectedJob.result || (selectedJob.status === "active" ? "Processing..." : null),
                      },
                      null,
                      2
                    )}
                  </code>
                </pre>
              </div>
            </div>

            <div className="modal-footer">
              {selectedJob.status === "dead_letter" && (
                <button
                  type="button"
                  className="jobs-btn jobs-btn-primary"
                  onClick={() => {
                    handleRetryJob(selectedJob.id);
                    setSelectedJob(null);
                  }}
                >
                  <RotateCcw size={15} />
                  <span>Retry Dead-Letter Job</span>
                </button>
              )}
              <button
                type="button"
                className="jobs-btn jobs-btn-secondary"
                onClick={() => setSelectedJob(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BackgroundJobs;
