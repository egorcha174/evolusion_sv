
import type { Coordinates, WeatherData } from './types';
import { getWeatherIcon, getWeatherDescription } from './icons';

export const CHELYABINSK: Coordinates = {
  lat: 55.1644,
  lon: 61.4368,
  name: 'Chelyabinsk'
};

export async function fetchWeather(coords: Coordinates): Promise<WeatherData> {
  const params = new URLSearchParams({
    latitude: coords.lat.toString(),
    longitude: coords.lon.toString(),
    current_weather: 'true',
    timezone: 'auto'
  });

  const res = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`);
  if (!res.ok) {
    throw new Error(`Weather fetch failed: ${res.statusText}`);
  }

  const data = await res.json();
  const current = data.current_weather;

  if (!current) {
    throw new Error('No weather data received');
  }

  return {
    temperature: current.temperature,
    condition: getWeatherDescription(current.weathercode),
    icon: getWeatherIcon(current.weathercode),
    location: coords.name,
    updatedAt: new Date()
  };
}
