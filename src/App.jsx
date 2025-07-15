import React, { useState, useEffect } from "react";
import {
  fetchWeather,
  fetchForecast,
  fetchAQI,
  fetchHourlyForecast,
} from "./api/weather";
import WeatherCard from "./components/WeatherCard";
import Spinner from "./components/Spinner";
import Header from "./components/Header"; // <-- import your new header
import { weatherBgMapping } from "./utils/backgroundMapping";
import "./App.css";

function getDailyForecast(forecastList) {
  const daily = {};
  forecastList.forEach((item) => {
    const date = new Date(item.dt * 1000).toLocaleDateString();
    if (!daily[date]) daily[date] = [];
    daily[date].push(item);
  });

  return Object.values(daily)
    .slice(0, 5)
    .map((dayArr) => {
      const min = Math.min(...dayArr.map((d) => d.main.temp_min));
      const max = Math.max(...dayArr.map((d) => d.main.temp_max));
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
  const [hourlyForecast, setHourlyForecast] = useState([]);
  const [units, setUnits] = useState("metric");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [aqi, setAqi] = useState(null);
  const [favourites, setFavourites] = useState(() => {
    const stored = localStorage.getItem("favourites");
    return stored ? JSON.parse(stored) : [];
  });
  const [suggestions, setSuggestions] = useState([]);
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "light" || saved === "dark") return saved;
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) return "dark";
    return "light";
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

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

      const hourlyData = await fetchHourlyForecast(cityName, unitsVal);
      setHourlyForecast(hourlyData);

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
      setHourlyForecast([]);
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

      const hourlyData = await fetchHourlyForecast({ lat, lon }, unitsVal);
      setHourlyForecast(hourlyData);

      const aqiData = await fetchAQI(lat, lon);
      setAqi(aqiData.list && aqiData.list[0]);
      setCity(data.name);
    } catch (err) {
      setError(err.message || "Failed to fetch weather data.");
      setWeather(null);
      setForecast([]);
      setHourlyForecast([]);
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
      () => {
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
            "X-RapidAPI-Key": import.meta.env.VITE_GEO_API_KEY,
            "X-RapidAPI-Host": "wft-geo-db.p.rapidapi.com",
          },
        }
      );
      const data = await res.json();
      setSuggestions(data.data.map((city) => city.city));
    } catch {
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
    const updated = favourites.filter((c) => c !== cityName);
    setFavourites(updated);
    localStorage.setItem("favourites", JSON.stringify(updated));
  }

  useEffect(() => {
    getWeatherData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [units]);

  return (
    <>
      {/* Background Image */}
      <div
        className="app-background fixed inset-0 w-full h-full bg-cover bg-center -z-10"
        style={{ backgroundImage: `url(/backgrounds/${bgImage})` }}
        role="presentation"
        aria-hidden="true"
      >
        <div className="background-overlay"></div>
      </div>

      {/* Mawesome Header */}
      <Header
        theme={theme}
        setTheme={setTheme}
      />

      {/* Main App */}
      <div className="weather-app text-gray-900 dark:text-white flex flex-col items-center min-h-screen">
        {/* Favourites List */}
        <nav className="favourites-list mb-3 flex flex-wrap items-center gap-2">
          {favourites.map((fav) => (
            <button
              key={fav}
              className="search-btn favourite-btn"
              onClick={() => getWeatherData(fav)}
            >
              ❤️ {fav}
            </button>
          ))}
          {weather && !favourites.includes(city) && (
            <button
              className="search-btn favourite-btn"
              onClick={() => addFavourite(city)}
            >
              🤍 Add to Favourites
            </button>
          )}
        </nav>

        {/* Search Form */}
        <form className="search-form mb-6" onSubmit={handleSearch}>
          <input
            className="search-input"
            value={city}
            onChange={(e) => {
              setCity(e.target.value);
              fetchSuggestions(e.target.value);
            }}
            list="city-suggestions"
            placeholder="Enter city"
            autoComplete="off"
            required
          />
          <datalist id="city-suggestions">
            {suggestions.map((s) => (
              <option key={s} value={s} />
            ))}
          </datalist>
          <button className="search-btn" type="submit">
            Search
          </button>
          <button
            type="button"
            className="search-btn"
            onClick={handleUseMyLocation}
          >
            Use My Location
          </button>
        </form>

        {/* Status */}
        {loading && <Spinner />}
        {error && <div className="error-message">{error}</div>}

        {/* Weather Card Component (handles forecast and hourly) */}
        <WeatherCard
          weather={weather}
          units={units}
          onUnitChange={setUnits}
          forecast={forecast}
          aqi={aqi}
          hourlyForecast={hourlyForecast}
        />

        {/* Remove from favourites */}
        {weather && favourites.includes(city) && (
          <button
            className="search-btn mt-3"
            style={{ background: "#f44336", fontWeight: "bold" }}
            onClick={() => removeFavourite(city)}
            type="button"
          >
            💔 Remove from Favourites
          </button>
        )}
      </div>
    </>
  );
}
