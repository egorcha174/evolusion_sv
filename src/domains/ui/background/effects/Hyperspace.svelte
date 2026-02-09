<script lang="ts">
    import { onMount } from "svelte";
    import type { HyperspaceSettings } from "../types";

    let {
        settings = {
            backgroundColor: "#000000",
            starColor: "#ffffff",
            starSpeed: 25,
            starDensity: 300,
            starTrailLength: 0.92,
            fov: 200,
        },
    }: { settings?: HyperspaceSettings } = $props();

    let canvas: HTMLCanvasElement;
    let animationFrameId: number;

    interface Star {
        x: number;
        y: number;
        z: number;
        px: number;
        py: number;
    }

    let width = 0;
    let height = 0;
    let centerX = 0;
    let centerY = 0;
    let stars: Star[] = [];
    let dpr = 1;

    function initStars() {
        stars = [];
        for (let i = 0; i < settings.starDensity; i++) {
            stars.push({
                x: Math.random() * width - width / 2,
                y: Math.random() * height - height / 2,
                z: Math.random() * width,
                px: 0,
                py: 0,
            });
        }
    }

    function resizeCanvas() {
        if (!canvas) return;
        dpr = window.devicePixelRatio || 1;
        width = window.innerWidth;
        height = window.innerHeight;
        centerX = width / 2;
        centerY = height / 2;
        canvas.width = Math.floor(width * dpr);
        canvas.height = Math.floor(height * dpr);
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        initStars();
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

            // Clear with background color
            ctx.fillStyle = settings.backgroundColor;
            ctx.fillRect(0, 0, width, height);

            // Draw stars with motion trails
            ctx.fillStyle = settings.starColor;
            ctx.strokeStyle = settings.starColor;

            for (let i = 0; i < stars.length; i++) {
                const star = stars[i];

                // Move star forward
                star.z -= settings.starSpeed;

                // Reset star if it goes behind camera
                if (star.z <= 0) {
                    star.x = Math.random() * width - width / 2;
                    star.y = Math.random() * height - height / 2;
                    star.z = width;
                    star.px = 0;
                    star.py = 0;
                    continue;
                }

                // 3D projection
                const k = settings.fov / star.z;
                const sx = star.x * k + centerX;
                const sy = star.y * k + centerY;

                // Skip if outside viewport
                if (sx < 0 || sx > width || sy < 0 || sy > height) {
                    star.px = sx;
                    star.py = sy;
                    continue;
                }

                // Calculate star size based on depth
                const size = (1 - star.z / width) * 3;

                // Draw star trail (streak effect)
                if (star.px !== 0 && star.py !== 0) {
                    ctx.lineWidth = size;
                    ctx.globalAlpha = settings.starTrailLength;
                    ctx.beginPath();
                    ctx.moveTo(star.px, star.py);
                    ctx.lineTo(sx, sy);
                    ctx.stroke();
                }

                // Draw star point
                ctx.globalAlpha = 1;
                ctx.beginPath();
                ctx.arc(sx, sy, size / 2, 0, Math.PI * 2);
                ctx.fill();

                // Store current position for next frame trail
                star.px = sx;
                star.py = sy;
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
</script>

<canvas bind:this={canvas} class="hyperspace-canvas"></canvas>

<style>
    .hyperspace-canvas {
        display: block;
        position: fixed;
        inset: 0;
        z-index: -1;
    }
</style>
