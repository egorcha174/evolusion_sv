import { expect, test } from '@playwright/test';
import { haStore, initializeHAConnection, disconnectHA, getEntity, updateEntity } from '../src/domains/ha/store';
import { get } from 'svelte/store';

// Mock WebSocket (similar to HAClient test, but we need it globally for HAClient to work)
class MockWebSocket {
  url: string;
  readyState: number = 0;
  onopen: ((ev: any) => any) | null = null;
  onmessage: ((ev: any) => any) | null = null;
  onclose: ((ev: any) => any) | null = null;
  onerror: ((ev: any) => any) | null = null;

  constructor(url: string) {
    this.url = url;
    setTimeout(() => {
      this.readyState = 1;
      if (this.onopen) this.onopen({});
      this._sendToClient({ type: 'auth_required', ha_version: '2023.1.1' });
    }, 5);
  }

  send(data: string) {
    const msg = JSON.parse(data);
    if (msg.type === 'auth') {
      setTimeout(() => this._sendToClient({ type: 'auth_ok', ha_version: '2023.1.1' }), 5);
    }
    if (msg.type === 'get_states') {
      setTimeout(() => this._sendToClient({
        type: 'result',
        id: msg.id,
        success: true,
        result: [
          { entity_id: 'light.living_room', state: 'on', attributes: {} },
          { entity_id: 'sensor.temp', state: '20', attributes: {} }
        ]
      }), 5);
    }
    if (msg.type === 'subscribe_events') {
      setTimeout(() => this._sendToClient({
        type: 'result',
        id: msg.id,
        success: true,
        result: null
      }), 5);
    }
  }

  close() {
    this.readyState = 3;
    if (this.onclose) this.onclose({ code: 1000, reason: 'Normal' });
  }

  _sendToClient(data: any) {
    if (this.onmessage) {
      this.onmessage({ data: JSON.stringify(data) });
    }
  }
}

// Inject mock
(globalThis as any).WebSocket = MockWebSocket;

test.describe('HA Store', () => {
  const URL = 'http://localhost:8123';
  const TOKEN = 'abc';

  test.beforeEach(async () => {
    // Reset store before each test
    await disconnectHA();
  });

  test('initializeHAConnection sets connected state', async () => {
    // Initial state
    expect(get(haStore).isConnected).toBe(false);

    // Start connection
    const promise = initializeHAConnection(URL, TOKEN);
    
    // Should be loading initially
    expect(get(haStore).isLoading).toBe(true);
    
    await promise;

    // After completion
    const state = get(haStore);
    expect(state.isLoading).toBe(false);
    expect(state.isConnected).toBe(true);
    expect(state.error).toBeNull();
  });

  test('Populates entities after initialization', async () => {
    await initializeHAConnection(URL, TOKEN);
    const state = get(haStore);
    expect(state.entities.size).toBe(2);
    expect(state.entities.get('light.living_room')?.state).toBe('on');
  });

  test('updateEntity updates the store', async () => {
    await initializeHAConnection(URL, TOKEN);
    
    const newEntity = {
      entity_id: 'light.living_room',
      state: 'off',
      attributes: { brightness: 100 }
    };
    
    updateEntity('light.living_room', newEntity);
    
    const state = get(haStore);
    expect(state.entities.get('light.living_room')?.state).toBe('off');
    expect(state.entities.get('light.living_room')?.attributes.brightness).toBe(100);
  });

  test('getEntity returns correct entity', async () => {
    await initializeHAConnection(URL, TOKEN);
    const entity = getEntity('sensor.temp');
    expect(entity?.state).toBe('20');
    expect(getEntity('non.existent')).toBeUndefined();
  });

  test('disconnectHA clears state', async () => {
    await initializeHAConnection(URL, TOKEN);
    expect(get(haStore).isConnected).toBe(true);
    
    await disconnectHA();
    
    const state = get(haStore);
    expect(state.isConnected).toBe(false);
    expect(state.entities.size).toBe(0);
  });

  test('Handles connection error', async () => {
    // Override MockWebSocket to fail
    const OriginalMock = (globalThis as any).WebSocket;
    (globalThis as any).WebSocket = class FailSocket extends MockWebSocket {
       constructor(url: string) {
           super(url);
           setTimeout(() => {
               if(this.onerror) this.onerror(new Event('error'));
               if(this.onclose) this.onclose({ code: 1006, reason: 'Abnormal' } as CloseEvent);
           }, 10);
       }
    };

    try {
        await initializeHAConnection(URL, TOKEN);
    } catch (e) {
        // initializeHAConnection catches internal errors but logs them
    }

    const state = get(haStore);
    expect(state.isConnected).toBe(false);
    expect(state.error).not.toBeNull();

    // Restore Mock
    (globalThis as any).WebSocket = OriginalMock;
  });
});