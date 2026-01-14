// C:/CODE/evolusion/src/domains/ha/api.ts

/**
 * @fileoverview
 * Manages the WebSocket connection to the Home Assistant server.
 * This includes authentication, sending commands, and subscribing to events.
 *
 * Source of Truth (inspiration): While fusion/hooks/useHomeAssistant.ts was minimal,
 * this implementation is based on the standard Home Assistant WebSocket API documentation
 * and patterns observed in the original Fusion project's implicit behavior.
 * See: https://developers.home-assistant.io/docs/api/websocket/
 */

import { browser } from '$app/environment';
import { getDecryptedItem } from './storage';
import type { HAConnection, MessageHandler } from '$lib/types';

const HA_API_TOKEN_KEY = 'haApiToken';
const HA_URL_KEY = 'haUrl';

// --- WebSocket Message Types ---
const MSG_TYPE_AUTH_REQUIRED = 'auth_required';
const MSG_TYPE_AUTH = 'auth';
const MSG_TYPE_AUTH_OK = 'auth_ok';
const MSG_TYPE_AUTH_INVALID = 'auth_invalid';
const MSG_TYPE_SUBSCRIBE_EVENTS = 'subscribe_events';
const MSG_TYPE_RESULT = 'result';
const MSG_TYPE_EVENT = 'event';


class HassConnection implements HAConnection {
	private ws: WebSocket | null = null;
	private messageHandler: MessageHandler;
	private url: string;
	private connectionPromise: Promise<void> | null = null;
	private resolveConnectionPromise!: () => void;
	private rejectConnectionPromise!: (reason?: any) => void;
	private messageId = 1;

	constructor(url: string, messageHandler: MessageHandler) {
		this.url = url;
		this.messageHandler = messageHandler;
	}

	public async connect(): Promise<void> {
		if (this.ws && this.ws.readyState === WebSocket.OPEN) {
			return this.connectionPromise || Promise.resolve();
		}

		if (this.ws && this.ws.readyState === WebSocket.CONNECTING) {
			return this.connectionPromise || Promise.resolve();
		}

		if (!browser) {
			throw new Error('WebSocket connections can only be established in the browser.');
		}

		this.connectionPromise = new Promise((resolve, reject) => {
			this.resolveConnectionPromise = resolve;
			this.rejectConnectionPromise = reject;
		});

		try {
			this.ws = new WebSocket(this.url);
			this.ws.onopen = this.onOpen.bind(this);
			this.ws.onmessage = this.onMessage.bind(this);
			this.ws.onclose = this.onClose.bind(this);
			this.ws.onerror = this.onError.bind(this);
		} catch (error) {
			console.error('WebSocket connection failed:', error);
			this.rejectConnectionPromise(error);
		}

		return this.connectionPromise;
	}

	public disconnect(): void {
		if (this.ws) {
			this.ws.close();
		}
	}

	private onOpen(): void {
		console.log('WebSocket connection established.');
	}

	private async onMessage(event: MessageEvent): Promise<void> {
		const message = JSON.parse(event.data);
		// console.log('Received message:', message);

		switch (message.type) {
			case MSG_TYPE_AUTH_REQUIRED:
				await this.authenticate();
				break;
			case MSG_TYPE_AUTH_OK:
				console.log('Authentication successful.');
				this.resolveConnectionPromise();
				break;
			case MSG_TYPE_AUTH_INVALID:
				console.error('Authentication failed:', message.message);
				this.rejectConnectionPromise(new Error(message.message));
				this.disconnect();
				break;
			default:
				this.messageHandler(message);
		}
	}

	private onClose(): void {
		console.log('WebSocket connection closed.');
		this.ws = null;
		this.connectionPromise = null;
		// Potentially implement reconnection logic here
	}

	private onError(error: Event): void {
		console.error('WebSocket error:', error);
		this.rejectConnectionPromise(error);
	}

	private async authenticate(): Promise<void> {
		const accessToken = await getDecryptedItem(HA_API_TOKEN_KEY);
		if (!accessToken) {
			const authError = 'No access token found.';
			console.error(authError);
			this.rejectConnectionPromise(new Error(authError));
			this.disconnect();
			return;
		}

		this.ws?.send(
			JSON.stringify({
				type: MSG_TYPE_AUTH,
				access_token: accessToken
			})
		);
	}

	private send(message: Record<string, any>): number {
		if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
			console.warn('WebSocket is not connected. Cannot send message.');
			return -1;
		}
		const id = this.messageId++;
		message.id = id;
		this.ws.send(JSON.stringify(message));
		return id;
	}

	public subscribeEvents(eventType?: string): number {
		const message: { type: string; event_type?: string } = {
			type: MSG_TYPE_SUBSCRIBE_EVENTS
		};

		if (eventType) {
			message.event_type = eventType;
		}

		return this.send(message);
	}

	public callService(
		domain: string,
		service: string,
		serviceData: Record<string, any>
	): number {
		return this.send({
			type: 'call_service',
			domain,
			service,
			service_data: serviceData
		});
	}

	public setBrightness(entityId: string, brightness: number): number {
		return this.callService('light', 'turn_on', {
			entity_id: entityId,
			brightness_pct: brightness
		});
	}

	public setTemperature(entityId: string, temperature: number): number {
		return this.callService('climate', 'set_temperature', {
			entity_id: entityId,
			temperature
		});
	}

	public fetchStates(): number {
		return this.send({
			type: 'get_states'
		});
	}

	public fetchDevices(): number {
		return this.send({
			type: 'config/device_registry/list'
		});
	}

	public fetchAreas(): number {
		return this.send({
			type: 'config/area_registry/list'
		});
	}

	public fetchEntityRegistry(): number {
		return this.send({
			type: 'config/entity_registry/list'
		});
	}

	public subscribeHistory(entityId: string, startTime?: string, endTime?: string): number {
		const startDate = startTime || new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

		const message: any = {
			type: 'history/stream',
			entity_ids: [entityId],
			start_time: startDate
		};

		if (endTime) {
			message.end_time = endTime;
		}

		return this.send(message);
	}

	public subscribeWeather(entityId: string): number {
		return this.send({
			type: 'weather/subscribe',
			entity_id: entityId
		});
	}
}

let connection: HAConnection | null = null;

export async function createConnection(
	messageHandler: MessageHandler
): Promise<HAConnection> {
	if (connection) {
		return connection;
	}

	const url = await getDecryptedItem(HA_URL_KEY);
	if (!url) {
		throw new Error('Home Assistant URL not found in secure storage.');
	}

		connection = new HassConnection(url, messageHandler);

		await connection.connect();

	

		return connection;

	}

	

	export function resetConnection(): void {

		connection = null;

	}
