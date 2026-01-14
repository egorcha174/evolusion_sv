import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createConnection, resetConnection } from '../src/domains/ha/api';

// Mock storage
vi.mock('../src/domains/ha/storage', () => ({
	getDecryptedItem: vi.fn((key: string) => {
		if (key === 'haUrl') return Promise.resolve('ws://localhost:8123/api/websocket');
		if (key === 'haApiToken') return Promise.resolve('fake-token');
		return Promise.resolve(null);
	}),
	setEncryptedItem: vi.fn(() => Promise.resolve())
}));

// Mock $app/environment
vi.mock('$app/environment', () => ({
	browser: true
}));

describe('HA API Contract Tests', () => {
	let mockWs: any;

	beforeEach(() => {
		resetConnection();
		mockWs = {
			send: vi.fn(),
			close: vi.fn(),
			readyState: 1, // OPEN
			onmessage: null as any,
			onerror: null as any,
			onclose: null as any,
			onopen: null as any
		};
		// Vitest needs a constructor function for 'new WebSocket'
		class MockWebSocket {
			static OPEN = 1;
			static CLOSED = 3;
			static CLOSING = 2;
			static CONNECTING = 0;

			constructor() {
				// HassConnection assigns to ws.onopen, etc.
				// We need to capture those assignments.
				setTimeout(() => {
					if (this.onopen) mockWs.onopen = this.onopen;
					if (this.onmessage) mockWs.onmessage = this.onmessage;
					if (this.onclose) mockWs.onclose = this.onclose;
					if (this.onerror) mockWs.onerror = this.onerror;
				}, 0);
			}
			onopen: any;
			onmessage: any;
			onclose: any;
			onerror: any;
			send = (data: string) => mockWs.send(data);
			close = () => mockWs.close();
			get readyState() { return mockWs.readyState; }
			OPEN = 1;
		}
		
		vi.stubGlobal('WebSocket', MockWebSocket);
	});

	it('should handle auth flow correctly', async () => {
		const messageHandler = vi.fn();
		const connectionPromise = createConnection(messageHandler);

		// Wait for handlers to be assigned
		await vi.waitFor(() => expect(mockWs.onopen).toBeTypeOf('function'));

		// Trigger onopen
		mockWs.onopen();

		// Check if auth_required was handled
		await mockWs.onmessage({ data: JSON.stringify({ type: 'auth_required' }) });
		expect(mockWs.send).toHaveBeenCalledWith(expect.stringContaining('"type":"auth"'));

		// Send auth_ok
		mockWs.onmessage({ data: JSON.stringify({ type: 'auth_ok' }) });

		const connection = await connectionPromise;
		expect(connection).toBeDefined();
	});

	it('should call fetchStates correctly', async () => {
		const messageHandler = vi.fn();
		const connectionPromise = createConnection(messageHandler);
		
		await vi.waitFor(() => expect(mockWs.onopen).toBeTypeOf('function'));
		
		mockWs.onopen();
		// Auth flow in HassConnection: 
		// 1. Send auth_required
		// 2. Client sends auth
		// 3. Client receives auth_ok
		await mockWs.onmessage({ data: JSON.stringify({ type: 'auth_required' }) });
		
		// Wait for client to send auth
		await vi.waitFor(() => expect(mockWs.send).toHaveBeenCalledWith(expect.stringContaining('"type":"auth"')));
		
		await mockWs.onmessage({ data: JSON.stringify({ type: 'auth_ok' }) });
		
		const connection = await connectionPromise;

		// We need to wait a tick for internal state to update if needed
		await new Promise(resolve => setTimeout(resolve, 0));

		connection.fetchStates();
		expect(mockWs.send).toHaveBeenCalledWith(expect.stringContaining('"type":"get_states"'));
	});
});
