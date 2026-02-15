<script lang="ts">
    import { onMount, onDestroy } from "svelte";
    import { t } from "svelte-i18n";
    import "iconify-icon";
    import type { HAEntity } from "$lib/types";
    import { type ThermostatController } from "./core/thermostat.svelte";

    let { entity, controller } = $props<{
        entity: HAEntity;
        controller: ThermostatController;
    }>();

    let container: HTMLElement;
    let width = $state(0);
    let height = $state(0);
    let sizeClass = $state("widget--1x1");

    // --- Resize Observer ---
    let resizeObserver: ResizeObserver;

    onMount(() => {
        if (container) {
            resizeObserver = new ResizeObserver((entries) => {
                for (const entry of entries) {
                    const rect = entry.contentRect;
                    width = rect.width;
                    height = rect.height;
                    updateSizeClass(width, height);
                }
            });
            resizeObserver.observe(container);
        }
    });

    onDestroy(() => {
        if (resizeObserver) resizeObserver.disconnect();
    });

    function updateSizeClass(w: number, h: number) {
        // Simple heuristic for 1x1, 2x1, 1x2, 2x2 based on standard grid units (~150px?)
        // Assuming base unit around 140-160px.
        const isWide = w > 200;
        const isTall = h > 200;

        if (isWide && isTall) {
            sizeClass = "widget--2x2";
        } else if (isWide) {
            sizeClass = "widget--2x1";
        } else if (isTall) {
            sizeClass = "widget--1x2";
        } else {
            sizeClass = "widget--1x1";
        }
    }

    // --- Dial Logic ---
    const r = 40;
    const C = 2 * Math.PI * r; // ~251.2

    // Angles for the arc (similar to Ring skin but maybe simpler 0-1 range mapped to dashoffset)
    // Spec: "stroke-dashoffset = C * (1 - progress)" -> This implies a full circle or 0-100% bar?
    // Spec also says: "Dial SVG and arc calculation... stroke-dasharray = C".
    // Let's assume a circular gauge.

    function valueToProgress(value: number) {
        const min = controller.minTemp;
        const max = controller.maxTemp;
        const clamped = Math.max(min, Math.min(max, value));
        return (clamped - min) / (max - min);
    }

    let progress = $derived(valueToProgress(controller.targetTemp));
    let dashOffset = $derived(C * (1 - progress));

    // Dynamic Color
    // "active ring color: --accent. In cool mode: --accent-2"
    let activeColorVar = $derived(
        controller.hvacMode === "cooling"
            ? "var(--theme-accent-2)"
            : "var(--theme-accent)",
    );

    // Interaction (Simple decrease/increase for now as per spec for controls)
    function decrease() {
        controller.setTemperature(controller.targetTemp - controller.step);
    }

    function increase() {
        controller.setTemperature(controller.targetTemp + controller.step);
    }

    // Touch/Drag on Dial (Optional/Simpler implementation for Universal)
    // For 1x2 support: "gesture: rotate or vertical swipe".
    // Implementing a simple vertical drag on the dial for 1x2/1x1 if needed?
    // The spec says "1x1: single tap opens modal", "2x1: buttons", "1x2: gestures".
    // For MVP/first pass, let's implement buttons for all, and maybe basic drag if easy.
    // Let's stick to buttons for stability first, as 2x1 and 2x2 use them.

    // Mode Icon
    function getModeIcon(mode: string) {
        switch (mode) {
            case "heat":
                return "mdi:fire";
            case "cool":
                return "mdi:snowflake";
            case "auto":
                return "mdi:autorenew";
            case "off":
                return "mdi:power";
            default:
                return "mdi:thermostat";
        }
    }
</script>

<div
    class="thermo-skin {sizeClass}"
    bind:this={container}
    role="application"
    aria-label={$t("widgets.thermostat.title")}
>
    <div class="thermo-main">
        <div class="dial" aria-hidden="true">
            <svg viewBox="0 0 100 100" class="dial-svg" focusable="false">
                <!-- Background Ring -->
                <circle class="ring-bg" cx="50" cy="50" r="40"></circle>
                <!-- Active Ring -->
                <circle
                    class="ring-active"
                    cx="50"
                    cy="50"
                    r="40"
                    style:stroke-dasharray={C}
                    style:stroke-dashoffset={dashOffset}
                    style:stroke={activeColorVar}
                ></circle>
                <!-- Current Temp Text -->
                <text class="temp-current" x="50" y="56" text-anchor="middle">
                    {entity.attributes.current_temperature ?? "--"}°
                </text>
            </svg>
        </div>

        <div class="info">
            <div class="temp-set">
                <div class="label">Set</div>
                <div class="value" style:color={activeColorVar}>
                    {controller.targetTemp}°
                </div>
            </div>
            <div class="mode" aria-hidden="true">
                <iconify-icon icon={getModeIcon(controller.hvacMode)} width="24"
                ></iconify-icon>
            </div>
        </div>
    </div>

    <div class="controls" aria-hidden="true">
        <button
            class="btn-decrease"
            onclick={decrease}
            aria-label={$t("common.decrease")}>−</button
        >
        <button
            class="btn-increase"
            onclick={increase}
            aria-label={$t("common.increase")}>+</button
        >
    </div>

    <div class="extra" aria-hidden="true">
        <!-- Placeholder for extra info (graph, schedule) in 2x2 -->
        <div class="extra-item">
            <span>{$t("common.humidity")}</span>
            <span>{entity.attributes.humidity ?? "--"}%</span>
        </div>
    </div>
</div>

