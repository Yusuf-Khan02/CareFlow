import "./PatientsQueue.css";

interface Patient {
  id: number;
  name: string;
  doctor: string;
  department: string;
  status: "waiting" | "consultation";
}

const patients: Patient[] = [
  {
    id: 1,
    name: "Abdullah",
    doctor: "Dr. Alok Mishra",
    department: "Gastro",
    status: "waiting",
  },
  {
    id: 2,
    name: "Adil",
    doctor: "Dr. Ruhul Amin",
    department: "Cardio",
    status: "waiting",
  },
  {
    id: 3,
    name: "Amir",
    doctor: "Dr. Vipul Tandon",
    department: "Neuro",
    status: "consultation",
  },
  {
    id: 4,
    name: "Shesh Khan",
    doctor: "Dr. Tuba Khan",
    department: "General Physician",
    status: "consultation",
  },
  {
    id: 5,
    name: "Gayas Ahmad",
    doctor: "Dr. Sameer Bhargava",
    department: "Pediatrician",
    status: "waiting",
  },
  {
    id: 6,
    name: "Yusuf Khan",
    doctor: "Dr. Pankaj Chandra",
    department: "Orthology",
    status: "consultation",
  },
];

const PatientsQueue = () => {
  return (
    <section className="patient-queue">

      <div className="section-header">

        <div>
          <h2>Today's Queue</h2>

          <p>
            Patients currently in today's queue
          </p>
        </div>

        <button className="view-all-button">
          View All
        </button>

      </div>

      <div className="queue-list">

        {patients.map((patient, index) => (

          <div
            className="queue-item"
            key={patient.id}
          >

            <div className="queue-number">
              {index + 1}
            </div>

            <div className="patient-info">

              <h3>
                {patient.name}
              </h3>

              <p>
                {patient.doctor} · {patient.department}
              </p>

            </div>

            <span
              className={`patient-status ${patient.status}`}
            >
              {patient.status === "waiting"
                ? "Waiting"
                : "In Consultation"}
            </span>

          </div>

        ))}

      </div>

    </section>
  );
};

export default PatientsQueue;