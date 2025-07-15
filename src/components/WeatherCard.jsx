import React, { useState, useEffect } from "react";
import Lottie from "lottie-react";
import cloudyNight from "../animations/cloudy-night.json";
import night from "../animations/night.json";
import rainyNight from "../animations/rainy-night.json";
import partlyShower from "../animations/partly-shower.json";
import snow from "../animations/snow.json";
import storm from "../animations/storm.json";
import sunny from "../animations/sunny.json";
import windy from "../animations/windy.json";
import partlyCloudy from "../animations/partly-cloudy.json";
import stormRain from "../animations/storm-rain.json";

import precipitationIcon from "../assets/icons/precipitation.png";
import humidityIcon from "../assets/icons/humidity.png";
import windIcon from "../assets/icons/wind.png";
import aqiIcon from "../assets/icons/aqi.png";
import sunriseIcon from "../assets/icons/sunrise.png";
import sunsetIcon from "../assets/icons/sunset.png";

import HourlyForecast from "./HourlyForecast"; // ✅ graph component
import { weatherToAnimation } from "../utils/weatherAnimationMap";
import "./WeatherCard.css";

// Animation mapping
const animationMap = {
  "cloudy-night": cloudyNight,
  night,
  "rainy-night": rainyNight,
  "partly-shower": partlyShower,
  "partly-cloudy": partlyCloudy,
  "storm-rain": stormRain,
  snow,
  storm,
  sunny,
  windy,
};

// Format Sunrise/Sunset
function formatTime(unix, timezone) {
  const date = new Date((unix + timezone) * 1000);
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "UTC",
  });
}

// Format Forecast Days
function getDayLabel(idx, dt) {
  if (idx === 0) return "Tomorrow";
  return new Date(dt * 1000).toLocaleDateString(undefined, {
    weekday: "short",
  });
}

