<script lang="ts">
  import { onMount } from 'svelte';
  import { fade, fly, slide } from 'svelte/transition';
  import { t } from 'svelte-i18n';
  import { isSettingsOpen } from '../store';
  import { appState, clearServerConfig } from '../../app/store';
  import { haStore, disconnectHA } from '../../ha/store';
  import { themeStore } from '../theme/store';
  import { defaultTheme } from '../../../themes/defaults';
  import { weatherSettings, refreshWeatherConfig } from '../../../lib/weather/store';
  import { exportAllSettings, importAllSettings, clearAllData } from '../../app/backup';
  import { setLocale, availableLanguages, currentLang } from '../../../lib/i18n';
  import { exportTheme, importTheme } from '../theme/io'; // Import IO functions
  import type { ThemeMode, ThemeFile } from '../../../themes/types';

  // Components
  import Section from './Section.svelte';
  import LabeledInput from './controls/LabeledInput.svelte';
  import RangeInput from './controls/RangeInput.svelte';
  import ServerManager from './ServerManager.svelte';
  import ThemeEditor from '../theme/ThemeEditor.svelte';
  import 'iconify-icon';

  const STORAGE_KEY_WIDTH = 'evolusion_settings_width';

  // --- Resize State ---
  let settingsWidth = $state(420);
  let isResizing = $state(false);

  onMount(() => {
    const stored = localStorage.getItem(STORAGE_KEY_WIDTH);
    if (stored) {
      const w = parseInt(stored, 10);
      if (!isNaN(w) && w >= 300) {
        settingsWidth = w;
      }
    }
  });

  function startResize(e: MouseEvent) {
    e.preventDefault();
    isResizing = true;
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', stopResize);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }

  function handleMouseMove(e: MouseEvent) {
    if (!isResizing) return;
    
    let newWidth;
    if (document.dir === 'rtl') {
       newWidth = e.clientX;
    } else {
       newWidth = window.innerWidth - e.clientX;
    }

    if (newWidth < 350) newWidth = 350;
    if (newWidth > window.innerWidth - 50) newWidth = window.innerWidth - 50;
    
    settingsWidth = newWidth;
  }

  function stopResize() {
    if (isResizing) {
      isResizing = false;
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', stopResize);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      localStorage.setItem(STORAGE_KEY_WIDTH, settingsWidth.toString());
    }
  }

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

  // --- Theme State & Logic ---
  let isEditingTheme = $state(false);
  let themeDraft = $state<ThemeFile | null>(null);
  let themeFileInput: HTMLInputElement; // Reference for file input
  
  // Flatten themes from store
  let allThemes = $derived(
    $themeStore.themes.map(t => ({
      ...t,
      isBuiltIn: !t.theme.isCustom
    }))
  );

  function handleThemeSelect(id: string) {
    if (isEditingTheme) {
       if (!confirm($t('common.cancel') + '?')) return;
       cancelThemeEdit();
    }
    themeStore.setActiveTheme(id);
  }

  function createThemeCopy(baseTheme: ThemeFile) {
    const newId = `custom_${Date.now()}`;
    const newName = `${baseTheme.theme.name} (Copy)`;
    
    themeDraft = JSON.parse(JSON.stringify(baseTheme));
    if (themeDraft) {
        themeDraft.manifest.name = newName;
        themeDraft.theme.id = newId;
        themeDraft.theme.name = newName;
        themeDraft.theme.isCustom = true;
        
        isEditingTheme = true;
    }
  }

  function editCustomTheme(theme: ThemeFile) {
    themeDraft = JSON.parse(JSON.stringify(theme));
    isEditingTheme = true;
  }

  function saveTheme(theme: ThemeFile) {
    themeStore.saveTheme(theme);
    themeStore.setActiveTheme(theme.theme.id);
    isEditingTheme = false;
    themeDraft = null;
  }

  function deleteTheme(id: string) {
    if (confirm($t('templates.manager.confirmDelete'))) {
        themeStore.deleteTheme(id);
        if (isEditingTheme && themeDraft?.theme.id === id) {
            isEditingTheme = false;
            themeDraft = null;
        }
    }
  }

  function cancelThemeEdit() {
    isEditingTheme = false;
    themeDraft = null;
    // Re-trigger active theme to ensure CSS is consistent
    themeStore.setActiveTheme($themeStore.activeThemeId);
  }

  // Theme Import/Export Handlers
  async function handleThemeImport(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;

    try {
      const theme = await importTheme(file);
      themeStore.saveTheme(theme);
      themeStore.setActiveTheme(theme.theme.id);
      alert(`Theme "${theme.theme.name}" imported successfully!`);
    } catch (err: any) {
      alert(`Import failed: ${err.message}`);
    } finally {
      // Reset input
      if (themeFileInput) themeFileInput.value = '';
    }
  }

  function handleThemeExport(theme: ThemeFile) {
    try {
      exportTheme(theme);
    } catch (err: any) {
      alert(`Export failed: ${err.message}`);
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
  <div class="backdrop" onclick={close}></div>

  <!-- Drawer -->
  <aside 
    class="settings-drawer" 
    style="width: {settingsWidth}px"
    transition:fly={{ x: 400, duration: 300, opacity: 1 }}
  >
    <!-- Resize Handle -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div 
      class="resize-handle" 
      class:active={isResizing}
      onmousedown={startResize}
    ></div>

    <header class="drawer-header">
      <h2>{$t('settings.title')}</h2>
      <button class="close-btn" onclick={close} aria-label="Close settings">
        <iconify-icon icon="mdi:close" width="24"></iconify-icon>
      </button>
    </header>

    <div class="drawer-content">
      <div class="scroll-inner">
        
        <!-- SECTION 1: Connection -->
        <Section title={$t('settings.connection')} description="Manage your Home Assistant server">
            {#if $haStore.isConnected}
               <div class="connected-state">
                  <div class="server-info">
                    <div class="status-icon success">
                      <iconify-icon icon="mdi:home-assistant" width="32"></iconify-icon>
                    </div>
                    <div class="server-details">
                      <div class="server-name">{$appState.activeServer?.name || 'Home Assistant'}</div>
                      <div class="server-url">{$appState.activeServer?.url}</div>
                    </div>
                  </div>
                  <div class="connected-actions">
                    <button class="btn danger outline full" onclick={disconnectServer}>
                      {$t('settings.disconnect')}
                    </button>
                  </div>
               </div>
            {:else}
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

        <!-- SECTION 2: Appearance & Themes -->
        <Section title={$t('settings.appearance')} description="Theme and language settings" initiallyOpen={true}>
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
                <option value="light">{$t('settings.themeModeDay')}</option>
                <option value="dark">{$t('settings.themeModeNight')}</option>
              </select>
            </label>
          </div>

          <div class="theme-gallery-section">
             <div class="section-header-row">
                <div class="label">{$t('settings.theme')}</div>
                <input 
                   type="file" 
                   hidden 
                   accept=".json" 
                   bind:this={themeFileInput}
                   onchange={handleThemeImport} 
                />
             </div>
             
             <div class="theme-grid">
               {#each allThemes as theme (theme.theme.id)}
                 <!-- svelte-ignore a11y_click_events_have_key_events -->
                 <!-- svelte-ignore a11y_no_static_element_interactions -->
                 <div 
                    class="theme-card" 
                    class:active={$themeStore.activeThemeId === theme.theme.id}
                    onclick={() => handleThemeSelect(theme.theme.id)}
                 >
                    <div class="preview" style:background={theme.theme.scheme.light.dashboardBackgroundColor1}>
                       <!-- Mini representation of theme -->
                       <div class="mini-card" style:background={theme.theme.scheme.light.cardBackground}></div>
                       <div class="mini-accent" style:background={theme.theme.scheme.light.accentPrimary}></div>
                    </div>
                    <div class="meta">
                       <span class="name">{theme.theme.name}</span>
                       <div class="actions">
                          <!-- Export Button (All Themes) -->
                          <button class="icon-btn small" onclick={(e) => { e.stopPropagation(); handleThemeExport(theme); }} title={$t('settings.exportTheme')}>
                             <iconify-icon icon="mdi:download"></iconify-icon>
                          </button>

                          {#if theme.isBuiltIn}
                             <button class="icon-btn small" onclick={(e) => { e.stopPropagation(); createThemeCopy(theme); }} title="Copy">
                                <iconify-icon icon="mdi:content-copy"></iconify-icon>
                             </button>
                          {:else}
                             <button class="icon-btn small" onclick={(e) => { e.stopPropagation(); editCustomTheme(theme); }} title="Edit">
                                <iconify-icon icon="mdi:pencil"></iconify-icon>
                             </button>
                             <button class="icon-btn small danger" onclick={(e) => { e.stopPropagation(); deleteTheme(theme.theme.id); }} title="Delete">
                                <iconify-icon icon="mdi:delete"></iconify-icon>
                             </button>
                          {/if}
                       </div>
                    </div>
                 </div>
               {/each}
               
               <!-- Create New Button -->
               <button class="theme-card create-btn" onclick={() => createThemeCopy(defaultTheme)}>
                  <iconify-icon icon="mdi:plus" width="32"></iconify-icon>
                  <span>{$t('templates.manager.create')}</span>
               </button>

               <!-- Import Button -->
               <button class="theme-card create-btn" onclick={() => themeFileInput.click()}>
                  <iconify-icon icon="mdi:upload" width="32"></iconify-icon>
                  <span>{$t('settings.importTheme')}</span>
               </button>
             </div>
          </div>
          
          <!-- Inline Editor -->
          {#if isEditingTheme && themeDraft}
             <div class="editor-wrapper" transition:slide>
                <ThemeEditor 
                   draft={themeDraft} 
                   onSave={saveTheme} 
                   onCancel={cancelThemeEdit} 
                />
             </div>
          {/if}
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
    background: transparent;
    z-index: 2000;
  }

  .settings-drawer {
    position: fixed;
    top: 0;
    right: 0;
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
    transition: width 0.05s linear;
  }
  
  .resize-handle {
    position: absolute;
    top: 0;
    left: -6px;
    width: 12px;
    height: 100%;
    cursor: col-resize;
    z-index: 2005;
    background: transparent;
    transition: background 0.2s;
  }
  
  .resize-handle:hover, .resize-handle.active {
    background: linear-gradient(to right, transparent 40%, var(--accent-primary) 40%, var(--accent-primary) 60%, transparent 60%);
  }
  
  :global(body.rtl) .resize-handle { left: auto; right: -6px; }
  :global(body.rtl) .settings-drawer { right: auto; left: 0; border-left: none; border-right: 1px solid var(--border-primary); box-shadow: 4px 0 24px rgba(0,0,0,0.15); }

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
    scrollbar-width: thin;
    scrollbar-color: var(--border-input) transparent;
  }
  
  .scroll-inner { padding: 1.5rem; display: flex; flex-direction: column; gap: 1.5rem; min-height: min-content; }

  /* Server Status Styles */
  .connected-state, .disconnected-state {
    display: flex; gap: 1rem; padding: 1.25rem; background: var(--bg-secondary); border-radius: 8px; border: 1px solid var(--border-primary); margin-bottom: 1rem;
  }
  .connected-state { flex-direction: column; }
  .disconnected-state { align-items: center; justify-content: center; color: var(--text-muted); padding: 0.75rem; gap: 0.5rem; }
  
  .server-info { display: flex; align-items: flex-start; gap: 1rem; width: 100%; }
  .status-icon { display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 2px; }
  .status-icon.success { color: var(--accent-success); }
  .status-icon.error { color: var(--accent-error); }
  
  .server-details { display: flex; flex-direction: column; min-width: 0; flex: 1; gap: 0.25rem; }
  .server-name { font-weight: 600; color: var(--text-primary); word-break: break-word; line-height: 1.3; font-size: 1rem; }
  .server-url { font-size: 0.85rem; color: var(--text-secondary); word-break: break-all; line-height: 1.3; }
  
  .connected-actions { width: 100%; }
  .connection-actions { display: flex; flex-direction: column; gap: 0.5rem; }

  /* UI Controls */
  .control-row { margin-bottom: 1rem; }
  label { display: flex; justify-content: space-between; align-items: center; width: 100%; font-weight: 500; color: var(--text-primary); cursor: pointer; font-size: 0.9rem; }
  select { padding: 0.4rem; border-radius: 6px; border: 1px solid var(--border-input); background: var(--bg-input); color: var(--text-primary); min-width: 140px; font-size: 0.9rem; max-width: 60%; }

  /* Theme Gallery */
  .theme-gallery-section { display: flex; flex-direction: column; gap: 0.75rem; }
  .section-header-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; }
  .section-header-row .label { font-weight: 500; color: var(--text-primary); font-size: 0.9rem; }
  
  .link-btn {
    background: transparent;
    border: none;
    color: var(--accent-primary);
    font-size: 0.85rem;
    font-weight: 500;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 4px 8px;
    border-radius: 4px;
  }
  .link-btn:hover { background: var(--bg-chip); }

  .theme-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 0.75rem;
    margin-bottom: 1rem;
  }
  
  .theme-card {
    border: 2px solid var(--border-primary);
    border-radius: 8px;
    background: var(--bg-card);
    overflow: hidden;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    flex-direction: column;
  }
  
  .theme-card:hover {
    border-color: var(--border-focus);
    transform: translateY(-2px);
  }
  
  .theme-card.active {
    border-color: var(--accent-primary);
    box-shadow: 0 0 0 2px rgba(var(--accent-primary-rgb), 0.2);
  }
  
  .preview {
    height: 60px;
    width: 100%;
    position: relative;
    background: #eee;
  }
  
  .mini-card {
    position: absolute;
    top: 10px; left: 10px; right: 10px; height: 20px;
    border-radius: 4px;
    background: white;
    opacity: 0.8;
  }
  .mini-accent {
    position: absolute;
    bottom: 10px; right: 10px;
    width: 20px; height: 20px;
    border-radius: 50%;
    background: blue;
  }
  
  .meta {
    padding: 0.5rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: var(--bg-secondary);
    border-top: 1px solid var(--border-primary);
  }
  
  .name {
    font-size: 0.8rem;
    font-weight: 600;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    color: var(--text-primary);
  }
  
  .actions { display: flex; gap: 4px; }
  
  .icon-btn.small {
    padding: 4px;
    width: 24px; height: 24px;
    font-size: 14px;
    border-radius: 4px;
    background: var(--bg-input); 
    border: 1px solid var(--border-primary); 
  }
  .icon-btn.small:hover {
    background: var(--bg-card-hover);
    border-color: var(--border-focus);
  }
  
  .create-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    min-height: 94px;
    background: var(--bg-secondary);
    border: 1px dashed var(--border-primary);
    color: var(--text-secondary);
  }
  .create-btn:hover {
    border-color: var(--accent-primary);
    color: var(--accent-primary);
  }
  
  .editor-wrapper {
    margin-top: 1rem;
    border-top: 1px solid var(--border-divider);
    padding-top: 1rem;
  }

  /* Generic Buttons */
  .btn {
    padding: 0.7rem 1.2rem; border-radius: 8px; border: none; font-weight: 600;
    cursor: pointer; display: flex; align-items: center; gap: 0.5rem; justify-content: center;
    font-size: 0.95rem; transition: all 0.2s; white-space: normal; text-align: center; line-height: 1.2;
    min-height: 48px;
  }
  .btn:hover { transform: translateY(-1px); filter: brightness(0.95); }
  .btn:active { transform: translateY(0); }
  
  .btn.primary { 
    background: var(--accent-primary, #2196f3); 
    color: var(--text-on-accent, #ffffff);
    box-shadow: 0 2px 4px rgba(0,0,0,0.1); 
  }
  
  .btn.secondary { 
    background: var(--bg-chip, #e0e0e0); /* Distinct from inputs */
    color: var(--text-primary, #333); 
    border: none; 
  }
  .btn.secondary:hover { background: var(--bg-chip-active, #d0d0d0); }
  
  .btn.danger { background: rgba(244, 67, 54, 0.1); color: var(--accent-error, #f44336); }
  
  .btn.danger.outline { 
    border: 1px solid var(--accent-error, #f44336); 
    background: transparent; 
    color: var(--accent-error, #f44336);
  }
  
  .btn.danger.outline:hover {
    background: rgba(244, 67, 54, 0.05);
  }
  
  .btn.full { width: 100%; }
  .btn.small { padding: 0.4rem 0.8rem; font-size: 0.85rem; min-height: 36px; }
  .btn.flex-grow { flex-grow: 1; }
  .btn.icon-only { padding: 0.4rem; border: 1px solid var(--border-primary); background: var(--bg-card); color: var(--text-secondary); width: 32px; height: 32px; }
  
  .icon-btn { background: transparent; border: none; cursor: pointer; color: var(--text-secondary); display: flex; align-items: center; justify-content: center; border-radius: 4px; transition: all 0.2s; }
  .icon-btn:hover { background: var(--bg-chip); color: var(--text-primary); }
  .icon-btn.danger:hover { color: var(--accent-error, #f44336); background: rgba(244,67,54,0.1); }

  .actions { display: flex; justify-content: flex-end; margin-top: 1rem; }
  .backup-actions { display: flex; flex-wrap: wrap; gap: 0.75rem; margin-bottom: 1.5rem; }
  
  .danger-zone { border-top: 1px solid var(--border-divider); padding-top: 1.5rem; }
  .dz-label { color: var(--accent-error, #f44336); font-size: 0.85rem; font-weight: 600; margin-bottom: 0.75rem; }

  .footer-info { text-align: center; color: var(--text-muted); font-size: 0.75rem; margin-top: auto; padding-top: 1rem; }

  @media (max-width: 480px) {
    .settings-drawer { width: 100vw; max-width: 100vw; }
    .theme-grid { grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); }
    .resize-handle { display: none; }
  }
</style>
