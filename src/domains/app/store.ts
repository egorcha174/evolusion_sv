import { browser } from '$app/environment';
import { writable } from 'svelte/store';
import type { AppState, ServerConfig, LayoutConfig } from '$lib/types';
import { getOrCreateEncryptionKey, encrypt, decrypt } from '../ha/crypto';

// Global app state using Svelte Store
export const appState = writable<AppState>({
	activeServer: null
});

// Layout Store
export const layoutConfig = writable<LayoutConfig>({
	cardOrder: [],
	timestamp: Date.now()
});

const SERVER_STORAGE_KEY = 'app_server_config_encrypted';
const LAYOUT_STORAGE_KEY = 'dashboard_layout_encrypted';

// --- Server Config Persistence ---

export async function loadServerConfig(): Promise<void> {
	if (!browser) return;
	try {
		const encrypted = localStorage.getItem(SERVER_STORAGE_KEY);
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
		localStorage.removeItem(SERVER_STORAGE_KEY);
	}
}

export async function saveServerConfig(config: ServerConfig): Promise<void> {
	if (!browser) return;
	try {
		const key = await getOrCreateEncryptionKey();
		const configStr = JSON.stringify(config);
		const encrypted = await encrypt(configStr, key);
		
		localStorage.setItem(SERVER_STORAGE_KEY, encrypted);
		appState.update(s => ({ ...s, activeServer: config }));
	} catch (e) {
		console.error('Failed to save server config', e);
		throw e;
	}
}

export function clearServerConfig(): void {
	if (!browser) return;
	try {
		localStorage.removeItem(SERVER_STORAGE_KEY);
		appState.update(s => ({ ...s, activeServer: null }));
	} catch (e) {
		console.error('Failed to clear server config', e);
	}
}

// --- Layout Persistence ---

export async function loadLayout(): Promise<void> {
	if (!browser) return;
	
	try {
		const encrypted = localStorage.getItem(LAYOUT_STORAGE_KEY);
		if (encrypted) {
			const key = await getOrCreateEncryptionKey();
			const layoutStr = await decrypt(encrypted, key);
			const layout = JSON.parse(layoutStr) as LayoutConfig;
			layoutConfig.set(layout);
		}
	} catch (error) {
		console.error('Failed to load layout:', error);
	}
}

export async function saveLayout(cardOrder: string[]): Promise<void> {
	if (!browser) return;

	const layout: LayoutConfig = {
		cardOrder,
		timestamp: Date.now(),
	};
	
	try {
		const key = await getOrCreateEncryptionKey();
		const layoutStr = JSON.stringify(layout);
		const encrypted = await encrypt(layoutStr, key);
		localStorage.setItem(LAYOUT_STORAGE_KEY, encrypted);
		layoutConfig.set(layout);
	} catch (error) {
		console.error('Failed to save layout:', error);
	}
}