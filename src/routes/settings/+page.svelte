
<script lang="ts">
	import { t } from 'svelte-i18n';
	import { appState, saveServerConfig } from '../../domains/app/store';
	import { themeStore } from '../../domains/theme/store';
  import { weatherSettings, refreshWeatherConfig, weatherStore } from '../../lib/weather/store';
  import { resolveCoordinates } from '../../lib/weather/service';
  import { setLocale, availableLanguages, currentLang, importCustomLanguage, getLanguageExportData } from '../../lib/i18n';
	import type { ServerConfig } from '$lib/types';
  import type { ThemeMode } from '../../themes/types';

	let url = $state('');
	let token = $state('');
	let message = $state('');
	let messageType = $state<'info' | 'error' | 'success'>('info');

  // Weather local state for form
  let wProvider = $state($weatherSettings.provider);
  let wApiKey = $state($weatherSettings.apiKey || '');
  let wUseCustom = $state($weatherSettings.useCustomLocation);
  let wLat = $state($weatherSettings.customLocation?.lat ?? 55.1644);
  let wLon = $state($weatherSettings.customLocation?.lon ?? 61.4368);
  
  // New settings
  let wShowForecast = $state($weatherSettings.showForecast);
  let wForecastDays = $state($weatherSettings.forecastDays);
  let wIconPack = $state($weatherSettings.iconPack);
  let wForecastLayout = $state($weatherSettings.forecastLayout);
  
  // Reactive derived location status
  let locationInfo = $derived(resolveCoordinates($weatherSettings));
  
  // File input ref
  let fileInput: HTMLInputElement;

	$effect(() => {
		if ($appState.activeServer && url === '' && token === '') {
			url = $appState.activeServer.url;
			token = $appState.activeServer.token;
		}
	});

	async function handleSave() {
		message = '';
		if (!url) {
			message = 'Server URL is required.';
			messageType = 'error';
			return;
		}
		if (!token) {
			message = 'Access Token is required.';
			messageType = 'error';
			return;
		}

		let cleanUrl = url.trim();
		if (cleanUrl.endsWith('/')) cleanUrl = cleanUrl.slice(0, -1);

		const config: ServerConfig = {
			url: cleanUrl,
			token: token.trim(),
			name: 'Home Assistant'
		};

		try {
			await saveServerConfig(config);
			message = $t('common.save');
			messageType = 'success';
		} catch (error) {
			message = $t('common.error');
			messageType = 'error';
		}
	}

	function handleTest() {
		message = '';
		if (!url || !token) {
			message = 'Please enter URL and Token first.';
			messageType = 'error';
			return;
		}
		message = 'Ready to connect (Mock)';
		messageType = 'info';
	}
	
	function handleThemeModeChange(e: Event) {
	  const mode = (e.target as HTMLSelectElement).value as ThemeMode;
	  themeStore.setMode(mode);
	}

  function handleThemeChange(e: Event) {
    const activeThemeId = (e.target as HTMLSelectElement).value;
    themeStore.setTheme(activeThemeId);
  }

	function handleScheduleChange(field: 'dayStart' | 'nightStart', value: string) {
       const currentSchedule = $themeStore.schedule || { mode: 'time', dayStart: '07:00', nightStart: '22:00' };
       const newSchedule = { ...currentSchedule, [field]: value };
       // @ts-ignore
	   themeStore.setSchedule(newSchedule);
	}
  
  function handleLanguageChange(e: Event) {
    const code = (e.target as HTMLSelectElement).value;
    setLocale(code);
  }
  
  async function handleLanguageImport(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;
    
    try {
      const text = await file.text();
      const success = importCustomLanguage(text);
      if (success) {
        message = $t('settings.messages.importSuccess');
        messageType = 'success';
        // Reset input
        if (fileInput) fileInput.value = '';
      } else {
        message = $t('settings.messages.importError');
        messageType = 'error';
      }
    } catch (err) {
      console.error(err);
      message = 'Failed to read file';
      messageType = 'error';
    }
  }

  function handleLanguageExport() {
    const code = $currentLang;
    const json = getLanguageExportData(code);
    if (!json) {
       message = 'Failed to export language';
       messageType = 'error';
       return;
    }
    
    // Trigger download
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `evolusion-lang-${code}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function saveWeather() {
     // Validate days
     const days = Math.max(1, Math.min(wForecastDays, 7));
     
     weatherSettings.update(s => ({
       ...s,
       provider: wProvider,
       apiKey: wApiKey,
       useCustomLocation: wUseCustom,
       customLocation: {
         lat: wLat,
         lon: wLon
       },
       showForecast: wShowForecast,
       forecastDays: days,
       iconPack: wIconPack,
       forecastLayout: wForecastLayout
     }));
     refreshWeatherConfig();
  }
</script>

<div class="settings-panel">
	<h1>{$t('settings.title')}</h1>

  <!-- Appearance Section -->
  <section class="settings-section">
    <h2>{$t('settings.appearance')}</h2>
    
    <div class="form-group">
      <label for="lang-select">{$t('settings.languageSelect')}</label>
      <select id="lang-select" value={$currentLang} onchange={handleLanguageChange}>
         {#each $availableLanguages as lang}
            <option value={lang.code}>{lang.name}</option>
         {/each}
      </select>
    </div>
    
    <div class="form-group">
      <label for="lang-import">{$t('settings.importLanguage')}</label>
      <div class="file-upload">
         <input 
           type="file" 
           id="lang-import" 
           accept=".json" 
           onchange={handleLanguageImport}
           bind:this={fileInput}
         />
      </div>
    </div>
    
    <div class="form-group">
        <label>{$t('settings.exportLanguage')}</label>
        <button class="btn-secondary full-width" onclick={handleLanguageExport}>
            {$t('settings.exportBtn')}
        </button>
    </div>

    <div class="divider"></div>

    <div class="form-group">
      <label for="theme-mode">{$t('settings.themeMode')}</label>
      <select id="theme-mode" value={$themeStore.mode} onchange={handleThemeModeChange}>
        <option value="auto">{$t('settings.themeModeAuto')}</option>
        <option value="day">{$t('settings.themeModeDay')}</option>
        <option value="night">{$t('settings.themeModeNight')}</option>
        <option value="schedule">{$t('settings.themeModeSchedule')}</option>
      </select>
    </div>

    <div class="form-group">
      <label for="theme-select">{$t('settings.theme')}</label>
      <select id="theme-select" value={$themeStore.currentThemeId} onchange={handleThemeChange}>
        {#each $themeStore.availableThemes as theme}
          <option value={theme.id}>{theme.name} {theme.isCustom ? $t('settings.themeCustom') : ''}</option>
        {/each}
      </select>
    </div>

    {#if $themeStore.mode === 'schedule'}
      <div class="schedule-inputs">
        <div class="form-group">
          <label for="day-start">{$t('settings.themeScheduleDay')}</label>
          <input 
            type="time" 
            id="day-start" 
            value={$themeStore.schedule?.dayStart || '07:00'} 
            onchange={(e) => handleScheduleChange('dayStart', e.currentTarget.value)}
          />
        </div>
        <div class="form-group">
          <label for="night-start">{$t('settings.themeScheduleNight')}</label>
          <input 
            type="time" 
            id="night-start" 
            value={$themeStore.schedule?.nightStart || '22:00'} 
            onchange={(e) => handleScheduleChange('nightStart', e.currentTarget.value)}
          />
        </div>
      </div>
    {/if}
  </section>

  <!-- Weather Section -->
  <section class="settings-section">
    <h2>{$t('settings.weather')}</h2>
    
    <div class="form-group">
       <label for="w-provider">{$t('settings.weatherProvider')}</label>
       <select id="w-provider" bind:value={wProvider}>
         <option value="openmeteo">Open-Meteo (Free, No Key)</option>
         <option value="openweathermap">OpenWeatherMap (Key Required)</option>
         <option value="weatherapi">WeatherAPI (Key Required)</option>
       </select>
    </div>

    {#if wProvider !== 'openmeteo'}
      <div class="form-group">
        <label for="w-key">{$t('settings.weatherKey')}</label>
        <input id="w-key" type="password" bind:value={wApiKey} placeholder={$t('settings.weatherKeyPlaceholder')} />
      </div>
    {/if}
    
    <!-- Forecast Config -->
    <div class="form-group checkbox-group">
      <label>
        <input type="checkbox" bind:checked={wShowForecast} />
        {$t('settings.weatherShowForecast')}
      </label>
    </div>
    
    {#if wShowForecast}
      <div class="form-group">
        <label for="w-days">{$t('settings.forecast.daysLabel')}: {wForecastDays}</label>
        <input id="w-days" type="range" min="1" max="7" step="1" bind:value={wForecastDays} />
      </div>
      
      <div class="form-group">
        <label>{$t('settings.weatherLayout')}</label>
        <div class="radio-group">
           <label>
             <input type="radio" bind:group={wForecastLayout} value="vertical"> 
             {$t('settings.layoutVertical')}
           </label>
           <label>
             <input type="radio" bind:group={wForecastLayout} value="horizontal"> 
             {$t('settings.layoutHorizontal')}
           </label>
        </div>
      </div>
    {/if}
    
    <div class="form-group">
      <label for="w-icon-pack">{$t('settings.weatherIconPack')}</label>
      <select id="w-icon-pack" bind:value={wIconPack}>
        <option value="default">Default</option>
        <option value="outline">Outline</option>
        <option value="filled">Filled</option>
      </select>
    </div>

    <!-- Location -->
    <div class="form-group checkbox-group">
      <label>
        <input type="checkbox" bind:checked={wUseCustom} />
        {$t('settings.useCustomLocation')}
      </label>
    </div>

    {#if wUseCustom}
      <div class="schedule-inputs">
        <div class="form-group">
          <label for="w-lat">{$t('settings.latitude')}</label>
          <input id="w-lat" type="number" step="0.0001" bind:value={wLat} />
        </div>
        <div class="form-group">
           <label for="w-lon">{$t('settings.longitude')}</label>
           <input id="w-lon" type="number" step="0.0001" bind:value={wLon} />
        </div>
      </div>
    {:else}
      <div class="info-box">
        <p>{$t('settings.locationFromHA')}</p>
        <code>{locationInfo.name}: {locationInfo.lat}, {locationInfo.lon}</code>
      </div>
    {/if}

    <div class="actions">
      <button class="btn-primary" onclick={saveWeather}>{$t('settings.updateWeather')}</button>
    </div>

    {#if $weatherStore.error}
       <div class="message error">{$weatherStore.error}</div>
    {/if}
  </section>

  <!-- Connection Section -->
  <section class="settings-section">
    <h2>{$t('settings.connection')}</h2>
    <p class="description">Configure your Home Assistant connection details.</p>

    <div class="form-group">
      <label for="url">{$t('settings.serverUrl')}</label>
      <input 
        id="url" 
        type="url" 
        bind:value={url} 
        placeholder="http://homeassistant.local:8123" 
        autocomplete="url"
      />
      <span class="hint">e.g. http://192.168.1.100:8123</span>
    </div>

    <div class="form-group">
      <label for="token">{$t('settings.token')}</label>
      <input 
        id="token" 
        type="password" 
        bind:value={token} 
        placeholder={$t('settings.tokenPlaceholder')} 
        autocomplete="current-password"
      />
      <span class="hint">Create this in your HA profile settings.</span>
    </div>

    <div class="actions">
      <button class="btn-secondary" onclick={handleTest}>{$t('settings.testConnection')}</button>
      <button class="btn-primary" onclick={handleSave}>{$t('settings.saveConfig')}</button>
    </div>

    {#if message}
      <div class="message {messageType}">
        {message}
      </div>
    {/if}
  </section>
</div>

<style>
	.settings-panel {
		max-width: 600px;
		margin: 0 auto;
		padding: 2rem;
    
    background: var(--bg-panel, rgba(255, 255, 255, 0.95));
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border-radius: 16px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    
    color: var(--text-primary);
	}

  .settings-section {
    margin-bottom: 3rem;
    padding-bottom: 2rem;
    border-bottom: 1px solid rgba(128,128,128, 0.2);
  }
  
  .settings-section:last-child {
    border-bottom: none;
  }
  
  .divider {
     height: 1px;
     background: rgba(128,128,128, 0.1);
     margin: 1.5rem 0;
  }

	h1 {
		margin-bottom: 2rem;
    color: var(--text-primary);
	}
  
  h2 {
    font-size: 1.25rem;
    margin-bottom: 1rem;
    color: var(--text-primary);
  }

	.description {
		margin-bottom: 2rem;
		color: var(--text-secondary, #666);
	}

	.form-group {
		margin-bottom: 1.5rem;
	}
  
  .checkbox-group label {
     display: flex;
     align-items: center;
     gap: 0.5rem;
     cursor: pointer;
  }
  
  .checkbox-group input {
    width: auto;
  }
  
  .radio-group {
    display: flex;
    gap: 1.5rem;
  }
  
  .radio-group label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: normal;
    cursor: pointer;
  }
  
  .radio-group input {
    width: auto;
  }

	label {
		display: block;
		margin-bottom: 0.5rem;
		font-weight: 500;
    color: var(--text-primary);
	}

	input, select {
		width: 100%;
		padding: 0.75rem;
		border: 1px solid rgba(128,128,128, 0.3);
		border-radius: 8px;
		font-size: 1rem;
		box-sizing: border-box;
    background: var(--bg-input, #fff);
    color: var(--text-primary);
  }
  
  input[type="range"] {
    padding: 0;
  }
  
  /* File Upload Styling */
  input[type="file"] {
    padding: 0.5rem;
    border: 1px dashed var(--border-primary, #ccc);
    background: transparent;
  }

  .schedule-inputs {
    display: flex;
    gap: 1rem;
  }

  .info-box {
    padding: 1rem;
    background: rgba(128,128,128, 0.1);
    border-radius: 8px;
    font-size: 0.9rem;
  }
  
  .info-box code {
    display: block;
    margin-top: 0.5rem;
    font-family: monospace;
    font-weight: bold;
  }

	.hint {
		display: block;
		margin-top: 0.25rem;
		font-size: 0.85rem;
		color: var(--text-muted, #888);
	}

	.actions {
		display: flex;
		gap: 1rem;
		margin-top: 2rem;
	}
    
  .full-width {
      width: 100%;
  }

	button {
		padding: 0.75rem 1.5rem;
		border: none;
		border-radius: 8px;
		font-size: 1rem;
		cursor: pointer;
    font-weight: 500;
	}

	.btn-primary {
		background-color: var(--accent-primary, #007bff);
		color: #fff;
	}

	.btn-secondary {
		background-color: transparent;
		color: var(--text-primary);
    border: 1px solid rgba(128,128,128, 0.3);
	}

	.message {
		margin-top: 1.5rem;
		padding: 1rem;
		border-radius: 8px;
	}

	.message.info { background-color: rgba(3, 169, 244, 0.1); color: var(--accent-info); }
	.message.success { background-color: rgba(76, 175, 80, 0.1); color: var(--accent-success); }
	.message.error { background-color: rgba(244, 67, 54, 0.1); color: var(--accent-error); }
</style>
