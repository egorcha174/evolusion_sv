<script lang="ts">
  import { onMount } from "svelte";
  import {
    appState,
    loadLayout,
    loadServerConfig,
    loadSavedServers,
  } from "../domains/app/store";
  import { dashboardStore } from "../domains/app/dashboardStore";
  import { session } from "../domains/app/session";
  import { onboardingStore } from "../domains/app/onboardingStore";
  import { demoStore } from "../domains/app/demoStore";
  import {
    initializeHAConnection,
    disconnectHA,
    haStore,
  } from "../domains/ha/store";
  import { DEMO_ENTITIES } from "../domains/app/demoStore";
  import { themeStore, isDarkMode } from "../domains/ui/theme/store";
  import { editorStore } from "../domains/ui/editor/store";
  import { backgroundStore } from "../domains/ui/background/store";
  import { initClientI18n } from "../lib/i18n";
  import { initWeather, destroyWeather } from "../lib/weather/store";
  import WeatherEffects from "../domains/app/WeatherEffects.svelte";
  import { isLoading, t } from "svelte-i18n";
  import OnboardingWizard from "../domains/ui/onboarding/OnboardingWizard.svelte";
  import DemoBadge from "../domains/ui/DemoBadge.svelte";
  import BackgroundRenderer from "../domains/theme/BackgroundRenderer.svelte";
  import BackgroundEngine from "../domains/ui/background/BackgroundEngine.svelte";
  import Sidebar from "../domains/ui/Sidebar.svelte";
  import DashboardHeader from "../domains/ui/DashboardHeader.svelte";
  import TemplateManager from "../domains/ui/editor/templates/TemplateManager.svelte";
  import SettingsDrawer from "../domains/ui/settings/SettingsDrawer.svelte";
  import ServerManager from "../domains/ui/settings/ServerManager.svelte";
  import ThemeAutoGenerator from "../domains/ui/theme/ThemeAutoGenerator.svelte";
  import ThemeEditor from "../domains/ui/theme/ThemeEditor.svelte";
  import { themeEditorStore } from "../domains/ui/theme/editorStore";
  import DeviceAddDrawer from "../domains/ui/add-device/DeviceAddDrawer.svelte";
  import PinScreen from "../domains/ui/lock/PinScreen.svelte";
  import {
    isThemeGeneratorOpen,
    isServerManagerOpen,
  } from "../domains/ui/store";

  import "iconify-icon";
  import "../app.css";

  let { children } = $props();

  let forcedReady = $state(false);

  // Session state derived
  let isSessionActive = $derived($session.state === "active");
  let isSessionLoading = $derived($session.state === "loading");

  onMount(() => {
    // 0. Safety timeout - Start IMMEDIATELY to guarantee loading screen removal
    const timer = setTimeout(() => {
      forcedReady = true;
    }, 2000);

    const init = async () => {
      // 1. Init Theme, Background, and Onboarding
      themeStore.init();
      backgroundStore.init();
      onboardingStore.init();
      demoStore.init();

      // 2. Init Session (Critical for security & state)
      // We prioritize this to ensure authentication state is known early
      await session.init();

      // 3. Setup Client I18n
      // We do this after session or concurrently, but importantly AFTER the timer is set
      try {
        await initClientI18n();
      } catch (e) {
        console.error("i18n init failed", e);
      }

      // Clear timeout if everything loaded fast
      clearTimeout(timer);
    };

    init();

    return () => {
      destroyWeather();
      clearTimeout(timer);
    };
  });

  // React to Session Unlock
  $effect(() => {
    if (isSessionActive) {
      // Only load sensitive data AFTER unlock
      loadServerConfig();
      loadSavedServers();
      loadLayout();
      dashboardStore.init();
      initWeather();
    }
  });

  // Reactive connection management
  $effect(() => {
    const active = $appState.activeServer;
    // Only connect if session is active AND we have credentials
    if (isSessionActive && active?.url && active?.token) {
      initializeHAConnection(active.url, active.token);
    } else {
      disconnectHA();
    }
  });

  // Expose active theme info for CSS hooks
  $effect(() => {
    if (typeof document === "undefined") return;
    const themeId = $themeStore.activeThemeId || "default";
    const mode = $isDarkMode ? "dark" : "light";
    document.documentElement.setAttribute("data-theme-id", themeId);
    document.documentElement.setAttribute("data-theme", mode);
    document.body?.setAttribute("data-theme-id", themeId);
    document.body?.setAttribute("data-theme", mode);
  });
</script>

<BackgroundRenderer />
<BackgroundEngine />
<WeatherEffects />

{#if ($isLoading && !forcedReady) || isSessionLoading}
  <div class="loading-screen">
    <div class="spinner"></div>
    <p>{$t("dashboard.loadingApp")}</p>
  </div>
{:else if !isSessionActive}
  <!-- Security Layer: Blocks everything else -->
  <PinScreen />
{:else if !$onboardingStore.completed && !$demoStore.isActive}
  <!-- Onboarding Wizard for new users -->
  <OnboardingWizard />
{:else}
  <!-- Main App Layout -->
  <DemoBadge />
  <div class="layout-container">
    <Sidebar />
    <div class="main-content">
      <DashboardHeader />
      <main>
        {@render children()}
      </main>
    </div>
  </div>

  <!-- Global Modals Layer -->
  <SettingsDrawer />
  <DeviceAddDrawer />

  {#if $isThemeGeneratorOpen}
    <ThemeAutoGenerator onClose={() => isThemeGeneratorOpen.set(false)} />
  {/if}

  {#if $isServerManagerOpen}
    <ServerManager onClose={() => isServerManagerOpen.set(false)} />
  {/if}

  {#if $themeEditorStore.isOpen}
    <ThemeEditor />
  {/if}

  {#if $editorStore.isTemplateManagerOpen}
    <TemplateManager onClose={() => editorStore.closeTemplateManager()} />
  {/if}
{/if}

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
      Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
    background: transparent !important;
    color: var(--text-primary, #333);
    height: 100vh;
    overflow: hidden;
    transition: color 0.2s ease;
  }

  :global(html) {
    background: transparent !important;
  }
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
    overflow: hidden;
  }

  main {
    flex: 1;
    padding: 0;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    min-height: 0;
  }

  .loading-screen {
    width: 100vw;
    height: 100vh;
    background: var(--bg-page, #f0f2f5);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    color: var(--text-secondary, #666);
    position: fixed;
    top: 0;
    left: 0;
    z-index: 9999;
  }

  .spinner {
    width: 40px;
    height: 40px;
    border: 3px solid rgba(0, 0, 0, 0.1);
    border-top-color: var(--accent-primary, #2196f3);
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  @media (max-width: 768px) {
    main {
      padding: 0;
    }
  }
</style>
