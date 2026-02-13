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
    let isDragging = $derived(state.isDragging);

    // Entity Attributes
    let minTemp = $derived(entity.attributes.min_temp || 7);
    let maxTemp = $derived(entity.attributes.max_temp || 35);
    let step = $derived(entity.attributes.target_temp_step || 0.5);
    let currentTemp = $derived(entity.attributes.current_temperature);

    // Interaction
    let sliderHeight = 240;

    // Status Color
    let statusColor = $derived.by(() => {
        if (hvacMode === "off") return "var(--text-muted)";
        const action = entity.attributes.hvac_action;
        if (action === "heating")
            return "var(--thermostat-heating-color, #ff9500)";
        if (action === "cooling")
            return "var(--thermostat-cooling-color, #007aff)";
        return "var(--text-primary)";
    });

    let statusText = $derived(
        hvacMode === "off"
            ? $t("common.off")
            : $t(
                  `widgets.thermostat.actions.${entity.attributes.hvac_action || "idle"}`,
              ),
    );

    // Vertical slider logic
    // Bottom is minTemp, Top is maxTemp
    function valueToPercent(value: number) {
        const clamped = Math.max(minTemp, Math.min(maxTemp, value));
        return ((clamped - minTemp) / (maxTemp - minTemp)) * 100;
    }

    function percentToValue(percent: number) {
        const ratio = Math.max(0, Math.min(100, percent)) / 100;
        const raw = minTemp + ratio * (maxTemp - minTemp);
        return Math.round(raw / step) * step;
    }

    let targetPercent = $derived(valueToPercent(targetTemp));
    let currentPercent = $derived(valueToPercent(currentTemp || minTemp));

    let trackElement: HTMLDivElement;

    function handleInput(clientY: number) {
        if (!trackElement) return;
        const rect = trackElement.getBoundingClientRect();
        // Calculate percent from bottom
        const relativeY = clientY - rect.top;
        const percentY = 100 - (relativeY / rect.height) * 100;

        let newVal = percentToValue(percentY);
        controller.setTemperature(newVal);
    }

    function onMouseDown(e: MouseEvent) {
        if ((e.target as Element).closest(".nav-buttons")) return;
        controller.setDragging(true);
        handleInput(e.clientY);
        window.addEventListener("mousemove", onMouseMove);
        window.addEventListener("mouseup", onMouseUp);
    }

    function onMouseMove(e: MouseEvent) {
        if (isDragging) {
            e.preventDefault();
            handleInput(e.clientY);
        }
    }

    function onMouseUp() {
        controller.setDragging(false);
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("mouseup", onMouseUp);
    }

    // Touch support
    function onTouchStart(e: TouchEvent) {
        if ((e.target as Element).closest(".nav-buttons")) return;
        e.preventDefault();
        controller.setDragging(true);
        const t = e.touches[0];
        handleInput(t.clientY);
    }

    function onTouchMove(e: TouchEvent) {
        if (isDragging) {
            e.preventDefault();
            const t = e.touches[0];
            handleInput(t.clientX);
        }
    }

    function onTouchEnd() {
        controller.setDragging(false);
    }
</script>

