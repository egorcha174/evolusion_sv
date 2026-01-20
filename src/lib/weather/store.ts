
import { writable, get } from 'svelte/store';
import { browser } from '$app/environment';
import type { WeatherState, WeatherSettings } from './types';
import { fetchWeather } from './service';

const SETTINGS_KEY = 'evolusion_weather_settings';

const defaultSettings: WeatherSettings = {
  provider: 'openmeteo',
  useCustomLocation: false,
  refreshIntervalMinutes: 15
};

const initialState: WeatherState = {
  current: null,
  isLoading: false,
  error: null
};

// --- Stores ---
export const weatherStore = writable<WeatherState>(initialState);
export const weatherSettings = writable<WeatherSettings>(defaultSettings);

// --- Logic ---
let pollInterval: ReturnType<typeof setInterval> | null = null;

export async function initWeather() {
  if (!browser) return;

  // Load Settings
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (stored) {
      weatherSettings.set({ ...defaultSettings, ...JSON.parse(stored) });
    }
  } catch (e) {
    console.error('Failed to load weather settings', e);
  }

  // Subscribe to settings changes to persist and re-trigger fetch if needed
  weatherSettings.subscribe(saveSettings);

  // Initial Fetch
  await updateWeather();
  startPolling();
}

export function startPolling() {
  if (pollInterval) clearInterval(pollInterval);
  const settings = get(weatherSettings);
  
  const minutes = Math.max(1, settings.refreshIntervalMinutes);
  pollInterval = setInterval(updateWeather, minutes * 60 * 1000);
}

export async function updateWeather() {
  const settings = get(weatherSettings);
  
  // Don't show loading on background refresh unless we have no data
  const currentData = get(weatherStore).current;
  
  weatherStore.update(s => ({ 
    ...s, 
    isLoading: !currentData, 
    error: null 
  }));

  try {
    const data = await fetchWeather(settings);
    weatherStore.set({
      current: data,
      isLoading: false,
      error: null
    });
  } catch (e: any) {
    console.error('Weather update failed', e);
    weatherStore.update(s => ({
      ...s,
      isLoading: false,
      error: e.message || 'Failed to update weather'
    }));
  }
}

export function saveSettings(settings: WeatherSettings) {
  if (!browser) return;
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

// Call this when settings change from UI to reset timer
export function refreshWeatherConfig() {
  updateWeather();
  startPolling();
}

export function destroyWeather() {
  if (pollInterval) {
    clearInterval(pollInterval);
    pollInterval = null;
  }
}
