
<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { toggleSettings } from '../../domains/ui/store';

  // Since settings are now a drawer, accessing /settings directly 
  // should redirect to home and open the drawer.
  onMount(() => {
    goto('/', { replaceState: true });
    toggleSettings();
  });
</script>

<div class="redirect-notice">
  Redirecting to settings...
</div>

<style>
  .redirect-notice {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: var(--text-muted);
  }
</style>
