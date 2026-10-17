import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Patient } from "../types";
import { patientService } from "../services";
import { PatientSearch } from "../components/PatientSearch/PatientSearch";
import { PatientTable } from "../components/PatientTable/PatientTable";
import { PatientModal } from "../components/PatientModal/PatientModal";
import { useToast, Spinner, ErrorState, EmptyState } from "../components/common";
import "./Patients.css";

export const Patients = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("");
  const [status, setStatus] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);

  // TanStack Query for Patient List
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["patients", { search, department, status }],
    queryFn: () => patientService.getPatients({ search, department, status }),
  });

  const patients = data?.patients || [];

  // Filtered Patients (safe client-side fallback/re-verification)
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

  // Mutations
  const createMutation = useMutation({
    mutationFn: (newPatientData: Partial<Patient>) =>
      patientService.createPatient(newPatientData),
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      showToast(
        `Registered new patient: ${created.name} (${created.mrn})`,
        "success"
      );
      setIsModalOpen(false);
    },
    onError: (err: any) => {
      showToast(err.message || "Failed to register patient", "error");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Patient> }) =>
      patientService.updatePatient(id, data),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      queryClient.invalidateQueries({ queryKey: ["patient", updated.id] });
      showToast(`Updated record for ${updated.name}`, "success");
      setIsModalOpen(false);
    },
    onError: (err: any) => {
      showToast(err.message || "Failed to update patient", "error");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => patientService.deletePatient(id),
    onSuccess: (_res, id) => {
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      showToast(`Removed patient record #${id}`, "info");
    },
    onError: (err: any) => {
      showToast(err.message || "Failed to delete patient record", "error");
    },
  });

  const handleOpenAddModal = () => {
    setEditingPatient(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (patient: Patient) => {
    setEditingPatient(patient);
    setIsModalOpen(true);
  };

  const handleSavePatient = (patientData: Partial<Patient>) => {
    if (editingPatient) {
      updateMutation.mutate({ id: editingPatient.id, data: patientData });
    } else {
      createMutation.mutate(patientData);
    }
  };

  const handleDeletePatient = (id: number) => {
    deleteMutation.mutate(id);
  };

  return (
    <div className="patients-page" id="patients-management-page">
      {/* Page Header */}
      <div className="patients-header">
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h1 className="patients-title">Patient Directory & Admissions</h1>
            {isFetching && (
              <span
                style={{
                  fontSize: "12px",
                  color: "var(--color-primary)",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                  background: "rgba(14, 165, 233, 0.1)",
                  padding: "2px 8px",
                  borderRadius: "12px",
                }}
              >
                ● Syncing SQL DB...
              </span>
            )}
          </div>
          <p className="patients-subtitle">
            Manage electronic medical records, triage statuses, emergency contacts, and vital histories.
          </p>
        </div>

        <button
          type="button"
          className="add-patient-button"
          onClick={handleOpenAddModal}
          id="btn-register-new-patient"
          disabled={createMutation.isPending}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" x2="12" y1="5" y2="19" />
            <line x1="5" x2="19" y1="12" y2="12" />
          </svg>
          <span>{createMutation.isPending ? "Registering..." : "Register Patient"}</span>
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

      {/* Content Area with Loading, Error, Empty, and Data states */}
      {isLoading ? (
        <div style={{ padding: "60px 0", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
          <Spinner size="lg" color="primary" />
          <p style={{ color: "var(--color-text-secondary)", fontSize: "14px" }}>Connecting to CareFlow Relational SQL Database...</p>
        </div>
      ) : isError ? (
        <ErrorState
          title="Unable to Load Patient Directory"
          message={error?.message || "An unexpected error occurred while communicating with the database."}
          onRetry={() => refetch()}
        />
      ) : filteredPatients.length === 0 ? (
        <EmptyState
          title="No Patients Found"
          description={
            search || department || status
              ? "No medical records match your selected filter criteria. Try adjusting your query or resetting filters."
              : "No patients currently registered in the database."
          }
          actionText={search || department || status ? "Clear Filters" : "Register Patient"}
          onAction={
            search || department || status
              ? () => {
                  setSearch("");
                  setDepartment("");
                  setStatus("");
                }
              : handleOpenAddModal
          }
        />
      ) : (
        <PatientTable
          patients={filteredPatients}
          onEditPatient={handleOpenEditModal}
          onDeletePatient={handleDeletePatient}
        />
      )}

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
