
import type { WeatherIconPack } from './types';

// Core mapping of codes to semantic keys
const CODE_TO_KEY: Record<number, string> = {
  0: 'sunny',
  1: 'partly-cloudy',
  2: 'partly-cloudy',
  3: 'cloudy',
  45: 'fog',
  48: 'fog',
  51: 'rain-light',
  53: 'rain',
  55: 'rain-heavy',
  56: 'rain-snow',
  57: 'rain-snow',
  61: 'rain-light',
  63: 'rain',
  65: 'rain-heavy',
  66: 'rain-snow',
  67: 'rain-snow',
  71: 'snow-light',
  73: 'snow',
  75: 'snow-heavy',
  77: 'snow',
  80: 'rain',
  81: 'rain-heavy',
  82: 'rain-heavy',
  85: 'snow',
  86: 'snow-heavy',
  95: 'lightning',
  96: 'lightning-rainy',
  99: 'lightning-rainy',
};

// Pack definitions
const PACKS: Record<WeatherIconPack, Record<string, string>> = {
  default: {
    'sunny': 'mdi:weather-sunny',
    'partly-cloudy': 'mdi:weather-partly-cloudy',
    'cloudy': 'mdi:weather-cloudy',
    'fog': 'mdi:weather-fog',
    'rain-light': 'mdi:weather-rainy',
    'rain': 'mdi:weather-pouring',
    'rain-heavy': 'mdi:weather-pouring',
    'rain-snow': 'mdi:weather-snowy-rainy',
    'snow-light': 'mdi:weather-snowy',
    'snow': 'mdi:weather-snowy',
    'snow-heavy': 'mdi:weather-snowy-heavy',
    'lightning': 'mdi:weather-lightning',
    'lightning-rainy': 'mdi:weather-lightning-rainy',
    'unknown': 'mdi:weather-cloudy'
  },
  outline: {
    'sunny': 'mdi:white-balance-sunny',
    'partly-cloudy': 'mdi:weather-partly-cloudy',
    'cloudy': 'mdi:cloud-outline',
    'fog': 'mdi:weather-fog',
    'rain-light': 'mdi:weather-rainy',
    'rain': 'mdi:weather-pouring',
    'rain-heavy': 'mdi:weather-pouring',
    'rain-snow': 'mdi:weather-snowy-rainy',
    'snow-light': 'mdi:weather-snowy',
    'snow': 'mdi:weather-snowy',
    'snow-heavy': 'mdi:weather-snowy-heavy',
    'lightning': 'mdi:weather-lightning',
    'lightning-rainy': 'mdi:weather-lightning-rainy',
    'unknown': 'mdi:cloud-outline'
  },
  filled: {
    'sunny': 'mdi:weather-sunny',
    'partly-cloudy': 'mdi:cloud',
    'cloudy': 'mdi:cloud',
    'fog': 'mdi:weather-fog',
    'rain-light': 'mdi:weather-rainy',
    'rain': 'mdi:weather-pouring',
    'rain-heavy': 'mdi:weather-pouring',
    'rain-snow': 'mdi:weather-snowy-rainy',
    'snow-light': 'mdi:weather-snowy',
    'snow': 'mdi:weather-snowy',
    'snow-heavy': 'mdi:weather-snowy-heavy',
    'lightning': 'mdi:weather-lightning',
    'lightning-rainy': 'mdi:weather-lightning-rainy',
    'unknown': 'mdi:cloud'
  }
};

export function getWeatherIcon(code: number, pack: WeatherIconPack = 'default'): string {
  const key = CODE_TO_KEY[code] || 'unknown';
  return PACKS[pack][key] || PACKS['default'][key] || 'mdi:weather-cloudy';
}

