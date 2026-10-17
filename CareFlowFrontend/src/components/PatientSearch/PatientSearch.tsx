import "./PatientSearch.css";

interface PatientSearchProps {
  search: string;
  setSearch: (value: string) => void;

  department: string;
  setDepartment: (value: string) => void;

  status: string;
  setStatus: (value: string) => void;
}

function PatientSearch({
  search,
  setSearch,
  department,
  setDepartment,
  status,
  setStatus,
}: PatientSearchProps) {
  return (
    <div className="patient-search">
      <div className="search-box">
        <span className="search-icon">🔍</span>

        <input
          type="text"
          placeholder="Search patients..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <select
        className="patient-filter"
        value={department}
        onChange={(e) => setDepartment(e.target.value)}
      >
        <option value="">All Departments</option>

        <option value="cardiology">Cardiology</option>

        <option value="neurology">Neurology</option>

        <option value="gastro">Gastro</option>

        <option value="orthology">Orthology</option>

        <option value="general physician">General Physician</option>

        <option value="pediatrics">Pediatrics</option>
      </select>

      <select
        className="patient-filter"
        value={status}
        onChange={(e) => setStatus(e.target.value)}
      >
        <option value="">All Status</option>

        <option value="active">Active</option>

        <option value="critical">Critical</option>

        <option value="discharged">Discharged</option>
      </select>
    </div>
  );
}

export default PatientSearch;
