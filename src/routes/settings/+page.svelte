<script lang="ts">
	import { appState, saveServerConfig } from '../../domains/app/store';
	import { themeSettings } from '../../domains/ui/theme/store';
  import { BUILTIN_THEMES } from '../../domains/ui/theme/defaults';
	import type { ServerConfig } from '$lib/types';

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
	  const mode = (e.target as HTMLSelectElement).value as any;
	  themeSettings.update(s => {
	    const next = { ...s, mode };
	    themeSettings.save(next);
	    return next;
	  });
	}

  function handleThemeChange(e: Event) {
    const activeThemeId = (e.target as HTMLSelectElement).value;
    themeSettings.update(s => {
      const next = { ...s, activeThemeId };
      themeSettings.save(next);
      return next;
    });
  }

	function handleScheduleChange(field: 'darkStart' | 'darkEnd', value: string) {
	   themeSettings.update(s => {
	    const next = { ...s, schedule: { ...s.schedule, [field]: value } };
	    themeSettings.save(next);
	    return next;
	  });
	}
</script>

<div class="settings-container">
	<h1>Settings</h1>

  <!-- Theme Section -->
  <section class="settings-section">
    <h2>Appearance</h2>
    <div class="form-group">
      <label for="theme-mode">Mode</label>
      <select id="theme-mode" value={$themeSettings.mode} onchange={handleThemeModeChange}>
        <option value="auto">Auto (System)</option>
        <option value="day">Day (Always Light)</option>
        <option value="night">Night (Always Dark)</option>
        <option value="schedule">Schedule</option>
      </select>
    </div>

    <div class="form-group">
      <label for="theme-select">Theme</label>
      <select id="theme-select" value={$themeSettings.activeThemeId} onchange={handleThemeChange}>
        {#each BUILTIN_THEMES as theme}
          <option value={theme.id}>{theme.name}</option>
        {/each}
      </select>
    </div>

    {#if $themeSettings.mode === 'schedule'}
      <div class="schedule-inputs">
        <div class="form-group">
          <label for="dark-start">Dark Mode Start</label>
          <input 
            type="time" 
            id="dark-start" 
            value={$themeSettings.schedule.darkStart} 
            onchange={(e) => handleScheduleChange('darkStart', e.currentTarget.value)}
          />
        </div>
        <div class="form-group">
          <label for="dark-end">Dark Mode End</label>
          <input 
            type="time" 
            id="dark-end" 
            value={$themeSettings.schedule.darkEnd} 
            onchange={(e) => handleScheduleChange('darkEnd', e.currentTarget.value)}
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
    border-bottom: 1px solid var(--border-divider);
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
		color: var(--text-secondary);
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
		border: 1px solid var(--border-input);
		border-radius: 4px;
		font-size: 1rem;
		box-sizing: border-box;
    background: var(--bg-input);
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
		color: var(--text-muted);
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
		background-color: var(--accent-primary);
		color: var(--text-on-accent);
	}

	.btn-secondary {
		background-color: var(--bg-chip);
		color: var(--text-primary);
    border: 1px solid var(--border-input);
	}

	.message {
		margin-top: 1.5rem;
		padding: 1rem;
		border-radius: 4px;
	}

	.message.info { background-color: var(--bg-chip); color: var(--accent-info); }
	.message.success { background-color: var(--bg-chip-active); color: var(--accent-success); }
	.message.error { background-color: var(--bg-chip); color: var(--accent-error); }
</style>