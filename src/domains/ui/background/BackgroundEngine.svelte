<script lang="ts">
    import { backgroundStore } from "./store";
    import Aurora from "./effects/Aurora.svelte";
    import Snow from "./effects/Snow.svelte";
    import Rain from "./effects/Rain.svelte";
    import Clouds from "./effects/Clouds.svelte";
    import River from "./effects/River.svelte";
    import Lightning from "./effects/Lightning.svelte";
    import Tron from "./effects/Tron.svelte";
    import Sun from "./effects/Sun.svelte";
</script>

{#if $backgroundStore.effectType === "aurora"}
    <Aurora settings={$backgroundStore.settings.aurora} />
{:else if $backgroundStore.effectType === "snow"}
    <Snow />
{:else if $backgroundStore.effectType === "rain"}
    <Rain />
{:else if $backgroundStore.effectType === "clouds"}
    <Clouds />
{:else if $backgroundStore.effectType === "river"}
    <River />
{:else if $backgroundStore.effectType === "thunderstorm"}
    <!-- Dark clouds + rain + lightning -->
    <Clouds />
    <Rain />
    <Lightning />
{:else if $backgroundStore.effectType === "tron"}
    <Tron settings={$backgroundStore.settings.tron} />
{:else if $backgroundStore.effectType === "sun-glare"}
    <Sun />
{:else if $backgroundStore.effectType === "sun-clouds"}
    <!-- Sun + Clouds -->
    <Sun />
    <Clouds />
{/if}
