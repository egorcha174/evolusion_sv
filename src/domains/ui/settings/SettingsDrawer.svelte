
<script lang="ts">
  import { fade, fly } from 'svelte/transition';
  import { t } from 'svelte-i18n';
  import { isSettingsOpen } from '../store';
  import { appState, clearServerConfig } from '../../app/store';
  import { haStore, disconnectHA } from '../../ha/store';
  import { themeStore } from '../../theme/store';
  import { weatherSettings, refreshWeatherConfig } from '../../../lib/weather/store';
  import { exportAllSettings, importAllSettings, clearAllData } from '../../app/backup';
  import { setLocale, availableLanguages, currentLang } from '../../../lib/i18n';
  import type { ThemeMode } from '../../../themes/types';

  // Components
  import Section from './Section.svelte';
  import LabeledInput from './controls/LabeledInput.svelte';
  import RangeInput from './controls/RangeInput.svelte';
  import ServerManager from './ServerManager.svelte';
  import 'iconify-icon';

  function close() {
    isSettingsOpen.set(false);
  }

  // --- Connection State ---
  let isServerManagerOpen = $state(false);

  function disconnectServer() {
    if (confirm($t('settings.messages.confirmDisconnect') || 'Disconnect?')) {
      disconnectHA();
      clearServerConfig();
    }
  }

  // --- Weather State ---
  let wProvider = $state($weatherSettings.provider);
  let wApiKey = $state($weatherSettings.apiKey || '');
  let wUseCustom = $state($weatherSettings.useCustomLocation);
  let wLat = $state($weatherSettings.customLocation?.lat ?? 0);
  let wLon = $state($weatherSettings.customLocation?.lon ?? 0);
  let wDays = $state($weatherSettings.forecastDays);

  $effect(() => {
    if ($isSettingsOpen) {
      wProvider = $weatherSettings.provider;
      wApiKey = $weatherSettings.apiKey || '';
      wUseCustom = $weatherSettings.useCustomLocation;
      wLat = $weatherSettings.customLocation?.lat ?? 0;
      wLon = $weatherSettings.customLocation?.lon ?? 0;
      wDays = $weatherSettings.forecastDays;
    }
  });

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

