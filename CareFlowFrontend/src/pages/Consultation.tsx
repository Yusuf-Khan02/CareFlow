import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Stethoscope,
  FileCheck2,
  Plus,
  Trash2,
  Printer,
  Search,
  AlertCircle,
  RotateCcw,
  Activity,
  Heart,
  Thermometer,
  Wind,
  Weight,
  Sparkles,
} from "../components/common/Icons";
import { encounterService } from "../services/encounterService";
import { patientService } from "../services/patientService";
import { doctorService } from "../services/doctorService";
import { PrescriptionSlipModal } from "../components/Consultation/PrescriptionSlipModal";
import { useToast, EmptyState, PageLoader } from "../components/common";
import type {
  Consultation,
  PrescriptionItemInput,
  Patient,
  Doctor,
} from "../types";
import "./Consultation.css";

interface PrescriptionRow extends PrescriptionItemInput {
  tempId: string;
}

const COMMON_CHIEF_COMPLAINTS = [
  "Persistent dry cough (4 days)",
  "High fever & body chills",
  "Severe throbbing headache",
  "Sore throat & painful swallowing",
  "Sharp epigastric burning pain",
  "Dizziness on standing",
  "Joint swelling & morning stiffness",
];

const COMMON_DIAGNOSES = [
  "Acute Bronchitis (J20.9)",
  "Upper Respiratory Infection (J06.9)",
  "Essential Hypertension (I10)",
  "Type 2 Diabetes Mellitus (E11.9)",
  "Gastroesophageal Reflux (K21.9)",
  "Acute Gastroenteritis (A09)",
  "Migraine Headache (G43.9)",
];

const QUICK_MED_PRESETS: {
  name: string;
  dosage: string;
  route: string;
  frequency: string;
  duration: string;
  instructions: string;
}[] = [
  {
    name: "Amoxicillin 500mg",
    dosage: "1 Capsule",
    route: "Oral",
    frequency: "1-0-1 (Twice daily)",
    duration: "5 Days",
    instructions: "Take after food with full glass of water",
  },
  {
    name: "Paracetamol 650mg",
    dosage: "1 Tablet",
    route: "Oral",
    frequency: "1-1-1 (Every 8 hrs SOS)",
    duration: "3 Days",
    instructions: "Take as needed for temperature > 100°F",
  },
  {
    name: "Pantoprazole 40mg",
    dosage: "1 Tablet",
    route: "Oral",
    frequency: "1-0-0 (Morning)",
    duration: "14 Days",
    instructions: "Take 30 mins before breakfast on empty stomach",
  },
  {
    name: "Cetirizine 10mg",
    dosage: "1 Tablet",
    route: "Oral",
    frequency: "0-0-1 (At bedtime)",
    duration: "5 Days",
    instructions: "May cause drowsiness; avoid driving",
  },
  {
    name: "Metformin 500mg",
    dosage: "1 Tablet",
    route: "Oral",
    frequency: "1-0-1 (With meals)",
    duration: "30 Days",
    instructions: "Monitor blood glucose levels regularly",
  },
];

