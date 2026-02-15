<script lang="ts">
    import { t } from "svelte-i18n";
    import "iconify-icon";
    import { fade } from "svelte/transition";
    import type { HAEntity } from "$lib/types";
    import { type ThermostatController } from "./core/thermostat.svelte";
    import Portal from "../../components/Portal.svelte";

    let { entity, controller } = $props<{
        entity: HAEntity;
        controller: ThermostatController;
    }>();

    // --- Derived Values ---
    let hvacAction = $derived(entity.attributes.hvac_action);
    let presetModes = $derived(entity.attributes.preset_modes || []);
    let currentPreset = $derived(controller.presetMode || "None");

    // Dynamic Color (Minimalist matching usually means using state colors or monochrome)
    let stateColor = $derived.by(() => {
        if (controller.hvacMode === "off") return "var(--text-muted, #555)";
        if (hvacAction === "heating") return "var(--accent-primary, #ff3d00)";
        if (hvacAction === "cooling") return "var(--accent-primary, #00b0ff)";
        // Fallback for idle/auto
        return "var(--text-primary, #fff)";
    });

    // --- Vertical Slider Logic ---
    let trackElement = $state<HTMLElement>();

    function valueToPercent(value: number) {
        const min = controller.minTemp;
        const max = controller.maxTemp;
        const clamped = Math.max(min, Math.min(max, value));
        return ((clamped - min) / (max - min)) * 100;
    }

    function percentToValue(percent: number) {
        const ratio = Math.max(0, Math.min(100, percent)) / 100;
        const raw =
            controller.minTemp +
            ratio * (controller.maxTemp - controller.minTemp);
        return Math.round(raw / controller.step) * controller.step;
    }

    let targetPercent = $derived(valueToPercent(controller.targetTemp));

    // Interaction Handlers
    function handleInput(clientY: number) {
        if (!trackElement) return;
        const rect = trackElement.getBoundingClientRect();
        const relativeY = clientY - rect.top;
        const percentY = 100 - (relativeY / rect.height) * 100;
        let newVal = percentToValue(percentY);
        controller.setTemperature(newVal);
    }

    function onMouseDown(e: MouseEvent) {
        controller.setDragging(true);
        handleInput(e.clientY);
        window.addEventListener("mousemove", onMouseMove);
        window.addEventListener("mouseup", onMouseUp);
    }

    function onMouseMove(e: MouseEvent) {
        if (controller.isDragging) {
            e.preventDefault();
            handleInput(e.clientY);
        }
    }

    function onMouseUp() {
        controller.setDragging(false);
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("mouseup", onMouseUp);
    }

    function onTouchStart(e: TouchEvent) {
        e.preventDefault();
        controller.setDragging(true);
        const t = e.touches[0];
        handleInput(t.clientY);
    }

    function onTouchMove(e: TouchEvent) {
        if (controller.isDragging) {
            e.preventDefault();
            const t = e.touches[0];
            handleInput(t.clientY);
        }
    }

    function onTouchEnd() {
        controller.setDragging(false);
    }

    // --- Presets Logic ---
    let showPresets = $state(false);
    let presetButton = $state<HTMLElement>();
    let menuPosition = $state<{
        top: number;
        left: number;
        width: number;
    } | null>(null);

    function togglePresets() {
        if (presetModes.length === 0) return;

        if (!showPresets && presetButton) {
            const rect = presetButton.getBoundingClientRect();
            // Position menu above button
            menuPosition = {
                top: rect.top - 8,
                left: rect.left,
                width: 140,
            };
        }
        showPresets = !showPresets;
    }

    function selectPreset(mode: string) {
        controller.setPresetMode(mode);
        showPresets = false;
    }

    // Helper for icons
    function getModeIcon(mode: string) {
        switch (mode) {
            case "off":
                return "mdi:power";
            case "heat":
                return "mdi:fire";
            case "cool":
                return "mdi:snowflake";
            case "auto":
                return "mdi:thermostat-auto";
            default:
                return "mdi:thermostat";
        }
    }
</script>

<svelte:window
    onclick={(e) => {
        if (
            showPresets &&
            !(e.target as Element).closest(".preset-trigger") &&
            !(e.target as Element).closest(".preset-menu")
        ) {
            showPresets = false;
        }
    }}
/>

