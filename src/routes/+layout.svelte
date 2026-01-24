
<script lang="ts">
  import { onMount } from 'svelte';
  import { appState, loadLayout, loadServerConfig, loadSavedServers } from '../domains/app/store';
  import { dashboardStore } from '../domains/app/dashboardStore';
  import { initializeHAConnection, disconnectHA } from '../domains/ha/store';
  import { themeStore } from '../domains/theme/store';
  import { editorStore } from '../domains/ui/editor/store'; // Import Editor Store
  import { initClientI18n } from '../lib/i18n'; 
  import { initWeather, destroyWeather } from '../lib/weather/store';
  import { isLoading } from 'svelte-i18n'; 
  import BackgroundRenderer from '../domains/theme/BackgroundRenderer.svelte';
  import Sidebar from '../domains/ui/Sidebar.svelte';
  import DashboardHeader from '../domains/ui/DashboardHeader.svelte';
  import TemplateManager from '../domains/ui/editor/templates/TemplateManager.svelte';
  import SettingsDrawer from '../domains/ui/settings/SettingsDrawer.svelte'; // New Component
  import 'iconify-icon';
  import '../app.css';
  
  let { children } = $props();

  onMount(async () => {
    // 1. Setup Client I18n (SSR init handled in module)
    await initClientI18n();
    
    // 2. Load other configs
    await loadServerConfig();
    await loadSavedServers(); // Load server list
    await loadLayout();
    await themeStore.init();
    await dashboardStore.init(); // Initialize 2D grid store
    
    // 3. Init services
    await initWeather();
    
    return () => {
      destroyWeather();
    };
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

{#if $isLoading}
  <!-- Simple splash screen while translations load -->
  <div class="loading-screen"></div>
{:else}
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
{/if}

<!-- Global Modals Layer -->
<SettingsDrawer />

{#if $editorStore.isTemplateManagerOpen}
  <TemplateManager onClose={() => editorStore.closeTemplateManager()} />
{/if}

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
  
  /* RTL Support Hook */
  :global(body.rtl) {
    direction: rtl;
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
    /* STRICT: Prevent global scrollbar */
    overflow: hidden; 
  }

  main {
    flex: 1;
    padding: 0;
    /* STRICT: Ensure main is a flex container that clips content */
    display: flex;
    flex-direction: column;
    overflow: hidden;
    min-height: 0; /* Allow shrinking */
  }
  
  .loading-screen {
    width: 100vw;
    height: 100vh;
    background: var(--bg-page);
  }

  @media (max-width: 768px) {
    main {
      padding: 0;
    }
  }
</style>