<script lang="ts">
    import { t } from "svelte-i18n";
    import "iconify-icon";
    import type { HAEntity } from "$lib/types";
    import { type ThermostatController } from "../thermostatStore";
    import ThermostatControls from "./ThermostatControls.svelte";

    let {
        entity,
        controller,
        state,
        size = 260,
    } = $props<{
        entity: HAEntity;
        controller: ThermostatController;
        state: any;
        size?: number;
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
    // let hvacModes = $derived(entity.attributes.hvac_modes || []); // Handled in Controls now

    // --- Circular Slider Logic ---
    // Geometry
    /* const size = 260; passed as prop or default */
    const strokeWidth = 24; // Visual width
    let cx = $derived(size / 2);
    let cy = $derived(size / 2);
    let r = $derived((size - strokeWidth) / 2); // Radius of the stroke path center
    const startAngle = 225; // 225 degrees (7:30 clock position)
    const endAngle = 495; // 495 degrees (4:30 clock position)

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

    // Helper: Create SVG Arc Path
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

    // Value <-> Angle
    function valueToAngle(value: number) {
        const clamped = Math.max(minTemp, Math.min(maxTemp, value));
        const ratio = (clamped - minTemp) / (maxTemp - minTemp);
        return startAngle + ratio * (endAngle - startAngle);
    }

    function angleToValue(angle: number) {
        // Normalize angle
        let normalized = angle;
        if (normalized < startAngle) normalized += 360;

        // Clamp to range
        if (normalized < startAngle) normalized = startAngle;
        if (normalized > endAngle) normalized = endAngle;

        const ratio = (normalized - startAngle) / (endAngle - startAngle);
        const rawValue = minTemp + ratio * (maxTemp - minTemp);
        // Snap to step
        return Math.round(rawValue / step) * step;
    }

    // SVG Paths
    let bgPath = $derived(describeArc(cx, cy, r, startAngle, endAngle));
    let currentAngle = $derived(valueToAngle(targetTemp));
    let activePath = $derived(describeArc(cx, cy, r, startAngle, currentAngle));

    // Current Temp Indicator (Orbiting Dot)
    let currentTempR = $derived(r + 24); // Orbit outside the ring
    let currentTempAngle = $derived(valueToAngle(currentTemp || minTemp));
    let currentTempPos = $derived(
        polarToCartesian(cx, cy, currentTempR, currentTempAngle),
    );

    // Handle Position
    let handlePos = $derived(polarToCartesian(cx, cy, r, currentAngle));

    // Interaction
    let svgElement: SVGSVGElement;

    function handleInput(clientX: number, clientY: number) {
        if (!svgElement) return;
        const rect = svgElement.getBoundingClientRect();
        const dx = clientX - (rect.left + rect.width / 2);
        const dy = clientY - (rect.top + rect.height / 2);

        // Calculate angle from center
        let angle = (Math.atan2(dy, dx) * 180) / Math.PI; // -180 to 180

        angle = angle + 90; // 0 at 12 o'clock
        if (angle < 0) angle += 360;

        let touchAngle = angle;

        // Clamp handling for gap at bottom
        let newVal = angleToValue(
            touchAngle >= 135 ? touchAngle : touchAngle + 360,
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

    // Formatting
    let statusText = $derived(
        hvacMode === "off"
            ? $t("common.off")
            : $t(
                  `widgets.thermostat.actions.${entity.attributes.hvac_action || "idle"}`,
              ),
    );

    let statusColor = $derived.by(() => {
        if (hvacMode === "off") return "var(--text-muted)";
        const action = entity.attributes.hvac_action;
        if (action === "heating")
            return "var(--thermostat-heating-color, #ff9500)";
        if (action === "cooling")
            return "var(--thermostat-cooling-color, #007aff)";
        return "var(--text-primary)";
    });
</script>

<div class="ring-skin">
    <div class="dial-container" style="width: {size}px; height: {size}px;">
        <!-- SVG Dial -->
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
                <!-- Gradients -->
                <linearGradient
                    id="temp-gradient"
                    gradientUnits="userSpaceOnUse"
                    x1="0"
                    y1={size}
                    x2={size}
                    y2="0"
                >
                    <stop
                        offset="0%"
                        stop-color="var(--thermostat-cooling-color, #007aff)"
                    />
                    <stop offset="50%" stop-color="#ae38ff" />
                    <stop
                        offset="100%"
                        stop-color="var(--thermostat-heating-color, #ff9500)"
                    />
                </linearGradient>
            </defs>

            <!-- Background Track -->
            <path
                d={bgPath}
                fill="none"
                stroke="var(--track-color, rgba(255,255,255,0.1))"
                stroke-width={strokeWidth}
                stroke-linecap="round"
                class="dial-track"
            />

            <!-- Active Arc -->
            <path
                d={activePath}
                fill="none"
                stroke={hvacMode === "off"
                    ? "var(--text-muted)"
                    : "url(#temp-gradient)"}
                stroke-width={strokeWidth}
                stroke-linecap="round"
                class="dial-arc"
            />

            <!-- Invisible Hit Area (wider) -->
            <path
                d={bgPath}
                fill="none"
                stroke="rgba(255,255,255,0.001)"
                stroke-width="50"
                stroke-linecap="round"
                class="ring-hit"
                style="pointer-events: stroke; cursor: pointer;"
            />

            <!-- Handle -->
            {#if hvacMode !== "off"}
                <g
                    transform={`translate(${handlePos.x}, ${handlePos.y})`}
                    style="pointer-events: none;"
                >
                    <circle
                        r="12"
                        fill="#fff"
                        filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))"
                    />
                    <circle r="4" fill={statusColor} />
                </g>
            {/if}

            <!-- Current Temp Indicator (Orbiting Dot) -->
            {#if currentTemp != null}
                <g
                    transform={`translate(${currentTempPos.x}, ${currentTempPos.y})`}
                    style="pointer-events: none; transition: transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);"
                >
                    <circle
                        r="5"
                        fill="var(--text-primary)"
                        stroke="var(--bg-card)"
                        stroke-width="2"
                    />
                </g>
            {/if}
        </svg>

        <!-- Center Content -->
        <div class="dial-content">
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
    </div>

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
        pointer-events: none; /* Let clicks pass to ring */
    }

    .temp-display {
        font-size: 3.5rem;
        font-weight: 700;
        line-height: 1;
        color: var(--thermostat-dial-text-color, var(--text-primary));
        font-variant-numeric: tabular-nums;
        transition: font-size 0.2s;
    }

    .unit {
        font-size: 0.5em;
        vertical-align: top;
        color: var(--text-muted);
        font-weight: 500;
    }

    .status {
        font-size: 1rem;
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
        font-size: 0.9rem;
        color: var(--text-muted);
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
            font-size: 2.5rem;
        }
        .status {
            font-size: 0.9rem;
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
