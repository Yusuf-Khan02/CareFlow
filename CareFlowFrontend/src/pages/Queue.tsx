import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queueService } from "../services/queueService";
import { doctorService } from "../services/doctorService";
import type { QueueToken } from "../types";
import { CheckInModal } from "../components/Queue/CheckInModal";
import { useToast, EmptyState, PageLoader } from "../components/common";
import "./Queue.css";

export const Queue = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  // Filters & State
  const [activeTab, setActiveTab] = useState<"Waiting" | "Called" | "In-Consultation" | "All">("Waiting");
  const [selectedDoctor, setSelectedDoctor] = useState<number>(0);
  const [selectedDept, setSelectedDept] = useState<string>("all");
  const [selectedPriority, setSelectedPriority] = useState<string>("all");
  const [search, setSearch] = useState<string>("");

  // Modals
  const [isCheckInModalOpen, setIsCheckInModalOpen] = useState(false);
  const [tokenToPrint, setTokenToPrint] = useState<QueueToken | null>(null);

  // TanStack Query for Live Queue
  const { data: queueData, isLoading, refetch } = useQuery({
    queryKey: [
      "queue",
      {
        doctorId: selectedDoctor || undefined,
        departmentId: selectedDept !== "all" ? selectedDept : undefined,
        status: activeTab !== "All" ? activeTab : undefined,
        priority: selectedPriority !== "all" ? selectedPriority : undefined,
        search: search.trim() || undefined,
      },
    ],
    queryFn: () =>
      queueService.getQueue({
        doctorId: selectedDoctor || undefined,
        departmentId: selectedDept !== "all" ? selectedDept : undefined,
        status: activeTab !== "All" ? activeTab : undefined,
        priority: selectedPriority !== "all" ? selectedPriority : undefined,
        search: search.trim() || undefined,
      }),
    refetchInterval: 6000, // Real-time poll every 6 seconds for live waiting room sync
  });

  // Query Doctors for filters
  const { data: doctorsData } = useQuery({
    queryKey: ["doctors", "all"],
    queryFn: () => doctorService.getDoctors(),
  });

  const tokens = queueData?.tokens || [];
  const metrics = queueData?.metrics || {
    totalWaiting: 0,
    totalCalled: 0,
    totalInConsult: 0,
    totalCompleted: 0,
    totalSkipped: 0,
    avgWaitMinutes: 0,
    currentCalling: null,
  };

  const doctors = doctorsData || [];
  const departments = Array.from(new Set(doctors.map((d) => d.department)));

  // Call Next Mutation
  const callNextMutation = useMutation({
    mutationFn: () =>
      queueService.callNext(
        selectedDoctor || undefined,
        selectedDept !== "all" ? selectedDept : undefined
      ),
    onSuccess: (calledToken) => {
      showToast(
        `📢 Calling Token ${calledToken.tokenNumber}: ${calledToken.patientName} → ${calledToken.doctorRoom}`,
        "info"
      );
      queryClient.invalidateQueries({ queryKey: ["queue"] });
    },
    onError: (err: any) => {
      showToast(err.message || "No waiting patients in queue", "warning");
    },
  });

  // Action Mutations
  const callTokenMutation = useMutation({
    mutationFn: (id: string) => queueService.callToken(id, selectedDoctor || undefined),
    onSuccess: (tok) => {
      showToast(`📢 Called ${tok.tokenNumber} (${tok.patientName})`, "info");
      queryClient.invalidateQueries({ queryKey: ["queue"] });
    },
  });

  const startConsultMutation = useMutation({
    mutationFn: (id: string) => queueService.startConsultation(id),
    onSuccess: (tok) => {
      showToast(`🩺 Consultation started for ${tok.tokenNumber}`, "success");
      queryClient.invalidateQueries({ queryKey: ["queue"] });
    },
  });

  const completeMutation = useMutation({
    mutationFn: (id: string) => queueService.completeToken(id),
    onSuccess: (tok) => {
      showToast(`✓ Completed visit for ${tok.tokenNumber}`, "success");
      queryClient.invalidateQueries({ queryKey: ["queue"] });
    },
  });

  const skipMutation = useMutation({
    mutationFn: (id: string) => queueService.skipToken(id),
    onSuccess: (tok) => {
      showToast(`Skipped token ${tok.tokenNumber}`, "warning");
      queryClient.invalidateQueries({ queryKey: ["queue"] });
    },
  });

  const recallMutation = useMutation({
    mutationFn: (id: string) => queueService.returnToWaiting(id),
    onSuccess: (tok) => {
      showToast(`Returned token ${tok.tokenNumber} to waiting line`, "info");
      queryClient.invalidateQueries({ queryKey: ["queue"] });
    },
  });

  // Identify Currently Calling token for banner
  const activeCallingToken = useMemo(() => {
    return metrics.currentCalling || tokens.find((t) => t.status === "Called") || null;
  }, [metrics.currentCalling, tokens]);

  return (
    <div className="queue-page" id="page-queue">
      {/* 1. Header Row */}
      <div className="queue-header-row">
        <div className="queue-title-group">
          <h1>
            <span>⏱️</span>
            <span>Live Patient Queue & Waiting Room</span>
          </h1>
          <p className="queue-subtitle">
            Coordinate outpatient department lines, monitor live wait times, broadcast token calls, and manage arrival check-ins.
          </p>
        </div>

        <div className="queue-actions-group">
          <button
            type="button"
            className="btn-open-checkin"
            onClick={() => {
              setTokenToPrint(null);
              setIsCheckInModalOpen(true);
            }}
            id="btn-open-checkin"
          >
            <span>＋</span>
            <span>Check-in / Issue Token</span>
          </button>
        </div>
      </div>

      {/* 2. Operational Queue KPI Cards */}
      <div className="queue-stats-grid">
        <div className="queue-stat-card">
          <div className="queue-stat-icon waiting">⏳</div>
          <div className="queue-stat-data">
            <span className="queue-stat-number">{metrics.totalWaiting}</span>
            <span className="queue-stat-label">In Waiting Line</span>
          </div>
        </div>

        <div className="queue-stat-card">
          <div className="queue-stat-icon called">📢</div>
          <div className="queue-stat-data">
            <span className="queue-stat-number">{metrics.totalCalled}</span>
            <span className="queue-stat-label">Currently Called</span>
          </div>
        </div>

        <div className="queue-stat-card">
          <div className="queue-stat-icon inconsult">🩺</div>
          <div className="queue-stat-data">
            <span className="queue-stat-number">{metrics.totalInConsult}</span>
            <span className="queue-stat-label">In Consultation</span>
          </div>
        </div>

        <div className="queue-stat-card">
          <div className="queue-stat-icon completed">✅</div>
          <div className="queue-stat-data">
            <span className="queue-stat-number">{metrics.totalCompleted}</span>
            <span className="queue-stat-label">Completed Today</span>
          </div>
        </div>

        <div className="queue-stat-card">
          <div className="queue-stat-icon waittime">⏱️</div>
          <div className="queue-stat-data">
            <span className="queue-stat-number">~{metrics.avgWaitMinutes}m</span>
            <span className="queue-stat-label">Est. Waiting Time</span>
          </div>
        </div>
      </div>

      {/* 3. High-Visibility Digital Announcement Banner ("NOW CALLING") */}
      {activeCallingToken ? (
        <div className="now-calling-banner" id="broadcast-calling-banner">
          <div className="calling-left">
            <div>
              <div className="calling-badge-pulse">
                <span className="pulse-dot-red" />
                <span>NOW CALLING / PROCEED TO SUITE</span>
              </div>
              <div className="calling-token-display">{activeCallingToken.tokenNumber}</div>
            </div>

            <div>
              <h3 className="calling-patient-name">{activeCallingToken.patientName}</h3>
              <div className="calling-details">
                Please proceed to: <strong>{activeCallingToken.doctorRoom}</strong> • Attending:{" "}
                <strong>{activeCallingToken.doctorName}</strong> ({activeCallingToken.department})
              </div>
            </div>
          </div>

          <div className="calling-actions-right">
            <button
              type="button"
              className="btn-start-consult-banner"
              onClick={() => startConsultMutation.mutate(activeCallingToken.id)}
              disabled={startConsultMutation.isPending}
            >
              🩺 Start Consultation
            </button>
            <button
              type="button"
              className="btn-skip-banner"
              onClick={() => skipMutation.mutate(activeCallingToken.id)}
              disabled={skipMutation.isPending}
            >
              Skip (No-show)
            </button>
          </div>
        </div>
      ) : (
        <div
          className="now-calling-banner"
          style={{ background: "linear-gradient(135deg, #1e293b 0%, #334155 100%)", padding: "18px 24px" }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <span style={{ fontSize: "24px" }}>📢</span>
            <div>
              <strong style={{ color: "#ffffff", fontSize: "14.5px" }}>
                Waiting Room Public Display Ready
              </strong>
              <p style={{ margin: 0, fontSize: "12.5px", color: "#94a3b8" }}>
                No patient is currently being called. Click "Call Next Patient" below to page the next person in line.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 4. "Call Next" Control Panel */}
      <div className="call-next-panel">
        <div className="call-next-filters">
          <div>
            <label style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>
              Calling Suite / Doctor:
            </label>
            <select
              className="toolbar-select"
              value={selectedDoctor}
              onChange={(e) => setSelectedDoctor(Number(e.target.value))}
            >
              <option value={0}>Any Available Doctor</option>
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.department} • {d.room})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>
              Department Line:
            </label>
            <select
              className="toolbar-select"
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
            >
              <option value="all">All Department Queues</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          type="button"
          className="btn-call-next-action"
          onClick={() => callNextMutation.mutate()}
          disabled={callNextMutation.isPending || metrics.totalWaiting === 0}
          id="btn-call-next-patient"
        >
          <span>📢</span>
          <span>
            {callNextMutation.isPending ? "Paging..." : "Call Next Waiting Patient"}
          </span>
          <span
            style={{
              backgroundColor: "rgba(255,255,255,0.25)",
              padding: "2px 8px",
              borderRadius: "12px",
              fontSize: "12px",
            }}
          >
            {metrics.totalWaiting} in line
          </span>
        </button>
      </div>

      {/* 5. Queue Tabs & Filter Toolbar */}
      <div className="queue-toolbar-card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
          {/* Status Tabs */}
          <div className="queue-nav-tabs">
            <button
              type="button"
              className={`queue-tab-btn ${activeTab === "Waiting" ? "active" : ""}`}
              onClick={() => setActiveTab("Waiting")}
            >
              ⏳ Waiting Line ({metrics.totalWaiting})
            </button>
            <button
              type="button"
              className={`queue-tab-btn ${activeTab === "Called" ? "active" : ""}`}
              onClick={() => setActiveTab("Called")}
            >
              📢 Called ({metrics.totalCalled})
            </button>
            <button
              type="button"
              className={`queue-tab-btn ${activeTab === "In-Consultation" ? "active" : ""}`}
              onClick={() => setActiveTab("In-Consultation")}
            >
              🩺 In Consultation ({metrics.totalInConsult})
            </button>
            <button
              type="button"
              className={`queue-tab-btn ${activeTab === "All" ? "active" : ""}`}
              onClick={() => setActiveTab("All")}
            >
              📋 All Tokens ({tokens.length})
            </button>
          </div>

          {/* Search Box */}
          <div className="apt-search-wrapper" style={{ minWidth: "240px", flex: "unset" }}>
            <input
              type="text"
              className="apt-search-input"
              placeholder="Search token #, patient name, MRN..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Priority Filter */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", paddingTop: "8px", borderTop: "1px solid #f1f5f9" }}>
          <span style={{ fontSize: "12px", fontWeight: 700, color: "#64748b" }}>Filter Priority:</span>
          <div className="date-presets-group">
            <button
              type="button"
              className={`date-preset-btn ${selectedPriority === "all" ? "active" : ""}`}
              onClick={() => setSelectedPriority("all")}
            >
              All Priorities
            </button>
            <button
              type="button"
              className={`date-preset-btn ${selectedPriority === "Emergency" ? "active" : ""}`}
              onClick={() => setSelectedPriority("Emergency")}
            >
              🚨 Emergency
            </button>
            <button
              type="button"
              className={`date-preset-btn ${selectedPriority === "Urgent" ? "active" : ""}`}
              onClick={() => setSelectedPriority("Urgent")}
            >
              🟡 Urgent
            </button>
            <button
              type="button"
              className={`date-preset-btn ${selectedPriority === "Normal" ? "active" : ""}`}
              onClick={() => setSelectedPriority("Normal")}
            >
              🟢 Normal
            </button>
          </div>
        </div>
      </div>

      {/* 6. Tokens Grid */}
      {isLoading ? (
        <PageLoader message="Connecting to CareFlow Queue System..." />
      ) : tokens.length === 0 ? (
        <EmptyState
          title={`No Patients in ${activeTab} Queue`}
          description="The waiting room queue is currently clear for these filter criteria."
          actionText="Issue Arrival Token"
          onAction={() => setIsCheckInModalOpen(true)}
        />
      ) : (
        <div className="queue-tokens-grid">
          {tokens.map((tok) => (
            <div key={tok.id} className="queue-token-card">
              {/* Top Row: Token Number & Priority */}
              <div className="token-card-top">
                <span className="token-number-badge">{tok.tokenNumber}</span>
                <span className={`priority-badge ${tok.priority.toLowerCase()}`}>
                  {tok.priority} Priority
                </span>
              </div>

              {/* Patient Details */}
              <div className="token-patient-block">
                <div className="token-patient-avatar">
                  {tok.patientName.charAt(0)}
                </div>
                <div className="token-patient-info">
                  <h4>{tok.patientName}</h4>
                  <div className="token-patient-meta">
                    <span className="mrn-chip">{tok.patientMrn}</span>
                    <span>•</span>
                    <span>{tok.patientGender}, {tok.patientAge}y</span>
                  </div>
                </div>
              </div>

              {/* Clinical Suite & Wait Time Info */}
              <div className="token-clinical-meta">
                <div>
                  <strong>Assigned Physician</strong>
                  <span>{tok.doctorName}</span>
                </div>
                <div>
                  <strong>Suite / Room</strong>
                  <span>{tok.doctorRoom}</span>
                </div>
                <div>
                  <strong>Department</strong>
                  <span>{tok.department}</span>
                </div>
                <div>
                  <strong>Wait Estimation</strong>
                  <span>
                    {tok.status === "Waiting"
                      ? `~${tok.estimatedWaitMinutes} mins`
                      : tok.status === "Called"
                      ? "Proceeding to Suite"
                      : tok.status === "In-Consultation"
                      ? "In Consultation"
                      : tok.status}
                  </span>
                </div>
              </div>

              {/* Interactive Token Action Buttons */}
              <div className="token-actions-row">
                {tok.status === "Waiting" && (
                  <button
                    type="button"
                    className="btn-card-action call"
                    onClick={() => callTokenMutation.mutate(tok.id)}
                    disabled={callTokenMutation.isPending}
                  >
                    📢 Call Patient
                  </button>
                )}

                {tok.status === "Called" && (
                  <>
                    <button
                      type="button"
                      className="btn-card-action start"
                      onClick={() => startConsultMutation.mutate(tok.id)}
                      disabled={startConsultMutation.isPending}
                    >
                      🩺 In-Consult
                    </button>
                    <button
                      type="button"
                      className="btn-card-action skip"
                      onClick={() => skipMutation.mutate(tok.id)}
                      disabled={skipMutation.isPending}
                    >
                      Skip
                    </button>
                  </>
                )}

                {tok.status === "In-Consultation" && (
                  <>
                    <button
                      type="button"
                      className="btn-card-action start"
                      onClick={() =>
                        navigate(
                          `/consultations?patientId=${tok.patientId}&doctorId=${tok.doctorId || ""}&appointmentId=${tok.appointmentId || ""}`
                        )
                      }
                      title="Open doctor clinical consultation and prescription workspace"
                    >
                      🩺 Open EMR
                    </button>
                    <button
                      type="button"
                      className="btn-card-action complete"
                      onClick={() => completeMutation.mutate(tok.id)}
                      disabled={completeMutation.isPending}
                    >
                      ✓ Complete
                    </button>
                  </>
                )}

                {(tok.status === "Completed" || tok.status === "Skipped") && (
                  <button
                    type="button"
                    className="btn-card-action call"
                    onClick={() => recallMutation.mutate(tok.id)}
                    disabled={recallMutation.isPending}
                  >
                    🔄 Return to Waiting
                  </button>
                )}

                {/* Print Token Slip Button */}
                <button
                  type="button"
                  className="btn-print-icon"
                  title="Print Token Slip"
                  onClick={() => {
                    setTokenToPrint(tok);
                    setIsCheckInModalOpen(true);
                  }}
                >
                  🖨️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 7. Check-in & Walk-in Token Modal */}
      <CheckInModal
        isOpen={isCheckInModalOpen}
        onClose={() => {
          setIsCheckInModalOpen(false);
          setTokenToPrint(null);
        }}
        initialPrintToken={tokenToPrint}
        onSuccess={() => refetch()}
      />
    </div>
  );
};

export default Queue;