{#if $isSettingsOpen}
  <!-- Backdrop -->
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div class="backdrop" transition:fade={{ duration: 200 }} onclick={close}></div>

  <!-- Drawer -->
  <aside class="settings-drawer" transition:fly={{ x: 400, duration: 300, opacity: 1 }}>
    <header class="drawer-header">
      <h2>{$t('settings.title')}</h2>
      <button class="close-btn" onclick={close} aria-label="Close settings">
        <iconify-icon icon="mdi:close" width="24"></iconify-icon>
      </button>
    </header>

    <div class="drawer-content">
      <div class="scroll-inner">
        <!-- SECTION 1: Connection -->
        <Section title={$t('settings.connection')} description="Manage your Home Assistant server" initiallyOpen={true}>
            {#if $haStore.isConnected}
               <!-- Active Connected State -->
               <div class="connected-state">
                  <div class="server-info">
                    <div class="status-icon success">
                      <iconify-icon icon="mdi:home-assistant" width="24"></iconify-icon>
                    </div>
                    <div class="server-details">
                      <div class="server-name">{$appState.activeServer?.name || 'Home Assistant'}</div>
                      <div class="server-url">{$appState.activeServer?.url}</div>
                    </div>
                  </div>
                  <button class="btn danger outline" onclick={disconnectServer}>
                    {$t('settings.disconnect')}
                  </button>
               </div>
            {:else}
               <!-- Disconnected State -->
               <div class="disconnected-state">
                  <div class="status-icon error">
                      <iconify-icon icon="mdi:alert-circle" width="24"></iconify-icon>
                  </div>
                  <span>Not Connected</span>
               </div>
            {/if}

            <div class="connection-actions">
               <button class="btn secondary full" onclick={() => isServerManagerOpen = true}>
                 <iconify-icon icon="mdi:server-network"></iconify-icon> Manage Servers
               </button>
            </div>
        </Section>

        <!-- SECTION 2: Appearance -->
        <Section title={$t('settings.appearance')} description="Theme and language settings">
          <div class="control-row">
            <label>
              {$t('settings.language')}
              <select value={$currentLang} onchange={(e) => setLocale(e.currentTarget.value)}>
                {#each $availableLanguages as lang}
                  <option value={lang.code}>{lang.name}</option>
                {/each}
              </select>
            </label>
          </div>

          <div class="control-row">
            <label>
              {$t('settings.themeMode')}
              <select value={$themeStore.mode} onchange={(e) => themeStore.setMode(e.currentTarget.value as ThemeMode)}>
                <option value="auto">{$t('settings.themeModeAuto')}</option>
                <option value="day">{$t('settings.themeModeDay')}</option>
                <option value="night">{$t('settings.themeModeNight')}</option>
                <option value="schedule">{$t('settings.themeModeSchedule')}</option>
              </select>
            </label>
          </div>

          <div class="control-row">
            <label>
              {$t('settings.theme')}
              <select value={$themeStore.currentThemeId} onchange={(e) => themeStore.setTheme(e.currentTarget.value)}>
                {#each $themeStore.availableThemes as theme}
                  <option value={theme.id}>{theme.name} {theme.isCustom ? $t('settings.themeCustom') : ''}</option>
                {/each}
              </select>
            </label>
          </div>
        </Section>

        <!-- SECTION 3: Weather -->
        <Section title={$t('settings.weather')} description={$t('settings.weatherDesc')}>
          <div class="control-row">
            <label>
              {$t('settings.weatherProvider')}
              <select bind:value={wProvider}>
                <option value="openmeteo">Open-Meteo (Free)</option>
                <option value="openweathermap">OpenWeatherMap</option>
                <option value="weatherapi">WeatherAPI</option>
              </select>
            </label>
          </div>

          {#if wProvider !== 'openmeteo'}
            <LabeledInput label={$t('settings.weatherKey')} bind:value={wApiKey} type="password" />
          {/if}

          <RangeInput label={$t('settings.forecast.daysLabel')} bind:value={wDays} min={1} max={7} />

          <div class="actions">
            <button class="btn secondary small" onclick={saveWeather}>{$t('settings.updateWeather')}</button>
          </div>
        </Section>

        <!-- SECTION 4: Backup & Data -->
        <Section title={$t('settings.backup')} description={$t('settings.backupDesc')}>
          <div class="backup-actions">
            <button class="btn primary flex-grow" onclick={exportAllSettings}>
              <iconify-icon icon="mdi:download"></iconify-icon> {$t('settings.exportBtn')}
            </button>

            <button class="btn secondary flex-grow" onclick={() => fileInput.click()}>
              <iconify-icon icon="mdi:upload"></iconify-icon> {$t('settings.importBtn')}
            </button>
            <input type="file" hidden bind:this={fileInput} accept=".zip" onchange={handleBackupImport} />
          </div>

          <div class="danger-zone">
             <div class="dz-label">{$t('settings.dangerZone')}</div>
             <button class="btn danger outline full" onclick={handleReset}>
               {$t('settings.reset')}
             </button>
          </div>
        </Section>

        <div class="footer-info">
          Evolusion v0.0.1
        </div>
      </div>
    </div>
  </aside>
{/if}

<!-- Server Manager Overlay -->
{#if isServerManagerOpen}
   <ServerManager onClose={() => isServerManagerOpen = false} />
{/if}

<style>
  .backdrop {
    position: fixed;
    top: 0; left: 0;
    width: 100vw; height: 100vh;
    background: rgba(0,0,0,0.4);
    backdrop-filter: blur(2px);
    z-index: 2000;
  }

  .settings-drawer {
    position: fixed;
    top: 0;
    right: 0;
    width: 420px;
    max-width: 100vw;
    height: 100%;
    max-height: 100dvh;
    background: var(--bg-page);
    background-color: var(--bg-panel, #ffffff);
    box-shadow: -4px 0 24px rgba(0,0,0,0.15);
    z-index: 2001;
    display: flex;
    flex-direction: column;
    border-left: 1px solid var(--border-primary);
  }
  
  :global(body.rtl) .settings-drawer {
    right: auto;
    left: 0;
    border-left: none;
    border-right: 1px solid var(--border-primary);
    box-shadow: 4px 0 24px rgba(0,0,0,0.15);
  }

  .drawer-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.5rem;
    border-bottom: 1px solid var(--border-divider);
    background: var(--bg-header);
    flex-shrink: 0;
  }

  .drawer-header h2 { margin: 0; font-size: 1.25rem; font-weight: 600; color: var(--text-primary); }
  .close-btn { background: transparent; border: none; cursor: pointer; color: var(--text-secondary); padding: 8px; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
  .close-btn:hover { background: var(--bg-chip); color: var(--text-primary); }

  .drawer-content {
    flex: 1 1 auto;
    overflow-y: auto;
    overflow-x: hidden;
    height: 0;
    overscroll-behavior: contain;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: thin;
    scrollbar-color: var(--border-input) transparent;
  }
  
  .scroll-inner { padding: 1.5rem; display: flex; flex-direction: column; gap: 1.5rem; min-height: min-content; }

  /* Server Status Styles */
  .connected-state {
    display: flex; 
    flex-direction: row; /* Horizontal */
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 1rem; 
    background: var(--bg-secondary); 
    border-radius: 8px; 
    border: 1px solid var(--border-primary); 
    margin-bottom: 1rem;
  }
  
  .disconnected-state {
    display: flex; align-items: center; justify-content: center; gap: 0.5rem;
    padding: 0.75rem; background: var(--bg-secondary); border-radius: 8px; border: 1px solid var(--border-primary); margin-bottom: 1rem;
    color: var(--text-muted);
  }
  
  .server-info {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    min-width: 0;
    flex: 1;
  }

  .status-icon { display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .status-icon.success { color: var(--accent-success); }
  .status-icon.error { color: var(--accent-error); }
  
  .server-details { display: flex; flex-direction: column; min-width: 0; flex: 1; }
  .server-name { 
    font-weight: 600; 
    color: var(--text-primary); 
    white-space: nowrap; 
    overflow: hidden; 
    text-overflow: ellipsis;
    line-height: 1.3;
    margin-bottom: 2px;
  }
  .server-url { font-size: 0.8rem; color: var(--text-secondary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  
  .connection-actions { display: flex; flex-direction: column; gap: 0.5rem; }

  /* Generic UI */
  .control-row { margin-bottom: 1rem; }
  label { display: flex; justify-content: space-between; align-items: center; width: 100%; font-weight: 500; color: var(--text-primary); cursor: pointer; font-size: 0.9rem; }
  select { padding: 0.4rem; border-radius: 6px; border: 1px solid var(--border-input); background: var(--bg-input); color: var(--text-primary); min-width: 140px; font-size: 0.9rem; max-width: 60%; }

  .btn {
    padding: 0.6rem 1.2rem; border-radius: 8px; border: none; font-weight: 600;
    cursor: pointer; display: flex; align-items: center; gap: 0.5rem; justify-content: center;
    font-size: 0.9rem; transition: opacity 0.2s; white-space: normal; text-align: center; line-height: 1.2;
  }
  .btn:hover { opacity: 0.9; }
  .btn.primary { background: var(--accent-primary); color: white; }
  .btn.secondary { background: transparent; border: 1px solid var(--border-primary); color: var(--text-primary); }
  .btn.danger { background: rgba(244, 67, 54, 0.1); color: var(--accent-error); }
  .btn.danger.outline { border: 1px solid var(--accent-error); background: transparent; }
  .btn.full { width: 100%; }
  .btn.small { padding: 0.4rem 0.8rem; font-size: 0.85rem; }
  .btn.flex-grow { flex-grow: 1; }

  .actions { display: flex; justify-content: flex-end; margin-top: 1rem; }
  .backup-actions { display: flex; flex-wrap: wrap; gap: 0.75rem; margin-bottom: 1.5rem; }
  
  .danger-zone { border-top: 1px solid var(--border-divider); padding-top: 1.5rem; }
  .dz-label { color: var(--accent-error); font-size: 0.85rem; font-weight: 600; margin-bottom: 0.75rem; }

  .footer-info { text-align: center; color: var(--text-muted); font-size: 0.75rem; margin-top: auto; padding-top: 1rem; }

  @media (max-width: 480px) {
    .settings-drawer { width: 100vw; }
    .backup-actions .btn { width: 100%; }
  }
</style>