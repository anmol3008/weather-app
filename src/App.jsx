import React, { useState, useEffect } from "react";
import { fetchWeather, fetchForecast, fetchAQI } from "./api/weather";
import WeatherCard from "./components/WeatherCard";
import "./App.css";
import { weatherBgMapping } from "./utils/backgroundMapping";

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
  const [favourites, setFavourites] = useState(() => {
    const stored = localStorage.getItem("favourites");
    return stored ? JSON.parse(stored) : [];
  });
  const [suggestions, setSuggestions] = useState([]);

  // Theme toggle state
  const [darkMode, setDarkMode] = useState(() => {
    // Load theme from localStorage or system preference
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("theme");
      if (saved) return saved === "dark";
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    return false;
  });

  // Effect to update <html> class and persist theme
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  let bgImage = "default.jpg";
  if (
    weather &&
    weather.weather &&
    Array.isArray(weather.weather) &&
    weather.weather.length > 0 &&
    weather.weather[0].icon &&
    weatherBgMapping[weather.weather[0].icon]
  ) {
    bgImage = weatherBgMapping[weather.weather[0].icon];
  }

  async function getWeatherData(cityName = city, unitsVal = units) {
    setLoading(true);
    setError("");
    try {
      const data = await fetchWeather(cityName, unitsVal);
      if (data.cod !== 200) throw new Error(data.message);
      setWeather(data);

      const forecastData = await fetchForecast(cityName, unitsVal);
      setForecast(getDailyForecast(forecastData.list));

      if (data.coord) {
        const aqiData = await fetchAQI(data.coord.lat, data.coord.lon);
        setAqi(aqiData.list && aqiData.list[0]);
      } else {
        setAqi(null);
      }
      setCity(data.name);
    } catch (err) {
      setError(err.message || "Failed to fetch weather data.");
      setWeather(null);
      setForecast([]);
      setAqi(null);
    }
    setLoading(false);
  }

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

  function handleSearch(e) {
    e.preventDefault();
    getWeatherData(city);
  }

  async function fetchSuggestions(query) {
    if (!query) return setSuggestions([]);
    try {
      const res = await fetch(
        `https://wft-geo-db.p.rapidapi.com/v1/geo/cities?namePrefix=${query}&limit=5`,
        {
          headers: {
            "X-RapidAPI-Key": "cd42d420f2msh1d2c8fc861fea31p1c1838jsn5193ba0cc508",
            "X-RapidAPI-Host": "wft-geo-db.p.rapidapi.com"
          }
        }
      );
      const data = await res.json();
      setSuggestions(data.data.map(city => city.city));
    } catch (err) {
      setSuggestions([]);
    }
  }

  function addFavourite(cityName) {
    if (!favourites.includes(cityName)) {
      const updated = [...favourites, cityName];
      setFavourites(updated);
      localStorage.setItem("favourites", JSON.stringify(updated));
    }
  }

  function removeFavourite(cityName) {
    const updated = favourites.filter(c => c !== cityName);
    setFavourites(updated);
    localStorage.setItem("favourites", JSON.stringify(updated));
  }

  useEffect(() => {
    getWeatherData();
    // eslint-disable-next-line
  }, [units]);

  return (
    <>
      {/* Fixed background and overlay */}
     <div
  className="app-background fixed inset-0 w-full h-full bg-cover bg-center -z-10"
  style={{ backgroundImage: `url(/backgrounds/${bgImage})` }}
>
  <div className="background-overlay"></div>
</div>


      {/* Scrollable content container */}
<div className="weather-app text-gray-900 dark:text-white transition-colors duration-300">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h1 className="main-title">Weather App</h1>
          {/* Theme Toggle Button */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 transition-colors duration-200"
            style={{ fontWeight: "bold", fontSize: "1.2em" }}
            aria-label="Toggle theme"
          >
            {darkMode ? "🌙 Dark" : "☀️ Light"}
          </button>
        </div>

        {/* Favourites List and Add Button */}
        <div className="favourites-list" style={{ marginBottom: 12, display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
          {favourites.map(fav => (
            <button
              key={fav}
              className="search-btn favourite-btn"
              style={{
                marginRight: 4,
                marginBottom: 4,
                background: "#e0e7ff",
                color: "#222",
                display: "flex",
                alignItems: "center",
                fontWeight: "bold"
              }}
              onClick={() => getWeatherData(fav)}
              type="button"
            >
              <span style={{ marginRight: 6, color: "#ff3366", fontSize: "1.1em" }}>❤️</span>
              {fav}
            </button>
          ))}
          {weather && !favourites.includes(city) && (
            <button
              className="search-btn favourite-btn"
              style={{
                background: "#ffebee",
                color: "#c62828",
                marginLeft: 6,
                fontWeight: "bold",
                display: "inline-flex",
                alignItems: "center"
              }}
              onClick={() => addFavourite(city)}
              type="button"
            >
              <span style={{ marginRight: 6, fontSize: "1.2em" }}>🤍</span>
              Add to Favourites
            </button>
          )}
        </div>

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

        {weather && favourites.includes(city) && (
          <button
            className="search-btn"
            style={{ background: "#f44336", marginTop: 12, fontWeight: "bold" }}
            onClick={() => removeFavourite(city)}
            type="button"
          >
            <span style={{ marginRight: 6, fontSize: "1.1em" }}>💔</span>
            Remove from Favourites
          </button>
        )}
      </div>
    </>
  );
}
