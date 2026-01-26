import { get } from 'svelte/store';
import { haStore } from '../../domains/ha/store';
import type { Coordinates, WeatherData, WeatherProviderType, WeatherSettings } from './types';
import { openMeteoProvider } from './providers/openmeteo';
import { openWeatherMapProvider } from './providers/openweathermap';
import { weatherApiProvider } from './providers/weatherapi';

const CHELYABINSK: Coordinates = {
  lat: 55.1644,
  lon: 61.4368,
  name: 'Chelyabinsk (Fallback)',
};

// Factory
function getProvider(type: WeatherProviderType) {
  switch (type) {
    case 'openweathermap':
      return openWeatherMapProvider;
    case 'weatherapi':
      return weatherApiProvider;
    case 'openmeteo':
    default:
      return openMeteoProvider;
  }
}

// Coordinate Resolution Logic
export function resolveCoordinates(settings: WeatherSettings): Coordinates {
  // 1. Custom Location
  if (settings.useCustomLocation && settings.customLocation) {
    return {
      lat: settings.customLocation.lat,
      lon: settings.customLocation.lon,
      name: settings.customLocation.name || 'Custom Location',
    };
  }

  // 2. Home Assistant Zone
  const state = get(haStore);
  const homeZone = state.entities.get('zone.home');

  if (homeZone && homeZone.attributes.latitude && homeZone.attributes.longitude) {
    return {
      lat: homeZone.attributes.latitude,
      lon: homeZone.attributes.longitude,
      name: homeZone.attributes.friendly_name || 'Home',
    };
  }

  // 3. Fallback
  return CHELYABINSK;
}

export async function fetchWeather(settings: WeatherSettings): Promise<WeatherData> {
  const provider = getProvider(settings.provider);
  const coords = resolveCoordinates(settings);

  // Pass full settings so providers can respect days, icon packs, etc.
  return provider.getWeather(coords, settings);
}
