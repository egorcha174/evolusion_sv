
export type WeatherProvider = 'homeassistant' | 'openweathermap' | 'yandex' | 'foreca';

export interface WeatherConfig {
    provider: WeatherProvider;
    apiKey?: string;
    entityId?: string; // For HA provider
    location?: {
        lat: number;
        lon: number;
    };
}

export interface WeatherCondition {
    condition: string;
    temperature: number;
    humidity?: number;
    pressure?: number;
    windSpeed?: number;
    windBearing?: number;
}

export interface WeatherForecastDay {
    datetime: string;
    condition: string;
    temperature: number;
    templow?: number;
    precipitation?: number;
    precipitationProbability?: number;
}

export interface WeatherForecast {
    current: WeatherCondition;
    forecast: WeatherForecastDay[];
    attribution?: string;
}

export interface WeatherState {
    config: WeatherConfig;
    forecast: WeatherForecast | null;
    loading: boolean;
    error: string | null;
    lastUpdate: number | null;
}
