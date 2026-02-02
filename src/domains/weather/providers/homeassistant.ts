
import { getEntity } from '$domains/ha/store';
import type { WeatherForecast } from '$domains/weather/types';


export async function fetchFromHomeAssistant(entityId: string): Promise<WeatherForecast> {
    const entity = getEntity(entityId);

    if (!entity) {
        throw new Error(`Weather entity ${entityId} not found`);
    }

    const current = {
        condition: entity.state,
        temperature: entity.attributes.temperature ?? 0,
        humidity: entity.attributes.humidity,
        pressure: entity.attributes.pressure,
        windSpeed: entity.attributes.wind_speed,
        windBearing: entity.attributes.wind_bearing
    };

    const forecast = (entity.attributes.forecast || []).map((day: any) => ({
        datetime: day.datetime,
        condition: day.condition,
        temperature: day.temperature,
        templow: day.templow,
        precipitation: day.precipitation,
        precipitationProbability: day.precipitation_probability
    }));

    return {
        current,
        forecast,
        attribution: entity.attributes.attribution
    };
}
