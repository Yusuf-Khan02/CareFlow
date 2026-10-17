import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import "./PatientVisitsChart.css";

interface VisitData {
  day: string;
  patients: number;
}

const visitData: VisitData[] = [
  { day: "Mon", patients: 120 },
  { day: "Tue", patients: 180 },
  { day: "Wed", patients: 150 },
  { day: "Thu", patients: 220 },
  { day: "Fri", patients: 190 },
  { day: "Sat", patients: 240 },
  { day: "Sun", patients: 170 },
];

function PatientVisitsChart() {
  return (
    <section className="patient-visits-chart">

      <div className="chart-header">
        <div>
          <h2>Patient Visits</h2>

          <p>
            Number of patients this week
          </p>
        </div>

        <select className="chart-filter">
          <option>This Week</option>
          <option>This Month</option>
          <option>This Year</option>
        </select>
      </div>

      <div className="chart-container">

        <ResponsiveContainer width="100%" height={300}>

          <LineChart data={visitData}>

            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="day" />

            <YAxis />

            <Tooltip />

            <Line
              type="monotone"
              dataKey="patients"
              stroke="#2563eb"
              strokeWidth={3}
            />

          </LineChart>

        </ResponsiveContainer>

      </div>

    </section>
  );
}

export default PatientVisitsChart;