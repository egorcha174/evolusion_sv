<script lang="ts">
    import type { HAEntity } from "$lib/types";
    import type { TimerConfig } from "$domains/ha/virtual-devices";
    import { t } from "svelte-i18n";

    interface Props {
        entity: HAEntity;
    }

    let { entity }: Props = $props();

    // Type casting with safety check
    let config = $derived(
        (entity?.attributes?.config as TimerConfig) || {
            name: "",
            cycleValue: 1,
            unit: "day",
            lastResetDate: new Date().toISOString(),
            animation: "smooth",
            fillDirection: "bottom-to-top",
            fillColors: ["#22c55e", "#f59e0b", "#ef4444"],
            fillOpacity: 1,
            showName: true,
            showUnit: true,
            namePosition: { x: 50, y: 15 },
            daysRemainingPosition: { x: 50, y: 50 },
            unitPosition: { x: 68, y: 52 },
        },
    );

    // Core tick (independent of edit mode)
    let nowMs = $state(Date.now());
    let tickId: ReturnType<typeof setInterval> | null = null;

    // Core state (computed from config + time)
    let cycleValue = $derived(
        config?.cycleValue && config.cycleValue > 0
            ? config.cycleValue
            : config?.cycleDays && config.cycleDays > 0
              ? config.cycleDays
              : 1,
    );

    let unit = $derived((config?.unit || "day") as TimerConfig["unit"]);
    let tickMs = $derived.by(() => {
        if (unit === "sec") return 1000;
        if (unit === "min") return 1000 * 60;
        if (unit === "hour") return 1000 * 60 * 60;
        return 1000 * 60 * 60 * 24;
    });

    $effect(() => {
        if (tickId) clearInterval(tickId);
        tickId = setInterval(() => {
            nowMs = Date.now();
        }, tickMs);
        return () => {
            if (tickId) clearInterval(tickId);
        };
    });

    let daysRemaining = $derived.by(() => {
        if (!config.lastResetDate) return cycleValue;
        const resetDate = new Date(config.lastResetDate);
        if (isNaN(resetDate.getTime())) return cycleValue;

        if (unit === "month") {
            const nowDate = new Date(nowMs);
            const nowIndex = nowDate.getFullYear() * 12 + nowDate.getMonth();
            const resetIndex =
                resetDate.getFullYear() * 12 + resetDate.getMonth();
            let monthsPassed = nowIndex - resetIndex;
            if (nowDate.getDate() < resetDate.getDate()) {
                monthsPassed -= 1;
            }
            monthsPassed = Math.max(0, monthsPassed);
            return Math.max(0, cycleValue - monthsPassed);
        }

        const ms = nowMs - resetDate.getTime();
        const unitMs =
            unit === "sec"
                ? 1000
                : unit === "min"
                  ? 1000 * 60
                  : unit === "hour"
                    ? 1000 * 60 * 60
                    : 1000 * 60 * 60 * 24;
        const unitsPassed = Math.floor(ms / unitMs);
        return Math.max(0, cycleValue - unitsPassed);
    });

    let fillPercentage = $derived.by(() => {
        if (!config.lastResetDate) return 0;
        const resetDate = new Date(config.lastResetDate);
        if (isNaN(resetDate.getTime())) return 0;

        if (unit === "month") {
            const nowDate = new Date(nowMs);
            const nowIndex = nowDate.getFullYear() * 12 + nowDate.getMonth();
            const resetIndex =
                resetDate.getFullYear() * 12 + resetDate.getMonth();
            let monthsPassed = nowIndex - resetIndex;
            if (nowDate.getDate() < resetDate.getDate()) {
                monthsPassed -= 1;
            }
            monthsPassed = Math.max(0, monthsPassed);
            return Math.min(100, (monthsPassed / cycleValue) * 100);
        }

        const ms = nowMs - resetDate.getTime();
        const unitMs =
            unit === "sec"
                ? 1000
                : unit === "min"
                  ? 1000 * 60
                  : unit === "hour"
                    ? 1000 * 60 * 60
                    : 1000 * 60 * 60 * 24;
        const unitsPassed = Math.floor(ms / unitMs);
        return Math.min(100, (unitsPassed / cycleValue) * 100);
    });

    // Config defaults with optional chaining
    let animation = $derived(config?.animation || "smooth");
    let fillDirection = $derived(config?.fillDirection || "bottom-to-top");
    let fillColors = $derived(
        config?.fillColors || ["#22c55e", "#f59e0b", "#ef4444"],
    );
    let fillOpacity = $derived(
        typeof config?.fillOpacity === "number" ? config.fillOpacity : 1,
    );
    let showName = $derived(config?.showName !== false);
    let showUnit = $derived(config?.showUnit !== false);
    let namePosition = $derived(config?.namePosition || { x: 50, y: 15 });
    let daysRemainingPosition = $derived(
        config?.daysRemainingPosition || { x: 50, y: 50 },
    );
    let unitPosition = $derived(config?.unitPosition || { x: 68, y: 52 });

    // --- Color Interpolation (Match Fusion) ---
    function hexToRgb(hex: string) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result
            ? {
                  r: parseInt(result[1], 16),
                  g: parseInt(result[2], 16),
                  b: parseInt(result[3], 16),
              }
            : null;
    }

    function rgbToHex(r: number, g: number, b: number) {
        return (
            "#" +
            ((1 << 24) + (r << 16) + (g << 8) + b)
                .toString(16)
                .slice(1)
                .toUpperCase()
        );
    }

    function interpolateColor(color1: string, color2: string, factor: number) {
        const c1 = hexToRgb(color1);
        const c2 = hexToRgb(color2);
        if (!c1 || !c2) return color1;

        const r = Math.round(c1.r + factor * (c2.r - c1.r));
        const g = Math.round(c1.g + factor * (c2.g - c1.g));
        const b = Math.round(c1.b + factor * (c2.b - c1.b));
        return rgbToHex(r, g, b);
    }

    let fillColor = $derived.by(() => {
        const [start, mid, end] = fillColors;
        // Fusion Logic: <50% maps start->mid, >=50% maps mid->end
        if (fillPercentage < 50) {
            return interpolateColor(start, mid, fillPercentage / 50);
        } else {
            return interpolateColor(mid, end, (fillPercentage - 50) / 50);
        }
    });
    let fillColorRgba = $derived.by(() => {
        const rgb = hexToRgb(fillColor);
        if (!rgb) return fillColor;
        const a = Math.max(0, Math.min(1, fillOpacity));
        return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${a})`;
    });

    let isTopDown = $derived(fillDirection === "top-to-bottom");
    let visualFillPercentage = $derived(
        isTopDown ? 100 - fillPercentage : fillPercentage,
    );
    let safeFillPercentage = $derived(
        Number.isFinite(visualFillPercentage) ? visualFillPercentage : 0,
    );

    // --- Bubble Logic (Match Fusion) ---
    const bubbleCount = 20;

    interface Bubble {
        id: number;
        left: string;
        size: string;
        duration: string;
        delay: string;
        wobble: string;
        animationName: string;
    }

    // Generate bubbles once
    // We use a regular variable since it's static random data
    let bubbles: Bubble[] = [];
    {
        for (let i = 0; i < bubbleCount; i++) {
            const willRise = Math.random() > 0.4; // 60% rise
            bubbles.push({
                id: i,
                left: `${Math.random() * 100}%`,
                size: `${Math.random() * 12 + 4}px`,
                duration: willRise
                    ? `${Math.random() * 8 + 6}s`
                    : `${Math.random() * 3 + 2}s`,
                delay: `${Math.random() * 10}s`,
                wobble: `${(Math.random() - 0.5) * 20}px`,
                animationName: willRise ? "bubble-rise" : "bubble-pop",
            });
        }
    }

    // --- Wave Logic ---
    interface WaveShape {
        id: number;
        pathA: string;
        pathB: string;
        opacity: number;
        moveClass: string;
        morphDuration: string;
    }

    function generateWaveTopPath(maxAmp: number) {
        const width = 5000;
        const base = 20;
        const cycles = 12;
        const wave = width / cycles;
        let d = `M0,${base}`;
        const ampsUp: number[] = [];
        const ampsDown: number[] = [];
        for (let i = 0; i < cycles; i++) {
            ampsUp.push(maxAmp * (0.6 + Math.random() * 0.4));
            ampsDown.push(maxAmp * (0.6 + Math.random() * 0.4));
        }
        // Ensure seamless loop: last cycle matches first
        ampsUp[cycles - 1] = ampsUp[0];
        ampsDown[cycles - 1] = ampsDown[0];

        for (let i = 0; i < cycles; i++) {
            const x = i * wave;
            const xMid = x + wave / 2;
            const xEnd = x + wave;
            const ampUp = ampsUp[i];
            const ampDown = ampsDown[i];
            d += ` C${x + wave * 0.25},${base - ampUp} ${x + wave * 0.25},${base - ampUp} ${xMid},${base}`;
            d += ` C${x + wave * 0.75},${base + ampDown} ${x + wave * 0.75},${base + ampDown} ${xEnd},${base}`;
        }
        d += ` L5000,100 L0,100 Z`;
        return d;
    }

    let waveShapes: WaveShape[] = [];
    {
        waveShapes = [
            {
                id: 0,
                pathA: generateWaveTopPath(3.5),
                pathB: generateWaveTopPath(3.5),
                opacity: 0.9,
                moveClass: "wave-move-left",
                morphDuration: "12s",
            },
            {
                id: 1,
                pathA: generateWaveTopPath(5),
                pathB: generateWaveTopPath(5),
                opacity: 0.5,
                moveClass: "wave-move-right",
                morphDuration: "15s",
            },
            {
                id: 2,
                pathA: generateWaveTopPath(2.5),
                pathB: generateWaveTopPath(2.5),
                opacity: 0.35,
                moveClass: "wave-move-left",
                morphDuration: "18s",
            },
        ];
    }

    // --- Trash Fill Logic ---
    const trashCount = 520;

    type TrashType = "paper" | "bottle" | "toy";
    interface TrashItem {
        id: number;
        type: TrashType;
        variant: string;
        left: string;
        bottom: string;
        bottomValue: number;
        width: string;
        height: string;
        rotation: string;
        revealAt: number;
        color: string;
        row: number;
    }

    let trashItems: TrashItem[] = [];
    {
        const types: TrashType[] = ["paper", "paper", "bottle", "toy"];
        const palette = [
            "#F8FAFC",
            "#E2E8F0",
            "#CBD5F5",
            "#FDE68A",
            "#FBCFE8",
            "#BAE6FD",
            "#C7D2FE",
            "#FCA5A5",
            "#FCD34D",
            "#A7F3D0",
            "#FED7AA",
            "#E9D5FF",
        ];
        let cursor = -10;
        let row = 0;
        const overlap = 8;
        const rowStep = 4.2;
        for (let i = 0; i < trashCount; i++) {
            const type = types[Math.floor(Math.random() * types.length)];
            const base = Math.random() * 8 + 12;
            const sizeJitter = 0.9 + Math.random() * 0.2;
            let width = base * sizeJitter;
            let height = base * sizeJitter;
            if (type === "paper") {
                width = base * 1.35 * sizeJitter;
                height = base * 0.9 * sizeJitter;
            } else if (type === "bottle") {
                width = base * 0.75 * sizeJitter;
                height = base * 2.1 * sizeJitter;
            } else {
                width = base * 1.05 * sizeJitter;
                height = base * 1.05 * sizeJitter;
            }
            const widthPct = Math.min(28, Math.max(8, width * 1.05));
            if (cursor + widthPct > 106) {
                row += 1;
                cursor = -10;
            }
            const left = cursor + widthPct / 2 + (Math.random() * 5 - 2.5);
            const bottom = row * rowStep;
            cursor += Math.max(2, widthPct - overlap);
            const color = palette[Math.floor(Math.random() * palette.length)];
            const paperVariantRand = Math.random();
            const variant =
                type === "paper"
                    ? paperVariantRand < 0.34
                        ? "paper-flat"
                        : paperVariantRand < 0.67
                          ? "paper-rip"
                          : "paper-ball"
                    : type === "bottle"
                      ? "bottle"
                      : "toy";
            trashItems.push({
                id: i,
                type,
                variant,
                left: `${left}%`,
                bottom: `${bottom}%`,
                bottomValue: bottom,
                width: `${width}px`,
                height: `${height}px`,
                rotation: `${Math.random() * 120 - 60}deg`,
                revealAt: 0,
                color,
                row,
            });
        }
        trashItems = trashItems.map((item) => ({
            ...item,
            revealAt: Math.min(100, Math.max(2, item.bottomValue + 2)),
        }));
    }

    let unitLabelText = $derived.by(() => {
        if (unit === "sec")
            return $t("widgets.eventTimer.units.sec", { default: "sec" });
        if (unit === "min")
            return $t("widgets.eventTimer.units.min", { default: "min" });
        if (unit === "hour")
            return $t("widgets.eventTimer.units.hour", { default: "h" });
        if (unit === "month")
            return $t("widgets.eventTimer.units.month", { default: "mo" });
        return $t("widgets.eventTimer.units.day", { default: "d" });
    });
</script>

<div class="timer-widget">
    <!-- Liquid Fill Layer -->
    <div
        class="liquid-fill"
        style:height={safeFillPercentage + "%"}
        style:background-color={animation === "trash" || animation === "wave"
            ? "transparent"
            : fillColorRgba}
        style:transition={animation === "smooth"
            ? "height 0.7s ease-in-out, background-color 0.5s linear"
            : "background-color 0.5s linear"}
    >
        {#if animation === "bubbles"}
            <div class="bubbles-container">
                {#each bubbles as bubble (bubble.id)}
                    <div
                        class="bubble"
                        style:left={bubble.left}
                        style:width={bubble.size}
                        style:height={bubble.size}
                        style:animation={`${bubble.animationName} ${bubble.duration} ${bubble.delay} infinite ease-in-out`}
                        style:--bubble-wobble={bubble.wobble}
                    ></div>
                {/each}
            </div>
        {/if}

        {#if animation === "trash"}
            <div class="trash-container">
                {#each trashItems as item (item.id)}
                    <div
                        class={`trash-item ${item.variant}`}
                        style:left={item.left}
                        style:bottom={item.bottom}
                        style:width={item.width}
                        style:height={item.height}
                        style:z-index={Math.round(item.bottomValue * 10)}
                        style:opacity={safeFillPercentage >= item.revealAt
                            ? 0.98
                            : 0}
                        style:--trash-settle={`${
                            Math.max(
                                0,
                                Math.min(
                                    1,
                                    (safeFillPercentage - item.revealAt) / 40,
                                ),
                            ) * 4
                        }px`}
                        style:--trash-rot={item.rotation}
                        style:--trash-color={item.color}
                    ></div>
                {/each}
            </div>
        {/if}

        {#if animation === "wave"}
            <!-- Wave top edge on a solid fill rectangle -->
            {#each waveShapes as wave (wave.id)}
                <svg
                    class={`wave-svg ${wave.moveClass}`}
                    viewBox="0 0 5000 100"
                    preserveAspectRatio="none"
                >
                    <path
                        d={wave.pathA}
                        class="wave-path"
                        style:fill={fillColorRgba}
                        style:opacity={wave.opacity}
                    >
                        <animate
                            attributeName="d"
                            dur={wave.morphDuration}
                            repeatCount="indefinite"
                            values={`${wave.pathA};${wave.pathB};${wave.pathA}`}
                        />
                    </path>
                </svg>
            {/each}
        {/if}
    </div>

    <!-- Content Layer -->
    <div class="content">
        {#if config.showName}
            <div
                class="name-text"
                style:top="{namePosition.y}%"
                style:left="{namePosition.x}%"
                style:font-size={config.nameFontSize
                    ? config.nameFontSize + "px"
                    : "1.125rem"}
            >
                {config.name}
            </div>
        {/if}

        <div
            class="days-text"
            style:top="{daysRemainingPosition.y}%"
            style:left="{daysRemainingPosition.x}%"
            style:font-size={config.daysRemainingFontSize
                ? config.daysRemainingFontSize + "px"
                : "5.5rem"}
        >
            {daysRemaining}
        </div>

        {#if showUnit}
            <div
                class="unit-text"
                style:top="{unitPosition.y}%"
                style:left="{unitPosition.x}%"
                style:font-size={config.unitFontSize
                    ? config.unitFontSize + "px"
                    : "1.25rem"}
            >
                {unitLabelText}
            </div>
        {/if}
    </div>
</div>

<style>
    .timer-widget {
        width: 100%;
        height: 100%;
        position: relative;
        overflow: hidden;
        /* Match standard card rounding exactly */
        border-radius: var(--card-border-radius, 16px);
        /* User verified glassmorphism via DeviceCard container, so no Bg here */
        user-select: none;
    }

    .liquid-fill {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        z-index: 1;
        overflow: hidden;
    }

    .content {
        position: absolute;
        inset: 0;
        z-index: 2;
        pointer-events: none;
    }

    .name-text,
    .days-text,
    .unit-text {
        position: absolute;
        transform: translate(-50%, -50%);
        text-align: center;
        text-shadow: 0 2px 10px rgba(0, 0, 0, 0.4);
        font-weight: bold;
        white-space: nowrap;
    }

    .name-text {
        font-weight: 600;
        color: var(--name-text-color, var(--text-primary, #1d1d1f));
    }

    .days-text {
        letter-spacing: -2px;
        color: var(--value-text-color, var(--text-primary, #1d1d1f));
    }

    .unit-text {
        font-weight: 600;
        color: var(--unit-text-color, var(--text-secondary, #86868b));
    }

    /* Animation: Wave */
    .wave-svg {
        position: absolute;
        top: 0;
        left: 0;
        width: 300%;
        height: 100%;
        pointer-events: none;
    }

    .wave-path {
        transform-origin: top;
    }

    .wave-move-left {
        left: 0;
        animation: wave-move-left 18s linear infinite;
    }

    .wave-move-right {
        left: -100%;
        animation: wave-move-right 18s linear infinite;
    }

    @keyframes wave-move-left {
        0% {
            transform: translateX(0);
        }
        100% {
            transform: translateX(-33.333%);
        }
    }

    @keyframes wave-move-right {
        0% {
            transform: translateX(0);
        }
        100% {
            transform: translateX(33.333%);
        }
    }

    /* Animation: Bubbles */
    .bubbles-container {
        position: absolute;
        inset: 0;
        overflow: hidden;
        pointer-events: none;
    }

    .bubble {
        position: absolute;
        bottom: 0;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.2);
    }

    /* Animation: Trash Fill */
    .trash-container {
        position: absolute;
        inset: 0;
        overflow: hidden;
        pointer-events: none;
    }

    .trash-item {
        position: absolute;
        transform: translate(-50%, var(--trash-settle, 0))
            rotate(var(--trash-rot));
        filter: drop-shadow(0 2px 2px rgba(0, 0, 0, 0.25));
        transition: opacity 0.6s ease;
        overflow: hidden;
    }

    .trash-item::before {
        content: "";
        position: absolute;
        inset: 0;
        opacity: 0.35;
        background-image: repeating-linear-gradient(
                45deg,
                rgba(255, 255, 255, 0.25) 0px,
                rgba(255, 255, 255, 0.25) 2px,
                rgba(0, 0, 0, 0) 2px,
                rgba(0, 0, 0, 0) 6px
            ),
            radial-gradient(
                circle at 30% 30%,
                rgba(255, 255, 255, 0.35),
                rgba(0, 0, 0, 0)
            );
        mix-blend-mode: soft-light;
        pointer-events: none;
    }

    .trash-item.paper-flat {
        background: linear-gradient(
            135deg,
            color-mix(in srgb, var(--trash-color), white 40%),
            var(--trash-color)
        );
        background-image: linear-gradient(
                135deg,
                color-mix(in srgb, var(--trash-color), white 40%),
                var(--trash-color)
            ),
            repeating-linear-gradient(
                -45deg,
                rgba(0, 0, 0, 0.06) 0px,
                rgba(0, 0, 0, 0.06) 2px,
                rgba(0, 0, 0, 0) 2px,
                rgba(0, 0, 0, 0) 6px
            );
        border-radius: 2px 5px 3px 6px;
    }

    .trash-item.paper-rip {
        background: linear-gradient(
            135deg,
            color-mix(in srgb, var(--trash-color), white 35%),
            var(--trash-color)
        );
        background-image: linear-gradient(
                135deg,
                color-mix(in srgb, var(--trash-color), white 35%),
                var(--trash-color)
            ),
            repeating-linear-gradient(
                25deg,
                rgba(0, 0, 0, 0.08) 0px,
                rgba(0, 0, 0, 0.08) 3px,
                rgba(0, 0, 0, 0) 3px,
                rgba(0, 0, 0, 0) 7px
            );
        clip-path: polygon(0 12%, 100% 0, 92% 100%, 8% 92%);
        border-radius: 2px;
    }

    .trash-item.paper-ball {
        background: radial-gradient(
            circle at 30% 30%,
            color-mix(in srgb, var(--trash-color), white 50%),
            var(--trash-color)
        );
        background-image: radial-gradient(
                circle at 30% 30%,
                color-mix(in srgb, var(--trash-color), white 55%),
                var(--trash-color)
            ),
            radial-gradient(
                circle at 70% 70%,
                rgba(255, 255, 255, 0.35),
                rgba(0, 0, 0, 0)
            );
        border-radius: 50%;
    }

    .trash-item.bottle {
        background: linear-gradient(
            180deg,
            color-mix(in srgb, var(--trash-color), white 30%),
            var(--trash-color)
        );
        background-image: linear-gradient(
                180deg,
                color-mix(in srgb, var(--trash-color), white 30%),
                var(--trash-color)
            ),
            linear-gradient(90deg, rgba(255, 255, 255, 0.25), rgba(0, 0, 0, 0));
        border-radius: 6px 6px 12px 12px;
    }

    .trash-item.bottle::after {
        content: "";
        position: absolute;
        top: -3px;
        left: 50%;
        width: 50%;
        height: 6px;
        background: color-mix(in srgb, var(--trash-color), black 20%);
        transform: translateX(-50%);
        border-radius: 2px;
    }

    .trash-item.toy {
        background: linear-gradient(
            135deg,
            color-mix(in srgb, var(--trash-color), white 20%),
            var(--trash-color)
        );
        background-image: linear-gradient(
                135deg,
                color-mix(in srgb, var(--trash-color), white 20%),
                var(--trash-color)
            ),
            radial-gradient(
                circle at 50% 20%,
                rgba(255, 255, 255, 0.35),
                rgba(0, 0, 0, 0)
            );
        clip-path: polygon(50% 0, 100% 35%, 82% 100%, 18% 100%, 0 35%);
    }
</style>
