import { useNavigate } from "react-router-dom";
import "./PatientTable.css";

interface Patient {
  id: number;
  name: string;
  age: number;
  gender: string;
  phone: string;
  department: string;
  status: "Active" | "Discharged" | "Critical";
}

interface PatientTableProps {
  patients: Patient[];
}

function PatientTable({ patients }: PatientTableProps) {
  const navigate = useNavigate();

  return (
    <div className="patient-table-container">
      <table className="patient-table">
        <thead>
          <tr>
            <th>Patient</th>
            <th>Age</th>
            <th>Gender</th>
            <th>Phone</th>
            <th>Department</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {patients.length === 0 ? (
            <tr>
              <td colSpan={7} className="no-patients">
                <div className="no-patients-content">
                  <div className="no-patients-icon">🔍</div>

                  <h3>No patients found</h3>

                  <p>Try changing your search or filters.</p>
                </div>
              </td>
            </tr>
          ) : (
            patients.map((patient) => (
              <tr key={patient.id}>
                <td>
                  <div className="patient-name">{patient.name}</div>

                  <div className="patient-id">ID: #{patient.id}</div>
                </td>

                <td>{patient.age}</td>

                <td>{patient.gender}</td>

                <td>{patient.phone}</td>

                <td>{patient.department}</td>

                <td>
                  <span
                    className={`patient-table-status ${patient.status.toLowerCase()}`}
                  >
                    {patient.status}
                  </span>
                </td>

                <td>
                  <button
                    type="button"
                    className="view-patient-button"
                    onClick={() => navigate(`/patients/${patient.id}`)}
                  >
                    View
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default PatientTable;