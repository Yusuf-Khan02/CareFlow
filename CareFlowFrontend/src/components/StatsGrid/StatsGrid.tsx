import StatCard from "../StatCard/StatCard";
import "./StatsGrid.css";

function StatsGrid() {
  return (
    <div className="stats-grid">
      <StatCard
        title="Today's Patients"
        value={247}
        description="12% more than yesterday"
      />
      <StatCard
        title="Appointments"
        value={183}
        description="24 remaining today"
      />
      <StatCard
        title="Available Beds"
        value={18}
        description="72% occupancy"
      />
      <StatCard
        title="Emergency Cases"
        value={21}
        description="5 currently active"
      />

    </div>
  );
}
export default StatsGrid;