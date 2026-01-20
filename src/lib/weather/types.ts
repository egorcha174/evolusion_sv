
export interface WeatherData {
  temperature: number;
  condition: string;
  icon: string; // mdi icon name
  location: string;
  updatedAt: Date;
}

export interface WeatherState {
  current: WeatherData | null;
  isLoading: boolean;
  error: string | null;
}

export interface Coordinates {
  lat: number;
  lon: number;
  name: string;
}

export type WeatherProviderType = 'openmeteo' | 'openweathermap' | 'weatherapi';

export interface WeatherSettings {
  provider: WeatherProviderType;
  apiKey?: string; // Optional, as OpenMeteo doesn't need it
  useCustomLocation: boolean;
  customLocation?: {
    lat: number;
    lon: number;
    name?: string;
  };
  refreshIntervalMinutes: number;
}

export interface WeatherProvider {
  id: WeatherProviderType;
  name: string;
  requiresApiKey: boolean;
  getWeather(coords: Coordinates, apiKey?: string): Promise<WeatherData>;
}
