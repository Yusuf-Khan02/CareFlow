import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { appointmentService } from "../../services/appointmentService";
import type { Appointment, AppointmentStatus } from "../../types";
import { useToast, ConfirmationDialog } from "../common";
import "./AppointmentActionModal.css";

interface AppointmentActionModalProps {
  isOpen: boolean;
  appointment: Appointment | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export const AppointmentActionModal: React.FC<AppointmentActionModalProps> = ({
  isOpen,
  appointment,
  onClose,
  onSuccess,
}) => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const [isRescheduling, setIsRescheduling] = useState(false);
  const [newDate, setNewDate] = useState<string>("");
  const [newSlot, setNewSlot] = useState<string>("");
  const [isConfirmCancelOpen, setIsConfirmCancelOpen] = useState(false);
  const cancelReason = "Cancelled by clinical staff";

  const todayStr = new Date().toISOString().split("T")[0];

  // Query live slots if rescheduling
  const { data: slotsData, isLoading: isLoadingSlots } = useQuery({
    queryKey: ["doctor-slots", appointment?.doctorId, newDate],
    queryFn: () =>
      appointmentService.getDoctorAvailableSlots(appointment!.doctorId, newDate),
    enabled: isRescheduling && !!appointment && !!newDate,
  });

  // Status Update Mutation
  const statusMutation = useMutation({
    mutationFn: ({ status, notes }: { status: AppointmentStatus; notes?: string }) =>
      appointmentService.updateAppointmentStatus(appointment!.id, status, notes),
    onSuccess: (updated) => {
      showToast(`Appointment status updated to ${updated.status}`, "success");
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      queryClient.invalidateQueries({ queryKey: ["patient", updated.patientId] });
      if (onSuccess) onSuccess();
      onClose();
    },
    onError: (err: any) => {
      showToast(err.message || "Failed to update appointment status", "error");
    },
  });

  // Reschedule Mutation
  const rescheduleMutation = useMutation({
    mutationFn: () =>
      appointmentService.updateAppointment(appointment!.id, {
        date: newDate,
        time: newSlot,
      }),
    onSuccess: (updated) => {
      showToast(
        `Rescheduled to ${updated.date} at ${updated.time} with ${updated.doctorName}`,
        "success"
      );
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      queryClient.invalidateQueries({ queryKey: ["doctor-slots"] });
      setIsRescheduling(false);
      if (onSuccess) onSuccess();
      onClose();
    },
    onError: (err: any) => {
      showToast(err.message || "Failed to reschedule appointment", "error");
    },
  });

  // Cancel Mutation
  const cancelMutation = useMutation({
    mutationFn: () =>
      appointmentService.cancelAppointment(
        appointment!.id,
        cancelReason.trim() || undefined
      ),
    onSuccess: () => {
      showToast("Appointment successfully cancelled", "info");
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      queryClient.invalidateQueries({ queryKey: ["doctor-slots"] });
      setIsConfirmCancelOpen(false);
      if (onSuccess) onSuccess();
      onClose();
    },
    onError: (err: any) => {
      showToast(err.message || "Failed to cancel appointment", "error");
    },
  });

  if (!isOpen || !appointment) return null;

