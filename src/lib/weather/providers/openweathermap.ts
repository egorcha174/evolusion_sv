
import type { WeatherProvider, Coordinates, WeatherData } from '../types';
import { getOpenWeatherMapIcon } from '../icons';

export const openWeatherMapProvider: WeatherProvider = {
  id: 'openweathermap',
  name: 'OpenWeatherMap',
  requiresApiKey: true,

  async getWeather(coords: Coordinates, apiKey?: string): Promise<WeatherData> {
    if (!apiKey) throw new Error('API Key required for OpenWeatherMap');

    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${coords.lat}&lon=${coords.lon}&appid=${apiKey}&units=metric`;
    
    const res = await fetch(url);
    if (!res.ok) {
      if (res.status === 401) throw new Error('Invalid OpenWeatherMap API Key');
      throw new Error(`OpenWeatherMap fetch failed: ${res.statusText}`);
    }

    const data = await res.json();

    return {
      temperature: Math.round(data.main.temp * 10) / 10,
      condition: data.weather[0]?.main || 'Unknown',
      icon: getOpenWeatherMapIcon(data.weather[0]?.id || 800),
      location: data.name || coords.name,
      updatedAt: new Date()
    };
  }
};
