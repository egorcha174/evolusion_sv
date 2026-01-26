import type {
  WeatherProvider,
  Coordinates,
  WeatherData,
  WeatherSettings,
  WeatherForecastDay,
} from '../types';
import { getWeatherIcon, getWeatherDescription, mapOpenWeatherMapCode } from '../icons';

export const openWeatherMapProvider: WeatherProvider = {
  id: 'openweathermap',
  name: 'OpenWeatherMap',
  requiresApiKey: true,

  async getWeather(coords: Coordinates, settings: WeatherSettings): Promise<WeatherData> {
    if (!settings.apiKey) throw new Error('API Key required for OpenWeatherMap');

    // Fetch Current
    const currentUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${coords.lat}&lon=${coords.lon}&appid=${settings.apiKey}&units=metric`;
    const currentRes = await fetch(currentUrl);
    if (!currentRes.ok) throw new Error(`OWM Current failed: ${currentRes.statusText}`);
    const currentData = await currentRes.json();
    const currentCode = mapOpenWeatherMapCode(currentData.weather[0]?.id || 800);

    // Fetch Forecast (5 day / 3 hour)
    let forecast: WeatherForecastDay[] = [];
    if (settings.showForecast) {
      const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${coords.lat}&lon=${coords.lon}&appid=${settings.apiKey}&units=metric`;
      const forecastRes = await fetch(forecastUrl);

      if (forecastRes.ok) {
        const forecastData = await forecastRes.json();
        forecast = processForecast(forecastData.list, settings);
      }
    }

    return {
      temperature: Math.round(currentData.main.temp * 10) / 10,
      condition: getWeatherDescription(currentCode),
      icon: getWeatherIcon(currentCode, settings.iconPack),
      location: currentData.name || coords.name,
      updatedAt: new Date(),
      forecast,
    };
  },
};

function processForecast(list: any[], settings: WeatherSettings): WeatherForecastDay[] {
  const dailyMap = new Map<
    string,
    { mins: number[]; maxs: number[]; codes: number[]; date: Date }
  >();

  // Group by YYYY-MM-DD
  for (const item of list) {
    const date = new Date(item.dt * 1000);
    const key = date.toISOString().split('T')[0];
    const today = new Date().toISOString().split('T')[0];

    // Skip today
    if (key === today) continue;

    if (!dailyMap.has(key)) {
      dailyMap.set(key, { mins: [], maxs: [], codes: [], date });
    }
    const day = dailyMap.get(key)!;
    day.mins.push(item.main.temp_min);
    day.maxs.push(item.main.temp_max);
    // Take the code at noon or first available
    if (date.getHours() >= 12 && date.getHours() <= 15) {
      day.codes.unshift(item.weather[0].id); // Prioritize noon
    } else {
      day.codes.push(item.weather[0].id);
    }
  }

  const result: WeatherForecastDay[] = [];
  const sortedKeys = Array.from(dailyMap.keys()).sort().slice(0, settings.forecastDays);

  for (const key of sortedKeys) {
    const data = dailyMap.get(key)!;
    const minTemp = Math.min(...data.mins);
    const maxTemp = Math.max(...data.maxs);
    // Prefer the first code (noon)
    const codeId = data.codes[0] || 800;
    const wmoCode = mapOpenWeatherMapCode(codeId);

    result.push({
      date: data.date,
      minTemp: Math.round(minTemp),
      maxTemp: Math.round(maxTemp),
      condition: getWeatherDescription(wmoCode),
      icon: getWeatherIcon(wmoCode, settings.iconPack),
    });
  }

  return result;
}
