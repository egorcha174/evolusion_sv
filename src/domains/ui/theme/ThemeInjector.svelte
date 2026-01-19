<script lang="ts">
  import { onMount } from 'svelte';
  import { themeState, themeSettings } from './store';

  onMount(() => {
    themeSettings.init();
  });
</script>

<svelte:head>
  {@html `<style id="theme-styles">${$themeState.css}</style>`}
</svelte:head>
