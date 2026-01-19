<script lang="ts">
	import { appState, saveServerConfig } from '../../domains/app/store';
	import { themeSettings } from '../../domains/ui/theme/store';
	import type { ServerConfig } from '$lib/types';

	let url = $state('');
	let token = $state('');
	let message = $state('');
	let messageType = $state<'info' | 'error' | 'success'>('info');

	// Initialize form from store if available
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
      <label for="theme-mode">Theme Mode</label>
      <select id="theme-mode" value={$themeSettings.mode} onchange={handleThemeModeChange}>
        <option value="auto">Auto (System)</option>
        <option value="day">Day (Always Light)</option>
        <option value="night">Night (Always Dark)</option>
        <option value="schedule">Schedule</option>
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
    border-bottom: 1px solid var(--border, #eee);
  }
  
  .settings-section:last-child {
    border-bottom: none;
  }

	h1 {
		margin-bottom: 2rem;
    color: var(--text-primary, #333);
	}
  
  h2 {
    font-size: 1.25rem;
    margin-bottom: 1rem;
    color: var(--text-primary, #333);
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
    color: var(--text-primary, #333);
	}

	input, select {
		width: 100%;
		padding: 0.75rem;
		border: 1px solid var(--border, #ccc);
		border-radius: 4px;
		font-size: 1rem;
		box-sizing: border-box;
    background: var(--bg-input, white);
    color: var(--text-primary, #333);
	}

  .schedule-inputs {
    display: flex;
    gap: 1rem;
  }

	.hint {
		display: block;
		margin-top: 0.25rem;
		font-size: 0.85rem;
		color: var(--text-secondary, #888);
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
		background-color: var(--primary, #03a9f4);
		color: var(--text-inverted, white);
	}

	.btn-secondary {
		background-color: var(--bg-input, #e0e0e0);
		color: var(--text-primary, #333);
    border: 1px solid var(--border, #ccc);
	}

	.message {
		margin-top: 1.5rem;
		padding: 1rem;
		border-radius: 4px;
	}

	.message.info { background-color: rgba(33, 150, 243, 0.1); color: var(--primary, #0d47a1); }
	.message.success { background-color: rgba(76, 175, 80, 0.1); color: var(--success, #1b5e20); }
	.message.error { background-color: rgba(244, 67, 54, 0.1); color: var(--error, #b71c1c); }
</style>