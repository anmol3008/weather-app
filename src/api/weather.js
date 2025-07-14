// api/weather.js

const API_KEY = import.meta.env.VITE_WEATHER_API_KEY; // Use Vite env variable
const BASE_URL = "https://api.openweathermap.org/data/2.5";

// ...rest of your weather.js code


export async function fetchWeather(query, units = "metric") {
  let url;
  if (typeof query === "string") {
    url = `${BASE_URL}/weather?q=${encodeURIComponent(query)}&units=${units}&appid=${API_KEY}`;
  } else if (typeof query === "object" && query.lat && query.lon) {
    url = `${BASE_URL}/weather?lat=${query.lat}&lon=${query.lon}&units=${units}&appid=${API_KEY}`;
  } else {
    throw new Error("Invalid query for fetchWeather");
  }
  const res = await fetch(url);
  return res.json();
}

export async function fetchForecast(query, units = "metric") {
  let url;
  if (typeof query === "string") {
    url = `${BASE_URL}/forecast?q=${encodeURIComponent(query)}&units=${units}&appid=${API_KEY}`;
  } else if (typeof query === "object" && query.lat && query.lon) {
    url = `${BASE_URL}/forecast?lat=${query.lat}&lon=${query.lon}&units=${units}&appid=${API_KEY}`;
  } else {
    throw new Error("Invalid query for fetchForecast");
  }
  const res = await fetch(url);
  return res.json();
}


export async function fetchAQI(lat, lon) {
  const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;
  const url = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`;
  const res = await fetch(url);
  return res.json();
}

