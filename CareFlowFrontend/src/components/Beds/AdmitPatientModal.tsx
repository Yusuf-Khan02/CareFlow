import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { bedService } from "../../services/bedService";
import { patientService } from "../../services/patientService";
import { doctorService } from "../../services/doctorService";
import { BedDouble, X, AlertCircle } from "../common/Icons";
import { useToast } from "../common";
import type {
  AdmitPatientPayload,
  AdmissionType,
  PatientCondition,
  Patient,
  Doctor,
  AvailableBedOption,
} from "../../types";
import "./AdmitPatientModal.css";

interface AdmitPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultBedId?: string;
  defaultPatientId?: number;
  onSuccess?: () => void;
}

export const AdmitPatientModal: React.FC<AdmitPatientModalProps> = ({
  isOpen,
  onClose,
  defaultBedId,
  defaultPatientId,
  onSuccess,
}) => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const [patientId, setPatientId] = useState<number | "">(defaultPatientId || "");
  const [doctorId, setDoctorId] = useState<number | "">("");
  const [bedId, setBedId] = useState<string>(defaultBedId || "");
  const [admissionType, setAdmissionType] = useState<AdmissionType>("Elective");
  const [diagnosis, setDiagnosis] = useState<string>("");
  const [condition, setCondition] = useState<PatientCondition>("Stable");
  const [notes, setNotes] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string>("");

  // Fetch Patients
  const { data: patientData } = useQuery({
    queryKey: ["patients"],
    queryFn: () => patientService.getPatients(),
    enabled: isOpen,
  });
  const patients: Patient[] = patientData?.patients || [];

  // Fetch Doctors
  const { data: doctors = [] } = useQuery({
    queryKey: ["doctors"],
    queryFn: () => doctorService.getDoctors(),
    enabled: isOpen,
  });

  // Fetch Available Beds
  const { data: availableBeds = [] } = useQuery({
    queryKey: ["availableBeds"],
    queryFn: () => bedService.getAvailableBeds(),
    enabled: isOpen,
  });

  useEffect(() => {
    if (defaultBedId) setBedId(defaultBedId);
    if (defaultPatientId) setPatientId(defaultPatientId);
  }, [defaultBedId, defaultPatientId, isOpen]);

  useEffect(() => {
    if (availableBeds.length > 0 && !bedId) {
      setBedId(availableBeds[0].id);
    }
    if (doctors.length > 0 && !doctorId) {
      setDoctorId(doctors[0].id);
    }
  }, [availableBeds, doctors, bedId, doctorId]);

  const admitMutation = useMutation({
    mutationFn: (payload: AdmitPatientPayload) => bedService.admitPatient(payload),
    onSuccess: (admission) => {
      showToast(
        `Successfully admitted patient to Bed ${admission.bedNumber} (Adm: ${admission.admissionNumber})`,
        "success"
      );
      queryClient.invalidateQueries({ queryKey: ["wardsSummary"] });
      queryClient.invalidateQueries({ queryKey: ["beds"] });
      queryClient.invalidateQueries({ queryKey: ["admissions"] });
      queryClient.invalidateQueries({ queryKey: ["availableBeds"] });
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      if (onSuccess) onSuccess();
      handleClose();
    },
    onError: (err: any) => {
      setErrorMsg(err.message || "Failed to admit patient");
    },
  });

  const handleClose = () => {
    setDiagnosis("");
    setNotes("");
    setErrorMsg("");
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!patientId) {
      setErrorMsg("Please select a patient to admit.");
      return;
    }
    if (!doctorId) {
      setErrorMsg("Please assign a primary admitting physician.");
      return;
    }
    if (!bedId) {
      setErrorMsg("Please select an available inpatient bed.");
      return;
    }
    if (!diagnosis.trim()) {
      setErrorMsg("Admitting clinical diagnosis is required.");
      return;
    }

    const payload: AdmitPatientPayload = {
      patientId: Number(patientId),
      doctorId: Number(doctorId),
      bedId,
      admissionType,
      diagnosis: diagnosis.trim(),
      condition,
      notes: notes.trim() || undefined,
    };

    admitMutation.mutate(payload);
  };

  if (!isOpen) return null;

  const selectedPatient = patients.find((p) => p.id === Number(patientId));
  const selectedBed = availableBeds.find((b) => b.id === bedId);

  return (
    <div className="admit-modal-overlay" onClick={handleClose}>
      <div className="admit-modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="admit-modal-header">
          <div className="header-icon-box admit-icon">
            <BedDouble size={22} color="#0d9488" />
          </div>
          <div>
            <h2 className="admit-modal-title">Inpatient Admission</h2>
            <p className="admit-modal-subtitle">
              Admit clinical patient into verified available hospital bed
            </p>
          </div>
          <button className="admit-close-btn" onClick={handleClose} type="button">
            <X size={18} />
          </button>
        </div>

        {errorMsg && (
          <div className="admit-error-banner">
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="admit-modal-form">
          <div className="form-grid-2">
            {/* Patient Selector */}
            <div className="form-group">
              <label className="form-label">
                Patient <span className="req">*</span>
              </label>
              <select
                className="form-select"
                value={patientId}
                onChange={(e) =>
                  setPatientId(e.target.value === "" ? "" : Number(e.target.value))
                }
                disabled={admitMutation.isPending}
              >
                <option value="">-- Select Patient --</option>
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.mrn}) • {p.age}y / {p.gender} [{p.bloodGroup}]
                  </option>
                ))}
              </select>
              {selectedPatient && (
                <span className="patient-chip-sub">
                  MRN: <strong>{selectedPatient.mrn}</strong> | Blood: <strong>{selectedPatient.bloodGroup}</strong> | Status: <strong>{selectedPatient.status}</strong>
                </span>
              )}
            </div>

            {/* Admitting Physician */}
            <div className="form-group">
              <label className="form-label">
                Admitting Physician <span className="req">*</span>
              </label>
              <select
                className="form-select"
                value={doctorId}
                onChange={(e) =>
                  setDoctorId(e.target.value === "" ? "" : Number(e.target.value))
                }
                disabled={admitMutation.isPending}
              >
                <option value="">-- Select Admitting Doctor --</option>
                {doctors.map((d: Doctor) => (
                  <option key={d.id} value={d.id}>
                    {d.name} — {d.specialty}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-grid-2">
            {/* Available Bed Selector */}
            <div className="form-group">
              <label className="form-label">
                Assigned Bed <span className="req">*</span>
              </label>
              <select
                className="form-select"
                value={bedId}
                onChange={(e) => setBedId(e.target.value)}
                disabled={admitMutation.isPending}
              >
                {availableBeds.length === 0 ? (
                  <option value="" disabled>No available beds ready</option>
                ) : (
                  availableBeds.map((b: AvailableBedOption) => (
                    <option key={b.id} value={b.id}>
                      {b.label} — ${b.dailyRate}/day
                    </option>
                  ))
                )}
              </select>
              {selectedBed && (
                <span className="bed-rate-tag">
                  Ward: <strong>{selectedBed.wardName}</strong> • Daily Rate: <strong>${selectedBed.dailyRate}.00</strong>
                </span>
              )}
            </div>

            {/* Admission Type */}
            <div className="form-group">
              <label className="form-label">Admission Type</label>
              <select
                className="form-select"
                value={admissionType}
                onChange={(e) => setAdmissionType(e.target.value as AdmissionType)}
                disabled={admitMutation.isPending}
              >
                <option value="Emergency">Emergency (Immediate)</option>
                <option value="Elective">Elective (Planned)</option>
                <option value="Urgent">Urgent (Within 24 Hours)</option>
                <option value="Transfer">Inter-Facility Transfer</option>
              </select>
            </div>
          </div>

          <div className="form-grid-2">
            {/* Diagnosis */}
            <div className="form-group">
              <label className="form-label">
                Admitting Diagnosis <span className="req">*</span>
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Acute Myocardial Infarction / Sepsis"
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                disabled={admitMutation.isPending}
              />
            </div>

            {/* Condition */}
            <div className="form-group">
              <label className="form-label">Patient Initial Condition</label>
              <select
                className="form-select"
                value={condition}
                onChange={(e) => setCondition(e.target.value as PatientCondition)}
                disabled={admitMutation.isPending}
              >
                <option value="Stable">Stable</option>
                <option value="Serious">Serious</option>
                <option value="Critical">Critical (Continuous Monitoring)</option>
                <option value="Guarded">Guarded</option>
              </select>
            </div>
          </div>

          {/* Clinical Notes */}
          <div className="form-group">
            <label className="form-label">Admission Notes & Special Orders</label>
            <textarea
              className="form-textarea"
              rows={3}
              placeholder="e.g. Continuous telemetry active, NPO after midnight, fall risk precautions"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={admitMutation.isPending}
            />
          </div>

          {/* Actions */}
          <div className="admit-modal-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={handleClose}
              disabled={admitMutation.isPending}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={admitMutation.isPending || availableBeds.length === 0}
            >
              {admitMutation.isPending ? "Assigning Bed..." : "Confirm Inpatient Admission"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
