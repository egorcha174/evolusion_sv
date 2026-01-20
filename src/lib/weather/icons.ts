
/**
 * Maps WMO Weather Codes (Open-Meteo) to MDI Icons
 * https://open-meteo.com/en/docs
 */
export function getWeatherIcon(code: number): string {
  const map: Record<number, string> = {
    0: 'mdi:weather-sunny',
    1: 'mdi:weather-partly-cloudy',
    2: 'mdi:weather-partly-cloudy',
    3: 'mdi:weather-cloudy',
    45: 'mdi:weather-fog',
    48: 'mdi:weather-fog',
    51: 'mdi:weather-pouring', // Drizzle
    53: 'mdi:weather-pouring',
    55: 'mdi:weather-pouring',
    56: 'mdi:weather-snowy-rainy', // Freezing Drizzle
    57: 'mdi:weather-snowy-rainy',
    61: 'mdi:weather-rainy', // Rain
    63: 'mdi:weather-rainy',
    65: 'mdi:weather-pouring',
    66: 'mdi:weather-snowy-rainy', // Freezing Rain
    67: 'mdi:weather-snowy-rainy',
    71: 'mdi:weather-snowy', // Snow
    73: 'mdi:weather-snowy',
    75: 'mdi:weather-snowy-heavy',
    77: 'mdi:weather-snowy', // Snow grains
    80: 'mdi:weather-rainy', // Showers
    81: 'mdi:weather-pouring',
    82: 'mdi:weather-pouring',
    85: 'mdi:weather-snowy', // Snow showers
    86: 'mdi:weather-snowy-heavy',
    95: 'mdi:weather-lightning', // Thunderstorm
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
