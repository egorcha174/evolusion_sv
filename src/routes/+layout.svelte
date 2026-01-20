
<script lang="ts">
  import { onMount } from 'svelte';
  import { appState, loadLayout, loadServerConfig } from '../domains/app/store';
  import { initializeHAConnection, disconnectHA } from '../domains/ha/store';
  import { themeStore } from '../domains/theme/store';
  import BackgroundRenderer from '../domains/theme/BackgroundRenderer.svelte';
  import Sidebar from '../domains/ui/Sidebar.svelte';
  import DashboardHeader from '../domains/ui/DashboardHeader.svelte';
  import 'iconify-icon';
  import '../app.css';
  
  let { children } = $props();

  onMount(async () => {
    await loadServerConfig();
    await loadLayout();
    await themeStore.init();
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

<BackgroundRenderer />

<div class="layout-container">
  <!-- Left Nav & Info -->
  <Sidebar />
  
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
    /* Basic fallback, real colors set by themeStore via CSS vars */
    background: transparent; 
    color: var(--text-primary, #333);
    height: 100vh;
    overflow: hidden;
    transition: color 0.2s ease;
  }

  .layout-container {
    display: flex;
    height: 100vh;
    width: 100vw;
    overflow: hidden;
    position: relative;
    z-index: 1;
  }

  .main-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 0;
    position: relative;
    height: 100%;
    overflow-y: auto;
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
