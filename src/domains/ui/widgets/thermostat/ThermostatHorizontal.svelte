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

    // Horizontal slider logic
    // Left is minTemp, Right is maxTemp
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

    function handleInput(clientX: number) {
        if (!trackElement) return;
        const rect = trackElement.getBoundingClientRect();
        // Calculate percent from left
        const relativeX = clientX - rect.left;
        const percentX = (relativeX / rect.width) * 100;

        let newVal = percentToValue(percentX);
        controller.setTemperature(newVal);
    }

    function onMouseDown(e: MouseEvent) {
        if ((e.target as Element).closest(".nav-buttons")) return;
        controller.setDragging(true);
        handleInput(e.clientX);
        window.addEventListener("mousemove", onMouseMove);
        window.addEventListener("mouseup", onMouseUp);
    }

    function onMouseMove(e: MouseEvent) {
        if (isDragging) {
            e.preventDefault();
            handleInput(e.clientX);
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
        handleInput(t.clientX);
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

<div class="horizontal-skin">
    <div class="info-top">
        <div class="temp-readout">
            <span class="main-temp"
                >{targetTemp.toFixed(1)}<span class="unit">°</span></span
            >
            <span class="status-sub" style:color={statusColor}
                >{statusText}</span
            >
        </div>
        <div class="current-mini">
            <iconify-icon icon="mdi:thermometer" width="14"></iconify-icon>
            {currentTemp}°
        </div>
    </div>

    <!-- Slider -->
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
                style="width: {targetPercent}%; background: {hvacMode === 'off'
                    ? 'var(--text-muted)'
                    : statusColor}"
            ></div>

            <!-- Handle -->
            <div class="slider-handle" style="left: {targetPercent}%;">
                <div class="handle-knob" style:background={statusColor}></div>
            </div>

            <!-- Current Temp Indicator -->
            {#if currentTemp != null}
                <div class="current-indicator" style="left: {currentPercent}%;">
                    <div class="current-dot"></div>
                </div>
            {/if}
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
    .horizontal-skin {
        display: flex;
        flex-direction: column;
        width: 100%;
        height: 100%;
        position: relative;
        padding: 1rem;
        gap: 1.5rem;
        justify-content: space-between;
    }

    .info-top {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
        padding: 0 0.5rem;
    }

    .temp-readout {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
    }

    .main-temp {
        font-size: 2.5rem;
        font-weight: 700;
        line-height: 1;
        font-variant-numeric: tabular-nums;
    }

    .status-sub {
        font-size: 0.9rem;
        font-weight: 500;
    }

    .unit {
        font-size: 0.5em;
        vertical-align: top;
        color: var(--text-muted);
    }

    .current-mini {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 0.9rem;
        color: var(--text-muted);
        background: rgba(0, 0, 0, 0.1);
        padding: 4px 10px;
        border-radius: 12px;
    }

    .slider-container {
        width: 100%;
        height: 48px;
        display: flex;
        align-items: center;
        position: relative;
    }

    .slider-track-bg {
        width: 100%;
        height: 12px;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 6px;
        position: relative;
        cursor: pointer;
    }

    .slider-track-bg::after {
        content: "";
        position: absolute;
        top: -18px;
        bottom: -18px;
        left: 0;
        right: 0;
        z-index: 1;
    }

    .slider-fill {
        height: 100%;
        border-radius: 6px;
        position: absolute;
        top: 0;
        left: 0;
        transition:
            width 0.1s linear,
            background 0.2s;
        pointer-events: none;
    }

    .slider-handle {
        position: absolute;
        top: 50%;
        transform: translate(-50%, -50%);
        width: 32px;
        height: 32px;
        pointer-events: none;
        transition: left 0.1s linear;
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
        top: 50%;
        transform: translate(-50%, -50%);
        height: 100%;
        pointer-events: none;
        transition: left 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
        z-index: 3;
        display: flex;
        align-items: center;
    }

    .current-dot {
        width: 8px;
        height: 8px;
        background: var(--text-primary);
        border: 1px solid var(--bg-card);
        border-radius: 50%;
        transform: translateY(12px); /* Offset below */
    }

    .controls-wrapper {
        width: 100%;
        display: flex;
        justify-content: center;
    }
</style>
