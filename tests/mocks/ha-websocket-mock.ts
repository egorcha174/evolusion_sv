import { type IncomingMessage, type OutgoingMessage } from '../../src/domains/ha/contracts';

export class HaWebSocketMock {
	private server: any;
	private clients: Set<any> = new Set();

	constructor() {
		// In a real Vitest environment, we might use a library or just mock the WebSocket global.
		// For now, this is a placeholder for the logic.
	}

	handleMessage(client: any, data: string) {
		const message: OutgoingMessage = JSON.parse(data);
		
		switch (message.type) {
			case 'auth':
				if (message.access_token === 'valid-token') {
					this.send(client, { type: 'auth_ok', ha_version: '2024.1.0' });
				} else {
					this.send(client, { type: 'auth_invalid', message: 'Invalid token' });
				}
				break;
			case 'get_states':
				this.send(client, {
					type: 'result',
					id: (message as any).id,
					success: true,
					result: []
				});
				break;
			case 'subscribe_events':
				this.send(client, {
					type: 'result',
					id: (message as any).id,
					success: true,
					result: null
				});
				break;
		}
	}

	private send(client: any, message: IncomingMessage) {
		client.send(JSON.stringify(message));
	}
}
