<script lang="ts">
    import { onMount } from "svelte";
    import { isDarkMode } from "../../theme/store";

    let snowflakes = $state<
        Array<{
            id: number;
            size: number;
            xStart: number;
            xEnd: number;
            duration: number;
            delay: number;
            rotate: number;
            opacity: number;
            blur: number;
        }>
    >([]);

    onMount(() => {
        // Generate 150 snowflakes with varied properties
        snowflakes = Array.from({ length: 150 }).map((_, i) => {
            const size = Math.random() * 5 + 2;
            const xStart = Math.random() * 100;
            const xEnd = xStart + (Math.random() - 0.5) * 50;
            const duration = Math.random() * 10 + 10;
            const delay = Math.random() * -20;
            const rotate = (Math.random() - 0.5) * 720;
            const opacity = Math.random() * 0.5 + 0.3;
            const blur = size > 4 ? 1 : 0;

            return {
                id: i,
                size,
                xStart,
                xEnd,
                duration,
                delay,
                rotate,
                opacity,
                blur,
            };
        });
    });

    let snowColor = $derived($isDarkMode ? "255, 255, 255" : "148, 163, 184"); // White vs Slate 400
</script>

<div class="snow-container" style="--snow-color: {snowColor}">
    {#each snowflakes as flake (flake.id)}
        <div
            class="snowflake"
            style="
        --size: {flake.size}px;
        --x-start: {flake.xStart}vw;
        --x-end: {flake.xEnd}vw;
        --rotate: {flake.rotate}deg;
        --opacity: {flake.opacity};
        animation-duration: {flake.duration}s;
        animation-delay: {flake.delay}s;
        filter: blur({flake.blur}px);
      "
        ></div>
    {/each}

    <!-- Snow banks at bottom -->
    <div class="snow-banks">
        <div class="snow-bank bank-1"></div>
        <div class="snow-bank bank-2"></div>
        <div class="snow-bank bank-3"></div>
    </div>
</div>

<style>
    .snow-container {
        position: fixed;
        inset: 0;
        overflow: hidden;
        pointer-events: none;
        z-index: -1;
    }

    .snowflake {
        position: absolute;
        top: -10px;
        left: var(--x-start);
        width: var(--size);
        height: var(--size);
        background: rgb(var(--snow-color));
        border-radius: 50%;
        opacity: var(--opacity);
        animation: snowfall linear infinite;
        will-change: transform, opacity;
    }

    @keyframes snowfall {
        0% {
            transform: translateY(0) translateX(0) rotate(0deg);
            opacity: var(--opacity);
        }
        100% {
            transform: translateY(100vh)
                translateX(calc(var(--x-end) - var(--x-start)))
                rotate(var(--rotate));
            opacity: calc(var(--opacity) * 0.3);
        }
    }

    /* Snow banks */
    .snow-banks {
        position: absolute;
        bottom: 0;
        left: 0;
        width: 100%;
        height: 100px;
        overflow: hidden;
        pointer-events: none;
    }

    .snow-bank {
        position: absolute;
        border-radius: 50%;
    }

    .snow-bank.bank-1 {
        bottom: -64px;
        left: -5%;
        width: 110%;
        height: 128px;
        background: rgba(var(--snow-color), 0.8);
        filter: blur(5px);
        opacity: 0.8;
    }

    .snow-bank.bank-2 {
        bottom: -80px;
        left: 20%;
        width: 80%;
        height: 128px;
        background: rgba(var(--snow-color), 0.7);
        filter: blur(8px);
        opacity: 0.7;
    }

    .snow-bank.bank-3 {
        bottom: -48px;
        right: 30%;
        width: 60%;
        height: 96px;
        background: rgba(var(--snow-color), 0.9);
        filter: blur(3px);
    }
</style>
