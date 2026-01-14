import { createConnection, resetConnection } from './api';
import { setEncryptedItem, getDecryptedItem } from './storage';
import { app } from '../../domains/app/store.svelte.ts';
import { entityToDevice } from '$lib/utils/ha-data-mapper';

import type {
	HAConnection,
	HassEntity,
	HassMessage,
	HassDevice,
	HassArea,
	HassEntityRegistryEntry,
	WeatherData,
	WeatherSettings,
	DeviceCustomization,
	Device,
	PhysicalDevice,
	RoomWithPhysicalDevices
} from '$lib/types';

interface BatteryDevice {
	deviceId: string;
	deviceName: string;
	batteryLevel: number;
}

interface HaState {
	connection: HAConnection | null;
	entities: Map<string, HassEntity>;
	devices: Map<string, HassDevice>;
	areas: Map<string, HassArea>;
	entityRegistry: Map<string, HassEntityRegistryEntry>;
	history: Map<string, any[]>;
	weatherData: WeatherData | null;
	weatherSettings: WeatherSettings;
	batteryDevices: BatteryDevice[];
	customizations: Map<string, DeviceCustomization>;
	isConnected: boolean;
	isConnecting: boolean;
	isAuthenticated: boolean;
	error: string | null;
	fetchIds: {
		states: number | null;
		devices: number | null;
		areas: number | null;
		entityRegistry: number | null;
		history: number | null;
		weather: number | null;
	};
}

const HA_CUSTOMIZATIONS_KEY = 'haCustomizations';

const state = $state<HaState>({
	connection: null,
	entities: new Map(),
	devices: new Map(),
	areas: new Map(),
	entityRegistry: new Map(),
	history: new Map(),
	weatherData: null,
	weatherSettings: {
		iconPack: 'default', // Default icon pack
		forecastDays: 5 // Default forecast days
	},
	batteryDevices: [],
	customizations: new Map(),
	isConnected: false,
	isConnecting: false,
	isAuthenticated: false,
	error: null,
	fetchIds: {
		states: null,
		devices: null,
		areas: null,
		entityRegistry: null,
		history: null,
		weather: null
	}
});

$effect(() => {
	const newBatteryDevices: BatteryDevice[] = [];
	for (const entity of state.entities.values()) {
		// Check for battery level attribute
		if (typeof entity.attributes.battery_level === 'number') {
			newBatteryDevices.push({
				deviceId: entity.entity_id,
				deviceName: entity.attributes.friendly_name || entity.entity_id,
				batteryLevel: entity.attributes.battery_level
			});
		}
		// Check for binary_sensor with device_class 'battery'
		if (entity.entity_id.startsWith('binary_sensor.') && entity.attributes.device_class === 'battery') {
			if (entity.state === 'on') { // 'on' usually means low battery for binary_sensor.battery
				newBatteryDevices.push({
					deviceId: entity.entity_id,
					deviceName: entity.attributes.friendly_name || entity.entity_id,
					batteryLevel: 0 // Represent as 0% for low battery sensor
				});
			} else {
				// If it's 'off' or 'unavailable', we can represent it as 100% or just ignore
				newBatteryDevices.push({
					deviceId: entity.entity_id,
					deviceName: entity.attributes.friendly_name || entity.entity_id,
					batteryLevel: 100 // Assume 100% if not low
				});
			}
		}
	}
	// Sort by battery level ascending, then by name
	newBatteryDevices.sort((a, b) => a.batteryLevel - b.batteryLevel || a.deviceName.localeCompare(b.deviceName));
	state.batteryDevices = newBatteryDevices;
});


