export function weatherToAnimation(weatherType) {
  const main = weatherType.main.toLowerCase();
  const icon = weatherType.icon.toLowerCase();

  if (main === "clear") {
    return icon.includes("n") ? "night" : "sunny";
  }
  if (main === "clouds") {
    if (icon.includes("n")) return "cloudy-night";
    // Use 'partly-cloudy' for scattered/broken clouds, 'partly-shower' for overcast
    if (weatherType.description.toLowerCase().includes("scattered")) return "partly-cloudy";
    if (weatherType.description.toLowerCase().includes("broken")) return "partly-cloudy";
    return "partly-shower";
  }
  if (main === "rain") {
    if (icon.includes("n")) return "rainy-night";
    if (weatherType.description.toLowerCase().includes("storm")) return "storm-rain";
    return "partly-shower";
  }
  if (main === "thunderstorm") {
    return "storm-rain";
  }
  if (main === "snow") {
    return "snow";
  }
  if (main === "drizzle") {
    return "partly-shower";
  }
  if (main === "wind") {
    return "windy";
  }
  return "sunny"; // fallback
}
