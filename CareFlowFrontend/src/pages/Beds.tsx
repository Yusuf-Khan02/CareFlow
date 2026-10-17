import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { bedService } from "../services/bedService";
import { AdmitPatientModal } from "../components/Beds/AdmitPatientModal";
import { TransferBedModal } from "../components/Beds/TransferBedModal";
import { DischargePatientModal } from "../components/Beds/DischargePatientModal";
import { UpdateBedStatusModal } from "../components/Beds/UpdateBedStatusModal";
import {
  BedDouble,
  Building2,
  Users,
  Search,
  Plus,
  ArrowRightLeft,
  LogOut,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
} from "../components/common/Icons";
import { EmptyState, PageLoader, useToast } from "../components/common";
import type {
  BedItem,
  AdmissionRecord,
  WardSummary,
} from "../types";
import "./Beds.css";

type BedsTab = "FloorPlan" | "Inpatients" | "WardsSummary";

export const Beds: React.FC = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  // Navigation & Filter State
  const [activeTab, setActiveTab] = useState<BedsTab>("FloorPlan");
  const [selectedWardCode, setSelectedWardCode] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [search, setSearch] = useState<string>("");

  // Modals State
  const [isAdmitModalOpen, setIsAdmitModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isDischargeModalOpen, setIsDischargeModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);

  // Selected entities for modals
  const [targetBedId, setTargetBedId] = useState<string | undefined>();
  const [targetBed, setTargetBed] = useState<BedItem | null>(null);
  const [targetAdmission, setTargetAdmission] = useState<AdmissionRecord | null>(null);

  // 1. Fetch Wards & Occupancy Summary
  const {
    data: summaryData,
    isLoading: isSummaryLoading,
    refetch: refetchSummary,
  } = useQuery({
    queryKey: ["wardsSummary"],
    queryFn: () => bedService.getWardsSummary(),
    refetchInterval: 10000,
  });

  // 2. Fetch Beds List
  const {
    data: beds = [],
    isLoading: isBedsLoading,
    refetch: refetchBeds,
  } = useQuery({
    queryKey: [
      "beds",
      {
        wardId: selectedWardCode !== "all" ? selectedWardCode : undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
        search: search.trim() || undefined,
      },
    ],
    queryFn: () =>
      bedService.getBeds({
        wardId: selectedWardCode !== "all" ? selectedWardCode : undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
        search: search.trim() || undefined,
      }),
    refetchInterval: 10000,
  });

  // 3. Fetch Active Inpatient Admissions
  const {
    data: admissions = [],
    isLoading: isAdmissionsLoading,
  } = useQuery({
    queryKey: ["admissions", { status: "Admitted" }],
    queryFn: () => bedService.getAdmissions({ status: "Admitted" }),
    refetchInterval: 10000,
  });

  const wards: WardSummary[] = summaryData?.wards || [];
  const metrics = summaryData?.metrics || {
    totalHospitalBeds: 0,
    totalOccupied: 0,
    totalAvailable: 0,
    totalCleaning: 0,
    totalMaintenance: 0,
    totalReserved: 0,
    overallOccupancyRate: 0,
  };

  // Quick Cleaning Release Mutation
  const cleanBedMutation = useMutation({
    mutationFn: (bedId: string) => bedService.updateBedStatus(bedId, "Available"),
    onSuccess: (updated) => {
      showToast(`Bed ${updated.bedNumber} sanitized and released to Available`, "success");
      queryClient.invalidateQueries({ queryKey: ["wardsSummary"] });
      queryClient.invalidateQueries({ queryKey: ["beds"] });
      queryClient.invalidateQueries({ queryKey: ["availableBeds"] });
    },
    onError: (err: any) => {
      showToast(err.message || "Failed to update bed status", "error");
    },
  });

  // Action Handlers
  const handleOpenAdmit = (bedId?: string) => {
    setTargetBedId(bedId);
    setIsAdmitModalOpen(true);
  };

  const handleOpenTransfer = (bed: BedItem) => {
    if (!bed.currentAdmission) return;
    // Map current admission to AdmissionRecord
    const admRecord: AdmissionRecord = {
      id: bed.currentAdmission.id,
      admissionNumber: bed.currentAdmission.admissionNumber,
      status: "Admitted",
      admissionType: bed.currentAdmission.admissionType,
      diagnosis: bed.currentAdmission.diagnosis,
      condition: bed.currentAdmission.condition,
      admittedAt: bed.currentAdmission.admittedAt,
      daysAdmitted: bed.currentAdmission.daysAdmitted,
      patientId: bed.currentAdmission.patientId,
      patientName: bed.currentAdmission.patientName,
      patientMrn: bed.currentAdmission.patientMrn,
      patientAge: bed.currentAdmission.patientAge,
      patientGender: bed.currentAdmission.patientGender,
      patientPhone: "",
      patientBloodGroup: bed.currentAdmission.patientBloodGroup,
      doctorId: bed.currentAdmission.doctorId,
      doctorName: bed.currentAdmission.doctorName,
      doctorSpecialty: bed.currentAdmission.doctorSpecialty,
      wardId: bed.wardId,
      wardName: bed.wardName,
      wardCode: bed.wardCode,
      bedId: bed.id,
      bedNumber: bed.bedNumber,
      roomNumber: bed.roomNumber,
      dailyRate: bed.dailyRate,
    };
    setTargetAdmission(admRecord);
    setIsTransferModalOpen(true);
  };

  const handleOpenDischarge = (bed: BedItem) => {
    if (!bed.currentAdmission) return;
    const admRecord: AdmissionRecord = {
      id: bed.currentAdmission.id,
      admissionNumber: bed.currentAdmission.admissionNumber,
      status: "Admitted",
      admissionType: bed.currentAdmission.admissionType,
      diagnosis: bed.currentAdmission.diagnosis,
      condition: bed.currentAdmission.condition,
      admittedAt: bed.currentAdmission.admittedAt,
      daysAdmitted: bed.currentAdmission.daysAdmitted,
      patientId: bed.currentAdmission.patientId,
      patientName: bed.currentAdmission.patientName,
      patientMrn: bed.currentAdmission.patientMrn,
      patientAge: bed.currentAdmission.patientAge,
      patientGender: bed.currentAdmission.patientGender,
      patientPhone: "",
      patientBloodGroup: bed.currentAdmission.patientBloodGroup,
      doctorId: bed.currentAdmission.doctorId,
      doctorName: bed.currentAdmission.doctorName,
      doctorSpecialty: bed.currentAdmission.doctorSpecialty,
      wardId: bed.wardId,
      wardName: bed.wardName,
      wardCode: bed.wardCode,
      bedId: bed.id,
      bedNumber: bed.bedNumber,
      roomNumber: bed.roomNumber,
      dailyRate: bed.dailyRate,
    };
    setTargetAdmission(admRecord);
    setIsDischargeModalOpen(true);
  };

  const handleOpenStatus = (bed: BedItem) => {
    setTargetBed(bed);
    setIsStatusModalOpen(true);
  };

  // Group beds by Ward for Floor Plan
  const bedsByWard = React.useMemo(() => {
    const map = new Map<string, { ward: WardSummary; beds: BedItem[] }>();
    wards.forEach((w) => {
      map.set(w.id, { ward: w, beds: [] });
    });

    beds.forEach((b) => {
      const entry = map.get(b.wardId);
      if (entry) {
        entry.beds.push(b);
      } else {
        // Fallback for custom ward
        map.set(b.wardId, {
          ward: {
            id: b.wardId,
            name: b.wardName,
            code: b.wardCode,
            floor: b.floor,
            gender: "Mixed",
            dailyRate: b.dailyRate,
            totalBeds: 0,
            occupiedBeds: 0,
            availableBeds: 0,
            cleaningBeds: 0,
            maintenanceBeds: 0,
            reservedBeds: 0,
            occupancyRate: 0,
            roomsCount: 1,
          },
          beds: [b],
        });
      }
    });

    return Array.from(map.values()).filter(
      (entry) =>
        selectedWardCode === "all" ||
        entry.ward.code.toLowerCase() === selectedWardCode.toLowerCase() ||
        entry.ward.id === selectedWardCode
    );
  }, [wards, beds, selectedWardCode]);

  return (
    <div className="beds-page-container" id="page-beds">
      {/* 1. Header Banner */}
      <div className="beds-header">
        <div className="beds-title-group">
          <h1>
            <BedDouble size={28} color="#2dd4bf" />
            Bed & Inpatient Management
          </h1>
          <p>
            Real-time ward occupancy, clinical admissions, bed transfers, and terminal disinfection protocol.
          </p>
        </div>

        <div className="beds-actions">
          <button
            type="button"
            className="btn-action btn-admit"
            onClick={() => handleOpenAdmit()}
          >
            <Plus size={17} />
            Admit Patient
          </button>
        </div>
      </div>

      {/* 2. Department Metrics Cards */}
      <div className="beds-metrics-grid">
        {/* Occupancy Rate */}
        <div className="metric-card">
          <div className="metric-icon-box icon-teal">
            <Building2 size={22} color="#2dd4bf" />
          </div>
          <div className="metric-content">
            <span className="metric-label">Hospital Occupancy</span>
            <span className="metric-value text-teal">
              {metrics.overallOccupancyRate}%
            </span>
            <span className="metric-sub">
              {metrics.totalOccupied} of {metrics.totalHospitalBeds} beds occupied
            </span>
          </div>
        </div>

        {/* Total Available */}
        <div className="metric-card">
          <div className="metric-icon-box icon-emerald">
            <CheckCircle2 size={22} color="#34d399" />
          </div>
          <div className="metric-content">
            <span className="metric-label">Available Ready</span>
            <span className="metric-value text-emerald">
              {metrics.totalAvailable}
            </span>
            <span className="metric-sub">Cleaned & ready for admission</span>
          </div>
        </div>

        {/* Total Occupied */}
        <div className="metric-card">
          <div className="metric-icon-box icon-rose">
            <Users size={22} color="#fb7171" />
          </div>
          <div className="metric-content">
            <span className="metric-label">Active Inpatients</span>
            <span className="metric-value text-rose">
              {metrics.totalOccupied}
            </span>
            <span className="metric-sub">Under active clinical care</span>
          </div>
        </div>

        {/* Cleaning Required */}
        <div
          className={`metric-card ${metrics.totalCleaning > 0 ? "border-amber" : ""}`}
        >
          <div className="metric-icon-box icon-amber">
            <AlertTriangle size={22} color="#fbbf24" />
          </div>
          <div className="metric-content">
            <span className="metric-label">Housekeeping Needed</span>
            <span className="metric-value text-amber">
              {metrics.totalCleaning}
            </span>
            <span className="metric-sub">Pending terminal disinfection</span>
          </div>
        </div>

        {/* Maintenance */}
        <div className="metric-card">
          <div className="metric-icon-box icon-slate">
            <BedDouble size={22} color="#e2e8f0" />
          </div>
          <div className="metric-content">
            <span className="metric-label">Maintenance / Offline</span>
            <span className="metric-value text-slate">
              {metrics.totalMaintenance}
            </span>
            <span className="metric-sub">Biomedical repair / offline</span>
          </div>
        </div>
      </div>

      {/* 3. Navigation Tabs Bar */}
      <div className="beds-tabs-bar">
        <div className="tabs-list">
          <button
            type="button"
            className={`tab-btn ${activeTab === "FloorPlan" ? "active" : ""}`}
            onClick={() => setActiveTab("FloorPlan")}
          >
            <Building2 size={16} />
            Visual Ward Floor Plan
            <span className="tab-pill">{metrics.totalHospitalBeds}</span>
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === "Inpatients" ? "active" : ""}`}
            onClick={() => setActiveTab("Inpatients")}
          >
            <Users size={16} />
            Active Inpatient Roster
            <span className="tab-pill pill-rose">{admissions.length}</span>
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === "WardsSummary" ? "active" : ""}`}
            onClick={() => setActiveTab("WardsSummary")}
          >
            <BedDouble size={16} />
            Wards & Rate Directory
            <span className="tab-pill">{wards.length}</span>
          </button>
        </div>

        {activeTab === "FloorPlan" && (
          <div className="beds-filter-controls">
            {/* Search */}
            <div className="beds-search-box">
              <Search size={15} color="#94a3b8" />
              <input
                type="text"
                placeholder="Search bed, room, patient, MRN..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button
                  type="button"
                  className="beds-clear-search"
                  onClick={() => setSearch("")}
                >
                  ×
                </button>
              )}
            </div>

            {/* Ward Selector */}
            <select
              className="beds-filter-select"
              value={selectedWardCode}
              onChange={(e) => setSelectedWardCode(e.target.value)}
            >
              <option value="all">All Hospital Wards</option>
              {wards.map((w) => (
                <option key={w.id} value={w.code}>
                  {w.name} ({w.code})
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              className="beds-filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Bed Statuses</option>
              <option value="Available">Available (Ready)</option>
              <option value="Occupied">Occupied</option>
              <option value="Cleaning">Cleaning / Sanitizing</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Reserved">Reserved</option>
            </select>

            <button
              type="button"
              className="refresh-btn"
              onClick={() => {
                refetchSummary();
                refetchBeds();
              }}
              title="Refresh Bed Statuses"
            >
              <RotateCcw size={15} />
            </button>
          </div>
        )}
      </div>

      {/* 4. Tab Content Area */}
      <div className="beds-content-area">
        {/* ================= TAB 1: VISUAL WARD FLOOR PLAN ================= */}
        {activeTab === "FloorPlan" && (
          <div className="floor-plan-view">
            {isBedsLoading || isSummaryLoading ? (
              <PageLoader message="Loading hospital floor plan and bed availability..." />
            ) : beds.length === 0 ? (
              <EmptyState
                icon={<BedDouble size={40} color="#64748b" />}
                title="No Beds Found Matching Filters"
                description="Try clearing search or ward filters to view available hospital beds."
              />
            ) : (
              <div className="wards-sections-container">
                {bedsByWard.map(({ ward, beds: wardBeds }) => {
                  const occupiedCount = wardBeds.filter(
                    (b) => b.status === "Occupied"
                  ).length;
                  const availableCount = wardBeds.filter(
                    (b) => b.status === "Available"
                  ).length;

                  return (
                    <div key={ward.id} className="ward-section-card">
                      {/* Ward Header Banner */}
                      <div className="ward-section-header">
                        <div className="ward-title-meta">
                          <span className="ward-code-badge">{ward.code}</span>
                          <div>
                            <h3 className="ward-name">{ward.name}</h3>
                            <span className="ward-location">
                              {ward.floor} • Base Rate: ${ward.dailyRate}/day • {ward.gender} Wing
                            </span>
                          </div>
                        </div>

                        <div className="ward-occupancy-pill">
                          <span>
                            Occupancy: <strong>{occupiedCount} / {wardBeds.length}</strong>
                          </span>
                          <span className="avail-count-tag">
                            {availableCount} Available
                          </span>
                        </div>
                      </div>

                      {/* Beds Cards Grid */}
                      <div className="bed-cards-grid">
                        {wardBeds.map((bed) => {
                          const isOccupied = bed.status === "Occupied";
                          const isCleaning = bed.status === "Cleaning";
                          const isAvailable = bed.status === "Available";
                          const isMaintenance = bed.status === "Maintenance";
                          const isReserved = bed.status === "Reserved";

                          return (
                            <div
                              key={bed.id}
                              className={`bed-card ${
                                isOccupied
                                  ? "bed-card-occupied"
                                  : isCleaning
                                  ? "bed-card-cleaning"
                                  : isAvailable
                                  ? "bed-card-available"
                                  : isMaintenance
                                  ? "bed-card-maintenance"
                                  : "bed-card-reserved"
                              }`}
                            >
                              {/* Bed Card Header */}
                              <div className="bed-card-header">
                                <div className="bed-number-box">
                                  <BedDouble size={16} />
                                  <span className="bed-no-text">{bed.bedNumber}</span>
                                </div>
                                <span
                                  className={`bed-status-pill status-${bed.status.toLowerCase()}`}
                                >
                                  {isOccupied && "● Occupied"}
                                  {isAvailable && "● Available"}
                                  {isCleaning && "🧹 Cleaning"}
                                  {isMaintenance && "🔧 Maintenance"}
                                  {isReserved && "● Reserved"}
                                </span>
                              </div>

                              {/* Room & Amenities */}
                              <div className="bed-room-info">
                                <span className="room-label">
                                  Room: <strong>{bed.roomNumber}</strong> ({bed.roomType})
                                </span>
                                <span className="rate-label">
                                  ${bed.dailyRate}/day
                                </span>
                              </div>

                              {/* Bed Content Body */}
                              <div className="bed-card-body">
                                {isOccupied && bed.currentAdmission ? (
                                  <div className="patient-admission-block">
                                    <div className="patient-header-row">
                                      <span className="pat-name">
                                        {bed.currentAdmission.patientName}
                                      </span>
                                      <span className="pat-mrn">
                                        {bed.currentAdmission.patientMrn}
                                      </span>
                                    </div>
                                    <div className="pat-diag">
                                      {bed.currentAdmission.diagnosis}
                                    </div>
                                    <div className="pat-meta-row">
                                      <span
                                        className={`cond-tag cond-${bed.currentAdmission.condition.toLowerCase()}`}
                                      >
                                        {bed.currentAdmission.condition}
                                      </span>
                                      <span className="stay-tag">
                                        Day {bed.currentAdmission.daysAdmitted}
                                      </span>
                                    </div>
                                    <span className="doctor-hint">
                                      Dr. {bed.currentAdmission.doctorName}
                                    </span>
                                  </div>
                                ) : isCleaning ? (
                                  <div className="cleaning-alert-block">
                                    <span className="clean-icon">🧹</span>
                                    <span className="clean-title">
                                      Terminal Disinfection in Progress
                                    </span>
                                    <p className="clean-desc">
                                      Patient discharged or transferred. Bed is undergoing deep sanitation.
                                    </p>
                                  </div>
                                ) : isMaintenance ? (
                                  <div className="maintenance-alert-block">
                                    <span className="clean-icon">🔧</span>
                                    <span className="clean-title">
                                      Biomedical Inspection
                                    </span>
                                    <p className="clean-desc">
                                      Offline for hardware maintenance or safety calibration.
                                    </p>
                                  </div>
                                ) : (
                                  <div className="available-block">
                                    <span className="avail-icon">✓</span>
                                    <span className="avail-title">Ready for Admission</span>
                                    <span className="avail-sub">
                                      Sanitized & prepped for intake
                                    </span>
                                  </div>
                                )}
                              </div>

                              {/* Bed Actions Footer */}
                              <div className="bed-card-footer">
                                {isOccupied ? (
                                  <>
                                    <button
                                      type="button"
                                      className="btn-bed-action btn-transfer"
                                      onClick={() => handleOpenTransfer(bed)}
                                      title="Transfer Patient to Another Bed"
                                    >
                                      <ArrowRightLeft size={13} />
                                      Transfer
                                    </button>
                                    <button
                                      type="button"
                                      className="btn-bed-action btn-discharge"
                                      onClick={() => handleOpenDischarge(bed)}
                                      title="Discharge Patient"
                                    >
                                      <LogOut size={13} />
                                      Discharge
                                    </button>
                                  </>
                                ) : isCleaning ? (
                                  <button
                                    type="button"
                                    className="btn-bed-action btn-release-clean"
                                    onClick={() => cleanBedMutation.mutate(bed.id)}
                                    disabled={cleanBedMutation.isPending}
                                  >
                                    <CheckCircle2 size={13} />
                                    Mark Cleaned
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    className="btn-bed-action btn-admit-direct"
                                    onClick={() => handleOpenAdmit(bed.id)}
                                  >
                                    <Plus size={13} />
                                    Admit Patient
                                  </button>
                                )}

                                <button
                                  type="button"
                                  className="btn-bed-gear"
                                  onClick={() => handleOpenStatus(bed)}
                                  title="Change Operational Status"
                                >
                                  ⚙
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 2: ACTIVE INPATIENT ROSTER ================= */}
        {activeTab === "Inpatients" && (
          <div className="inpatients-roster-view">
            <div className="view-intro-banner">
              <div>
                <h3>Active Inpatient Clinical Roster</h3>
                <p>
                  List of all patients currently admitted across hospital wards, their clinical conditions, attending physicians, and stay durations.
                </p>
              </div>
              <span className="counter-chip chip-rose">
                {admissions.length} Admitted Inpatients
              </span>
            </div>

            {isAdmissionsLoading ? (
              <PageLoader message="Fetching admitted patient records..." />
            ) : admissions.length === 0 ? (
              <EmptyState
                icon={<Users size={40} color="#10b981" />}
                title="No Inpatients Currently Admitted"
                description="All inpatient beds are currently vacant."
                actionText="Admit a Patient"
                onAction={() => handleOpenAdmit()}
              />
            ) : (
              <div className="admissions-table-wrapper">
                <table className="beds-table">
                  <thead>
                    <tr>
                      <th>Admission #</th>
                      <th>Patient Details</th>
                      <th>Ward & Bed</th>
                      <th>Attending Physician</th>
                      <th>Diagnosis</th>
                      <th>Condition</th>
                      <th>Days Inpatient</th>
                      <th style={{ textAlign: "right" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {admissions.map((adm) => (
                      <tr key={adm.id}>
                        <td>
                          <span className="adm-num-col">
                            {adm.admissionNumber}
                          </span>
                        </td>
                        <td>
                          <div className="pat-info-col">
                            <span className="pat-name">{adm.patientName}</span>
                            <span className="pat-mrn">
                              {adm.patientMrn} • {adm.patientAge}y / {adm.patientGender} [{adm.patientBloodGroup}]
                            </span>
                          </div>
                        </td>
                        <td>
                          <div className="ward-bed-col">
                            <span className="ward-tag">{adm.wardCode}</span>
                            <span className="bed-tag">{adm.bedNumber}</span>
                            <span className="room-sub">Room {adm.roomNumber}</span>
                          </div>
                        </td>
                        <td>
                          <div className="doc-col">
                            <span className="doc-name">{adm.doctorName}</span>
                            <span className="doc-spec">{adm.doctorSpecialty}</span>
                          </div>
                        </td>
                        <td>
                          <span className="diag-text">{adm.diagnosis}</span>
                        </td>
                        <td>
                          <span
                            className={`cond-tag cond-${adm.condition.toLowerCase()}`}
                          >
                            {adm.condition}
                          </span>
                        </td>
                        <td>
                          <span className="days-bold">
                            {adm.daysAdmitted} {adm.daysAdmitted === 1 ? "day" : "days"}
                          </span>
                        </td>
                        <td>
                          <div className="row-actions">
                            <button
                              type="button"
                              className="btn-tbl btn-tbl-transfer"
                              onClick={() => {
                                setTargetAdmission(adm);
                                setIsTransferModalOpen(true);
                              }}
                            >
                              Transfer
                            </button>
                            <button
                              type="button"
                              className="btn-tbl btn-tbl-discharge"
                              onClick={() => {
                                setTargetAdmission(adm);
                                setIsDischargeModalOpen(true);
                              }}
                            >
                              Discharge
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 3: WARDS & RATE DIRECTORY ================= */}
        {activeTab === "WardsSummary" && (
          <div className="wards-summary-view">
            <div className="view-intro-banner">
              <div>
                <h3>Hospital Wards & Daily Tariff Directory</h3>
                <p>
                  Ward specifications, capacity, baseline daily accommodation rates, and occupancy breakdowns.
                </p>
              </div>
              <span className="counter-chip">
                {wards.length} Active Wards
              </span>
            </div>

            <div className="wards-grid">
              {wards.map((w) => (
                <div key={w.id} className="ward-overview-card">
                  <div className="ward-card-top">
                    <div>
                      <span className="ward-code-badge">{w.code}</span>
                      <h4 className="ward-title-lg">{w.name}</h4>
                      <span className="ward-flr">{w.floor}</span>
                    </div>
                    <div className="ward-rate-box">
                      <span className="rate-num">${w.dailyRate}</span>
                      <span className="rate-lbl">per day</span>
                    </div>
                  </div>

                  <p className="ward-desc-text">
                    {w.description || "General inpatient accommodation."}
                  </p>

                  <div className="ward-stats-breakdown">
                    <div className="stat-box">
                      <span className="s-lbl">Total Capacity</span>
                      <span className="s-val">{w.totalBeds} Beds</span>
                    </div>
                    <div className="stat-box">
                      <span className="s-lbl">Occupied</span>
                      <span className="s-val text-rose">{w.occupiedBeds}</span>
                    </div>
                    <div className="stat-box">
                      <span className="s-lbl">Available Ready</span>
                      <span className="s-val text-emerald">{w.availableBeds}</span>
                    </div>
                    <div className="stat-box">
                      <span className="s-lbl">Occupancy Rate</span>
                      <span className="s-val text-teal">{w.occupancyRate}%</span>
                    </div>
                  </div>

                  {/* Occupancy Progress Bar */}
                  <div className="ward-progress-track">
                    <div
                      className="ward-progress-fill"
                      style={{ width: `${w.occupancyRate}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 5. Modals */}
      <AdmitPatientModal
        isOpen={isAdmitModalOpen}
        onClose={() => setIsAdmitModalOpen(false)}
        defaultBedId={targetBedId}
      />

      <TransferBedModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        admission={targetAdmission}
      />

      <DischargePatientModal
        isOpen={isDischargeModalOpen}
        onClose={() => setIsDischargeModalOpen(false)}
        admission={targetAdmission}
      />

      <UpdateBedStatusModal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        bed={targetBed}
      />
    </div>
  );
};

export default Beds;
