import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import type { Patient } from "../../types";
import { ConfirmationDialog } from "../common";
import "./PatientTable.css";

interface PatientTableProps {
  patients: Patient[];
  onEditPatient?: (patient: Patient) => void;
  onDeletePatient?: (id: number) => void;
}

type SortField = "name" | "age" | "department" | "status" | "id";
type SortOrder = "asc" | "desc";

export const PatientTable = ({
  patients,
  onEditPatient,
  onDeletePatient,
}: PatientTableProps) => {
  const navigate = useNavigate();

  // Sorting State
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Deletion Dialog State
  const [patientToDelete, setPatientToDelete] = useState<Patient | null>(null);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  // Sorted Patients
  const sortedPatients = useMemo(() => {
    const list = [...patients];
    list.sort((a, b) => {
      let valA: string | number = a[sortField];
      let valB: string | number = b[sortField];

      if (typeof valA === "string") {
        const cmp = valA.localeCompare(valB as string);
        return sortOrder === "asc" ? cmp : -cmp;
      }
      return sortOrder === "asc" ? (valA as number) - (valB as number) : (valB as number) - (valA as number);
    });
    return list;
  }, [patients, sortField, sortOrder]);

  // Paginated Patients
  const totalPages = Math.ceil(sortedPatients.length / itemsPerPage) || 1;
  const paginatedPatients = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedPatients.slice(start, start + itemsPerPage);
  }, [sortedPatients, currentPage, itemsPerPage]);

  const confirmDelete = () => {
    if (patientToDelete && onDeletePatient) {
      onDeletePatient(patientToDelete.id);
    }
    setPatientToDelete(null);
  };

  return (
    <div className="patient-table-wrapper" id="patient-table-section">
      <div className="table-responsive-container">
        <table className="patient-table">
          <thead>
            <tr>
              <th onClick={() => handleSort("name")} className="sortable-th">
                <div className="th-content">
                  <span>Patient</span>
                  <span className="sort-arrow">
                    {sortField === "name" ? (sortOrder === "asc" ? "▲" : "▼") : "⇅"}
                  </span>
                </div>
              </th>
              <th onClick={() => handleSort("age")} className="sortable-th">
                <div className="th-content">
                  <span>Age</span>
                  <span className="sort-arrow">
                    {sortField === "age" ? (sortOrder === "asc" ? "▲" : "▼") : "⇅"}
                  </span>
                </div>
              </th>
              <th>Gender</th>
              <th>Phone</th>
              <th onClick={() => handleSort("department")} className="sortable-th">
                <div className="th-content">
                  <span>Department</span>
                  <span className="sort-arrow">
                    {sortField === "department" ? (sortOrder === "asc" ? "▲" : "▼") : "⇅"}
                  </span>
                </div>
              </th>
              <th onClick={() => handleSort("status")} className="sortable-th">
                <div className="th-content">
                  <span>Status</span>
                  <span className="sort-arrow">
                    {sortField === "status" ? (sortOrder === "asc" ? "▲" : "▼") : "⇅"}
                  </span>
                </div>
              </th>
              <th className="th-actions">Actions</th>
            </tr>
          </thead>

          <tbody>
            {paginatedPatients.length === 0 ? (
              <tr>
                <td colSpan={7} className="no-patients-row">
                  <div className="no-patients-box">
                    <span className="no-patients-icon">🔍</span>
                    <h4>No matching patient records</h4>
                    <p>Adjust your search filters or register a new patient to get started.</p>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedPatients.map((patient) => (
                <tr
                  key={patient.id}
                  className="patient-row"
                  onClick={() => navigate(`/patients/${patient.id}`)}
                >
                  <td className="patient-cell-info">
                    <div className="patient-avatar-badge">
                      {patient.name.charAt(0)}
                    </div>
                    <div>
                      <div className="patient-primary-name">{patient.name}</div>
                      <div className="patient-mrn-code">{patient.mrn || `CF-#${patient.id}`}</div>
                    </div>
                  </td>

                  <td className="patient-cell-muted">{patient.age} yrs</td>

                  <td className="patient-cell-muted">{patient.gender}</td>

                  <td className="patient-cell-phone">
                    <span>{patient.phone}</span>
                  </td>

                  <td>
                    <span className="department-tag">{patient.department}</span>
                  </td>

                  <td>
                    <span className={`status-pill status-${patient.status.toLowerCase()}`}>
                      <span className="status-dot" />
                      {patient.status}
                    </span>
                  </td>

                  <td className="cell-actions" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      className="table-btn-action btn-view"
                      title="View Details"
                      onClick={() => navigate(`/patients/${patient.id}`)}
                      aria-label={`View ${patient.name}`}
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                      <span>View</span>
                    </button>

                    {onEditPatient && (
                      <button
                        type="button"
                        className="table-btn-action btn-edit"
                        title="Edit Patient"
                        onClick={() => onEditPatient(patient)}
                        aria-label={`Edit ${patient.name}`}
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                        </svg>
                      </button>
                    )}

                    {onDeletePatient && (
                      <button
                        type="button"
                        className="table-btn-action btn-delete"
                        title="Delete Patient"
                        onClick={() => setPatientToDelete(patient)}
                        aria-label={`Delete ${patient.name}`}
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M3 6h18" />
                          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                        </svg>
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {patients.length > 0 && (
        <div className="table-pagination-footer">
          <div className="pagination-info">
            Showing{" "}
            <strong>
              {Math.min((currentPage - 1) * itemsPerPage + 1, patients.length)}
            </strong>{" "}
            to{" "}
            <strong>
              {Math.min(currentPage * itemsPerPage, patients.length)}
            </strong>{" "}
            of <strong>{patients.length}</strong> patients
          </div>

          <div className="pagination-controls">
            <button
              type="button"
              className="pagination-btn"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            >
              ← Previous
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                type="button"
                className={`pagination-num-btn ${page === currentPage ? "active" : ""}`}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            ))}

            <button
              type="button"
              className="pagination-btn"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            >
              Next →
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={Boolean(patientToDelete)}
        title="Discharge / Remove Patient Record?"
        message={`Are you sure you want to remove synthetic record #${patientToDelete?.id} (${patientToDelete?.name})? This will archive their visit history.`}
        confirmText="Remove Record"
        cancelText="Keep Patient"
        variant="danger"
        onConfirm={confirmDelete}
        onCancel={() => setPatientToDelete(null)}
      />
    </div>
  );
};

export default PatientTable;