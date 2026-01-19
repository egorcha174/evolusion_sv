import { browser } from '$app/environment';
import { writable } from 'svelte/store';
import type { AppState, ServerConfig } from '$lib/types';
import { getOrCreateEncryptionKey, encrypt, decrypt } from '../ha/crypto';

// Global app state using Svelte Store
export const appState = writable<AppState>({
	activeServer: null
});

const STORAGE_KEY = 'app_server_config_encrypted';

export async function loadServerConfig(): Promise<void> {
	if (!browser) return;
	try {
		const encrypted = localStorage.getItem(STORAGE_KEY);
		if (encrypted) {
			const key = await getOrCreateEncryptionKey();
			const configStr = await decrypt(encrypted, key);
			const config = JSON.parse(configStr);
			if (config && config.url && config.token) {
				appState.update(s => ({ ...s, activeServer: config }));
			}
		}
	} catch (e) {
		console.error('Failed to load server config', e);
		// Clear corrupted data
		localStorage.removeItem(STORAGE_KEY);
	}
}

export async function saveServerConfig(config: ServerConfig): Promise<void> {
	if (!browser) return;
	try {
		const key = await getOrCreateEncryptionKey();
		const configStr = JSON.stringify(config);
		const encrypted = await encrypt(configStr, key);
		
		localStorage.setItem(STORAGE_KEY, encrypted);
		appState.update(s => ({ ...s, activeServer: config }));
	} catch (e) {
		console.error('Failed to save server config', e);
		throw e;
	}
}

export function clearServerConfig(): void {
	if (!browser) return;
	try {
		localStorage.removeItem(STORAGE_KEY);
		appState.update(s => ({ ...s, activeServer: null }));
	} catch (e) {
		console.error('Failed to clear server config', e);
	}
}