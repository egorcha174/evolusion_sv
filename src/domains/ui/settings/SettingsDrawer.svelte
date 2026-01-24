
<script lang="ts">
  import { fade, fly } from 'svelte/transition';
  import { t } from 'svelte-i18n';
  import { isSettingsOpen } from '../store';
  import { appState, saveServerConfig, clearServerConfig } from '../../app/store';
  import { haStore, disconnectHA, initializeHAConnection } from '../../ha/store';
  import { themeStore } from '../../theme/store';
  import { weatherSettings, refreshWeatherConfig } from '../../../lib/weather/store';
  import { exportAllSettings, importAllSettings, clearAllData } from '../../app/backup';
  import { setLocale, availableLanguages, currentLang } from '../../../lib/i18n';
  import type { ServerConfig } from '$lib/types';
  import type { ThemeMode } from '../../../themes/types';

  // Components
  import Section from './Section.svelte';
  import LabeledInput from './controls/LabeledInput.svelte';
  import RangeInput from './controls/RangeInput.svelte';
  import 'iconify-icon';

  function close() {
    isSettingsOpen.set(false);
  }

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
        <Section title={$t('settings.connection')} description="Manage your Home Assistant server" initiallyOpen={!$haStore.isConnected}>
          {#if $haStore.isConnected}
            <div class="connected-state">
               <div class="server-info">
                 <div class="status-icon">
                   <iconify-icon icon="mdi:check-circle" width="24"></iconify-icon>
                 </div>
                 <div class="server-details">
                   <div class="server-name">{$appState.activeServer?.name || 'Home Assistant'}</div>
                   <div class="server-url">{$appState.activeServer?.url}</div>
                 </div>
               </div>
               <button class="btn danger outline small" onclick={disconnectServer}>
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
        <Section title={$t('settings.weather')} description="Configure weather widget provider">
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
            <!-- Using primary for Export to match user preference/screenshot style -->
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

  .drawer-header h2 {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--text-primary);
  }

  .close-btn {
    background: transparent;
    border: none;
    cursor: pointer;
    color: var(--text-secondary);
    padding: 8px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.2s;
  }
  .close-btn:hover { background: var(--bg-chip); color: var(--text-primary); }

  /* 
    SCROLL FIX:
    Use flex: 1 for content but ensure correct overflow handling.
    height: 0 is a trick to force flex containers to respect the parent height limit.
  */
  .drawer-content {
    flex: 1 1 auto;
    overflow-y: auto;
    overflow-x: hidden;
    height: 0; /* Critical for Safari/Flex scroll */
    overscroll-behavior: contain;
    -webkit-overflow-scrolling: touch;
    
    scrollbar-width: thin;
    scrollbar-color: var(--border-input) transparent;
  }
  
  .scroll-inner {
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    min-height: min-content;
  }
  
  .drawer-content::-webkit-scrollbar {
    width: 6px;
  }
  .drawer-content::-webkit-scrollbar-track {
    background: transparent;
  }
  .drawer-content::-webkit-scrollbar-thumb {
    background-color: var(--border-input);
    border-radius: 3px;
  }

  :global(.settings-section), .footer-info {
    flex-shrink: 0;
  }

  /* --- Styles reused from page --- */
  
  .control-row { margin-bottom: 1rem; }
  
  label {
    display: flex; justify-content: space-between; align-items: center;
    width: 100%; font-weight: 500; color: var(--text-primary); cursor: pointer;
    font-size: 0.9rem;
  }

  select {
    padding: 0.4rem; border-radius: 6px;
    border: 1px solid var(--border-input); background: var(--bg-input); color: var(--text-primary);
    min-width: 140px; font-size: 0.9rem;
    max-width: 60%;
  }

  .connected-state { 
    display: flex; 
    justify-content: space-between; 
    align-items: center; 
    background: var(--bg-secondary);
    padding: 1rem;
    border-radius: 8px;
  }
  
  .server-info { 
    display: flex; 
    gap: 0.75rem; 
    align-items: center; 
    overflow: hidden;
  }
  
  .status-icon {
    color: var(--accent-success);
    display: flex;
    flex-shrink: 0;
  }
  
  .server-details {
    overflow: hidden;
  }
  
  .server-name { 
    font-weight: 600; 
    color: var(--text-primary); 
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .server-url { 
    font-size: 0.8rem; 
    color: var(--text-secondary); 
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .error-msg { color: var(--accent-error); margin-bottom: 1rem; font-size: 0.9rem; }

  .btn {
    padding: 0.6rem 1.2rem; border-radius: 8px; border: none; font-weight: 600;
    cursor: pointer; display: flex; align-items: center; gap: 0.5rem; justify-content: center;
    font-size: 0.9rem; transition: opacity 0.2s; white-space: nowrap;
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

  /* FLEX LAYOUT FOR BUTTONS: Safer than Grid for variable text length */
  .backup-actions { 
    display: flex; 
    flex-wrap: wrap; 
    gap: 0.75rem; 
    margin-bottom: 1.5rem; 
  }
  
  .danger-zone { 
    border-top: 1px solid var(--border-divider); 
    padding-top: 1.5rem; 
  }
  
  .dz-label {
    color: var(--accent-error);
    font-size: 0.85rem;
    font-weight: 600;
    margin-bottom: 0.75rem;
  }

  .footer-info {
    text-align: center; color: var(--text-muted); font-size: 0.75rem; 
    margin-top: auto; 
    padding-top: 1rem;
  }

  @media (max-width: 480px) {
    .settings-drawer { width: 100vw; }
    /* Force stack on very small screens if needed, otherwise wrap handles it */
    .backup-actions .btn { width: 100%; }
  }
</style>
