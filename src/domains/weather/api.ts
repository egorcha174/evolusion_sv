
import type { WeatherConfig, WeatherForecast } from '$domains/weather/types';
import { fetchFromHomeAssistant } from '$domains/weather/providers/homeassistant';
import { fetchFromOpenWeatherMap } from '$domains/weather/providers/openweathermap';
import { fetchFromYandex } from '$domains/weather/providers/yandex';


export async function fetchWeather(config: WeatherConfig): Promise<WeatherForecast> {
    switch (config.provider) {
        case 'homeassistant':
            if (!config.entityId) {
                throw new Error('Entity ID required for Home Assistant provider');
            }
            return fetchFromHomeAssistant(config.entityId);

        case 'openweathermap':
            if (!config.apiKey || !config.location) {
                throw new Error('API key and location required for OpenWeatherMap');
            }
            return fetchFromOpenWeatherMap(config.apiKey, config.location);

        case 'yandex':
            if (!config.apiKey || !config.location) {
                throw new Error('API key and location required for Yandex Weather');
            }
            return fetchFromYandex(config.apiKey, config.location);

        case 'foreca':
            throw new Error('Foreca provider not yet implemented');

        default:
            throw new Error(`Unknown weather provider: ${config.provider}`);
    }
}
