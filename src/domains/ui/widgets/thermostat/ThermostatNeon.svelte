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

    // Geometry - Internal fixed coordinate system
    const logicalSize = 300;
    const cx = logicalSize / 2;
    const cy = logicalSize / 2;
    const r = (logicalSize - 60) / 2;
    const startAngle = 140;
    const endAngle = 400;

    // Helper: Polar to Cartesian
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
        const clamped = Math.max(minTemp, Math.min(maxTemp, value));
        const ratio = (clamped - minTemp) / (maxTemp - minTemp);
        return startAngle + ratio * (endAngle - startAngle);
    }

    function angleToValue(angle: number) {
        // ... (standard normalizing logic)
        let normalized = angle;
        if (normalized < startAngle) normalized += 360;
        if (normalized < startAngle) normalized = startAngle;
        if (normalized > endAngle) normalized = endAngle;
        const ratio = (normalized - startAngle) / (endAngle - startAngle);
        const rawValue = minTemp + ratio * (maxTemp - minTemp);
        return Math.round(rawValue / step) * step;
    }

    let currentAngle = $derived(valueToAngle(targetTemp));
    let mainPath = $derived(describeArc(cx, cy, r, startAngle, endAngle));
    let activePath = $derived(describeArc(cx, cy, r, startAngle, currentAngle));

    // Glow Color
    let glowColor = $derived.by(() => {
        const action = entity.attributes.hvac_action;
        if (action === "heating") return "#ff3d00"; // Deep Orange/Red
        if (action === "cooling") return "#00b0ff"; // Deep Sky Blue
        if (hvacMode === "off") return "#444";
        return "#ffffff";
    });

    let currentTempPos = $derived(
        polarToCartesian(cx, cy, r - 25, valueToAngle(currentTemp || minTemp)),
    );

    // Input Handling
    let svgElement: SVGSVGElement;
    function handleInput(clientX: number, clientY: number) {
        if (!svgElement) return;
        const rect = svgElement.getBoundingClientRect();

        // Responsive input calculation
        const dx = clientX - (rect.left + rect.width / 2);
        const dy = clientY - (rect.top + rect.height / 2);

        let angle = (Math.atan2(dy, dx) * 180) / Math.PI;
        angle = angle + 90;
        if (angle < 0) angle += 360;

        // Gap logic
        let effectiveAngle = angle;
        if (angle < 140 && angle > 40) {
            // In gap
            if (angle < 90) effectiveAngle = 40;
            else effectiveAngle = 140;
        }

        let newVal = angleToValue(
            effectiveAngle < 140 ? effectiveAngle + 360 : effectiveAngle,
        );
        controller.setTemperature(newVal);
    }

    function onMouseDown(e: MouseEvent) {
        if ((e.target as Element).closest(".nav-buttons")) return;
        controller.setDragging(true);
        handleInput(e.clientX, e.clientY);
        window.addEventListener("mousemove", onMouseMove);
        window.addEventListener("mouseup", onMouseUp);
    }
    function onMouseMove(e: MouseEvent) {
        if (isDragging) {
            e.preventDefault();
            handleInput(e.clientX, e.clientY);
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
        handleInput(t.clientX, t.clientY);
    }
    function onTouchMove(e: TouchEvent) {
        if (isDragging) {
            e.preventDefault();
            const t = e.touches[0];
            handleInput(t.clientX, t.clientY);
        }
    }
    function onTouchEnd() {
        controller.setDragging(false);
    }
</script>

<div class="neon-skin">
    <!-- Flexible Container for Gauge -->
    <div class="dial-container">
        <!-- SVG Dial -->
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <svg
            viewBox={`0 0 ${logicalSize} ${logicalSize}`}
            preserveAspectRatio="xMidYMid meet"
            bind:this={svgElement}
            onmousedown={onMouseDown}
            ontouchstart={onTouchStart}
            ontouchmove={onTouchMove}
            ontouchend={onTouchEnd}
            class="neon-svg"
            style="cursor: pointer;"
        >
            <defs>
                <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="8" result="coloredBlur" />
                    <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>

            <!-- Background Track (Dark) -->
            <path
                d={mainPath}
                stroke="#222"
                stroke-width="12"
                fill="none"
                stroke-linecap="round"
            />

            <!-- Active Neon Path -->
            {#if hvacMode !== "off"}
                <path
                    d={activePath}
                    stroke={glowColor}
                    stroke-width="12"
                    fill="none"
                    stroke-linecap="round"
                    filter="url(#glow)"
                    opacity="0.6"
                />
                <path
                    d={activePath}
                    stroke={glowColor}
                    stroke-width="6"
                    fill="none"
                    stroke-linecap="round"
                />

                <!-- Handle (Glowing Orb) -->
                <circle
                    cx={polarToCartesian(cx, cy, r, currentAngle).x}
                    cy={polarToCartesian(cx, cy, r, currentAngle).y}
                    r="12"
                    fill="#fff"
                    filter="url(#glow)"
                />
            {/if}

            <!-- Current Temp Marker (Small dot inside) -->
            {#if currentTemp}
                <circle
                    cx={currentTempPos.x}
                    cy={currentTempPos.y}
                    r="4"
                    fill="#666"
                />
            {/if}

            <!-- Center Info Group -->
            <!-- Target Temp (Centered) -->
            <text
                x={cx}
                y={cy}
                text-anchor="middle"
                dominant-baseline="central"
                fill="var(--text-primary)"
                font-size="64"
                font-weight="800"
                style="pointer-events: none; text-shadow: 0 0 20px {glowColor}"
            >
                {typeof targetTemp === "number" ? targetTemp.toFixed(1) : "--"}
                <tspan font-size="32" dy="-20">°</tspan>
            </text>

            <!-- Current Temp & Status Icon (Below) -->
            <foreignObject x={cx - 100} y={cy + 40} width="200" height="60">
                <div class="meta-container">
                    <div class="current-temp">
                        {currentTemp}°
                    </div>
                </div>
            </foreignObject>
        </svg>
    </div>

    <!-- Controls pushed to bottom -->
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
    .neon-skin {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        background: var(--bg-card);
        position: relative;
        overflow: hidden;
    }

    .dial-container {
        flex: 1;
        min-height: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        padding: 10px;
    }

    .neon-svg {
        width: 100%;
        height: 100%;
        max-width: 100%;
        max-height: 100%;
    }

    .meta-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
        color: var(--text-secondary);
    }

    .current-temp {
        font-size: 1.2rem;
        font-weight: 500;
        opacity: 0.8;
    }

    .controls-wrapper {
        flex: 0 0 auto;
        width: 100%;
        display: flex;
        justify-content: center;
        padding-bottom: 15px;
        z-index: 10;
        min-height: 60px;
    }
</style>
