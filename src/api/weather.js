const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;
const BASE_URL = "https://api.openweathermap.org/data/2.5/";

export async function fetchWeather(city, units = "metric") {
  const res = await fetch(
    `${BASE_URL}weather?q=${city}&units=${units}&appid=${API_KEY}`
  );
  return res.json();
}

export async function fetchForecast(city, units = "metric") {
  const res = await fetch(
    `${BASE_URL}forecast?q=${city}&units=${units}&appid=${API_KEY}`
  );
  return res.json();
}
