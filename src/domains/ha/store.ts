import { writable, derived, get, type Readable } from 'svelte/store';
import { HAClient } from './api';
import type { HAStoreState, HAEntity, StateChangedEvent, HAState } from '$lib/types';

// Global HA Store
export const haStore = writable<HAStoreState>({
	isConnected: false,
	isLoading: false,
	error: null,
	entities: new Map()
});

// Derived stores for UI
export const entityList: Readable<HAEntity[]> = derived(haStore, ($store) => {
	return Array.from($store.entities.values());
});

export const connectedEntities: Readable<HAEntity[]> = derived(haStore, ($store) => {
	return Array.from($store.entities.values()).filter((e: HAEntity) => e.state !== 'unavailable');
});

// Internal client instance
let client: HAClient | null = null;

export async function initializeHAConnection(url: string, token: string): Promise<void> {
	// Prevent duplicate connection attempts if already connecting/connected to same config?
	// For MVP, we simply disconnect previous and connect new.
	if (client) {
		await disconnectHA();
	}

	haStore.update((s) => ({ ...s, isLoading: true, error: null }));

	try {
		client = new HAClient(url, token);
		await client.connect();

		// Initial data fetch
		const states = await client.getStates();
		
		// Update store with initial states
		haStore.update((s) => {
			const newEntities = new Map<string, HAEntity>();
			states.forEach((state) => {
				newEntities.set(state.entity_id, mapStateToEntity(state));
			});
			return {
				...s,
				isConnected: true,
				entities: newEntities
			};
		});

		// Setup subscriptions
		await client.subscribe('state_changed');
		client.onStateChange((event: StateChangedEvent) => {
			if (event.data.new_state) {
				updateEntity(event.data.entity_id, mapStateToEntity(event.data.new_state));
			} else {
				// Entity removed? Handle if needed. For now just ignore null new_state
			}
		});

	} catch (error: any) {
		console.error('HA Connection failed:', error);
		haStore.update((s) => ({
			...s,
			isConnected: false,
			error: error.message || 'Connection failed'
		}));
		// Ensure client is cleaned up if connection failed partway
		if (client) {
			try {
				await client.disconnect();
			} catch (e) { /* ignore */ }
			client = null;
		}
	} finally {
		haStore.update((s) => ({ ...s, isLoading: false }));
	}
}

export async function disconnectHA(): Promise<void> {
	if (client) {
		await client.disconnect();
		client = null;
	}
	haStore.update((s) => ({
		...s,
		isConnected: false,
		entities: new Map(), // Clear data on disconnect
		error: null
	}));
}

export function updateEntity(entityId: string, newState: HAEntity): void {
	haStore.update((s) => {
		// Create a new Map to ensure Svelte store reactivity detects the change
		// Optimization: In very large lists, this might be slow. 
		// For MVP it's acceptable.
		const newEntities = new Map(s.entities);
		newEntities.set(entityId, newState);
		return { ...s, entities: newEntities };
	});
}

export function getEntity(entityId: string): HAEntity | undefined {
	const state = get(haStore);
	return state.entities.get(entityId);
}

// Helper to map raw HAState (contracts) to HAEntity (app type)
// Currently they are identical, but good to have the separation layer
function mapStateToEntity(state: HAState): HAEntity {
	return {
		entity_id: state.entity_id,
		state: state.state,
		attributes: state.attributes,
		last_changed: state.last_changed,
		last_updated: state.last_updated,
		context: state.context
	};
}