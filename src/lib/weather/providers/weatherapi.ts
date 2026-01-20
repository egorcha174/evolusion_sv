
import type { WeatherProvider, Coordinates, WeatherData, WeatherSettings, WeatherForecastDay } from '../types';
import { getWeatherIcon, mapWeatherApiCode } from '../icons';

export const weatherApiProvider: WeatherProvider = {
  id: 'weatherapi',
  name: 'WeatherAPI',
  requiresApiKey: true,

  async getWeather(coords: Coordinates, settings: WeatherSettings): Promise<WeatherData> {
    if (!settings.apiKey) throw new Error('API Key required for WeatherAPI');

    // WeatherAPI handles forecast via 'days' parameter.
    // Days includes today, so we ask for forecastDays + 1
    const daysToRequest = settings.showForecast ? settings.forecastDays + 1 : 1;
    
    const url = `https://api.weatherapi.com/v1/forecast.json?key=${settings.apiKey}&q=${coords.lat},${coords.lon}&days=${daysToRequest}`;
    
    const res = await fetch(url);
    if (!res.ok) {
      if (res.status === 401 || res.status === 403) throw new Error('Invalid WeatherAPI Key');
      throw new Error(`WeatherAPI fetch failed: ${res.statusText}`);
    }

    const data = await res.json();
    const current = data.current;
    const currentCode = mapWeatherApiCode(current.condition.code);

    const forecast: WeatherForecastDay[] = [];
    if (data.forecast && data.forecast.forecastday) {
      // Skip today (index 0)
      const futureDays = data.forecast.forecastday.slice(1, settings.forecastDays + 1);
      
      for (const day of futureDays) {
        const dayCode = mapWeatherApiCode(day.day.condition.code);
        forecast.push({
          date: new Date(day.date),
          minTemp: Math.round(day.day.mintemp_c),
          maxTemp: Math.round(day.day.maxtemp_c),
          condition: day.day.condition.text,
          icon: getWeatherIcon(dayCode, settings.iconPack)
        });
      }
    }

    return {
      temperature: current.temp_c,
      condition: current.condition.text,
      icon: getWeatherIcon(currentCode, settings.iconPack),
      location: data.location.name || coords.name,
      updatedAt: new Date(),
      forecast
    };
  }
};
