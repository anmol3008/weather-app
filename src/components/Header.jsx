import React from "react";
import logo from "../assets/weather-logo.png";
import "./Header.css";

export default function Header({ theme, setTheme }) {
  return (
    <header className="mawesome-header">
      <img src={logo} alt="Mawesome logo" className="mawesome-logo" />
      <div className="mawesome-title-group">
        <span className="mawesome-title">Mawesome</span>
        <span className="mawesome-tagline">Weather made awesome</span>
      </div>
      {setTheme &&
        <button
          className="theme-toggle-btn"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          aria-label="Toggle dark mode"
        >
          {theme === "dark" ? "🌙" : "☀️"}
        </button>
      }
    </header>
  );
}
