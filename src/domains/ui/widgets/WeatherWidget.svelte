<script lang="ts">
  import { t, locale } from "svelte-i18n";
  import { weatherStore, weatherSettings } from "../../../lib/weather/store";
  import "iconify-icon";

  function formatDay(date: Date): string {
    return date.toLocaleDateString($locale || "en", { weekday: "short" });
  }

  // Animation class map by WMO weather code ranges
  const weatherAnimationMap: Record<string, string> = {
    sunny: "animate-sunny",
    night: "animate-night",
    cloudy: "animate-cloudy",
    rainy: "animate-rainy",
    snowy: "animate-snowy",
    stormy: "animate-stormy",
    foggy: "animate-foggy",
  };

  function getAnimationClass(weatherCode: number, isDay: boolean): string {
    if (!$weatherSettings.enableIconAnimation) return "";

    // WMO Weather interpretation codes mapping
    if (weatherCode === 0) return isDay ? "animate-sunny" : "animate-night";
    if (weatherCode >= 1 && weatherCode <= 3) return "animate-cloudy";
    if (weatherCode >= 45 && weatherCode <= 48) return "animate-foggy";
    if (weatherCode >= 51 && weatherCode <= 67) return "animate-rainy";
    if (weatherCode >= 71 && weatherCode <= 77) return "animate-snowy";
    if (weatherCode >= 80 && weatherCode <= 82) return "animate-rainy";
    if (weatherCode >= 85 && weatherCode <= 86) return "animate-snowy";
    if (weatherCode >= 95 && weatherCode <= 99) return "animate-stormy";

    return "animate-cloudy";
  }

  // Reactive CSS variables based on global settings
  let styleVars = $derived(`
    --weather-icon-size: ${$weatherSettings.currentIconSize}px;
    --weather-current-temp-font-size: ${$weatherSettings.currentTempSize}px;
    --weather-current-desc-font-size: ${$weatherSettings.currentDescSize}px;
    --weather-forecast-icon-size: ${$weatherSettings.forecastIconSize}px;
    --weather-forecast-day-font-size: ${$weatherSettings.forecastDaySize}px;
    --weather-forecast-max-temp-font-size: ${$weatherSettings.forecastTempSize}px;
    --weather-forecast-min-temp-font-size: ${Math.max(10, $weatherSettings.forecastTempSize - 2)}px;
    --weather-forecast-item-bg-opacity: ${$weatherSettings.forecastItemBgOpacity / 100};
    --weather-forecast-item-radius: ${$weatherSettings.forecastItemBorderRadius}px;
  `);

  // Current animation class
  let currentAnimationClass = $derived(
    $weatherStore.current
      ? getAnimationClass(
          $weatherStore.current.weatherCode,
          $weatherStore.current.isDay,
        )
      : "",
  );
</script>

