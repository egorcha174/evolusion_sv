<script lang="ts">
    import type { AuroraSettings } from "$domains/ui/background/types";

    interface Props {
        settings: AuroraSettings;
    }

    let { settings }: Props = $props();

    // Helper function to convert hex to rgba
    function hexToRgba(hex: string, alpha: number): string {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    // Reactive CSS variables
    let effectiveSpeed = $derived(settings.speed < 1 ? 18 : settings.speed);
    let effectiveBlur = $derived(settings.blur > 100 ? 18 : settings.blur);

    let containerStyle = $derived(
        [
            `--c1-mid: ${hexToRgba(settings.color1, 0.12)}`,
            `--c2-mid: ${hexToRgba(settings.color2, 0.18)}`,
            `--c3-mid: ${hexToRgba(settings.color3, 0.1)}`,
            `--c1-transparent: ${hexToRgba(settings.color1, 0.0)}`,
            `--c3-transparent: ${hexToRgba(settings.color3, 0.0)}`,
            `--global-blur: ${effectiveBlur}px`,
            `--global-saturate: ${settings.saturate}%`,
            `--speed-1: ${effectiveSpeed}s`,
            `--speed-2: ${Math.round(effectiveSpeed * 1.2)}s`,
            `--speed-3: ${Math.round(effectiveSpeed * 1.4)}s`,
            `--speed-4: ${Math.round(effectiveSpeed * 1.1)}s`,
            `--band-opacity: ${Math.max(
                0.3,
                Math.min(1.2, settings.intensity),
            )}`,
            `--stars-speed: ${settings.starSpeed}s`,
            `--stars-opacity: ${settings.stars ? 0.9 : 0}`,
        ].join(";"),
    );
</script>

<div class="aurora-scene" style={containerStyle}>
    <!-- Stars layer -->
    <div class="aurora-stars"></div>

    <!-- Aurora bands -->
    <div class="aurora-layer">
        <div class="aurora-band b1"></div>
        <div class="aurora-band b2"></div>
        <div class="aurora-band b3"></div>
        <div class="aurora-band b4"></div>
        <div class="aurora-noise"></div>
    </div>

    <!-- Horizon blend -->
    <div class="aurora-horizon"></div>
</div>

<style>
    /* Container with dark background */
    .aurora-scene {
        position: fixed;
        inset: 0;
        overflow: hidden;
        pointer-events: none;
        z-index: -1;
        background: radial-gradient(
                ellipse at 20% 10%,
                rgba(10, 18, 40, 0.6) 0%,
                rgba(2, 3, 10, 1) 50%
            ),
            linear-gradient(180deg, #00102a 0%, #00040a 60%);
    }

    /* Stars background */
    .aurora-stars {
        position: absolute;
        inset: 0;
        background-image: radial-gradient(
                1px 1px at 10% 20%,
                #fff 50%,
                transparent 51%
            ),
            radial-gradient(1px 1px at 30% 40%, #fff 50%, transparent 51%),
            radial-gradient(1px 1px at 70% 10%, #fff 50%, transparent 51%),
            radial-gradient(1px 1px at 85% 60%, #fff 50%, transparent 51%),
            radial-gradient(1px 1px at 50% 80%, #fff 50%, transparent 51%);
        opacity: var(--stars-opacity);
        filter: blur(0.6px);
        animation: aurora-twinkle var(--stars-speed) linear infinite;
        mix-blend-mode: screen;
    }

    @keyframes aurora-twinkle {
        0% {
            opacity: calc(var(--stars-opacity) * 0.85);
            transform: translateY(0);
        }
        50% {
            opacity: var(--stars-opacity);
            transform: translateY(-1px);
        }
        100% {
            opacity: calc(var(--stars-opacity) * 0.85);
            transform: translateY(0);
        }
    }

    /* Aurora layer container */
    .aurora-layer {
        position: absolute;
        left: -20%;
        right: -20%;
        height: 60%;
        top: 10%;
        pointer-events: none;
        mix-blend-mode: screen;
        filter: blur(var(--global-blur)) saturate(var(--global-saturate));
        transform: translateZ(0);
        transition: filter 300ms linear;
    }

    /* Aurora bands base */
    .aurora-band {
        position: absolute;
        left: 0;
        right: 0;
        opacity: var(--band-opacity);
        transform-origin: center;
        will-change: transform, opacity, filter;
        background: linear-gradient(
            90deg,
            var(--c1-transparent) 0%,
            var(--c1-mid) 20%,
            var(--c2-mid) 50%,
            var(--c3-mid) 80%,
            var(--c3-transparent) 100%
        );
    }

    .aurora-band.b1 {
        top: 0%;
        height: 40%;
        animation: aurora-move-1 var(--speed-1) infinite ease-in-out;
        filter: blur(14px) contrast(1.05);
    }

    .aurora-band.b2 {
        top: 20%;
        height: 50%;
        animation: aurora-move-2 var(--speed-2) infinite ease-in-out;
        filter: blur(20px) contrast(1.1);
    }

    .aurora-band.b3 {
        top: 35%;
        height: 60%;
        animation: aurora-move-3 var(--speed-3) infinite ease-in-out;
        filter: blur(28px) contrast(1.15);
    }

    .aurora-band.b4 {
        top: 50%;
        height: 45%;
        animation: aurora-move-4 var(--speed-4) infinite ease-in-out;
        filter: blur(34px) contrast(1.2);
    }

    /* Noise overlay */
    .aurora-noise {
        position: absolute;
        inset: 0;
        background-image: radial-gradient(
                circle at 20% 30%,
                rgba(255, 255, 255, 0.02),
                transparent 10%
            ),
            radial-gradient(
                circle at 70% 60%,
                rgba(255, 255, 255, 0.02),
                transparent 12%
            );
        mix-blend-mode: overlay;
        opacity: 0.6;
        filter: blur(6px);
        animation: aurora-drift 30s linear infinite;
    }

    /* Horizon gradient */
    .aurora-horizon {
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
        height: 22%;
        background: linear-gradient(
            to bottom,
            transparent 0%,
            rgba(0, 0, 0, 0.6) 60%,
            rgba(0, 0, 0, 1) 100%
        );
        pointer-events: none;
    }

    /* Aurora animation keyframes */
    @keyframes aurora-move-1 {
        0% {
            transform: skewY(-6deg) translateX(-12%) scaleX(1);
            opacity: calc(var(--band-opacity) * 0.92);
        }
        50% {
            transform: skewY(-4deg) translateX(6%) scaleX(1.05);
            opacity: calc(var(--band-opacity) * 0.7);
        }
        100% {
            transform: skewY(-6deg) translateX(-12%) scaleX(1);
            opacity: calc(var(--band-opacity) * 0.92);
        }
    }

    @keyframes aurora-move-2 {
        0% {
            transform: skewY(4deg) translateX(-8%) scaleX(1);
            opacity: calc(var(--band-opacity) * 0.8);
        }
        50% {
            transform: skewY(6deg) translateX(10%) scaleX(1.08);
            opacity: calc(var(--band-opacity) * 0.55);
        }
        100% {
            transform: skewY(4deg) translateX(-8%) scaleX(1);
            opacity: calc(var(--band-opacity) * 0.8);
        }
    }

    @keyframes aurora-move-3 {
        0% {
            transform: skewY(-2deg) translateX(-6%) scaleX(1);
            opacity: calc(var(--band-opacity) * 0.65);
        }
        50% {
            transform: skewY(0deg) translateX(12%) scaleX(1.12);
            opacity: calc(var(--band-opacity) * 0.45);
        }
        100% {
            transform: skewY(-2deg) translateX(-6%) scaleX(1);
            opacity: calc(var(--band-opacity) * 0.65);
        }
    }

    @keyframes aurora-move-4 {
        0% {
            transform: skewY(8deg) translateX(-4%) scaleX(1);
            opacity: calc(var(--band-opacity) * 0.6);
        }
        50% {
            transform: skewY(10deg) translateX(14%) scaleX(1.15);
            opacity: calc(var(--band-opacity) * 0.35);
        }
        100% {
            transform: skewY(8deg) translateX(-4%) scaleX(1);
            opacity: calc(var(--band-opacity) * 0.6);
        }
    }

    @keyframes aurora-drift {
        0% {
            transform: translateX(-10%);
        }
        50% {
            transform: translateX(10%);
        }
        100% {
            transform: translateX(-10%);
        }
    }
</style>
