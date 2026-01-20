
import type { WeatherProvider, Coordinates, WeatherData } from '../types';
import { getWeatherApiIcon } from '../icons';

export const weatherApiProvider: WeatherProvider = {
  id: 'weatherapi',
  name: 'WeatherAPI',
  requiresApiKey: true,

  async getWeather(coords: Coordinates, apiKey?: string): Promise<WeatherData> {
    if (!apiKey) throw new Error('API Key required for WeatherAPI');

    const url = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${coords.lat},${coords.lon}`;
    
    const res = await fetch(url);
    if (!res.ok) {
      if (res.status === 401 || res.status === 403) throw new Error('Invalid WeatherAPI Key');
      throw new Error(`WeatherAPI fetch failed: ${res.statusText}`);
    }

    const data = await res.json();
    const current = data.current;

    return {
      temperature: current.temp_c,
      condition: current.condition.text,
      icon: getWeatherApiIcon(current.condition.code),
      location: data.location.name || coords.name,
      updatedAt: new Date()
    };
  }
};
