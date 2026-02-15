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
        padding: 5cqmin;
        gap: 4cqmin;
        align-items: center;

        /* Match Device Card 'Off' State */
        background: var(
            --card-background,
            var(--glass-surface, rgba(255, 255, 255, 0.05))
        );
        backdrop-filter: var(--glass-blur, blur(12px));
        -webkit-backdrop-filter: var(--glass-blur, blur(12px));
        border: 1px solid var(--border-primary, rgba(255, 255, 255, 0.1));
        border-radius: var(--ts-radius-outer, 24px);

        /* Subtle shadow */
        box-shadow:
            0 10px 30px rgba(0, 0, 0, 0.2),
            inset 0 0 0 1px rgba(255, 255, 255, 0.05);

        container-type: size;
        overflow: hidden;
    }

    /* Info Section */
    .info-section {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: flex-start;
        flex-shrink: 0;
        min-width: 25cqw;
    }

    .temp-readout {
        display: flex;
        flex-direction: column;
        align-items: flex-start; /* Align big number and status to start */
    }

    .main-temp {
        font-size: 18cqmin; /* Big number */
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
        font-size: 5cqmin;
        font-weight: 600;
        margin-top: 0.5cqmin;
        text-transform: capitalize;
    }

    .current-mini {
        margin-top: 2cqmin;
        display: flex;
        flex-direction: column;
        gap: 2px;
    }

    .current-mini .label {
        font-size: 3.5cqmin;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        color: var(--ts-text-secondary);
    }

    .current-mini .val {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 5cqmin;
        color: var(--ts-text-primary);
    }

    /* Interaction Section */
    .interaction-section {
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: center;
        gap: 4cqmin;
        height: 100%;
        min-width: 0; /* Flexbox trick */
    }

    /* Slider */
    .slider-container {
        width: 100%;
        height: 12cqmin;
        max-height: 48px;
        display: flex;
        align-items: center;
        position: relative;
    }

    .slider-track-bg {
        width: 100%;
        height: 30%; /* Slightly thicker */
        background: var(--ts-bg-track, rgba(0, 0, 0, 0.2));
        border-radius: 999px;
        position: relative;
        cursor: pointer;
        box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .slider-track-bg::after {
        content: "";
        position: absolute;
        top: -20px;
        bottom: -20px;
        left: 0;
        right: 0;
        z-index: 1;
    }

    .slider-fill {
        height: 100%;
        border-radius: 999px;
        position: absolute;
        top: 0;
        left: 0;
        transition:
            width 0.1s linear,
            background 0.2s;
        pointer-events: none;
        opacity: 0.6;
    }

    .slider-handle {
        position: absolute;
        top: 50%;
        transform: translate(-50%, -50%);
        width: 8cqmin;
        height: 8cqmin;
        pointer-events: none;
        transition: left 0.1s linear;
        z-index: 2;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .handle-knob {
        width: 70%;
        height: 70%;
        background: #fff;
        border: 2px solid rgba(0, 0, 0, 0.1);
        border-radius: 50%;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
    }

    /* Current Temp Pip */
    .current-indicator {
        position: absolute;
        top: 50%;
        transform: translate(-50%, -50%);
        height: 140%; /* Taller than track */
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
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
    }

    .controls-wrapper {
        width: 100%;
        display: flex;
        justify-content: flex-start; /* Align controls to left of their container */
    }

    /* Responsive */
    @container (max-width: 250px) {
        .horizontal-skin {
            flex-direction: column;
            align-items: stretch;
            padding: 3cqmin;
            gap: 2cqmin;
        }

        .info-section {
            align-items: center;
            text-align: center;
            min-width: unset;
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
