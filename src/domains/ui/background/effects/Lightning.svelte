<!-- Lightning Flash Effect for Thunderstorm -->
<div class="lightning-flash"></div>

<style>
    .lightning-flash {
        position: fixed;
        inset: 0;
        background: white;
        pointer-events: none;
        z-index: 20;
        mix-blend-mode: overlay;
        animation: lightning 7s infinite;
    }

    @keyframes lightning {
        0%,
        92%,
        100% {
            opacity: 0;
        }
        93% {
            opacity: 0.6;
        }
        94% {
            opacity: 0.2;
        }
        96% {
            opacity: 0.8;
        }
        98% {
            opacity: 0;
        }
    }
</style>
