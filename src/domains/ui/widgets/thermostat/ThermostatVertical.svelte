<script lang="ts">
    import { t } from "svelte-i18n";
    import { onDestroy } from "svelte";
    import "iconify-icon";
    import {
        setTemperature,
        CLIMATE_FEATURES,
        setHvacMode,
        setFanMode,
        type ThermostatState,
    } from "../thermostatStore";
    import type { HAEntity } from "$lib/types";

    interface Props {
        entity: HAEntity;
        thermostatState: ThermostatState;
        isOff: boolean;
        hasFan: boolean;
        hasPresets: boolean;
        onToggleAdvanced: () => void;
        onTogglePresets: () => void;
        onError: (err: Error) => void;
    }

    let {
        entity,
        thermostatState,
        isOff,
        hasFan,
        hasPresets,
        onToggleAdvanced,
        onTogglePresets,
        onError,
    }: Props = $props();

    // Local slider value for immediate UI feedback
    let sliderValue = $state(thermostatState.targetTemp);
    let isDragging = $state(false);

    // Sync slider with entity when entity updates externally (and not dragging)
    $effect(() => {
        if (!isDragging) {
            sliderValue = thermostatState.targetTemp;
        }
    });

    // --- Helpers ---
    function getModeIcon(mode: string): string {
        switch (mode) {
            case "heat":
                return "mdi:fire";
            case "cool":
                return "mdi:snowflake";
            case "auto":
                return "mdi:autorenew";
            case "heat_cool":
                return "mdi:sun-snowflake-variant";
            case "dry":
                return "mdi:water-percent";
            case "fan_only":
                return "mdi:fan";
            case "off":
                return "mdi:power";
            default:
                return "mdi:thermostat";
        }
    }

    function getModeColor(mode: string): string {
        switch (mode) {
            case "heat":
                return "var(--thermostat-heating-color, #ff6b35)";
            case "cool":
                return "var(--thermostat-cooling-color, #4fc3f7)";
            case "auto":
                return "var(--accent-primary, #7c4dff)";
            case "heat_cool":
                return "var(--accent-primary, #7c4dff)";
            case "dry":
                return "var(--accent-info, #3b82f6)";
            case "fan_only":
                return "var(--text-secondary, #888)";
            default:
                return "var(--text-muted, #888)";
        }
    }

    // Generate a gradient for the slider based on mode
    function getSliderGradient(mode: string): string {
        if (isOff)
            return "linear-gradient(to top, var(--text-muted), var(--text-muted))";
        const color = getModeColor(mode);
        // Create a fade effect from color to transparent/white mix
        return `linear-gradient(to top, ${color}, color-mix(in srgb, ${color}, white 30%))`;
    }

    // --- Handlers ---
    function handleSliderChange(e: Event) {
        const target = e.target as HTMLInputElement;
        const val = parseFloat(target.value);
        sliderValue = val;
        isDragging = false;
        setTemperature(entity.entity_id, val, onError);
    }

    function handleSliderInput(e: Event) {
        const target = e.target as HTMLInputElement;
        const val = parseFloat(target.value);
        sliderValue = val;
        isDragging = true;
    }

    function handleToggle() {
        if (isOff) {
            const firstActive =
                thermostatState.hvacModes.find((m) => m !== "off") || "heat";
            setHvacMode(entity.entity_id, firstActive, onError);
        } else {
            setHvacMode(entity.entity_id, "off", onError);
        }
    }

    function handleFanChange(e: Event) {
        const target = e.target as HTMLInputElement;
        const idx = parseInt(target.value);
        if (thermostatState.fanModes[idx]) {
            setFanMode(
                entity.entity_id,
                thermostatState.fanModes[idx],
                onError,
            );
        }
    }

    // Slider fill percentage for visual styling (vertical)
    let sliderFill = $derived(
        ((sliderValue - thermostatState.minTemp) /
            (thermostatState.maxTemp - thermostatState.minTemp)) *
            100,
    );
</script>

