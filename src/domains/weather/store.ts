
import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import type { WeatherState, WeatherConfig, WeatherForecast } from '$domains/weather/types';
import { fetchWeather } from '$domains/weather/api';


const STORAGE_KEY = 'evolusion_weather_config';
const REFRESH_INTERVAL = 30 * 60 * 1000; // 30 minutes

const initialState: WeatherState = {
    config: { provider: 'homeassistant' },
    forecast: null,
    loading: false,
    error: null,
    lastUpdate: null
};

function createWeatherStore() {
    const { subscribe, set, update } = writable<WeatherState>(initialState);
    let refreshInterval: ReturnType<typeof setInterval> | null = null;

    return {
        subscribe,

        async init() {
            if (!browser) return;

            try {
                const stored = localStorage.getItem(STORAGE_KEY);
                if (stored) {
                    const config = JSON.parse(stored) as WeatherConfig;
                    await this.setConfig(config);
                }
            } catch (e) {
                console.error('Failed to load weather config', e);
            }
        },

        async setConfig(config: WeatherConfig) {
            update(state => ({ ...state, config, loading: true, error: null }));

            if (browser) {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
            }

            try {
                const forecast = await fetchWeather(config);
                update(state => ({
                    ...state,
                    forecast,
                    loading: false,
                    lastUpdate: Date.now()
                }));

                // Setup auto-refresh
                this.startAutoRefresh();
            } catch (error: any) {
                update(state => ({
                    ...state,
                    error: error.message || 'Failed to fetch weather',
                    loading: false
                }));
            }
        },

        async refresh() {
            const state = await new Promise<WeatherState>(resolve => {
                const unsubscribe = subscribe(s => {
                    unsubscribe();
                    resolve(s);
                });
            });

            if (!state.config) return;

            update(s => ({ ...s, loading: true }));

            try {
                const forecast = await fetchWeather(state.config);
                update(s => ({
                    ...s,
                    forecast,
                    loading: false,
                    lastUpdate: Date.now(),
                    error: null
                }));
            } catch (error: any) {
                update(s => ({
                    ...s,
                    error: error.message || 'Failed to refresh weather',
                    loading: false
                }));
            }
        },

        startAutoRefresh() {
            if (refreshInterval) {
                clearInterval(refreshInterval);
            }

            refreshInterval = setInterval(() => {
                this.refresh();
            }, REFRESH_INTERVAL);
        },

        stopAutoRefresh() {
            if (refreshInterval) {
                clearInterval(refreshInterval);
                refreshInterval = null;
            }
        },

        reset() {
            this.stopAutoRefresh();
            set(initialState);
            if (browser) {
                localStorage.removeItem(STORAGE_KEY);
            }
        }
    };
}

export const weatherStore = createWeatherStore();
