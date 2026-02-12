import { writable, get } from 'svelte/store';
import { browser } from '$app/environment';
import type { HAEntity } from '$lib/types';
import { haStore } from '../ha/store';
import { themeStore } from '../ui/theme/store';
import { backgroundStore } from '../ui/background/store';
import { dashboardStore } from './dashboardStore';

const DEMO_MODE_KEY = 'evolusion_demo_mode';

interface DemoState {
    isActive: boolean;
}

// Mock entities for demo mode
export const DEMO_ENTITIES: HAEntity[] = [
    {
        entity_id: 'light.living_room',
        state: 'on',
        attributes: {
            friendly_name: 'Living Room Light',
            brightness: 255,
            supported_features: 1
        },
        last_changed: new Date().toISOString(),
        last_updated: new Date().toISOString(),
        context: { id: 'demo1', parent_id: null, user_id: null }
    },
    {
        entity_id: 'light.bedroom',
        state: 'off',
        attributes: {
            friendly_name: 'Bedroom Light',
            brightness: 0,
            supported_features: 1
        },
        last_changed: new Date().toISOString(),
        last_updated: new Date().toISOString(),
        context: { id: 'demo2', parent_id: null, user_id: null }
    },
    {
        entity_id: 'light.kitchen',
        state: 'on',
        attributes: {
            friendly_name: 'Kitchen Light',
            brightness: 180,
            supported_features: 1
        },
        last_changed: new Date().toISOString(),
        last_updated: new Date().toISOString(),
        context: { id: 'demo3', parent_id: null, user_id: null }
    },
    {
        entity_id: 'switch.tv',
        state: 'off',
        attributes: {
            friendly_name: 'TV Power'
        },
        last_changed: new Date().toISOString(),
        last_updated: new Date().toISOString(),
        context: { id: 'demo4', parent_id: null, user_id: null }
    },
    {
        entity_id: 'switch.fan',
        state: 'on',
        attributes: {
            friendly_name: 'Ceiling Fan'
        },
        last_changed: new Date().toISOString(),
        last_updated: new Date().toISOString(),
        context: { id: 'demo5', parent_id: null, user_id: null }
    },
    {
        entity_id: 'sensor.temperature',
        state: '22.5',
        attributes: {
            friendly_name: 'Temperature',
            unit_of_measurement: '°C',
            device_class: 'temperature'
        },
        last_changed: new Date().toISOString(),
        last_updated: new Date().toISOString(),
        context: { id: 'demo6', parent_id: null, user_id: null }
    },
    {
        entity_id: 'sensor.humidity',
        state: '45',
        attributes: {
            friendly_name: 'Humidity',
            unit_of_measurement: '%',
            device_class: 'humidity'
        },
        last_changed: new Date().toISOString(),
        last_updated: new Date().toISOString(),
        context: { id: 'demo7', parent_id: null, user_id: null }
    },
    {
        entity_id: 'sensor.power',
        state: '1250',
        attributes: {
            friendly_name: 'Power Usage',
            unit_of_measurement: 'W',
            device_class: 'power'
        },
        last_changed: new Date().toISOString(),
        last_updated: new Date().toISOString(),
        context: { id: 'demo8', parent_id: null, user_id: null }
    },
    {
        entity_id: 'binary_sensor.motion',
        state: 'off',
        attributes: {
            friendly_name: 'Motion Sensor',
            device_class: 'motion'
        },
        last_changed: new Date().toISOString(),
        last_updated: new Date().toISOString(),
        context: { id: 'demo9', parent_id: null, user_id: null }
    },
    {
        entity_id: 'binary_sensor.door',
        state: 'off',
        attributes: {
            friendly_name: 'Front Door',
            device_class: 'door'
        },
        last_changed: new Date().toISOString(),
        last_updated: new Date().toISOString(),
        context: { id: 'demo10', parent_id: null, user_id: null }
    },
    {
        entity_id: 'lock.front_door',
        state: 'locked',
        attributes: {
            friendly_name: 'Front Door Lock'
        },
        last_changed: new Date().toISOString(),
        last_updated: new Date().toISOString(),
        context: { id: 'demo11', parent_id: null, user_id: null }
    },
    {
        entity_id: 'climate.thermostat',
        state: 'heat',
        attributes: {
            friendly_name: 'Thermostat',
            current_temperature: 21.5,
            temperature: 23,
            min_temp: 15,
            max_temp: 30,
            target_temp_step: 0.1,
            hvac_modes: ['off', 'heat', 'cool', 'auto'],
            hvac_action: 'heating',
            preset_modes: ['none', 'eco', 'comfort', 'away'],
            preset_mode: 'none',
            supported_features: 17
        },
        last_changed: new Date().toISOString(),
        last_updated: new Date().toISOString(),
        context: { id: 'demo12', parent_id: null, user_id: null }
    }
];

