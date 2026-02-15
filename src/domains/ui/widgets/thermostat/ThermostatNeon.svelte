<script lang="ts">
    import { t } from "svelte-i18n";
    import "iconify-icon";
    import { fade, fly } from "svelte/transition";
    import type { HAEntity } from "$lib/types";
    import { type ThermostatController } from "./core/thermostat.svelte";
    import Portal from "../../components/Portal.svelte";

    let { entity, controller } = $props<{
        entity: HAEntity;
        controller: ThermostatController;
    }>();

    // --- Constants for SVG (Fixed ViewBox 0 0 100 100) ---
    const VIEWBOX_SIZE = 100;
    const CX = 50;
    const CY = 50;
    const R = 42; // Radius
    const STROKE_WIDTH = 3;
    const START_ANGLE = 140;
    const END_ANGLE = 400;

    // --- State ---
    let svgElement = $state<SVGSVGElement>();
    let showPresets = $state(false);
    let presetButton = $state<HTMLElement | null>(null);
    // Menu positioning state
    let menuPosition = $state<{
        top: number;
        left: number;
        width: number;
    } | null>(null);
    let isBottom = $state(false);

    // --- Derived Values ---
    let hvacAction = $derived(entity.attributes.hvac_action);
    let hvacModes = $derived(entity.attributes.hvac_modes || []);
    let presetModes = $derived(entity.attributes.preset_modes || []);
    let currentPreset = $derived(controller.presetMode || "None");

    // Dynamic Neon Color based on State
    let neonColor = $derived.by(() => {
        if (controller.hvacMode === "off") return "var(--text-muted, #555)";
        if (hvacAction === "heating") return "var(--accent-primary, #ff3d00)";
        if (hvacAction === "cooling") return "var(--accent-primary, #00b0ff)"; // Or specific cooling color if theme allows
        // Idle / Auto / Other
        return "var(--accent-primary, #ffd700)";
    });

    // --- Geometry Helpers ---
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
        return START_ANGLE + ratio * (END_ANGLE - START_ANGLE);
    }

    function angleToValue(angle: number) {
        let normalized = angle;
        if (normalized < START_ANGLE) normalized += 360;
        if (normalized < START_ANGLE) normalized = START_ANGLE;
        if (normalized > END_ANGLE) normalized = END_ANGLE;

        const min = controller.minTemp;
        const max = controller.maxTemp;
        const ratio = (normalized - START_ANGLE) / (END_ANGLE - START_ANGLE);
        const rawValue = min + ratio * (max - min);
        return Math.round(rawValue / controller.step) * controller.step;
    }

    // Paths
    let bgPath = $derived(describeArc(CX, CY, R, START_ANGLE, END_ANGLE));
    let currentAngle = $derived(valueToAngle(controller.targetTemp));
    let activePath = $derived(
        describeArc(CX, CY, R, START_ANGLE, currentAngle),
    );
    let handlePos = $derived(polarToCartesian(CX, CY, R, currentAngle));

    // --- Interaction ---
    function handleInput(clientX: number, clientY: number) {
        if (!svgElement) return;
        const rect = svgElement.getBoundingClientRect();
        const dx = clientX - (rect.left + rect.width / 2);
        const dy = clientY - (rect.top + rect.height / 2);

        let angle = (Math.atan2(dy, dx) * 180) / Math.PI;
        angle = angle + 90;
        if (angle < 0) angle += 360;

        // Smart Gap Jumping (same as before)
        let touchAngle = angle;
        if (touchAngle < 140 && touchAngle > 40) {
            if (touchAngle < 90) touchAngle = 40;
            else touchAngle = 140;
        }

        let val = angleToValue(
            touchAngle < 140 ? touchAngle + 360 : touchAngle,
        );
        controller.setTemperature(val);
    }

    function onMouseDown(e: MouseEvent) {
        if (controller.hvacMode === "off") return; // No drag in off mode
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
        if (controller.hvacMode === "off") return;
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

    // --- Presets Logic (Portal) ---
    function togglePresets() {
        if (presetModes.length > 0) {
            if (!showPresets && presetButton) {
                const rect = presetButton.getBoundingClientRect();
                const spaceAbove = rect.top;

                if (spaceAbove < 250) {
                    isBottom = true;
                    menuPosition = {
                        top: rect.bottom + 8,
                        left: rect.left + rect.width / 2,
                        width: Math.max(rect.width, 140),
                    };
                } else {
                    isBottom = false;
                    menuPosition = {
                        top: rect.top - 8,
                        left: rect.left + rect.width / 2,
                        width: Math.max(rect.width, 140),
                    };
                }
            }
            showPresets = !showPresets;
        }
    }

    function selectPreset(mode: string) {
        controller.setPresetMode(mode);
        showPresets = false;
    }

    function handleWindowClick(e: MouseEvent) {
        if (
            showPresets &&
            !(e.target as Element).closest(".preset-btn") &&
            !(e.target as Element).closest(".preset-menu-portal")
        ) {
            showPresets = false;
        }
    }

    // Helper to get icon for mode
    function getModeIcon(mode: string) {
        switch (mode) {
            case "off":
                return "mdi:power";
            case "heat":
                return "mdi:fire";
            case "cool":
                return "mdi:snowflake";
            case "auto":
                return "mdi:thermostat-auto";
            default:
                return "mdi:thermostat";
        }
    }
</script>

<svelte:window onclick={handleWindowClick} />

<div class="skin-neon" style="--neon-color: {neonColor}">
    <div class="neon-container">
        <!-- SVG Ring -->
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <svg
            class="dial-svg"
            viewBox={`0 0 ${VIEWBOX_SIZE} ${VIEWBOX_SIZE}`}
            bind:this={svgElement}
            onmousedown={onMouseDown}
            ontouchstart={onTouchStart}
            ontouchmove={onTouchMove}
            ontouchend={onTouchEnd}
        >
            <defs>
                <!-- Dynamic Glow Filter -->
                <filter
                    id="neon-glow"
                    x="-200%"
                    y="-200%"
                    width="500%"
                    height="500%"
                >
                    <feGaussianBlur stdDeviation="3.5" result="coloredBlur" />
                    <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="coloredBlur" />
                        <!-- Double blur for intensity -->
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>

            <!-- Background Track -->
            <path
                d={bgPath}
                fill="none"
                class="track-path"
                stroke-width={STROKE_WIDTH}
                stroke-linecap="round"
            />

            <!-- Hit Area (Invisible) -->
            <path
                d={bgPath}
                fill="none"
                stroke="transparent"
                stroke-width="15"
                stroke-linecap="round"
                style="cursor: pointer;"
            />

            <!-- Active Arc -->
            {#if controller.hvacMode !== "off"}
                <g filter="url(#neon-glow)">
                    <path
                        d={activePath}
                        fill="none"
                        stroke={neonColor}
                        stroke-width={STROKE_WIDTH}
                        stroke-linecap="round"
                        class="active-path"
                    />
                </g>
                <!-- Inner White Core for "Neon Tube" look -->
                <path
                    d={activePath}
                    fill="none"
                    stroke="#fff"
                    stroke-width={STROKE_WIDTH * 0.4}
                    stroke-linecap="round"
                    opacity="0.8"
                />

                <!-- Handle -->
                <g
                    transform={`translate(${handlePos.x}, ${handlePos.y})`}
                    style="pointer-events: none;"
                >
                    <circle r="3" fill="#fff" filter="url(#neon-glow)" />
                    <circle r="5" fill={neonColor} opacity="0.3" />
                </g>
            {/if}
        </svg>

        <!-- Center Info -->
        <!-- Center Info -->
        <div class="info-center">
            <div
                class="temp-display"
                style:text-shadow={`0 0 20px ${neonColor}`}
            >
                {controller.targetTemp.toFixed(1)}
            </div>
            {#if entity.attributes.current_temperature}
                <div class="current-readout">
                    {entity.attributes.current_temperature}°
                </div>
            {/if}
        </div>
    </div>

    <!-- Controls Row (Bottom) -->
    <div class="controls-row">
        <!-- HVAC Modes -->
        <div class="mode-group">
            {#each hvacModes as mode}
                <button
                    class="mode-btn"
                    class:active={controller.hvacMode === mode}
                    onclick={() => controller.setHvacMode(mode)}
                    aria-label={mode}
                >
                    <iconify-icon icon={getModeIcon(mode)}></iconify-icon>
                </button>
            {/each}
        </div>

        <!-- Preset Button (if available) -->
        {#if presetModes.length > 0}
            <div class="preset-wrapper">
                <button
                    class="preset-btn"
                    class:active={controller.presetMode &&
                        controller.presetMode !== "none"}
                    bind:this={presetButton}
                    onclick={togglePresets}
                >
                    <iconify-icon icon="mdi:tune-vertical"></iconify-icon>
                    {#if currentPreset !== "None"}
                        <span class="preset-label">{currentPreset}</span>
                    {/if}
                </button>

                <!-- Portal Menu -->
                {#if showPresets && menuPosition}
                    <Portal>
                        <div
                            class="preset-menu-portal"
                            class:bottom={isBottom}
                            style:top="{menuPosition.top}px"
                            style:left="{menuPosition.left}px"
                            style:width="{menuPosition.width}px"
                            transition:fade={{ duration: 150 }}
                        >
                            {#each presetModes as mode}
                                <button
                                    class="preset-item"
                                    class:selected={currentPreset === mode}
                                    onclick={() => selectPreset(mode)}
                                >
                                    {mode}
                                </button>
                            {/each}
                        </div>
                    </Portal>
                {/if}
            </div>
        {/if}
    </div>
</div>

<style>
    /* Fixed aspect-ratio container logic */
    .skin-neon {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
        background: var(
            --card-background,
            var(--glass-surface, rgba(255, 255, 255, 0.05))
        );
        backdrop-filter: var(--glass-blur, blur(12px));
        -webkit-backdrop-filter: var(--glass-blur, blur(12px));
        border: 1px solid var(--border-primary, rgba(255, 255, 255, 0.1));
        color: var(--text-primary, #fff);
        container-type: size;
        position: relative;
    }

    .neon-container {
        position: relative;
        width: 77cqmin; /* Reduced by ~3% (from 80cqmin) */
        height: 77cqmin;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-top: -4%; /* Lowered by 4% (from -8%) */
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

    .track-path {
        stroke: rgba(255, 255, 255, 0.1);
        opacity: 0.5;
    }

    /* Center Info */
    .info-center {
        position: absolute;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        z-index: 5;
        pointer-events: none; /* Let clicks pass to SVG */
    }

    .temp-display {
        font-size: 18cqmin;
        font-weight: 800;
        line-height: 1;
        font-family: "Segoe UI", sans-serif;
        color: #fff; /* Always white core */
    }

    .current-readout {
        font-size: 13cqmin; /* Reduced by ~10% (from 14.4cqmin) */
        color: var(--text-secondary, #888);
        margin-top: 1cqmin;
        font-weight: 500;
        /* Removed background pill to match request for simpler text */
    }

    /* Controls */
    .controls-row {
        margin-top: 1cqmin; /* Lowered by ~6% (previously -5cqmin) */
        display: flex;
        align-items: center;
        gap: 3cqmin;
        z-index: 10;
        position: relative;
    }

    .mode-group {
        display: flex;
        background: var(--bg-surface, rgba(255, 255, 255, 0.05));
        border-radius: 100px;
        padding: 1cqmin;
        gap: 1cqmin;
        border: 1px solid var(--border-primary, rgba(255, 255, 255, 0.1));
    }

    .mode-btn {
        background: transparent;
        border: none;
        width: 10cqmin;
        height: 10cqmin;
        border-radius: 50%;
        color: var(--text-secondary, #888);
        font-size: 5cqmin;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.3s;
    }

    .mode-btn:hover {
        color: var(--text-primary);
        background: rgba(255, 255, 255, 0.05);
    }

    .mode-btn.active {
        color: var(--accent-primary);
        text-shadow: 0 0 10px var(--accent-primary);
        background: rgba(var(--accent-rgb, 255, 255, 255), 0.1);
        box-shadow: 0 0 15px rgba(var(--accent-rgb), 0.2);
    }

    /* Preset Btn */
    .preset-btn {
        background: var(--bg-surface, rgba(255, 255, 255, 0.05));
        border: 1px solid var(--border-primary, rgba(255, 255, 255, 0.1));
        height: 12cqmin;
        padding: 0 4cqmin;
        border-radius: 100px;
        display: flex;
        align-items: center;
        gap: 2cqmin;
        font-size: 5cqmin;
        color: var(--text-secondary);
        cursor: pointer;
        transition: all 0.3s;
    }

    .preset-btn:hover {
        background: var(--bg-card-hover);
        color: var(--text-primary);
        border-color: var(--accent-primary);
        box-shadow: 0 0 10px rgba(var(--accent-rgb), 0.3);
    }

    .preset-btn.active {
        color: var(--accent-primary);
        border-color: var(--accent-primary);
    }

    .preset-label {
        font-size: 3.5cqmin;
        font-weight: 600;
        text-transform: uppercase;
    }

    /* Portal Menu (Copied logic from Main) */
    .preset-menu-portal {
        position: fixed;
        transform: translate(-50%, -100%);
        background: var(--bg-surface, #1e1e1e);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        border: 1px solid var(--border-primary);
        border-radius: 12px;
        padding: 4px;
        min-width: 140px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
        display: flex;
        flex-direction: column;
        gap: 2px;
        z-index: 9999;
    }

    .preset-menu-portal.bottom {
        transform: translate(-50%, 0);
    }

    .preset-item {
        background: transparent;
        border: none;
        color: var(--text-primary);
        padding: 8px 12px;
        text-align: left;
        cursor: pointer;
        border-radius: 8px;
        text-transform: capitalize;
        transition: background 0.2s;
        font-size: 0.9rem;
    }

    .preset-item:hover {
        background: var(--bg-hover, rgba(255, 255, 255, 0.05));
    }

    .preset-item.selected {
        background: var(--accent-primary-dim, rgba(0, 122, 255, 0.1));
        color: var(--accent-primary);
        font-weight: 600;
    }
</style>