export function getWeatherDescription(code: number): string {
  // Returns translation key
  const map: Record<number, string> = {
    0: 'weather.status.clear',
    1: 'weather.status.fewClouds',
    2: 'weather.status.partlyCloudy',
    3: 'weather.status.overcast',
    45: 'weather.status.fog',
    48: 'weather.status.fog',
    51: 'weather.status.drizzle',
    53: 'weather.status.drizzle',
    55: 'weather.status.drizzle',
    56: 'weather.status.freezingDrizzle',
    57: 'weather.status.freezingDrizzle',
    61: 'weather.status.rain',
    63: 'weather.status.rain',
    65: 'weather.status.heavyRain',
    66: 'weather.status.freezingRain',
    67: 'weather.status.freezingRain',
    71: 'weather.status.snow',
    73: 'weather.status.snow',
    75: 'weather.status.heavySnow',
    77: 'weather.status.snow',
    80: 'weather.status.showers',
    81: 'weather.status.showers',
    82: 'weather.status.showers',
    85: 'weather.status.snowShowers',
    86: 'weather.status.snowShowers',
    95: 'weather.status.thunderstorm',
    96: 'weather.status.thunderstormHail',
    99: 'weather.status.thunderstormHail',
  };
  return map[code] || 'weather.status.unknown';
}

/**
 * Maps OpenWeatherMap Codes to WMO Code for unified handling
 */
export function mapOpenWeatherMapCode(id: number): number {
  if (id >= 200 && id < 300) return 95; // Thunderstorm
  if (id >= 300 && id < 400) return 51; // Drizzle
  if (id >= 500 && id < 600) return 61; // Rain
  if (id >= 600 && id < 700) return 71; // Snow
  if (id >= 700 && id < 800) return 45; // Fog
  if (id === 800) return 0; // Clear
  if (id === 801) return 1; // Few clouds
  if (id === 802) return 2; // Scattered clouds
  if (id >= 803) return 3; // Broken/Overcast
  return 3;
}

/**
 * Maps WeatherAPI Condition Codes to WMO Code
 */
export function mapWeatherApiCode(code: number): number {
  const map: Record<number, number> = {
    1000: 0, // Sunny
    1003: 1, // Partly cloudy
    1006: 3, // Cloudy
    1009: 3, // Overcast
    1030: 45, // Mist
    1063: 51, // Patchy rain possible
    1066: 71, // Patchy snow possible
    1069: 56, // Patchy sleet possible
    1072: 56, // Patchy freezing drizzle possible
    1087: 95, // Thundery outbreaks possible
    1114: 77, // Blowing snow
    1117: 75, // Blizzard
    1135: 45, // Fog
    1147: 48, // Freezing fog
    1150: 51, // Patchy light drizzle
    1153: 51, // Light drizzle
    1180: 61, // Patchy light rain
    1183: 61, // Light rain
    1186: 63, // Moderate rain at times
    1189: 63, // Moderate rain
    1192: 65, // Heavy rain at times
    1195: 65, // Heavy rain
    1198: 66, // Light freezing rain
    1201: 67, // Moderate or heavy freezing rain
    1204: 56, // Light sleet
    1207: 56, // Moderate or heavy sleet
    1210: 71, // Patchy light snow
    1213: 71, // Light snow
    1216: 73, // Patchy moderate snow
    1219: 73, // Moderate snow
    1222: 75, // Patchy heavy snow
    1225: 75, // Heavy snow
    1237: 77, // Ice pellets
    1240: 80, // Light rain shower
    1243: 81, // Moderate or heavy rain shower
    1246: 82, // Torrential rain shower
    1249: 66, // Light sleet showers
    1252: 67, // Moderate or heavy sleet showers
    1255: 85, // Light snow showers
    1258: 86, // Moderate or heavy snow showers
    1261: 96, // Light showers of ice pellets
    1264: 99, // Moderate or heavy showers of ice pellets
    1273: 95, // Patchy light rain with thunder
    1276: 95, // Moderate or heavy rain with thunder
    1279: 95, // Patchy light snow with thunder
    1282: 95, // Moderate or heavy snow with thunder
  };
  return map[code] || 3;
}
