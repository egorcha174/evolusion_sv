<script lang="ts">
    import { onMount } from "svelte";
    import { isDarkMode } from "../../theme/store";

    interface Raindrop {
        id: number;
        size: number;
        xStart: number;
        duration: number;
        delay: number;
        opacity: number;
    }

    interface GlassDrop {
        id: number;
        width: number;
        height: number;
        x: number;
        duration: number;
        delay: number;
    }

    let raindrops = $state<Raindrop[]>([]);
    let glassDrops = $state<GlassDrop[]>([]);

    onMount(() => {
        // Falling rain (background)
        raindrops = Array.from({ length: 100 }).map((_, i) => {
            const size = Math.random() * 15 + 10;
            const xStart = Math.random() * 100;
            const duration = Math.random() * 0.5 + 0.5;
            const delay = Math.random() * -2;
            const opacity = Math.random() * 0.3 + 0.1;

            return {
                id: i,
                size,
                xStart,
                duration,
                delay,
                opacity,
            };
        });

        // Glass drops (foreground)
        glassDrops = Array.from({ length: 20 }).map((_, i) => {
            const width = Math.random() * 4 + 3;
            const height = width * 1.2;
            const x = Math.random() * 100;
            const duration = Math.random() * 4 + 2;
            const delay = Math.random() * 15;

            return {
                id: i,
                width,
                height,
                x,
                duration,
                delay,
            };
        });
    });

    let rainColor = $derived($isDarkMode ? "174, 194, 224" : "51, 65, 85"); // Light blue vs Slate 700
    let glassColor = $derived($isDarkMode ? "200, 220, 240" : "71, 85, 105"); // Lighter blue vs Slate 600
</script>

<div
    class="rain-container"
    style="--rain-color: {rainColor}; --glass-color: {glassColor}"
>
    <!-- Falling raindrops -->
    {#each raindrops as drop (drop.id)}
        <div
            class="raindrop"
            style="
        --size: {drop.size}px;
        --x-start: {drop.xStart}vw;
        --opacity: {drop.opacity};
        animation-duration: {drop.duration}s;
        animation-delay: {drop.delay}s;
      "
        ></div>
    {/each}

    <!-- Water drops on glass -->
    {#each glassDrops as drop (drop.id)}
        <div
            class="glass-drop"
            style="
        left: {drop.x}vw;
        --width: {drop.width}px;
        --height: {drop.height}px;
        animation-duration: {drop.duration}s;
        animation-delay: {drop.delay}s;
      "
        ></div>
    {/each}
</div>

<style>
    .rain-container {
        position: fixed;
        inset: 0;
        overflow: hidden;
        pointer-events: none;
        z-index: -1;
    }

    /* Falling raindrops */
    .raindrop {
        position: absolute;
        top: -30px;
        left: var(--x-start);
        width: 2px;
        height: var(--size);
        background: linear-gradient(
            to bottom,
            rgba(var(--rain-color), 0),
            rgba(var(--rain-color), var(--opacity))
        );
        animation: rainfall linear infinite;
        will-change: transform;
    }

    @keyframes rainfall {
        0% {
            transform: translateY(0);
        }
        100% {
            transform: translateY(100vh);
        }
    }

    /* Glass drops */
    .glass-drop {
        position: absolute;
        top: -10px;
        width: var(--width);
        height: var(--height);
        background: linear-gradient(
            to bottom,
            rgba(var(--glass-color), 0.7),
            rgba(var(--rain-color), 0.5)
        );
        border-radius: 50% / 70%;
        box-shadow:
            inset 0 1px 2px rgba(255, 255, 255, 0.6),
            0 1px 2px rgba(0, 0, 0, 0.1);
        animation: glass-slide ease-in infinite;
        will-change: transform, opacity;
        z-index: 10;
    }

    @keyframes glass-slide {
        0% {
            transform: translateY(0) scaleY(1);
            opacity: 0;
        }
        10% {
            opacity: 0.8;
        }
        90% {
            transform: translateY(100vh) scaleY(1.5);
            opacity: 0.6;
        }
        100% {
            transform: translateY(100vh) scaleY(1.5);
            opacity: 0;
        }
    }
</style>
