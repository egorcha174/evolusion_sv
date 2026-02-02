
import type { WeatherForecast } from '$domains/weather/types';


export async function fetchFromYandex(
    apiKey: string,
    location: { lat: number; lon: number }
): Promise<WeatherForecast> {
    const url = `https://api.weather.yandex.ru/v2/forecast?lat=${location.lat}&lon=${location.lon}&lang=en_US&limit=7`;

    const response = await fetch(url, {
        headers: {
            'X-Yandex-API-Key': apiKey
        }
    });

    if (!response.ok) {
        throw new Error(`Yandex Weather API error: ${response.statusText}`);
    }

    const data = await response.json();

    return {
        current: {
            condition: data.fact.condition,
            temperature: data.fact.temp,
            humidity: data.fact.humidity,
            pressure: data.fact.pressure_mm,
            windSpeed: data.fact.wind_speed,
            windBearing: data.fact.wind_dir ? windDirectionToDegrees(data.fact.wind_dir) : undefined
        },
        forecast: data.forecasts.map((day: any) => ({
            datetime: day.date,
            condition: day.parts.day.condition,
            temperature: day.parts.day.temp_max,
            templow: day.parts.day.temp_min,
            precipitation: day.parts.day.prec_mm,
            precipitationProbability: day.parts.day.prec_prob
        })),
        attribution: 'Data provided by Yandex.Weather'
    };
}

function windDirectionToDegrees(direction: string): number {
    const directions: Record<string, number> = {
        'n': 0, 'ne': 45, 'e': 90, 'se': 135,
        's': 180, 'sw': 225, 'w': 270, 'nw': 315
    };
    return directions[direction] || 0;
}
