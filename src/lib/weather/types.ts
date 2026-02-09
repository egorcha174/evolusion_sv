
export interface WeatherForecastDay {
  date: Date;
  minTemp: number;
  maxTemp: number;
  condition: string;
  icon: string;
}

export interface WeatherData {
  temperature: number;
  condition: string;
  icon: string; // mdi icon name
  location: string;
  updatedAt: Date;
  forecast: WeatherForecastDay[];
  weatherCode: number;
  isDay: boolean; // NEW
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

export type WeatherProviderType = 'openmeteo' | 'openweathermap' | 'weatherapi' | 'yandex' | 'homeassistant';
export type WeatherIconPack = 'default' | 'outline' | 'filled' | 'meteocons' | 'weather-icons' | 'material-symbols';
export type ForecastLayout = 'vertical' | 'horizontal';

export interface WeatherSettings {
  provider: WeatherProviderType;
  apiKey?: string; // Optional, as OpenMeteo doesn't need it
  useCustomLocation: boolean;
  latitude?: number;
  longitude?: number;
  locationName?: string;
  refreshIntervalMinutes: number;
  // Forecast settings
  showForecast: boolean;
  forecastDays: number; // 1-7
  iconPack: WeatherIconPack;
  forecastLayout: ForecastLayout;

  // Forecast Item Styling
  forecastItemBgOpacity: number;     // 0-100
  forecastItemBorderRadius: number;  // px
  enableIconAnimation: boolean;

  // Visual Configuration (Global)
  currentIconSize: number;
  currentTempSize: number;
  currentDescSize: number;
  forecastIconSize: number;
  forecastDaySize: number;
  forecastTempSize: number;
}

export interface WeatherProvider {
  id: WeatherProviderType;
  name: string;
  requiresApiKey: boolean;
  getWeather(coords: Coordinates, settings: WeatherSettings): Promise<WeatherData>;
}
