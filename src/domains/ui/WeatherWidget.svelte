<script lang="ts">
	import { ha } from '../ha/store.svelte.ts';
	import AnimatedWeatherIcon from './AnimatedWeatherIcon.svelte';
	import type { WeatherData } from '$lib/types';

	let { class: className = '' } = $props<{ class?: string }>();

	const weatherData: WeatherData | null = $derived(ha.state.weatherData);
	const weatherSettings = $derived(ha.state.weatherSettings);
</script>

{#if !weatherData}
	<div class="flex items-center gap-3 opacity-50 {className}">
		<div class="w-14 h-14 flex-shrink-0 bg-gray-700 rounded-full animate-pulse"></div>
		<div class="w-full">
			<div class="h-6 bg-gray-700 rounded w-1/3 animate-pulse"></div>
			<div class="h-4 bg-gray-700 rounded w-2/3 mt-2 animate-pulse"></div>
		</div>
	</div>
{:else}
	<div class="{className} weather-widget-container">
		<!-- Current weather -->
		<div class="flex flex-col">
			<div class="flex items-center gap-2">
				<AnimatedWeatherIcon
					iconCode={weatherData.current.icon}
					iconPack={weatherSettings.iconPack}
					class="w-24 h-24 flex-shrink-0"
					style="width: var(--weather-icon-size); height: var(--weather-icon-size);"
				/>
				<p class="text-4xl font-bold" style="color: var(--text-value); font-size: var(--weather-current-temp-size);">
					{Math.round(weatherData.current.temp)}°C
				</p>
			</div>
			<div class="w-24 text-center -mt-2">
				<p class="text-sm capitalize" title={weatherData.current.desc} style="color: var(--text-status); font-size: var(--weather-current-desc-size);">
					{weatherData.current.desc}
				</p>
			</div>
		</div>

		<!-- Forecast -->
		{#if weatherData.forecast.length > 0}
			<div
				class="mt-4 grid gap-2 text-center"
				style="grid-template-columns: repeat({Math.min(
					weatherData.forecast.length,
					weatherSettings.forecastDays
				)}, minmax(0, 1fr));"
			>
				{#each weatherData.forecast.slice(0, weatherSettings.forecastDays) as day, index (index)}
					<div class="flex flex-col items-center space-y-1">
						<p class="text-xs font-medium capitalize" style="color: var(--text-name); font-size: var(--weather-forecast-day-size);">
							{day.day}
						</p>
						<AnimatedWeatherIcon
							iconCode={day.icon}
							iconPack={weatherSettings.iconPack}
							class="w-12 h-12"
							style="width: var(--weather-forecast-icon-size); height: var(--weather-forecast-icon-size);"
						/>
						<div>
							<p class="text-lg font-semibold" style="color: var(--text-value); font-size: var(--weather-forecast-max-temp-size);">
								{Math.round(day.tempMax)}°
							</p>
							<p class="text-sm -mt-1" style="color: var(--text-status); font-size: var(--weather-forecast-min-temp-size);">
								{Math.round(day.tempMin)}°
							</p>
						</div>
					</div>
				{/each}
			</div>
		{:else}
			<div class="mt-4 text-center text-sm opacity-60 py-2" style="color: var(--text-status);">Forecast not available</div>
		{/if}
	</div>
{/if}
