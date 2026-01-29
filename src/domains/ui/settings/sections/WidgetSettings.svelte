<script lang="ts">
  import { t } from 'svelte-i18n';
  import { slide } from 'svelte/transition';
  import { weatherSettings, refreshWeatherConfig } from '../../../../lib/weather/store';
  import { clockSettings } from '../../widgets/clockStore';
  import { cameraSettings } from '../../widgets/cameraStore';
  import { haStore } from '../../../ha/store';
  
  import Section from '../Section.svelte';
  import LabeledInput from '../controls/LabeledInput.svelte';
  import RangeInput from '../controls/RangeInput.svelte';
  import Switch from '../controls/Switch.svelte';

  // Helper to sync visuals that are derived from sizes
  function updateWeatherVisuals() {
    weatherSettings.update(s => ({
      ...s,
      currentDescSize: Math.max(10, Math.round(s.currentTempSize * 0.4)),
      forecastDaySize: Math.max(10, Math.round(s.forecastTempSize * 0.9))
    }));
  }

  let cameraEntities = $derived(Array.from($haStore.entities.values()).filter(e => e.entity_id.startsWith('camera.')));
</script>

<Section title={$t('settings.widgets.title')} description={$t('settings.widgets.description')} initiallyOpen={true}>
  
  <!-- CAMERA SUBSECTION -->
  <div class="subsection-title">{$t('settings.widgets.camera')}</div>
  <div class="control-row">
    <label>
      {$t('settings.widgets.cameraSelect')}
      <select bind:value={$cameraSettings.selectedEntityId}>
        <option value={null}>-- {$t('settings.widgets.cameraNone')} --</option>
        {#each cameraEntities as entity (entity.entity_id)}
          <option value={entity.entity_id}>{entity.attributes.friendly_name || entity.entity_id}</option>
        {/each}
      </select>
    </label>
  </div>
  {#if cameraEntities.length === 0}
    <p class="note">{$t('settings.widgets.noCameras')}</p>
  {/if}

  <div class="divider"></div>

  <!-- CLOCK SUBSECTION -->
  <div class="subsection-title">{$t('settings.widgets.clock')}</div>
  <Switch label={$t('settings.widgets.showDate')} bind:checked={$clockSettings.showDate} />
  <Switch label={$t('settings.widgets.showSeconds')} bind:checked={$clockSettings.showSeconds} />

  <div class="divider"></div>

  <!-- WEATHER SUBSECTION -->
  <div class="subsection-title">{$t('settings.weather')}</div>
  
  <div class="control-row">
    <label>
      {$t('settings.weatherProvider')}
      <select bind:value={$weatherSettings.provider}>
        <option value="openmeteo">Open-Meteo (Free)</option>
        <option value="openweathermap">OpenWeatherMap</option>
        <option value="weatherapi">WeatherAPI</option>
      </select>
    </label>
  </div>

  {#if $weatherSettings.provider !== 'openmeteo'}
    <LabeledInput label={$t('settings.weatherKey')} bind:value={$weatherSettings.apiKey} type="password" />
  {/if}

  <div class="control-row">
    <label>
      {$t('settings.weatherIconPack')}
      <select bind:value={$weatherSettings.iconPack}>
        <option value="default">Default (Material)</option>
        <option value="outline">Outline</option>
        <option value="filled">Filled</option>
      </select>
    </label>
  </div>

  <Switch label={$t('settings.weatherShowForecast')} bind:checked={$weatherSettings.showForecast} />

  {#if $weatherSettings.showForecast}
     <div transition:slide>
        <RangeInput label={$t('settings.forecast.daysLabel')} bind:value={$weatherSettings.forecastDays} min={1} max={7} />
        
        <div class="control-row">
          <label>
            {$t('settings.weatherLayout')}
            <select bind:value={$weatherSettings.forecastLayout}>
              <option value="vertical">{$t('settings.layoutVertical')}</option>
              <option value="horizontal">{$t('settings.layoutHorizontal')}</option>
            </select>
          </label>
        </div>
     </div>
  {/if}
  
  <div class="divider"></div>
  <div class="subsection-title">{$t('settings.widgets.weatherStyle')}</div>
  
  <!-- Visuals: Use the `on:change` equivalent for Svelte 5 via the custom component or effect -->
  <!-- Assuming RangeInput updates the store immediately -->
  <div oninput={updateWeatherVisuals}>
    <RangeInput label={$t('settings.widgets.iconSizeCurrent')} bind:value={$weatherSettings.currentIconSize} min={24} max={128} step={4} unit="px" />
    <RangeInput label={$t('settings.widgets.tempSizeCurrent')} bind:value={$weatherSettings.currentTempSize} min={16} max={96} step={2} unit="px" />
    
    {#if $weatherSettings.showForecast}
      <RangeInput label={$t('settings.widgets.iconSizeForecast')} bind:value={$weatherSettings.forecastIconSize} min={12} max={64} step={2} unit="px" />
      <RangeInput label={$t('settings.widgets.tempSizeForecast')} bind:value={$weatherSettings.forecastTempSize} min={10} max={32} step={1} unit="px" />
    {/if}
  </div>

  <div class="actions">
    <!-- Refresh is needed for API settings to take effect (polling restart) -->
    <button class="btn secondary small" onclick={refreshWeatherConfig}>{$t('settings.updateWeather')}</button>
  </div>
</Section>

<style>
  .subsection-title {
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--text-secondary);
    margin: 1.5rem 0 1rem 0;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  
  .divider {
    height: 1px;
    background: var(--border-divider);
    margin: 1.5rem 0;
  }

  .control-row { margin-bottom: 1rem; }
  label { display: flex; justify-content: space-between; align-items: center; width: 100%; font-weight: 500; color: var(--text-primary); cursor: pointer; font-size: 0.9rem; }
  select { padding: 0.4rem; border-radius: 6px; border: 1px solid var(--border-input); background: var(--bg-input); color: var(--text-primary); min-width: 140px; font-size: 0.9rem; max-width: 60%; }

  .actions { display: flex; justify-content: flex-end; margin-top: 1rem; }

  .btn {
    padding: 0.7rem 1.2rem; border-radius: 8px; border: none; font-weight: 600;
    cursor: pointer; display: flex; align-items: center; gap: 0.5rem; justify-content: center;
    font-size: 0.95rem; transition: all 0.2s;
  }
  .btn.secondary { background: var(--bg-chip); color: var(--text-primary); }
  .btn.secondary:hover { background: var(--bg-chip-active); }
  .btn.small { padding: 0.4rem 0.8rem; font-size: 0.85rem; min-height: 36px; }

  .note {
    font-size: 0.8rem;
    color: var(--text-muted);
    padding: 0.5rem 1rem;
    background: var(--bg-secondary);
    border-radius: 6px;
    margin-top: -0.5rem;
  }
</style>