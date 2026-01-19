<script lang="ts">
  import { onMount } from 'svelte';
  import { appState, loadLayout, loadServerConfig } from '../domains/app/store';
  import { initializeHAConnection, disconnectHA } from '../domains/ha/store';
  import Sidebar from '../domains/ui/Sidebar.svelte';
  import Header from '../domains/ui/Header.svelte';
  import 'iconify-icon';
  import '../app.css';
  
  let { children } = $props();

  onMount(async () => {
    await loadServerConfig();
    await loadLayout();
  });

  // Reactive connection management
  $effect(() => {
    const active = $appState.activeServer;
    if (active?.url && active?.token) {
      initializeHAConnection(active.url, active.token);
    } else {
      disconnectHA();
    }
  });
</script>

<div class="layout-container">
  <Sidebar />
  <Header />

  <main>
    {@render children()}
  </main>
</div>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    background: #f5f7fa;
    color: #333;
  }

  main {
    margin-left: 260px; /* Match sidebar width */
    margin-top: 64px; /* Match header height */
    padding: 2rem;
    min-height: calc(100vh - 64px);
    transition: margin-left 0.3s ease;
  }

  @media (max-width: 768px) {
    main {
      margin-left: 0;
      padding: 1rem;
    }
  }
</style>