<script lang="ts">
  import { onMount } from 'svelte';
  import { cssVariables, themeSettings } from './store';

  onMount(() => {
    themeSettings.init();
  });
</script>

<svelte:head>
  {@html `<style id="theme-styles">${$cssVariables}</style>`}
</svelte:head>
