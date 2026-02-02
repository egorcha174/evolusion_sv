<script lang="ts">
    import { onMount } from "svelte";
    import { nanoid } from "nanoid";
    import { isDarkMode } from "../../theme/store";

    interface Cloud {
        id: number;
        width: number;
        height: number;
        top: number;
        scale: number;
        duration: number;
        delay: number;
        opacity: number;
        color: string;
        zIndex: number;
        blur: string;
        shapeSeed: number;
        circles: Array<{ cx: number; cy: number; r: number }>;
        gradientId: string;
        morphDuration: number;
        morphDelay: number;
        pulseDuration: number;
    }

    let clouds = $state<Cloud[]>([]);

    // Pseudo-random generator based on seed
    function seededRandom(seed: number, offset: number): number {
        const x = Math.sin(seed * 43758.5453 + offset * 12.9898) * 10000;
        return x - Math.floor(x);
    }

    function generateCloudShape(
        width: number,
        height: number,
        seed: number,
        color: string,
    ) {
        const random = (offset: number) => seededRandom(seed, offset);

        const circles: Array<{ cx: number; cy: number; r: number }> = [];

        // МНОГО маленьких кругов вместо нескольких больших
        // Это создаст эффект пара без видимых комков
        const totalCircles = 80 + Math.floor(random(0) * 60); // 80-140 кругов!

        for (let i = 0; i < totalCircles; i++) {
            // Равномерно распределяем по всей области
            const cx = width * (0.1 + random(i * 3 + 1) * 0.8);
            const cy = height * (0.15 + random(i * 3 + 2) * 0.7);
            // Маленькие радиусы для однородности
            const r = width * (0.08 + random(i * 3 + 3) * 0.12);

            circles.push({ cx, cy, r });
        }

        const gradientId = `cloudGrad-${Math.floor(seed * 10000)}-${nanoid(4)}`;
        const morphDuration = 20 + random(10) * 20;
        const morphDelay = random(11) * -20;
        const pulseDuration = 30 + random(12) * 15;

        return {
            circles,
            gradientId,
            morphDuration,
            morphDelay,
            pulseDuration,
        };
    }

    function initClouds(isDark: boolean) {
        // Dark mode: subtle, lighter transparent colors
        const darkColors = [
            "#94a3b8",
            "#cbd5e1",
            "#64748b",
            "#e2e8f0",
            "#bfdbfe",
            "#dbeafe",
        ];

        // Light mode: darker, more visible colors (slate/blue-gray)
        const lightColors = [
            "#475569", // slate-600
            "#334155", // slate-700
            "#64748b", // slate-500
            "#94a3b8", // slate-400
            "#5b21b6", // violet-800 mostly transparent
            "#1e293b", // slate-800
        ];

        const colors = isDark ? darkColors : lightColors;

        clouds = Array.from({ length: 20 }).map((_, i) => {
            const scale = 0.6 + Math.random() * 1.6;
            // More elongated aspect ratio
            const aspectRatio = 1.8 + Math.random() * 0.8;
            const width = 250 * scale * (0.9 + Math.random() * 0.2);
            const height = width / aspectRatio;

            const top = Math.random() * 70 - 15;
            const duration = 80 + Math.random() * 80;
            const delay = Math.random() * -200;
            // Transparent
            // In light mode, we might want slightly higher opacity as well
            const baseOpacity = isDark ? 0.25 : 0.15;
            const opacity = baseOpacity + Math.random() * 0.25;
            const color = colors[Math.floor(Math.random() * colors.length)];

            const zIndex = Math.floor(scale * 2);
            // Еще больше blur для очень мягких краев
            const blur = scale < 1.0 ? "blur(15px)" : "blur(12px)";
            const parallaxDuration = duration / scale;

            const shapeSeed = Math.random() * 100000;
            const shape = generateCloudShape(width, height, shapeSeed, color);

            return {
                id: i,
                width,
                height,
                top,
                scale,
                duration: parallaxDuration,
                delay,
                opacity,
                color,
                zIndex,
                blur,
                shapeSeed,
                ...shape,
            };
        });
    }

    $effect(() => {
        initClouds($isDarkMode);
    });
</script>

<div class="clouds-container">
    {#each clouds as cloud (cloud.id)}
        <div
            class="cloud"
            style="
        --width: {cloud.width}px;
        --height: {cloud.height}px;
        --top: {cloud.top}vh;
        --opacity: {cloud.opacity};
        z-index: {cloud.zIndex};
        animation-duration: {cloud.duration}s;
        animation-delay: {cloud.delay}s;
        filter: {cloud.blur};
      "
        >
            <svg
                viewBox="0 0 {cloud.width} {cloud.height}"
                style="
          width: 100%;
          height: 100%;
          overflow: visible;
          animation: cloud-pulse {cloud.pulseDuration}s ease-in-out infinite;
        "
            >
                <defs>
                    <!-- Очень мягкий градиент - почти прозрачный в центре -->
                    <radialGradient
                        id={cloud.gradientId}
                        cx="50%"
                        cy="50%"
                        r="50%"
                        fx="50%"
                        fy="50%"
                    >
                        <stop
                            offset="0%"
                            stop-color={cloud.color}
                            stop-opacity="0.25"
                        />
                        <stop
                            offset="25%"
                            stop-color={cloud.color}
                            stop-opacity="0.2"
                        />
                        <stop
                            offset="50%"
                            stop-color={cloud.color}
                            stop-opacity="0.1"
                        />
                        <stop
                            offset="100%"
                            stop-color={cloud.color}
                            stop-opacity="0"
                        />
                    </radialGradient>
                </defs>
                <g
                    style="
            animation: cloud-morph {cloud.morphDuration}s infinite ease-in-out alternate;
            animation-delay: {cloud.morphDelay}s;
            transform-origin: center;
          "
                >
                    {#each cloud.circles as circle}
                        <circle
                            cx={circle.cx}
                            cy={circle.cy}
                            r={circle.r}
                            fill="url(#{cloud.gradientId})"
                        />
                    {/each}
                </g>
            </svg>
        </div>
    {/each}
</div>

<style>
    .clouds-container {
        position: fixed;
        inset: 0;
        overflow: hidden;
        pointer-events: none;
        z-index: -1;
    }

    .cloud {
        position: absolute;
        top: var(--top);
        left: -20%;
        width: var(--width);
        height: var(--height);
        opacity: var(--opacity);
        animation: cloud-drift linear infinite;
        will-change: transform;
    }

    @keyframes cloud-drift {
        from {
            transform: translateX(0);
        }
        to {
            transform: translateX(120vw);
        }
    }

    @keyframes cloud-morph {
        0% {
            transform: scale(1) skewX(0deg);
        }
        33% {
            transform: scale(1.05, 0.95) skewX(3deg);
        }
        66% {
            transform: scale(0.95, 1.05) skewX(-2deg);
        }
        100% {
            transform: scale(1.02, 0.98) skewX(1deg);
        }
    }

    @keyframes cloud-pulse {
        0%,
        100% {
            opacity: 1;
        }
        50% {
            opacity: 0.5;
        }
    }
</style>
