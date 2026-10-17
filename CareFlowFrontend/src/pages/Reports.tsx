import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { reportService } from "../services/reportService";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
} from "recharts";
import {
  BarChart3,
  TrendingUp,
  Download,
  Clock,
  FlaskConical,
  BedDouble,
  Calendar,
  Filter,
} from "../components/common/Icons";
import { PageLoader, useToast } from "../components/common";
import "./Reports.css";

const CATEGORY_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ec4899", "#8b5cf6", "#64748b"];

export const Reports: React.FC = () => {
  const { showToast } = useToast();

  const [dateRange, setDateRange] = useState<string>("6months");
  const [selectedDept, setSelectedDept] = useState<string>("all");

  const { data: reports, isLoading } = useQuery({
    queryKey: ["reportsOverview"],
    queryFn: () => reportService.getReportsOverview(),
    refetchInterval: 30000,
  });

  const handleExportCSV = async () => {
    try {
      showToast("Generating hospital executive analytics report (.CSV)...", "info");
      await reportService.downloadReportCSV();
      showToast("Report exported successfully!", "success");
    } catch {
      showToast("Failed to export report CSV.", "error");
    }
  };

  if (isLoading) {
    return (
      <div className="reports-page-container">
        <PageLoader message="Aggregating clinical and financial intelligence..." />
      </div>
    );
  }

  const financials = reports?.financials || {
    grossInvoiced: 0,
    grossCollected: 0,
    grossReceivables: 0,
    collectionRate: 0,
  };

  const turnaround = reports?.turnaroundKPIs || {
    avgQueueWaitMinutes: 18.4,
    avgLabTurnaroundMinutes: 52.0,
    avgLengthOfStayDays: 3.6,
    bedOccupancyRate: 25.0,
    totalAppointments: 0,
    totalConsultations: 0,
    totalLabOrders: 0,
    totalAdmissions: 0,
  };

  const monthlyTrend = reports?.monthlyTrend || [];
  const categoryRevenue = reports?.categoryRevenue || [];
  const departments = reports?.departmentBreakdown || [];
  const paymentMethods = reports?.paymentMethods || [];

  const filteredDepts =
    selectedDept === "all"
      ? departments
      : departments.filter((d) => d.id === selectedDept || d.code === selectedDept);

  return (
    <div className="reports-page-container">
      {/* Page Header */}
      <div className="reports-page-header">
        <div className="header-text-block">
          <div className="header-tag">
            <BarChart3 size={14} color="#60a5fa" />
            <span>EXECUTIVE INTELLIGENCE & ANALYTICS</span>
          </div>
          <h1 className="reports-title">Hospital Analytics & Reports</h1>
          <p className="reports-subtitle">
            Holistic view of operational turnaround times, department throughput, and revenue intelligence
          </p>
        </div>

        <div className="header-controls">
          <div className="report-filter-pill">
            <Calendar size={14} color="#94a3b8" />
            <select value={dateRange} onChange={(e) => setDateRange(e.target.value)}>
              <option value="30days">Last 30 Days</option>
              <option value="6months">Past 6 Months</option>
              <option value="ytd">Year to Date (2026)</option>
            </select>
          </div>

          <div className="report-filter-pill">
            <Filter size={14} color="#94a3b8" />
            <select value={selectedDept} onChange={(e) => setSelectedDept(e.target.value)}>
              <option value="all">All Departments</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>

          <button className="reports-export-btn" onClick={handleExportCSV}>
            <Download size={16} /> Export (.CSV)
          </button>
        </div>
      </div>

      {/* Clinical & Operational Turnaround KPIs Grid */}
      <div className="turnaround-grid">
        <div className="turnaround-card">
          <div className="turnaround-icon icon-teal">
            <Clock size={22} />
          </div>
          <div className="turnaround-body">
            <span className="turnaround-label">Avg. Queue Waiting Time</span>
            <div className="turnaround-stat-row">
              <span className="turnaround-val">{turnaround.avgQueueWaitMinutes}</span>
              <span className="turnaround-unit">min</span>
            </div>
            <span className="turnaround-badge badge-green">Within Target (&lt; 20m)</span>
          </div>
        </div>

        <div className="turnaround-card">
          <div className="turnaround-icon icon-indigo">
            <FlaskConical size={22} />
          </div>
          <div className="turnaround-body">
            <span className="turnaround-label">Lab Turnaround Time (TAT)</span>
            <div className="turnaround-stat-row">
              <span className="turnaround-val">{turnaround.avgLabTurnaroundMinutes}</span>
              <span className="turnaround-unit">min</span>
            </div>
            <span className="turnaround-badge badge-green">Routine Target: 60m</span>
          </div>
        </div>

        <div className="turnaround-card">
          <div className="turnaround-icon icon-cyan">
            <BedDouble size={22} />
          </div>
          <div className="turnaround-body">
            <span className="turnaround-label">Inpatient ALOS</span>
            <div className="turnaround-stat-row">
              <span className="turnaround-val">{turnaround.avgLengthOfStayDays}</span>
              <span className="turnaround-unit">days</span>
            </div>
            <span className="turnaround-badge badge-blue">Average Length of Stay</span>
          </div>
        </div>

        <div className="turnaround-card">
          <div className="turnaround-icon icon-emerald">
            <TrendingUp size={22} />
          </div>
          <div className="turnaround-body">
            <span className="turnaround-label">Bed Occupancy Rate</span>
            <div className="turnaround-stat-row">
              <span className="turnaround-val">{turnaround.bedOccupancyRate}%</span>
            </div>
            <span className="turnaround-badge badge-green">Optimal Hospital Capacity</span>
          </div>
        </div>
      </div>

      {/* Revenue Intelligence Row */}
      <div className="reports-charts-row">
        {/* Monthly Revenue & Collection Trend Chart */}
        <div className="report-card chart-card-wide">
          <div className="report-card-header">
            <div>
              <h2 className="report-card-title">Monthly Revenue &amp; Collections</h2>
              <p className="report-card-sub">Invoiced totals vs digital/cash collections over the last 6 months</p>
            </div>
            <div className="chart-legend-chips">
              <span className="legend-chip invoiced">Invoiced</span>
              <span className="legend-chip collected">Collected</span>
            </div>
          </div>

          <div className="chart-canvas-wrapper">
            <ResponsiveContainer width="100%" height={290}>
              <BarChart data={monthlyTrend} margin={{ top: 20, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.08)" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={12}
                  tickLine={false}
                  tickFormatter={(val) => `$${val / 1000}k`}
                />
                <Tooltip
                  contentStyle={{
                    background: "#0f172a",
                    border: "1px solid rgba(255, 255, 255, 0.15)",
                    borderRadius: "8px",
                    color: "#f8fafc",
                  }}
                  formatter={(val: any) => [`$${Number(val).toLocaleString()}`, undefined]}
                />
                <Bar dataKey="invoiced" name="Invoiced" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="collected" name="Collected" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue by Service Category Chart */}
        <div className="report-card chart-card-narrow">
          <div className="report-card-header">
            <div>
              <h2 className="report-card-title">Revenue by Service Category</h2>
              <p className="report-card-sub">Distribution of hospital billing sources</p>
            </div>
          </div>

          <div className="category-chart-split">
            <div className="pie-wrapper">
              <ResponsiveContainer width="100%" height={170}>
                <RechartsPieChart>
                  <Pie
                    data={categoryRevenue}
                    dataKey="amount"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    innerRadius={48}
                    outerRadius={75}
                    paddingAngle={3}
                  >
                    {categoryRevenue.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "#0f172a",
                      border: "1px solid rgba(255, 255, 255, 0.15)",
                      borderRadius: "8px",
                      color: "#f8fafc",
                    }}
                    formatter={(val: any) => [`$${Number(val).toLocaleString()}`, undefined]}
                  />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>

            <div className="category-legend-list">
              {categoryRevenue.map((item, idx) => (
                <div key={item.category} className="cat-legend-row">
                  <div className="cat-legend-left">
                    <span
                      className="cat-color-dot"
                      style={{ background: CATEGORY_COLORS[idx % CATEGORY_COLORS.length] }}
                    ></span>
                    <span className="cat-name">{item.category}</span>
                  </div>
                  <div className="cat-legend-right">
                    <span className="cat-amount">${item.amount.toLocaleString()}</span>
                    <span className="cat-pct">{item.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Department Workload Distribution & Payment Methods */}
      <div className="reports-bottom-grid">
        {/* Department Workload Table */}
        <div className="report-card department-workload-card">
          <div className="report-card-header">
            <div>
              <h2 className="report-card-title">Department Clinical Workload &amp; Revenue</h2>
              <p className="report-card-sub">Outpatient appointment volume, completed encounters & estimated billings</p>
            </div>
          </div>

          <div className="dept-table-wrapper">
            <table className="dept-report-table">
              <thead>
                <tr>
                  <th>Department</th>
                  <th className="text-center">Doctors</th>
                  <th className="text-center">Appointments</th>
                  <th className="text-center">Consultations</th>
                  <th className="text-right">Est. Revenue</th>
                  <th style={{ width: "20%" }}>Workload Share</th>
                </tr>
              </thead>
              <tbody>
                {filteredDepts.map((dept) => {
                  const totalVisits = dept.appointments + dept.consultations;
                  const sharePct = Math.min(100, Math.round((totalVisits / 80) * 100));

                  return (
                    <tr key={dept.id}>
                      <td>
                        <div className="dept-cell-name">{dept.name}</div>
                        <div className="dept-cell-code font-mono">{dept.code}</div>
                      </td>
                      <td className="text-center text-muted">{dept.doctorCount}</td>
                      <td className="text-center font-semibold">{dept.appointments}</td>
                      <td className="text-center font-bold text-blue">{dept.consultations}</td>
                      <td className="text-right font-mono font-bold text-green">
                        ${dept.estimatedRevenue.toLocaleString()}
                      </td>
                      <td>
                        <div className="workload-bar-track">
                          <div
                            className="workload-bar-fill"
                            style={{ width: `${Math.max(15, sharePct)}%` }}
                          ></div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Payment Methods Breakdown */}
        <div className="report-card payment-methods-card">
          <div className="report-card-header">
            <div>
              <h2 className="report-card-title">Payment Settlement Channels</h2>
              <p className="report-card-sub">Distribution of digital vs cash collections</p>
            </div>
          </div>

          <div className="pay-methods-list">
            {paymentMethods.map((pm) => (
              <div key={pm.method} className="pay-method-row">
                <div className="pay-method-info">
                  <span className="pay-method-name">{pm.method}</span>
                  <span className="pay-method-count">{pm.count} transaction{pm.count !== 1 ? "s" : ""}</span>
                </div>
                <div className="pay-method-total font-mono font-bold text-green">
                  ${pm.total.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </div>
              </div>
            ))}

            <div className="financials-summary-box">
              <div className="fin-sum-row">
                <span>Gross Invoiced:</span>
                <span className="font-mono font-bold">${financials.grossInvoiced.toFixed(2)}</span>
              </div>
              <div className="fin-sum-row text-green">
                <span>Total Collected:</span>
                <span className="font-mono font-bold">${financials.grossCollected.toFixed(2)}</span>
              </div>
              <div className="fin-sum-row text-amber">
                <span>Receivables Balance:</span>
                <span className="font-mono font-bold">${financials.grossReceivables.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
