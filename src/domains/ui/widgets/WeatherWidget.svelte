
<script lang="ts">
  import { t, locale } from 'svelte-i18n';
  import { weatherStore, weatherSettings } from '../../../lib/weather/store';
  import 'iconify-icon';

  function formatDay(date: Date): string {
    return date.toLocaleDateString($locale || 'en', { weekday: 'short' });
  }
</script>

<div class="widget weather-widget">
  {#if $weatherStore.isLoading && !$weatherStore.current}
     <div class="spinner"></div>
  {:else if $weatherStore.error}
     <div class="weather-error">
        <iconify-icon icon="mdi:cloud-off-outline" width="24"></iconify-icon>
     </div>
  {:else if $weatherStore.current}
    <!-- Current Weather -->
    <div class="current-weather">
      <div class="weather-icon">
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
        class:horizontal={$weatherSettings.forecastLayout === 'horizontal'}
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
         <div class="condition">{$t('sidebar.offline')}</div>
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
    color: var(--accent-info);
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

  .weather-info { display: flex; flex-direction: column; }
  
  .temp {
    font-size: var(--weather-current-temp-font-size, 2rem);
    font-weight: 600;
    color: var(--text-primary);
    line-height: 1;
  }
  
  .condition {
    font-size: var(--weather-current-desc-font-size, 0.85rem);
    color: var(--text-muted);
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
    border-top: 1px solid var(--border-divider, rgba(128,128,128,0.1));
    padding-top: 0.75rem;
  }
  
  .forecast-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 0.85rem;
  }
  
  .forecast-day {
    color: var(--text-secondary);
    width: 40px;
    font-size: var(--weather-forecast-day-font-size, 0.85rem);
  }
  
  .forecast-icon {
    color: var(--text-primary);
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
    color: var(--text-primary);
    font-size: var(--weather-forecast-max-temp-font-size, 0.9rem);
  }
  .forecast-temp-stack .min { 
    color: var(--text-muted); 
    font-size: var(--weather-forecast-min-temp-font-size, 0.8rem);
  }

  /* Forecast List - Horizontal Mode */
  .forecast-list.horizontal {
    flex-direction: row;
    overflow-x: auto;
    padding-bottom: 4px; /* Space for scrollbar */
    gap: 8px;
    /* Hide scrollbar for webkit but allow scrolling */
    scrollbar-width: thin;
  }
  
  .forecast-list.horizontal::-webkit-scrollbar {
    height: 4px;
  }
  
  .forecast-list.horizontal::-webkit-scrollbar-thumb {
    background: var(--text-muted);
    border-radius: 2px;
  }

  .forecast-list.horizontal .forecast-item {
    flex-direction: column;
    min-width: 48px;
    justify-content: flex-start;
    gap: 4px;
    background: var(--bg-card-hover, rgba(0,0,0,0.03));
    padding: 8px 4px;
    border-radius: 8px;
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
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
</style>
