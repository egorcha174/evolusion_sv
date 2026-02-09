<script lang="ts">
    import { weatherStore } from "$lib/weather/store";
    import { backgroundStore } from "$domains/ui/background/store";
    import type { BackgroundEffectType } from "$domains/ui/background/types";
    import { untrack } from "svelte";

    const weatherToEffectMap: Record<number, BackgroundEffectType> = {
        0: "sun-glare", // Clear
        1: "sun-clouds", // Few clouds
        2: "clouds", // Partly cloudy
        3: "clouds", // Overcast
        45: "river", // Fog, using river for a misty effect
        48: "river", // Fog
        51: "rain", // Drizzle
        53: "rain", // Drizzle
        55: "rain", // Drizzle
        56: "rain", // Freezing Drizzle
        57: "rain", // Freezing Drizzle
        61: "rain", // Rain
        63: "rain", // Rain
        65: "rain", // Heavy Rain
        66: "rain", // Freezing Rain
        67: "rain", // Freezing Rain
        71: "snow", // Snow
        73: "snow", // Snow
        75: "snow", // Heavy Snow
        77: "snow", // Snow
        80: "rain", // Showers
        81: "rain", // Showers
        82: "rain", // Showers
        85: "snow", // Snow Showers
        86: "snow", // Snow Showers
        95: "thunderstorm", // Thunderstorm
        96: "thunderstorm", // Thunderstorm w/ Hail
        99: "thunderstorm", // Thunderstorm w/ Hail
    };

    // Derived values to track ONLY what we need
    let userSelected = $derived($backgroundStore.userSelectedEffect);
    let weatherCode = $derived($weatherStore.current?.weatherCode);

    $effect(() => {
        // This effect runs only when userSelected or weatherCode changes
        const selected = userSelected;
        const wCode = weatherCode;

        untrack(() => {
            // Read current state without creating a dependency
            const currentEffect = $backgroundStore.effectType;

            if (selected !== "auto") {
                if (currentEffect !== selected) {
                    backgroundStore.setEffect(selected);
                }
            } else {
                // Auto mode based on weather
                let targetEffect: BackgroundEffectType = "none";

                if (wCode !== undefined) {
                    // Check for Clear (0) with Day/Night
                    if (wCode === 0) {
                        // We need access to isDay.
                        // Since we are inside an effect tracking weatherCode, we should also track current weather data
                        const isDay = $weatherStore.current?.isDay ?? true; // Default to day if unknown
                        targetEffect = isDay ? "sun-glare" : "aurora";
                    } else {
                        targetEffect = weatherToEffectMap[wCode] || "none";
                    }
                }

                if (currentEffect !== targetEffect) {
                    backgroundStore.setEffect(targetEffect);
                }
            }
        });
    });
</script>
