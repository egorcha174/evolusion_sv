<script lang="ts">
    import { t } from "svelte-i18n";
    import { onDestroy, onMount } from "svelte";
    import { scale, fade } from "svelte/transition";
    import type { HAEntity } from "$lib/types";
    import "iconify-icon";
    import {
        readThermostatState,
        setTemperature,
        setHvacMode,
        setFanMode,
        setPresetMode,
        destroyThermostatController,
        CLIMATE_FEATURES,
    } from "./thermostatStore";

    // Skins
    import ThermostatVertical from "./thermostat/ThermostatVertical.svelte";
    import ThermostatCircular from "./thermostat/ThermostatCircular.svelte";

    interface Props {
        entity: HAEntity;
        compactMode?: boolean;
        onError?: (error: Error) => void;
    }

    let { entity, compactMode = false, onError }: Props = $props();

    // --- Derived state from entity ---
    let thermostatState = $derived(readThermostatState(entity.entity_id));

    let isOff = $derived(thermostatState.hvacMode === "off");
    let hasPresets = $derived(
        thermostatState.presetModes.length > 0 &&
            (thermostatState.supportedFeatures &
                CLIMATE_FEATURES.PRESET_MODE) !==
                0,
    );
    let hasFan = $derived(
        (thermostatState.supportedFeatures & CLIMATE_FEATURES.FAN_MODE) !== 0 &&
            thermostatState.fanModes.length > 0,
    );

    let actionError = $state<string | null>(null);

    // Overlay states
    let showPresets = $state(false);
    let showAdvanced = $state(false);

    // Skin state
    let skin = $state<"vertical" | "circular">("vertical");

    onMount(() => {
        const stored = localStorage.getItem(
            `thermostat_skin_${entity.entity_id}`,
        );
        if (stored === "vertical" || stored === "circular") {
            skin = stored;
        }
    });

    function setSkin(newSkin: "vertical" | "circular") {
        skin = newSkin;
        localStorage.setItem(`thermostat_skin_${entity.entity_id}`, newSkin);
    }

    // Cleanup on destroy
    onDestroy(() => {
        destroyThermostatController(entity.entity_id);
    });

    function handleError(err: Error) {
        actionError = err.message;
        setTimeout(() => (actionError = null), 3000);
        if (onError) onError(err);
    }

    function handlePresetSelect(preset: string) {
        setPresetMode(entity.entity_id, preset, handleError);
        showPresets = false;
    }

    function togglePresets() {
        if (hasPresets) {
            showPresets = !showPresets;
            if (showPresets) showAdvanced = false;
        } else {
            handleError(
                new Error(
                    $t("widgets.thermostat.noPresets", {
                        default: "No presets available",
                    }),
                ),
            );
        }
    }

    function toggleAdvanced() {
        showAdvanced = !showAdvanced;
        if (showAdvanced) showPresets = false;
    }
</script>

