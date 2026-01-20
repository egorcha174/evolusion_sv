
<script lang="ts">
	import { appState, saveServerConfig } from '../../domains/app/store';
	import { themeStore } from '../../domains/theme/store';
	import type { ServerConfig } from '$lib/types';
    import type { ThemeMode } from '../../themes/types';

	let url = $state('');
	let token = $state('');
	let message = $state('');
	let messageType = $state<'info' | 'error' | 'success'>('info');

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
			message = 'Configuration saved securely.';
			messageType = 'success';
		} catch (error) {
			message = 'Failed to save configuration.';
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
</script>

<div class="settings-container">
	<h1>Settings</h1>

  <!-- Theme Section -->
  <section class="settings-section">
    <h2>Appearance</h2>
    <div class="form-group">
      <label for="theme-mode">Mode</label>
      <select id="theme-mode" value={$themeStore.mode} onchange={handleThemeModeChange}>
        <option value="auto">Auto (System)</option>
        <option value="day">Day (Always Light)</option>
        <option value="night">Night (Always Dark)</option>
        <option value="schedule">Schedule</option>
      </select>
    </div>

    <div class="form-group">
      <label for="theme-select">Theme</label>
      <select id="theme-select" value={$themeStore.currentThemeId} onchange={handleThemeChange}>
        {#each $themeStore.availableThemes as theme}
          <option value={theme.id}>{theme.name} {theme.isCustom ? '(Custom)' : ''}</option>
        {/each}
      </select>
    </div>

    {#if $themeStore.mode === 'schedule'}
      <div class="schedule-inputs">
        <div class="form-group">
          <label for="day-start">Day Start</label>
          <input 
            type="time" 
            id="day-start" 
            value={$themeStore.schedule?.dayStart || '07:00'} 
            onchange={(e) => handleScheduleChange('dayStart', e.currentTarget.value)}
          />
        </div>
        <div class="form-group">
          <label for="night-start">Night Start</label>
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

  <!-- Connection Section -->
  <section class="settings-section">
    <h2>Connection</h2>
    <p class="description">Configure your Home Assistant connection details.</p>

    <div class="form-group">
      <label for="url">Server URL</label>
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
      <label for="token">Long-Lived Access Token</label>
      <input 
        id="token" 
        type="password" 
        bind:value={token} 
        placeholder="eyJhbGciOi..." 
        autocomplete="current-password"
      />
      <span class="hint">Create this in your HA profile settings.</span>
    </div>

    <div class="actions">
      <button class="btn-secondary" onclick={handleTest}>Test Connection</button>
      <button class="btn-primary" onclick={handleSave}>Save Configuration</button>
    </div>

    {#if message}
      <div class="message {messageType}">
        {message}
      </div>
    {/if}
  </section>
</div>

<style>
	.settings-container {
		max-width: 600px;
		margin: 0 auto;
		padding: 2rem 0;
	}

  .settings-section {
    margin-bottom: 3rem;
    padding-bottom: 2rem;
    border-bottom: 1px solid var(--border-divider, #ddd);
  }
  
  .settings-section:last-child {
    border-bottom: none;
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

	label {
		display: block;
		margin-bottom: 0.5rem;
		font-weight: 500;
    color: var(--text-primary);
	}

	input, select {
		width: 100%;
		padding: 0.75rem;
		border: 1px solid var(--border-input, #ccc);
		border-radius: 4px;
		font-size: 1rem;
		box-sizing: border-box;
    background: var(--bg-input, #fff);
    color: var(--text-primary);
	}

  .schedule-inputs {
    display: flex;
    gap: 1rem;
  }

	.hint {
		display: block;
		margin-top: 0.25rem;
		font-size: 0.85rem;
		color: var(--text-status, #888);
	}

	.actions {
		display: flex;
		gap: 1rem;
		margin-top: 2rem;
	}

	button {
		padding: 0.75rem 1.5rem;
		border: none;
		border-radius: 4px;
		font-size: 1rem;
		cursor: pointer;
	}

	.btn-primary {
		background-color: var(--accent-primary, #007bff);
		color: #fff;
	}

	.btn-secondary {
		background-color: transparent;
		color: var(--text-primary);
    border: 1px solid var(--border-input, #ccc);
	}

	.message {
		margin-top: 1.5rem;
		padding: 1rem;
		border-radius: 4px;
	}

	.message.info { background-color: #e3f2fd; color: #0d47a1; }
	.message.success { background-color: #e8f5e9; color: #1b5e20; }
	.message.error { background-color: #ffebee; color: #b71c1c; }
</style>
