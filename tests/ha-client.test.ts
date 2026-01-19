import { expect, test } from '@playwright/test';
import { HAClient } from '../src/domains/ha/api';

// Mock WebSocket implementation
class MockWebSocket {
  url: string;
  readyState: number = 0; // CONNECTING
  onopen: ((ev: any) => any) | null = null;
  onmessage: ((ev: any) => any) | null = null;
  onclose: ((ev: any) => any) | null = null;
  onerror: ((ev: any) => any) | null = null;

  constructor(url: string) {
    this.url = url;
    // Simulate connection delay
    setTimeout(() => {
      this.readyState = 1; // OPEN
      if (this.onopen) this.onopen({});
      
      // Simulate HA Auth Flow
      // 1. Send auth_required
      if (this.onmessage) {
        this.onmessage({ 
          data: JSON.stringify({ type: 'auth_required', ha_version: '2023.1.1' }) 
        });
      }
    }, 10);
  }

  send(data: string) {
    const msg = JSON.parse(data);
    
    // 2. Client sends auth -> Respond with auth_ok
    if (msg.type === 'auth') {
      setTimeout(() => {
        if (this.onmessage) {
          this.onmessage({
            data: JSON.stringify({ type: 'auth_ok', ha_version: '2023.1.1' })
          });
        }
      }, 10);
    }
    
    // 3. Handle commands
    if (msg.type === 'get_states') {
      setTimeout(() => {
        if (this.onmessage) {
          this.onmessage({
            data: JSON.stringify({
              type: 'result',
              id: msg.id,
              success: true,
              result: [
                { entity_id: 'light.living_room', state: 'on', attributes: {} }
              ]
            })
          });
        }
      }, 10);
    }

    if (msg.type === 'subscribe_events') {
       setTimeout(() => {
        if (this.onmessage) {
          // Confirm subscription
          this.onmessage({
            data: JSON.stringify({
              type: 'result',
              id: msg.id,
              success: true,
              result: null // Subs return id implicitly via message id
            })
          });

          // Simulate an event arriving later
          setTimeout(() => {
            if (this.onmessage) {
              this.onmessage({
                data: JSON.stringify({
                  type: 'event',
                  id: msg.id,
                  event: {
                     event_type: 'state_changed',
                     data: { 
                       entity_id: 'light.living_room', 
                       new_state: { state: 'off' }
                     }
                  }
                })
              });
            }
          }, 50);
        }
      }, 10);
    }
  }

  close() {
    this.readyState = 3; // CLOSED
    if (this.onclose) this.onclose({ code: 1000, reason: 'Normal closure' });
  }
}

// Inject mock into global scope for the test environment
(globalThis as any).WebSocket = MockWebSocket;

test.describe('HAClient', () => {
  let client: HAClient;
  const URL = 'http://localhost:8123';
  const TOKEN = 'abc';

  test.beforeEach(() => {
    client = new HAClient(URL, TOKEN);
  });

  test('connects and authenticates successfully', async () => {
    await client.connect();
    expect(client.isConnected()).toBe(true);
  });

  test('getStates returns state list', async () => {
    await client.connect();
    const states = await client.getStates();
    expect(states).toHaveLength(1);
    expect(states[0].entity_id).toBe('light.living_room');
  });

  test('subscribe receives events via callback', async () => {
    await client.connect();
    let eventReceived: any = null;
    
    client.onStateChange((evt) => {
      eventReceived = evt;
    });

    await client.subscribe('state_changed');
    
    // Wait for event simulation
    await new Promise(r => setTimeout(r, 200));
    
    expect(eventReceived).not.toBeNull();
    expect(eventReceived.data.entity_id).toBe('light.living_room');
    expect(eventReceived.data.new_state.state).toBe('off');
  });

  test('disconnect closes the socket', async () => {
    await client.connect();
    await client.disconnect();
    expect(client.isConnected()).toBe(false);
  });
});