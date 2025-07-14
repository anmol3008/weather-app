import React, { useState, useEffect } from "react";
import { fetchWeather, fetchForecast, fetchAQI } from "./api/weather";
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
  const [aqi, setAqi] = useState(null);

  // Favourites state (persisted in localStorage)
  const [favourites, setFavourites] = useState(() => {
    const stored = localStorage.getItem("favourites");
    return stored ? JSON.parse(stored) : [];
  });

  // Autocomplete suggestions state
  const [suggestions, setSuggestions] = useState([]);

  // Fetch weather by city name
  async function getWeatherData(cityName = city, unitsVal = units) {
    setLoading(true);
    setError("");
    try {
      const data = await fetchWeather(cityName, unitsVal);
      if (data.cod !== 200) throw new Error(data.message);
      setWeather(data);

      const forecastData = await fetchForecast(cityName, unitsVal);
      setForecast(getDailyForecast(forecastData.list));

      // Fetch AQI if coordinates are available
      if (data.coord) {
        const aqiData = await fetchAQI(data.coord.lat, data.coord.lon);
        setAqi(aqiData.list && aqiData.list[0]);
      } else {
        setAqi(null);
      }
    } catch (err) {
      setError(err.message || "Failed to fetch weather data.");
      setWeather(null);
      setForecast([]);
      setAqi(null);
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
      setCity(data.name);

      // Fetch AQI
      const aqiData = await fetchAQI(lat, lon);
      setAqi(aqiData.list && aqiData.list[0]);
    } catch (err) {
      setError(err.message || "Failed to fetch weather data.");
      setWeather(null);
      setForecast([]);
      setAqi(null);
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

  // Handle search submit (prevents reload)
  function handleSearch(e) {
    e.preventDefault();
    getWeatherData(city);
  }

  // Fetch suggestions for autocomplete
  async function fetchSuggestions(query) {
    if (!query) return setSuggestions([]);
    try {
      // Example using GeoDB Cities API (replace with your API key)
      // You can sign up at RapidAPI for a key: https://rapidapi.com/wirefreethought/api/geodb-cities/
      const res = await fetch(
        `https://wft-geo-db.p.rapidapi.com/v1/geo/cities?namePrefix=${query}&limit=5`,
        {
          headers: {
            "X-RapidAPI-Key": "cd42d420f2msh1d2c8fc861fea31p1c1838jsn5193ba0cc508", // <-- Replace with your RapidAPI key
            "X-RapidAPI-Host": "wft-geo-db.p.rapidapi.com"
          }
        }
      );
      const data = await res.json();
      setSuggestions(data.data.map(city => city.city));
    } catch (err) {
      // Ignore autocomplete errors
      setSuggestions([]);
    }
  }

  // Add to favourites
  function addFavourite(cityName) {
    if (!favourites.includes(cityName)) {
      const updated = [...favourites, cityName];
      setFavourites(updated);
      localStorage.setItem("favourites", JSON.stringify(updated));
    }
  }

  // Remove from favourites
  function removeFavourite(cityName) {
    const updated = favourites.filter(c => c !== cityName);
    setFavourites(updated);
    localStorage.setItem("favourites", JSON.stringify(updated));
  }

  // Fetch weather on mount and when units change
  useEffect(() => {
    getWeatherData();
    // eslint-disable-next-line
  }, [units]);

  return (
    <div className="weather-app">
      <h1 className="main-title">Weather App</h1>

      {/* Favourites List */}
      {favourites.length > 0 && (
        <div className="favourites-list" style={{ marginBottom: 12 }}>
          {favourites.map(fav => (
            <button
              key={fav}
              className="search-btn"
              style={{ marginRight: 8, marginBottom: 4, background: "#e0e7ff", color: "#222" }}
              onClick={() => setCity(fav)}
              type="button"
            >
              {fav}
            </button>
          ))}
        </div>
      )}

      <form className="search-form" onSubmit={handleSearch}>
        <input
          className="search-input"
          value={city}
          onChange={e => {
            setCity(e.target.value);
            fetchSuggestions(e.target.value);
          }}
          list="city-suggestions"
          placeholder="Enter city"
          aria-label="Enter city"
        />
        <datalist id="city-suggestions">
          {suggestions.map(s => (
            <option key={s} value={s} />
          ))}
        </datalist>
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
        aqi={aqi}
      />

      {/* Add/Remove Favourite Button */}
      {weather && (
        favourites.includes(city) ? (
          <button
            className="search-btn"
            style={{ background: "#f44336", marginTop: 12 }}
            onClick={() => removeFavourite(city)}
            type="button"
          >
            Remove from Favourites
          </button>
        ) : (
          <button
            className="search-btn"
            style={{ background: "#4caf50", marginTop: 12 }}
            onClick={() => addFavourite(city)}
            type="button"
          >
            Add to Favourites
          </button>
        )
      )}
    </div>
  );
}