<div class="skin-minimalist" style="--state-color: {stateColor}">
    <!-- Left Side: Info & Controls -->
    <div class="info-section">
        <!-- Centered Info -->
        <div class="temp-group">
            <div class="current-temp">
                {entity.attributes.current_temperature ?? "--"}°
            </div>
            {#if controller.hvacMode !== "off"}
                <div class="target-temp" style:color={stateColor}>
                    {controller.targetTemp}°
                </div>
            {/if}
        </div>

        <!-- Bottom Left: Controls -->
        <div class="bottom-controls">
            <!-- Preset Button -->
            {#if presetModes.length > 0}
                <button
                    class="preset-trigger control-btn"
                    bind:this={presetButton}
                    onclick={togglePresets}
                    class:active={controller.presetMode &&
                        controller.presetMode !== "none"}
                >
                    <iconify-icon icon="mdi:tune-vertical"></iconify-icon>
                </button>
            {/if}

            <!-- State Icon -->
            <div class="state-icon" style:color={stateColor}>
                <iconify-icon icon={getModeIcon(controller.hvacMode)}
                ></iconify-icon>
            </div>
        </div>
    </div>

    <!-- Right Side: Slider -->
    <div class="slider-section">
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <div
            class="slider-track"
            bind:this={trackElement}
            onmousedown={onMouseDown}
            ontouchstart={onTouchStart}
            ontouchmove={onTouchMove}
            ontouchend={onTouchEnd}
        >
            <!-- Background Rail -->
            <div class="rail"></div>

            <!-- Active Fill -->
            <div
                class="fill"
                style="height: {targetPercent}%; background-color: {stateColor};"
            ></div>

            <!-- Knob -->
            <div class="knob" style="bottom: {targetPercent}%;">
                <div
                    class="knob-inner"
                    style:background-color={stateColor}
                ></div>
            </div>
        </div>
    </div>
</div>

<!-- Preset Menu Portal -->
{#if showPresets && menuPosition}
    <Portal>
        <div
            class="preset-menu"
            style:top="{menuPosition.top}px"
            style:left="{menuPosition.left}px"
            style:transform="translate(0, -100%)"
            transition:fade={{ duration: 150 }}
        >
            {#each presetModes as mode}
                <button
                    class="preset-item"
                    class:selected={currentPreset === mode}
                    onclick={() => selectPreset(mode)}
                >
                    {mode}
                </button>
            {/each}
        </div>
    </Portal>
{/if}

<style>
    .skin-minimalist {
        display: flex;
        width: 100%;
        height: 100%;
        padding: 6cqmin;
        gap: 4cqmin;
        background: var(--card-background);
        border-radius: var(--border-radius, 24px);
        overflow: hidden;
        container-type: size;
        position: relative;
    }

    /* Left Info Section */
    .info-section {
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: center;
        position: relative;
    }

    .temp-group {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        justify-content: center;
        flex: 1; /* Push controls to bottom */
    }

    .current-temp {
        font-size: 22cqmin;
        font-weight: 700;
        line-height: 1;
        color: var(--text-primary);
        font-feature-settings: "tnum";
    }

    .target-temp {
        font-size: 8cqmin;
        font-weight: 600;
        margin-top: -1cqmin;
        opacity: 0.9;
        font-feature-settings: "tnum";
    }

    /* Bottom Controls */
    .bottom-controls {
        display: flex;
        align-items: center;
        gap: 3cqmin;
        margin-top: auto; /* Push to bottom */
    }

    .control-btn {
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        color: var(--text-secondary);
        width: 10cqmin;
        height: 10cqmin;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 5cqmin;
        cursor: pointer;
        transition: all 0.2s;
    }

    .control-btn:hover {
        background: rgba(255, 255, 255, 0.1);
        color: var(--text-primary);
    }

    .control-btn.active {
        color: var(--state-color);
        border-color: var(--state-color);
        background: rgba(var(--accent-rgb, 255, 255, 255), 0.1);
    }

    .state-icon {
        font-size: 6cqmin;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0.8;
    }

    /* Slider Section */
    .slider-section {
        width: 15cqmin; /* Fixed relative width */
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .slider-track {
        width: 100%;
        height: 90%; /* Slight padding top/bottom */
        position: relative;
        cursor: pointer;
    }

    .rail {
        position: absolute;
        width: 4px;
        height: 100%;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(255, 255, 255, 0.1);
        border-radius: 2px;
    }

    .fill {
        position: absolute;
        width: 4px;
        left: 50%;
        bottom: 0;
        transform: translateX(-50%);
        border-radius: 2px;
        transition:
            height 0.1s linear,
            background-color 0.3s;
    }

    .knob {
        position: absolute;
        left: 50%;
        transform: translate(-50%, 50%); /* Center on point */
        width: 6cqmin;
        height: 6cqmin;
        pointer-events: none;
        transition: bottom 0.1s linear;
    }

    .knob-inner {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        background: #fff;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
    }

    /* Preset Menu */
    .preset-menu {
        position: fixed;
        background: var(--bg-surface, #1e1e1e);
        border: 1px solid var(--border-primary);
        border-radius: 12px;
        padding: 4px;
        min-width: 140px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
        display: flex;
        flex-direction: column;
        gap: 2px;
        z-index: 9999;
    }

    .preset-item {
        background: transparent;
        border: none;
        color: var(--text-primary);
        padding: 8px 12px;
        text-align: left;
        cursor: pointer;
        border-radius: 8px;
        font-size: 0.9rem;
    }

    .preset-item:hover {
        background: rgba(255, 255, 255, 0.05);
    }

    .preset-item.selected {
        color: var(--accent-primary);
        background: rgba(var(--accent-rgb), 0.1);
    }
</style>
