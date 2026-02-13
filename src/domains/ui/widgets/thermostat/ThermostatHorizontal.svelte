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
    let statusText = $derived(
        controller.hvacMode === "off"
            ? $t("common.off")
            : $t(
                  `widgets.thermostat.actions.${entity.attributes.hvac_action || "idle"}`,
              ),
    );

    let statusColor = $derived.by(() => {
        if (controller.hvacMode === "off") return "var(--ts-accent-idle)";
        const action = entity.attributes.hvac_action;
        if (action === "heating") return "var(--ts-accent-heating)";
        if (action === "cooling") return "var(--ts-accent-cooling)";
        return "var(--ts-text-primary)";
    });

    // Horizontal slider logic
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
    let currentPercent = $derived(
        valueToPercent(
            entity.attributes.current_temperature || controller.minTemp,
        ),
    );

    let trackElement: HTMLDivElement;

    function handleInput(clientX: number) {
        if (!trackElement) return;
        const rect = trackElement.getBoundingClientRect();
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
        if (controller.isDragging) {
            e.preventDefault();
            handleInput(e.clientX);
        }
    }

    function onMouseUp() {
        controller.setDragging(false);
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("mouseup", onMouseUp);
    }

    function onTouchStart(e: TouchEvent) {
        if ((e.target as Element).closest(".nav-buttons")) return;
        e.preventDefault();
        controller.setDragging(true);
        const t = e.touches[0];
        handleInput(t.clientX);
    }

    function onTouchMove(e: TouchEvent) {
        if (controller.isDragging) {
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
    <!-- Left: Info -->
    <div class="info-section">
        <div class="temp-readout">
            <span class="main-temp"
                >{controller.targetTemp.toFixed(1)}<span class="unit">°</span
                ></span
            >
            <span class="status-sub" style:color={statusColor}
                >{statusText}</span
            >
        </div>

        <div class="current-mini">
            <span class="label">Current</span>
            <span class="val">
                <iconify-icon icon="mdi:thermometer" width="14"></iconify-icon>
                {entity.attributes.current_temperature}°
            </span>
        </div>
    </div>

    <!-- Right: Controls & Slider -->
    <div class="interaction-section">
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
                    style="width: {targetPercent}%; background: {controller.hvacMode ===
                    'off'
                        ? 'var(--ts-accent-idle)'
                        : statusColor}"
                ></div>

                <!-- Handle -->
                <div class="slider-handle" style="left: {targetPercent}%;">
                    <div
                        class="handle-knob"
                        style:background={statusColor}
                    ></div>
                </div>

                <!-- Current Temp Indicator -->
                {#if entity.attributes.current_temperature != null}
                    <div
                        class="current-indicator"
                        style="left: {currentPercent}%;"
                    >
                        <div class="current-pip"></div>
                    </div>
                {/if}
            </div>
        </div>

        <!-- Controls -->
        <div class="controls-wrapper">
            <ThermostatControls
                {controller}
                {entity}
                hvacMode={controller.hvacMode}
                currentPresetMode={controller.presetMode}
            />
        </div>
    </div>
</div>

<style>
    .horizontal-skin {
        display: flex;
        flex-direction: row;
        width: 100%;
        height: 100%;
        position: relative;
        padding: 1.5rem;
        gap: 2rem;
        align-items: center;
        background: var(--ts-bg-surface);
    }

    /* Info Section */
    .info-section {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: flex-start;
        flex-shrink: 0;
        min-width: 120px;
    }

    .temp-readout {
        display: flex;
        flex-direction: column;
        align-items: flex-start; /* Align big number and status to start */
    }

    .main-temp {
        font-size: 4rem; /* Big number */
        font-weight: 700;
        line-height: 0.9;
        font-variant-numeric: tabular-nums;
        color: var(--ts-text-primary);
    }

    .unit {
        font-size: 0.4em;
        vertical-align: top;
        color: var(--ts-text-secondary);
        font-weight: 500;
    }

    .status-sub {
        font-size: 1rem;
        font-weight: 600;
        margin-top: 0.25rem;
        text-transform: capitalize;
    }

    .current-mini {
        margin-top: 1rem;
        display: flex;
        flex-direction: column;
        gap: 2px;
    }

    .current-mini .label {
        font-size: 0.7rem;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        color: var(--ts-text-secondary);
    }

    .current-mini .val {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 1.1rem;
        color: var(--ts-text-primary);
    }

    /* Interaction Section */
    .interaction-section {
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: center;
        gap: 1.5rem;
        height: 100%;
        min-width: 0; /* Flexbox trick */
    }

    /* Slider */
    .slider-container {
        width: 100%;
        height: 48px;
        display: flex;
        align-items: center;
        position: relative;
    }

    .slider-track-bg {
        width: 100%;
        height: 16px; /* Slightly thicker */
        background: var(--ts-bg-track);
        border-radius: 8px;
        position: relative;
        cursor: pointer;
    }

    .slider-track-bg::after {
        content: "";
        position: absolute;
        top: -16px;
        bottom: -16px;
        left: 0;
        right: 0;
        z-index: 1;
    }

    .slider-fill {
        height: 100%;
        border-radius: 8px;
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
        border: 3px solid var(--bg-card); /* Should match card bg, or use transparent border with box shadow */
        border-radius: 50%;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
    }

    /* Current Temp Pip */
    .current-indicator {
        position: absolute;
        top: 50%;
        transform: translate(-50%, -50%);
        height: 24px; /* Taller than track */
        pointer-events: none;
        transition: left 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
        z-index: 3;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .current-pip {
        width: 4px;
        height: 100%;
        background: var(--ts-text-primary);
        border-radius: 2px;
        opacity: 0.8;
    }

    .controls-wrapper {
        width: 100%;
        display: flex;
        justify-content: flex-start; /* Align controls to left of their container */
    }

    /* Responsive */
    @container (max-width: 400px) {
        .horizontal-skin {
            flex-direction: column;
            align-items: stretch;
            padding: 1rem;
            gap: 1rem;
        }

        .info-section {
            align-items: center;
            text-align: center;
        }

        .temp-readout,
        .current-mini {
            align-items: center;
        }

        .controls-wrapper {
            justify-content: center;
        }
    }
</style>
