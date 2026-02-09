<script lang="ts">
    import { onMount } from "svelte";
    import type { MatrixSettings } from "../types";

    const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&";

    let {
        settings = {
            backgroundColor: "#030703",
            glyphColor: "#00ff66",
            glowColor: "#66ff99",
            fontSize: 16,
            speed: 1.2,
            fadeStrength: 0.08,
            density: 0.95,
        },
    }: { settings?: MatrixSettings } = $props();

    let canvas: HTMLCanvasElement;
    let animationFrameId: number;

    let width = 0;
    let height = 0;
    let columns = 0;
    let drops: number[] = [];
    let dpr = 1;
    let lastFontSize = $derived(settings.fontSize);

    function resetDrops() {
        columns = Math.max(1, Math.floor(width / settings.fontSize));
        drops = new Array(columns)
            .fill(0)
            .map(() =>
                Math.floor(Math.random() * (height / settings.fontSize)),
            );
    }

    function resizeCanvas() {
        if (!canvas) return;
        dpr = window.devicePixelRatio || 1;
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = Math.floor(width * dpr);
        canvas.height = Math.floor(height * dpr);
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        resetDrops();
    }

    onMount(() => {
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        resizeCanvas();

        // Visibility-aware pause
        let isVisible = !document.hidden;
        const onVisibilityChange = () => {
            isVisible = !document.hidden;
        };
        document.addEventListener("visibilitychange", onVisibilityChange);

        const animate = () => {
            if (!ctx) return;

            // Skip rendering when tab is hidden to save CPU
            if (!isVisible) {
                animationFrameId = requestAnimationFrame(animate);
                return;
            }

            ctx.save();
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

            if (settings.fontSize !== lastFontSize) {
                lastFontSize = settings.fontSize;
                resetDrops();
            }

            const fade = Math.min(Math.max(settings.fadeStrength, 0.02), 0.3);
            ctx.fillStyle = hexToRgba(settings.backgroundColor, fade);
            ctx.fillRect(0, 0, width, height);

            ctx.font = `${settings.fontSize}px "Consolas", "Courier New", monospace`;
            ctx.textBaseline = "top";
            ctx.fillStyle = settings.glyphColor;
            ctx.shadowColor = settings.glowColor;
            ctx.shadowBlur = settings.fontSize * 0.6;

            for (let i = 0; i < columns; i++) {
                if (Math.random() > settings.density) continue;

                const x = i * settings.fontSize;
                const y = drops[i] * settings.fontSize;
                const glyph = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
                ctx.fillText(glyph, x, y);

                drops[i] += settings.speed;
                if (y > height && Math.random() > 0.975) {
                    drops[i] = 0;
                }
            }

            ctx.restore();
            animationFrameId = requestAnimationFrame(animate);
        };

        animate();

        window.addEventListener("resize", resizeCanvas);
        return () => {
            document.removeEventListener(
                "visibilitychange",
                onVisibilityChange,
            );
            window.removeEventListener("resize", resizeCanvas);
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
            }
        };
    });

    function hexToRgba(hex: string, alpha: number) {
        const normalized = hex.replace("#", "");
        const value =
            normalized.length === 3
                ? normalized
                      .split("")
                      .map((c) => c + c)
                      .join("")
                : normalized;
        const r = parseInt(value.slice(0, 2), 16);
        const g = parseInt(value.slice(2, 4), 16);
        const b = parseInt(value.slice(4, 6), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
</script>

<canvas bind:this={canvas} class="matrix-canvas"></canvas>

<style>
    .matrix-canvas {
        display: block;
        position: fixed;
        inset: 0;
        z-index: -1;
    }
</style>
