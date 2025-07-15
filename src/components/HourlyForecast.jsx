import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import "./HourlyForecast.css";

// Custom, theme-aware tooltip for both dark and light mode
function HourlyTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  const isDark = document.documentElement.classList.contains("dark");
  const time = new Date(label).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  return (
    <div
      className={`hourly-tooltip${isDark ? " dark" : ""}`}
      style={{
        background: isDark ? "#232948" : "#fff",
        color: isDark ? "#fff" : "#232648",
        padding: "10px 16px 7px 16px",
        borderRadius: "12px",
        boxShadow: isDark
          ? "0 4px 24px rgba(35,41,72,0.29)"
          : "0 2px 12px rgba(124, 145, 255, 0.11)",
        fontSize: "1em",
        fontWeight: 600,
      }}
    >
      <div style={{ color: "#667eea", fontSize: 16, fontWeight: 700 }}>
        {time}
      </div>
      <div style={{ fontSize: 18, fontWeight: 700, marginTop: 2 }}>
        {payload[0].value}&deg;
        <span style={{ fontWeight: 500, color: "#667eea" }}>
          {payload[0].unit}
        </span>
      </div>
    </div>
  );
}

export default function HourlyForecast({ list = [], units = "metric" }) {
  if (!Array.isArray(list) || list.length === 0) {
    return (
      <div className="hourly-forecast-graph empty">
        <span>No hourly forecast available.</span>
      </div>
    );
  }

  // Each X point is ms timestamp for accurate spacing; ticks show every point
  const chartData = list.map((item) => ({
    time: item.dt * 1000,
    temp: Math.round(item.main.temp),
    unit: `°${units === "metric" ? "C" : "F"}`,
  }));
  const ticks = chartData.map((d) => d.time);

  return (
    <div className="hourly-forecast-graph">
      <h3 className="hourly-title">Next 24 Hours</h3>
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={chartData} margin={{ top: 18, right: 24, left: 5, bottom: 9 }}>
          <CartesianGrid stroke="#dde4ff" />
          <XAxis
            dataKey="time"
            type="number"
            domain={["dataMin", "dataMax"]}
            scale="time"
            ticks={ticks}
            tickFormatter={(t) =>
              new Date(t).toLocaleTimeString([], {
                hour: "numeric",
                minute: "2-digit",
                hour12: true,
              })
            }
            tick={{
              fontSize: 13,
              fontWeight: 500,
              fill: "#667eea",
            }}
            interval={0}
            allowDuplicatedCategory={false}
            tickMargin={8}
            minTickGap={0}
          />
          <YAxis
            domain={["auto", "auto"]}
            unit={`°${units === "metric" ? "C" : "F"}`}
            tick={{ fontSize: 14, fontWeight: 500, fill: "#4458c8" }}
            width={44}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />
          <Tooltip
            content={<HourlyTooltip />}
            cursor={{
              stroke: "#667eea",
              strokeWidth: 2,
              opacity: 0.12,
            }}
          />
          <Line
            type="monotone"
            dataKey="temp"
            stroke="#667eea"
            strokeWidth={2.3}
            dot={{ r: 3.2, fill: "#fff", stroke: "#667eea", strokeWidth: 1.2 }}
            isAnimationActive={false}
            activeDot={{ r: 6, fill: "#fff", stroke: "#667eea", strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
