import { browser } from '$app/environment';
import { writable } from 'svelte/store';
import type { AppState, ServerConfig } from '$lib/types';

// Global app state using Svelte Store
export const appState = writable<AppState>({
	activeServer: null
});

const STORAGE_KEY = 'app_server_config';

export function loadServerConfig(): void {
	if (!browser) return;
	try {
		const stored = localStorage.getItem(STORAGE_KEY);
		if (stored) {
			const config = JSON.parse(stored);
			if (config && config.url && config.token) {
				appState.update(s => ({ ...s, activeServer: config }));
			}
		}
	} catch (e) {
		console.error('Failed to load server config', e);
	}
}

export function saveServerConfig(config: ServerConfig): void {
	if (!browser) return;
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
		appState.update(s => ({ ...s, activeServer: config }));
	} catch (e) {
		console.error('Failed to save server config', e);
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