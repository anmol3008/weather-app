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

  // Use timestamp in ms for true timescale
  const chartData = list.map((item) => ({
    time: item.dt * 1000, // x axis value (milliseconds)
    temp: Math.round(item.main.temp),
  }));

  // Each tick is every forecast point (guaranteed: e.g., 2:30, 5:30, 8:30, etc)
  const ticks = chartData.map((point) => point.time);

  return (
    <div className="hourly-forecast-graph">
      <h3 className="hourly-title">Next 24 Hours</h3>
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={chartData} margin={{ top: 16, right: 20, left: 8, bottom: 7 }}>
          <CartesianGrid stroke="#e3e7ff" />
          <XAxis
            dataKey="time"
            type="number"
            scale="time"
            domain={["dataMin", "dataMax"]}
            ticks={ticks}
            tickFormatter={(t) =>
              new Date(t).toLocaleTimeString([], {
                hour: "numeric",
                minute: "2-digit",
                hour12: true,
              })
            }
            tick={{
              fontSize: 12, // smaller for clarity
              fontWeight: 500,
              fill: "#667eea",
            }}
            interval={0}
            allowDuplicatedCategory={false}
            tickMargin={7}
            minTickGap={0}
          />
          <YAxis
            domain={["auto", "auto"]}
            unit={`°${units === "metric" ? "C" : "F"}`}
            tick={{ fontSize: 13, fontWeight: 500 }}
            width={44}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />
          <Tooltip
            labelFormatter={(t) =>
              new Date(t).toLocaleTimeString([], {
                hour: "numeric",
                minute: "2-digit",
                hour12: true,
              })
            }
            formatter={(value) =>
              `${value}°${units === "metric" ? "C" : "F"}`
            }
            wrapperStyle={{ fontSize: "1rem" }}
          />
          <Line
            type="monotone"
            dataKey="temp"
            stroke="#667eea"
            strokeWidth={2.2}
            dot={{ r: 3 }}
            isAnimationActive={false}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
