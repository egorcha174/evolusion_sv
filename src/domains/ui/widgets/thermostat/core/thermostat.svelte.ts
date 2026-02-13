import { get } from "svelte/store";
import { haStore, callService } from "../../../../ha/store";
import type { HAEntity } from "$lib/types";

export interface ThermostatConfig {
    minTemp: number;
    maxTemp: number;
    step: number;
}

export class ThermostatController {
    // State
    targetTemp = $state(20);
    hvacMode = $state("off");
    presetMode = $state("none");
    isDragging = $state(false);

    // Entity Reference (kept up to date)
    entityId: string;
    private _entity: HAEntity | undefined;

    // Derived values helper
    minTemp = $state(7);
    maxTemp = $state(35);
    step = $state(0.5);


    private _unsub: (() => void) | undefined;

    constructor(entityId: string, initialEntity?: HAEntity) {
        this.entityId = entityId;
        this._entity = initialEntity;

        if (initialEntity) {
            this.syncFromEntity(initialEntity);
        }

        // Subscribe to HA store
        this._unsub = haStore.subscribe((state) => {
            const entity = state.entities.get(this.entityId);
            if (entity) {
                this._entity = entity;
                if (!this.isDragging) {
                    this.syncFromEntity(entity);
                }
            }
        });
    }

    private syncFromEntity(entity: HAEntity) {
        this.targetTemp = entity.attributes.temperature || this.targetTemp;
        this.hvacMode = entity.state || "off";
        this.presetMode = entity.attributes.preset_mode || "none";

        // Update limits if provided by entity
        if (entity.attributes.min_temp !== undefined) this.minTemp = entity.attributes.min_temp;
        if (entity.attributes.max_temp !== undefined) this.maxTemp = entity.attributes.max_temp;
        if (entity.attributes.target_temp_step !== undefined) this.step = entity.attributes.target_temp_step;
    }

    // --- Actions ---

    setTemperature(temp: number) {
        // Optimistic update
        this.targetTemp = temp;
        this.debouncedCallService("set_temperature", { temperature: temp });
    }

    setHvacMode(mode: string) {
        this.hvacMode = mode;
        callService("climate", "set_hvac_mode", {
            entity_id: this.entityId,
            hvac_mode: mode,
        });
    }

    setPresetMode(mode: string) {
        this.presetMode = mode;
        callService("climate", "set_preset_mode", {
            entity_id: this.entityId,
            preset_mode: mode,
        });
    }

    // Interaction Helpers
    setDragging(dragging: boolean) {
        this.isDragging = dragging;
        // On release, ensure we sync strictly? Or just let the next update handle it.
    }

    // Debounce Logic
    private debounceTimer: ReturnType<typeof setTimeout> | null = null;
    private debouncedCallService(service: string, data: any) {
        if (this.debounceTimer) clearTimeout(this.debounceTimer);
        this.debounceTimer = setTimeout(() => {
            callService("climate", service, {
                entity_id: this.entityId,
                ...data,
            });
        }, 500); // 500ms debounce
    }

    // --- Getters for UI ---
    get currentProps() {
        return {
            targetTemp: this.targetTemp,
            hvacMode: this.hvacMode,
            presetMode: this.presetMode,
            min: this.minTemp,
            max: this.maxTemp,
            step: this.step,
        };
    }

    destroy() {
        if (this._unsub) {
            this._unsub();
        }
    }
}
