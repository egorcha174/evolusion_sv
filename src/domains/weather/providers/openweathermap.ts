
import type { WeatherForecast } from '$domains/weather/types';


export async function fetchFromOpenWeatherMap(
    apiKey: string,
    location: { lat: number; lon: number }
): Promise<WeatherForecast> {
    // Current weather
    const currentUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${location.lat}&lon=${location.lon}&appid=${apiKey}&units=metric`;
    const currentResponse = await fetch(currentUrl);

    if (!currentResponse.ok) {
        throw new Error(`OpenWeatherMap API error: ${currentResponse.statusText}`);
    }

    const currentData = await currentResponse.json();

    // 5-day forecast
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${location.lat}&lon=${location.lon}&appid=${apiKey}&units=metric`;
    const forecastResponse = await fetch(forecastUrl);

    if (!forecastResponse.ok) {
        throw new Error(`OpenWeatherMap API error: ${forecastResponse.statusText}`);
    }

    const forecastData = await forecastResponse.json();

    // Aggregate hourly forecasts into daily
    const dailyForecasts = aggregateToDailyForecasts(forecastData.list);

    return {
        current: {
            condition: currentData.weather[0].main.toLowerCase(),
            temperature: currentData.main.temp,
            humidity: currentData.main.humidity,
            pressure: currentData.main.pressure,
            windSpeed: currentData.wind.speed,
            windBearing: currentData.wind.deg
        },
        forecast: dailyForecasts,
        attribution: 'Data provided by OpenWeatherMap'
    };
}

function aggregateToDailyForecasts(hourlyData: any[]) {
    const dailyMap = new Map<string, any[]>();

    // Group by date
    hourlyData.forEach(item => {
        const date = item.dt_txt.split(' ')[0]; // YYYY-MM-DD
        if (!dailyMap.has(date)) {
            dailyMap.set(date, []);
        }
        dailyMap.get(date)!.push(item);
    });

    // Aggregate each day
    const dailyForecasts = Array.from(dailyMap.entries()).map(([date, hours]) => {
        const temps = hours.map(h => h.main.temp);
        const conditions = hours.map(h => h.weather[0].main);
        const precip = hours.reduce((sum, h) => sum + (h.rain?.['3h'] || 0), 0);

        return {
            datetime: date,
            condition: conditions[0].toLowerCase(), // Use first condition
            temperature: Math.max(...temps),
            templow: Math.min(...temps),
            precipitation: precip,
            precipitationProbability: hours[0].pop ? Math.round(hours[0].pop * 100) : undefined
        };
    });

    return dailyForecasts.slice(0, 7); // Max 7 days
}
