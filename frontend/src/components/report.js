import React, { useMemo, useState, useEffect } from "react";
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
import { getUser } from '../services/api';

export default function Report() {
  const [period, setPeriod] = useState("month");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [spending, setSpending] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load data from backend
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const user = await getUser();
      
      if (user && Array.isArray(user.spending)) {
        const mapped = user.spending.map(s => ({
          id: s.id,
          name: s.item,
          amount: s.amount,
          date: s.transaction_date,
          category: s.category || null,
        }));
        setSpending(mapped);
      }

      if (user && Array.isArray(user.categories)) {
        setCategories(user.categories.map(cat => cat.name));
      }
    } catch (err) {
      console.error('Failed to load spending data', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter spending by category
  const filteredSpending = useMemo(() => {
    if (selectedCategory === "all") return spending;
    return spending.filter(s => s.category === selectedCategory);
  }, [spending, selectedCategory]);

  // Generate chart data based on period
  const chartData = useMemo(() => {
    const now = new Date();
    
    if (period === "week") {
      // Last 7 days (Mon-Sun of current week)
      const startOfWeek = new Date(now);
      const day = startOfWeek.getDay();
      const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Adjust to Monday
      startOfWeek.setDate(diff);
      startOfWeek.setHours(0, 0, 0, 0);

      const weekData = [];
      const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
      
      for (let i = 0; i < 7; i++) {
        const currentDay = new Date(startOfWeek);
        currentDay.setDate(startOfWeek.getDate() + i);
        const nextDay = new Date(currentDay);
        nextDay.setDate(currentDay.getDate() + 1);
        
        const daySpending = filteredSpending.filter(s => {
          const spendDate = new Date(s.date);
          return spendDate >= currentDay && spendDate < nextDay;
        });

        const total = daySpending.reduce((sum, s) => sum + Number(s.amount || 0), 0);
        
        weekData.push({
          label: dayNames[i],
          spending: Math.round(total * 100) / 100,
        });
      }
      
      return weekData;
    }

    if (period === "month") {
      // Current month by week
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      
      const monthData = [];
      let weekNum = 1;
      let currentWeekStart = new Date(startOfMonth);
      
      while (currentWeekStart <= endOfMonth) {
        const currentWeekEnd = new Date(currentWeekStart);
        currentWeekEnd.setDate(currentWeekStart.getDate() + 7);
        
        const weekSpending = filteredSpending.filter(s => {
          const spendDate = new Date(s.date);
          return spendDate >= currentWeekStart && spendDate < currentWeekEnd;
        });

        const total = weekSpending.reduce((sum, s) => sum + Number(s.amount || 0), 0);
        
        monthData.push({
          label: `Wk ${weekNum}`,
          spending: Math.round(total * 100) / 100,
        });
        
        currentWeekStart = currentWeekEnd;
        weekNum++;
      }
      
      return monthData;
    }

    if (period === "year") {
      // Current year by month
      const yearData = [];
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      
      for (let i = 0; i < 12; i++) {
        const monthStart = new Date(now.getFullYear(), i, 1);
        const monthEnd = new Date(now.getFullYear(), i + 1, 0, 23, 59, 59, 999);
        
        const monthSpending = filteredSpending.filter(s => {
          const spendDate = new Date(s.date);
          return spendDate >= monthStart && spendDate <= monthEnd;
        });

        const total = monthSpending.reduce((sum, s) => sum + Number(s.amount || 0), 0);
        
        yearData.push({
          label: monthNames[i],
          spending: Math.round(total * 100) / 100,
        });
      }
      
      return yearData;
    }

    return [];
  }, [period, filteredSpending]);

  const totals = useMemo(() => {
    const sum = chartData.reduce((s, d) => s + (Number(d.spending) || 0), 0);
    const avg = chartData.length ? sum / chartData.length : 0;
    const max = chartData.reduce((m, d) => Math.max(m, Number(d.spending) || 0), 0);
    return { sum, avg, max };
  }, [chartData]);

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
    filterRow: { display: "flex", gap: "0.75rem", marginBottom: "1rem", flexWrap: "wrap" },
    filterBtn: (active) => ({
      border: "1px solid #ccc",
      background: active ? "#A4D3FC" : "white",
      borderRadius: "6px",
      padding: "0.5rem 1rem",
      cursor: "pointer",
      fontSize: "16px",
    }),
    categorySection: {
      marginTop: "1rem",
      paddingTop: "1rem",
      borderTop: "1px solid #e5e7eb",
    },
    categoryLabel: {
      fontSize: "14px",
      fontWeight: 600,
      marginBottom: "0.5rem",
      color: "#374151",
    },
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

  if (loading) {
    return (
      <div style={styles.page}>
        <h1 style={styles.h1}>Spending Report</h1>
        <p>Loading...</p>
      </div>
    );
  }

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

      {/* Category Filter */}
      <div style={styles.categorySection}>
        <div style={styles.categoryLabel}>Filter by Category:</div>
        <div style={styles.filterRow}>
          <button
            onClick={() => setSelectedCategory("all")}
            style={styles.filterBtn(selectedCategory === "all")}
          >
            All Categories
          </button>
          {categories.length === 0 ? (
            <span style={{ fontSize: "14px", color: "#6b7280", padding: "0.5rem" }}>
              No categories created yet
            </span>
          ) : (
            categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={styles.filterBtn(selectedCategory === cat)}
              >
                {cat}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chart Card */}
      <section style={styles.card}>
        <h2 style={{ margin: 0, marginBottom: "0.75rem", fontSize: "1.25rem", fontWeight: 600 }}>
          Spending by {period === "week" ? "Day" : period === "month" ? "Week" : "Month"}
          {selectedCategory !== "all" && ` - ${selectedCategory}`}
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
            <div style={styles.totalValue}>${totals.sum.toFixed(2)}</div>
          </div>
          <div style={styles.totalBox}>
            <div style={styles.totalLabel}>Average</div>
            <div style={styles.totalValue}>${totals.avg.toFixed(2)}</div>
          </div>
          <div style={styles.totalBox}>
            <div style={styles.totalLabel}>Max</div>
            <div style={styles.totalValue}>${totals.max.toFixed(2)}</div>
          </div>
        </div>
      </section>
    </div>
  );
}