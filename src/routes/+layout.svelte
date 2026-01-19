<script lang="ts">
  import { onMount } from 'svelte';
  import { appState, loadLayout, loadServerConfig } from '../domains/app/store';
  import { initializeHAConnection, disconnectHA } from '../domains/ha/store';
  import InfoPanel from '../domains/ui/InfoPanel.svelte';
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
  <!-- Left Side: InfoPanel (Visible on desktop) -->
  <InfoPanel />

  <!-- Right Side: Main Application Content -->
  <div class="main-content">
    <div class="header-wrapper">
      <Header />
    </div>
    
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

  /* Override fixed positioning from Header component to fit in flex flow */
  :global(.header) {
    position: sticky !important;
    top: 0 !important;
    left: 0 !important;
    width: 100% !important;
    z-index: 40 !important;
    /* Reset margins if any */
    margin: 0 !important;
  }

  main {
    /* Reset margins from previous fixed sidebar layout */
    margin-left: 0 !important; 
    margin-top: 0 !important;
    padding: 2rem;
    flex: 1;
  }

  @media (max-width: 768px) {
    main {
      padding: 1rem;
    }
  }
</style>