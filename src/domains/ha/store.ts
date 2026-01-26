import { writable, derived, get, type Readable } from 'svelte/store';
import { HAClient } from './api';
import type { HAStoreState, HAEntity, StateChangedEvent, HAState } from '$lib/types';

// Global HA Store
export const haStore = writable<HAStoreState>({
  isConnected: false,
  isLoading: false,
  error: null,
  entities: new Map(),
  problemEntities: new Set(),
  latency: undefined,
});

// Derived stores for UI
export const entityList: Readable<HAEntity[]> = derived(haStore, ($store) => {
  return Array.from($store.entities.values());
});

// Internal client instance and intervals
let client: HAClient | null = null;
let pingInterval: ReturnType<typeof setInterval> | null = null;

// --- Update Batching Mechanism ---
// This prevents hundreds of re-renders per second when many events fire at once.
let updateBuffer = new Map<string, HAEntity>();
let updateFrame: number | null = null;

function flushUpdates() {
  haStore.update((s) => {
    // Clone collections
    const newEntities = new Map(s.entities);
    const newProblems = new Set(s.problemEntities);

    updateBuffer.forEach((state, id) => {
      newEntities.set(id, state);

      // Update problem index
      if (state.state === 'unavailable' || state.state === 'unknown') {
        newProblems.add(id);
      } else {
        newProblems.delete(id);
      }
    });

    return {
      ...s,
      entities: newEntities,
      problemEntities: newProblems,
    };
  });

  updateBuffer.clear();
  updateFrame = null;
}

function scheduleUpdate(entityId: string, newState: HAEntity) {
  updateBuffer.set(entityId, newState);

  if (!updateFrame) {
    updateFrame = requestAnimationFrame(flushUpdates);
  }
}
// --------------------------------

export async function initializeHAConnection(url: string, token: string): Promise<void> {
  if (client) {
    await disconnectHA();
  }

  haStore.update((s) => ({ ...s, isLoading: true, error: null }));

  try {
    client = new HAClient(url, token);
    await client.connect();

    // Initial data fetch
    const states = await client.getStates();

    // Bulk initial update
    haStore.update((s) => {
      const newEntities = new Map<string, HAEntity>();
      const newProblems = new Set<string>();

      states.forEach((state) => {
        const entity = mapStateToEntity(state);
        newEntities.set(state.entity_id, entity);
        if (entity.state === 'unavailable' || entity.state === 'unknown') {
          newProblems.add(state.entity_id);
        }
      });

      return {
        ...s,
        isConnected: true,
        entities: newEntities,
        problemEntities: newProblems,
      };
    });

    // Setup subscriptions
    await client.subscribe('state_changed');
    client.onStateChange((event: StateChangedEvent) => {
      if (event.data.new_state) {
        updateEntity(event.data.entity_id, mapStateToEntity(event.data.new_state));
      }
    });

    // Start Heartbeat/Ping
    startPingLoop();
  } catch (error: any) {
    console.error('HA Connection failed:', error);
    haStore.update((s) => ({
      ...s,
      isConnected: false,
      error: error.message || 'Connection failed',
    }));
    if (client) {
      try {
        await client.disconnect();
      } catch (e) {
        /* ignore */
      }
      client = null;
    }
  } finally {
    haStore.update((s) => ({ ...s, isLoading: false }));
  }
}

function startPingLoop() {
  if (pingInterval) clearInterval(pingInterval);

  // Initial ping
  measureLatency();

  // Ping every 30 seconds
  pingInterval = setInterval(measureLatency, 30000);
}

async function measureLatency() {
  if (!client || !client.isConnected()) return;
  try {
    const ms = await client.ping();
    haStore.update((s) => ({ ...s, latency: Math.round(ms) }));
  } catch (e) {
    console.warn('Ping failed', e);
  }
}

export async function disconnectHA(): Promise<void> {
  if (pingInterval) {
    clearInterval(pingInterval);
    pingInterval = null;
  }

  if (client) {
    await client.disconnect();
    client = null;
  }
  haStore.update((s) => ({
    ...s,
    isConnected: false,
    entities: new Map(),
    problemEntities: new Set(),
    error: null,
    latency: undefined,
  }));
}

export function updateEntity(entityId: string, newState: HAEntity): void {
  // Use the batched scheduler instead of direct store update
  scheduleUpdate(entityId, newState);
}

export function getEntity(entityId: string): HAEntity | undefined {
  const state = get(haStore);
  return state.entities.get(entityId);
}

// Action Functions

export async function callService(
  domain: string,
  service: string,
  serviceData: Record<string, any>
): Promise<void> {
  if (!client || !client.isConnected()) {
    throw new Error('Not connected to Home Assistant');
  }

  await client.callService(domain, service, serviceData);
}

// Strategy map for toggling entities
const toggleStrategies: Record<string, (client: HAClient, entity: HAEntity) => Promise<void>> = {
  light: (c, e) => c.callService('light', 'toggle', { entity_id: e.entity_id }),
  switch: (c, e) => c.callService('switch', 'toggle', { entity_id: e.entity_id }),
  cover: (c, e) => c.callService('cover', 'toggle', { entity_id: e.entity_id }),
  input_boolean: (c, e) => c.callService('input_boolean', 'toggle', { entity_id: e.entity_id }),
  lock: (c, e) => {
    const service = e.state === 'locked' ? 'unlock' : 'lock';
    return c.callService('lock', service, { entity_id: e.entity_id });
  },
  script: (c, e) => c.callService('script', 'turn_on', { entity_id: e.entity_id }),
  automation: (c, e) => c.callService('automation', 'trigger', { entity_id: e.entity_id }),
};

export async function toggleEntity(entityId: string): Promise<void> {
  if (!client || !client.isConnected()) {
    throw new Error('Not connected to Home Assistant');
  }

  const state = get(haStore);
  const entity = state.entities.get(entityId);

  if (!entity) {
    throw new Error(`Entity ${entityId} not found`);
  }

  const domain = entityId.split('.')[0];
  const handler = toggleStrategies[domain];

  if (handler) {
    await handler(client, entity);
  } else {
    throw new Error(`Cannot toggle entity with domain: ${domain}`);
  }
}

function mapStateToEntity(state: HAState): HAEntity {
  return {
    entity_id: state.entity_id,
    state: state.state,
    attributes: state.attributes,
    last_changed: state.last_changed,
    last_updated: state.last_updated,
    context: state.context,
  };
}
