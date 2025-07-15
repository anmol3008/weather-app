const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;
const BASE_URL = "https://api.openweathermap.org/data/2.5";

// Fetch current weather (by city or {lat, lon})
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

// Fetch daily/3-hour forecast (by city or {lat, lon})
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

// Fetch AQI by coordinates
export async function fetchAQI(lat, lon) {
  const url = `${BASE_URL}/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`;
  const res = await fetch(url);
  return res.json();
}

// Fetch hourly forecast (OpenWeather free users: derive from /forecast endpoint)
export async function fetchHourlyForecast(query, units = "metric") {
  let url;
  if (typeof query === "string") {
    url = `${BASE_URL}/forecast?q=${encodeURIComponent(query)}&units=${units}&appid=${API_KEY}`;
  } else if (typeof query === "object" && query.lat && query.lon) {
    url = `${BASE_URL}/forecast?lat=${query.lat}&lon=${query.lon}&units=${units}&appid=${API_KEY}`;
  } else {
    throw new Error("Invalid query for fetchHourlyForecast");
  }
  const res = await fetch(url);
  const data = await res.json();
  // Return the next 8 entries = next 24 hours (3-hour intervals)
  const now = Date.now() / 1000;
  // Filter only future forecasts
  const list = data.list.filter(item => item.dt > now).slice(0, 8);
  return list;
}
