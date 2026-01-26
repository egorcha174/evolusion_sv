import type {
  WeatherProvider,
  Coordinates,
  WeatherData,
  WeatherSettings,
  WeatherForecastDay,
} from '../types';
import { getWeatherIcon, getWeatherDescription } from '../icons';

export const openMeteoProvider: WeatherProvider = {
  id: 'openmeteo',
  name: 'Open-Meteo',
  requiresApiKey: false,

  async getWeather(coords: Coordinates, settings: WeatherSettings): Promise<WeatherData> {
    const params = new URLSearchParams({
      latitude: coords.lat.toString(),
      longitude: coords.lon.toString(),
      current_weather: 'true',
      timezone: 'auto',
      daily: 'weathercode,temperature_2m_max,temperature_2m_min',
    });

    const res = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`);
    if (!res.ok) {
      throw new Error(`OpenMeteo fetch failed: ${res.statusText}`);
    }

    const data = await res.json();
    const current = data.current_weather;

    if (!current) {
      throw new Error('No weather data received from OpenMeteo');
    }

    // Process Forecast
    const forecast: WeatherForecastDay[] = [];
    if (data.daily && data.daily.time) {
      const days = Math.min(settings.forecastDays, data.daily.time.length);

      // Skip today (index 0) usually, or include?
      // Usually forecast implies "upcoming", but users often want "Rest of today + Future".
      // OpenMeteo daily includes today. Let's start from index 1 (tomorrow) if we want "future",
      // or 0 if we want today's high/low. Let's do 0 for now as min/max for today is useful.
      // NOTE: Requirement says "future days". Let's verify standard UI.
      // Usually widget shows current, then list of *upcoming* days.
      // Let's start from index 1 (tomorrow).

      const count = Math.min(days, data.daily.time.length - 1);

      for (let i = 1; i <= count; i++) {
        forecast.push({
          date: new Date(data.daily.time[i]),
          minTemp: Math.round(data.daily.temperature_2m_min[i]),
          maxTemp: Math.round(data.daily.temperature_2m_max[i]),
          condition: getWeatherDescription(data.daily.weathercode[i]),
          icon: getWeatherIcon(data.daily.weathercode[i], settings.iconPack),
        });
      }
    }

    return {
      temperature: current.temperature,
      condition: getWeatherDescription(current.weathercode),
      icon: getWeatherIcon(current.weathercode, settings.iconPack),
      location: coords.name,
      updatedAt: new Date(),
      forecast,
    };
  },
};
