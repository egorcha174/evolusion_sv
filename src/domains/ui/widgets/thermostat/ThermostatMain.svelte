<script lang="ts">
    import { t } from "svelte-i18n";
    import { fade } from "svelte/transition";
    import "iconify-icon";
    import { type ThermostatController } from "./core/thermostat.svelte";
    import type { HAEntity } from "$lib/types";
    import Portal from "../../components/Portal.svelte";

    let { entity, controller } = $props<{
        entity: HAEntity;
        controller: ThermostatController;
    }>();

    // --- State ---
    let showPresets = $state(false);
    let presetButton = $state<HTMLElement | null>(null);
    let menuPosition = $state<{
        top: number;
        left: number;
        width: number;
    } | null>(null);
    let isBottom = $state(false);

    // --- Computed Values ---
    // Current Temp (Yellow)
    let currentTemp = $derived(entity.attributes.current_temperature);

    // HVAC Action (Heating/Cooling)
    let hvacAction = $derived(entity.attributes.hvac_action);
    let isHeating = $derived(hvacAction === "heating");
    let isCooling = $derived(hvacAction === "cooling");

    // Presets
    let presetModes = $derived(entity.attributes.preset_modes || []);
    let currentPreset = $derived(controller.presetMode || "None");

    // --- Actions ---
    function increaseTemp() {
        if (controller.targetTemp < controller.maxTemp) {
            controller.setTemperature(controller.targetTemp + controller.step);
        }
    }

    function decreaseTemp() {
        if (controller.targetTemp > controller.minTemp) {
            controller.setTemperature(controller.targetTemp - controller.step);
        }
    }

    function togglePresets() {
        if (presetModes.length > 0) {
            if (!showPresets && presetButton) {
                const rect = presetButton.getBoundingClientRect();
                const spaceAbove = rect.top;

                // Determine position
                if (spaceAbove < 250) {
                    // Show below
                    isBottom = true;
                    menuPosition = {
                        top: rect.bottom + 8,
                        left: rect.left + rect.width / 2,
                        width: rect.width,
                    };
                } else {
                    // Show above
                    isBottom = false;
                    menuPosition = {
                        top: rect.top - 8,
                        left: rect.left + rect.width / 2,
                        width: rect.width,
                    };
                }
            }
            showPresets = !showPresets;
        }
    }

    function selectPreset(mode: string) {
        controller.setPresetMode(mode);
        showPresets = false;
    }

    // click outside to close
    function handleWindowClick(e: MouseEvent) {
        if (
            showPresets &&
            !(e.target as Element).closest(".preset-container") &&
            !(e.target as Element).closest(".preset-menu-portal")
        ) {
            showPresets = false;
        }
    }
</script>

<svelte:window onclick={handleWindowClick} />