function handleMessage(message: HassMessage): void {
	switch (message.type) {
		case 'event':
			if (message.event?.event_type === 'state_changed') {
				const newEntity = message.event.data.new_state as HassEntity;
				state.entities.set(newEntity.entity_id, newEntity);
				// A more granular update could be beneficial here in the future
				state.entities = new Map(state.entities);
			} else if (message.event?.event_type === 'history_changed') {
				const entityId = Object.keys(message.event.data.states)[0];
				const newHistory = message.event.data.states[entityId];
				state.history.set(entityId, newHistory);
				state.history = new Map(state.history);
			} else if (
				message.id === state.fetchIds.weather &&
				message.event?.event_type === 'weather_update'
			) {
				// Assuming weather_update event structure matches WeatherData
				state.weatherData = message.event.data as WeatherData;
			}
			break;
		case 'result':
			if (!message.success) {
				console.error('Failed result:', message);
				return;
			}
			switch (message.id) {
				case state.fetchIds.states:
					const entities = message.result as HassEntity[];
					state.entities = new Map(entities.map((e) => [e.entity_id, e]));
					break;
				case state.fetchIds.devices:
					const devices = message.result as HassDevice[];
					state.devices = new Map(devices.map((d) => [d.id, d]));
					break;
				case state.fetchIds.areas:
					const areas = message.result as HassArea[];
					state.areas = new Map(areas.map((a) => [a.area_id, a]));
					break;
				case state.fetchIds.entityRegistry:
					const registryEntries = message.result as HassEntityRegistryEntry[];
					state.entityRegistry = new Map(
						registryEntries.map((entry) => [entry.entity_id, entry])
					);
					break;
			}
			break;
		default:
			// console.log('Unhandled message type:', message.type);
			break;
	}
}

function disconnect(): void {
	if (state.connection) {
		state.connection.disconnect();
	}
	resetConnection();
	state.connection = null;
	state.isConnected = false;
	state.isAuthenticated = false;
	state.weatherData = null; // Clear weather data on disconnect
	state.batteryDevices = []; // Clear battery devices on disconnect
}

async function initialize(): Promise<void> {
	if (state.isConnecting) return;

	if (state.isConnected) {
		disconnect();
	}

	state.isConnecting = true;
	state.error = null;

	try {
		const conn = await createConnection(handleMessage);
		state.connection = conn;
		state.isAuthenticated = true; // Assuming auth is handled by createConnection
		state.isConnected = true;
		state.isConnecting = false;

		// Subscribe to all state changes
		conn.subscribeEvents();

		// Fetch initial states, devices, and areas
		state.fetchIds.states = conn.fetchStates();
		state.fetchIds.devices = conn.fetchDevices();
		state.fetchIds.areas = conn.fetchAreas();
		state.fetchIds.entityRegistry = conn.fetchEntityRegistry();

		// Subscribe to weather data using app store settings
		if (app.state.weatherProvider === 'homeassistant') {
			if (app.state.weatherEntityId) {
				state.fetchIds.weather = conn.subscribeWeather(app.state.weatherEntityId);
			} else {
				console.warn('Home Assistant weather provider selected, but no weather entity ID configured.');
			}
		} else {
			console.log(`Weather provider ${app.state.weatherProvider} selected, skipping HA weather subscription.`);
		}


		// Load customizations
		const storedCustomizations = await getDecryptedItem(HA_CUSTOMIZATIONS_KEY);
		if (storedCustomizations) {
			try {
				const parsedCustomizations = JSON.parse(storedCustomizations);
				state.customizations = new Map(Object.entries(parsedCustomizations));
			} catch (e) {
				console.error('Failed to parse stored customizations:', e);
				state.customizations = new Map();
			}
		}

		console.log('HA store initialized, connection established.');
	} catch (err: any) {
		state.error = err.message || 'Failed to connect to Home Assistant';
		state.isConnecting = false;
		state.isConnected = false;
		console.error(state.error);
	}
}

function fetchHistory(entityId: string, startTime?: string, endTime?: string): void {
	if (!state.connection) return;
	state.history.set(entityId, []); // Clear previous history
	state.fetchIds.history = state.connection.subscribeHistory(entityId, startTime, endTime);
}

async function handleSaveCustomization(entityId: string, customization: DeviceCustomization): Promise<void> {
	state.customizations.set(entityId, customization);
	state.customizations = new Map(state.customizations); // Trigger reactivity
	await setEncryptedItem(HA_CUSTOMIZATIONS_KEY, JSON.stringify(Object.fromEntries(state.customizations)));
}

