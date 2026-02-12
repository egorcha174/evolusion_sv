/**
 * Thermostat Controller Store
 * 
 * Provides per-entity reactive state management for thermostat (climate) widgets.
 * Handles debounced temperature changes, optimistic updates, and error rollback.
 * 
 * Source of truth: climate entity from HA store.
 */

import { get } from 'svelte/store';
import { haStore, callService } from '../../ha/store';

// ---------- Types ----------

export interface ThermostatState {
    entityId: string;
    currentTemp: number | null;
    targetTemp: number;
    hvacMode: string;
    hvacAction: string;
    presetMode: string | null;
    presetModes: string[];
    hvacModes: string[];
    fanMode: string | null;
    fanModes: string[];
    minTemp: number;
    maxTemp: number;
    targetTempStep: number;
    supportedFeatures: number;
    loading: boolean;
    error: string | null;
}

// HA climate supported features bitmask
export const CLIMATE_FEATURES = {
    TARGET_TEMPERATURE: 1,
    TARGET_TEMPERATURE_RANGE: 2,
    TARGET_HUMIDITY: 4,
    FAN_MODE: 8,
    PRESET_MODE: 16,
    SWING_MODE: 32,
    AUX_HEAT: 64,
} as const;

// ---------- Debounce Timer Map ----------

const debounceTimers = new Map<string, ReturnType<typeof setTimeout>>();

function clearDebounce(entityId: string) {
    const timer = debounceTimers.get(entityId);
    if (timer) {
        clearTimeout(timer);
        debounceTimers.delete(entityId);
    }
}

// ---------- State Reader ----------

export function readThermostatState(entityId: string): ThermostatState {
    const store = get(haStore);
    const entity = store.entities.get(entityId);

    if (!entity) {
        return {
            entityId,
            currentTemp: null,
            targetTemp: 20,
            hvacMode: 'off',
            hvacAction: 'idle',
            presetMode: null,
            presetModes: [],
            hvacModes: ['off'],
            fanMode: null,
            fanModes: [],
            minTemp: 15,
            maxTemp: 30,
            targetTempStep: 0.5,
            supportedFeatures: 0,
            loading: false,
            error: 'Entity not found',
        };
    }

    const attrs = entity.attributes;
    return {
        entityId,
        currentTemp: attrs.current_temperature ?? null,
        targetTemp: attrs.temperature ?? 20,
        hvacMode: entity.state || 'off',
        hvacAction: attrs.hvac_action || 'idle',
        presetMode: attrs.preset_mode || null,
        presetModes: attrs.preset_modes || [],
        hvacModes: attrs.hvac_modes || ['off'],
        fanMode: attrs.fan_mode || null,
        fanModes: attrs.fan_modes || [],
        minTemp: attrs.min_temp ?? 15,
        maxTemp: attrs.max_temp ?? 30,
        targetTempStep: attrs.target_temp_step ?? 0.5,
        supportedFeatures: attrs.supported_features ?? 0,
        loading: false,
        error: null,
    };
}

// ---------- Actions ----------

/**
 * Set target temperature with debounce (500ms).
 * Provides optimistic update via haStore, rolls back on error.
 */
export async function setTemperature(
    entityId: string,
    temperature: number,
    onError?: (error: Error) => void
): Promise<void> {
    const store = get(haStore);
    const entity = store.entities.get(entityId);
    if (!entity) return;

    // Clamp to valid range
    const attrs = entity.attributes;
    const min = attrs.min_temp ?? 15;
    const max = attrs.max_temp ?? 30;
    const clamped = Math.round(Math.min(max, Math.max(min, temperature)) * 10) / 10;

    // Optimistic update
    const previousTemp = attrs.temperature;
    haStore.update(s => {
        const newEntities = new Map(s.entities);
        const existing = newEntities.get(entityId);
        if (existing) {
            newEntities.set(entityId, {
                ...existing,
                attributes: { ...existing.attributes, temperature: clamped },
                last_updated: new Date().toISOString(),
            });
        }
        return { ...s, entities: newEntities };
    });

    // Debounced API call
    clearDebounce(entityId);

    return new Promise<void>((resolve) => {
        const timer = setTimeout(async () => {
            debounceTimers.delete(entityId);
            try {
                await callService('climate', 'set_temperature', {
                    entity_id: entityId,
                    temperature: clamped,
                });
                resolve();
            } catch (err: any) {
                console.error('[Thermostat] set_temperature failed:', err);
                // Rollback
                haStore.update(s => {
                    const newEntities = new Map(s.entities);
                    const existing = newEntities.get(entityId);
                    if (existing) {
                        newEntities.set(entityId, {
                            ...existing,
                            attributes: { ...existing.attributes, temperature: previousTemp },
                        });
                    }
                    return { ...s, entities: newEntities };
                });
                if (onError) onError(err);
                resolve();
            }
        }, 500);

        debounceTimers.set(entityId, timer);
    });
}

