<script lang="ts">
    import { t } from "svelte-i18n";
    import "iconify-icon";
    import type { HAEntity } from "$lib/types";
    import { type ThermostatController } from "./core/thermostat.svelte";
    import ThermostatControls from "./ThermostatControls.svelte";

    let { entity, controller } = $props<{
        entity: HAEntity;
        controller: ThermostatController;
    }>();

    // Visual Helpers
    let hvacAction = $derived(entity.attributes.hvac_action || "idle");
    let isOff = $derived(controller.hvacMode === "off");

    // Colors
    let activeColor = $derived.by(() => {
        if (hvacAction === "heating") return "var(--ts-accent-heating)";
        if (hvacAction === "cooling") return "var(--ts-accent-cooling)";
        return "var(--ts-text-primary)";
    });

    let iconColor = $derived(isOff ? "var(--ts-text-secondary)" : activeColor);
    let iconBg = $derived(
        isOff
            ? "rgba(0,0,0,0.05)"
            : `color-mix(in srgb, ${activeColor}, transparent 80%)`,
    );

    function inc() {
        if (isOff) return;
        controller.setTemperature(controller.targetTemp + controller.step);
    }
    function dec() {
        if (isOff) return;
        controller.setTemperature(controller.targetTemp - controller.step);
    }
</script>

<div class="mushroom-skin">
    <!-- Header: Icon + Info -->
    <div class="header">
        <div
            class="icon-circle"
            style:background={iconBg}
            style:color={iconColor}
        >
            <iconify-icon icon="mdi:thermostat" width="24"></iconify-icon>
        </div>
        <div class="info">
            <div class="title">{entity.attributes.friendly_name}</div>
            <div class="subtitle">
                {#if isOff}
                    {$t("common.off")}
                {:else}
                    <span style:color={activeColor} class="action-text"
                        >{hvacAction}</span
                    >
                    · {entity.attributes.current_temperature}°
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
            <span
                class="value"
                style:color={isOff
                    ? "var(--ts-text-muted)"
                    : "var(--ts-text-primary)"}
            >
                {controller.targetTemp.toFixed(1)}
            </span>
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

    <!-- Mode Controls (Compact) -->
    <div class="footer-controls">
        <ThermostatControls
            {controller}
            {entity}
            hvacMode={controller.hvacMode}
            currentPresetMode={controller.presetMode}
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
        background: var(--ts-bg-surface);
        border-radius: var(--ts-radius-outer, 12px);
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
        transition:
            background 0.3s,
            color 0.3s;
    }

    .info {
        display: flex;
        flex-direction: column;
        overflow: hidden;
    }

    .title {
        font-weight: 600;
        font-size: 1rem;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        color: var(--ts-text-primary);
    }

    .subtitle {
        font-size: 0.85rem;
        color: var(--ts-text-secondary);
        text-transform: capitalize;
    }

    .action-text {
        font-weight: 500;
    }

    .control-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        background: rgba(0, 0, 0, 0.03); /* Subtle track */
        border-radius: 12px;
        padding: 6px;
    }

    .step-btn {
        width: 40px;
        height: 40px;
        border-radius: 10px;
        border: none;
        background: var(--ts-bg-track); /* Use track color for buttons */
        color: var(--ts-text-primary);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05); /* Minimal shadow */
        font-size: 1.2rem;
        transition: all 0.2s;
    }

    .step-btn:hover:not(:disabled) {
        background: var(--ts-bg-surface);
        filter: brightness(0.95);
    }

    .step-btn:active:not(:disabled) {
        transform: scale(0.95);
    }

    .step-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    .target-display {
        font-size: 1.5rem;
        font-weight: 700;
        display: flex;
        align-items: flex-start;
        font-variant-numeric: tabular-nums;
    }
    .unit {
        font-size: 0.8rem;
        margin-top: 4px;
        opacity: 0.6;
        color: var(--ts-text-secondary);
    }

    .footer-controls {
        display: flex;
        justify-content: center;
        /* Ensure controls fit inside */
    }
</style>
