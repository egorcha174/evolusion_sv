<script lang="ts">
    import { t } from "svelte-i18n";
    import "iconify-icon";
    import {
        setTemperature,
        setHvacMode,
        type ThermostatState,
    } from "../thermostatStore";
    import { onDestroy, onMount } from "svelte";
    import type { HAEntity } from "$lib/types";

    interface Props {
        entity: HAEntity;
        thermostatState: ThermostatState;
        isOff: boolean;
        hasFan: boolean;
        hasPresets: boolean;
        onToggleAdvanced: () => void;
        onTogglePresets: () => void;
        onError: (err: Error) => void;
    }

    let {
        entity,
        thermostatState,
        isOff,
        hasFan,
        hasPresets,
        onToggleAdvanced,
        onTogglePresets,
        onError,
    }: Props = $props();

    let sliderValue = $state(thermostatState.targetTemp);
    let isDragging = $state(false);
    let dragActive = $state(false);
    let dragPointerId = $state<number | null>(null);
    let lastSent = $state<number | null>(null);
    let dialSvg = $state<SVGSVGElement | null>(null);

    $effect(() => {
        if (!isDragging) {
            sliderValue = thermostatState.targetTemp;
        }
    });

    // Circular calculations
    const radius = 80;
    const strokeWidth = 12;
    const normalizedRadius = radius - strokeWidth * 0.5;
    const circumference = normalizedRadius * 2 * Math.PI;
    // We want a 270 degree arc (approx 3/4 circle), starting from bottom-left (-135deg) to bottom-right (135deg)
    // Actually simpler: Start at 135deg (bottom-left) and go to 45deg (bottom-right)?
    // Let's use a gap at the bottom.
    // SVG standard: 0 degress is 3 o'clock.
    // We want gap at 6 o'clock. Start at 135deg (bottom left), End at 45deg (bottom right).
    // Total sweep: 270 deg.

    // Convert temp to angle
    function tempToProgress(temp: number) {
        const range = thermostatState.maxTemp - thermostatState.minTemp;
        const val =
            Math.max(
                thermostatState.minTemp,
                Math.min(thermostatState.maxTemp, temp),
            ) - thermostatState.minTemp;
        return val / range;
    }

    // Offset for stroke-dasharray
    // Full circle = circumference
    // We only show 75% (270deg).
    // offset = circumference * (1 - progress * 0.75) - (circumference * 0.25)

    // Easier way: rotate the whole SVG so the gap is at bottom.
    // Gap size = 90 deg (25%).
    // DashArray = circumference * 0.75 + " " + circumference * 0.25

    // Progress bar needs to be a separate path on top.

    let activeColor = $derived(
        isOff ? "var(--text-muted)" : getModeColor(thermostatState.hvacMode),
    );

    function getModeColor(mode: string): string {
        switch (mode) {
            case "heat":
                return "var(--thermostat-heating-color, #ff6b35)";
            case "cool":
                return "var(--thermostat-cooling-color, #4fc3f7)";
            case "auto":
                return "var(--accent-primary, #7c4dff)";
            default:
                return "var(--text-primary)";
        }
    }

    const arcStart = 135; // degrees
    const arcSweep = 270; // degrees

    let handlePos = $derived.by(() => {
        const progress = tempToProgress(sliderValue);
        const angleDeg = arcStart + progress * arcSweep;
        const angleRad = (angleDeg * Math.PI) / 180;
        const cx = 100;
        const cy = 100;
        // radius = 80 (same as arc)
        return {
            x: cx + radius * Math.cos(angleRad),
            y: cy + radius * Math.sin(angleRad),
        };
    });

    function angleToProgress(angle: number): number | null {
        const delta = (angle - arcStart + 360) % 360;
        if (delta > arcSweep) return null; // gap area
        return delta / arcSweep;
    }

    function snapToStep(temp: number) {
        const step = thermostatState.targetTempStep || 0.5;
        const min = thermostatState.minTemp;
        const max = thermostatState.maxTemp;
        const snapped = min + Math.round((temp - min) / step) * step;
        return Math.max(min, Math.min(max, snapped));
    }

    function updateFromPointer(e: PointerEvent) {
        if (isOff || !dialSvg) return;
        const rect = dialSvg.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const angle =
            (Math.atan2(e.clientY - centerY, e.clientX - centerX) * 180) /
            Math.PI;
        const angleDeg = (angle + 360) % 360;
        const progress = angleToProgress(angleDeg);
        if (progress === null) return;

        const range = thermostatState.maxTemp - thermostatState.minTemp;
        const rawTemp = thermostatState.minTemp + progress * range;
        const temp = snapToStep(rawTemp);

        sliderValue = temp;
        if (lastSent !== temp) {
            lastSent = temp;
            setTemperature(entity.entity_id, temp, onError);
        }
    }

    function startDrag(e: PointerEvent) {
        if (isOff) return;
        dragActive = true;
        isDragging = true;
        dragPointerId = e.pointerId;
        (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
        updateFromPointer(e);
    }

    function moveDrag(e: PointerEvent) {
        if (!dragActive) return;
        if (dragPointerId !== null && e.pointerId !== dragPointerId) return;
        updateFromPointer(e);
    }

    function endDrag(e: PointerEvent) {
        if (!dragActive) return;
        if (dragPointerId !== null && e.pointerId !== dragPointerId) return;
        dragActive = false;
        isDragging = false;
        dragPointerId = null;
    }

    onMount(() => {
        window.addEventListener("pointermove", moveDrag);
        window.addEventListener("pointerup", endDrag);
        window.addEventListener("pointercancel", endDrag);
    });

    onDestroy(() => {
        window.removeEventListener("pointermove", moveDrag);
        window.removeEventListener("pointerup", endDrag);
        window.removeEventListener("pointercancel", endDrag);
    });

    function adjustTemp(delta: number) {
        if (isOff) return;
        setTemperature(
            entity.entity_id,
            thermostatState.targetTemp + delta,
            onError,
        );
    }

    function handleToggle() {
        if (isOff) {
            const firstActive =
                thermostatState.hvacModes.find((m) => m !== "off") || "heat";
            setHvacMode(entity.entity_id, firstActive, onError);
        } else {
            setHvacMode(entity.entity_id, "off", onError);
        }
    }
</script>

<div class="circular-thermostat" class:is-off={isOff}>
    <div class="top-row">
        <!-- Settings Button -->
        <button
            class="icon-btn"
            onclick={onToggleAdvanced}
            aria-label="Advanced Settings"
        >
            <iconify-icon icon="mdi:cog" width="18"></iconify-icon>
        </button>
        <span class="entity-name">{entity.attributes.friendly_name}</span>
        <!-- Presets Button -->
        {#if hasPresets}
            <button
                class="icon-btn"
                onclick={onTogglePresets}
                aria-label="Presets"
            >
                <iconify-icon icon="mdi:tune-variant" width="18"></iconify-icon>
            </button>
        {:else}
            <div style="width:24px"></div>
        {/if}
    </div>

    <!-- Dial Container -->
    <div class="dial-container">
        <!-- Main Circle Body (Neumorphic) -->
        <div class="dial-body">
            <!-- Inner display -->
            <div class="dial-display">
                <button
                    class="nav-btn prev"
                    onclick={() => adjustTemp(-thermostatState.targetTempStep)}
                    aria-label="Decrease Temperature"
                >
                    <iconify-icon icon="mdi:chevron-left" width="24"
                    ></iconify-icon>
                </button>

                <div class="temp-readout">
                    <span class="value"
                        >{thermostatState.currentTemp?.toFixed(1) ?? "--"}</span
                    >
                    <span class="degree">°</span>
                </div>

                <button
                    class="nav-btn next"
                    onclick={() => adjustTemp(thermostatState.targetTempStep)}
                    aria-label="Increase Temperature"
                >
                    <iconify-icon icon="mdi:chevron-right" width="24"
                    ></iconify-icon>
                </button>
            </div>

            <div class="target-label">
                Target: {sliderValue.toFixed(1)}°
            </div>
        </div>

        <!-- SVG Ring Overlay for Range -->
        <svg class="dial-svg" viewBox="0 0 200 200" bind:this={dialSvg}>
            <!-- Background Track (Arc) -->
            <!-- Start at 135 deg, go 270 deg -->
            <path
                d="M 43 157 A 80 80 0 1 1 157 157"
                fill="none"
                stroke="rgba(255,255,255,0.1)"
                stroke-width="12"
                stroke-linecap="round"
            />

            <!-- Active Value Arc (Simple dasharray trick or path calc) -->
            <!-- Using dashoffset for simplicity on a circle, but path is partial. -->
            <!-- Let's calculate the path `d` for the active segment manually or use dasharray. -->
            <!-- Total length of the above path (r=80, angle=270deg = 4.71rad) -> len = 377 -->
            <path
                d="M 43 157 A 80 80 0 1 1 157 157"
                fill="none"
                stroke={activeColor}
                stroke-width="12"
                stroke-linecap="round"
                stroke-dasharray="377"
                stroke-dashoffset={377 * (1 - tempToProgress(sliderValue))}
                class="active-arc"
            />

            <!-- Handle Knob -->
            <circle
                cx={handlePos.x}
                cy={handlePos.y}
                r="8"
                class="dial-handle"
                onpointerdown={startDrag}
            />

            <path
                d="M 43 157 A 80 80 0 1 1 157 157"
                class="ring-hit"
                onpointerdown={startDrag}
            />

            <!-- Invisible Hit Target for Handle (Larger) -->
            <circle
                cx={handlePos.x}
                cy={handlePos.y}
                r="24"
                class="dial-handle-hit"
                onpointerdown={startDrag}
            />
        </svg>
    </div>

    <!-- Bottom Action Text -->
    <div class="action-text" style:color={activeColor}>
        {thermostatState.hvacAction === "idle"
            ? thermostatState.hvacMode
            : thermostatState.hvacAction}
    </div>

    <div class="bottom-controls">
        <button
            class="power-btn"
            onclick={handleToggle}
            class:active={!isOff}
            aria-label="Toggle Power"
        >
            <iconify-icon icon="mdi:power" width="20"></iconify-icon>
        </button>
    </div>
</div>

<style>
    .circular-thermostat {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: space-between;
        height: 100%;
        padding: 1rem;
        box-sizing: border-box;
        color: var(--text-primary);
    }

    .top-row {
        display: flex;
        justify-content: space-between;
        width: 100%;
        align-items: center;
    }

    .entity-name {
        font-size: 0.85rem;
        color: var(--text-secondary);
        font-weight: 500;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 60%;
    }

    .icon-btn {
        background: none;
        border: none;
        color: var(--text-muted);
        cursor: pointer;
        padding: 4px;
        transition: color 0.2s;
    }
    .icon-btn:hover {
        color: var(--text-primary);
    }

    /* Dial */
    .dial-container {
        position: relative;
        width: 180px;
        height: 180px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 1rem 0;
    }

    .dial-body {
        width: 140px;
        height: 140px;
        border-radius: 50%;
        background: var(--card-background); /* Or slightly lighter/darker */
        box-shadow:
            -5px -5px 15px rgba(255, 255, 255, 0.05),
            5px 5px 15px rgba(0, 0, 0, 0.2);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        z-index: 2;
        pointer-events: none; /* Allow interaction with ring behind body */
    }

    .dial-display {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .temp-readout {
        display: flex;
        align-items: flex-start;
    }
    .temp-readout .value {
        font-size: 2.5rem;
        font-weight: 300;
        line-height: 1;
    }
    .temp-readout .degree {
        font-size: 1.2rem;
        margin-top: 4px;
        color: var(--text-secondary);
    }

    .nav-btn {
        background: none;
        border: none;
        color: var(--text-secondary);
        cursor: pointer;
        padding: 0;
        display: flex;
        opacity: 0.5;
        transition: opacity 0.2s;
        pointer-events: auto; /* Restore interaction */
    }
    .nav-btn:hover {
        opacity: 1;
        color: var(--text-primary);
    }

    .target-label {
        font-size: 0.7rem;
        color: var(--text-muted);
        margin-top: 0.2rem;
    }

    .dial-svg {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 200px;
        height: 200px;
        pointer-events: none; /* Let clicks pass through empty areas */
        touch-action: none;
        z-index: 1;
    }

    .active-arc {
        transition: stroke-dashoffset 0.3s ease;
    }

    .ring-hit {
        fill: none;
        stroke: rgba(255, 255, 255, 0.001); /* Invisible but hit-testable */
        stroke-width: 40;
        stroke-linecap: round;
        pointer-events: stroke; /* Only the stroke captures events */
        cursor: pointer;
    }

    .dial-handle {
        fill: white;
        filter: drop-shadow(0 0 2px rgba(0, 0, 0, 0.5));
        pointer-events: none; /* Pass events to hit target */
        transition:
            cx 0.1s linear,
            cy 0.1s linear; /* Smooth movement matching sliderValue updates */
    }

    .dial-handle-hit {
        fill: transparent;
        cursor: pointer;
        pointer-events: auto;
        transition:
            cx 0.1s linear,
            cy 0.1s linear;
    }

    .action-text {
        text-transform: uppercase;
        font-size: 0.8rem;
        font-weight: 600;
        letter-spacing: 1px;
        height: 1.2rem;
    }

    .bottom-controls {
        margin-top: auto;
        margin-bottom: 2rem; /* Added margin to prevent edge overlap */
    }

    .power-btn {
        background: var(--bg-card-hover);
        border: none;
        width: 36px;
        height: 36px;
        border-radius: 50%;
        color: var(--text-muted);
        cursor: pointer;
        transition: all 0.2s;
    }
    .power-btn.active {
        background: var(--card-background);
        color: var(--thermostat-heating-color, var(--accent-primary));
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
    }
</style>
