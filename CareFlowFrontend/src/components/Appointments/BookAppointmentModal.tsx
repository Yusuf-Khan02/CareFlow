import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { patientService } from "../../services/patientService";
import { doctorService } from "../../services/doctorService";
import { appointmentService } from "../../services/appointmentService";
import type { AppointmentType, CreateAppointmentPayload } from "../../types";
import { useToast } from "../common";
import "./BookAppointmentModal.css";

interface BookAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialPatientId?: number;
  initialDoctorId?: number;
}

export const BookAppointmentModal: React.FC<BookAppointmentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialPatientId,
  initialDoctorId,
}) => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const todayStr = new Date().toISOString().split("T")[0];

  const [patientId, setPatientId] = useState<number>(initialPatientId || 0);
  const [department, setDepartment] = useState<string>("");
  const [doctorId, setDoctorId] = useState<number>(initialDoctorId || 0);
  const [date, setDate] = useState<string>(todayStr);
  const [selectedSlot, setSelectedSlot] = useState<string>("");
  const [type, setType] = useState<AppointmentType>("Consultation");
  const [notes, setNotes] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sync initial values
  useEffect(() => {
    if (initialPatientId) setPatientId(initialPatientId);
    if (initialDoctorId) setDoctorId(initialDoctorId);
  }, [initialPatientId, initialDoctorId, isOpen]);

  // Query Patients
  const { data: patientsData } = useQuery({
    queryKey: ["patients", "all"],
    queryFn: () => patientService.getPatients({ limit: 100 }),
    enabled: isOpen,
  });

  // Query Doctors
  const { data: doctorsData } = useQuery({
    queryKey: ["doctors", "all"],
    queryFn: () => doctorService.getDoctors(),
    enabled: isOpen,
  });

  const patients = patientsData?.patients || [];
  const doctors = doctorsData || [];

  // Filtered doctors by department if department selected
  const filteredDoctors = department
    ? doctors.filter(
        (d) => d.department.toLowerCase() === department.toLowerCase()
      )
    : doctors;

  // Handle department change
  const handleDepartmentChange = (dept: string) => {
    setDepartment(dept);
    setSelectedSlot("");
    const docsInDept = doctors.filter(
      (d) => d.department.toLowerCase() === dept.toLowerCase()
    );
    if (docsInDept.length > 0 && !docsInDept.some((d) => d.id === doctorId)) {
      setDoctorId(docsInDept[0].id);
    }
  };

  // Handle doctor change
  const handleDoctorChange = (newDocId: number) => {
    setDoctorId(newDocId);
    setSelectedSlot("");
    const doc = doctors.find((d) => d.id === newDocId);
    if (doc) {
      setDepartment(doc.department);
    }
  };

  // Query Available Slots for the chosen doctor & date
  const { data: slotsData, isLoading: isLoadingSlots } = useQuery({
    queryKey: ["doctor-slots", doctorId, date],
    queryFn: () => appointmentService.getDoctorAvailableSlots(doctorId, date),
    enabled: isOpen && doctorId > 0 && !!date,
  });

  // Set default doctor and patient if not selected
  useEffect(() => {
    if (isOpen && doctors.length > 0 && doctorId === 0) {
      setDoctorId(doctors[0].id);
      setDepartment(doctors[0].department);
    }
    if (isOpen && patients.length > 0 && patientId === 0) {
      setPatientId(patients[0].id);
    }
  }, [isOpen, doctors, patients, doctorId, patientId]);

  // Book Mutation
  const bookMutation = useMutation({
    mutationFn: (payload: CreateAppointmentPayload) =>
      appointmentService.createAppointment(payload),
    onSuccess: (newApt) => {
      showToast(
        `Appointment booked for ${newApt.patientName} with ${newApt.doctorName} at ${newApt.time}!`,
        "success"
      );
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      queryClient.invalidateQueries({ queryKey: ["doctor-slots"] });
      queryClient.invalidateQueries({ queryKey: ["patient", newApt.patientId] });
      setErrorMessage(null);
      if (onSuccess) onSuccess();
      onClose();
    },
    onError: (err: any) => {
      const msg = err.message || "Failed to book appointment. Please try another slot.";
      setErrorMessage(msg);
      showToast(msg, "error");
    },
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!patientId) {
      setErrorMessage("Please select a patient.");
      return;
    }
    if (!doctorId) {
      setErrorMessage("Please select a physician.");
      return;
    }
    if (!date) {
      setErrorMessage("Please select an appointment date.");
      return;
    }
    if (!selectedSlot) {
      setErrorMessage("Please select an available consultation time slot.");
      return;
    }

    const doc = doctors.find((d) => d.id === doctorId);

    bookMutation.mutate({
      patientId,
      doctorId,
      departmentId: doc?.department,
      date,
      time: selectedSlot,
      type,
      notes: notes.trim() || null,
    });
  };

  const departmentsList = Array.from(new Set(doctors.map((d) => d.department)));

  return (
    <div className="modal-backdrop-appointment" onClick={onClose}>
      <div
        className="modal-content-appointment"
        onClick={(e) => e.stopPropagation()}
        id="book-appointment-modal"
      >
        {/* Header */}
        <div className="modal-header-appointment">
          <div className="modal-title-row">
            <div className="modal-title-icon">📅</div>
            <div>
              <h2>Schedule Outpatient Appointment</h2>
              <p className="modal-subtitle">
                Book a consultation with real-time slot checking and double-booking protection.
              </p>
            </div>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="modal-form-appointment">
          {errorMessage && (
            <div className="form-error-alert">
              <span>⚠️</span>
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Patient Selection */}
          <div className="form-field-group">
            <label className="form-field-label">
              <span>Select Patient</span>
              <span className="required-dot">*</span>
            </label>
            <select
              className="form-field-select"
              value={patientId}
              onChange={(e) => {
                setPatientId(Number(e.target.value));
                setErrorMessage(null);
              }}
              required
            >
              <option value={0} disabled>
                -- Choose Patient Record --
              </option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.mrn}) — {p.gender}, {p.age} yrs | {p.phone}
                </option>
              ))}
            </select>
          </div>

          {/* Department & Doctor 2-Column Grid */}
          <div className="form-grid-2col">
            <div className="form-field-group">
              <label className="form-field-label">
                <span>Clinical Department</span>
              </label>
              <select
                className="form-field-select"
                value={department}
                onChange={(e) => handleDepartmentChange(e.target.value)}
              >
                <option value="">All Departments</option>
                {departmentsList.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-field-group">
              <label className="form-field-label">
                <span>Attending Doctor</span>
                <span className="required-dot">*</span>
              </label>
              <select
                className="form-field-select"
                value={doctorId}
                onChange={(e) => handleDoctorChange(Number(e.target.value))}
                required
              >
                <option value={0} disabled>
                  -- Select Physician --
                </option>
                {filteredDoctors.map((doc) => (
                  <option key={doc.id} value={doc.id}>
                    {doc.name} — {doc.specialty} ({doc.status})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Date & Appointment Type */}
          <div className="form-grid-2col">
            <div className="form-field-group">
              <label className="form-field-label">
                <span>Appointment Date</span>
                <span className="required-dot">*</span>
              </label>
              <input
                type="date"
                className="form-field-input"
                value={date}
                min={todayStr}
                onChange={(e) => {
                  setDate(e.target.value);
                  setSelectedSlot("");
                  setErrorMessage(null);
                }}
                required
              />
            </div>

            <div className="form-field-group">
              <label className="form-field-label">
                <span>Encounter Type</span>
              </label>
              <select
                className="form-field-select"
                value={type}
                onChange={(e) => setType(e.target.value as AppointmentType)}
              >
                <option value="Consultation">🩺 New Consultation</option>
                <option value="Follow-up">🔄 Follow-up Visit</option>
                <option value="Routine Checkup">📋 Routine Wellness Check</option>
                <option value="Emergency">🚨 Priority / Emergency</option>
              </select>
            </div>
          </div>

          {/* Interactive Real-Time Slot Selector */}
          <div className="slots-container-box">
            <div className="slots-header-row">
              <span className="slots-summary-label">
                <span>⏰ Available Time Slots</span>
                {slotsData && (
                  <span className="slots-badge-avail">
                    {slotsData.availableSlotsCount} of {slotsData.totalSlots} Slots Free
                  </span>
                )}
              </span>

              {slotsData?.workingHours && (
                <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                  Clinic Hours: <strong>{slotsData.workingHours}</strong>
                </span>
              )}
            </div>

            {isLoadingSlots ? (
              <p style={{ fontSize: "13px", color: "var(--text-secondary)", margin: 0 }}>
                Checking live physician availability...
              </p>
            ) : slotsData && !slotsData.isAvailableDay ? (
              <div className="slot-offduty-alert">
                <span>⚠️</span>
                <span>
                  <strong>{slotsData.doctorName}</strong> is not scheduled on{" "}
                  <strong>{slotsData.day}s</strong>. Please pick another calendar date.
                </span>
              </div>
            ) : slotsData && slotsData.slots.length > 0 ? (
              <div className="slots-grid">
                {slotsData.slots.map((slot) => {
                  const isSelected = selectedSlot === slot.time;
                  return (
                    <button
                      key={slot.time}
                      type="button"
                      disabled={!slot.isAvailable}
                      className={`slot-btn ${isSelected ? "selected" : ""} ${
                        slot.isBooked ? "booked" : ""
                      }`}
                      onClick={() => {
                        setSelectedSlot(slot.time);
                        setErrorMessage(null);
                      }}
                    >
                      <span>{slot.time}</span>
                      <span className="slot-status-micro">
                        {isSelected
                          ? "✓ Selected"
                          : slot.isBooked
                          ? "Booked"
                          : "Available"}
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <p style={{ fontSize: "13px", color: "var(--text-muted)", margin: 0 }}>
                No slots configured for this date.
              </p>
            )}
          </div>

          {/* Clinical Notes / Chief Complaint */}
          <div className="form-field-group">
            <label className="form-field-label">
              <span>Chief Complaint & Clinical Notes (Optional)</span>
            </label>
            <textarea
              className="form-field-textarea"
              placeholder="e.g. Patient complains of recurrent migraines and visual sensitivity for past 2 weeks..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>

          {/* Modal Actions */}
          <div className="modal-footer-appointment">
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
              disabled={bookMutation.isPending}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary-booking"
              disabled={bookMutation.isPending || !selectedSlot}
              id="btn-confirm-booking"
            >
              <span>{bookMutation.isPending ? "Confirming Booking..." : "Book Appointment"}</span>
              {!bookMutation.isPending && <span>→</span>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