<div class="skin-main">
    <div class="thermostat-ring-container">
        <div class="glass-reflection"></div>

        <!-- Main Display Area -->
        <div class="display-area">
            <!-- Current Temperature (Large Yellow) -->
            <div class="current-temp">
                {currentTemp ?? $t("common.unknown")}
            </div>
        </div>

        <!-- Divider Line -->
        <div class="divider"></div>

        <!-- Control Area -->
        <div class="control-area">
            <!-- Decrease Button -->
            <button
                class="adjust-btn"
                onclick={decreaseTemp}
                aria-label={$t("widgets.thermostat.actions.decrease", {
                    default: "Decrease Temperature",
                })}
            >
                <iconify-icon icon="mdi:minus"></iconify-icon>
            </button>

            <!-- Target Temperature (Green) -->
            <div class="target-temp">
                {controller.targetTemp}
            </div>

            <!-- Increase Button -->
            <button
                class="adjust-btn"
                onclick={increaseTemp}
                aria-label={$t("widgets.thermostat.actions.increase", {
                    default: "Increase Temperature",
                })}
            >
                <iconify-icon icon="mdi:plus"></iconify-icon>
            </button>
        </div>

        <!-- Bottom Preset / Status Button -->
        <div class="preset-container">
            <button
                class="preset-pill"
                bind:this={presetButton}
                onclick={togglePresets}
                class:active={showPresets}
                aria-label={$t("widgets.thermostat.presets.title")}
            >
                <span class="preset-name"
                    >{$t(
                        `widgets.thermostat.presets.${currentPreset.toLowerCase()}`,
                    ) || currentPreset}</span
                >

                {#if isHeating}
                    <span class="status-icon heating" transition:fade>
                        <iconify-icon icon="mdi:fire"></iconify-icon>
                    </span>
                {:else if isCooling}
                    <span class="status-icon cooling" transition:fade>
                        <iconify-icon icon="mdi:snowflake"></iconify-icon>
                    </span>
                {/if}
            </button>

            {#if showPresets && menuPosition}
                <Portal>
                    <div
                        class="preset-menu-portal"
                        class:bottom={isBottom}
                        style:top="{menuPosition.top}px"
                        style:left="{menuPosition.left}px"
                        style:width="{menuPosition.width}px"
                    >
                        {#each presetModes as mode}
                            <button
                                class="preset-item"
                                class:selected={currentPreset === mode}
                                onclick={() => selectPreset(mode)}
                            >
                                {$t(
                                    `widgets.thermostat.presets.${mode.toLowerCase()}`,
                                ) || mode}
                            </button>
                        {/each}
                    </div>
                </Portal>
            {/if}
        </div>
    </div>
</div>

<style>
    /* 
     * Main Skin Layout - Circular
     */
    .skin-main {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
        /* Ensure container query context comes from parent widget */
        container-type: size;
    }

    .thermostat-ring-container {
        position: relative;
        /* Make it circular and centered */
        width: 90cqmin;
        height: 90cqmin;
        border-radius: 50%;

        /* Match Device Card 'Off' State */
        background: var(
            --card-background,
            var(--glass-surface, rgba(255, 255, 255, 0.05))
        );
        backdrop-filter: var(--glass-blur, blur(12px));
        -webkit-backdrop-filter: var(--glass-blur, blur(12px));
        border: 4px solid var(--border-primary, rgba(255, 255, 255, 0.1));

        /* Subtle shadow to separate ring from card */
        box-shadow:
            0 10px 30px rgba(0, 0, 0, 0.2),
            inset 0 0 0 1px rgba(255, 255, 255, 0.05);

        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        color: var(--ts-text-primary);
        overflow: visible;
    }

    /* Top shine reflection - subtle overlay */
    .glass-reflection {
        position: absolute;
        top: 2%;
        left: 15%;
        right: 15%;
        height: 40%;
        border-radius: 50%;
        background: linear-gradient(
            to bottom,
            rgba(255, 255, 255, 0.05),
            transparent
        );
        pointer-events: none;
    }

    /* --- Current Temp (Accent) --- */
    .display-area {
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        /* Push it slightly up to balance the bottom button */
        margin-top: -5%;
        width: 100%;
    }

    .current-temp {
        font-size: 30cqmin;
        font-weight: 400;
        line-height: 1;
        /* Use theme accent primary */
        color: var(--accent-primary, #ffd700);
        /* Subtle glow using accent color */
        text-shadow: 0 0 10px rgba(var(--accent-rgb, 255, 215, 0), 0.3);
        z-index: 2;
    }

    /* --- Divider --- */
    .divider {
        width: 70%;
        height: 2px;
        background: var(--border-primary, rgba(255, 255, 255, 0.1));
        margin: 5% 0;
        border-radius: 2px;
    }

    /* --- Control Area (Target Temp) --- */
    .control-area {
        display: flex;
        align-items: center;
        gap: 10%;
        width: 60%;
        justify-content: center;
    }

    .target-temp {
        font-size: 14cqmin;
        font-weight: 500;
        /* Use primary text color as requested */
        color: var(--text-primary, #ffffff);
        font-variant-numeric: tabular-nums;
    }

    .adjust-btn {
        background: transparent;
        border: none;
        color: var(--text-secondary);
        font-size: 12cqmin;
        cursor: pointer;
        padding: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0.8;
        transition:
            opacity 0.2s,
            transform 0.1s,
            color 0.2s;
    }

    .adjust-btn:hover {
        opacity: 1;
        color: var(--text-primary);
    }

    .adjust-btn:active {
        transform: scale(0.9);
    }

    /* --- Preset / Status Container --- */
    .preset-container {
        position: absolute;
        bottom: 8%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
    }

    .preset-pill {
        display: flex;
        align-items: center;
        gap: 6px;
        background: var(--bg-surface, #333);
        border: 1px solid var(--border-primary, #555);
        border-radius: 20px;
        padding: 4px 12px;
        color: var(--text-secondary);
        font-size: 5cqmin; /* Responsive font size */
        cursor: pointer;
        transition: all 0.2s;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
        max-width: 60cqmin;
    }

    .preset-pill:hover {
        background: var(--bg-card-hover, #444);
        color: var(--text-primary);
    }

    .preset-pill.active {
        border-color: var(--accent-primary);
        color: var(--text-primary);
    }

    .preset-name {
        text-transform: capitalize;
        font-weight: 500;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .status-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.2em; /* Relative to button font size */
        animation: pulse 2s infinite;
    }

    .status-icon.heating {
        color: var(--accent-primary, #ff3d00);
    }

    .status-icon.cooling {
        color: var(--accent-primary, #00b0ff);
    }

    /* Portal Menu Styles */
    .preset-menu-portal {
        position: fixed;
        /* Start from bottom-center for top opening */
        /* We use fixed positioning calculated in JS now */
        transform: translate(-50%, -100%);

        background: var(--bg-surface, #1e1e1e);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        border: 1px solid var(--border-primary);
        border-radius: 12px;
        padding: 4px;
        min-width: 140px;
        box-shadow: var(--shadow-dropdown, 0 10px 25px rgba(0, 0, 0, 0.5));
        display: flex;
        flex-direction: column;
        gap: 2px;
        z-index: 9999;
    }

    .preset-menu-portal.bottom {
        /* If opening downwards, change transform origin */
        transform: translate(-50%, 0);
    }

    .preset-item {
        background: transparent;
        border: none;
        color: var(--text-primary);
        padding: 8px 12px;
        text-align: left;
        cursor: pointer;
        border-radius: 8px;
        text-transform: capitalize;
        transition: background 0.2s;
        font-size: 0.9rem;
    }

    .preset-item:hover {
        background: var(--bg-hover, rgba(255, 255, 255, 0.05));
    }

    .preset-item.selected {
        background: var(--accent-primary-dim, rgba(0, 122, 255, 0.1));
        color: var(--accent-primary);
        font-weight: 600;
    }

    /* Animations */
    @keyframes pulse {
        0% {
            transform: scale(1);
            opacity: 0.9;
        }
        50% {
            transform: scale(1.1);
            opacity: 1;
        }
        100% {
            transform: scale(1);
            opacity: 0.9;
        }
    }

    /* Responsive overrides for very small sizes */
    @container (max-width: 150px) {
        .current-temp {
            font-size: 2.5rem;
        }
        .target-temp {
            font-size: 1.5rem;
        }
        .preset-pill {
            font-size: 0.7rem;
            padding: 2px 8px;
        }
    }
</style>
