import { useNavigate, useParams } from "react-router-dom";
import "./PatientDetails.css";

function PatientDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div className="patient-details-page">
      <button
        className="back-button"
        onClick={() => navigate("/patients")}
      >
        ← Back to Patients
      </button>

      <div className="patient-details-header">
        <h1>Patient Details</h1>
        <p>View the patient's information.</p>
      </div>

      <div className="patient-details-card">
        <h2>Patient ID: #{id}</h2>

        <p>
          <strong>Patient ID:</strong> {id}
        </p>

        <p>We will display the complete patient information here.</p>
      </div>
    </div>
  );
}

export default PatientDetails;