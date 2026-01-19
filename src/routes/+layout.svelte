<script lang="ts">
  import { onMount } from 'svelte';
  import { appState, loadLayout, loadServerConfig } from '../domains/app/store';
  import { initializeHAConnection, disconnectHA } from '../domains/ha/store';
  import InfoPanel from '../domains/ui/InfoPanel.svelte';
  import DashboardHeader from '../domains/ui/DashboardHeader.svelte';
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
  <!-- Left Side: InfoPanel (Visible on desktop) -->
  <InfoPanel />

  <!-- Right Side: Main Application Content -->
  <div class="main-content">
    <DashboardHeader />
    
    <main>
      {@render children()}
    </main>
  </div>
</div>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    background: #f5f7fa;
    color: #333;
    /* Ensure body allows full height flex layout */
    height: 100vh;
    overflow: hidden;
  }

  .layout-container {
    display: flex;
    height: 100vh;
    width: 100vw;
    overflow: hidden;
  }

  .main-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 0; /* Prevent flex overflow */
    position: relative;
    height: 100%;
    overflow-y: auto; /* Scroll is here */
  }

  main {
    flex: 1;
    padding: 2rem;
  }

  @media (max-width: 768px) {
    main {
      padding: 1rem;
    }
  }
</style>