/**
 * Set HVAC mode (off, heat, cool, auto, etc.)
 */
export async function setHvacMode(
    entityId: string,
    mode: string,
    onError?: (error: Error) => void
): Promise<void> {
    // Optimistic update
    const store = get(haStore);
    const entity = store.entities.get(entityId);
    const previousState = entity?.state;

    haStore.update(s => {
        const newEntities = new Map(s.entities);
        const existing = newEntities.get(entityId);
        if (existing) {
            newEntities.set(entityId, {
                ...existing,
                state: mode,
                last_updated: new Date().toISOString(),
            });
        }
        return { ...s, entities: newEntities };
    });

    try {
        await callService('climate', 'set_hvac_mode', {
            entity_id: entityId,
            hvac_mode: mode,
        });
    } catch (err: any) {
        console.error('[Thermostat] set_hvac_mode failed:', err);
        // Rollback
        haStore.update(s => {
            const newEntities = new Map(s.entities);
            const existing = newEntities.get(entityId);
            if (existing && previousState !== undefined) {
                newEntities.set(entityId, { ...existing, state: previousState });
            }
            return { ...s, entities: newEntities };
        });
        if (onError) onError(err);
    }
}

/**
 * Set preset mode (eco, comfort, away, none, etc.)
 */
export async function setPresetMode(
    entityId: string,
    preset: string,
    onError?: (error: Error) => void
): Promise<void> {
    const store = get(haStore);
    const entity = store.entities.get(entityId);
    const previousPreset = entity?.attributes.preset_mode;

    // Optimistic update
    haStore.update(s => {
        const newEntities = new Map(s.entities);
        const existing = newEntities.get(entityId);
        if (existing) {
            newEntities.set(entityId, {
                ...existing,
                attributes: { ...existing.attributes, preset_mode: preset },
                last_updated: new Date().toISOString(),
            });
        }
        return { ...s, entities: newEntities };
    });

    try {
        await callService('climate', 'set_preset_mode', {
            entity_id: entityId,
            preset_mode: preset,
        });
    } catch (err: any) {
        console.error('[Thermostat] set_preset_mode failed:', err);
        // Rollback
        haStore.update(s => {
            const newEntities = new Map(s.entities);
            const existing = newEntities.get(entityId);
            if (existing) {
                newEntities.set(entityId, {
                    ...existing,
                    attributes: { ...existing.attributes, preset_mode: previousPreset },
                });
            }
            return { ...s, entities: newEntities };
        });
        if (onError) onError(err);
    }
}

/**
 * Set fan mode
 */
export async function setFanMode(
    entityId: string,
    fanMode: string,
    onError?: (error: Error) => void
): Promise<void> {
    const store = get(haStore);
    const entity = store.entities.get(entityId);
    const previousFanMode = entity?.attributes.fan_mode;

    // Optimistic update
    haStore.update(s => {
        const newEntities = new Map(s.entities);
        const existing = newEntities.get(entityId);
        if (existing) {
            newEntities.set(entityId, {
                ...existing,
                attributes: { ...existing.attributes, fan_mode: fanMode },
                last_updated: new Date().toISOString(),
            });
        }
        return { ...s, entities: newEntities };
    });

    try {
        await callService('climate', 'set_fan_mode', {
            entity_id: entityId,
            fan_mode: fanMode,
        });
    } catch (err: any) {
        console.error('[Thermostat] set_fan_mode failed:', err);
        // Rollback
        haStore.update(s => {
            const newEntities = new Map(s.entities);
            const existing = newEntities.get(entityId);
            if (existing) {
                newEntities.set(entityId, {
                    ...existing,
                    attributes: { ...existing.attributes, fan_mode: previousFanMode },
                });
            }
            return { ...s, entities: newEntities };
        });
        if (onError) onError(err);
    }
}

/**
 * Turn off the thermostat
 */
export async function turnOff(
    entityId: string,
    onError?: (error: Error) => void
): Promise<void> {
    await setHvacMode(entityId, 'off', onError);
}

/**
 * Turn on the thermostat (switch to first non-off mode)
 */
export async function turnOn(
    entityId: string,
    onError?: (error: Error) => void
): Promise<void> {
    const store = get(haStore);
    const entity = store.entities.get(entityId);
    if (!entity) return;

    const modes: string[] = entity.attributes.hvac_modes || [];
    const firstActive = modes.find(m => m !== 'off') || 'heat';
    await setHvacMode(entityId, firstActive, onError);
}

/**
 * Cleanup debounce timers (call on component destroy)
 */
export function destroyThermostatController(entityId: string): void {
    clearDebounce(entityId);
}
