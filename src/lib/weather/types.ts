
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