<div class="display-section">
    <div class="info-column">
        <!-- Status/Mode Icon -->
        <div
            class="status-indicator"
            style:color={isOff
                ? "var(--text-muted)"
                : getModeColor(thermostatState.hvacMode)}
        >
            <iconify-icon
                icon={getModeIcon(thermostatState.hvacMode)}
                width="24"
            ></iconify-icon>
            <span class="mode-text">
                {isOff
                    ? $t("widgets.thermostat.modes.off", { default: "Off" })
                    : $t(
                          `widgets.thermostat.modes.${thermostatState.hvacMode}`,
                          {
                              default: thermostatState.hvacMode,
                          },
                      )}
            </span>
        </div>

        <!-- Current Temperature -->
        <div class="current-temp">
            <span class="value"
                >{thermostatState.currentTemp?.toFixed(1) ?? "--"}</span
            >
            <span class="unit">°</span>
        </div>

        <!-- Secondary Info (Humidity / Target) -->
        <div class="secondary-info">
            {#if entity.attributes.humidity}
                <div class="info-item">
                    <iconify-icon icon="mdi:water-percent" width="16"
                    ></iconify-icon>
                    <span>{entity.attributes.humidity}%</span>
                </div>
            {/if}
            <div class="info-item target-preview">
                <iconify-icon icon="mdi:target" width="16"></iconify-icon>
                <span>{sliderValue.toFixed(1)}°</span>
            </div>
        </div>

        <div class="entity-name">{entity.attributes.friendly_name}</div>
    </div>

    <!-- Vertical Slider Column -->
    <div class="slider-column">
        <div class="slider-container">
            <div class="slider-track">
                <!-- Filled part of the track -->
                <div
                    class="slider-fill"
                    style:height="{sliderFill}%"
                    style:background={getSliderGradient(
                        thermostatState.hvacMode,
                    )}
                ></div>
            </div>

            <!-- Hidden Range Input -->
            <input
                type="range"
                class="vertical-range"
                min={thermostatState.minTemp}
                max={thermostatState.maxTemp}
                step={thermostatState.targetTempStep}
                value={sliderValue}
                oninput={handleSliderInput}
                onchange={handleSliderChange}
                disabled={isOff}
                aria-label="Target temperature"
            />

            <!-- Plus/Minus indicators on track (visual only) -->
            <div class="track-icons">
                <iconify-icon icon="mdi:plus" width="14"></iconify-icon>
                <iconify-icon icon="mdi:minus" width="14"></iconify-icon>
            </div>
        </div>
    </div>
</div>

<!-- Bottom Section: Controls & Fan Speed -->
<div class="bottom-section" class:has-fan={hasFan}>
    <div class="controls-row">
        <!-- Left Button: Fan Mode OR Advanced Info -->
        {#if hasFan}
            <button class="control-btn" aria-label="Fan Mode" title="Fan Mode">
                <iconify-icon icon="mdi:fan" width="20"></iconify-icon>
            </button>
        {:else}
            <button
                class="control-btn"
                onclick={onToggleAdvanced}
                aria-label="Advanced Info"
            >
                <iconify-icon icon="mdi:information-variant" width="20"
                ></iconify-icon>
            </button>
        {/if}

        <!-- Power Button (Large, Center) -->
        <button
            class="control-btn power-btn"
            class:active={!isOff}
            onclick={handleToggle}
            aria-label="Toggle Power"
        >
            <iconify-icon icon="mdi:power" width="24"></iconify-icon>
        </button>

        <!-- Right Button: Presets -->
        {#if hasPresets}
            <button
                class="control-btn"
                onclick={onTogglePresets}
                aria-label="Presets"
            >
                <iconify-icon icon="mdi:tune-variant" width="20"></iconify-icon>
            </button>
        {:else}
            <div class="spacer"></div>
        {/if}
    </div>

    <!-- Fan Speed Slider (if available) -->
    {#if hasFan && thermostatState.fanModes.length > 0}
        <div class="fan-control">
            <span class="fan-label">SPEED</span>
            <div class="fan-slider-container">
                <input
                    type="range"
                    min="0"
                    max={thermostatState.fanModes.length - 1}
                    step="1"
                    value={thermostatState.fanModes.indexOf(
                        thermostatState.fanMode || "",
                    )}
                    onchange={handleFanChange}
                    class="fan-slider"
                    style:--fan-active-color={getModeColor(
                        thermostatState.hvacMode,
                    )}
                />
            </div>
        </div>
    {/if}
</div>

<style>
    .display-section {
        flex: 1;
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 0.5rem;
        min-height: 0;
        margin-top: 0.5rem;
    }

    /* --- Left Info Column --- */
    .info-column {
        display: flex;
        flex-direction: column;
        justify-content: center;
        height: 100%;
        gap: 0.2rem;
        padding-left: 0.5rem;
    }

    .status-indicator {
        display: flex;
        align-items: center;
        gap: 0.4rem;
        font-weight: 500;
        font-size: 0.9rem;
        margin-bottom: 0.5rem;
        transition: color 0.3s;
    }

    .mode-text {
        text-transform: capitalize;
    }

    .current-temp {
        display: flex;
        align-items: flex-start;
        line-height: 1;
        margin-top: 0.5rem;
    }

    .current-temp .value {
        font-size: 3.5rem;
        font-weight: 600;
        letter-spacing: -2px;
        color: var(--text-primary);
    }

    .current-temp .unit {
        font-size: 1.5rem;
        font-weight: 400;
        margin-top: 0.5rem;
        color: var(--text-secondary);
    }

    .secondary-info {
        display: flex;
        flex-direction: column;
        gap: 0.4rem;
        margin-top: 0.5rem;
        color: var(--text-secondary);
        font-size: 0.9rem;
    }

    .info-item {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .entity-name {
        margin-top: auto;
        font-size: 0.8rem;
        color: var(--text-muted);
        opacity: 0.8;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 110px;
    }

    /* --- Right Slider Column --- */
    .slider-column {
        height: 100%;
        padding-right: 0.5rem;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .slider-container {
        position: relative;
        width: 56px;
        height: 100%;
        max-height: 220px;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 28px;
        border: 1px solid var(--border-primary, rgba(255, 255, 255, 0.1));
        display: flex;
        justify-content: center;
        overflow: hidden; /* Clips the fill */
    }

    .slider-track {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        top: 0;
        pointer-events: none;
        background: transparent;
    }

    .slider-fill {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        transition: height 0.1s linear;
        opacity: 0.9;
    }

    .track-icons {
        position: absolute;
        top: 12px;
        bottom: 12px;
        left: 0;
        right: 0;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: center;
        pointer-events: none;
        color: var(--text-muted);
        opacity: 0.7;
        z-index: 1;
    }

    .vertical-range {
        position: absolute;
        width: 220px;
        height: 56px;
        transform: rotate(-90deg);
        transform-origin: center;
        top: 50%;
        left: 50%;
        margin-top: -28px;
        margin-left: -110px;
        opacity: 0;
        cursor: pointer;
        z-index: 2;
        -webkit-appearance: none;
        appearance: none;
    }

    /* --- Bottom Section --- */
    .bottom-section {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        padding-top: 0.8rem;
        padding-bottom: 2rem; /* Added padding to prevent edge overlap */
    }

    .controls-row {
        display: flex;
        justify-content: space-around;
        align-items: center;
    }

    .control-btn {
        width: 42px;
        height: 42px;
        border-radius: 50%;
        background: var(--bg-card-hover, rgba(255, 255, 255, 0.05));
        border: 1px solid var(--border-primary, rgba(255, 255, 255, 0.1));
        color: var(--text-secondary);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.2s ease;
    }

    .control-btn:hover,
    .control-btn.active {
        background: var(--bg-card-hover);
        color: var(--text-primary);
        transform: scale(1.05);
    }

    .control-btn.active {
        border-color: var(--accent-primary);
        color: var(--accent-primary);
    }

    .power-btn {
        width: 56px;
        height: 56px;
        background: var(--bg-card-hover);
        border: 2px solid transparent;
        color: var(--text-muted);
    }

    .power-btn.active {
        background: var(--card-background);
        border-color: var(
            --thermostat-heating-color,
            var(--accent-primary, #7c4dff)
        );
        color: var(--thermostat-heating-color, var(--accent-primary, #7c4dff));
        box-shadow: 0 0 15px
            var(--accent-primary-alpha, rgba(124, 77, 255, 0.2));
    }

    .spacer {
        width: 42px;
    }

    /* --- Fan Control --- */
    .fan-control {
        display: flex;
        flex-direction: column;
        gap: 0.3rem;
        padding: 0 0.5rem;
    }

    .fan-label {
        font-size: 0.65rem;
        font-weight: 600;
        color: var(--text-secondary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
        margin-left: 0.2rem;
    }

    .fan-slider-container {
        width: 100%;
        height: 32px;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 16px;
        position: relative;
        display: flex;
        align-items: center;
        padding: 0 1rem;
        box-sizing: border-box;
    }

    .fan-slider {
        width: 100%;
        height: 4px;
        appearance: none;
        -webkit-appearance: none;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 2px;
        outline: none;
    }

    .fan-slider::-webkit-slider-thumb {
        -webkit-appearance: none;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: white;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
        cursor: pointer;
        margin-top: -8px;
        transition: transform 0.2s;
    }
</style>
