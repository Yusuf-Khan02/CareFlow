import StatsGrid from "../components/StatsGrid/StatsGrid";
import PatientVisitsChart from "../components/PatientsVisitsChart/PatientVisitsChart";
import PatientQueue from "../components/PatientsQueue/PatientsQueue";
import AppointmentTable from "../components/Appointments/AppointmentTable";

import "./Dashboard.css";

function Dashboard() {
  return (
    <div className="dashboard">

      <div className="dashboard-header">
        <h1>Good morning, Admin</h1>

        <p>
          Here's what's happening in your hospital today.
        </p>
      </div>

      <StatsGrid />

      <div className="dashboard-middle">

        <PatientVisitsChart />

        <PatientQueue />

      </div>

      <AppointmentTable />

    </div>
  );
}

export default Dashboard;