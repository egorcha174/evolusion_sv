
<script lang="ts">
  import { activeScheme } from './store';
  import SolidBackground from './components/SolidBackground.svelte';
  import GradientBackground from './components/GradientBackground.svelte';
  import ImageBackground from './components/ImageBackground.svelte';
  import AnimationBackground from './components/AnimationBackground.svelte';
</script>

<div class="background-container">
  {#if $activeScheme.dashboardBackgroundType === 'color'}
    <SolidBackground color={$activeScheme.dashboardBackgroundColor} />
  {:else if $activeScheme.dashboardBackgroundType === 'gradient'}
    <GradientBackground config={$activeScheme.dashboardGradient} />
  {:else if $activeScheme.dashboardBackgroundType === 'image'}
    <ImageBackground config={$activeScheme.dashboardBackgroundImage} />
  {:else if $activeScheme.dashboardBackgroundType === 'animation'}
    <AnimationBackground config={$activeScheme.dashboardBackgroundAnimation} />
  {/if}
</div>

<style>
  .background-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: -1;
    transition: opacity 0.3s ease;
    pointer-events: none; /* Let clicks pass through */
  }
</style>
