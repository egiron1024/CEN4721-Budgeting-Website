import React, { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Bar,
} from "recharts";

export default function Report() {
  const [period, setPeriod] = useState("month");  // Week/Month/Year

  // Sample Data
  // Weekly spend:
  const dataWeek = [
    { label: "Mon", spending: 42 },
    { label: "Tue", spending: 63 },
    { label: "Wed", spending: 28 },
    { label: "Thu", spending: 75 },
    { label: "Fri", spending: 56 },
    { label: "Sat", spending: 90 },
    { label: "Sun", spending: 38 },
  ];

  // Monthly spend:
  const dataMonth = [
    { label: "Wk 1", spending: 420 },
    { label: "Wk 2", spending: 510 },
    { label: "Wk 3", spending: 390 },
    { label: "Wk 4", spending: 560 },
  ];

  // Yearly spend:
  const dataYear = [
    { label: "Jan", spending: 1200 },
    { label: "Feb", spending: 980 },
    { label: "Mar", spending: 1360 },
    { label: "Apr", spending: 1100 },
    { label: "May", spending: 1450 },
    { label: "Jun", spending: 1320 },
    { label: "Jul", spending: 1500 },
    { label: "Aug", spending: 1410 },
    { label: "Sep", spending: 1270 },
    { label: "Oct", spending: 1600 },
    { label: "Nov", spending: 1390 },
    { label: "Dec", spending: 1700 },
  ];

  // Select database based on period
  const chartData = useMemo(() => {
    switch (period) {
      case "week":
        return dataWeek;
      case "year":
        return dataYear;
      case "month":
      default:
        return dataMonth;
    }
  }, [period]);

  const styles = {
    page: { padding: "2rem" },
    h1: { marginTop: 0, marginBottom: "1rem" },
    card: {
      background: "#ffffff",
      border: "1px solid #e5e7eb",
      borderRadius: "10px",
      padding: "1rem 1.25rem",
      boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
      minHeight: 300,
    },
    filterRow: { display: "flex", gap: "0.75rem", marginBottom: "1rem" },
    filterBtn: (active) => ({
      border: "1px solid #ccc",
      background: active ? "#A4D3FC" : "white",
      borderRadius: "6px",
      padding: "0.5rem 1rem",
      cursor: "pointer",
      fontSize: "16px",
    }),
    totalsRow: {
      display: "grid",
      gridTemplateColumns: "repeat(3, 1fr)",
      gap: "1rem",
      marginTop: "1rem",
    },
    totalBox: {
      background: "#f9fafb",
      border: "1px solid #e5e7eb",
      borderRadius: 8,
      padding: "0.75rem 1rem",
    },
    totalLabel: { fontSize: 13, color: "#6b7280" },
    totalValue: { fontSize: 18, fontWeight: 600 },
  };

  const totals = useMemo(() => {
    const sum = chartData.reduce((s, d) => s + (Number(d.spending) || 0), 0);
    const avg = chartData.length ? sum / chartData.length : 0;
    const max = chartData.reduce((m, d) => Math.max(m, Number(d.spending) || 0), 0);
    return { sum, avg, max };
  }, [chartData]);

  return (
    <div style={styles.page}>
      <h1 style={styles.h1}>Spending Report</h1>

      {/* Period Filter */}
      <div style={styles.filterRow}>
        {["week", "month", "year"].map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            style={styles.filterBtn(period === p)}
          >
            {p.charAt(0).toUpperCase() + p.slice(1)}
          </button>
        ))}
      </div>

      {/* Chart Card */}
      <section style={styles.card}>
        <h2 style={{ margin: 0, marginBottom: "0.75rem", fontSize: "1.25rem", fontWeight: 600 }}>
          Spending by {period === "week" ? "Day" : period === "month" ? "Week" : "Month"}
        </h2>

        <div style={{ width: "100%", height: 360 }}>
          <ResponsiveContainer>
            <BarChart data={chartData} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis />
              <Tooltip formatter={(v) => [`$${Number(v).toLocaleString()}`, "Spending"]} />
              <Legend />
              <Bar dataKey="spending" name="Spending" fill="#008cff" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Totals */}
        <div style={styles.totalsRow}>
          <div style={styles.totalBox}>
            <div style={styles.totalLabel}>Total</div>
            <div style={styles.totalValue}>${totals.sum.toLocaleString()}</div>
          </div>
          <div style={styles.totalBox}>
            <div style={styles.totalLabel}>Average</div>
            <div style={styles.totalValue}>${totals.avg.toFixed(2)}</div>
          </div>
          <div style={styles.totalBox}>
            <div style={styles.totalLabel}>Max</div>
            <div style={styles.totalValue}>${totals.max.toLocaleString()}</div>
          </div>
        </div>
      </section>
    </div>
  );
}