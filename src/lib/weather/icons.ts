
/**
 * Maps WMO Weather Codes (Open-Meteo) to MDI Icons
 */
export function getWeatherIcon(code: number): string {
  const map: Record<number, string> = {
    0: 'mdi:weather-sunny',
    1: 'mdi:weather-partly-cloudy',
    2: 'mdi:weather-partly-cloudy',
    3: 'mdi:weather-cloudy',
    45: 'mdi:weather-fog',
    48: 'mdi:weather-fog',
    51: 'mdi:weather-pouring',
    53: 'mdi:weather-pouring',
    55: 'mdi:weather-pouring',
    56: 'mdi:weather-snowy-rainy',
    57: 'mdi:weather-snowy-rainy',
    61: 'mdi:weather-rainy',
    63: 'mdi:weather-rainy',
    65: 'mdi:weather-pouring',
    66: 'mdi:weather-snowy-rainy',
    67: 'mdi:weather-snowy-rainy',
    71: 'mdi:weather-snowy',
    73: 'mdi:weather-snowy',
    75: 'mdi:weather-snowy-heavy',
    77: 'mdi:weather-snowy',
    80: 'mdi:weather-rainy',
    81: 'mdi:weather-pouring',
    82: 'mdi:weather-pouring',
    85: 'mdi:weather-snowy',
    86: 'mdi:weather-snowy-heavy',
    95: 'mdi:weather-lightning',
    96: 'mdi:weather-lightning-rainy',
    99: 'mdi:weather-lightning-rainy',
  };
  return map[code] || 'mdi:weather-cloudy';
}

export function getWeatherDescription(code: number): string {
  const map: Record<number, string> = {
    0: 'Clear sky',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Fog',
    48: 'Depositing rime fog',
    51: 'Light drizzle',
    53: 'Moderate drizzle',
    55: 'Dense drizzle',
    56: 'Light freezing drizzle',
    57: 'Dense freezing drizzle',
    61: 'Slight rain',
    63: 'Moderate rain',
    65: 'Heavy rain',
    66: 'Light freezing rain',
    67: 'Heavy freezing rain',
    71: 'Slight snow fall',
    73: 'Moderate snow fall',
    75: 'Heavy snow fall',
    77: 'Snow grains',
    80: 'Slight rain showers',
    81: 'Moderate rain showers',
    82: 'Violent rain showers',
    85: 'Slight snow showers',
    86: 'Heavy snow showers',
    95: 'Thunderstorm',
    96: 'Thunderstorm with slight hail',
    99: 'Thunderstorm with heavy hail',
  };
  return map[code] || 'Unknown';
}

/**
 * Maps OpenWeatherMap Icon Codes to MDI
 * https://openweathermap.org/weather-conditions
 */
export function getOpenWeatherMapIcon(id: number): string {
  // Group 2xx: Thunderstorm
  if (id >= 200 && id < 300) return 'mdi:weather-lightning';
  // Group 3xx: Drizzle
  if (id >= 300 && id < 400) return 'mdi:weather-pouring';
  // Group 5xx: Rain
  if (id >= 500 && id < 600) return 'mdi:weather-rainy';
  // Group 6xx: Snow
  if (id >= 600 && id < 700) return 'mdi:weather-snowy';
  // Group 7xx: Atmosphere (Fog, Mist, etc)
  if (id >= 700 && id < 800) return 'mdi:weather-fog';
  // Group 800: Clear
  if (id === 800) return 'mdi:weather-sunny';
  // Group 80x: Clouds
  if (id > 800) return 'mdi:weather-cloudy';
  
  return 'mdi:weather-cloudy';
}

/**
 * Maps WeatherAPI Condition Codes to MDI
 * https://www.weatherapi.com/docs/weather_conditions.json
 */
export function getWeatherApiIcon(code: number): string {
  const map: Record<number, string> = {
    1000: 'mdi:weather-sunny',
    1003: 'mdi:weather-partly-cloudy',
    1006: 'mdi:weather-cloudy',
    1009: 'mdi:weather-cloudy',
    1030: 'mdi:weather-fog',
    1063: 'mdi:weather-rainy',
    1066: 'mdi:weather-snowy',
    1069: 'mdi:weather-snowy-rainy',
    1072: 'mdi:weather-snowy-rainy',
    1087: 'mdi:weather-lightning',
    1114: 'mdi:weather-snowy',
    1117: 'mdi:weather-snowy-heavy',
    1135: 'mdi:weather-fog',
    1147: 'mdi:weather-fog',
    1150: 'mdi:weather-pouring',
    1153: 'mdi:weather-pouring',
    1180: 'mdi:weather-rainy',
    1183: 'mdi:weather-rainy',
    1186: 'mdi:weather-rainy',
    1189: 'mdi:weather-rainy',
    1192: 'mdi:weather-pouring',
    1195: 'mdi:weather-pouring',
    1198: 'mdi:weather-snowy-rainy',
    1201: 'mdi:weather-snowy-rainy',
    1204: 'mdi:weather-snowy-rainy',
    1207: 'mdi:weather-snowy-rainy',
    1210: 'mdi:weather-snowy',
    1213: 'mdi:weather-snowy',
    1216: 'mdi:weather-snowy',
    1219: 'mdi:weather-snowy',
    1222: 'mdi:weather-snowy-heavy',
    1225: 'mdi:weather-snowy-heavy',
    1237: 'mdi:weather-hail',
    1240: 'mdi:weather-rainy',
    1243: 'mdi:weather-pouring',
    1246: 'mdi:weather-pouring',
    1249: 'mdi:weather-snowy-rainy',
    1252: 'mdi:weather-snowy-rainy',
    1255: 'mdi:weather-snowy',
    1258: 'mdi:weather-snowy-heavy',
    1261: 'mdi:weather-hail',
    1264: 'mdi:weather-hail',
    1273: 'mdi:weather-lightning-rainy',
    1276: 'mdi:weather-lightning-rainy',
    1279: 'mdi:weather-lightning-rainy', // Snow lightning
    1282: 'mdi:weather-lightning-rainy',
  };
  return map[code] || 'mdi:weather-cloudy';
}
