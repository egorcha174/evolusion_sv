<script lang="ts">
    import { t } from "svelte-i18n";
    import "iconify-icon";
    import type { HAEntity } from "$lib/types";
    import { type ThermostatController } from "../thermostatStore";
    import ThermostatControls from "./ThermostatControls.svelte";

    let { entity, controller, state } = $props<{
        entity: HAEntity;
        controller: ThermostatController;
        state: any;
    }>();

    // Derived state
    let targetTemp = $derived(state.targetTemp);
    let hvacMode = $derived(state.hvacMode);
    let currentPresetMode = $derived(state.presetMode);

    // Entity Attributes
    let step = $derived(entity.attributes.target_temp_step || 0.5);
    let currentTemp = $derived(entity.attributes.current_temperature);
    let hvacAction = $derived(entity.attributes.hvac_action || "idle");

    // Colors
    let activeColor = $derived.by(() => {
        if (hvacAction === "heating")
            return "var(--thermostat-heating-color, #ff9500)";
        if (hvacAction === "cooling")
            return "var(--thermostat-cooling-color, #007aff)";
        return "var(--accent-primary, #007aff)";
    });

    let isOff = $derived(hvacMode === "off");

    function inc() {
        controller.setTemperature(targetTemp + step);
    }
    function dec() {
        controller.setTemperature(targetTemp - step);
    }
</script>

<div class="mushroom-skin">
    <!-- Header: Icon + Info -->
    <div class="header">
        <div
            class="icon-circle"
            style:background={isOff
                ? "var(--bg-surface-mixed)"
                : `rgba(var(--accent-rgb), 0.2)`}
            style:color={isOff ? "var(--text-muted)" : activeColor}
        >
            <iconify-icon icon="mdi:thermostat" width="24"></iconify-icon>
        </div>
        <div class="info">
            <div class="title">{entity.attributes.friendly_name}</div>
            <div class="subtitle">
                {#if isOff}
                    {$t("common.off")}
                {:else}
                    {hvacAction} · {currentTemp}°
                {/if}
            </div>
        </div>
    </div>

    <!-- Main Control: Temp Stepper -->
    <div class="control-row">
        <button
            class="step-btn"
            onclick={dec}
            disabled={isOff}
            aria-label="Decrease Temperature"
        >
            <iconify-icon icon="mdi:minus"></iconify-icon>
        </button>

        <div class="target-display">
            <span class="value">{targetTemp}</span>
            <span class="unit">°</span>
        </div>

        <button
            class="step-btn"
            onclick={inc}
            disabled={isOff}
            aria-label="Increase Temperature"
        >
            <iconify-icon icon="mdi:plus"></iconify-icon>
        </button>
    </div>

    <!-- Mode Controls -->
    <div class="footer-controls">
        <ThermostatControls
            {controller}
            {entity}
            {hvacMode}
            {currentPresetMode}
        />
    </div>
</div>

<style>
    .mushroom-skin {
        display: flex;
        flex-direction: column;
        width: 100%;
        height: 100%;
        padding: 12px;
        gap: 12px;
        justify-content: space-between;
    }

    .header {
        display: flex;
        align-items: center;
        gap: 12px;
    }

    .icon-circle {
        width: 42px;
        height: 42px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
    }

    .info {
        display: flex;
        flex-direction: column;
        overflow: hidden;
    }

    .title {
        font-weight: 600;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .subtitle {
        font-size: 0.85rem;
        color: var(--text-secondary);
        text-transform: capitalize;
    }

    .control-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        background: rgba(0, 0, 0, 0.03);
        border-radius: 12px;
        padding: 6px;
    }

    .step-btn {
        width: 40px;
        height: 40px;
        border-radius: 10px;
        border: none;
        background: var(--bg-card);
        color: var(--text-primary);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        font-size: 1.2rem;
    }
    .step-btn:active {
        background: var(--bg-card-hover);
        transform: scale(0.95);
    }
    .step-btn:disabled {
        opacity: 0.5;
        pointer-events: none;
    }

    .target-display {
        font-size: 1.5rem;
        font-weight: 700;
        display: flex;
        align-items: flex-start;
    }
    .unit {
        font-size: 0.8rem;
        margin-top: 4px;
        opacity: 0.6;
    }

    .footer-controls {
        display: flex;
        justify-content: center;
    }
</style>
