<script lang="ts">
	import { appState, saveServerConfig } from '../../domains/app/store';
	import type { ServerConfig } from '$lib/types';

	let url = $state('');
	let token = $state('');
	let message = $state('');
	let messageType = $state<'info' | 'error' | 'success'>('info');

	// Initialize form from store if available
	$effect(() => {
		// Access store value with $ prefix
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

		// Simple URL validation
		let cleanUrl = url.trim();
		// Remove trailing slash
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
		
		// Mock connection test
		message = 'Ready to connect (Mock)';
		messageType = 'info';
	}
</script>

<div class="settings-container">
	<h1>Settings</h1>
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
</div>

<style>
	.settings-container {
		max-width: 600px;
		margin: 0 auto;
		padding: 2rem 0;
	}

	h1 {
		margin-bottom: 0.5rem;
	}

	.description {
		margin-bottom: 2rem;
		color: #666;
	}

	.form-group {
		margin-bottom: 1.5rem;
	}

	label {
		display: block;
		margin-bottom: 0.5rem;
		font-weight: 500;
	}

	input {
		width: 100%;
		padding: 0.75rem;
		border: 1px solid #ccc;
		border-radius: 4px;
		font-size: 1rem;
		box-sizing: border-box;
	}

	.hint {
		display: block;
		margin-top: 0.25rem;
		font-size: 0.85rem;
		color: #888;
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
		background-color: #03a9f4;
		color: white;
	}

	.btn-secondary {
		background-color: #e0e0e0;
		color: #333;
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