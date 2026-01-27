
import { browser } from '$app/environment';
import { writable, get } from 'svelte/store';
import { type AppState, type ServerConfig, type LayoutConfig, generateId } from '$lib/types';
import { encrypt, decrypt } from '../ha/crypto';
import { session } from './session';

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

function getSessionKey(): CryptoKey {
    const s = get(session);
    if (!s.key) {
        throw new Error('Session is locked. Key not available.');
    }
    return s.key;
}

// --- Server Config Persistence ---

export async function loadServerConfig(): Promise<void> {
	if (!browser) return;
	try {
		const encrypted = localStorage.getItem(SERVER_STORAGE_KEY);
		if (encrypted) {
			const key = getSessionKey();
			const configStr = await decrypt(encrypted, key);
			const config = JSON.parse(configStr);
			
			// Migration: Ensure ID
			if (!config.id) config.id = generateId();

			if (config && config.url && config.token) {
				appState.update(s => ({ ...s, activeServer: config }));
			}
		}
	} catch (e) {
		console.error('Failed to load server config (decryption failed or locked)', e);
        // Do NOT clear storage here automatically on error, user might have just typed wrong PIN (though PIN check happens earlier).
        // But if PIN is correct and this fails, data might be corrupted or from old incompatible version.
	}
}

export async function loadSavedServers(): Promise<void> {
	if (!browser) return;
	try {
		let list: ServerConfig[] = [];
		const listEncrypted = localStorage.getItem(SERVERS_LIST_KEY);
		
		if (listEncrypted) {
			const key = getSessionKey();
			const json = await decrypt(listEncrypted, key);
			list = JSON.parse(json);
		}

		appState.update(s => ({ ...s, savedServers: list }));
	} catch (e) {
		console.error('Failed to load saved servers', e);
	}
}

export async function saveSavedServers(servers: ServerConfig[]): Promise<void> {
	if (!browser) return;
	try {
		const key = getSessionKey();
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
		const key = getSessionKey();
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
			const key = getSessionKey();
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
		const key = getSessionKey();
		const layoutStr = JSON.stringify(layout);
		const encrypted = await encrypt(layoutStr, key);
		localStorage.setItem(LAYOUT_STORAGE_KEY, encrypted);
		layoutConfig.set(layout);
	} catch (error) {
		console.error('Failed to save layout:', error);
	}
}
