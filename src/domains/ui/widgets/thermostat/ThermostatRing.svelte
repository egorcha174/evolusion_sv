<script lang="ts">
    import { t } from "svelte-i18n";
    import "iconify-icon";
    import type { HAEntity } from "$lib/types";
    import { type ThermostatController } from "./core/thermostat.svelte";
    import ThermostatControls from "./ThermostatControls.svelte";

    let {
        entity,
        controller,
        size = 260,
    } = $props<{
        entity: HAEntity; // Still needed for some specific attributes if not in controller
        controller: ThermostatController;
        size?: number;
    }>();

    // Size props/constants
    const strokeWidth = 24;
    let cx = $derived(size / 2);
    let cy = $derived(size / 2);
    let r = $derived((size - strokeWidth) / 2);
    const startAngle = 225;
    const endAngle = 495;

    // --- Helpers (Geometry) ---
    function polarToCartesian(
        centerX: number,
        centerY: number,
        radius: number,
        angleInDegrees: number,
    ) {
        const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
        return {
            x: centerX + radius * Math.cos(angleInRadians),
            y: centerY + radius * Math.sin(angleInRadians),
        };
    }

    function describeArc(
        x: number,
        y: number,
        radius: number,
        startAngle: number,
        endAngle: number,
    ) {
        const start = polarToCartesian(x, y, radius, endAngle);
        const end = polarToCartesian(x, y, radius, startAngle);
        const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
        return [
            "M",
            start.x,
            start.y,
            "A",
            radius,
            radius,
            0,
            largeArcFlag,
            0,
            end.x,
            end.y,
        ].join(" ");
    }

    function valueToAngle(value: number) {
        const min = controller.minTemp;
        const max = controller.maxTemp;
        const clamped = Math.max(min, Math.min(max, value));
        const ratio = (clamped - min) / (max - min);
        return startAngle + ratio * (endAngle - startAngle);
    }

    function angleToValue(angle: number) {
        let normalized = angle;
        if (normalized < startAngle) normalized += 360;
        if (normalized < startAngle) normalized = startAngle;
        if (normalized > endAngle) normalized = endAngle;

        const min = controller.minTemp;
        const max = controller.maxTemp;
        const ratio = (normalized - startAngle) / (endAngle - startAngle);
        const rawValue = min + ratio * (max - min);
        return Math.round(rawValue / controller.step) * controller.step;
    }

    // --- Derived Visuals ---
    // Background & Active Arc
    let bgPath = $derived(describeArc(cx, cy, r, startAngle, endAngle));
    let currentAngle = $derived(valueToAngle(controller.targetTemp));
    let activePath = $derived(describeArc(cx, cy, r, startAngle, currentAngle));

    // Handle Position
    let handlePos = $derived(polarToCartesian(cx, cy, r, currentAngle));

    // Current Temp Indicator (Orbiting Dot)
    let currentTempR = $derived(r + 24);
    // Use entity.attributes.current_temperature directly or logic from controller if added
    let currentTemp = $derived(entity.attributes.current_temperature);
    let currentTempAngle = $derived(
        valueToAngle(currentTemp || controller.minTemp),
    );
    let currentTempPos = $derived(
        polarToCartesian(cx, cy, currentTempR, currentTempAngle),
    );

    // Colors & Status
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

    // --- Interaction ---
    let svgElement: SVGSVGElement;

    function handleInput(clientX: number, clientY: number) {
        if (!svgElement) return;
        const rect = svgElement.getBoundingClientRect();
        const dx = clientX - (rect.left + rect.width / 2);
        const dy = clientY - (rect.top + rect.height / 2);

        let angle = (Math.atan2(dy, dx) * 180) / Math.PI;
        angle = angle + 90;
        if (angle < 0) angle += 360;

        // Gap jumping logic
        let touchAngle = angle;
        let val = angleToValue(
            touchAngle >= 135 ? touchAngle : touchAngle + 360,
        );
        controller.setTemperature(val);
    }

    function onMouseDown(e: MouseEvent) {
        if ((e.target as Element).closest(".nav-buttons")) return;
        controller.setDragging(true);
        handleInput(e.clientX, e.clientY);
        window.addEventListener("mousemove", onMouseMove);
        window.addEventListener("mouseup", onMouseUp);
    }

    function onMouseMove(e: MouseEvent) {
        if (controller.isDragging) {
            e.preventDefault();
            handleInput(e.clientX, e.clientY);
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
        handleInput(t.clientX, t.clientY);
    }

    function onTouchMove(e: TouchEvent) {
        if (controller.isDragging) {
            e.preventDefault();
            const t = e.touches[0];
            handleInput(t.clientX, t.clientY);
        }
    }

    function onTouchEnd() {
        controller.setDragging(false);
    }
</script>

<div class="ring-skin">
    <div class="dial-container" style="width: {size}px; height: {size}px;">
        <!-- Dial SVG -->
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <svg
            class="dial-svg"
            viewBox={`0 0 ${size} ${size}`}
            bind:this={svgElement}
            onmousedown={onMouseDown}
            ontouchstart={onTouchStart}
            ontouchmove={onTouchMove}
            ontouchend={onTouchEnd}
        >
            <defs>
                <linearGradient
                    id="ts-gradient"
                    gradientUnits="userSpaceOnUse"
                    x1="0"
                    y1={size}
                    x2={size}
                    y2="0"
                >
                    <stop offset="0%" stop-color="var(--ts-accent-cooling)" />
                    <stop offset="50%" stop-color="#ae38ff" />
                    <stop offset="100%" stop-color="var(--ts-accent-heating)" />
                </linearGradient>
            </defs>

            <!-- Background Track -->
            <path
                d={bgPath}
                fill="none"
                stroke="var(--ts-bg-track)"
                stroke-width={strokeWidth}
                stroke-linecap="round"
            />

            <!-- Active Arc -->
            <path
                d={activePath}
                fill="none"
                stroke={controller.hvacMode === "off"
                    ? "var(--ts-accent-idle)"
                    : "url(#ts-gradient)"}
                stroke-width={strokeWidth}
                stroke-linecap="round"
            />

            <!-- Hit Area -->
            <path
                d={bgPath}
                fill="none"
                stroke="transparent"
                stroke-width="50"
                stroke-linecap="round"
                style="cursor: pointer;"
            />

            <!-- Handle -->
            {#if controller.hvacMode !== "off"}
                <g
                    transform={`translate(${handlePos.x}, ${handlePos.y})`}
                    style="pointer-events: none;"
                >
                    <circle
                        r="12"
                        fill="var(--ts-text-primary)"
                        filter="drop-shadow(var(--ts-shadow-knob))"
                    />
                    <circle r="4" fill={statusColor} />
                </g>
            {/if}

            <!-- Current Temp Dot -->
            {#if currentTemp != null}
                <g
                    transform={`translate(${currentTempPos.x}, ${currentTempPos.y})`}
                    style="pointer-events: none; transition: transform 0.5s ease;"
                >
                    <circle
                        r="6"
                        fill="var(--ts-text-primary)"
                        stroke="var(--ts-bg-surface)"
                        stroke-width="2"
                    />
                </g>
            {/if}
        </svg>

        <!-- Center Info -->
        <div class="dial-content">
            <div class="temp-display">
                {controller.targetTemp.toFixed(1)}<span class="unit">°</span>
            </div>
            <div class="status" style:color={statusColor}>
                {statusText}
            </div>
            <div class="current-readout">
                <iconify-icon icon="mdi:thermometer" width="14"></iconify-icon>
                {currentTemp}°
            </div>
        </div>
    </div>

    <!-- Controls (Mode, Preset, etc.) -->
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
    .ring-skin {
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 100%;
        height: 100%;
        justify-content: center;
        position: relative;
    }

    .dial-container {
        position: relative;
        /* Width/Height set inline */
        max-width: 100%;
        max-height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        aspect-ratio: 1;
    }

    .dial-svg {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        overflow: visible;
        z-index: 2;
    }

    .dial-content {
        position: relative;
        z-index: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        gap: 0;
        pointer-events: none;
    }

    .temp-display {
        font-size: var(--ts-font-xl);
        font-weight: 700;
        line-height: 1;
        color: var(--ts-text-primary);
        font-variant-numeric: tabular-nums;
        transition: font-size 0.2s;
    }

    .unit {
        font-size: 0.5em;
        vertical-align: top;
        color: var(--ts-text-secondary);
        font-weight: 500;
    }

    .status {
        font-size: var(--ts-font-md);
        font-weight: 600;
        text-transform: capitalize;
        min-height: 1.5rem;
        transition: font-size 0.2s;
        margin-top: 4px;
    }

    .current-readout {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: var(--ts-font-sm);
        color: var(--ts-text-secondary);
        margin-top: 8px;
        background: rgba(0, 0, 0, 0.1);
        padding: 2px 8px;
        border-radius: 12px;
        transition: all 0.2s;
    }

    .controls-wrapper {
        position: absolute;
        bottom: 1rem;
        width: 100%;
        display: flex;
        justify-content: center;
    }

    /* Responsive Logic */
    @container (max-width: 200px) or (max-height: 200px) {
        .controls-wrapper {
            opacity: 0;
            pointer-events: none;
        }
        .temp-display {
            font-size: var(--ts-font-lg);
        }
        .status {
            font-size: var(--ts-font-sm);
            min-height: auto;
        }
    }

    @container (aspect-ratio > 1.5) and (min-height: 120px) {
        .ring-skin {
            flex-direction: row;
            justify-content: space-evenly;
            padding: 0 1rem;
        }
        .dial-container {
            height: 100%;
            width: auto !important; /* Override inline style */
            aspect-ratio: 1;
        }
        .controls-wrapper {
            position: relative;
            bottom: auto;
            width: auto;
            opacity: 1 !important;
            pointer-events: auto !important;
        }
    }
</style>
