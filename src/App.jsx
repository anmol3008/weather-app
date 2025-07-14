import React, { useState, useEffect } from "react";
import { fetchWeather, fetchForecast } from "./api/weather";
import WeatherCard from "./components/WeatherCard";
import "./App.css";

// Helper to group forecast data by day and get max/min/icon/desc
function getDailyForecast(forecastList) {
  const daily = {};
  forecastList.forEach(item => {
    const date = new Date(item.dt * 1000).toLocaleDateString();
    if (!daily[date]) daily[date] = [];
    daily[date].push(item);
  });
  // For each day, pick max/min temp and the icon/desc closest to midday
  return Object.values(daily)
    .slice(0, 5)
    .map(dayArr => {
      const min = Math.min(...dayArr.map(d => d.main.temp_min));
      const max = Math.max(...dayArr.map(d => d.main.temp_max));
      const midday = dayArr.reduce((prev, curr) => {
        const prevHour = new Date(prev.dt * 1000).getHours();
        const currHour = new Date(curr.dt * 1000).getHours();
        return Math.abs(currHour - 12) < Math.abs(prevHour - 12) ? curr : prev;
      });
      return {
        dt: midday.dt,
        main: { temp_min: min, temp_max: max },
        weather: midday.weather,
      };
    });
}

export default function App() {
  const [city, setCity] = useState("Allahabad");
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [units, setUnits] = useState("metric");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function getWeatherData(cityName = city, unitsVal = units) {
    setLoading(true);
    setError("");
    try {
      const data = await fetchWeather(cityName, unitsVal);
      if (data.cod !== 200) throw new Error(data.message);
      setWeather(data);

      const forecastData = await fetchForecast(cityName, unitsVal);
      setForecast(getDailyForecast(forecastData.list));
    } catch (err) {
      setError(err.message || "Failed to fetch weather data.");
      setWeather(null);
      setForecast([]);
    }
    setLoading(false);
  }

  // Fetch weather by coordinates (for geolocation)
  async function getWeatherByCoords(lat, lon, unitsVal = units) {
    setLoading(true);
    setError("");
    try {
      const data = await fetchWeather({ lat, lon }, unitsVal);
      if (data.cod !== 200) throw new Error(data.message);
      setWeather(data);

      const forecastData = await fetchForecast({ lat, lon }, unitsVal);
      setForecast(getDailyForecast(forecastData.list));
      setCity(data.name); // Update city input to detected city name
    } catch (err) {
      setError(err.message || "Failed to fetch weather data.");
      setWeather(null);
      setForecast([]);
    }
    setLoading(false);
  }

  // Handler for "Use My Location" button
  function handleUseMyLocation() {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        getWeatherByCoords(position.coords.latitude, position.coords.longitude);
      },
      (err) => {
        setError("Unable to retrieve your location.");
        setLoading(false);
      }
    );
  }

  // Fetch on mount and when units change
  useEffect(() => {
    getWeatherData();
    // eslint-disable-next-line
  }, [units]);

  // Handle search submit (prevents reload)
  function handleSearch(e) {
    e.preventDefault();
    getWeatherData(city);
  }

  return (
    <div className="weather-app">
      {/* --- SINGLE MODERN TITLE --- */}
      <h1 className="main-title">Weather App</h1>
      {/* --- END TITLE --- */}

      <form className="search-form" onSubmit={handleSearch}>
        <input
          className="search-input"
          value={city}
          onChange={e => setCity(e.target.value)}
          placeholder="Enter city"
          aria-label="Enter city"
        />
        <button className="search-btn" type="submit">
          Search
        </button>
        <button
          type="button"
          className="search-btn"
          style={{ background: "linear-gradient(90deg, #2193b0 60%, #6dd5ed 100%)" }}
          onClick={handleUseMyLocation}
        >
          Use My Location
        </button>
      </form>
      {loading && (
        <div style={{ textAlign: "center", color: "#667eea", margin: "24px 0" }}>
          Loading...
        </div>
      )}
      {error && (
        <div className="error-message" style={{ margin: "16px 0" }}>
          {error}
        </div>
      )}
      <WeatherCard
        weather={weather}
        units={units}
        onUnitChange={setUnits}
        forecast={forecast}
      />
    </div>
  );
}
