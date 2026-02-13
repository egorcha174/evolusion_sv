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

    // Vertical slider logic
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
        if ((e.target as Element).closest(".nav-buttons")) return;
        e.preventDefault();
        controller.setDragging(true);
        const t = e.touches[0];
        handleInput(t.clientY);
    }

    function onTouchMove(e: TouchEvent) {
        if (controller.isDragging) {
            e.preventDefault();
            const t = e.touches[0];
            handleInput(t.clientX); // Should be clientY for vertical? Correction below
            handleInput(t.clientY);
        }
    }

    function onTouchEnd() {
        controller.setDragging(false);
    }
</script>

<div class="vertical-skin">
    <div class="main-content">
        <!-- Info Side -->
        <div class="info-side">
            <div class="temp-display">
                {controller.targetTemp.toFixed(1)}<span class="unit">°</span>
            </div>
            <div class="status" style:color={statusColor}>
                {statusText}
            </div>

            <!-- Icon/Mode indicator at top of info -->
            <div class="mode-icon" style:color={statusColor}>
                <iconify-icon icon="mdi:thermostat" width="24"></iconify-icon>
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
                    style="height: {targetPercent}%; background: {controller.hvacMode ===
                    'off'
                        ? 'var(--ts-accent-idle)'
                        : statusColor}"
                ></div>

                <!-- Handle -->
                <div class="slider-handle" style="bottom: {targetPercent}%;">
                    <div
                        class="handle-knob"
                        style:background={statusColor}
                    ></div>
                </div>

                <!-- Current Temp Marker -->
                {#if entity.attributes.current_temperature != null}
                    <div
                        class="current-indicator"
                        style="bottom: {currentPercent}%;"
                    >
                        <div class="current-label">
                            {entity.attributes.current_temperature}°
                        </div>
                        <div class="current-line"></div>
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
            hvacMode={controller.hvacMode}
            currentPresetMode={controller.presetMode}
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
        gap: 0.5rem;
        background: var(
            --ts-bg-surface
        ); /* Optional if widget doesn't set it */
    }

    .main-content {
        flex: 1;
        display: flex;
        gap: 1rem;
        align-items: stretch;
        justify-content: space-between;
        width: 100%;
        min-height: 0;
    }

    .info-side {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        justify-content: flex-end; /* Bottom align target temp */
        text-align: left;
        padding-bottom: 2rem;
        flex: 1;
    }

    .temp-display {
        font-size: var(--ts-font-xl);
        font-weight: 700;
        line-height: 1;
        font-variant-numeric: tabular-nums;
        color: var(--ts-text-primary);
    }

    .unit {
        font-size: 0.5em;
        vertical-align: top;
        color: var(--ts-text-secondary);
    }

    .status {
        font-size: var(--ts-font-md);
        margin-top: 4px;
        font-weight: 600;
    }

    .mode-icon {
        margin-bottom: auto; /* Push to top */
        opacity: 0.8;
        padding-top: 1rem;
    }

    /* Slider */
    .slider-container {
        height: 100%;
        width: 60px; /* Wider for industrial look */
        position: relative;
        padding: 10px 0;
    }

    .slider-track-bg {
        width: 100%;
        height: 100%;
        background: var(--ts-bg-track);
        border-radius: var(--ts-radius-inner);
        position: relative;
        cursor: pointer;
        overflow: hidden; /* Clip fill */
    }

    .slider-fill {
        width: 100%;
        position: absolute;
        bottom: 0;
        left: 0;
        transition:
            height 0.1s linear,
            background 0.2s;
        pointer-events: none;
        opacity: 0.3;
    }

    .slider-handle {
        position: absolute;
        left: 0;
        width: 100%;
        height: 0; /* Just a position marker */
        pointer-events: none;
        transition: bottom 0.1s linear;
        z-index: 2;
    }

    .handle-knob {
        width: 100%;
        height: 4px;
        position: absolute;
        top: -2px;
        background: #fff;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
    }

    /* Current Temp */
    .current-indicator {
        position: absolute;
        right: 0; /* Align to right edge inside track? Or outside? */
        width: 100%;
        pointer-events: none;
        transition: bottom 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
        z-index: 3;
        display: flex;
        align-items: center;
        justify-content: flex-end;
        padding-right: 4px;
    }

    .current-line {
        width: 50%;
        height: 2px;
        background: var(--ts-text-primary);
        opacity: 0.5;
    }

    .current-label {
        font-size: 0.75rem;
        font-weight: 600;
        color: var(--ts-text-primary);
        background: rgba(0, 0, 0, 0.5);
        padding: 2px 4px;
        border-radius: 4px;
        margin-right: 4px;
    }

    .controls-wrapper {
        width: 100%;
        display: flex;
        justify-content: center;
        padding-top: 0.5rem;
    }
</style>
