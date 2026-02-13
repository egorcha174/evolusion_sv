import { writable, type Writable } from "svelte/store";
import { haStore } from "../../ha/store";
import { callService } from "../../ha/store";
import type { HAEntity } from "$lib/types";

// Types for our local thermostat state
export interface ThermostatState {
    targetTemp: number;
    hvacMode: string;
    presetMode: string;
    isDragging: boolean;
}

// Map stores by entity_id to avoid recreation
const controllers = new Map<string, ThermostatController>();

export interface ThermostatController {
    state: Writable<ThermostatState>;
    setTemperature: (temp: number) => void;
    setHvacMode: (mode: string) => void;
    setPresetMode: (mode: string) => void;
    setDragging: (dragging: boolean) => void;
    destroy: () => void;
}

export function createThermostatController(entityId: string, initialEntity?: HAEntity): ThermostatController {
    if (controllers.has(entityId)) {
        return controllers.get(entityId)!;
    }

    // Initial state from HA store if available, otherwise defaults
    let initialTemp = initialEntity?.attributes?.temperature || 20;
    let initialHvac = initialEntity?.state || "off";
    let initialPreset = initialEntity?.attributes?.preset_mode || "none";

    const textState = {
        targetTemp: initialTemp,
        hvacMode: initialHvac,
        presetMode: initialPreset,
        isDragging: false,
    };

    const store = writable<ThermostatState>(textState);

    // Subscribe to HA store updates to sync state when NOT dragging
    const unsubscribeHA = haStore.subscribe((state) => {
        const entity = state.entities.get(entityId);
        if (entity) {
            store.update((s) => {
                // If dragging, only update non-temperature attributes or if temp changed externally significantly
                // But generally we ignore temp updates while dragging to prevent jumping
                if (s.isDragging) return s;

                return {
                    ...s,
                    targetTemp: entity.attributes.temperature || s.targetTemp,
                    hvacMode: entity.state || "off",
                    presetMode: entity.attributes.preset_mode || "none",
                };
            });
        }
    });

    // Debounce timer for API calls
    let debounceTimer: ReturnType<typeof setTimeout> | null = null;

    const controller: ThermostatController = {
        state: store,

        setTemperature: (temp: number) => {
            // Optimistic update
            store.update((s) => ({ ...s, targetTemp: temp }));

            // Debounce API call
            if (debounceTimer) clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                callService("climate", "set_temperature", {
                    entity_id: entityId,
                    temperature: temp,
                });
            }, 500);
        },

        setHvacMode: (mode: string) => {
            store.update((s) => ({ ...s, hvacMode: mode }));
            callService("climate", "set_hvac_mode", {
                entity_id: entityId,
                hvac_mode: mode,
            });
        },

        setPresetMode: (mode: string) => {
            store.update((s) => ({ ...s, presetMode: mode }));
            callService("climate", "set_preset_mode", {
                entity_id: entityId,
                preset_mode: mode,
            });
        },

        setDragging: (dragging: boolean) => {
            store.update((s) => ({ ...s, isDragging: dragging }));
        },

        destroy: () => {
            unsubscribeHA();
            controllers.delete(entityId);
        },
    };

    controllers.set(entityId, controller);
    return controller;
}