/** Capital city coords by locale prefix for demo weather */
const CAPITAL_COORDS: Record<string, { lat: number; lon: number; name: string }> = {
    en: { lat: 51.5074, lon: -0.1278, name: 'London' },
    ru: { lat: 55.7558, lon: 37.6173, name: 'Moscow' },
    ar: { lat: 24.7136, lon: 46.6753, name: 'Riyadh' },
    zh: { lat: 39.9042, lon: 116.4074, name: 'Beijing' },
    es: { lat: 40.4168, lon: -3.7038, name: 'Madrid' },
    fr: { lat: 48.8566, lon: 2.3522, name: 'Paris' },
    pt: { lat: -15.7975, lon: -47.8919, name: 'Brasília' },
    de: { lat: 52.5200, lon: 13.4050, name: 'Berlin' },
    ja: { lat: 35.6762, lon: 139.6503, name: 'Tokyo' },
    hi: { lat: 28.6139, lon: 77.2090, name: 'New Delhi' },
};

function getDemoCapital(): { lat: number; lon: number; name: string } {
    if (!browser) return CAPITAL_COORDS.en;
    try {
        // Try to get locale from svelte-i18n localStorage or navigator
        const storedLocale = localStorage.getItem('locale') || navigator.language || 'en';
        const prefix = storedLocale.split('-')[0].toLowerCase();
        return CAPITAL_COORDS[prefix] || CAPITAL_COORDS.en;
    } catch {
        return CAPITAL_COORDS.en;
    }
}

/** Inject demo entities into the global haStore so the dashboard renders them */
function seedHaStore() {
    const entities = new Map<string, HAEntity>();
    DEMO_ENTITIES.forEach(e => entities.set(e.entity_id, { ...e }));

    // Add zone.home with capital city so weather shows demo location
    const capital = getDemoCapital();
    entities.set('zone.home', {
        entity_id: 'zone.home',
        state: 'zoning',
        attributes: {
            friendly_name: capital.name,
            latitude: capital.lat,
            longitude: capital.lon,
            radius: 100,
            icon: 'mdi:home'
        },
        last_changed: new Date().toISOString(),
        last_updated: new Date().toISOString(),
        context: { id: 'demo_zone', parent_id: null, user_id: null }
    });

    haStore.update(s => ({
        ...s,
        isConnected: true,
        isLoading: false,
        error: null,
        entities,
        problemEntities: new Set()
    }));
}

/** Reset haStore to disconnected state */
function clearHaStore() {
    haStore.update(s => ({
        ...s,
        isConnected: false,
        entities: new Map(),
        problemEntities: new Set(),
        error: null,
        latency: undefined
    }));
}
/** Apply Fusion dark theme + Aurora background + populate dashboard grid for demo */
function applyDemoDefaults() {
    // Theme: Fusion dark
    themeStore.setActiveTheme('fusion');
    themeStore.setMode('dark');

    // Background: Aurora
    backgroundStore.setUserSelectedEffect('aurora');

    // Populate dashboard grid with demo cards
    seedDashboardCards();
}

/** Create demo card layout in the dashboard */
function seedDashboardCards() {
    // Build card configs positioned in the default 8-column grid
    const cols = 8;
    const cards = DEMO_ENTITIES.map((entity, i) => ({
        id: `demo_${entity.entity_id}`,
        entityId: entity.entity_id,
        position: {
            x: i % cols,
            y: Math.floor(i / cols),
            w: 1,
            h: 1
        }
    }));

    dashboardStore.replaceTabCards('welcome', cards);
}

function createDemoStore() {
    const { subscribe, set, update } = writable<DemoState>({ isActive: false });

    return {
        subscribe,

        init: () => {
            if (!browser) return;
            const stored = localStorage.getItem(DEMO_MODE_KEY);
            if (stored === 'true') {
                set({ isActive: true });
                seedHaStore();
                applyDemoDefaults();
            }
        },

        enable: () => {
            if (browser) {
                localStorage.setItem(DEMO_MODE_KEY, 'true');
            }
            seedHaStore();
            applyDemoDefaults();
            set({ isActive: true });
        },

        disable: () => {
            if (browser) {
                localStorage.removeItem(DEMO_MODE_KEY);
            }
            clearHaStore();
            set({ isActive: false });
        },

        getEntities: (): Map<string, HAEntity> => {
            const state = get(haStore);
            return new Map(state.entities);
        },

        toggleEntity: (entityId: string): boolean => {
            const state = get(haStore);
            const entity = state.entities.get(entityId);
            if (!entity) return false;

            const newState = entity.state === 'on' ? 'off' :
                entity.state === 'off' ? 'on' :
                    entity.state === 'locked' ? 'unlocked' :
                        entity.state === 'unlocked' ? 'locked' : entity.state;

            const updatedEntity = {
                ...entity,
                state: newState,
                last_changed: new Date().toISOString(),
                last_updated: new Date().toISOString()
            };

            // Update directly in haStore so UI reacts
            haStore.update(s => {
                const newEntities = new Map(s.entities);
                newEntities.set(entityId, updatedEntity);
                return { ...s, entities: newEntities };
            });

            return true;
        }
    };
}

export const demoStore = createDemoStore();

