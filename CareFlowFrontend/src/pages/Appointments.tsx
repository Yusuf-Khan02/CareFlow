import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { appointmentService } from "../services/appointmentService";
import { doctorService } from "../services/doctorService";
import type { Appointment } from "../types";
import { BookAppointmentModal } from "../components/Appointments/BookAppointmentModal";
import { AppointmentActionModal } from "../components/Appointments/AppointmentActionModal";
import { EmptyState, PageLoader } from "../components/common";
import "./Appointments.css";

export const Appointments = () => {
  const todayStr = useMemo(() => new Date().toISOString().split("T")[0], []);
  const tomorrowStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  }, []);

  // Filter and view state
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("all");
  const [status, setStatus] = useState("all");
  const [datePreset, setDatePreset] = useState<"all" | "today" | "tomorrow" | "custom">("all");
  const [customDate, setCustomDate] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "calendar">("table");

  // Modal states
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [activeAppointment, setActiveAppointment] = useState<Appointment | null>(null);

  // Determine active date query filter
  const activeDateQuery = useMemo(() => {
    if (datePreset === "today") return todayStr;
    if (datePreset === "tomorrow") return tomorrowStr;
    if (datePreset === "custom") return customDate || undefined;
    return undefined;
  }, [datePreset, todayStr, tomorrowStr, customDate]);

  // Query Appointments via TanStack Query
  const {
    data: appointmentsData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: [
      "appointments",
      {
        date: activeDateQuery,
        department: department !== "all" ? department : undefined,
        status: status !== "all" ? status : undefined,
        search: search.trim() || undefined,
      },
    ],
    queryFn: () =>
      appointmentService.getAppointments({
        date: activeDateQuery,
        departmentId: department !== "all" ? department : undefined,
        status: status !== "all" ? status : undefined,
        search: search.trim() || undefined,
        limit: 100,
      }),
  });

  // Query Doctors for department list
  const { data: doctorsData } = useQuery({
    queryKey: ["doctors", "all"],
    queryFn: () => doctorService.getDoctors(),
  });

  const appointments = appointmentsData?.appointments || [];
  const doctors = doctorsData || [];
  const departments = Array.from(new Set(doctors.map((d) => d.department)));

  // KPI Calculations based on current dataset
  const stats = useMemo(() => {
    return {
      total: appointments.length,
      confirmed: appointments.filter((a) => a.status === "Confirmed").length,
      checkedIn: appointments.filter((a) => a.status === "Checked-in").length,
      inConsult: appointments.filter((a) => a.status === "In-Progress").length,
      completed: appointments.filter((a) => a.status === "Completed").length,
      cancelled: appointments.filter((a) => a.status === "Cancelled").length,
    };
  }, [appointments]);

  // Time Band Definitions for Agenda / Calendar View
  const timeBands = [
    { label: "09:00 AM – 10:00 AM", matchHours: ["09:00 AM", "09:30 AM"] },
    { label: "10:00 AM – 11:00 AM", matchHours: ["10:00 AM", "10:30 AM"] },
    { label: "11:00 AM – 12:00 PM", matchHours: ["11:00 AM", "11:30 AM"] },
    { label: "12:00 PM – 02:00 PM", matchHours: ["12:00 PM", "12:30 PM", "01:00 PM", "01:30 PM"] },
    { label: "02:00 PM – 03:00 PM", matchHours: ["02:00 PM", "02:30 PM"] },
    { label: "03:00 PM – 04:00 PM", matchHours: ["03:00 PM", "03:30 PM"] },
    { label: "04:00 PM – 05:00 PM", matchHours: ["04:00 PM", "04:30 PM"] },
  ];

  return (
    <div className="appointments-page" id="page-appointments">
      {/* 1. Page Header */}
      <div className="appointments-header-row">
        <div className="appointments-title-group">
          <h1>
            <span>📅</span>
            <span>Hospital Appointments & Scheduling</span>
          </h1>
          <p className="appointments-subtitle">
            Manage outpatient bookings, monitor patient arrival statuses, and coordinate physician consultation suites.
          </p>
        </div>

        <button
          type="button"
          className="book-apt-btn"
          onClick={() => setIsBookModalOpen(true)}
          id="btn-open-book-modal"
        >
          <span>＋</span>
          <span>Book New Appointment</span>
        </button>
      </div>

      {/* 2. Operational Stats KPI Row */}
      <div className="apt-stats-grid">
        <div className="apt-stat-card">
          <div className="apt-stat-icon total">📋</div>
          <div className="apt-stat-data">
            <span className="apt-stat-number">{stats.total}</span>
            <span className="apt-stat-label">Total Bookings</span>
          </div>
        </div>

        <div className="apt-stat-card">
          <div className="apt-stat-icon confirmed">🟣</div>
          <div className="apt-stat-data">
            <span className="apt-stat-number">{stats.confirmed}</span>
            <span className="apt-stat-label">Confirmed</span>
          </div>
        </div>

        <div className="apt-stat-card">
          <div className="apt-stat-icon checkedin">🟡</div>
          <div className="apt-stat-data">
            <span className="apt-stat-number">{stats.checkedIn}</span>
            <span className="apt-stat-label">Checked-In / Arrived</span>
          </div>
        </div>

        <div className="apt-stat-card">
          <div className="apt-stat-icon inconsult">🩺</div>
          <div className="apt-stat-data">
            <span className="apt-stat-number">{stats.inConsult}</span>
            <span className="apt-stat-label">In Consultation</span>
          </div>
        </div>

        <div className="apt-stat-card">
          <div className="apt-stat-icon completed">🟢</div>
          <div className="apt-stat-data">
            <span className="apt-stat-number">{stats.completed}</span>
            <span className="apt-stat-label">Completed</span>
          </div>
        </div>

        <div className="apt-stat-card">
          <div className="apt-stat-icon cancelled">⚪</div>
          <div className="apt-stat-data">
            <span className="apt-stat-number">{stats.cancelled}</span>
            <span className="apt-stat-label">Cancelled</span>
          </div>
        </div>
      </div>

      {/* 3. Toolbar: Search, Filters & View Toggle */}
      <div className="apt-toolbar-card">
        <div className="apt-toolbar-top">
          {/* Search Box */}
          <div className="apt-search-wrapper">
            <svg
              className="apt-search-icon"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <input
              type="text"
              className="apt-search-input"
              placeholder="Search by patient name, MRN, physician, or department..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              id="input-search-appointments"
            />
          </div>

          {/* View Toggle (List vs Calendar) */}
          <div className="apt-view-toggle">
            <button
              type="button"
              className={`view-toggle-btn ${viewMode === "table" ? "active" : ""}`}
              onClick={() => setViewMode("table")}
            >
              <span>📋</span>
              <span>List Table</span>
            </button>
            <button
              type="button"
              className={`view-toggle-btn ${viewMode === "calendar" ? "active" : ""}`}
              onClick={() => setViewMode("calendar")}
            >
              <span>🗓️</span>
              <span>Day Agenda</span>
            </button>
          </div>
        </div>

        {/* Filters Bottom Bar */}
        <div className="apt-toolbar-bottom">
          <div className="apt-filters-left">
            {/* Department Filter */}
            <select
              className="toolbar-select"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
            >
              <option value="all">All Specialties & Depts</option>
              {departments.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              className="toolbar-select"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Checked-in">Checked-in</option>
              <option value="In-Progress">In-Progress</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>

            {/* Date Preset Pills */}
            <div className="date-presets-group">
              <button
                type="button"
                className={`date-preset-btn ${datePreset === "all" ? "active" : ""}`}
                onClick={() => setDatePreset("all")}
              >
                All Dates
              </button>
              <button
                type="button"
                className={`date-preset-btn ${datePreset === "today" ? "active" : ""}`}
                onClick={() => setDatePreset("today")}
              >
                Today
              </button>
              <button
                type="button"
                className={`date-preset-btn ${datePreset === "tomorrow" ? "active" : ""}`}
                onClick={() => setDatePreset("tomorrow")}
              >
                Tomorrow
              </button>
              <button
                type="button"
                className={`date-preset-btn ${datePreset === "custom" ? "active" : ""}`}
                onClick={() => setDatePreset("custom")}
              >
                Custom
              </button>
            </div>

            {datePreset === "custom" && (
              <input
                type="date"
                className="custom-date-input"
                value={customDate}
                onChange={(e) => setCustomDate(e.target.value)}
              />
            )}
          </div>

          <span style={{ fontSize: "12.5px", color: "var(--text-secondary)", fontWeight: 600 }}>
            Showing <strong>{appointments.length}</strong> appointments
          </span>
        </div>
      </div>

      {/* 4. Main Content Area */}
      {isLoading ? (
        <PageLoader message="Loading appointment bookings from CareFlow database..." />
      ) : appointments.length === 0 ? (
        <EmptyState
          title="No Appointments Found"
          description="There are no appointments matching your current search parameters or date filters."
          actionText="Book New Appointment"
          onAction={() => setIsBookModalOpen(true)}
        />
      ) : viewMode === "table" ? (
        /* TABLE VIEW */
        <div className="apt-table-container">
          <table className="apt-table" id="appointments-data-table">
            <thead>
              <tr>
                <th>Patient Details</th>
                <th>Attending Doctor</th>
                <th>Department</th>
                <th>Date & Slot</th>
                <th>Type</th>
                <th>Workflow Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((apt) => (
                <tr key={apt.id}>
                  {/* Patient Cell */}
                  <td>
                    <div className="patient-cell-profile">
                      <div className="patient-cell-avatar">
                        {apt.patientName.charAt(0)}
                      </div>
                      <div className="patient-cell-info">
                        <span className="patient-cell-name">{apt.patientName}</span>
                        <div className="patient-cell-sub">
                          <span className="mrn-chip">{apt.patientMrn}</span>
                          <span>•</span>
                          <span>
                            {apt.patientGender ? `${apt.patientGender}, ` : ""}
                            {apt.patientAge ? `${apt.patientAge}y` : ""}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Doctor Cell */}
                  <td>
                    <div className="doctor-cell-info">
                      <span className="doctor-cell-name">{apt.doctorName}</span>
                      <span className="doctor-cell-sub">
                        {apt.doctorSpecialty || apt.doctorRoom || "Consultation Wing"}
                      </span>
                    </div>
                  </td>

                  {/* Department Cell */}
                  <td>
                    <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>
                      {apt.department}
                    </span>
                  </td>

                  {/* Date & Time */}
                  <td>
                    <div className="datetime-badge-group">
                      <span className="date-pill">
                        {apt.date === todayStr ? (
                          <strong style={{ color: "var(--primary-color)" }}>Today</strong>
                        ) : (
                          apt.date
                        )}
                      </span>
                      <span className="time-pill">{apt.time}</span>
                    </div>
                  </td>

                  {/* Type */}
                  <td>
                    <span
                      className={`type-pill ${
                        apt.type === "Emergency"
                          ? "type-emergency"
                          : apt.type === "Consultation"
                          ? "type-consultation"
                          : ""
                      }`}
                    >
                      {apt.type}
                    </span>
                  </td>

                  {/* Status */}
                  <td>
                    <span
                      className={`status-pill status-${apt.status.toLowerCase().replace(/\s+/g, "")}`}
                    >
                      <span
                        style={{
                          width: "6px",
                          height: "6px",
                          borderRadius: "50%",
                          backgroundColor: "currentColor",
                        }}
                      />
                      {apt.status}
                    </span>
                  </td>

                  {/* Actions */}
                  <td>
                    <div className="table-actions-cell">
                      <button
                        type="button"
                        className="btn-manage-apt"
                        onClick={() => setActiveAppointment(apt)}
                      >
                        Manage →
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* DAY AGENDA / CALENDAR VIEW */
        <div className="agenda-day-view">
          {timeBands.map((band) => {
            const bandAppointments = appointments.filter((a) =>
              band.matchHours.includes(a.time)
            );

            return (
              <div key={band.label} className="agenda-band-card">
                <div className="agenda-time-column">
                  <span className="agenda-time-title">{band.label.split("–")[0].trim()}</span>
                  <span className="agenda-time-count">
                    {bandAppointments.length} Booked
                  </span>
                </div>

                <div className="agenda-items-container">
                  {bandAppointments.length > 0 ? (
                    bandAppointments.map((apt) => (
                      <div
                        key={apt.id}
                        className="agenda-item-tile"
                        onClick={() => setActiveAppointment(apt)}
                        style={{ cursor: "pointer" }}
                      >
                        <div className="agenda-tile-left">
                          <div className="patient-cell-avatar">
                            {apt.patientName.charAt(0)}
                          </div>
                          <div className="agenda-tile-info">
                            <h4>
                              {apt.patientName}{" "}
                              <span className="mrn-chip">{apt.patientMrn}</span>
                            </h4>
                            <div className="agenda-tile-meta">
                              <span>⏰ <strong>{apt.time}</strong></span>
                              <span>•</span>
                              <span>🩺 {apt.doctorName} ({apt.department})</span>
                              <span>•</span>
                              <span>🏷️ {apt.type}</span>
                            </div>
                          </div>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <span
                            className={`status-pill status-${apt.status
                              .toLowerCase()
                              .replace(/\s+/g, "")}`}
                          >
                            {apt.status}
                          </span>
                          <span style={{ fontSize: "12px", color: "var(--primary-color)", fontWeight: 700 }}>
                            Manage →
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <span className="agenda-empty-band">
                      No consultations scheduled in this time band.
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 5. Booking Modal */}
      <BookAppointmentModal
        isOpen={isBookModalOpen}
        onClose={() => setIsBookModalOpen(false)}
        onSuccess={() => refetch()}
      />

      {/* 6. Action / Manage Modal */}
      <AppointmentActionModal
        isOpen={!!activeAppointment}
        appointment={activeAppointment}
        onClose={() => setActiveAppointment(null)}
        onSuccess={() => refetch()}
      />
    </div>
  );
};

export default Appointments;