<style>
    :global(:root) {
        /* Fallbacks if theme vars missing, though spec says global vars are present */
    }

    /* Mappings to local variables for easier tweaking if needed */
    .thermo-skin {
        --bg: var(--theme-bg, #222);
        --surface: var(--theme-surface, #333);
        --text: var(--theme-text, #fff);
        --muted: var(--theme-muted, #888);
        --accent: var(--theme-accent, #ff5500);
        --accent-2: var(--theme-accent-2, #0055ff);
        --border: var(--theme-border, #444);
        --shadow: var(--theme-shadow, 0 4px 6px rgba(0, 0, 0, 0.1));
        --radius: 12px;
        --gap: 10px;

        background: linear-gradient(
            var(--surface),
            color-mix(in srgb, var(--surface) 90%, var(--bg) 10%)
        );
        color: var(--text);
        border-radius: var(--radius);
        padding: var(--gap);
        box-shadow: var(--shadow);

        width: 100%;
        height: 100%;
        box-sizing: border-box;
        overflow: hidden;

        display: flex;
        flex-direction: column;
    }

    /* Dial SVG */
    .dial {
        display: flex;
        justify-content: center;
        align-items: center;
        /* Default size, scales with container */
        width: 100%;
        height: auto;
        aspect-ratio: 1;
        max-height: 100%;
    }

    .dial-svg {
        width: 100%;
        height: 100%;
    }

    .ring-bg {
        fill: none;
        stroke: color-mix(in srgb, var(--text) 8%, transparent 92%);
        stroke-width: 10;
    }

    .ring-active {
        fill: none;
        stroke-width: 10;
        stroke-linecap: round;
        transform: rotate(-90deg);
        transform-origin: center;
        transition:
            stroke-dashoffset 0.35s ease,
            stroke 0.25s ease;
    }

    .temp-current {
        fill: var(--text);
        font-size: clamp(18px, 20%, 36px); /* Adaptive font size */
        font-weight: 700;
        pointer-events: none;
    }

    /* Info Block */
    .info {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 4px;
        text-align: center;
    }

    .temp-set .label {
        font-size: 0.75rem;
        color: var(--muted);
        text-transform: uppercase;
    }

    .temp-set .value {
        font-size: 1.5rem;
        font-weight: 600;
    }

    .mode {
        color: var(--muted);
    }

    /* Controls */
    .controls {
        display: flex;
        gap: 8px;
        justify-content: center;
        margin-top: auto;
    }

    button {
        background: color-mix(in srgb, var(--surface) 80%, var(--bg) 20%);
        border: 1px solid var(--border);
        color: var(--text);
        padding: 0.4rem 0.8rem;
        border-radius: 8px;
        cursor: pointer;
        font-size: 1.25rem;
        line-height: 1;
        transition: background 0.2s;
    }

    button:hover {
        background: var(--surface);
    }

    button:active {
        background: var(--bg);
    }

    /* Extra */
    .extra {
        display: none; /* Hidden by default */
        margin-top: auto;
        font-size: 0.85rem;
        color: var(--muted);
    }

    .extra-item {
        display: flex;
        justify-content: space-between;
        width: 100%;
        background: rgba(0, 0, 0, 0.05);
        padding: 4px 8px;
        border-radius: 4px;
    }

    /* --------------------------
       Layout Adapters
       -------------------------- */

    /* 1x1: Single centered element */
    .widget--1x1 .thermo-main {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
    }

    .widget--1x1 .info,
    .widget--1x1 .controls,
    .widget--1x1 .extra {
        display: none;
    }

    /* 2x1: Two columns */
    .widget--2x1 {
        display: grid;
        grid-template-columns: 100px 1fr auto; /* Dial | Info | Controls */
        align-items: center;
        gap: var(--gap);
        padding-right: 1rem;
    }

    .widget--2x1 .thermo-main {
        display: contents; /* Ungroup to let grid handle children if possible, OR keep grouped */
    }

    /* Re-structuring for 2x1 consistency with DOM structure */
    /* DOM is: thermo-main (dial + info) | controls | extra */

    .widget--2x1 {
        flex-direction: row;
        align-items: center;
    }

    .widget--2x1 .thermo-main {
        display: flex;
        align-items: center;
        gap: var(--gap);
        flex: 1;
    }

    .widget--2x1 .dial {
        width: 80px;
        height: 80px;
    }

    .widget--2x1 .info {
        align-items: flex-start;
        text-align: left;
    }

    .widget--2x1 .controls {
        flex-direction: column;
        margin-top: 0;
    }

    .widget--2x1 .extra {
        display: none;
    }

    /* 1x2: Single column, Large dial */
    .widget--1x2 {
        flex-direction: column;
        align-items: center;
        justify-content: space-between;
    }

    .widget--1x2 .thermo-main {
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 100%;
    }

    .widget--1x2 .dial {
        width: 100%;
        max-width: 140px;
    }

    .widget--1x2 .info {
        margin-top: 10px;
    }

    .widget--1x2 .controls {
        width: 100%;
        justify-content: space-between;
    }

    .widget--1x2 button {
        flex: 1;
    }

    .widget--1x2 .extra {
        display: none;
    }

    /* 2x2: Full Grid */
    .widget--2x2 {
        display: grid;
        grid-template-areas:
            "main main"
            "controls extra";
        grid-template-rows: 1fr auto;
        grid-template-columns: 1fr 1fr;
    }

    .widget--2x2 .thermo-main {
        grid-area: main;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
    }

    .widget--2x2 .dial {
        width: 120px;
    }

    .widget--2x2 .controls {
        grid-area: controls;
        justify-self: start;
        width: 100%;
    }

    .widget--2x2 .extra {
        grid-area: extra;
        display: flex;
        flex-direction: column;
        justify-content: center;
    }
</style>
