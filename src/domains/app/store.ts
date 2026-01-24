import { browser } from '$app/environment';
import { writable } from 'svelte/store';
import { type AppState, type ServerConfig, type LayoutConfig, generateId } from '$lib/types';
import { getOrCreateEncryptionKey, encrypt, decrypt } from '../ha/crypto';

// Global app state using Svelte Store
export const appState = writable<AppState>({
	activeServer: null,
	savedServers: []
});

// Layout Store
export const layoutConfig = writable<LayoutConfig>({
	cardOrder: [],
	timestamp: Date.now()
});

const SERVER_STORAGE_KEY = 'app_server_config_encrypted';
const SERVERS_LIST_KEY = 'app_servers_list_encrypted';
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
			
			// Migration: Ensure ID
			if (!config.id) config.id = generateId();

			if (config && config.url && config.token) {
				appState.update(s => ({ ...s, activeServer: config }));
			}
		}
	} catch (e) {
		console.error('Failed to load server config', e);
		localStorage.removeItem(SERVER_STORAGE_KEY);
	}
}

export async function loadSavedServers(): Promise<void> {
	if (!browser) return;
	try {
		let list: ServerConfig[] = [];
		const listEncrypted = localStorage.getItem(SERVERS_LIST_KEY);
		
		if (listEncrypted) {
			const key = await getOrCreateEncryptionKey();
			const json = await decrypt(listEncrypted, key);
			list = JSON.parse(json);
		}

		// Migration: If we have an active server but empty list, add it
		const activeEncrypted = localStorage.getItem(SERVER_STORAGE_KEY);
		if (activeEncrypted && list.length === 0) {
			const key = await getOrCreateEncryptionKey();
			const json = await decrypt(activeEncrypted, key);
			const active = JSON.parse(json);
			
			if (!active.id) active.id = generateId();
			
			// Ensure name exists
			if (!active.name) active.name = 'Home Assistant';
			
			list.push(active);
			// Persist the migrated list
			await saveSavedServers(list);
		}

		appState.update(s => ({ ...s, savedServers: list }));
	} catch (e) {
		console.error('Failed to load saved servers', e);
	}
}

export async function saveSavedServers(servers: ServerConfig[]): Promise<void> {
	if (!browser) return;
	try {
		const key = await getOrCreateEncryptionKey();
		const json = JSON.stringify(servers);
		const encrypted = await encrypt(json, key);
		localStorage.setItem(SERVERS_LIST_KEY, encrypted);
		appState.update(s => ({ ...s, savedServers: servers }));
	} catch (e) {
		console.error('Failed to save servers list', e);
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