import React from "react";
import './WeatherCard.css';

export default function WeatherCard({ weather, units, onUnitChange, forecast }) {
  if (!weather) return null;

  const { name, main, weather: weatherArr, wind } = weather;
  const weatherType = weatherArr[0];

  return (
    <div className="weather-card">
      {/* --- Current Weather --- */}
      <div className="current-weather-row">
        <div className="weather-icon-wrapper">
          <img
            src={`https://openweathermap.org/img/wn/${weatherType.icon}@4x.png`}
            alt={weatherType.description}
            className="weather-icon"
          />
        </div>
        <div>
          <h2 className="city-name">{name}</h2>
          <div className="temperature">
            {Math.round(main.temp)}°
            <span>{units === "metric" ? "C" : "F"}</span>
          </div>
          <p className="weather-description">{weatherType.description}</p>
          <div className="unit-switch">
            <button
              onClick={() => onUnitChange("metric")}
              className={`search-btn ${units === "metric" ? "active" : ""}`}
            >
              °C
            </button>
            <button
              onClick={() => onUnitChange("imperial")}
              className={`search-btn ${units === "imperial" ? "active" : ""}`}
            >
              °F
            </button>
          </div>
        </div>
      </div>

      {/* --- Weather Details --- */}
      <div className="weather-details">
        <div className="detail-item">
          <span className="detail-label">Humidity</span>
          <span className="detail-value">{main.humidity}%</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Wind</span>
          <span className="detail-value">
            {wind.speed} {units === "metric" ? "m/s" : "mph"}
          </span>
        </div>
      </div>

      {/* --- Forecast Section --- */}
      {forecast && forecast.length > 0 && (
        <div className="forecast-section">
          <h3 className="forecast-title">Next 5 Days</h3>
          <div className="forecast-row">
            {forecast.map((f, idx) => (
              <div key={idx} className="forecast-item">
                <span className="forecast-day">
                  {new Date(f.dt * 1000).toLocaleDateString(undefined, { weekday: 'short' })}
                </span>
                <div className="forecast-icon-wrapper">
                  <img
                    src={`https://openweathermap.org/img/wn/${f.weather[0].icon}@2x.png`}
                    alt={f.weather[0].description}
                    className="forecast-icon"
                  />
                </div>
                <div className="forecast-temps">
                  <span className="temp-max">{Math.round(f.main.temp_max)}°</span>
                  <span className="temp-min">{Math.round(f.main.temp_min)}°</span>
                </div>
                <span className="forecast-desc">{f.weather[0].description}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
