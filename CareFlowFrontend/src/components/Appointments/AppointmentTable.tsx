import "./AppointmentTable.css";

interface Appointment {
  id: number;
  patient: string;
  doctor: string;
  department: string;
  time: string;
  status: string;
}

const appointments: Appointment[] = [
  {
    id: 1,
    patient: "Abdullah",
    doctor: "Dr. Alok Mishra",
    department: "Gastro",
    time: "09:30 AM",
    status: "Completed",
  },
  {
    id: 2,
    patient: "Adil",
    doctor: "Dr. Rahul Amin",
    department: "Cardio",
    time: "10:00 AM",
    status: "Waiting",
  },
  {
    id: 3,
    patient: "Yusuf Khan",
    doctor: "Dr. Pankaj Chandra",
    department: "Orthology",
    time: "10:30 AM",
    status: "In Consultation",
  },
  {
    id: 4,
    patient: "Gayas Ahmad",
    doctor: "Dr. Sameer Bhargava",
    department: "Pediatrician",
    time: "11:00 AM",
    status: "Scheduled",
  },
];

function AppointmentTable() {
  return (
    <section className="appointment-table">

      <div className="section-header">
        <div>
          <h2>Today's Appointments</h2>

          <p>
            Overview of today's scheduled appointments
          </p>
        </div>

        <button className="view-all-button">
          View All
        </button>
      </div>

      <div className="table-container">

        <table>

          <thead>
            <tr>
              <th>Patient</th>
              <th>Doctor</th>
              <th>Department</th>
              <th>Time</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>

            {appointments.map((appointment) => (

              <tr key={appointment.id}>

                <td className="patient-name">
                  {appointment.patient}
                </td>

                <td>
                  {appointment.doctor}
                </td>

                <td>
                  {appointment.department}
                </td>

                <td>
                  {appointment.time}
                </td>

                <td>

                  <span
                    className={`appointment-status ${
                      appointment.status
                        .toLowerCase()
                        .replace(" ", "-")
                    }`}
                  >
                    {appointment.status}
                  </span>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </section>
  );
}

export default AppointmentTable;