function setBrightness(entityId: string, brightness: number) {
	if (state.connection) {
		state.connection.setBrightness(entityId, brightness);
	}
}

function setTemperature(entityId: string, temperature: number) {
	if (state.connection) {
		state.connection.setTemperature(entityId, temperature);
	}
}

function triggerScene(entityId: string) {
    if (state.connection) {
        state.connection.callService('scene', 'turn_on', { entity_id: entityId });
    }
}

function triggerAutomation(entityId: string) {
    if (state.connection) {
        state.connection.callService('automation', 'trigger', { entity_id: entityId });
    }
}

function triggerScript(entityId: string) {
    if (state.connection) {
        state.connection.callService('script', 'turn_on', { entity_id: entityId });
    }
}

const allKnownDevices = $derived.by<Map<string, Device>>(() => {
	const deviceMap = new Map<string, Device>();
	for (const entity of state.entities.values()) {
		const customization = state.customizations.get(entity.entity_id) || {};
		const device = entityToDevice(entity, customization);
		if (device) {
			deviceMap.set(entity.entity_id, device);
		}
	}
	return deviceMap;
});

const allRoomsWithPhysicalDevices = $derived.by<RoomWithPhysicalDevices[]>(() => {
	const deviceIdToEntities = new Map<string, Device[]>();
	const entityIdToDeviceId = new Map<string, string>();
	for (const entry of state.entityRegistry.values()) {
		if (entry.device_id) {
			entityIdToDeviceId.set(entry.entity_id, entry.device_id);
		}
	}

	for (const [entityId, device] of allKnownDevices) {
		const deviceId = entityIdToDeviceId.get(entityId);
		if (deviceId) {
			if (!deviceIdToEntities.has(deviceId)) {
				deviceIdToEntities.set(deviceId, []);
			}
			deviceIdToEntities.get(deviceId)!.push(device);
		}
	}

	const roomsWithPhysicalDevicesMap = new Map<string, RoomWithPhysicalDevices>();
	for (const area of state.areas.values()) {
		roomsWithPhysicalDevicesMap.set(area.area_id, { id: area.area_id, name: area.name, devices: [] });
	}
	roomsWithPhysicalDevicesMap.set('no_area', { id: 'no_area', name: 'Без пространства', devices: [] });

	for (const haDevice of state.devices.values()) {
		const entitiesForDevice = deviceIdToEntities.get(haDevice.id) || [];
		if (entitiesForDevice.length > 0) {
			const physicalDevice: PhysicalDevice = {
				id: haDevice.id,
				name: haDevice.name,
				entities: entitiesForDevice.sort((a, b) => a.name.localeCompare(b.name))
			};
			const areaId = haDevice.area_id || 'no_area';
			const room = roomsWithPhysicalDevicesMap.get(areaId);
			room?.devices.push(physicalDevice);
		}
	}

	return Array.from(roomsWithPhysicalDevicesMap.values())
		.filter((room) => room.devices.length > 0)
		.sort((a, b) => a.name.localeCompare(b.name));
});

const allScenes = $derived(
	[...allKnownDevices.values()].filter((d) => d.haDomain === 'scene')
);
const allAutomations = $derived(
	[...allKnownDevices.values()].filter((d) => d.haDomain === 'automation')
);
const allScripts = $derived(
	[...allKnownDevices.values()].filter((d) => d.haDomain === 'script')
);

export const ha = {
	get state() {
		return state;
	},
	get allKnownDevices() {
		return allKnownDevices;
	},
	get allRoomsWithPhysicalDevices() {
		return allRoomsWithPhysicalDevices;
	},
	get allScenes() {
		return allScenes;
	},
	get allAutomations() {
		return allAutomations;
	},
	get allScripts() {
		return allScripts;
	},
	initialize,
	fetchHistory,
	disconnect,
	handleSaveCustomization,
	setBrightness,
	setTemperature,
	triggerScene,
	triggerAutomation,
	triggerScript
};
