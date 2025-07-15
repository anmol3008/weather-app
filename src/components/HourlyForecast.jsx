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

export default function HourlyForecast({ list = [], units = "metric" }) {
  if (!Array.isArray(list) || list.length === 0) {
    return (
      <div className="hourly-forecast-graph empty">
        <span>No hourly forecast available.</span>
      </div>
    );
  }

  const chartData = list.map((item) => {
    const date = new Date(item.dt * 1000);
    return {
      timeDisplay: date.toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }),
      temp: Math.round(item.main.temp),
      units: `°${units === "metric" ? "C" : "F"}`,
    };
  });

  return (
    <div className="hourly-forecast-graph">
      <h3 className="hourly-title">Next 24 Hours</h3>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={chartData}>
          <CartesianGrid stroke="#ccc" />
          <XAxis dataKey="timeDisplay" />
          <YAxis
            domain={["auto", "auto"]}
            unit={`°${units === "metric" ? "C" : "F"}`}
            tick={{ fontSize: 12 }}
          />
          <Tooltip
            labelStyle={{ color: "#667eea", fontWeight: 700 }}
            formatter={(value) => `${value}°${units === "metric" ? "C" : "F"}`}
          />
          <Line
            type="monotone"
            dataKey="temp"
            stroke="#667eea"
            strokeWidth={2}
            dot={{ r: 4 }}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
