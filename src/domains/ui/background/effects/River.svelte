<!-- River/Ocean Waves Effect -->
<script lang="ts">
    import { isDarkMode } from "../../theme/store";

    let waveColor = $derived($isDarkMode ? "#0099ff" : "#1e40af"); // Light blue vs Dark Blue (blue-800)
</script>

<div class="river-container">
    <!-- Wave 1 - Background -->
    <svg class="wave wave-1" viewBox="0 0 1440 320" preserveAspectRatio="none">
        <path
            fill={waveColor}
            fill-opacity="0.16"
            d="M0,192L48,197.3C96,203,192,213,288,229.3C384,245,480,267,576,250.7C672,235,768,181,864,181.3C960,181,1056,235,1152,234.7C1248,235,1344,181,1392,154.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
        ></path>
    </svg>

    <!-- Wave 2 - Mid-back -->
    <svg class="wave wave-2" viewBox="0 0 1440 320" preserveAspectRatio="none">
        <path
            fill={waveColor}
            fill-opacity="0.32"
            d="M0,96L48,112C96,128,192,160,288,186.7C384,213,480,235,576,213.3C672,192,768,128,864,128C960,128,1056,192,1152,208C1248,224,1344,192,1392,176L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
        ></path>
    </svg>

    <!-- Wave 3 - Mid-front -->
    <svg class="wave wave-3" viewBox="0 0 1440 320" preserveAspectRatio="none">
        <path
            fill={waveColor}
            fill-opacity="0.24"
            d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,197.3C672,192,768,160,864,154.7C960,149,1056,171,1152,186.7C1248,203,1344,213,1392,218.7L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
        ></path>
    </svg>

    <!-- Wave 4 - Foreground -->
    <svg class="wave wave-4" viewBox="0 0 1440 320" preserveAspectRatio="none">
        <path
            fill={waveColor}
            fill-opacity="0.20"
            d="M0,160L48,170.7C96,181,192,203,288,192C384,181,480,139,576,128C672,117,768,139,864,149.3C960,160,1056,160,1152,149.3C1248,139,1344,117,1392,106.7L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
        ></path>
    </svg>
</div>

<style>
    .river-container {
        position: fixed;
        bottom: 0;
        left: 0;
        width: 100%;
        height: 200px;
        overflow: hidden;
        pointer-events: none;
        z-index: -1;
    }

    .wave {
        position: absolute;
        bottom: 0;
        width: 300%;
        height: 100%;
    }

    .wave-1 {
        left: 0;
        animation: wave-move-1 25s linear infinite;
    }

    .wave-2 {
        left: -100%;
        animation: wave-move-2 18s linear infinite;
    }

    .wave-3 {
        left: -50%;
        animation: wave-move-3 22s linear infinite;
    }

    .wave-4 {
        left: -150%;
        animation: wave-move-4 20s linear infinite;
    }

    @keyframes wave-move-1 {
        0% {
            transform: translateX(0);
        }
        100% {
            transform: translateX(-33.333%);
        }
    }

    @keyframes wave-move-2 {
        0% {
            transform: translateX(0);
        }
        100% {
            transform: translateX(33.333%);
        }
    }

    @keyframes wave-move-3 {
        0% {
            transform: translateX(0);
        }
        100% {
            transform: translateX(-33.333%);
        }
    }

    @keyframes wave-move-4 {
        0% {
            transform: translateX(0);
        }
        100% {
            transform: translateX(33.333%);
        }
    }
</style>
