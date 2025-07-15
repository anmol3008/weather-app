import React from "react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from "recharts";
import "./HourlyForecast.css";

export default function HourlyForecast() {
  const chartData = [
    { timeDisplay: "6:00 AM", temp: 20 },
    { timeDisplay: "9:00 AM", temp: 23 },
    { timeDisplay: "12:00 PM", temp: 26 },
    { timeDisplay: "3:00 PM", temp: 28 },
    { timeDisplay: "6:00 PM", temp: 25 },
    { timeDisplay: "9:00 PM", temp: 22 },
    { timeDisplay: "12:00 AM", temp: 19 },
    { timeDisplay: "3:00 AM", temp: 18 }
  ];

  return (
    <div style={{ background: "#e7ebff", padding: 20, borderRadius: 16 }}>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={chartData}>
          <CartesianGrid stroke="#ccc" />
          <XAxis dataKey="timeDisplay" />
          <YAxis />
          <Tooltip />
          <Line dataKey="temp" stroke="#667eea" dot isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