<div class="widget weather-widget" style={styleVars}>
  {#if $weatherStore.isLoading && !$weatherStore.current}
    <div class="spinner"></div>
  {:else if $weatherStore.error}
    <div class="weather-error">
      <iconify-icon icon="mdi:cloud-off-outline" width="24"></iconify-icon>
    </div>
  {:else if $weatherStore.current}
    <!-- Current Weather -->
    <div class="current-weather">
      <div class="weather-icon {currentAnimationClass}">
        <iconify-icon icon={$weatherStore.current.icon}></iconify-icon>
      </div>
      <div class="weather-info">
        <div class="temp">
          {$weatherStore.current.temperature}°
        </div>
        <div class="condition">
          {$t($weatherStore.current.condition)}
        </div>
      </div>
    </div>

    <!-- Forecast -->
    {#if $weatherSettings.showForecast && $weatherStore.current.forecast.length > 0}
      <div
        class="forecast-list"
        class:horizontal={$weatherSettings.forecastLayout === "horizontal"}
      >
        {#each $weatherStore.current.forecast as day}
          <div class="forecast-item">
            <div class="forecast-day">{formatDay(day.date)}</div>
            <div class="forecast-icon">
              <iconify-icon icon={day.icon}></iconify-icon>
            </div>
            <div class="forecast-temp-stack">
              <span class="max">{day.maxTemp}°</span>
              <span class="min">{day.minTemp}°</span>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  {:else}
    <!-- Fallback/Empty -->
    <div class="current-weather">
      <div class="weather-icon">
        <iconify-icon icon="mdi:weather-partly-cloudy"></iconify-icon>
      </div>
      <div class="weather-info">
        <div class="temp">--°</div>
        <div class="condition">{$t("sidebar.offline")}</div>
      </div>
    </div>
  {/if}
</div>

<style>
  .widget {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
  }

  .weather-widget {
    gap: 1rem;
    background: var(--bg-card);
    padding: 1rem;
    border-radius: 16px;
    border: 1px solid var(--border-card);
    min-height: 80px;
    box-sizing: border-box;
    /* Ensure overflow hidden so expanded children don't break radius */
    overflow: hidden;
  }

  .current-weather {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    width: 100%;
  }

  .weather-icon {
    color: var(
      --weather-primary-color,
      var(--accent-info)
    ); /* Use primary weather color or fallback */
    font-size: var(--weather-icon-size, 48px);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  /* Ensure iconify fills the font-size container */
  .weather-icon iconify-icon {
    width: 1em;
    height: 1em;
  }

  .weather-info {
    display: flex;
    flex-direction: column;
  }

  .temp {
    font-size: var(--weather-current-temp-font-size, 2rem);
    font-weight: 600;
    color: var(--weather-primary-color, var(--text-primary)); /* Updated */
    line-height: 1;
  }

  .condition {
    font-size: var(--weather-current-desc-font-size, 0.85rem);
    color: var(--weather-secondary-color, var(--text-muted)); /* Updated */
    text-transform: capitalize;
    white-space: nowrap;
  }

  .weather-error {
    color: var(--accent-error);
    opacity: 0.7;
    text-align: center;
  }

  /* Forecast List - Default Vertical */
  .forecast-list {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    border-top: 1px solid var(--border-divider, rgba(128, 128, 128, 0.1));
    padding-top: 0.75rem;
  }

  .forecast-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 0.85rem;
  }

  .forecast-day {
    color: var(--weather-secondary-color, var(--text-secondary)); /* Updated */
    width: 40px;
    font-size: var(--weather-forecast-day-font-size, 0.85rem);
  }

  .forecast-icon {
    color: var(--weather-primary-color, var(--text-primary)); /* Updated */
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: var(--weather-forecast-icon-size, 20px);
  }

  .forecast-icon iconify-icon {
    width: 1em;
    height: 1em;
  }

  .forecast-temp-stack {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 0;
    font-variant-numeric: tabular-nums;
    line-height: 1.1;
  }

  .forecast-temp-stack .max {
    font-weight: 600;
    color: var(--weather-primary-color, var(--text-primary)); /* Updated */
    font-size: var(--weather-forecast-max-temp-font-size, 0.9rem);
  }
  .forecast-temp-stack .min {
    color: var(--weather-secondary-color, var(--text-muted)); /* Updated */
    font-size: var(--weather-forecast-min-temp-font-size, 0.8rem);
  }

  /* Forecast List - Horizontal Mode */
  .forecast-list.horizontal {
    flex-direction: row;
    overflow-x: auto;

    /* Expand to edges of the container */
    width: calc(100% + 2rem);
    margin-left: -1rem;
    margin-right: -1rem;
    padding-left: 1rem;
    padding-right: 1rem;

    padding-bottom: 4px;
    padding-bottom: 4px;
    gap: 8px;
    justify-content: space-between;

    /* Hide scrollbar visually but keep functionality */
    scrollbar-width: none; /* Firefox */
    -ms-overflow-style: none; /* IE 10+ */
  }

  .forecast-list.horizontal::-webkit-scrollbar {
    display: none; /* Chrome/Safari/Webkit */
  }

  .forecast-list.horizontal .forecast-item {
    flex-direction: column;
    min-width: 48px;
    justify-content: flex-start;
    gap: 4px;
    background: rgba(
      var(--bg-card-hover-rgb, 128, 128, 128),
      var(--weather-forecast-item-bg-opacity, 0.05)
    );
    padding: 8px 4px;
    border-radius: var(--weather-forecast-item-radius, 8px);
    text-align: center;
  }

  .forecast-list.horizontal .forecast-day {
    width: auto;
  }

  .forecast-list.horizontal .forecast-temp-stack {
    align-items: center;
  }

  .spinner {
    width: 24px;
    height: 24px;
    border: 3px solid var(--border-primary);
    border-top: 3px solid var(--accent-primary);
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  /* Weather Icon Animations (ported from Fusion) */
  @keyframes sunny {
    0%,
    100% {
      transform: rotate(0deg) scale(1);
      opacity: 1;
    }
    50% {
      transform: rotate(15deg) scale(1.1);
      opacity: 0.9;
    }
  }
  @keyframes night-twinkle {
    0%,
    100% {
      opacity: 0.8;
      transform: scale(1);
    }
    50% {
      opacity: 1;
      transform: scale(1.05);
    }
  }
  @keyframes cloudy-move {
    0%,
    100% {
      transform: translateX(-3%);
    }
    50% {
      transform: translateX(3%);
    }
  }
  @keyframes rainy-bounce {
    0%,
    100% {
      transform: translateX(-2%) translateY(0);
    }
    25% {
      transform: translateX(2%) translateY(2%);
    }
    50% {
      transform: translateX(2%) translateY(0);
    }
    75% {
      transform: translateX(-2%) translateY(2%);
    }
  }
  @keyframes snowy-drift {
    0%,
    100% {
      transform: translateX(-4%) translateY(0) rotate(-2deg);
    }
    50% {
      transform: translateX(4%) translateY(2%) rotate(2deg);
    }
  }
  @keyframes stormy-flash {
    0%,
    90%,
    100% {
      opacity: 1;
    }
    92% {
      opacity: 0.2;
    }
    94% {
      opacity: 1;
    }
    96% {
      opacity: 0.2;
    }
    98% {
      opacity: 1;
    }
  }
  @keyframes foggy-drift {
    0%,
    100% {
      transform: translateX(-5%);
      opacity: 0.7;
    }
    50% {
      transform: translateX(5%);
      opacity: 0.9;
    }
  }

  .animate-sunny {
    animation: sunny 4s ease-in-out infinite;
  }
  .animate-night {
    animation: night-twinkle 3s ease-in-out infinite;
  }
  .animate-cloudy {
    animation: cloudy-move 6s ease-in-out infinite;
  }
  .animate-rainy {
    animation: rainy-bounce 6s ease-in-out infinite;
  }
  .animate-snowy {
    animation: snowy-drift 8s ease-in-out infinite;
  }
  .animate-stormy {
    animation: stormy-flash 5s linear infinite;
  }
  .animate-foggy {
    animation: foggy-drift 8s ease-in-out infinite;
  }
</style>
