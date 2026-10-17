import "./PatientSearch.css";

interface PatientSearchProps {
  search: string;
  setSearch: (value: string) => void;
  department: string;
  setDepartment: (value: string) => void;
  status: string;
  setStatus: (value: string) => void;
  totalResults?: number;
  onResetFilters?: () => void;
}

export const PatientSearch = ({
  search,
  setSearch,
  department,
  setDepartment,
  status,
  setStatus,
  totalResults,
  onResetFilters,
}: PatientSearchProps) => {
  const hasActiveFilters = Boolean(search || department || status);

  return (
    <div className="patient-search-card" id="patient-search-bar">
      <div className="patient-search-inputs">
        <div className="search-input-box">
          <svg className="search-box-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" x2="16.65" y1="21" y2="16.65" />
          </svg>
          <input
            type="text"
            className="search-text-field"
            placeholder="Search by name, MRN (e.g. CF-2026), or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            id="input-patient-search"
          />
          {search && (
            <button
              type="button"
              className="clear-search-btn"
              onClick={() => setSearch("")}
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        <div className="filter-dropdowns">
          <select
            className="patient-filter-select"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            id="select-filter-department"
          >
            <option value="">All Departments</option>
            <option value="Cardiology">Cardiology</option>
            <option value="Neurology">Neurology</option>
            <option value="Gastro">Gastroenterology</option>
            <option value="Orthology">Orthopedics</option>
            <option value="General Physician">General Physician</option>
            <option value="Pediatrics">Pediatrics</option>
          </select>

          <select
            className="patient-filter-select"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            id="select-filter-status"
          >
            <option value="">All Triage Status</option>
            <option value="Active">Active</option>
            <option value="Critical">Critical</option>
            <option value="Discharged">Discharged</option>
          </select>

          {hasActiveFilters && onResetFilters && (
            <button
              type="button"
              className="reset-filters-btn"
              onClick={onResetFilters}
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {typeof totalResults === "number" && (
        <div className="search-results-counter">
          <span>Found <strong>{totalResults}</strong> patient records</span>
        </div>
      )}
    </div>
  );
};

export default PatientSearch;
