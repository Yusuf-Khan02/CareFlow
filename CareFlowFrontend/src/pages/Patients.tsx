import { useState } from "react";

import PatientSearch from "../components/PatientSearch/PatientSearch";
import PatientTable from "../components/PatientTable/PatientTable";

import "./Patients.css";

export interface Patient {
  id: number;
  name: string;
  age: number;
  gender: string;
  phone: string;
  department: string;
  status: "Active" | "Discharged" | "Critical";
}

const patients: Patient[] = [
  {
    id: 1,
    name: "Rahul Sharma",
    age: 42,
    gender: "Male",
    phone: "9876543210",
    department: "Cardiology",
    status: "Active",
  },
  {
    id: 2,
    name: "Aisha Khan",
    age: 31,
    gender: "Female",
    phone: "9876543211",
    department: "Neurology",
    status: "Active",
  },
  {
    id: 3,
    name: "Arjun Mehta",
    age: 56,
    gender: "Male",
    phone: "9876543212",
    department: "Gastro",
    status: "Critical",
  },
  {
    id: 4,
    name: "Priya Singh",
    age: 28,
    gender: "Female",
    phone: "9876543213",
    department: "Orthology",
    status: "Active",
  },
  {
    id: 5,
    name: "Mohammed Sameer",
    age: 64,
    gender: "Male",
    phone: "9876543214",
    department: "General Physician",
    status: "Discharged",
  },
  {
    id: 6,
    name: "Neha Verma",
    age: 37,
    gender: "Female",
    phone: "9876543215",
    department: "Pediatrics",
    status: "Active",
  },
];

function Patients() {
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("");
  const [status, setStatus] = useState("");

  const filteredPatients = patients.filter((patient) => {
    const matchesSearch = patient.name
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesDepartment =
      department === "" ||
      patient.department.toLowerCase() === department.toLowerCase();

    const matchesStatus =
      status === "" || patient.status.toLowerCase() === status.toLowerCase();

    return matchesSearch && matchesDepartment && matchesStatus;
  });

  return (
    <div className="patients-page">
      <div className="patients-header">
        <div>
          <h1>Patients</h1>

          <p>Manage and view hospital patients.</p>
        </div>

        <button className="add-patient-button">+ Add Patient</button>
      </div>

      <PatientSearch
        search={search}
        setSearch={setSearch}
        department={department}
        setDepartment={setDepartment}
        status={status}
        setStatus={setStatus}
      />

      <PatientTable patients={filteredPatients} />
    </div>
  );
}

export default Patients;
