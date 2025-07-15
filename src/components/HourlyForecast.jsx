import React, { useState, useRef, useEffect } from "react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from "recharts";
import "./HourlyForecast.css";

console.log("hourlyForecast list prop in HourlyForecast.jsx:", list);


// Time formatting helpers
function formatTime12h(dt) {
  return dt.toLocaleTimeString([], { hour: "numeric", minute: "2-digit", hour12: true });
}
function getDayLabel(dt, now = new Date()) {
  if (
    dt.getDate() === now.getDate() &&
    dt.getMonth() === now.getMonth() &&
    dt.getFullYear() === now.getFullYear()
  ) return "Today";
  const tomorrow = new Date(now); tomorrow.setDate(now.getDate() + 1);
  if (
    dt.getDate() === tomorrow.getDate() &&
    dt.getMonth() === tomorrow.getMonth() &&
    dt.getFullYear() === tomorrow.getFullYear()
  ) return "Tomorrow";
  return dt.toLocaleDateString(undefined, { weekday: "short" });
}

// Custom popover tooltip for Recharts Tooltip
function HoverCard({ active, payload, isDark }) {
  if (!active || !payload || !payload.length) return null;
  const datum = payload[0].payload;
  return (
    <div className={`hourly-tooltip${isDark ? " dark" : ""}`}>
      <div style={{ fontWeight: 700, color: "#667eea", marginBottom: 2 }}>{datum.dayLabel}</div>
      <div style={{ fontSize: 15, marginBottom: 1 }}>{datum.timeDisplay}</div>
      <div style={{
        fontWeight: 700,
        color: isDark ? "#fff" : "#232648",
        textShadow: isDark ? "0 0 3px #23263f" : "none"
      }}>
        {datum.temp}°
        <span style={{ fontWeight: 500, color: "#667eea" }}>{datum.units}</span>
      </div>
    </div>
  );
}

export default function HourlyForecast({ list = [], units = "metric" }) {
  const nowDate = new Date();
  // Use at most 8 points so x-axis will always show 8 labels!
  const chartData = Array.isArray(list)
    ? list.slice(0, 8).map((h, idx) => {
        if (!h || !h.dt || !h.main) return null;
        const time = new Date(h.dt * 1000);
        return {
          timeDisplay: formatTime12h(time),
          temp: Math.round(h.main.temp),
          feels_like: Math.round(h.main.feels_like),
          dt: h.dt,
          dayLabel: getDayLabel(time, nowDate),
          units: `°${units === "metric" ? "C" : "F"}`,
          idx
        };
      }).filter(Boolean)
    : [];

  // --- Fallback: don't render blank or broken chart if data is missing [1][2][7][5][6]
  if (!chartData.length) {
    return (
      <section className="hourly-forecast-graph" style={{ minHeight: 90, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ opacity: 0.62, color: "#47569b", fontWeight: 500 }}>No hourly forecast available</span>
      </section>
    );
  }

  // Animation only runs once every time chart enters viewport, then freezes.
  const [animate, setAnimate] = useState(false);
  const animationTimer = useRef();
  const chartRef = useRef(null);

  useEffect(() => {
    if (!chartRef.current || typeof window === "undefined") return;
    const handleIntersection = ([entry]) => {
      if (entry.isIntersecting) {
        setAnimate(true);
        // Stop animation after 1.2s, to prevent looping
        animationTimer.current = setTimeout(() => setAnimate(false), 1200);
      }
    };
    const obs = new window.IntersectionObserver(handleIntersection, { threshold: 0.2 });
    obs.observe(chartRef.current);
    return () => {
      obs.disconnect();
      if (animationTimer.current) clearTimeout(animationTimer.current);
    };
  }, []);

  const ticks = chartData.map(d => d.timeDisplay);
  const darkMode = typeof window !== "undefined"
    ? document.documentElement.classList.contains("dark")
    : false;

  return (
    <section
      className="hourly-forecast-graph"
      ref={chartRef}
      style={{ position: "relative", minHeight: 250 }}
      tabIndex={-1}
      aria-label="Hourly Weather Forecast Line Chart"
    >
      <h3 className="hourly-title">Next 24 Hours</h3>
      <div style={{ width: "100%", height: 225, position: "relative" }}>
        <ResponsiveContainer>
          <LineChart
            data={chartData}
            margin={{ top: 28, right: 19, left: 6, bottom: 36 }}
          >
            <defs>
              <linearGradient id="tempColor" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#667eea" stopOpacity={0.85} />
                <stop offset="100%" stopColor="#667eea" stopOpacity={0.13} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="5 3" stroke={darkMode ? "#24243c" : "#e5e7eb"} />
            <XAxis
              dataKey="timeDisplay"
              interval={0}
              ticks={ticks}
              axisLine={false}
              tickLine={false}
              minTickGap={0}
              tickSize={18}
              height={36}
              padding={{ left: 4, right: 4 }}
              stroke={darkMode ? "#a5b4fc" : "#667eea"}
              fontSize={13}
              tick={{
                angle: 0,
                dy: 13,
                textAnchor: "middle",
                fontWeight: 700,
              }}
            />
            <YAxis
              domain={['auto', 'auto']}
              axisLine={false}
              tickLine={false}
              fontSize={12}
              unit={`°${units === "metric" ? "C" : "F"}`}
              stroke={darkMode ? "#a5b4fc" : "#888"}
            />
            <Tooltip
              content={<HoverCard isDark={darkMode} />}
              allowEscapeViewBox={{ x: false, y: true }}
              wrapperStyle={{ zIndex: 9999, pointerEvents: "all" }}
              cursor={{ stroke: "#7c87fa", strokeWidth: 2, opacity: 0.12 }}
            />
            <Line
              type="monotone"
              dataKey="temp"
              stroke="#667eea"
              strokeWidth={2.05}
              dot={{
                r: 4, // tidy, not too thick
                fill: "#fff",
                stroke: "#667eea",
                strokeWidth: 1.2,
                style: { pointerEvents: "none" }
              }}
              activeDot={{
                r: 6,
                fill: "#fff",
                stroke: "#667eea",
                strokeWidth: 2,
                style: { pointerEvents: "none" }
              }}
              fill="url(#tempColor)"
              isAnimationActive={animate}
              animationDuration={1200}
              animationBegin={0}
              animationEasing="ease-in-out"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
