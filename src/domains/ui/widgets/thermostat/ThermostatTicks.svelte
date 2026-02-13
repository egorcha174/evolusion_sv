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
    const r = (logicalSize - 60) / 2; // Inner radius for ticks
    const startAngle = 135;
    const endAngle = 405;

    // Ticks Generation
    let ticks = $derived.by(() => {
        const count = 40; // Total ticks
        const arr = [];
        for (let i = 0; i <= count; i++) {
            const ratio = i / count;
            const angle = startAngle + ratio * (endAngle - startAngle);
            const value = minTemp + ratio * (maxTemp - minTemp);

            // Determine if active (up to target temp)
            const isActive = value <= targetTemp;

            // Determine if major tick
            const isMajor = i % 5 === 0;

            arr.push({ angle, value, isActive, isMajor });
        }
        return arr;
    });

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

    // Interaction Logic
    function valueToAngle(value: number) {
        const clamped = Math.max(minTemp, Math.min(maxTemp, value));
        const ratio = (clamped - minTemp) / (maxTemp - minTemp);
        return startAngle + ratio * (endAngle - startAngle);
    }

    function angleToValue(angle: number) {
        let normalized = angle;
        if (normalized < startAngle) normalized += 360;
        if (normalized < startAngle) normalized = startAngle;
        if (normalized > endAngle) normalized = endAngle;
        const ratio = (normalized - startAngle) / (endAngle - startAngle);
        const rawValue = minTemp + ratio * (maxTemp - minTemp);
        return Math.round(rawValue / step) * step;
    }

    let currentAngle = $derived(valueToAngle(targetTemp));
    let svgElement: SVGSVGElement;

    function handleInput(clientX: number, clientY: number) {
        if (!svgElement) return;
        const rect = svgElement.getBoundingClientRect();

        // Calculate angle from center of the RECT (responsive)
        const dx = clientX - (rect.left + rect.width / 2);
        const dy = clientY - (rect.top + rect.height / 2);

        let angle = (Math.atan2(dy, dx) * 180) / Math.PI;
        angle = angle + 90;
        if (angle < 0) angle += 360;

        // Logic for gap at bottom (135 to 405 range means gap is approx bottom sector)
        let effectiveAngle = angle;
        if (angle < 135 && angle > 45) {
            // In gap - clamp to nearest
            if (angle < 90) effectiveAngle = 45;
            else effectiveAngle = 135;
        }

        let newVal = angleToValue(
            effectiveAngle < 135 ? effectiveAngle + 360 : effectiveAngle,
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

    // Status Color
    let statusColor = $derived.by(() => {
        if (hvacMode === "off") return "var(--text-muted)";
        const action = entity.attributes.hvac_action;
        if (action === "heating") return "#ff5252";
        if (action === "cooling") return "#448aff";
        return "var(--text-primary)";
    });
</script>

<div class="ticks-skin">
    <!-- Flexible Container for Gauge -->
    <div class="dial-container">
        <!-- SVG Dial with viewBox for responsiveness -->
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <svg
            class="dial-svg"
            viewBox={`0 0 ${logicalSize} ${logicalSize}`}
            preserveAspectRatio="xMidYMid meet"
            bind:this={svgElement}
            onmousedown={onMouseDown}
            ontouchstart={onTouchStart}
            ontouchmove={onTouchMove}
            ontouchend={onTouchEnd}
            style="cursor: pointer;"
        >
            <!-- Ticks -->
            {#each ticks as tick}
                {@const start = polarToCartesian(cx, cy, r, tick.angle)}
                {@const end = polarToCartesian(
                    cx,
                    cy,
                    r + (tick.isMajor ? 15 : 8),
                    tick.angle,
                )}
                <line
                    x1={start.x}
                    y1={start.y}
                    x2={end.x}
                    y2={end.y}
                    stroke={tick.isActive && hvacMode !== "off"
                        ? statusColor
                        : "rgba(255,255,255,0.2)"}
                    stroke-width={tick.isMajor ? 3 : 1}
                    stroke-linecap="round"
                    class="tick"
                />
                {#if tick.isMajor}
                    {@const textPos = polarToCartesian(
                        cx,
                        cy,
                        r + 35,
                        tick.angle,
                    )}
                    <text
                        x={textPos.x}
                        y={textPos.y}
                        text-anchor="middle"
                        dominant-baseline="middle"
                        fill="rgba(255,255,255,0.4)"
                        font-size="12"
                    >
                        {Math.round(tick.value)}
                    </text>
                {/if}
            {/each}

            <!-- Center Info -->
            <foreignObject x={cx - 100} y={cy - 60} width="200" height="120">
                <div class="center-info">
                    <span class="label">Target</span>
                    <span class="value" style:color={statusColor}
                        >{typeof targetTemp === "number"
                            ? targetTemp.toFixed(1)
                            : "--"}°</span
                    >
                    <span class="current">
                        {currentTemp}° <span class="dim">Current</span>
                    </span>
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
    .ticks-skin {
        display: flex;
        flex-direction: column;
        width: 100%;
        height: 100%;
        position: relative;
        overflow: hidden;
        background: radial-gradient(
            circle at center,
            rgba(255, 255, 255, 0.03) 0%,
            transparent 70%
        );
    }

    .dial-container {
        flex: 1; /* Take remaining space */
        min-height: 0; /* Allow shrinking */
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        padding: 10px; /* Safety padding */
    }

    .dial-svg {
        width: 100%;
        height: 100%;
        max-width: 100%;
        max-height: 100%;
        filter: drop-shadow(0 0 10px rgba(0, 0, 0, 0.5));
    }

    .tick {
        transition: stroke 0.3s;
    }

    .center-info {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        pointer-events: none;
    }

    .label {
        font-size: 0.8rem;
        text-transform: uppercase;
        letter-spacing: 1px;
        color: var(--text-muted);
    }

    .value {
        font-size: 4rem;
        font-weight: 700;
        line-height: 1;
        margin: 4px 0;
    }

    .current {
        font-size: 1rem;
        color: var(--text-secondary);
        display: flex;
        gap: 4px;
        align-items: center;
    }

    .dim {
        color: var(--text-muted);
        font-size: 0.7rem;
        text-transform: uppercase;
    }

    .controls-wrapper {
        flex: 0 0 auto; /* Don't shrink/grow */
        width: 100%;
        display: flex;
        justify-content: center;
        padding-bottom: 10px;
        z-index: 10;
        min-height: 60px; /* Ensure space for controls */
    }
</style>
