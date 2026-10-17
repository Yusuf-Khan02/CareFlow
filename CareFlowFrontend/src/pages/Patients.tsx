import { useState, useMemo } from "react";
import type { Patient } from "../types";
import { getStoredPatients, saveStoredPatients } from "../data/mockData";
import { PatientSearch } from "../components/PatientSearch/PatientSearch";
import { PatientTable } from "../components/PatientTable/PatientTable";
import { PatientModal } from "../components/PatientModal/PatientModal";
import { useToast } from "../components/common";
import "./Patients.css";

export const Patients = () => {
  const { showToast } = useToast();

  const [patients, setPatients] = useState<Patient[]>(() => getStoredPatients());
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("");
  const [status, setStatus] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);

  // Filtered Patients
  const filteredPatients = useMemo(() => {
    return patients.filter((patient) => {
      const q = search.toLowerCase();
      const matchesSearch =
        patient.name.toLowerCase().includes(q) ||
        patient.mrn?.toLowerCase().includes(q) ||
        patient.phone.includes(q);

      const matchesDepartment =
        department === "" ||
        patient.department.toLowerCase() === department.toLowerCase();

      const matchesStatus =
        status === "" || patient.status.toLowerCase() === status.toLowerCase();

      return matchesSearch && matchesDepartment && matchesStatus;
    });
  }, [patients, search, department, status]);

  // Operational metrics
  const activeCount = patients.filter((p) => p.status === "Active").length;
  const criticalCount = patients.filter((p) => p.status === "Critical").length;
  const dischargedCount = patients.filter((p) => p.status === "Discharged").length;

  const handleOpenAddModal = () => {
    setEditingPatient(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (patient: Patient) => {
    setEditingPatient(patient);
    setIsModalOpen(true);
  };

  const handleSavePatient = (data: Partial<Patient>) => {
    if (editingPatient) {
      // Update existing patient
      const updatedList = patients.map((p) =>
        p.id === editingPatient.id ? ({ ...p, ...data } as Patient) : p
      );
      setPatients(updatedList);
      saveStoredPatients(updatedList);
      showToast(`Updated record for ${data.name || editingPatient.name}`, "success");
    } else {
      // Create new patient
      const nextId = patients.length > 0 ? Math.max(...patients.map((p) => p.id)) + 1 : 1;
      const formattedMrn = `CF-2026-${String(nextId).padStart(3, "0")}`;

      const newPatient: Patient = {
        id: nextId,
        mrn: formattedMrn,
        name: data.name || "Unknown Patient",
        age: data.age || 30,
        gender: data.gender || "Male",
        phone: data.phone || "",
        email: data.email || "",
        address: data.address || "",
        department: data.department || "General Physician",
        status: data.status || "Active",
        bloodGroup: data.bloodGroup || "O+",
        emergencyContact: data.emergencyContact || {
          name: "Next of Kin",
          relation: "Family",
          phone: data.phone || "",
        },
        allergies: data.allergies || ["None known"],
        vitals: {
          bloodPressure: "120/80 mmHg",
          heartRate: 72,
          temperature: "98.6 °F",
          spO2: 99,
          recordedAt: "Just now",
        },
        admissionDate: new Date().toISOString().split("T")[0],
        doctorAssigned: "Dr. Sarah Jenkins",
        appointments: [],
        visits: [],
      };

      const updatedList = [newPatient, ...patients];
      setPatients(updatedList);
      saveStoredPatients(updatedList);
      showToast(`Registered new patient: ${newPatient.name} (${newPatient.mrn})`, "success");
    }
  };

  const handleDeletePatient = (id: number) => {
    const patientToDelete = patients.find((p) => p.id === id);
    const updatedList = patients.filter((p) => p.id !== id);
    setPatients(updatedList);
    saveStoredPatients(updatedList);
    showToast(`Removed patient record #${id} (${patientToDelete?.name})`, "info");
  };

  return (
    <div className="patients-page" id="patients-management-page">
      {/* Page Header */}
      <div className="patients-header">
        <div>
          <h1 className="patients-title">Patient Directory & Admissions</h1>
          <p className="patients-subtitle">
            Manage electronic medical records, triage statuses, emergency contacts, and vital histories.
          </p>
        </div>

        <button
          type="button"
          className="add-patient-button"
          onClick={handleOpenAddModal}
          id="btn-register-new-patient"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" x2="12" y1="5" y2="19" />
            <line x1="5" x2="19" y1="12" y2="12" />
          </svg>
          <span>Register Patient</span>
        </button>
      </div>

      {/* Patient Stats Overview Cards */}
      <div className="patient-stats-bar">
        <div className="patient-stat-card">
          <span className="p-stat-label">TOTAL REGISTERED</span>
          <span className="p-stat-value">{patients.length}</span>
          <span className="p-stat-sub">Synthetic Patients</span>
        </div>
        <div className="patient-stat-card card-active">
          <span className="p-stat-label">ACTIVE ADMISSIONS</span>
          <span className="p-stat-value">{activeCount}</span>
          <span className="p-stat-sub">In-clinic care</span>
        </div>
        <div className="patient-stat-card card-critical">
          <span className="p-stat-label">CRITICAL TRIAGE</span>
          <span className="p-stat-value">{criticalCount}</span>
          <span className="p-stat-sub">Needs priority review</span>
        </div>
        <div className="patient-stat-card card-discharged">
          <span className="p-stat-label">DISCHARGED</span>
          <span className="p-stat-value">{dischargedCount}</span>
          <span className="p-stat-sub">Completed treatment</span>
        </div>
      </div>

      {/* Patient Search & Filter Controls */}
      <PatientSearch
        search={search}
        setSearch={setSearch}
        department={department}
        setDepartment={setDepartment}
        status={status}
        setStatus={setStatus}
        totalResults={filteredPatients.length}
        onResetFilters={() => {
          setSearch("");
          setDepartment("");
          setStatus("");
        }}
      />

      {/* Patient Data Table */}
      <PatientTable
        patients={filteredPatients}
        onEditPatient={handleOpenEditModal}
        onDeletePatient={handleDeletePatient}
      />

      {/* Register / Edit Patient Modal */}
      <PatientModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSavePatient}
        initialData={editingPatient}
      />
    </div>
  );
};

export default Patients;
