
<script lang="ts">
	import { t } from 'svelte-i18n';
	import { appState, saveServerConfig, clearServerConfig } from '../../domains/app/store';
  import { haStore, disconnectHA, initializeHAConnection } from '../../domains/ha/store';
	import { themeStore } from '../../domains/ui/theme/store';
  import { weatherSettings, refreshWeatherConfig } from '../../lib/weather/store';
  import { resolveCoordinates } from '../../lib/weather/service';
  import { exportAllSettings, importAllSettings, clearAllData } from '../../domains/app/backup';
  import { setLocale, availableLanguages, currentLang } from '../../lib/i18n';
  import type { ServerConfig } from '$lib/types';
  import type { ThemeMode } from '../../themes/types';

  // Components
  import Section from '../../domains/ui/settings/Section.svelte';
  import LabeledInput from '../../domains/ui/settings/controls/LabeledInput.svelte';
  import RangeInput from '../../domains/ui/settings/controls/RangeInput.svelte';
  import 'iconify-icon';

  // --- Connection State ---
	let url = $state('');
	let token = $state('');
	let connMessage = $state('');
  
  // Sync form with active server if connected
  $effect(() => {
    if ($appState.activeServer && !url && !token) {
      url = $appState.activeServer.url;
      token = $appState.activeServer.token;
    }
  });

  async function connectServer() {
    if (!url || !token) {
      connMessage = $t('settings.messages.fillRequired');
      return;
    }
    
    const config: ServerConfig = {
      url: url.replace(/\/$/, ''),
      token: token.trim(),
      name: 'Home Assistant'
    };

    await saveServerConfig(config);
    // Trigger connection immediately
    initializeHAConnection(config.url, config.token);
  }

  function disconnectServer() {
    disconnectHA();
    clearServerConfig();
    url = '';
    token = '';
  }

  // --- Weather State ---
  let wProvider = $state($weatherSettings.provider);
  let wApiKey = $state($weatherSettings.apiKey || '');
  let wUseCustom = $state($weatherSettings.useCustomLocation);
  let wLat = $state($weatherSettings.customLocation?.lat ?? 0);
  let wLon = $state($weatherSettings.customLocation?.lon ?? 0);
  let wDays = $state($weatherSettings.forecastDays);

  function saveWeather() {
     weatherSettings.update(s => ({
       ...s,
       provider: wProvider,
       apiKey: wApiKey,
       useCustomLocation: wUseCustom,
       customLocation: { lat: wLat, lon: wLon },
       forecastDays: wDays
     }));
     refreshWeatherConfig();
  }
  
  // --- Backup State ---
  let fileInput: HTMLInputElement;
  
  async function handleBackupImport(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) {
      if (confirm('This will overwrite your current settings. Continue?')) {
        try {
          await importAllSettings(file);
        } catch (err: any) {
          alert('Import failed: ' + err.message);
        }
      }
    }
  }

  function handleReset() {
    if (confirm('DANGER: This will wipe all data and reset the app. Are you sure?')) {
      clearAllData();
    }
  }
</script>

