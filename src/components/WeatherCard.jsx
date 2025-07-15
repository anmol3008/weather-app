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

import { weatherToAnimation } from "../utils/weatherAnimationMap.js";
import "./WeatherCard.css"; // ✅ Keep your existing CSS

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

function formatTime(unix, timezone) {
  const date = new Date((unix + timezone) * 1000);
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "UTC",
  });
}

export default function WeatherCard({ weather, units, onUnitChange, forecast, aqi }) {
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
  const aqiLevel = aqi ? ["Good", "Fair", "Moderate", "Poor", "Very Poor"][aqi.main.aqi - 1] : null;

  return (
    <div className="weather-card bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors duration-300">
      <div className="current-weather-row">
        <div className="weather-icon-wrapper">
          {animationData ? (
            <Lottie animationData={animationData} loop={true} style={{ width: 80, height: 80 }} />
          ) : (
            <img
              src={`https://openweathermap.org/img/wn/${weatherType.icon}@4x.png`}
              alt={weatherType.description}
              className="weather-icon"
            />
          )}
        </div>
        <div>
          <h2 className="city-name">{name}</h2>
          <div className="temperature">
            {Math.round(main.temp)}°
            <span>{units === "metric" ? "C" : "F"}</span>
          </div>
          <div className="current-datetime text-gray-600 dark:text-gray-300">
            {now.toLocaleDateString(undefined, {
              weekday: "long",
              year: "numeric",
              month: "short",
              day: "numeric",
            })}{" "}
            {now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </div>
          <p className="weather-description text-gray-700 dark:text-gray-300">
            {weatherType.description}
          </p>
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

      <div className="weather-details">
        <div className="detail-item bg-gray-100 dark:bg-gray-700 transition-colors duration-300">
          <img src={humidityIcon} alt="Humidity" className="detail-icon" />
          <span className="detail-label text-gray-600 dark:text-gray-300">Humidity</span>
          <span className="detail-value">{main.humidity}%</span>
        </div>

        <div className="detail-item bg-gray-100 dark:bg-gray-700 transition-colors duration-300">
          <img src={windIcon} alt="Wind" className="detail-icon" />
          <span className="detail-label text-gray-600 dark:text-gray-300">Wind</span>
          <span className="detail-value">
            {wind.speed} {units === "metric" ? "m/s" : "mph"}
          </span>
        </div>

        <div className="detail-item bg-gray-100 dark:bg-gray-700 transition-colors duration-300">
          <img src={precipitationIcon} alt="Precipitation" className="detail-icon" />
          <span className="detail-label text-gray-600 dark:text-gray-300">Precipitation</span>
          <span className="detail-value">
            {weather.rain?.["1h"]
              ? `${weather.rain["1h"]} mm`
              : weather.snow?.["1h"]
              ? `${weather.snow["1h"]} mm`
              : "0 mm"}
          </span>
        </div>

        <div className="detail-item bg-gray-100 dark:bg-gray-700 transition-colors duration-300">
          <img src={aqiIcon} alt="Air Quality" className="detail-icon" />
          <span className="detail-label text-gray-600 dark:text-gray-300">Air Quality</span>
          <span className="detail-value">
            {aqi ? `${aqi.main.aqi} (${aqiLevel})` : "N/A"}
          </span>
        </div>

        <div className="detail-item bg-gray-100 dark:bg-gray-700 transition-colors duration-300">
          <img src={sunriseIcon} alt="Sunrise" className="detail-icon" />
          <span className="detail-label text-gray-600 dark:text-gray-300">Sunrise</span>
          <span className="detail-value">
            {sys && formatTime(sys.sunrise, timezone)}
          </span>
        </div>

        <div className="detail-item bg-gray-100 dark:bg-gray-700 transition-colors duration-300">
          <img src={sunsetIcon} alt="Sunset" className="detail-icon" />
          <span className="detail-label text-gray-600 dark:text-gray-300">Sunset</span>
          <span className="detail-value">
            {sys && formatTime(sys.sunset, timezone)}
          </span>
        </div>
      </div>

      {forecast && forecast.length > 0 && (
        <div className="forecast-section">
          <h3 className="forecast-title">Next 5 Days</h3>
          <div className="forecast-row">
            {forecast.map((f, idx) => {
              const forecastType = f.weather[0];
              const forecastAnimKey = weatherToAnimation(forecastType);
              const forecastAnimData = animationMap[forecastAnimKey];
              return (
                <div
                  key={idx}
                  className="forecast-item bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-300"
                >
                  <span className="forecast-day">
                    {new Date(f.dt * 1000).toLocaleDateString(undefined, {
                      weekday: "short",
                    })}
                  </span>
                  <div className="forecast-icon-wrapper">
                    {forecastAnimData ? (
                      <Lottie animationData={forecastAnimData} loop={true} style={{ width: 40, height: 40 }} />
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
                  <span className="forecast-desc text-gray-600 dark:text-gray-300">
                    {forecastType.description}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
