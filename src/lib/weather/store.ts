
import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import type { WeatherState } from './types';
import { fetchWeather, CHELYABINSK } from './service';

const initialState: WeatherState = {
  current: null,
  isLoading: false,
  error: null
};

export const weatherStore = writable<WeatherState>(initialState);

let pollInterval: ReturnType<typeof setInterval> | null = null;

export async function initWeather() {
  if (!browser) return;

  // Clear existing interval if re-initializing
  if (pollInterval) clearInterval(pollInterval);

  // Initial fetch
  await updateWeather();

  // Poll every 15 minutes
  pollInterval = setInterval(updateWeather, 15 * 60 * 1000);
}

async function updateWeather() {
  // Only set loading on first load or if error exists, to avoid flashing UI on background updates
  weatherStore.update(s => ({ 
    ...s, 
    isLoading: s.current ? false : true, 
    error: null 
  }));

  try {
    const data = await fetchWeather(CHELYABINSK);
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

export function destroyWeather() {
  if (pollInterval) {
    clearInterval(pollInterval);
    pollInterval = null;
  }
}