<div class="thermostat-card" class:is-off={isOff}>
    <!-- Render Skin Component -->
    {#if skin === "circular"}
        <ThermostatCircular
            {entity}
            {thermostatState}
            {isOff}
            {hasFan}
            {hasPresets}
            onToggleAdvanced={toggleAdvanced}
            onTogglePresets={togglePresets}
            onError={handleError}
        />
    {:else}
        <ThermostatVertical
            {entity}
            {thermostatState}
            {isOff}
            {hasFan}
            {hasPresets}
            onToggleAdvanced={toggleAdvanced}
            onTogglePresets={togglePresets}
            onError={handleError}
        />
    {/if}

    <!-- Overlays (Common) -->
    {#if showPresets}
        <div
            class="overlay-panel"
            transition:scale={{ duration: 200, start: 0.95 }}
        >
            <div class="overlay-header">
                <span
                    >{$t("widgets.thermostat.preset", {
                        default: "Presets",
                    })}</span
                >
                <button
                    class="close-btn"
                    onclick={() => (showPresets = false)}
                    aria-label="Close Presets"
                >
                    <iconify-icon icon="mdi:close" width="16"></iconify-icon>
                </button>
            </div>
            <div class="overlay-content presets-grid">
                {#each thermostatState.presetModes as preset}
                    <button
                        class="preset-btn"
                        class:active={thermostatState.presetMode === preset}
                        onclick={() => handlePresetSelect(preset)}
                    >
                        {preset}
                    </button>
                {/each}
            </div>
        </div>
    {/if}

    {#if showAdvanced}
        <div
            class="overlay-panel"
            transition:scale={{ duration: 200, start: 0.95 }}
        >
            <div class="overlay-header">
                <span
                    >{$t("widgets.thermostat.advanced", {
                        default: "Advanced",
                    })}</span
                >
                <button
                    class="close-btn"
                    onclick={() => (showAdvanced = false)}
                    aria-label="Close Advanced Settings"
                >
                    <iconify-icon icon="mdi:close" width="16"></iconify-icon>
                </button>
            </div>
            <div class="overlay-content advanced-list">
                <!-- Skin Selector -->
                <div class="skin-selector">
                    <span class="label">Style</span>
                    <div class="skin-opts">
                        <button
                            class="skin-btn"
                            class:active={skin === "vertical"}
                            onclick={() => setSkin("vertical")}
                            aria-label="Vertical Skin"
                        >
                            <iconify-icon icon="mdi:view-agenda-outline"
                            ></iconify-icon>
                        </button>
                        <button
                            class="skin-btn"
                            class:active={skin === "circular"}
                            onclick={() => setSkin("circular")}
                            aria-label="Circular Skin"
                        >
                            <iconify-icon icon="mdi:circle-slice-8"
                            ></iconify-icon>
                        </button>
                    </div>
                </div>

                <div class="divider"></div>

                <div class="adv-row">
                    <span>Min Temp</span>
                    <span>{thermostatState.minTemp}°</span>
                </div>
                <div class="adv-row">
                    <span>Max Temp</span>
                    <span>{thermostatState.maxTemp}°</span>
                </div>
                <div class="adv-row">
                    <span>Current</span>
                    <span>{thermostatState.currentTemp}°</span>
                </div>
                <div class="adv-row">
                    <span>Action</span>
                    <span class="capitalize">{thermostatState.hvacAction}</span>
                </div>
            </div>
        </div>
    {/if}

    <!-- Error Toast -->
    {#if actionError}
        <div class="error-toast" transition:fade>{actionError}</div>
    {/if}
</div>

<style>
    .thermostat-card {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        background: var(--card-background);
        box-sizing: border-box;
        overflow: hidden;
        position: relative;
        color: var(--text-primary);
        transition: background-color 0.3s ease;
    }

    /* Reused Overlay Styles */
    .overlay-panel {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        background: var(--card-background);
        backdrop-filter: blur(10px);
        background: color-mix(in srgb, var(--card-background) 95%, black 5%);
        border-top: 1px solid var(--border-primary);
        border-radius: 24px 24px 0 0;
        padding: 1rem;
        z-index: 20;
        box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.2);
        display: flex;
        flex-direction: column;
        gap: 0.8rem;
    }

    .overlay-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-weight: 600;
        font-size: 0.9rem;
        padding-bottom: 0.5rem;
        border-bottom: 1px solid var(--border-divider, rgba(255, 255, 255, 0.1));
    }

    .close-btn {
        background: none;
        border: none;
        color: var(--text-muted);
        cursor: pointer;
        padding: 4px;
        display: flex;
    }

    .presets-grid {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
    }

    .preset-btn {
        background: var(--bg-card-hover, rgba(255, 255, 255, 0.05));
        border: 1px solid var(--border-primary);
        color: var(--text-secondary);
        padding: 0.5rem 1rem;
        border-radius: 12px;
        font-size: 0.8rem;
        cursor: pointer;
        text-transform: capitalize;
        flex: 1 1 auto;
    }

    .preset-btn.active {
        background: var(--accent-info, #3b82f6);
        color: white;
        border-color: var(--accent-info);
    }

    .advanced-list {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        font-size: 0.85rem;
    }

    .adv-row {
        display: flex;
        justify-content: space-between;
        color: var(--text-secondary);
    }

    .capitalize {
        text-transform: capitalize;
    }

    .error-toast {
        position: absolute;
        bottom: 1rem;
        left: 50%;
        transform: translateX(-50%);
        background: var(--accent-error);
        color: white;
        padding: 0.5rem 1rem;
        border-radius: 20px;
        font-size: 0.8rem;
        pointer-events: none;
        z-index: 30;
        width: max-content;
    }

    /* Skin Selector */
    .skin-selector {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.5rem;
    }
    .skin-opts {
        display: flex;
        gap: 0.5rem;
    }
    .skin-btn {
        background: var(--bg-card-hover);
        border: 1px solid var(--border-primary);
        color: var(--text-secondary);
        width: 32px;
        height: 32px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
    }
    .skin-btn.active {
        background: var(--accent-primary);
        color: white;
        border-color: var(--accent-primary);
    }
    .divider {
        height: 1px;
        background: var(--border-divider, rgba(255, 255, 255, 0.1));
        width: 100%;
        margin: 0.5rem 0;
    }
</style>