<div class="settings-page">
  <div class="settings-container">
    <header class="page-header">
      <h1>{$t('settings.title')}</h1>
    </header>

    <!-- SECTION 1: Connection -->
    <Section title={$t('settings.connection')} description="Manage your Home Assistant server" initiallyOpen={!$haStore.isConnected}>
      {#if $haStore.isConnected}
        <div class="connected-state">
           <div class="server-info">
             <iconify-icon icon="mdi:server-network" width="32"></iconify-icon>
             <div>
               <div class="server-name">{$appState.activeServer?.name || 'Home Assistant'}</div>
               <div class="server-url">{$appState.activeServer?.url}</div>
             </div>
           </div>
           <button class="btn danger outline" onclick={disconnectServer}>
             Disconnect
           </button>
        </div>
      {:else}
        <div class="login-form">
          <LabeledInput label={$t('settings.serverUrl')} bind:value={url} placeholder="http://homeassistant.local:8123" />
          <LabeledInput label={$t('settings.token')} bind:value={token} type="password" placeholder="Long-lived access token" />
          
          {#if connMessage}
            <div class="error-msg">{connMessage}</div>
          {/if}
          
          <button class="btn primary full" onclick={connectServer}>
            {$t('settings.saveConfig')}
          </button>
        </div>
      {/if}
    </Section>

    <!-- SECTION 2: Appearance -->
    <Section title={$t('settings.appearance')} description="Theme and language settings">
      <div class="control-row">
        <label>{$t('settings.language')}</label>
        <select value={$currentLang} onchange={(e) => setLocale(e.currentTarget.value)}>
          {#each $availableLanguages as lang}
            <option value={lang.code}>{lang.name}</option>
          {/each}
        </select>
      </div>

      <div class="control-row">
        <label>{$t('settings.themeMode')}</label>
        <select value={$themeStore.mode} onchange={(e) => themeStore.setMode(e.currentTarget.value as ThemeMode)}>
          <option value="auto">{$t('settings.themeModeAuto')}</option>
          <option value="day">{$t('settings.themeModeDay')}</option>
          <option value="night">{$t('settings.themeModeNight')}</option>
          <option value="schedule">{$t('settings.themeModeSchedule')}</option>
        </select>
      </div>

      <div class="control-row">
        <label>{$t('settings.theme')}</label>
        <select value={$themeStore.currentThemeId} onchange={(e) => themeStore.setTheme(e.currentTarget.value)}>
          {#each $themeStore.availableThemes as theme}
            <option value={theme.id}>{theme.name} {theme.isCustom ? $t('settings.themeCustom') : ''}</option>
          {/each}
        </select>
      </div>
    </Section>

    <!-- SECTION 3: Weather -->
    <Section title={$t('settings.weather')} description="Configure weather widget provider">
      <div class="control-row">
        <label>{$t('settings.weatherProvider')}</label>
        <select bind:value={wProvider}>
          <option value="openmeteo">Open-Meteo (Free)</option>
          <option value="openweathermap">OpenWeatherMap</option>
          <option value="weatherapi">WeatherAPI</option>
        </select>
      </div>

      {#if wProvider !== 'openmeteo'}
        <LabeledInput label={$t('settings.weatherKey')} bind:value={wApiKey} type="password" />
      {/if}
      
      <RangeInput label={$t('settings.forecast.daysLabel')} bind:value={wDays} min={1} max={7} />
      
      <div class="actions">
        <button class="btn secondary" onclick={saveWeather}>{$t('settings.updateWeather')}</button>
      </div>
    </Section>

    <!-- SECTION 4: Backup & Data -->
    <Section title="Backup & Data" description="Import/Export your configuration">
      <div class="backup-actions">
        <button class="btn secondary" onclick={exportAllSettings}>
          <iconify-icon icon="mdi:download"></iconify-icon> Export Backup (ZIP)
        </button>
        
        <button class="btn secondary" onclick={() => fileInput.click()}>
          <iconify-icon icon="mdi:upload"></iconify-icon> Import Backup
        </button>
        <input type="file" hidden bind:this={fileInput} accept=".zip" onchange={handleBackupImport} />
      </div>

      <div class="danger-zone">
         <h4>Danger Zone</h4>
         <button class="btn danger" onclick={handleReset}>
           Reset All Data
         </button>
      </div>
    </Section>

    <div class="footer-info">
      Evolusion v0.0.1
    </div>
  </div>
</div>

<style>
  .settings-page {
    height: 100%;
    overflow-y: auto;
    background: var(--bg-page);
    padding: 2rem 1rem;
  }

  .settings-container {
    max-width: 600px;
    margin: 0 auto;
    padding-bottom: 4rem;
  }

  .page-header h1 {
    font-size: 2rem;
    margin-bottom: 2rem;
    color: var(--text-primary);
  }

  /* Controls */
  .control-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }
  
  label {
    font-weight: 500;
    color: var(--text-primary);
  }

  select {
    padding: 0.5rem;
    border-radius: 8px;
    border: 1px solid var(--border-input);
    background: var(--bg-input);
    color: var(--text-primary);
    min-width: 150px;
  }

  /* Connection */
  .connected-state {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .server-info {
    display: flex;
    gap: 1rem;
    align-items: center;
    color: var(--accent-success);
  }
  
  .server-name { font-weight: 600; color: var(--text-primary); }
  .server-url { font-size: 0.85rem; color: var(--text-secondary); }

  .error-msg { color: var(--accent-error); margin-bottom: 1rem; font-size: 0.9rem; }

  /* Buttons */
  .btn {
    padding: 0.75rem 1.5rem;
    border-radius: 8px;
    border: none;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    justify-content: center;
  }
  
  .btn.primary { background: var(--accent-primary); color: white; }
  .btn.secondary { background: transparent; border: 1px solid var(--border-primary); color: var(--text-primary); }
  .btn.danger { background: rgba(244, 67, 54, 0.1); color: var(--accent-error); }
  .btn.danger.outline { border: 1px solid var(--accent-error); background: transparent; }
  .btn.full { width: 100%; }

  .actions { display: flex; justify-content: flex-end; margin-top: 1rem; }

  /* Backup */
  .backup-actions {
    display: flex;
    gap: 1rem;
    margin-bottom: 2rem;
  }
  
  .danger-zone {
    border-top: 1px solid var(--border-divider);
    padding-top: 1rem;
  }
  
  .danger-zone h4 { color: var(--accent-error); margin: 0 0 1rem 0; }

  .footer-info {
    text-align: center;
    color: var(--text-muted);
    font-size: 0.8rem;
    margin-top: 2rem;
  }
</style>