// Main Component
export default function WeatherCard({
  weather,
  units,
  onUnitChange,
  forecast,
  aqi,
  hourlyForecast,
}) {
  if (!weather) return null;

  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const { name, main, weather: weatherArr, wind, sys, timezone } = weather;
  const weatherType = weatherArr[0];
  const animationKey = weatherToAnimation(weatherType);
  const animationData = animationMap[animationKey];

  const aqiLevel =
    aqi ? ["Good", "Fair", "Moderate", "Poor", "Very Poor"][aqi.main.aqi - 1] : null;

  // Share Button Logic
  function handleShare() {
    const shareData = {
      title: "Weather at " + name,
      text: `Current weather in ${name}: ${Math.round(main.temp)}°${
        units === "metric" ? "C" : "F"
      }, ${weatherType.description}.`,
      url: window.location.href,
    };
    if (navigator.share) {
      navigator.share(shareData).catch(() => {
        alert("Sharing not supported.");
      });
    } else {
      navigator.clipboard.writeText(
        `${shareData.title}\n${shareData.text}\n${shareData.url}`
      );
      alert("Weather info copied to clipboard.");
    }
  }

  return (
    <section className="weather-card">
      {/* -- Top Section -- */}
      <div className="current-weather-row">
        <div className="weather-icon-wrapper">
          {animationData ? (
            <Lottie animationData={animationData} loop style={{ width: 80, height: 80 }} />
          ) : (
            <img
              src={`https://openweathermap.org/img/wn/${weatherType.icon}@4x.png`}
              alt={weatherType.description}
              className="weather-icon"
            />
          )}
        </div>
        <div>
          <h2 className="city-name">
            {name}
            {sys?.country && <span className="country-name">, {sys.country}</span>}
          </h2>
          <div className="temperature">
            {Math.round(main.temp)}°{units === "metric" ? "C" : "F"}
          </div>
          <div className="current-datetime">
            {now.toLocaleDateString(undefined, {
              weekday: "long",
              year: "numeric",
              month: "short",
              day: "numeric",
            })}{" "}
            {now.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
          <p className="weather-description">{weatherType.description}</p>

          {/* Share */}
          <button
            className="share-btn"
            style={{
              marginTop: 10,
              background: "#667eea",
              color: "#fff",
              borderRadius: 8,
              padding: "8px 18px",
              border: "none",
              fontWeight: 600,
              fontSize: "1em",
              cursor: "pointer",
            }}
            onClick={handleShare}
          >
            Share Weather
          </button>

          {/* Unit Switch */}
          <div className="unit-switch" role="group" aria-label="Switch units">
            <button
              onClick={() => onUnitChange("metric")}
              className={`search-btn ${units === "metric" ? "active" : ""}`}
              aria-pressed={units === "metric"}
            >
              °C
            </button>
            <button
              onClick={() => onUnitChange("imperial")}
              className={`search-btn ${units === "imperial" ? "active" : ""}`}
              aria-pressed={units === "imperial"}
            >
              °F
            </button>
          </div>
        </div>
      </div>

      {/* -- Weather Details -- */}
      <div className="weather-details">
        <DetailItem icon={humidityIcon} label="Humidity" value={`${main.humidity}%`} />
        <DetailItem
          icon={windIcon}
          label="Wind"
          value={`${wind.speed} ${units === "metric" ? "m/s" : "mph"}`}
        />
        <DetailItem
          icon={precipitationIcon}
          label="Precipitation"
          value={
            weather.rain?.["1h"]
              ? `${weather.rain["1h"]} mm`
              : weather.snow?.["1h"]
              ? `${weather.snow["1h"]} mm`
              : "0 mm"
          }
        />
        <DetailItem
          icon={aqiIcon}
          label="Air Quality"
          value={
            aqi ? (
              <span className="aqi-value">
                {aqi.main.aqi} ({aqiLevel})
              </span>
            ) : (
              "N/A"
            )
          }
        />
        <DetailItem
          icon={sunriseIcon}
          label="Sunrise"
          value={formatTime(sys.sunrise, timezone)}
        />
        <DetailItem
          icon={sunsetIcon}
          label="Sunset"
          value={formatTime(sys.sunset, timezone)}
        />
      </div>

      {/* -- Hourly Chart (📈 Your New Feature) -- */}
      {hourlyForecast && hourlyForecast.length > 0 && (
        <HourlyForecast list={hourlyForecast} units={units} />
      )}

      {/* -- 5-Day Forecast -- */}
      {forecast?.length > 0 && (
        <div className="forecast-section">
          <h3 className="forecast-title">Next 5 Days</h3>
          <div className="forecast-row">
            {forecast.map((f, idx) => {
              const forecastType = f.weather[0];
              const forecastAnimKey = weatherToAnimation(forecastType);
              const forecastAnimData = animationMap[forecastAnimKey];
              return (
                <div key={idx} className="forecast-item">
                  <span className="forecast-day">{getDayLabel(idx, f.dt)}</span>
                  <div className="forecast-icon-wrapper">
                    {forecastAnimData ? (
                      <Lottie animationData={forecastAnimData} loop style={{ width: 40, height: 40 }} />
                    ) : (
                      <img
                        src={`https://openweathermap.org/img/wn/${forecastType.icon}@2x.png`}
                        alt={forecastType.description}
                        className="forecast-icon"
                      />
                    )}
                  </div>
                  <div className="forecast-temps">
                    <span className="temp-max">{Math.round(f.main.temp_max)}°</span>
                    <span className="temp-min">{Math.round(f.main.temp_min)}°</span>
                  </div>
                  <span className="forecast-desc">{forecastType.description}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}

// Reusable Details Row
function DetailItem({ icon, label, value }) {
  const valueClass =
    label === "Air Quality" ? "detail-value aqi-value" : "detail-value";

  return (
    <div className="detail-item" aria-label={label}>
      <img src={icon} alt={label} className="detail-icon" />
      <span className="detail-label">{label}</span>
      <span className={valueClass}>{value}</span>
    </div>
  );
}
