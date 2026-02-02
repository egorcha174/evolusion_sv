<script lang="ts">
    import { isDarkMode } from "../../theme/store";

    // Dark Mode: "screen" or "overlay" for glowing lights on dark bg
    // Light Mode: "multiply" or "normal" with darker colors for visibility on white bg

    // We'll use CSS variables to control colors/blending
    let blendMode = $derived($isDarkMode ? "screen" : "multiply");
    let mainOrbColor = $derived(
        $isDarkMode ? "rgba(254, 243, 199, 0.2)" : "rgba(245, 158, 11, 0.3)",
    ); // Yellow-100/20 vs Amber-500/30
    let secondaryOrbColor = $derived(
        $isDarkMode ? "rgba(254, 215, 170, 0.3)" : "rgba(234, 88, 12, 0.2)",
    ); // Orange-200/30 vs Orange-600/20
    let rayGradient = $derived(
        $isDarkMode
            ? "conic-gradient(from 0deg, transparent 0deg, rgba(255, 223, 150, 0.3) 10deg, transparent 20deg, transparent 40deg, rgba(255, 255, 255, 0.2) 50deg, transparent 60deg, transparent 90deg, rgba(255, 200, 100, 0.1) 100deg, transparent 120deg)"
            : "conic-gradient(from 0deg, transparent 0deg, rgba(245, 158, 11, 0.2) 10deg, transparent 20deg, transparent 40deg, rgba(234, 88, 12, 0.15) 50deg, transparent 60deg, transparent 90deg, rgba(217, 119, 6, 0.1) 100deg, transparent 120deg)",
    );

    let flare1 = $derived(
        $isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(251, 146, 60, 0.4)",
    );
    let flare2 = $derived(
        $isDarkMode ? "rgba(254, 240, 138, 0.05)" : "rgba(251, 191, 36, 0.3)",
    );
    let flare3 = $derived(
        $isDarkMode ? "rgba(255, 237, 213, 0.2)" : "rgba(249, 115, 22, 0.2)",
    );
</script>

<div
    class="sun-container"
    style="
        --blend-mode: {blendMode};
        --main-orb: {mainOrbColor};
        --sec-orb: {secondaryOrbColor};
        --ray-grad: {rayGradient};
        --flare-1: {flare1};
        --flare-2: {flare2};
        --flare-3: {flare3};
    "
>
    <!-- Main Sun Glow -->
    <div class="orb main-orb"></div>
    <div class="orb sec-orb"></div>

    <!-- Rotating Rays -->
    <div class="rays"></div>

    <!-- Lens Flares -->
    <div class="flare flare-1"></div>
    <div class="flare flare-2"></div>
    <div class="flare flare-3"></div>
</div>

<style>
    .sun-container {
        position: fixed;
        inset: 0;
        pointer-events: none;
        overflow: hidden;
        z-index: -1;
    }

    .orb {
        position: absolute;
        border-radius: 50%;
        filter: blur(80px);
        mix-blend-mode: var(--blend-mode);
    }

    .main-orb {
        top: -10vw;
        right: -10vw;
        width: 60vw;
        height: 60vw;
        background: var(--main-orb);
    }

    .sec-orb {
        top: -5vw;
        right: -5vw;
        width: 30vw;
        height: 30vw;
        background: var(--sec-orb);
        filter: blur(50px);
    }

    .rays {
        position: absolute;
        top: -80vw;
        right: -80vw;
        width: 200vw;
        height: 200vw;
        opacity: 0.2;
        mix-blend-mode: overlay; /* Always overlay for rays usually looks best, but check light mode */
        background: var(--ray-grad);
        animation: sun-spin 120s linear infinite;
    }

    /* Flares */
    .flare {
        position: absolute;
        border-radius: 50%;
        mix-blend-mode: screen; /* Typically screen is good for flares, but might need normal in light mode */
    }
    /* Override blend mode for light mode if needed */
    /* But since flares are light additions, screen usually works even on light bg ? No, screen on white is invisible. */
    /* So we inherit blend mode or force multiply? Flares are usually light artifacts. */
    /* In light mode (white bg), we want darker spots maybe? Or just visible colored spots. */
    /* Let's use var(--blend-mode) which switches to multiply in light mode to make them visible dark artifacts, or normal/overlay */

    .flare-1 {
        top: 30%;
        right: 30%;
        width: 3rem;
        height: 3rem;
        background: var(--flare-1);
        filter: blur(4px);
        animation: flare-float 8s ease-in-out infinite;
        mix-blend-mode: var(--blend-mode);
    }

    .flare-2 {
        top: 45%;
        right: 45%;
        width: 6rem;
        height: 6rem;
        background: var(--flare-2);
        filter: blur(24px);
        animation: flare-float 12s ease-in-out infinite reverse;
        mix-blend-mode: var(--blend-mode);
    }

    .flare-3 {
        top: 60%;
        right: 60%;
        width: 1.5rem;
        height: 1.5rem;
        background: var(--flare-3);
        filter: blur(2px);
        animation: flare-float 15s ease-in-out infinite;
        mix-blend-mode: var(--blend-mode);
    }

    @keyframes sun-spin {
        from {
            transform: rotate(0deg);
        }
        to {
            transform: rotate(360deg);
        }
    }

    @keyframes flare-float {
        0% {
            transform: translate(0, 0);
            opacity: 0.3;
        }
        50% {
            transform: translate(10px, -15px);
            opacity: 0.5;
        }
        100% {
            transform: translate(0, 0);
            opacity: 0.3;
        }
    }
</style>
