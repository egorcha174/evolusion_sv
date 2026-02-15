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

    // --- State ---
    let sliderElement = $state<HTMLElement>();
    let showPresets = $state(false);
    let presetButton = $state<HTMLElement | null>(null);
    let menuPosition = $state<{
        top: number;
        left: number;
        width: number;
    } | null>(null);
    let isBottom = $state(false);

    // --- Derived Values ---
    let hvacAction = $derived(entity.attributes.hvac_action);
    let hvacModes = $derived(entity.attributes.hvac_modes || []);
    let presetModes = $derived(entity.attributes.preset_modes || []);
    let currentPreset = $derived(controller.presetMode || "None");

    // Theme Colors
    let activeColor = $derived.by(() => {
        if (controller.hvacMode === "off") return "var(--text-muted, #555)";
        if (hvacAction === "heating") return "var(--accent-primary, #ff3d00)";
        if (hvacAction === "cooling") return "var(--accent-primary, #00b0ff)";
        if (controller.hvacMode === "heat")
            return "var(--accent-primary, #ff3d00)";
        if (controller.hvacMode === "cool")
            return "var(--accent-primary, #00b0ff)";
        return "var(--accent-primary, #ffd700)";
    });

    // Slider Calculations
    let percentage = $derived.by(() => {
        const min = controller.minTemp;
        const max = controller.maxTemp;
        const current = Math.max(min, Math.min(max, controller.targetTemp));
        return ((current - min) / (max - min)) * 100;
    });

    // --- Interaction ---
    function handleSliderInput(clientY: number) {
        if (!sliderElement) return;
        const rect = sliderElement.getBoundingClientRect();
        const height = rect.height;
        const bottom = rect.bottom;

        // Calculate raw percentage from bottom
        let val = (bottom - clientY) / height;
        val = Math.max(0, Math.min(1, val)); // Clamp 0-1

        // Map to temperature range
        const rawTemp =
            controller.minTemp +
            val * (controller.maxTemp - controller.minTemp);

        // Step rounding
        const stepping = controller.step || 0.5;
        const newTemp = Math.round(rawTemp / stepping) * stepping;

        if (newTemp !== controller.targetTemp) {
            controller.setTemperature(newTemp);
        }
    }

    function onMouseDown(e: MouseEvent) {
        if (controller.hvacMode === "off") return;
        controller.setDragging(true);
        handleSliderInput(e.clientY);
        window.addEventListener("mousemove", onMouseMove);
        window.addEventListener("mouseup", onMouseUp);
    }

    function onMouseMove(e: MouseEvent) {
        if (controller.isDragging) {
            e.preventDefault();
            handleSliderInput(e.clientY);
        }
    }

    function onMouseUp() {
        controller.setDragging(false);
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("mouseup", onMouseUp);
    }

    function onTouchStart(e: TouchEvent) {
        if (controller.hvacMode === "off") return;
        e.preventDefault();
        controller.setDragging(true);
        const t = e.touches[0];
        handleSliderInput(t.clientY);
    }

    function onTouchMove(e: TouchEvent) {
        if (controller.isDragging) {
            e.preventDefault();
            const t = e.touches[0];
            handleSliderInput(t.clientY);
        }
    }

    function onTouchEnd() {
        controller.setDragging(false);
    }

    // --- Presets Logic ---
    function togglePresets() {
        if (presetModes.length > 0) {
            if (!showPresets && presetButton) {
                const rect = presetButton.getBoundingClientRect();
                const spaceAbove = rect.top;

                if (spaceAbove < 250) {
                    isBottom = true;
                    menuPosition = {
                        top: rect.bottom + 8,
                        left: rect.left,
                        width: 140,
                    };
                } else {
                    isBottom = false;
                    menuPosition = {
                        top: rect.top - 8,
                        left: rect.left,
                        width: 140,
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

    function handleWindowClick(e: MouseEvent) {
        if (
            showPresets &&
            !(e.target as Element).closest(".preset-label-btn") &&
            !(e.target as Element).closest(".preset-menu-portal")
        ) {
            showPresets = false;
        }
    }

    // Icons
    function getStatusIcon() {
        if (controller.hvacMode === "off") return "mdi:power";
        if (hvacAction === "heating") return "mdi:fire";
        if (hvacAction === "cooling") return "mdi:snowflake";
        if (hvacAction === "drying") return "mdi:water-percent";
        if (hvacAction === "fan") return "mdi:fan";
        if (hvacAction === "idle") return "mdi:dots-horizontal";
        return "mdi:thermostat";
    }
</script>

<svelte:window onclick={handleWindowClick} />

<div class="skin-vertical" style="--theme-accent: {activeColor}">
    <!-- Left Column: Info & Controls -->
    <div class="left-col">
        <!-- Top Icon -->
        <div class="status-icon" style:color="var(--theme-accent)">
            <iconify-icon icon={getStatusIcon()} width="24"></iconify-icon>
        </div>

        <!-- Middle: Temperatures -->
        <div class="temp-group">
            <div class="current-temp box-shadow-text">
                {entity.attributes.current_temperature?.toFixed(1) ?? "--"}
            </div>

            <div class="divider"></div>

            <div class="target-temp">
                {controller.targetTemp.toFixed(1)}
            </div>
        </div>

        <!-- Bottom: Menu Button -->
        <div class="menu-wrapper">
            {#if presetModes.length > 0}
                <button
                    class="preset-label-btn"
                    bind:this={presetButton}
                    onclick={togglePresets}
                    class:active={showPresets}
                    aria-label="Presets"
                >
                    {currentPreset}
                </button>
            {/if}
        </div>
    </div>

    <!-- Right Column: Vertical Slider -->
    <div class="right-col">
        <div
            class="slider-track"
            role="slider"
            tabindex="0"
            aria-valuemin={controller.minTemp}
            aria-valuemax={controller.maxTemp}
            aria-valuenow={controller.targetTemp}
            aria-label={$t("widgets.thermostat.targetTemp")}
            bind:this={sliderElement}
            onmousedown={onMouseDown}
            ontouchstart={onTouchStart}
            ontouchmove={onTouchMove}
            ontouchend={onTouchEnd}
        >
            <!-- Background Fill (Greyed out part) -->
            <div class="slider-bg"></div>

            <!-- Active Fill -->
            <div
                class="slider-fill"
                style:height="{percentage}%"
                style:background="var(--theme-accent)"
            >
                <!-- Knob/Handle: The white circle at the top of the fill -->
                <div class="slider-knob"></div>
            </div>
        </div>
    </div>

    <!-- Portal Menu -->
    {#if showPresets && menuPosition}
        <Portal>
            <div
                class="preset-menu-portal"
                class:bottom={isBottom}
                style:top="{menuPosition.top}px"
                style:left="{menuPosition.left}px"
                style:width="{menuPosition.width}px"
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
</div>

<style>
    .skin-vertical {
        display: flex;
        flex-direction: row;
        width: 100%;
        height: 100%;
        padding: 16px;
        gap: 16px;
        background: var(--card-background, #222);
        color: var(--text-primary, #fff);
        overflow: hidden;
        container-type: size;
        box-sizing: border-box;
    }

    /* --- Left Column --- */
    .left-col {
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: flex-start;
        min-width: 0;
    }

    .status-icon {
        font-size: 24px;
        font-size: 8cqmin;
        filter: drop-shadow(0 0 8px currentColor);
    }

    .temp-group {
        display: flex;
        flex-direction: column;
        width: 100%;
        align-items: center; /* Centered as requested */
    }

    .current-temp {
        font-size: 28cqmin;
        font-weight: 500;
        line-height: 1;
        color: var(--text-primary, #fff);
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
    }

    .divider {
        height: 2px;
        width: 100%;
        background: var(--text-primary, #fff);
        margin: 4px 0;
        opacity: 0.8;
    }

    .target-temp {
        font-size: 28cqmin;
        font-weight: 500;
        line-height: 1;
        color: var(--text-secondary, #aaa);
    }

    .preset-label-btn {
        background: transparent;
        border: none;
        color: var(--text-secondary, #aaa);
        font-size: 10cqmin; /* Readable text size */
        font-weight: 500;
        cursor: pointer;
        padding: 4px 8px; /* Hit area */
        margin-left: -8px; /* Align text with left edge visually */
        text-transform: capitalize;
        transition: color 0.2s;
        text-align: left;
    }

    .preset-label-btn:hover {
        color: var(--text-primary, #fff);
    }

    /* --- Right Column (Slider) --- */
    .right-col {
        width: 15%;
        height: 100%;
        padding: 4px 0;
    }

    .slider-track {
        position: relative;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.2);
        border-radius: 100px;
        overflow: visible;
        cursor: pointer;
        border: none;
    }

    .slider-bg {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.2);
        border-radius: 100px;
        border: 1px solid rgba(255, 255, 255, 0.1);
        overflow: hidden; /* Clips the fill */
    }

    .slider-fill {
        position: absolute;
        bottom: 0;
        left: 0;
        width: 100%;
        transition: height 0.1s linear;
        border-radius: 0 0 100px 100px;
    }

    .slider-knob {
        position: absolute;
        top: 0;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 100%;
        aspect-ratio: 1;
        background: #fff;
        border-radius: 50%;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
        z-index: 2;
    }

    /* --- Menu Portal --- */
    .preset-menu-portal {
        position: fixed;
        background: var(--card-background, #1e1e1e);
        border: 1px solid var(--border-primary, #333);
        border-radius: 8px;
        padding: 4px;
        display: flex;
        flex-direction: column;
        gap: 2px;
        z-index: 9999;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
    }

    .preset-item {
        background: transparent;
        border: none;
        color: var(--text-primary);
        padding: 8px 12px;
        text-align: left;
        cursor: pointer;
        border-radius: 4px;
        text-transform: capitalize;
        font-size: 14px;
    }

    .preset-item:hover {
        background: rgba(255, 255, 255, 0.1);
    }

    .preset-item.selected {
        color: var(--theme-accent);
        font-weight: bold;
    }

    .box-shadow-text {
        text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
    }
</style>