export const ConsultationPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const paramPatientId = searchParams.get("patientId")
    ? Number(searchParams.get("patientId"))
    : null;
  const paramDoctorId = searchParams.get("doctorId")
    ? Number(searchParams.get("doctorId"))
    : null;
  const paramAppointmentId = searchParams.get("appointmentId") || null;

  // Selected State
  const [selectedPatientId, setSelectedPatientId] = useState<number | "">(
    paramPatientId || ""
  );
  const [selectedDoctorId, setSelectedDoctorId] = useState<number | "">(
    paramDoctorId || ""
  );

  // SOAP State
  const [chiefComplaint, setChiefComplaint] = useState<string>("");
  const [diagnosis, setDiagnosis] = useState<string>("");
  const [treatment, setTreatment] = useState<string>("");
  const [clinicalNotes, setClinicalNotes] = useState<string>("");

  // Prescriptions List
  const [prescriptionRows, setPrescriptionRows] = useState<PrescriptionRow[]>([
    {
      tempId: "row-1",
      medicationName: "Amoxicillin 500mg",
      dosage: "1 Capsule",
      route: "Oral",
      frequency: "1-0-1",
      duration: "5 Days",
      instructions: "Take after food",
    },
  ]);

  // Modal State for Printing Rx
  const [activeSlipConsultation, setActiveSlipConsultation] =
    useState<Consultation | null>(null);
  const [isSlipOpen, setIsSlipOpen] = useState(false);

  // History Panel Search
  const [historySearch, setHistorySearch] = useState("");

  // Fetch Patients
  const { data: patientData } = useQuery({
    queryKey: ["patients"],
    queryFn: () => patientService.getPatients(),
  });
  const patients: Patient[] = patientData?.patients || [];

  // Fetch Doctors
  const { data: doctors = [] } = useQuery({
    queryKey: ["doctors"],
    queryFn: () => doctorService.getDoctors(),
  });

  // Set default doctor if none selected
  useEffect(() => {
    if (!selectedDoctorId && doctors.length > 0) {
      setSelectedDoctorId(doctors[0].id);
    }
  }, [doctors, selectedDoctorId]);

  // Auto-fill patient if query param changes
  useEffect(() => {
    if (paramPatientId) {
      setSelectedPatientId(paramPatientId);
    }
  }, [paramPatientId]);

  // Fetch Consultations History
  const {
    data: consultationData,
    isLoading: isLoadingHistory,
    refetch: refetchConsultations,
  } = useQuery({
    queryKey: ["consultations"],
    queryFn: () => encounterService.getConsultations({ limit: 50 }),
  });

  const consultationsList = consultationData?.consultations || [];

  // Active Patient details
  const activePatient = useMemo(() => {
    if (!selectedPatientId) return null;
    return patients.find((p: Patient) => p.id === Number(selectedPatientId)) || null;
  }, [patients, selectedPatientId]);

  // Active Doctor details
  const activeDoctor = useMemo(() => {
    if (!selectedDoctorId) return null;
    return doctors.find((d: Doctor) => d.id === Number(selectedDoctorId)) || null;
  }, [doctors, selectedDoctorId]);

  // Add prescription row
  const addPrescriptionRow = (preset?: typeof QUICK_MED_PRESETS[0]) => {
    setPrescriptionRows((prev) => [
      ...prev,
      {
        tempId: `row-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        medicationName: preset?.name || "",
        dosage: preset?.dosage || "1 Tablet",
        route: preset?.route || "Oral",
        frequency: preset?.frequency || "1-0-1",
        duration: preset?.duration || "5 Days",
        instructions: preset?.instructions || "Take after meals",
      },
    ]);
  };

  // Remove prescription row
  const removePrescriptionRow = (tempId: string) => {
    setPrescriptionRows((prev) => prev.filter((r) => r.tempId !== tempId));
  };

  // Update prescription field
  const updatePrescriptionField = (
    tempId: string,
    field: keyof PrescriptionItemInput,
    value: string
  ) => {
    setPrescriptionRows((prev) =>
      prev.map((r) => (r.tempId === tempId ? { ...r, [field]: value } : r))
    );
  };

  // Clear workspace form
  const handleResetForm = () => {
    setChiefComplaint("");
    setDiagnosis("");
    setTreatment("");
    setClinicalNotes("");
    setPrescriptionRows([]);
  };

  // Create Consultation Mutation
  const createConsultationMutation = useMutation({
    mutationFn: encounterService.createConsultation,
    onSuccess: (newConsultation) => {
      showToast("Clinical consultation encounter signed and saved successfully!", "success");
      queryClient.invalidateQueries({ queryKey: ["consultations"] });
      queryClient.invalidateQueries({ queryKey: ["queue"] });
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      refetchConsultations();

      // Open print slip immediately
      setActiveSlipConsultation(newConsultation);
      setIsSlipOpen(true);
      handleResetForm();
    },
    onError: (err: any) => {
      showToast(err.message || "Failed to record consultation.", "error");
    },
  });

  // Handle Submit & Sign
  const handleSignEncounter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId) {
      showToast("Please select a patient to consult.", "error");
      return;
    }
    if (!selectedDoctorId) {
      showToast("Please assign a consulting physician.", "error");
      return;
    }
    if (!chiefComplaint.trim()) {
      showToast("Chief complaint is required for clinical encounter.", "error");
      return;
    }
    if (!diagnosis.trim()) {
      showToast("Clinical diagnosis is required.", "error");
      return;
    }

    const cleanedPrescriptions: PrescriptionItemInput[] = prescriptionRows
      .filter((rx) => rx.medicationName.trim() !== "")
      .map((rx) => ({
        medicationName: rx.medicationName.trim(),
        dosage: rx.dosage.trim() || "1 Tablet",
        route: rx.route?.trim() || "Oral",
        frequency: rx.frequency.trim() || "1-0-1",
        duration: rx.duration.trim() || "5 Days",
        instructions: rx.instructions?.trim() || "",
      }));

    createConsultationMutation.mutate({
      patientId: Number(selectedPatientId),
      doctorId: Number(selectedDoctorId),
      appointmentId: paramAppointmentId,
      chiefComplaint: chiefComplaint.trim(),
      diagnosis: diagnosis.trim(),
      treatment: treatment.trim(),
      clinicalNotes: clinicalNotes.trim(),
      prescriptions: cleanedPrescriptions,
    });
  };

  // Filtered History
  const filteredHistory = useMemo(() => {
    if (!historySearch.trim()) return consultationsList;
    const q = historySearch.toLowerCase();
    return consultationsList.filter(
      (c) =>
        c.patientName.toLowerCase().includes(q) ||
        c.patientMrn.toLowerCase().includes(q) ||
        c.diagnosis.toLowerCase().includes(q) ||
        c.doctorName.toLowerCase().includes(q)
    );
  }, [consultationsList, historySearch]);

  return (
    <div className="consultation-container">
      {/* Top Header */}
      <div className="consultation-header">
        <div className="consultation-title-group">
          <h1>
            <Stethoscope size={24} color="#0f766e" />
            <span>Consultation & EMR Workspace</span>
          </h1>
          <p>
            Conduct clinical encounters, record SOAP notes, and issue digital prescriptions.
          </p>
        </div>

        <div className="consultation-header-actions">
          {activeDoctor && (
            <div className="doctor-context-badge">
              <div className="doctor-badge-avatar">
                {activeDoctor.name.replace("Dr. ", "").charAt(0)}
              </div>
              <div className="doctor-badge-info">
                <span className="doctor-badge-name">{activeDoctor.name}</span>
                <span className="doctor-badge-role">
                  {activeDoctor.specialty} • {activeDoctor.room}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main 2-Column Grid */}
      <div className="consultation-grid">
        {/* Left Column: Clinical Encounter Workspace */}
        <form onSubmit={handleSignEncounter} className="consultation-main-form">
          {/* Card 1: Patient Selection & Clinical Vitals Banner */}
          <div className="consult-card">
            <div className="consult-card-header">
              <div className="consult-card-title">
                <Activity size={18} color="#0f766e" />
                <span>Patient Selection & Triage Summary</span>
              </div>
              {paramAppointmentId && (
                <span className="soap-label-badge">
                  Linked to Appt #{paramAppointmentId}
                </span>
              )}
            </div>

            <div className="consult-card-body">
              <div className="patient-select-row">
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      color: "#475569",
                      marginBottom: "0.35rem",
                      textTransform: "uppercase",
                    }}
                  >
                    Select Patient:
                  </label>
                  <select
                    className="soap-input"
                    value={selectedPatientId}
                    onChange={(e) =>
                      setSelectedPatientId(e.target.value ? Number(e.target.value) : "")
                    }
                    required
                    id="select-patient-input"
                  >
                    <option value="">-- Choose Patient for Encounter --</option>
                    {patients.map((p: Patient) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.mrn}) — {p.age}y, {p.gender}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      color: "#475569",
                      marginBottom: "0.35rem",
                      textTransform: "uppercase",
                    }}
                  >
                    Consulting Doctor:
                  </label>
                  <select
                    className="soap-input"
                    value={selectedDoctorId}
                    onChange={(e) =>
                      setSelectedDoctorId(e.target.value ? Number(e.target.value) : "")
                    }
                    required
                    id="select-doctor-input"
                  >
                    {doctors.map((d: Doctor) => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.specialty})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Patient Live Clinical Strip */}
              {activePatient ? (
                <div className="patient-info-strip">
                  <div className="patient-info-strip-header">
                    <div className="patient-strip-name">
                      <span>{activePatient.name}</span>
                      <span className="vital-pill-highlight">MRN: {activePatient.mrn}</span>
                    </div>
                    <div className="patient-strip-meta">
                      <span>
                        Age: <strong>{activePatient.age} Yrs</strong>
                      </span>
                      <span>•</span>
                      <span>
                        Gender: <strong>{activePatient.gender}</strong>
                      </span>
                      <span>•</span>
                      <span>
                        Blood: <strong>{activePatient.bloodGroup || "O+"}</strong>
                      </span>
                      <span>•</span>
                      <span>Phone: {activePatient.phone}</span>
                    </div>
                  </div>

                  {/* Allergies Warning */}
                  {activePatient.allergies && activePatient.allergies.length > 0 && (
                    <div style={{ marginTop: "0.35rem" }}>
                      <span className="allergy-alert-pill">
                        <AlertCircle size={13} style={{ display: "inline", marginRight: "4px" }} />
                        Allergies:{" "}
                        {Array.isArray(activePatient.allergies)
                          ? activePatient.allergies.join(", ")
                          : String(activePatient.allergies)}
                      </span>
                    </div>
                  )}

                  {/* Vitals Summary Pill Strip */}
                  <div className="patient-strip-vitals">
                    <span className="vital-pill">
                      <Heart size={13} color="#ef4444" />
                      Pulse: <strong>{activePatient.vitals?.heartRate || 72} bpm</strong>
                    </span>
                    <span className="vital-pill">
                      <Activity size={13} color="#0f766e" />
                      BP: <strong>{activePatient.vitals?.bloodPressure || "120/80"} mmHg</strong>
                    </span>
                    <span className="vital-pill">
                      <Thermometer size={13} color="#f59e0b" />
                      Temp: <strong>{activePatient.vitals?.temperature || "98.6"} °F</strong>
                    </span>
                    <span className="vital-pill">
                      <Wind size={13} color="#0284c7" />
                      SpO2: <strong>{activePatient.vitals?.spO2 || 98}%</strong>
                    </span>
                    <span className="vital-pill">
                      <Weight size={13} color="#64748b" />
                      Weight: <strong>{activePatient.vitals?.weight || 68} kg</strong>
                    </span>
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    padding: "0.875rem",
                    background: "#f8fafc",
                    border: "1px dashed #cbd5e1",
                    borderRadius: "8px",
                    color: "#64748b",
                    fontSize: "0.8125rem",
                    textAlign: "center",
                  }}
                >
                  Select a patient above to load medical history and current vitals.
                </div>
              )}
            </div>
          </div>

          {/* Card 2: SOAP Clinical Evaluation */}
          <div className="consult-card">
            <div className="consult-card-header">
              <div className="consult-card-title">
                <FileCheck2 size={18} color="#0f766e" />
                <span>SOAP Clinical Evaluation & Diagnosis</span>
              </div>
              <span className="soap-label-badge">Standard EMR Format</span>
            </div>

            <div className="consult-card-body">
              <div className="soap-grid">
                {/* Subjective */}
                <div className="soap-field-group">
                  <label className="soap-label">
                    <span>(S) Chief Complaint & Symptoms</span>
                    <span className="soap-label-badge">Subjective</span>
                  </label>
                  <textarea
                    className="soap-textarea"
                    placeholder="Patient states symptoms, duration, onset..."
                    value={chiefComplaint}
                    onChange={(e) => setChiefComplaint(e.target.value)}
                    required
                    id="chief-complaint-input"
                  />
                  <div className="quick-tags-container">
                    {COMMON_CHIEF_COMPLAINTS.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        className="quick-tag-chip"
                        onClick={() =>
                          setChiefComplaint((prev) => (prev ? `${prev}, ${tag}` : tag))
                        }
                      >
                        + {tag}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Objective / Examination */}
                <div className="soap-field-group">
                  <label className="soap-label">
                    <span>(O) Clinical Exam & Notes</span>
                    <span className="soap-label-badge">Objective</span>
                  </label>
                  <textarea
                    className="soap-textarea"
                    placeholder="General appearance, chest auscultation, throat erythema, abdomen soft..."
                    value={clinicalNotes}
                    onChange={(e) => setClinicalNotes(e.target.value)}
                    id="clinical-notes-input"
                  />
                </div>

                {/* Assessment / Diagnosis */}
                <div className="soap-field-group">
                  <label className="soap-label">
                    <span>(A) Clinical Diagnosis / Impression</span>
                    <span className="soap-label-badge">Assessment</span>
                  </label>
                  <input
                    type="text"
                    className="soap-input"
                    placeholder="e.g. Acute Bronchitis (J20.9)"
                    value={diagnosis}
                    onChange={(e) => setDiagnosis(e.target.value)}
                    required
                    id="diagnosis-input"
                  />
                  <div className="quick-tags-container">
                    {COMMON_DIAGNOSES.map((diag) => (
                      <button
                        key={diag}
                        type="button"
                        className="quick-tag-chip"
                        onClick={() => setDiagnosis(diag)}
                      >
                        {diag}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Plan / Treatment */}
                <div className="soap-field-group">
                  <label className="soap-label">
                    <span>(P) Plan & Patient Advice</span>
                    <span className="soap-label-badge">Plan</span>
                  </label>
                  <textarea
                    className="soap-textarea"
                    placeholder="Dietary changes, rest, hydration, return precautions..."
                    value={treatment}
                    onChange={(e) => setTreatment(e.target.value)}
                    id="treatment-plan-input"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Interactive Prescription Pad (℞) */}
          <div className="consult-card">
            <div className="consult-card-header">
              <div className="consult-card-title">
                <span style={{ fontSize: "1.25rem", fontFamily: "Georgia, serif", color: "#0f766e" }}>
                  ℞
                </span>
                <span>Prescription Pad & Medication Regimen</span>
              </div>
              <div className="rx-pad-header">
                <div className="rx-presets-list">
                  <span style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 600 }}>
                    <Sparkles size={13} style={{ display: "inline", marginRight: "3px" }} />
                    Quick Add:
                  </span>
                  {QUICK_MED_PRESETS.map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      className="rx-preset-chip"
                      onClick={() => addPrescriptionRow(preset)}
                    >
                      + {preset.name.split(" ")[0]}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="consult-card-body">
              {prescriptionRows.length === 0 ? (
                <div
                  style={{
                    padding: "1.5rem",
                    textAlign: "center",
                    border: "1px dashed #cbd5e1",
                    borderRadius: "8px",
                    color: "#64748b",
                  }}
                >
                  <p style={{ margin: "0 0 0.5rem 0", fontSize: "0.875rem" }}>
                    No pharmacological medications added to this prescription yet.
                  </p>
                  <button
                    type="button"
                    className="rx-add-row-btn"
                    onClick={() => addPrescriptionRow()}
                  >
                    <Plus size={15} /> Add First Drug
                  </button>
                </div>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table className="rx-items-table">
                    <thead>
                      <tr>
                        <th style={{ width: "28%" }}>Medication Name</th>
                        <th style={{ width: "14%" }}>Dosage</th>
                        <th style={{ width: "12%" }}>Route</th>
                        <th style={{ width: "16%" }}>Frequency</th>
                        <th style={{ width: "12%" }}>Duration</th>
                        <th style={{ width: "14%" }}>Instructions</th>
                        <th style={{ width: "4%" }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {prescriptionRows.map((rx) => (
                        <tr key={rx.tempId}>
                          <td>
                            <input
                              type="text"
                              className="rx-table-input"
                              placeholder="e.g. Amoxicillin 500mg"
                              value={rx.medicationName}
                              onChange={(e) =>
                                updatePrescriptionField(rx.tempId, "medicationName", e.target.value)
                              }
                              required
                            />
                          </td>
                          <td>
                            <input
                              type="text"
                              className="rx-table-input"
                              placeholder="e.g. 1 Tablet"
                              value={rx.dosage}
                              onChange={(e) =>
                                updatePrescriptionField(rx.tempId, "dosage", e.target.value)
                              }
                            />
                          </td>
                          <td>
                            <select
                              className="rx-table-select"
                              value={rx.route || "Oral"}
                              onChange={(e) =>
                                updatePrescriptionField(rx.tempId, "route", e.target.value)
                              }
                            >
                              <option value="Oral">Oral</option>
                              <option value="IV">IV</option>
                              <option value="IM">IM</option>
                              <option value="Topical">Topical</option>
                              <option value="Inhalation">Inhalation</option>
                              <option value="Sublingual">Sublingual</option>
                              <option value="Ophthalmic">Ophthalmic</option>
                            </select>
                          </td>
                          <td>
                            <input
                              type="text"
                              className="rx-table-input"
                              placeholder="e.g. 1-0-1"
                              value={rx.frequency}
                              onChange={(e) =>
                                updatePrescriptionField(rx.tempId, "frequency", e.target.value)
                              }
                            />
                          </td>
                          <td>
                            <input
                              type="text"
                              className="rx-table-input"
                              placeholder="e.g. 5 Days"
                              value={rx.duration}
                              onChange={(e) =>
                                updatePrescriptionField(rx.tempId, "duration", e.target.value)
                              }
                            />
                          </td>
                          <td>
                            <input
                              type="text"
                              className="rx-table-input"
                              placeholder="e.g. After meals"
                              value={rx.instructions || ""}
                              onChange={(e) =>
                                updatePrescriptionField(rx.tempId, "instructions", e.target.value)
                              }
                            />
                          </td>
                          <td style={{ textAlign: "center" }}>
                            <button
                              type="button"
                              className="rx-del-btn"
                              title="Delete Row"
                              onClick={() => removePrescriptionRow(rx.tempId)}
                            >
                              <Trash2 size={15} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <button
                    type="button"
                    className="rx-add-row-btn"
                    onClick={() => addPrescriptionRow()}
                    id="add-medication-row-btn"
                  >
                    <Plus size={15} /> Add Another Medication
                  </button>
                </div>
              )}

              {/* Bottom Actions */}
              <div className="consult-action-bar">
                <button
                  type="button"
                  className="rx-btn rx-btn-secondary"
                  onClick={handleResetForm}
                >
                  <RotateCcw size={15} /> Reset Form
                </button>

                <button
                  type="submit"
                  className="btn-sign-encounter"
                  disabled={createConsultationMutation.isPending}
                  id="sign-consultation-btn"
                >
                  <FileCheck2 size={16} />
                  <span>
                    {createConsultationMutation.isPending
                      ? "Signing & Authorizing..."
                      : "Sign & Issue Prescription"}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </form>

        {/* Right Column: Recent Consultations & Rx Archive */}
        <div className="history-panel-card">
          <div className="consult-card-header">
            <div className="consult-card-title">
              <Printer size={16} color="#0f766e" />
              <span>Consultation Archive</span>
            </div>
            <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#0f766e" }}>
              {filteredHistory.length} Encounters
            </span>
          </div>

          <div style={{ padding: "0.75rem 1rem", borderBottom: "1px solid #f1f5f9" }}>
            <div style={{ position: "relative" }}>
              <Search
                size={14}
                color="#94a3b8"
                style={{ position: "absolute", left: "0.75rem", top: "0.65rem" }}
              />
              <input
                type="text"
                className="history-search-input"
                placeholder="Search patient, MRN, diagnosis..."
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
                id="search-history-input"
              />
            </div>
          </div>

          {isLoadingHistory ? (
            <div style={{ padding: "2rem" }}>
              <PageLoader message="Loading consultation encounters..." />
            </div>
          ) : filteredHistory.length === 0 ? (
            <div style={{ padding: "1.5rem" }}>
              <EmptyState
                title="No Encounters Found"
                description="Consultations recorded will appear here with instant Rx reprinting."
              />
            </div>
          ) : (
            <div className="history-list">
              {filteredHistory.map((item) => (
                <div key={item.id} className="history-item">
                  <div className="history-item-top">
                    <span className="history-patient-name">{item.patientName}</span>
                    <span className="history-date">
                      {new Date(item.date || item.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div>
                    <span className="history-diag-badge">{item.diagnosis}</span>
                  </div>
                  <div className="history-notes-snippet">
                    <strong>Complaint:</strong> {item.chiefComplaint}
                  </div>
                  <div className="history-item-actions">
                    <span className="history-rx-count">
                      ℞ {item.prescriptions ? item.prescriptions.length : 0} Meds Prescribed
                    </span>
                    <button
                      type="button"
                      className="btn-view-slip"
                      onClick={() => {
                        setActiveSlipConsultation(item);
                        setIsSlipOpen(true);
                      }}
                      id={`view-rx-slip-${item.id}`}
                    >
                      <Printer size={13} />
                      <span>Print Slip</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Printable Prescription Slip Modal */}
      <PrescriptionSlipModal
        consultation={activeSlipConsultation}
        isOpen={isSlipOpen}
        onClose={() => setIsSlipOpen(false)}
      />
    </div>
  );
};

export default ConsultationPage;