<div class="vertical-skin">
    <div class="main-content">
        <!-- Status / Current Temp Side -->
        <div class="info-side">
            <div class="temp-display">
                {targetTemp.toFixed(1)}<span class="unit">°</span>
            </div>
            <div class="status" style:color={statusColor}>
                {statusText}
            </div>
            <div class="current-readout">
                <iconify-icon icon="mdi:thermometer" width="14"></iconify-icon>
                {currentTemp}°
            </div>
        </div>

        <!-- Slider Side -->
        <div class="slider-container">
            <!-- svelte-ignore a11y_no_static_element_interactions -->
            <div
                class="slider-track-bg"
                bind:this={trackElement}
                onmousedown={onMouseDown}
                ontouchstart={onTouchStart}
                ontouchmove={onTouchMove}
                ontouchend={onTouchEnd}
            >
                <!-- Active Fill -->
                <div
                    class="slider-fill"
                    style="height: {targetPercent}%; background: {hvacMode ===
                    'off'
                        ? 'var(--text-muted)'
                        : statusColor}"
                ></div>

                <!-- Handle -->
                <div class="slider-handle" style="bottom: {targetPercent}%;">
                    <div
                        class="handle-knob"
                        style:background={statusColor}
                    ></div>
                </div>

                <!-- Current Temp Indicator -->
                {#if currentTemp != null}
                    <div
                        class="current-indicator"
                        style="bottom: {currentPercent}%;"
                    >
                        <div class="current-dot"></div>
                    </div>
                {/if}
            </div>
        </div>
    </div>

    <!-- Controls -->
    <div class="controls-wrapper">
        <ThermostatControls
            {controller}
            {entity}
            {hvacMode}
            {currentPresetMode}
        />
    </div>
</div>

<style>
    .vertical-skin {
        display: flex;
        flex-direction: column;
        width: 100%;
        height: 100%;
        position: relative;
        padding: 1rem;
        gap: 1rem;
    }

    .main-content {
        flex: 1;
        display: flex;
        gap: 1.5rem;
        align-items: center;
        justify-content: center;
        width: 100%;
        min-height: 0;
    }

    .info-side {
        display: flex;
        flex-direction: column;
        align-items: center; /* Change to center since we are side-by-side or stacked */
        justify-content: center;
        text-align: center;
    }

    .slider-container {
        height: 100%;
        max-height: 220px;
        width: 48px;
        display: flex;
        justify-content: center;
        position: relative;
    }

    .slider-track-bg {
        width: 12px;
        height: 100%;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 6px;
        position: relative;
        cursor: pointer;
        /* Increase hit area */
    }

    /* Pseudo element for wider hit area */
    .slider-track-bg::after {
        content: "";
        position: absolute;
        top: 0;
        left: -18px;
        right: -18px;
        bottom: 0;
        z-index: 1;
    }

    .slider-fill {
        width: 100%;
        border-radius: 6px;
        position: absolute;
        bottom: 0;
        left: 0;
        transition:
            height 0.1s linear,
            background 0.2s;
        pointer-events: none;
    }

    .slider-handle {
        position: absolute;
        left: 50%;
        transform: translate(
            -50%,
            50%
        ); /* Center on bottom position? No, bottom coords. translate y+50% pushes it down. We want center. */
        transform: translate(-50%, 50%);
        width: 32px;
        height: 32px;
        pointer-events: none;
        transition: bottom 0.1s linear;
        z-index: 2;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .handle-knob {
        width: 24px;
        height: 24px;
        background: #fff;
        border: 3px solid var(--bg-card);
        border-radius: 50%;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
    }

    .current-indicator {
        position: absolute;
        left: 50%;
        transform: translate(-50%, 50%);
        width: 100%;
        pointer-events: none;
        transition: bottom 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
        z-index: 3;
        display: flex;
        justify-content: center;
    }

    .current-dot {
        width: 8px;
        height: 8px;
        background: var(--text-primary);
        border: 1px solid var(--bg-card);
        border-radius: 50%;
        transform: translateX(12px); /* Offset to side */
    }

    .temp-display {
        font-size: 3rem;
        font-weight: 700;
        line-height: 1;
        font-variant-numeric: tabular-nums;
    }

    .unit {
        font-size: 0.5em;
        vertical-align: top;
        color: var(--text-muted);
    }
    .status {
        font-size: 1rem;
        margin-top: 4px;
        font-weight: 500;
    }
    .current-readout {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 0.9rem;
        color: var(--text-muted);
        margin-top: 8px;
        background: rgba(0, 0, 0, 0.1);
        padding: 2px 8px;
        border-radius: 12px;
    }

    .controls-wrapper {
        width: 100%;
        display: flex;
        justify-content: center;
    }

    @container (aspect-ratio > 1.2) {
        .vertical-skin {
            flex-direction: row;
            align-items: center;
        }
        .main-content {
            flex-direction: row;
            justify-content: space-evenly;
        }
        .controls-wrapper {
            width: auto;
        }
    }
</style>