  const handleStartReschedule = () => {
    setNewDate(appointment.date);
    setNewSlot("");
    setIsRescheduling(true);
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status.toLowerCase()) {
      case "scheduled":
        return "status-scheduled";
      case "confirmed":
        return "status-confirmed";
      case "checked-in":
        return "status-checkedin";
      case "in-progress":
        return "status-inprogress";
      case "completed":
        return "status-completed";
      case "cancelled":
        return "status-cancelled";
      default:
        return "status-default";
    }
  };

  return (
    <>
      <div className="modal-backdrop-action" onClick={onClose}>
        <div
          className="modal-content-action"
          onClick={(e) => e.stopPropagation()}
          id="appointment-action-modal"
        >
          {/* Header */}
          <div className="modal-header-action">
            <div>
              <h2 style={{ margin: 0, fontSize: "17.5px", fontWeight: 800 }}>
                Manage Clinical Appointment
              </h2>
              <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                ID: {appointment.id}
              </span>
            </div>
            <button
              type="button"
              className="modal-close-btn"
              onClick={onClose}
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          {/* Body */}
          <div className="modal-body-action">
            {/* Hero Card */}
            <div className="apt-summary-hero">
              <div className="apt-hero-top">
                <div className="apt-patient-title">
                  <h3>{appointment.patientName}</h3>
                  <div className="apt-patient-meta">
                    <span className="apt-mrn-badge">{appointment.patientMrn}</span>
                    <span>•</span>
                    <span>
                      {appointment.patientGender}, {appointment.patientAge} yrs
                    </span>
                    <span>•</span>
                    <span>📞 {appointment.patientPhone}</span>
                  </div>
                </div>

                <span className={`status-pill ${getStatusBadgeClass(appointment.status)}`}>
                  {appointment.status}
                </span>
              </div>

              {/* Detail Grid */}
              <div className="apt-detail-grid">
                <div className="apt-detail-item">
                  <span className="apt-detail-lbl">Physician & Specialty</span>
                  <span className="apt-detail-val">
                    {appointment.doctorName}
                    <small style={{ display: "block", color: "var(--text-secondary)", fontWeight: 500 }}>
                      {appointment.doctorSpecialty}
                    </small>
                  </span>
                </div>

                <div className="apt-detail-item">
                  <span className="apt-detail-lbl">Department & Room</span>
                  <span className="apt-detail-val">
                    {appointment.department}
                    <small style={{ display: "block", color: "var(--text-secondary)", fontWeight: 500 }}>
                      {appointment.doctorRoom || "Consultation Wing"}
                    </small>
                  </span>
                </div>

                <div className="apt-detail-item">
                  <span className="apt-detail-lbl">Scheduled Date & Time</span>
                  <span className="apt-detail-val">
                    📅 {appointment.date} at ⏰ {appointment.time}
                  </span>
                </div>

                <div className="apt-detail-item">
                  <span className="apt-detail-lbl">Encounter Classification</span>
                  <span className="apt-detail-val">🏷️ {appointment.type}</span>
                </div>
              </div>

              {appointment.notes && (
                <div className="apt-notes-box">
                  <strong style={{ fontSize: "11px", textTransform: "uppercase", color: "var(--primary-color)" }}>
                    Clinical Complaint / Booking Notes:
                  </strong>
                  <p>{appointment.notes}</p>
                </div>
              )}
            </div>

            {/* Workflow Progress Actions */}
            <div className="workflow-actions-section">
              <span className="workflow-section-title">
                <span>⚡ Clinical Workflow & Arrival Progress</span>
              </span>

              <div className="workflow-button-group">
                {appointment.status === "Scheduled" && (
                  <button
                    type="button"
                    className="status-flow-btn confirm"
                    onClick={() => statusMutation.mutate({ status: "Confirmed" })}
                    disabled={statusMutation.isPending}
                  >
                    ✓ Confirm Booking
                  </button>
                )}

                {(appointment.status === "Scheduled" || appointment.status === "Confirmed") && (
                  <button
                    type="button"
                    className="status-flow-btn checkin"
                    onClick={() => statusMutation.mutate({ status: "Checked-in" })}
                    disabled={statusMutation.isPending}
                  >
                    🏥 Patient Arrived / Check-in
                  </button>
                )}

                {appointment.status === "Checked-in" && (
                  <button
                    type="button"
                    className="status-flow-btn inconsult"
                    onClick={() => statusMutation.mutate({ status: "In-Progress" })}
                    disabled={statusMutation.isPending}
                  >
                    🩺 Start Consultation
                  </button>
                )}

                {appointment.status === "In-Progress" && (
                  <button
                    type="button"
                    className="status-flow-btn complete"
                    onClick={() => statusMutation.mutate({ status: "Completed" })}
                    disabled={statusMutation.isPending}
                  >
                    ✓ Complete Encounter
                  </button>
                )}

                {appointment.status !== "Completed" && appointment.status !== "Cancelled" && (
                  <>
                    <button
                      type="button"
                      className="status-flow-btn reschedule"
                      onClick={handleStartReschedule}
                    >
                      🔄 Reschedule
                    </button>

                    <button
                      type="button"
                      className="status-flow-btn cancel"
                      onClick={() => setIsConfirmCancelOpen(true)}
                    >
                      ✕ Cancel Booking
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Reschedule Interactive Panel */}
            {isRescheduling && (
              <div className="reschedule-panel">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <strong style={{ fontSize: "13px", color: "var(--text-primary)" }}>
                    Reschedule Appointment with {appointment.doctorName}
                  </strong>
                  <button
                    type="button"
                    style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b" }}
                    onClick={() => setIsRescheduling(false)}
                  >
                    ✕ Close
                  </button>
                </div>

                <div className="reschedule-grid">
                  <div>
                    <label style={{ fontSize: "12px", fontWeight: 700, display: "block", marginBottom: "4px" }}>
                      New Date:
                    </label>
                    <input
                      type="date"
                      className="form-field-input"
                      value={newDate}
                      min={todayStr}
                      onChange={(e) => {
                        setNewDate(e.target.value);
                        setNewSlot("");
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: "12px", fontWeight: 700, display: "block", marginBottom: "4px" }}>
                      Selected Slot:
                    </label>
                    <input
                      type="text"
                      className="form-field-input"
                      value={newSlot || "Select slot below"}
                      readOnly
                    />
                  </div>
                </div>

                {isLoadingSlots ? (
                  <p style={{ fontSize: "12.5px", color: "var(--text-secondary)" }}>
                    Checking physician availability...
                  </p>
                ) : slotsData ? (
                  <div className="slots-grid">
                    {slotsData.slots.map((slot) => (
                      <button
                        key={slot.time}
                        type="button"
                        disabled={!slot.isAvailable}
                        className={`slot-btn ${newSlot === slot.time ? "selected" : ""} ${
                          slot.isBooked ? "booked" : ""
                        }`}
                        onClick={() => setNewSlot(slot.time)}
                      >
                        <span>{slot.time}</span>
                        <span className="slot-status-micro">
                          {newSlot === slot.time
                            ? "✓ Picked"
                            : slot.isBooked
                            ? "Booked"
                            : "Available"}
                        </span>
                      </button>
                    ))}
                  </div>
                ) : null}

                <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "8px" }}>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setIsRescheduling(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn-primary-booking"
                    disabled={!newSlot || rescheduleMutation.isPending}
                    onClick={() => rescheduleMutation.mutate()}
                  >
                    {rescheduleMutation.isPending ? "Updating Slot..." : "Confirm Reschedule"}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="modal-footer-action">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Close Details
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog for Cancellation */}
      <ConfirmationDialog
        isOpen={isConfirmCancelOpen}
        title="Cancel Appointment"
        message={`Are you sure you want to cancel the appointment for ${appointment.patientName} with ${appointment.doctorName} on ${appointment.date} at ${appointment.time}?`}
        confirmText={cancelMutation.isPending ? "Cancelling..." : "Confirm Cancellation"}
        variant="danger"
        onConfirm={() => cancelMutation.mutate()}
        onCancel={() => setIsConfirmCancelOpen(false)}
      />
    </>
  );
};
