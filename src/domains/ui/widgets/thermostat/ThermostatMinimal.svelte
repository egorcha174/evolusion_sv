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
        entity: HAEntity;
        controller: ThermostatController;
        size?: number;
    }>();

    // Size props/constants
    const strokeWidth = 2; // Minimalist thin line
    let cx = $derived(size / 2);
    let cy = $derived(size / 2);
    let r = $derived((size - 40) / 2);
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

    // --- Visuals ---
    // Background Track (thin)
    let bgPath = $derived(describeArc(cx, cy, r, startAngle, endAngle));

    // Key Points (Min, Max, Current)
    let minPos = $derived(polarToCartesian(cx, cy, r + 15, startAngle));
    let maxPos = $derived(polarToCartesian(cx, cy, r + 15, endAngle));

    // Current Temp Marker
    let currentTemp = $derived(entity.attributes.current_temperature);
    let currentAngle = $derived(
        valueToAngle(currentTemp || controller.minTemp),
    );
    let currentPos = $derived(polarToCartesian(cx, cy, r, currentAngle));

    // Target Marker/Handle
    let targetAngle = $derived(valueToAngle(controller.targetTemp));
    let targetPos = $derived(polarToCartesian(cx, cy, r, targetAngle));

    // Colors
    let statusColor = $derived.by(() => {
        if (controller.hvacMode === "off") return "var(--ts-text-secondary)";
        return "var(--ts-text-primary)"; // Monochrome/Minimal
    });

    // Interaction
    let svgElement: SVGSVGElement;

    function handleInput(clientX: number, clientY: number) {
        if (!svgElement) return;
        const rect = svgElement.getBoundingClientRect();
        const dx = clientX - (rect.left + rect.width / 2);
        const dy = clientY - (rect.top + rect.height / 2);

        let angle = (Math.atan2(dy, dx) * 180) / Math.PI;
        angle = angle + 90;
        if (angle < 0) angle += 360;

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

<div class="minimal-skin">
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
            <!-- Background Track -->
            <path
                d={bgPath}
                fill="none"
                stroke="var(--ts-text-secondary)"
                stroke-width="1"
                stroke-dasharray="2 4"
                stroke-linecap="round"
                opacity="0.5"
            />

            <!-- Hit Area -->
            <path
                d={bgPath}
                fill="none"
                stroke="transparent"
                stroke-width="40"
                stroke-linecap="round"
                style="cursor: pointer;"
            />

            <!-- Labels (Min/Max) -->
            <text
                x={minPos.x}
                y={minPos.y}
                text-anchor="middle"
                dominant-baseline="middle"
                class="tick-label">{controller.minTemp}</text
            >
            <text
                x={maxPos.x}
                y={maxPos.y}
                text-anchor="middle"
                dominant-baseline="middle"
                class="tick-label">{controller.maxTemp}</text
            >

            <!-- Current Temp Marker (Line) -->
            {#if currentTemp != null}
                <line
                    x1={cx}
                    y1={cy}
                    x2={currentPos.x}
                    y2={currentPos.y}
                    stroke="var(--ts-text-secondary)"
                    stroke-width="1"
                    stroke-dasharray="2 2"
                />
                <text
                    x={cx}
                    y={cy + r * 0.4}
                    text-anchor="middle"
                    class="current-label"
                >
                    Currently {currentTemp}°
                </text>
            {/if}

            <!-- Target Handle (Triangle/Arrow) -->
            <!-- Simple line for minimal look -->
            <line
                x1={cx}
                y1={cy}
                x2={targetPos.x}
                y2={targetPos.y}
                stroke={statusColor}
                stroke-width="2"
            />
            <circle
                cx={targetPos.x}
                cy={targetPos.y}
                r="3"
                fill={statusColor}
            />
        </svg>

        <!-- Center Info -->
        <div class="dial-content">
            <div class="temp-display" style:color={statusColor}>
                {controller.targetTemp.toFixed(1)}
            </div>
            <div class="status">
                {controller.hvacMode}
            </div>
        </div>
    </div>

    <!-- Minimal Controls -->
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
    .minimal-skin {
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 100%;
        height: 100%;
        justify-content: center;
        position: relative;
        font-family: monospace, sans-serif; /* Matrix style */
        color: var(--ts-text-primary);
    }

    .dial-container {
        position: relative;
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
        font-size: 5rem;
        font-weight: 300;
        line-height: 1;
        letter-spacing: -2px;
    }

    .status {
        font-size: 0.8rem;
        text-transform: uppercase;
        letter-spacing: 2px;
        opacity: 0.7;
        margin-top: 10px;
    }

    .tick-label {
        font-size: 0.7rem;
        fill: var(--ts-text-secondary);
        font-family: monospace;
    }

    .current-label {
        font-size: 0.75rem;
        fill: var(--ts-text-secondary);
        font-family: monospace;
        text-transform: uppercase;
        letter-spacing: 1px;
    }

    .controls-wrapper {
        position: absolute;
        bottom: 1rem;
        width: 100%;
        display: flex;
        justify-content: center;
        opacity: 0.5;
        transition: opacity 0.2s;
    }

    .controls-wrapper:hover {
        opacity: 1;
    }

    /* Responsive */
    @container (max-width: 200px) {
        .temp-display {
            font-size: 3rem;
        }
    }
</style>
